import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { action, device_name } = body;

    // Support both formats: { fcm_token } or { subscription: { endpoint, type } }
    const fcmToken = body.fcm_token || body.subscription?.endpoint;

    if (!fcmToken) {
      return Response.json({ error: 'Invalid token' }, { status: 400 });
    }

    const existing = await base44.asServiceRole.entities.PushSubscription.filter({ user_email: user.email });
    const match = existing.find(s => {
      // Match against raw token or JSON-stored token
      if (s.subscription_json === fcmToken) return true;
      try {
        return JSON.parse(s.subscription_json).endpoint === fcmToken;
      } catch (_) { return false; }
    });

    if (action === 'unsubscribe') {
      if (match) await base44.asServiceRole.entities.PushSubscription.delete(match.id);
      return Response.json({ success: true, action: 'unsubscribed' });
    }

    if (!match) {
      await base44.asServiceRole.entities.PushSubscription.create({
        user_email: user.email,
        subscription_json: fcmToken, // store raw token
        device_name: device_name || 'Navigateur',
      });
    }

    return Response.json({ success: true, action: 'subscribed' });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});