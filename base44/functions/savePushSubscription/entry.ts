import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { fcm_token, action, device_name } = await req.json();

    if (!fcm_token) {
      return Response.json({ error: 'Invalid token' }, { status: 400 });
    }

    const existing = await base44.asServiceRole.entities.PushSubscription.filter({ user_email: user.email });
    const match = existing.find(s => s.subscription_json === fcm_token);

    if (action === 'unsubscribe') {
      if (match) await base44.asServiceRole.entities.PushSubscription.delete(match.id);
      return Response.json({ success: true, action: 'unsubscribed' });
    }

    if (!match) {
      await base44.asServiceRole.entities.PushSubscription.create({
        user_email: user.email,
        subscription_json: fcm_token,
        device_name: device_name || 'Navigateur',
      });
    }

    return Response.json({ success: true, action: 'subscribed' });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});