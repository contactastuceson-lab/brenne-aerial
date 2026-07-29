import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { RoomServiceClient } from 'npm:livekit-server-sdk@2.17.0';

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
    const isAdmin = ['admin', 'owner', 'pdg_adjoint', 'conseil_admin'].includes(user.role);
    if (space.host_id !== user.id && !isAdmin) return Response.json({ error: 'Hôte ou admin uniquement' }, { status: 403 });

    const wsUrl = Deno.env.get('LIVEKIT_WS_URL');
    const apiKey = Deno.env.get('LIVEKIT_API_KEY');
    const apiSecret = Deno.env.get('LIVEKIT_API_SECRET');
    if (wsUrl && apiKey && apiSecret && space.livekit_room) {
      try {
        const svc = new RoomServiceClient(wsUrl, apiKey, apiSecret);
        const msg = JSON.stringify({
          t: 'space_ending',
          by: user.full_name || user.email,
          isAdmin,
        });
        await svc.sendData(space.livekit_room, new TextEncoder().encode(msg), { reliable: true });
      } catch (e) {
        console.error('sendData:', e?.message || e);
      }
    }
    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}