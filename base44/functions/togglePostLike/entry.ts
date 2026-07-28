import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

// Bascule un like sur un post côté serveur (service-role) pour contourner le RLS
// de l'entité Post qui n'autorise la modification qu'à l'auteur ou à un admin.
// Un utilisateur normal ne peut donc pas écrire liked_by/likes_count depuis le client.
export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const postId = body?.postId;
    if (!postId) return Response.json({ error: 'postId required' }, { status: 400 });

    const post = await base44.asServiceRole.entities.Post.get(postId);
    const likedBy = Array.isArray(post.liked_by) ? post.liked_by : [];
    const wasLiked = likedBy.includes(user.id);
    const newLikedBy = wasLiked
      ? likedBy.filter(id => id !== user.id)
      : [...likedBy, user.id];
    const newCount = wasLiked
      ? Math.max(0, (post.likes_count || 0) - 1)
      : (post.likes_count || 0) + 1;

    await base44.asServiceRole.entities.Post.update(postId, {
      liked_by: newLikedBy,
      likes_count: newCount,
    });

    return Response.json({
      liked: !wasLiked,
      likes_count: newCount,
      liked_by: newLikedBy,
    });
  } catch (error) {
    return Response.json({ error: error?.message || 'Internal error' }, { status: 500 });
  }
}