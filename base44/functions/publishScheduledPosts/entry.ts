import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

// publishScheduledPosts — automation that publishes due drafts and notifies authors.
export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const drafts = await base44.asServiceRole.entities.Post.filter({ is_draft: true }, '-scheduled_at', 100);
    const now = Date.now();
    const due = drafts.filter(p => p.scheduled_at && new Date(p.scheduled_at).getTime() <= now);
    let published = 0;
    const authorCache = {};

    for (const p of due) {
      await base44.asServiceRole.entities.Post.update(p.id, { is_draft: false, scheduled_at: null });
      published++;

      // Send in-app notification + push to the author
      try {
        let authorEmail = authorCache[p.author_id];
        if (!authorEmail) {
          const u = await base44.asServiceRole.entities.User.get(p.author_id).catch(() => null);
          authorEmail = u?.email;
          if (authorEmail) authorCache[p.author_id] = authorEmail;
        }
        if (authorEmail) {
          await base44.asServiceRole.entities.Notification.create({
            user_email: authorEmail,
            type: 'system',
            title: 'Publication programmée publiée',
            content: `Votre publication a été publiée automatiquement à la date prévue.`,
            link: `/post/${p.id}`,
          });
          // Push notification (best-effort)
          await base44.asServiceRole.functions.invoke('sendWebPush', {
            email: authorEmail,
            title: 'Publication programmée publiée',
            body: (p.content || 'Votre post est en ligne').slice(0, 120),
            url: `/post/${p.id}`,
          }).catch(() => {});
        }
      } catch { /* notification is best-effort */ }
    }
    return Response.json({ published, checked: drafts.length });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}