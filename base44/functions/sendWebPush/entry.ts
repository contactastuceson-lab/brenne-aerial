import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
import webpush from 'npm:web-push@3.6.7';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { user_email, title, body, url } = await req.json();

    if (!user_email) return Response.json({ error: 'user_email required' }, { status: 400 });

    webpush.setVapidDetails(
      'mailto:support@brenneaerial.fr',
      Deno.env.get('VAPID_PUBLIC_KEY'),
      Deno.env.get('VAPID_PRIVATE_KEY')
    );

    const subscriptions = await base44.asServiceRole.entities.PushSubscription.filter({ user_email });

    if (subscriptions.length === 0) {
      return Response.json({ sent: 0, message: 'No subscriptions found' });
    }

    const payload = JSON.stringify({
      title: title || 'Brenne Aerial',
      body: body || '',
      url: url || 'https://brenneaerial.fr',
    });

    const results = await Promise.allSettled(
      subscriptions.map(sub =>
        webpush.sendNotification(JSON.parse(sub.subscription_json), payload)
      )
    );

    // Clean up expired subscriptions (410 Gone)
    await Promise.allSettled(
      results.map(async (result, i) => {
        if (result.status === 'rejected' && result.reason?.statusCode === 410) {
          await base44.asServiceRole.entities.PushSubscription.delete(subscriptions[i].id);
        }
      })
    );

    const sent = results.filter(r => r.status === 'fulfilled').length;
    return Response.json({ sent, total: subscriptions.length });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});