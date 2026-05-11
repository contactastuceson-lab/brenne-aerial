import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { session_id } = await req.json();
    if (!session_id) return Response.json({ error: 'session_id requis' }, { status: 400 });

    // Get all sessions to find the one to delete
    const allSessions = await base44.asServiceRole.entities.DeviceSession.list('-last_activity', 500);
    const session = allSessions.find(s => s.session_id === session_id || s.id === session_id);

    if (!session) return Response.json({ error: 'Session introuvable' }, { status: 404 });

    // Check authorization: user can only delete their own sessions, unless admin
    if (session.user_email !== user.email && user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized' }, { status: 403 });
    }

    await base44.asServiceRole.entities.DeviceSession.delete(session.id);

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});