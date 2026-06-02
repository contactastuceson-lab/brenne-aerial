import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { action, entity_type, entity_id, changes } = body;

    // Log action with service role to bypass RLS
    await base44.asServiceRole.entities.AuditLog.create({
      user_email: user.email,
      user_name: user.full_name,
      action,
      entity_type,
      entity_id,
      changes,
      status: 'success',
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error('Audit log error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});