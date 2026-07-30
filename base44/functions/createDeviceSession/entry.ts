import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    let { user_email, device_name, device_type, browser, os, fingerprint } = body;

    // IDOR fix: force user_email to the authenticated user's email — ignore any client-supplied value
    user_email = user?.email;
    if (!user_email) return Response.json({ error: 'user_email requis' }, { status: 400 });

    const now = new Date().toISOString();

    // Get IP from headers
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';

    // Geolocate IP using ipinfo.io (more precise)
    let city = null;
    let country = null;
    if (ip && ip !== 'unknown') {
      try {
        const geoRes = await fetch(`https://ipinfo.io/${ip}/json`);
        const geo = await geoRes.json();
        if (geo && !geo.error) {
          city = geo.city || null;
          country = geo.country || null;
          // ipinfo returns country code (FR), convert to full name
          if (country) {
            const countryNames = {
              FR: 'France', BE: 'Belgique', CH: 'Suisse', DE: 'Allemagne',
              ES: 'Espagne', IT: 'Italie', GB: 'Royaume-Uni', US: 'États-Unis',
              CA: 'Canada', NL: 'Pays-Bas', PT: 'Portugal', LU: 'Luxembourg',
            };
            country = countryNames[country] || country;
          }
          // region (more precise than city alone) — use it to refine
          if (geo.region && geo.city) {
            // keep city as returned by ipinfo (already precise)
            city = geo.city;
          }
        }
      } catch (_) { /* silently ignore */ }
    }

    // Get all existing sessions for this user
    const existing = await base44.asServiceRole.entities.DeviceSession.filter({ user_email });

    // Find if there's already a session with same fingerprint (or device_name + os as fallback)
    const duplicate = existing.find(s =>
      fingerprint
        ? s.fingerprint === fingerprint
        : s.device_name === (device_name || 'Appareil inconnu') && s.os === os && s.browser === browser
    );

    if (duplicate) {
      // Generate a fresh session_id so the client always gets a valid, current one
      const freshSessionId = crypto.randomUUID();
      await base44.asServiceRole.entities.DeviceSession.update(duplicate.id, {
        session_id: freshSessionId,
        last_activity: now,
        ip_address: ip,
        city: city ?? duplicate.city,
        country: country ?? duplicate.country,
      });
      return Response.json({ success: true, session: { ...duplicate, session_id: freshSessionId, last_activity: now } });
    }

    // New device — create a new session entry
    const sessionId = crypto.randomUUID();
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
      fingerprint: fingerprint || null,
      is_trusted: false,
      last_activity: now,
      created_at: now,
    });

    return Response.json({ success: true, session });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});