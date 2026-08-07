import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

const APP_URL = Deno.env.get('APP_URL') || 'https://eza.social';
const BRAND_LOGO_URL = 'https://media.base44.com/images/public/69c5c081406b9e20deaed582/ec45d104f_Gemini_Generated_Image_giywz2giywz2giyw-ezgifcom-crop-removebg-preview-a5779c5f-135e-4533-ab49-24592b212751.png';

// ── Palette EZA GROUP (cuivre / rose gold métallisé sur noir) ──────────────────
const COPPER = {
  rim: '#E88E52',       // rim light orange-cuivre
  surface: '#B89C8F',   // surface mate
  highlight: '#D4B4A0', // highlights haut-gloss
  deep: '#8B6F5C',      // cuivre profond
  dark: '#4A4038',      // fond footer
  glow: 'rgba(232,142,82,0.08)',
  softGlow: 'rgba(232,142,82,0.06)',
  borderSoft: 'rgba(232,142,82,0.15)',
  borderMid: 'rgba(232,142,82,0.3)',
};

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
  NEW_POST: {
    icon: '✍️',
    label: 'a publié un nouveau post',
    accent: '#38aadc',
    accentSoft: 'rgba(56,170,220,0.12)',
    subject: (n) => `${n.sender_name} vient de publier un nouveau post`,
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

// ── Template email premium — EZA GROUP (cuivre métallisé sur noir) ────────────
function buildSocialEmail({ notification, config, recipientName, senderAvatar, postExcerpt, link }) {
  const senderName = escapeHtml(notification.sender_name || 'Quelqu’un');
  const senderUsername = notification.sender_username ? `@${escapeHtml(notification.sender_username)}` : '';
  const safeRecipient = escapeHtml(recipientName || '');
  const safeExcerpt = escapeHtml(truncate(postExcerpt, 220));
  const ctaLink = link || `${APP_URL}`;
  const ctaLabel = notification.type === 'FOLLOW' ? 'Voir le profil' : 'Voir sur eza';
  const actionLabel = escapeHtml(config.label);

  // Avatar : image réelle ou fallback initiale — anneau cuivre
  const avatarHtml = senderAvatar
    ? `<img src="${escapeHtml(senderAvatar)}" alt="${senderName}" style="width:64px;height:64px;border-radius:50%;object-fit:cover;border:2px solid ${COPPER.rim};display:block;box-shadow:0 0 16px ${COPPER.glow};" />`
    : `<div style="width:64px;height:64px;border-radius:50%;background:linear-gradient(135deg,#1a1410,#2a1f18);border:2px solid ${COPPER.rim};text-align:center;line-height:64px;font-size:28px;font-weight:800;color:${COPPER.highlight};box-shadow:0 0 16px ${COPPER.glow};">${(notification.sender_name || '?').charAt(0).toUpperCase()}</div>`;

  // Bloc excerpt du post (si applicable) — style premium cuivre
  const excerptHtml = safeExcerpt
    ? `
        <div style="background:${COPPER.softGlow};border:1px solid ${COPPER.borderSoft};border-left:3px solid ${COPPER.rim};border-radius:12px;padding:20px 22px;margin-bottom:32px;">
          <div style="font-size:10px;font-weight:700;letter-spacing:3px;text-transform:uppercase;color:${COPPER.rim};margin-bottom:12px;">✦ Publication concernée</div>
          <p style="margin:0;font-size:15px;line-height:1.7;color:#C8B8A8;font-style:italic;">"${safeExcerpt}"</p>
        </div>`
    : '';

  return `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>${escapeHtml(config.subject(notification))}</title></head>
<body style="margin:0;padding:0;background:#000000;font-family:'Segoe UI',-apple-system,BlinkMacSystemFont,Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#000000;padding:48px 16px;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

  <!-- Brand header — logo EZA GROUP -->
  <tr><td style="padding-bottom:36px;text-align:center;">
    <img src="${BRAND_LOGO_URL}" alt="EZA GROUP" style="height:52px;width:auto;display:inline-block;" />
  </td></tr>

  <!-- Main card — noir avec bordure cuivre subtile -->
  <tr><td style="background:linear-gradient(160deg,#0a0a0a 0%,#121010 50%,#0a0a0a 100%);border:1px solid #2a2520;border-radius:20px;overflow:hidden;box-shadow:0 0 50px ${COPPER.glow};">
    <table width="100%" cellpadding="0" cellspacing="0">

      <!-- Ligne d'accent cuivre en haut -->
      <tr><td style="height:2px;background:linear-gradient(90deg,transparent 0%,${COPPER.rim} 30%,${COPPER.highlight} 50%,${COPPER.rim} 70%,transparent 100%);"></td></tr>

      <!-- Contenu -->
      <tr><td style="padding:44px 48px;">

        <!-- Badge type centré -->
        <div style="text-align:center;margin-bottom:36px;">
          <span style="display:inline-block;background:linear-gradient(135deg,${COPPER.softGlow},${COPPER.glow});border:1px solid ${COPPER.borderMid};border-radius:50px;padding:10px 24px;font-size:12px;font-weight:600;letter-spacing:2.5px;text-transform:uppercase;color:${COPPER.rim};">
            ${config.icon}&nbsp;&nbsp;${actionLabel}
          </span>
        </div>

        <!-- Ligne expéditeur avec avatar -->
        <table cellpadding="0" cellspacing="0" width="100%" style="margin-bottom:32px;">
          <tr>
            <td width="72" style="vertical-align:middle;">
              ${avatarHtml}
            </td>
            <td style="vertical-align:middle;padding-left:20px;">
              <div style="font-size:18px;font-weight:700;color:#E8DDD0;letter-spacing:0.3px;">${senderName}</div>
              <div style="font-size:13px;color:${COPPER.deep};margin-top:5px;letter-spacing:0.5px;">${senderUsername}</div>
            </td>
          </tr>
        </table>

        <!-- Message -->
        <p style="margin:0 0 28px;font-size:15px;color:#A0958A;line-height:1.75;letter-spacing:0.2px;">
          ${safeRecipient ? `Bonjour <strong style="color:${COPPER.highlight};font-weight:700;">${safeRecipient}</strong>,` : 'Bonjour,'} <strong style="color:${COPPER.highlight};font-weight:700;">${senderName}</strong> ${actionLabel} sur eza.
        </p>

        ${excerptHtml}

        <!-- Bouton CTA — dégradé cuivre métallisé -->
        <table cellpadding="0" cellspacing="0" width="100%">
          <tr><td align="center" style="padding-bottom:4px;">
            <a href="${escapeHtml(ctaLink)}" style="display:inline-block;padding:16px 44px;font-size:15px;font-weight:700;color:#0a0a0a;text-decoration:none;border-radius:12px;background:linear-gradient(135deg,${COPPER.rim} 0%,${COPPER.highlight} 50%,${COPPER.rim} 100%);box-shadow:0 6px 24px rgba(232,142,82,0.35),inset 0 1px 0 rgba(255,255,255,0.3);letter-spacing:0.5px;text-transform:uppercase;">
              ${ctaLabel} →
            </a>
          </td></tr>
        </table>

      </td></tr>
    </table>
  </td></tr>

  <!-- Footer premium -->
  <tr><td style="padding-top:36px;text-align:center;">
    <div style="height:1px;background:linear-gradient(90deg,transparent,${COPPER.deep},transparent);margin-bottom:24px;"></div>
    <p style="font-size:12px;color:${COPPER.deep};margin:0;letter-spacing:1px;">eza · <a href="${APP_URL}" style="color:${COPPER.surface};text-decoration:none;font-weight:600;">eza.social</a></p>
    <p style="font-size:11px;color:${COPPER.dark};margin:10px 0 0;line-height:1.6;">Vous recevez cet email car vous avez une nouvelle notification sur eza.</p>
    <p style="font-size:11px;color:${COPPER.dark};margin:4px 0 0;line-height:1.6;">Gérez vos préférences dans <a href="${APP_URL}/espace" style="color:${COPPER.surface};text-decoration:none;">votre espace</a>.</p>
    <p style="font-size:10px;color:#2A2520;margin:16px 0 0;letter-spacing:2px;text-transform:uppercase;">© 2026 EZA GROUP</p>
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