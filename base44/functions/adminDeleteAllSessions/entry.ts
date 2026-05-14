import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const TOP_MANAGEMENT_EMAILS = ['contact.astuceson@gmail.com', 'sentenacborys@gmail.com'];

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const isTopManagement = user.role === 'owner' || user.role === 'pdg_adjoint' || TOP_MANAGEMENT_EMAILS.includes(user.email);
    if (!isTopManagement) {
      return Response.json({ error: 'Accès réservé au PDG et PDG-Adjoint' }, { status: 403 });
    }

    const { target_user_email } = await req.json();

    let sessions;
    if (target_user_email) {
      sessions = await base44.asServiceRole.entities.DeviceSession.filter({ user_email: target_user_email });
    } else {
      sessions = await base44.asServiceRole.entities.DeviceSession.list();
    }

    let deleted = 0;
    for (const session of sessions) {
      await base44.asServiceRole.entities.DeviceSession.delete(session.id);
      deleted++;
    }

    return Response.json({ success: true, deleted });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});