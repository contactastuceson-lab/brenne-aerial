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

    for (const sub of subscriptions) {
      try {
        let token = sub.subscription_json;
        if (!token) continue;
        try {
          const parsed = JSON.parse(token);
          if (parsed.endpoint) token = parsed.endpoint;
        } catch (_) { /* already a raw string */ }

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

        const resultText = await res.text();
        let result;
        try { result = JSON.parse(resultText); } catch (_) { result = {}; }

        // 404 or NotRegistered = expired token, clean it up
        if (res.status === 404 || (result.failure === 1 && result.results?.[0]?.error === 'NotRegistered')) {
          toDelete.push(sub.id);
        } else if (result.success === 1) {
          sent++;
        }
      } catch (err) {
        // ignore individual send errors
      }
    }

    await Promise.all(toDelete.map(id => base44.asServiceRole.entities.PushSubscription.delete(id)));

    return Response.json({ success: true, sent, total: subscriptions.length });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});