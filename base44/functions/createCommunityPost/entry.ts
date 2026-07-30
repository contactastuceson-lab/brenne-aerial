import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    const body = await req.json().catch(() => ({}));
    const communityId = body.communityId;
    const content = (body.content || '').trim().slice(0, 500);
    const mediaUrls = Array.isArray(body.mediaUrls) ? body.mediaUrls.slice(0, 4) : [];
    if (!communityId) return Response.json({ error: 'communityId requis' }, { status: 400 });
    if (!content && mediaUrls.length === 0) return Response.json({ error: 'Contenu requis' }, { status: 400 });

    const community = await base44.asServiceRole.entities.Community.get(communityId).catch(() => null);
    if (!community) return Response.json({ error: 'Communauté introuvable' }, { status: 404 });
    const isMember = (community.member_ids || []).includes(user.id) || community.owner_id === user.id;
    if (!isMember) return Response.json({ error: 'Vous devez être membre' }, { status: 403 });

    // Extraire hashtags et mentions
    const hashtags = (content.match(/#[\wà-ÿ]+/g) || []).map(s => s.slice(1));
    const mentions = (content.match(/@[\w.]+/g) || []).map(s => s.slice(1));

    const post = await base44.entities.Post.create({
      content,
      author_id: user.id,
      author_name: user.full_name,
      author_display_name: user.display_name || user.full_name,
      author_username: user.username,
      author_avatar: user.avatar_url,
      author_verifications: user.verifications || [],
      media_urls: mediaUrls,
      hashtags,
      mentions,
      likes_count: 0,
      liked_by: [],
      replies_count: 0,
      views_count: 0,
      visibility: 'public',
      community_id: communityId,
    });

    // Incrémenter le compteur de posts de la communauté
    try {
      await base44.asServiceRole.entities.Community.update(communityId, {
        posts_count: (community.posts_count || 0) + 1,
      });
    } catch {}

    return Response.json({ success: true, postId: post.id });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}