import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { RoomServiceClient } from 'npm:livekit-server-sdk@2.10.0';

// Gère les permissions d'un participant dans un Space (Discord-style).
// Seul l'hôte du Space peut appeler cette fonction.
export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    const body = await req.json().catch(() => ({}));
    const { spaceId, identity, action } = body; // action: grant | revoke | promote | demote | kick
    if (!spaceId || !identity || !action) return Response.json({ error: 'Paramètres manquants' }, { status: 400 });
    const space = await base44.asServiceRole.entities.Space.get(spaceId).catch(() => null);
    if (!space) return Response.json({ error: 'Space introuvable' }, { status: 404 });
    if (space.host_id !== user.id) return Response.json({ error: "Réservé à l'hôte" }, { status: 403 });

    const apiKey = Deno.env.get('LIVEKIT_API_KEY');
    const apiSecret = Deno.env.get('LIVEKIT_API_SECRET');
    const wsUrl = Deno.env.get('LIVEKIT_WS_URL');
    if (!apiKey || !apiSecret || !wsUrl) return Response.json({ error: 'LiveKit non configuré' }, { status: 500 });
    const rs = new RoomServiceClient(wsUrl, apiKey, apiSecret);

    if (action === 'kick') {
      await rs.removeParticipant(space.livekit_room, identity).catch(() => {});
      return Response.json({ ok: true });
    }

    let role = 'listener', canPublish = false;
    if (action === 'grant') { role = 'speaker'; canPublish = true; }
    else if (action === 'promote') { role = 'cohost'; canPublish = true; }
    else if (action === 'revoke' || action === 'demote') { role = 'listener'; canPublish = false; }
    else return Response.json({ error: 'Action inconnue' }, { status: 400 });

    // On préserve l'avatar/username/verifications et on met à jour le rôle.
    let meta = {};
    try {
      const p = await rs.getParticipant(space.livekit_room, identity);
      meta = JSON.parse(p.metadata || '{}');
    } catch { /* participant peut être absent ponctuellement */ }
    meta.role = role;

    await rs.updateParticipant(space.livekit_room, identity, {
      metadata: JSON.stringify(meta),
      permission: { canPublish, canSubscribe: true, canPublishData: true },
    });
    return Response.json({ ok: true, role, canPublish });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}