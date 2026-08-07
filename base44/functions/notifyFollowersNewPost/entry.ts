import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

const APP_URL = Deno.env.get('APP_URL') || 'https://eza.social';

// ── Handler ──────────────────────────────────────────────────────────────────
// Triggered by entity automation on Post create.
// Creates a NEW_POST notification for each follower of the post author.
// The existing "socialNotificationEmail" automation then sends the email.
export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const payload = await req.json();

    // Entity automation sends { event, data }
    const post = payload.data || payload;
    if (!post || !post.author_id) {
      return Response.json({ skipped: 'no_post_data' });
    }

    // Skip replies — only root posts notify followers
    if (post.reply_to_id) {
      return Response.json({ skipped: 'is_reply' });
    }

    // Skip drafts and scheduled posts (they'll be handled when published)
    if (post.is_draft) {
      return Response.json({ skipped: 'is_draft' });
    }

    // Skip community posts — they have their own notification flow
    if (post.community_id) {
      return Response.json({ skipped: 'is_community_post' });
    }

    // Get author's email from User entity
    let authorEmail = null;
    try {
      const users = await base44.asServiceRole.entities.User.filter({ id: post.author_id });
      authorEmail = users?.[0]?.email;
    } catch (_) {}

    if (!authorEmail) {
      return Response.json({ skipped: 'no_author_email' });
    }

    // Fetch all followers (Follow records where following_email = author's email)
    const followers = await base44.asServiceRole.entities.Follow.filter({ following_email: authorEmail });
    if (!followers || followers.length === 0) {
      return Response.json({ skipped: 'no_followers', count: 0 });
    }

    const authorName = post.author_display_name || post.author_name || "Quelqu'un";
    const excerpt = (post.content || '').slice(0, 100);
    const postLink = `${APP_URL}/post/${post.id}`;

    // Build notification records for each follower
    const notifications = followers.map(f => ({
      type: 'NEW_POST',
      user_email: f.follower_email,
      title: `${authorName} a publié un nouveau post`,
      sender_id: post.author_id,
      sender_name: authorName,
      sender_avatar: post.author_avatar || null,
      sender_username: post.author_username || null,
      post_id: post.id,
      post_excerpt: excerpt,
      link: `/post/${post.id}`,
      is_read: false,
    }));

    // Bulk create in batches of 500 (bulkCreate limit)
    const BATCH_SIZE = 500;
    let created = 0;
    for (let i = 0; i < notifications.length; i += BATCH_SIZE) {
      const batch = notifications.slice(i, i + BATCH_SIZE);
      try {
        await base44.entities.Notification.bulkCreate(batch);
        created += batch.length;
      } catch (_) {}
    }

    return Response.json({
      success: true,
      notified: created,
      total_followers: followers.length,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}