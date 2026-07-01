/**
 * Helper centralisé pour créer des notifications sociales.
 * Import: import { notify } from '@/lib/notificationHelper';
 */
import { base44 } from '@/api/base44Client';

export async function notify({ type, sender, receiverEmail, receiverId, postId, postExcerpt, link }) {
  if (!receiverEmail || sender?.email === receiverEmail) return;

  const senderName = sender?.display_name || sender?.full_name || sender?.username || 'Quelqu\u2019un';

  const titles = {
    LIKE: `${senderName} a aim\u00e9 votre post`,
    REPLY: `${senderName} a r\u00e9pondu \u00e0 votre post`,
    FOLLOW: `${senderName} a commenc\u00e9 \u00e0 vous suivre`,
    VERIFICATION: 'Votre coche bleue est l\u00e0 ! Votre compte est maintenant certifi\u00e9.',
    MENTION: `${senderName} vous a mentionn\u00e9`,
  };

  try {
    await base44.entities.Notification.create({
      type,
      user_email: receiverEmail,
      receiver_id: receiverId || null,
      title: titles[type] || type,
      sender_id: sender?.id || null,
      sender_name: senderName,
      sender_avatar: sender?.avatar_url || null,
      sender_username: sender?.username || null,
      post_id: postId || null,
      post_excerpt: postExcerpt ? postExcerpt.slice(0, 100) : null,
      link: link || null,
      is_read: false,
    });
  } catch {
    // Silencieux
  }
}