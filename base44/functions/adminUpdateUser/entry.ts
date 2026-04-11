import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const { id, data } = await req.json();
    if (!id || !data) {
      return Response.json({ error: 'Missing id or data' }, { status: 400 });
    }

    const updated = await base44.asServiceRole.entities.User.update(id, data);
    return Response.json({ user: updated });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});