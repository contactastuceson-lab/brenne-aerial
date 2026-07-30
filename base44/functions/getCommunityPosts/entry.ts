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
    if (community.type === 'closed' && !isMember) {
      return Response.json({ error: 'Membres uniquement', closed: true }, { status: 403 });
    }

    const posts = await base44.asServiceRole.entities.Post.filter(
      { community_id: communityId, is_draft: false },
      '-created_date',
      100
    );

    // Récupérer les infos membres (avatars/noms) pour l'aperçu
    const memberIds = (community.member_ids || []).slice(0, 20);
    let members = [];
    if (memberIds.length > 0) {
      const users = await base44.asServiceRole.entities.User.list().catch(() => []);
      const map = new Map((users || []).map(u => [u.id, u]));
      members = memberIds
        .map(mid => map.get(mid))
        .filter(Boolean)
        .map(u => ({
          id: u.id,
          username: u.username,
          display_name: u.display_name || u.full_name,
          avatar_url: u.avatar_url,
          verifications: u.verifications || [],
          is_owner: u.id === community.owner_id,
        }));
    }

    return Response.json({
      community,
      posts: posts || [],
      isMember,
      members,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}