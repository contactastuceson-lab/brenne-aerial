import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const PDG_EMAILS = ['contact.astuceson@gmail.com'];
const PDG_ADJOINT_EMAILS = ['sentenacborys@gmail.com'];

const ADMIN_ROLES = ['owner', 'pdg_adjoint', 'admin', 'conseil_admin', 'directeur'];

function hasAdminAccess(user) {
  if (!user) return false;
  return ADMIN_ROLES.includes(user.role) || PDG_EMAILS.includes(user.email) || PDG_ADJOINT_EMAILS.includes(user.email);
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || !hasAdminAccess(user)) {
      return Response.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const users = await base44.asServiceRole.entities.User.list();
    return Response.json({ users });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});