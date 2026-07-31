import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

// ── trackStoryView ────────────────────────────────────────────────────────
// Enregistre une vue sur une story (ajoute le viewer s'il n'a pas déjà vu).
// payload: { storyId }
// Renvoie { success, count }.

export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const storyId = String(body?.storyId || '').trim();
    if (!storyId) return Response.json({ error: 'storyId requis' }, { status: 400 });

    const story = await base44.asServiceRole.entities.Story.get(storyId);
    if (!story) return Response.json({ error: 'Story introuvable' }, { status: 404 });

    const viewers = Array.isArray(story.viewers) ? story.viewers : [];
    const already = viewers.some((v: any) => v?.id === user.id);
    if (already) {
      return Response.json({ success: true, alreadyViewed: true, count: viewers.length });
    }

    viewers.push({
      id: user.id,
      name: user.full_name || '',
      username: (user as any).username || '',
      avatar: (user as any).avatar_url || ''
    });

    await base44.asServiceRole.entities.Story.update(storyId, { viewers });

    return Response.json({ success: true, count: viewers.length });
  } catch (error) {
    return Response.json({ error: error?.message || 'Erreur serveur' }, { status: 500 });
  }
}