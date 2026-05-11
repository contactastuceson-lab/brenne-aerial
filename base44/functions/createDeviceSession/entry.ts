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

    // Geolocate IP
    let city = null;
    let country = null;
    if (ip && ip !== 'unknown') {
      try {
        const geoRes = await fetch(`http://ip-api.com/json/${ip}?fields=city,country,status`);
        const geo = await geoRes.json();
        if (geo.status === 'success') {
          city = geo.city || null;
          country = geo.country || null;
        }
      } catch (_) { /* silently ignore */ }
    }

    // Get all existing sessions for this user
    const existing = await base44.asServiceRole.entities.DeviceSession.filter({ user_email });

    // Find if there's already a session with same device_name + ip
    const duplicate = existing.find(s => s.device_name === (device_name || 'Appareil inconnu') && s.ip_address === ip);

    if (duplicate) {
      // Just update last_activity and mark as current
      await base44.asServiceRole.entities.DeviceSession.update(duplicate.id, {
        is_current: true,
        last_activity: now,
      });
      // Mark all others as not current
      for (const s of existing) {
        if (s.id !== duplicate.id && s.is_current) {
          await base44.asServiceRole.entities.DeviceSession.update(s.id, { is_current: false });
        }
      }
      return Response.json({ success: true, session: { ...duplicate, is_current: true, last_activity: now } });
    }

    // No duplicate — mark all others as not current
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
      city,
      country,
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