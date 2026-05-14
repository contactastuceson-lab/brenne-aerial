import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    const PDG_EMAILS = ['thecommitteescp@gmail.com'];
    const PDG_ADJOINT_EMAILS = ['sentenacborys@gmail.com'];
    const ADMIN_ROLES = ['owner', 'pdg_adjoint', 'admin', 'conseil_admin', 'directeur'];
    const isTopLevel = PDG_EMAILS.includes(user?.email) || PDG_ADJOINT_EMAILS.includes(user?.email) || ADMIN_ROLES.includes(user?.role);
    if (!user || !isTopLevel) {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const users = await base44.asServiceRole.entities.User.list();
    return Response.json({ users });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});