import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { user_email, device_name, device_type, browser, os } = body;

    if (!user_email) return Response.json({ error: 'user_email requis' }, { status: 400 });

    // Generate unique session ID
    const sessionId = crypto.randomUUID();
    const now = new Date().toISOString();

    // Get IP from headers
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';

    // Mark all previous sessions for this user as not current
    const existing = await base44.asServiceRole.entities.DeviceSession.filter({ user_email });
    for (const s of existing) {
      if (s.is_current) {
        await base44.asServiceRole.entities.DeviceSession.update(s.id, { is_current: false });
      }
    }

    // Create new session
    const session = await base44.asServiceRole.entities.DeviceSession.create({
      session_id: sessionId,
      user_email,
      device_name: device_name || 'Appareil inconnu',
      device_type: device_type || 'desktop',
      browser: browser || 'Inconnu',
      os: os || 'Inconnu',
      ip_address: ip,
      is_current: true,
      is_trusted: false,
      last_activity: now,
      created_at: now,
    });

    return Response.json({ success: true, session });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});