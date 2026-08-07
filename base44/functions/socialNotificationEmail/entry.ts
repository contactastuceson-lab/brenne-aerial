import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

const APP_URL = Deno.env.get('APP_URL') || 'https://ezagroup.org';
const DOMAIN = 'ezagroup.org';
const BRAND_LOGO_URL = 'https://media.base44.com/images/public/69c5c081406b9e20deaed582/ec45d104f_Gemini_Generated_Image_giywz2giywz2giyw-ezgifcom-crop-removebg-preview-a5779c5f-135e-4533-ab49-24592b212751.png';

// ── Helpers ──────────────────────────────────────────────────────────────────
function escapeHtml(value) {
  return String(value == null ? '' : value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function truncate(text, max = 180) {
  if (!text) return '';
  const t = String(text);
  return t.length > max ? t.slice(0, max).trimEnd() + '…' : t;
}

// ── Config par type de notification (style TikTok) ────────────────────────────
// Chaque type définit : icône, couleur d'accent, headline, statut, overlay avatar
const TYPE_CONFIG = {
  LIKE: {
    icon: '❤️',
    overlayIcon: '❤️',
    accent: '#FF3B5F',
    headline: (n) => `${n.sender_name} a aimé ta publication`,
    status: () => '',
    subject: (n) => `${n.sender_name} a aimé ta publication`,
  },
  REPLY: {
    icon: '💬',
    overlayIcon: '💬',
    accent: '#3B82F6',
    headline: (n) => `${n.sender_name} a répondu à ta publication`,
    status: () => '',
    subject: (n) => `${n.sender_name} a répondu à ta publication`,
  },
  FOLLOW: {
    icon: '✨',
    overlayIcon: '➕',
    accent: '#10B981',
    headline: (n) => `${n.sender_name} a commencé à te suivre`,
    status: () => 'Te suit',
    subject: (n) => `${n.sender_name} a commencé à te suivre`,
  },
  NEW_POST: {
    icon: '✍️',
    overlayIcon: '✍️',
    accent: '#38AADC',
    headline: (n) => `${n.sender_name} vient de publier`,
    status: () => '',
    subject: (n) => `${n.sender_name} vient de publier un nouveau post`,
  },
  MENTION: {
    icon: '📣',
    overlayIcon: '@',
    accent: '#A855F7',
    headline: (n) => `${n.sender_name} t'a mentionné`,
    status: () => '',
    subject: (n) => `${n.sender_name} t'a mentionné`,
  },
  VERIFICATION: {
    icon: '✅',
    overlayIcon: '✅',
    accent: '#3B82F6',
    headline: () => `Ton compte est certifié`,
    status: () => 'Vérifié',
    subject: () => `✅ Ton compte eza est certifié`,
  },
};

// ── Template email style TikTok (carte blanche sur fond sombre) ────────────────
function buildSocialEmail({ notification, config, recipientName, senderAvatar, postExcerpt, link }) {
  const senderName = escapeHtml(notification.sender_name || 'Quelqu’un');
  const senderUsername = notification.sender_username ? `@${escapeHtml(notification.sender_username)}` : '';
  const safeExcerpt = escapeHtml(truncate(postExcerpt, 180));
  const ctaLink = link || `${APP_URL}`;
  const accent = config.accent;
  const headline = escapeHtml(config.headline(notification));
  const statusText = escapeHtml(config.status(notification));
  const overlayIcon = config.overlayIcon;

  // Avatar : image réelle ou fallback initiale
  const avatarHtml = senderAvatar
    ? `<img src="${escapeHtml(senderAvatar)}" alt="${senderName}" width="88" height="88" style="width:88px;height:88px;border-radius:50%;object-fit:cover;display:block;" />`
    : `<div style="width:88px;height:88px;border-radius:50%;background:linear-gradient(135deg,#E88E52,#C9733A);text-align:center;line-height:88px;font-size:36px;font-weight:800;color:#FFFFFF;">${(notification.sender_name || '?').charAt(0).toUpperCase()}</div>`;

  // Statut sous le nom (soit "Te suit", soit l'excerpt du post)
  const statusHtml = statusText
    ? `<p style="margin:0;font-size:14px;color:#666666;font-weight:400;">${statusText}</p>`
    : safeExcerpt
      ? `<p style="margin:0;font-size:14px;color:#666666;font-weight:400;line-height:1.5;">"${safeExcerpt}"</p>`
      : '';

  return `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>${escapeHtml(config.subject(notification))}</title></head>
<body style="margin:0;padding:0;background-color:#1A1A1A;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased;">
<table width="100%" cellpadding="0" cellspacing="0" bgcolor="#1A1A1A" style="background-color:#1A1A1A;padding:32px 12px;">
<tr><td align="center">
<table width="440" cellpadding="0" cellspacing="0" style="max-width:440px;width:100%;background-color:#FFFFFF;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.3);">

  <!-- Icône notification + badge (haut droite) -->
  <tr><td style="padding:20px 20px 0;text-align:right;">
    <div style="position:relative;display:inline-block;">
      <div style="width:36px;height:36px;background-color:#F3F3F3;border-radius:50%;text-align:center;line-height:36px;font-size:18px;">${config.icon}</div>
      <div style="position:absolute;top:-3px;right:-3px;background-color:#FF3B30;color:#FFFFFF;font-size:10px;font-weight:700;min-width:16px;height:16px;border-radius:8px;text-align:center;line-height:16px;border:2px solid #FFFFFF;padding:0 3px;">1</div>
    </div>
  </td></tr>

  <!-- Titre / headline -->
  <tr><td style="padding:8px 28px 24px;text-align:center;">
    <h1 style="margin:0;font-size:20px;font-weight:700;color:#000000;line-height:1.35;letter-spacing:-0.2px;">${headline}</h1>
  </td></tr>

  <!-- Avatar avec overlay icône -->
  <tr><td style="padding:0 28px 14px;text-align:center;">
    <div style="position:relative;display:inline-block;">
      ${avatarHtml}
      <div style="position:absolute;bottom:2px;right:2px;width:28px;height:28px;background-color:${accent};border-radius:50%;border:3px solid #FFFFFF;text-align:center;line-height:28px;font-size:14px;font-weight:700;color:#FFFFFF;">${overlayIcon}</div>
    </div>
  </td></tr>

  <!-- Nom + statut -->
  <tr><td style="padding:0 28px 28px;text-align:center;">
    <p style="margin:0 0 4px;font-size:17px;font-weight:700;color:#000000;">${senderName}</p>
    ${statusHtml}
  </td></tr>

  <!-- Bouton "Voir" -->
  <tr><td style="padding:0 28px 28px;">
    <a href="${escapeHtml(ctaLink)}" style="display:block;width:100%;box-sizing:border-box;padding:14px 0;background-color:${accent};color:#FFFFFF;text-align:center;text-decoration:none;font-size:16px;font-weight:600;border-radius:10px;">Voir</a>
  </td></tr>

  <!-- Section feedback -->
  <tr><td style="padding:20px 28px 20px;text-align:center;border-top:1px solid #F0F0F0;">
    <p style="margin:0 0 14px;font-size:13px;color:#666666;">Cet e-mail t'a-t-il été utile au regard de ce que tu recherchais ?</p>
    <div>
      <a href="${escapeHtml(ctaLink)}" style="display:inline-block;padding:7px 22px;border:1px solid #DDDDDD;border-radius:20px;font-size:14px;color:#333333;text-decoration:none;margin-right:8px;">Oui</a>
      <a href="${escapeHtml(ctaLink)}" style="display:inline-block;padding:7px 22px;border:1px solid #DDDDDD;border-radius:20px;font-size:14px;color:#333333;text-decoration:none;">Non</a>
    </div>
  </td></tr>

  <!-- Footer -->
  <tr><td style="padding:18px 28px 24px;text-align:center;background-color:#FAFAFA;">
    <p style="margin:0 0 10px;font-size:11px;color:#999999;">Cet e-mail a été généré pour @${DOMAIN}</p>
    <p style="margin:0 0 8px;font-size:11px;color:#666666;">
      <a href="${APP_URL}/legal/privacy" style="color:#0066CC;text-decoration:none;">politique de confidentialité</a>
      &nbsp;/&nbsp;
      <a href="${APP_URL}/support" style="color:#0066CC;text-decoration:none;">Aide</a>
      &nbsp;/&nbsp;
      <a href="${APP_URL}/legal/terms" style="color:#0066CC;text-decoration:none;">Sécurité</a>
    </p>
    <p style="margin:0 0 10px;font-size:11px;color:#666666;">
      <a href="${APP_URL}/espace" style="color:#0066CC;text-decoration:none;">Désinscription</a>
      &nbsp;/&nbsp;
      <a href="${APP_URL}/espace" style="color:#0066CC;text-decoration:none;">Gérer les préférences de messagerie</a>
    </p>
    <p style="margin:14px 0 0;font-size:10px;color:#AAAAAA;line-height:1.6;">
      EZA GROUP — ${DOMAIN}<br>© 2026 EZA GROUP. Tous droits réservés.
    </p>
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

    // Récupérer le destinataire pour vérifier ses préférences
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