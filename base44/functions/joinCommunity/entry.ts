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
      if (community.owner_id !== user.id) members.add(user.id);
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