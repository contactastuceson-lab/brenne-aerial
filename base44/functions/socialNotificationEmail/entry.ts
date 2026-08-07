import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

const APP_URL = Deno.env.get('APP_URL') || 'https://eza.social';

// ── Helpers ──────────────────────────────────────────────────────────────────
function escapeHtml(value) {
  return String(value == null ? '' : value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function truncate(text, max = 220) {
  if (!text) return '';
  const t = String(text);
  return t.length > max ? t.slice(0, max).trimEnd() + '…' : t;
}

// Config visuelle par type de notification
const TYPE_CONFIG = {
  LIKE: {
    icon: '❤️',
    label: 'a aimé votre publication',
    accent: '#f43f5e',
    accentSoft: 'rgba(244,63,94,0.12)',
    subject: (n) => `${n.sender_name} a aimé votre publication`,
  },
  REPLY: {
    icon: '💬',
    label: 'a répondu à votre publication',
    accent: '#3b82f6',
    accentSoft: 'rgba(59,130,246,0.12)',
    subject: (n) => `${n.sender_name} a répondu à votre publication`,
  },
  FOLLOW: {
    icon: '✨',
    label: 'a commencé à vous suivre',
    accent: '#10b981',
    accentSoft: 'rgba(16,185,129,0.12)',
    subject: (n) => `${n.sender_name} vous suit désormais`,
  },
  MENTION: {
    icon: '📣',
    label: 'vous a mentionné',
    accent: '#a855f7',
    accentSoft: 'rgba(168,85,247,0.12)',
    subject: (n) => `${n.sender_name} vous a mentionné`,
  },
  VERIFICATION: {
    icon: '✅',
    label: 'Votre compte est certifié',
    accent: '#3b82f6',
    accentSoft: 'rgba(59,130,246,0.12)',
    subject: () => `✅ Votre compte eza est certifié`,
  },
};

// ── Template email ───────────────────────────────────────────────────────────
function buildSocialEmail({ notification, config, recipientName, senderAvatar, postExcerpt, link }) {
  const accent = config.accent;
  const accentSoft = config.accentSoft;
  const senderName = escapeHtml(notification.sender_name || 'Quelqu’un');
  const senderUsername = notification.sender_username ? `@${escapeHtml(notification.sender_username)}` : '';
  const safeRecipient = escapeHtml(recipientName || '');
  const safeExcerpt = escapeHtml(truncate(postExcerpt, 220));
  const ctaLink = link || `${APP_URL}`;
  const ctaLabel = notification.type === 'FOLLOW' ? 'Voir le profil →' : 'Voir sur eza →';

  // Avatar : image réelle ou fallback initiale
  const avatarHtml = senderAvatar
    ? `<img src="${escapeHtml(senderAvatar)}" alt="${senderName}" style="width:56px;height:56px;border-radius:50%;object-fit:cover;border:2px solid ${accent};display:block;" />`
    : `<div style="width:56px;height:56px;border-radius:50%;background:linear-gradient(135deg,#1a3a5c,#0f2a44);border:2px solid ${accent};text-align:center;line-height:56px;font-size:24px;font-weight:700;color:${accent};">${(notification.sender_name || '?').charAt(0).toUpperCase()}</div>`;

  // Bloc excerpt du post (si applicable)
  const excerptHtml = safeExcerpt
    ? `
        <div style="background:${accentSoft};border:1px solid ${accent}33;border-left:3px solid ${accent};border-radius:10px;padding:18px 20px;margin-bottom:28px;">
          <div style="font-size:10px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:${accent};opacity:0.7;margin-bottom:10px;">PUBLICATION CONCERNÉE</div>
          <p style="margin:0;font-size:14px;line-height:1.7;color:#c8d8e8;font-style:italic;">"${safeExcerpt}"</p>
        </div>`
    : '';

  return `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>${escapeHtml(config.subject(notification))}</title></head>
<body style="margin:0;padding:0;background:#060e1a;font-family:'Segoe UI',-apple-system,BlinkMacSystemFont,Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#060e1a;padding:40px 16px;">
<tr><td align="center">
<table width="580" cellpadding="0" cellspacing="0" style="max-width:580px;width:100%;">

  <!-- Brand header -->
  <tr><td style="padding-bottom:24px;text-align:center;">
    <span style="font-size:13px;font-weight:700;letter-spacing:3px;text-transform:uppercase;color:${accent};opacity:0.85;">eza</span>
  </td></tr>

  <!-- Main card -->
  <tr><td style="background:linear-gradient(145deg,#0c1a30,#0f2040);border:1px solid ${accent}33;border-radius:16px;overflow:hidden;">
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr><td style="height:3px;background:linear-gradient(90deg,${accent},${accent}aa,${accent});"></td></tr>
      <tr><td style="padding:36px 40px;">

        <!-- Sender row with avatar -->
        <table cellpadding="0" cellspacing="0" width="100%" style="margin-bottom:28px;">
          <tr>
            <td width="64" style="vertical-align:middle;">
              ${avatarHtml}
            </td>
            <td style="vertical-align:middle;padding-left:16px;">
              <div style="font-size:16px;font-weight:700;color:#e8edf5;">${senderName}</div>
              <div style="font-size:12px;color:#5a7a9a;margin-top:3px;">${senderUsername}</div>
            </td>
            <td style="vertical-align:middle;text-align:right;">
              <span style="background:${accentSoft};border:1px solid ${accent}44;border-radius:20px;padding:6px 14px;font-size:18px;">${config.icon}</span>
            </td>
          </tr>
        </table>

        <!-- Title -->
        <h1 style="margin:0 0 8px;font-size:22px;font-weight:800;color:#e8edf5;line-height:1.3;">
          ${config.icon} ${escapeHtml(config.label)}
        </h1>
        <p style="margin:0 0 24px;font-size:14px;color:#6a8aaa;line-height:1.6;">
          ${safeRecipient ? `Bonjour <strong style="color:#a0c0d8;">${safeRecipient}</strong>,` : 'Bonjour,'} <strong style="color:#a0c0d8;">${senderName}</strong> ${escapeHtml(config.label)} sur eza.
        </p>

        ${excerptHtml}

        <!-- CTA -->
        <table cellpadding="0" cellspacing="0">
          <tr><td style="border-radius:10px;background:linear-gradient(135deg,${accent},${accent}cc);">
            <a href="${escapeHtml(ctaLink)}" style="display:inline-block;padding:14px 32px;font-size:15px;font-weight:700;color:#fff;text-decoration:none;">${ctaLabel}</a>
          </td></tr>
        </table>

      </td></tr>
    </table>
  </td></tr>

  <!-- Footer -->
  <tr><td style="padding-top:28px;text-align:center;">
    <p style="font-size:12px;color:#2a4060;margin:0;">eza · <a href="${APP_URL}" style="color:${accent};text-decoration:none;">eza.social</a></p>
    <p style="font-size:11px;color:#1e3050;margin:6px 0 0;">Vous recevez cet email car vous avez une nouvelle notification sur eza.</p>
    <p style="font-size:11px;color:#1e3050;margin:4px 0 0;">Gérez vos préférences dans <a href="${APP_URL}/espace" style="color:${accent};text-decoration:none;">votre espace</a>.</p>
  </td></tr>

</table>
</td></tr>
</table>
</body>
</html>`;
}

// ── Handler ──────────────────────────────────────────────────────────────────
export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const payload = await req.json();

    // L'automation d'entité envoie { event, data, old_data }
    // Mais un appel direct peut aussi envoyer { ...notification }
    const notification = payload.data || payload;
    if (!notification || !notification.type || !notification.user_email) {
      return Response.json({ skipped: 'invalid_payload' });
    }

    const type = notification.type;
    const config = TYPE_CONFIG[type];
    if (!config) {
      return Response.json({ skipped: `type_${type}_not_supported` });
    }

    const recipientEmail = notification.user_email;

    // Récupérer le destinataire pour vérifier ses préférences + activité
    let recipientUser = null;
    try {
      const users = await base44.asServiceRole.entities.User.filter({ email: recipientEmail });
      recipientUser = users?.[0] || null;
    } catch (_) {}

    // Vérifier les préférences de notification
    const prefs = recipientUser?.notification_prefs || {};
    if (prefs.email_notifications === false) {
      return Response.json({ skipped: 'email_notifications_disabled' });
    }
    // Préférence par type (likes, replies, follows, mentions)
    const typePrefMap = { LIKE: 'likes', REPLY: 'replies', FOLLOW: 'follows', MENTION: 'mentions' };
    const prefKey = typePrefMap[type];
    if (prefKey && prefs[prefKey] === false) {
      return Response.json({ skipped: `${prefKey}_disabled` });
    }

    // Si le destinataire est actif récemment (3 min), pas besoin d'email
    if (recipientUser?.last_seen) {
      const lastSeen = new Date(recipientUser.last_seen);
      const minutesSinceActive = (Date.now() - lastSeen.getTime()) / 1000 / 60;
      if (minutesSinceActive < 3) {
        return Response.json({ skipped: 'recipient_is_online' });
      }
    }

    // Récupérer l'avatar de l'expéditeur si pas déjà dans la notification
    let senderAvatar = notification.sender_avatar || null;
    let postExcerpt = notification.post_excerpt || '';
    let link = notification.link || '';

    // Enrichir : récupérer le post si on a un post_id mais pas d'excerpt
    if (notification.post_id && !postExcerpt) {
      try {
        const posts = await base44.asServiceRole.entities.Post.filter({ id: notification.post_id });
        if (posts[0]) {
          postExcerpt = posts[0].content || '';
          if (!link) link = `${APP_URL}/post/${posts[0].id}`;
        }
      } catch (_) {}
    }

    // Enrichir : récupérer l'avatar du sender si manquant
    if (!senderAvatar && notification.sender_id) {
      try {
        const senders = await base44.asServiceRole.entities.User.filter({ id: notification.sender_id });
        if (senders[0]?.avatar_url) senderAvatar = senders[0].avatar_url;
      } catch (_) {}
    }

    // Lien par défaut selon le type
    if (!link) {
      if (type === 'FOLLOW' && notification.sender_username) {
        link = `${APP_URL}/@${notification.sender_username}`;
      } else if (notification.post_id) {
        link = `${APP_URL}/post/${notification.post_id}`;
      } else {
        link = APP_URL;
      }
    }

    const recipientName = recipientUser?.display_name || recipientUser?.full_name || '';

    const subject = config.subject(notification);
    const body = buildSocialEmail({
      notification,
      config,
      recipientName,
      senderAvatar,
      postExcerpt,
      link,
    });

    await base44.asServiceRole.integrations.Core.SendEmail({
      to: recipientEmail,
      from_name: 'eza',
      subject,
      body,
    });

    return Response.json({ success: true, type, recipient: recipientEmail });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}