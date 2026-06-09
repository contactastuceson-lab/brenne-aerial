import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { user_email, title, body, url } = await req.json();

    if (!user_email || !title) {
      return Response.json({ error: 'user_email and title are required' }, { status: 400 });
    }

    const subscriptions = await base44.asServiceRole.entities.PushSubscription.filter({ user_email });

    if (subscriptions.length === 0) {
      return Response.json({ success: true, sent: 0, message: 'No subscriptions found' });
    }

    const fcmServerKey = Deno.env.get('FCM_SERVER_KEY');
    const notificationUrl = url || 'https://brenneaerial.fr';

    let sent = 0;
    const toDelete = [];

    await Promise.all(subscriptions.map(async (sub) => {
      try {
        // subscription_json stores the raw FCM token string directly
        const token = sub.subscription_json;
        if (!token) return;

        const res = await fetch('https://fcm.googleapis.com/fcm/send', {
          method: 'POST',
          headers: {
            'Authorization': `key=${fcmServerKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            to: token,
            notification: {
              title,
              body: body || '',
              icon: '/icons/icon-192.png',
              click_action: notificationUrl,
            },
            data: { url: notificationUrl },
          }),
        });

        const result = await res.json();
        console.log('[sendWebPush] FCM result:', JSON.stringify(result));

        if (result.failure === 1 && result.results?.[0]?.error === 'NotRegistered') {
          toDelete.push(sub.id);
        } else if (result.success === 1) {
          sent++;
        }
      } catch (err) {
        console.error('[sendWebPush] Error:', err.message);
      }
    }));

    await Promise.all(toDelete.map(id => base44.asServiceRole.entities.PushSubscription.delete(id)));

    return Response.json({ success: true, sent, total: subscriptions.length });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});