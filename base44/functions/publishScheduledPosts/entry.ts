import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    // Scheduled automation — no user context; service role only.
    const drafts = await base44.asServiceRole.entities.Post.filter({ is_draft: true }, '-scheduled_at', 100);
    const now = Date.now();
    const due = drafts.filter(p => p.scheduled_at && new Date(p.scheduled_at).getTime() <= now);
    let published = 0;
    for (const p of due) {
      await base44.asServiceRole.entities.Post.update(p.id, { is_draft: false, scheduled_at: null });
      published++;
    }
    return Response.json({ published, checked: drafts.length });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}