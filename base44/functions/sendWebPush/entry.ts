import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { user_email, title, body, url } = await req.json();

    if (!user_email || !title) {
      return Response.json({ error: 'user_email and title are required' }, { status: 400 });
    }

    const fcmServerKey = Deno.env.get('FCM_SERVER_KEY');
    if (!fcmServerKey) {
      return Response.json({ error: 'FCM_SERVER_KEY not configured' }, { status: 500 });
    }

    const subscriptions = await base44.asServiceRole.entities.PushSubscription.filter({ user_email });

    if (!subscriptions.length) {
      return Response.json({ success: true, sent: 0, message: 'No subscriptions found' });
    }

    let sent = 0;
    const toDelete = [];

    await Promise.all(subscriptions.map(async (sub) => {
      try {
        const endpoint = sub.subscription_json
          ? JSON.parse(sub.subscription_json).endpoint
          : null;

        if (!endpoint) return;

        const res = await fetch('https://fcm.googleapis.com/fcm/send', {
          method: 'POST',
          headers: {
            'Authorization': `key=${fcmServerKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            to: endpoint,
            notification: {
              title,
              body: body || '',
              icon: '/icon-192.png',
              click_action: url || 'https://brenneaerial.fr',
            },
            webpush: {
              fcm_options: { link: url || 'https://brenneaerial.fr' },
            },
          }),
        });

        const data = await res.json();
        console.log('[sendWebPush] FCM response:', JSON.stringify(data));

        if (data.failure === 1) {
          const result = data.results?.[0];
          if (result?.error === 'NotRegistered' || result?.error === 'InvalidRegistration') {
            toDelete.push(sub.id);
          }
        } else {
          sent++;
        }
      } catch (err) {
        console.error('[sendWebPush] Error sending to subscription:', err.message);
      }
    }));

    // Clean up invalid subscriptions
    await Promise.all(toDelete.map(id => base44.asServiceRole.entities.PushSubscription.delete(id)));

    return Response.json({ success: true, sent, deleted: toDelete.length });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});