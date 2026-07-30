import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    const body = await req.json().catch(() => ({}));
    const communityId = body.communityId;
    const action = body.action === 'leave' ? 'leave' : 'join';
    if (!communityId) return Response.json({ error: 'communityId requis' }, { status: 400 });

    const community = await base44.asServiceRole.entities.Community.get(communityId).catch(() => null);
    if (!community) return Response.json({ error: 'Communauté introuvable' }, { status: 404 });

    const members = new Set(community.member_ids || []);

    if (action === 'join') {
      if (members.has(user.id) && community.owner_id !== user.id) {
        // déjà membre — idempotent
        return Response.json({ success: true, membersCount: members.size, isMember: true, already: true });
      }
      // Vérifier la capacité
      const cap = community.capacity_limit || 100;
      if (members.size >= cap && community.owner_id !== user.id) {
        return Response.json({ error: `Capacité maximale atteinte (${cap} membres)` }, { status: 400 });
      }
      if (community.owner_id !== user.id) members.add(user.id);

      // Notifier le propriétaire
      if (community.owner_id !== user.id) {
        try {
          const owner = await base44.asServiceRole.entities.User.get(community.owner_id).catch(() => null);
          if (owner?.email) {
            await base44.asServiceRole.entities.Notification.create({
              user_email: owner.email,
              type: 'FOLLOW',
              title: 'Nouveau membre',
              content: `${user.display_name || user.full_name || user.username} a rejoint « ${community.name} »`,
              sender_id: user.id,
              sender_name: user.display_name || user.full_name,
              sender_avatar: user.avatar_url,
              sender_username: user.username,
              link: `/community/${community.id}`,
            }).catch(() => {});
          }
        } catch {}
      }
    } else {
      if (community.owner_id === user.id) return Response.json({ error: 'Le créateur ne peut pas quitter' }, { status: 400 });
      members.delete(user.id);
    }

    const arr = Array.from(members);
    await base44.asServiceRole.entities.Community.update(communityId, { member_ids: arr, members_count: arr.length });
    return Response.json({ success: true, membersCount: arr.length, isMember: action === 'join' });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}