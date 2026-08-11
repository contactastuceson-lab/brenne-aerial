import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const parentId = body?.parent_id || body?.postId;
    if (!parentId) return Response.json({ error: 'parent_id required' }, { status: 400 });

    // Service role — le reply author ne peut pas updater le post parent (RLS)
    const parent = await base44.asServiceRole.entities.Post.get(parentId);
    if (!parent) return Response.json({ error: 'Post not found' }, { status: 404 });

    const newCount = (parent.replies_count || 0) + 1;
    await base44.asServiceRole.entities.Post.update(parentId, { replies_count: newCount });

    return Response.json({ ok: true, replies_count: newCount });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}