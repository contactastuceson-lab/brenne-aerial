import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { session_id } = await req.json();
    if (!session_id) return Response.json({ error: 'session_id requis' }, { status: 400 });

    // Find the session and verify it belongs to this user
    const sessions = await base44.asServiceRole.entities.DeviceSession.filter({ user_email: user.email });
    const session = sessions.find(s => s.id === session_id);

    if (!session) return Response.json({ error: 'Session introuvable' }, { status: 404 });

    await base44.asServiceRole.entities.DeviceSession.delete(session.id);

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});