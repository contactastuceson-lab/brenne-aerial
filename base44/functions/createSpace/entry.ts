import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    const body = await req.json().catch(() => ({}));
    const title = (body.title || '').trim().slice(0, 80);
    const description = (body.description || '').trim().slice(0, 200);
    const scheduledAt = body.scheduled_at || null;
    if (!title) return Response.json({ error: 'Titre requis' }, { status: 400 });
    const livekitRoom = `space-${crypto.randomUUID()}`;
    const space = await base44.entities.Space.create({
      title,
      description,
      host_id: user.id,
      host_name: user.full_name,
      host_username: user.username,
      host_avatar: user.avatar_url,
      host_verifications: user.verifications || [],
      status: scheduledAt ? 'scheduled' : 'live',
      scheduled_at: scheduledAt,
      started_at: scheduledAt ? null : new Date().toISOString(),
      livekit_room: livekitRoom,
    });
    return Response.json({ success: true, space });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}