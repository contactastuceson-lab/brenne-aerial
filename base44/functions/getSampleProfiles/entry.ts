import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const list = await base44.asServiceRole.entities.SampleProfile.list('-is_featured', 500);
  return Response.json({ data: list });
});