import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
import webpush from 'npm:web-push@3.6.7';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { title, body, url } = await req.json();
    if (!title || !body) {
      return Response.json({ error: 'title and body are required' }, { status: 400 });
    }

    const vapidPublicKey = Deno.env.get('VAPID_PUBLIC_KEY');
    const vapidPrivateKey = Deno.env.get('VAPID_PRIVATE_KEY');
    const appUrl = Deno.env.get('APP_URL') || 'https://brenneaerial.fr';

    webpush.setVapidDetails(`mailto:contact@brenneaerial.fr`, vapidPublicKey, vapidPrivateKey);

    // Get all push subscriptions
    const allSubs = await base44.asServiceRole.entities.PushSubscription.list();

    const payload = JSON.stringify({
      title,
      body,
      url: url || appUrl,
      icon: '/favicon.ico',
    });

    let sent = 0;
    let failed = 0;
    const toDelete = [];

    await Promise.all(
      allSubs.map(async (sub) => {
        let subscription;
        try {
          subscription = JSON.parse(sub.subscription_json);
        } catch {
          return;
        }
        try {
          await webpush.sendNotification(subscription, payload);
          sent++;
        } catch (err) {
          if (err.statusCode === 410 || err.statusCode === 404) {
            toDelete.push(sub.id);
          }
          failed++;
        }
      })
    );

    // Clean up expired subscriptions
    await Promise.all(toDelete.map(id => base44.asServiceRole.entities.PushSubscription.delete(id)));

    return Response.json({ success: true, sent, failed, total: allSubs.length });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});