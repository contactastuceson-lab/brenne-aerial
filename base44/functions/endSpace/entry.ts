import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    const body = await req.json().catch(() => ({}));
    const spaceId = body.spaceId;
    if (!spaceId) return Response.json({ error: 'spaceId requis' }, { status: 400 });
    const space = await base44.asServiceRole.entities.Space.get(spaceId).catch(() => null);
    if (!space) return Response.json({ error: 'Space introuvable' }, { status: 404 });
    if (space.host_id !== user.id) return Response.json({ error: 'Hôte uniquement' }, { status: 403 });
    await base44.asServiceRole.entities.Space.update(spaceId, { status: 'ended', ended_at: new Date().toISOString() });
    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}