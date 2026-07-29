import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { RoomServiceClient } from 'npm:livekit-server-sdk@2.10.0';

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

    // Détruit la room LiveKit → déconnecte tous les participants
    const wsUrl = Deno.env.get('LIVEKIT_WS_URL');
    const apiKey = Deno.env.get('LIVEKIT_API_KEY');
    const apiSecret = Deno.env.get('LIVEKIT_API_SECRET');
    if (wsUrl && apiKey && apiSecret) {
      try {
        const svc = new RoomServiceClient(wsUrl, apiKey, apiSecret);
        // Envoie un message à tous les participants avant de fermer la room
        const isAdmin = ['admin', 'owner', 'pdg_adjoint', 'conseil_admin'].includes(user.role);
        const msg = JSON.stringify({
          t: 'space_ended',
          by: user.full_name || user.email,
          isAdmin,
        });
        try {
          await svc.sendData(space.livekit_room, new TextEncoder().encode(msg), { kind: 0 });
        } catch (e) {
          console.error('sendData:', e?.message || e);
        }
        await svc.deleteRoom(space.livekit_room);
      } catch (e) {
        console.error('deleteRoom:', e?.message || e);
      }
    }

    await base44.asServiceRole.entities.Space.update(spaceId, { status: 'ended', ended_at: new Date().toISOString() });
    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}