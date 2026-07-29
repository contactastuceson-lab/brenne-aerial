import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    const body = await req.json().catch(() => ({}));
    const communityId = body.communityId;
    if (!communityId) return Response.json({ error: 'communityId requis' }, { status: 400 });
    const community = await base44.asServiceRole.entities.Community.get(communityId).catch(() => null);
    if (!community) return Response.json({ error: 'Communauté introuvable' }, { status: 404 });
    const isMember = (community.member_ids || []).includes(user.id) || community.owner_id === user.id;
    if (community.type === 'closed' && !isMember) return Response.json({ error: 'Membres uniquement' }, { status: 403 });
    const posts = await base44.asServiceRole.entities.Post.filter({ community_id: communityId }, '-created_date', 100);
    return Response.json({ posts: posts.filter(p => !p.is_draft), isMember, community });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}