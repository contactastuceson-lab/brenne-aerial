import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { AccessToken } from 'npm:livekit-server-sdk@2.10.0';

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
    if (space.status === 'ended') return Response.json({ error: 'Space terminé' }, { status: 400 });
    if (space.status === 'scheduled' && space.host_id !== user.id) return Response.json({ error: 'Space pas encore démarré' }, { status: 400 });
    const apiKey = Deno.env.get('LIVEKIT_API_KEY');
    const apiSecret = Deno.env.get('LIVEKIT_API_SECRET');
    const wsUrl = Deno.env.get('LIVEKIT_WS_URL');
    if (!apiKey || !apiSecret || !wsUrl) return Response.json({ error: 'LiveKit non configuré' }, { status: 500 });
    const at = new AccessToken(apiKey, apiSecret, {
      identity: user.id,
      name: user.display_name || user.full_name || user.username || user.id,
      metadata: JSON.stringify({ avatar: user.avatar_url || '', username: user.username || '', verifications: user.verifications || [] }),
    });
    at.addGrant({
      room: space.livekit_room,
      roomJoin: true,
      canPublish: true,
      canSubscribe: true,
      canPublishData: true,
    });
    const token = await at.toJwt();
    return Response.json({ token, url: wsUrl, space, isHost: space.host_id === user.id });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}