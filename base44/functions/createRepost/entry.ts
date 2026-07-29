import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const originalPostId = body.originalPostId;
    const mode = body.mode === 'quote' ? 'quote' : 'repost';
    const quoteContent = (body.quoteContent || '').trim().slice(0, 280);

    if (!originalPostId) return Response.json({ error: 'originalPostId requis' }, { status: 400 });
    if (mode === 'quote' && !quoteContent) return Response.json({ error: 'Commentaire requis pour une citation' }, { status: 400 });

    const original = await base44.asServiceRole.entities.Post.get(originalPostId).catch(() => null);
    if (!original) return Response.json({ error: 'Post introuvable' }, { status: 404 });
    if (original.author_id === user.id) return Response.json({ error: 'Vous ne pouvez pas reposter votre propre post' }, { status: 400 });

    const postData = {
      content: mode === 'quote' ? quoteContent : '',
      quote_content: mode === 'quote' ? quoteContent : null,
      repost_of_id: original.id,
      author_id: user.id,
      author_name: user.full_name,
      author_display_name: user.display_name || user.full_name,
      author_username: user.username,
      author_avatar: user.avatar_url,
      author_verifications: user.verifications || [],
      media_urls: [],
      hashtags: [],
      mentions: [],
      likes_count: 0,
      liked_by: [],
      replies_count: 0,
      views_count: 0,
      reposts_count: 0,
      quotes_count: 0,
      visibility: 'public',
    };

    const created = await base44.entities.Post.create(postData);

    const field = mode === 'quote' ? 'quotes_count' : 'reposts_count';
    const next = (original[field] || 0) + 1;
    await base44.asServiceRole.entities.Post.update(original.id, { [field]: next }).catch(() => {});

    return Response.json({ success: true, postId: created.id });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}