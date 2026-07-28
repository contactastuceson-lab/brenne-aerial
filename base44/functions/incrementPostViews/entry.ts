import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

// Incrémente le compteur de vues d'un post côté serveur (service-role) pour
// contourner le RLS de l'entité Post (modification réservée à l'auteur/admin).
export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const postId = body?.postId;
    if (!postId) return Response.json({ error: 'postId required' }, { status: 400 });

    const post = await base44.asServiceRole.entities.Post.get(postId);
    const newCount = (post.views_count || 0) + 1;
    await base44.asServiceRole.entities.Post.update(postId, { views_count: newCount });
    return Response.json({ views_count: newCount });
  } catch (error) {
    return Response.json({ error: error?.message || 'Internal error' }, { status: 500 });
  }
}