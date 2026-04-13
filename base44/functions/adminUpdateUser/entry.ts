import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const STATUS_LABELS = {
  banned:     { fr: 'banni',     title: 'Compte banni',     emoji: '⛔' },
  suspended:  { fr: 'suspendu',  title: 'Compte suspendu',  emoji: '⏸' },
  restricted: { fr: 'restreint', title: 'Accès restreint',  emoji: '⚠️' },
};

function buildStandardEmail({ name, status, reason, until }) {
  const cfg = STATUS_LABELS[status] || { fr: status, title: 'Statut mis à jour', emoji: '⚠️' };
  const untilBlock = until
    ? `<p style="color:#aaa;font-size:13px;">Fin prévue : <strong style="color:#fff">${new Date(until).toLocaleDateString('fr-FR', { day:'numeric', month:'long', year:'numeric' })}</strong></p>`
    : '';
  const reasonBlock = reason
    ? `<div style="background:#1a1a2e;border:1px solid #333;border-radius:10px;padding:14px 18px;margin:16px 0;"><p style="color:#888;font-size:11px;margin:0 0 4px;">MOTIF</p><p style="color:#ccc;font-size:13px;margin:0;">${reason}</p></div>`
    : '';
  return `<!DOCTYPE html><html><body style="margin:0;padding:0;background:#0a0a0f;font-family:Inter,sans-serif;">
<div style="max-width:520px;margin:40px auto;background:#111118;border:1px solid #222;border-radius:16px;overflow:hidden;">
  <div style="background:linear-gradient(135deg,#1a1a2e,#0f0f1a);padding:30px 32px;border-bottom:1px solid #222;">
    <p style="color:#38aae0;font-size:11px;font-weight:700;letter-spacing:3px;text-transform:uppercase;margin:0 0 8px;">BRENNE AERIAL</p>
    <h1 style="color:#fff;font-size:22px;margin:0;">${cfg.emoji} ${cfg.title}</h1>
  </div>
  <div style="padding:28px 32px;">
    <p style="color:#bbb;font-size:14px;">Bonjour <strong style="color:#fff;">${name}</strong>,</p>
    <p style="color:#999;font-size:13px;line-height:1.6;">Votre compte a été <strong style="color:#fff;">${cfg.fr}</strong> sur la plateforme Brenne Aerial.</p>
    ${reasonBlock}${untilBlock}
    <p style="color:#888;font-size:12px;margin-top:20px;">Pour toute contestation, contactez-nous à <a href="mailto:contact@brenneaerial.fr" style="color:#38aae0;">contact@brenneaerial.fr</a></p>
  </div>
  <div style="padding:16px 32px;border-top:1px solid #222;text-align:center;">
    <p style="color:#555;font-size:11px;margin:0;">© Brenne Aerial — Plateforme drone professionnelle</p>
  </div>
</div></body></html>`;
}

function buildStandardRestoreEmail({ name }) {
  return `<!DOCTYPE html><html><body style="margin:0;padding:0;background:#0a0a0f;font-family:Inter,sans-serif;">
<div style="max-width:520px;margin:40px auto;background:#111118;border:1px solid #222;border-radius:16px;overflow:hidden;">
  <div style="background:linear-gradient(135deg,#1a1a2e,#0f0f1a);padding:30px 32px;border-bottom:1px solid #222;">
    <p style="color:#38aae0;font-size:11px;font-weight:700;letter-spacing:3px;text-transform:uppercase;margin:0 0 8px;">BRENNE AERIAL</p>
    <h1 style="color:#4ade80;font-size:22px;margin:0;">✅ Accès restauré</h1>
  </div>
  <div style="padding:28px 32px;">
    <p style="color:#bbb;font-size:14px;">Bonjour <strong style="color:#fff;">${name}</strong>,</p>
    <p style="color:#999;font-size:13px;line-height:1.6;">Votre compte a été <strong style="color:#4ade80;">restauré</strong> et vous pouvez de nouveau accéder à l'ensemble de la plateforme Brenne Aerial.</p>
    <p style="color:#888;font-size:12px;margin-top:20px;">Une question ? Contactez-nous à <a href="mailto:contact@brenneaerial.fr" style="color:#38aae0;">contact@brenneaerial.fr</a></p>
  </div>
  <div style="padding:16px 32px;border-top:1px solid #222;text-align:center;">
    <p style="color:#555;font-size:11px;margin:0;">© Brenne Aerial — Plateforme drone professionnelle</p>
  </div>
</div></body></html>`;
}

const SUPREME_STATUS_MESSAGES = {
  banned: {
    headline: 'Votre accès à la plateforme a été définitivement révoqué.',
    detail: "Suite à une violation grave de nos conditions d'utilisation, votre compte Rang Suprême a été banni de manière permanente. Cette décision a été prise après examen approfondi par notre équipe administrative.",
    note: "En tant qu'ancien membre Suprême, vous disposez d'un droit de contestation prioritaire. Nous vous invitons à nous contacter dans les plus brefs délais si vous estimez que cette décision est injuste.",
  },
  suspended: {
    headline: 'Votre accès est temporairement suspendu.',
    detail: "Votre compte Rang Suprême a été temporairement suspendu suite à un manquement identifié. Cette mesure est conservative et peut être levée avant son terme en cas de résolution satisfaisante.",
    note: "Votre statut Suprême, vos avantages exclusifs et vos données sont préservés durant cette période. Vous retrouverez un accès complet à la levée de la suspension.",
  },
  restricted: {
    headline: 'Votre compte est en accès restreint.',
    detail: "Certaines fonctionnalités de votre compte Rang Suprême ont été temporairement limitées. Cette restriction a été appliquée à titre préventif dans l'attente d'une clarification de la situation.",
    note: "Vos privilèges Suprême restent partiellement actifs. Un traitement prioritaire de votre dossier est en cours par notre équipe dédiée.",
  },
};

function buildSupremeEmail({ name, status, reason, until }) {
  const cfg = STATUS_LABELS[status] || { fr: status, title: 'Statut mis à jour', emoji: '⚠️' };
  const msg = SUPREME_STATUS_MESSAGES[status] || SUPREME_STATUS_MESSAGES.restricted;

  const untilBlock = until
    ? `<div style="margin:16px 0;padding:14px 18px;background:rgba(245,158,11,0.05);border:1px solid rgba(217,119,6,0.3);border-radius:10px;">
        <p style="color:#d97706;font-size:10px;font-weight:700;letter-spacing:2px;text-transform:uppercase;margin:0 0 6px;">&#9200; LEVÉE AUTOMATIQUE</p>
        <p style="color:#f59e0b;font-size:14px;font-weight:700;margin:0;">${new Date(until).toLocaleDateString('fr-FR', { day:'numeric', month:'long', year:'numeric', hour:'2-digit', minute:'2-digit' })}</p>
      </div>`
    : '';
  const reasonBlock = reason
    ? `<div style="background:linear-gradient(135deg,rgba(245,158,11,0.08),rgba(217,119,6,0.04));border:1px solid rgba(217,119,6,0.4);border-radius:12px;padding:16px 20px;margin:16px 0;">
        <p style="color:#d97706;font-size:10px;font-weight:700;letter-spacing:2px;text-transform:uppercase;margin:0 0 8px;">&#128221; MOTIF OFFICIEL</p>
        <p style="color:#c8943a;font-size:13px;line-height:1.6;margin:0;">${reason}</p>
      </div>`
    : '';

  return `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#0d0800;font-family:'Inter',Arial,sans-serif;">
<div style="max-width:580px;margin:40px auto;padding:0 16px;">
  <div style="height:4px;background:linear-gradient(90deg,#92400e,#f59e0b,#fde68a,#f59e0b,#92400e);border-radius:4px 4px 0 0;"></div>
  <div style="background:linear-gradient(180deg,#1a0e00 0%,#0d0800 60%,#120a00 100%);border:1px solid #d97706;border-top:none;border-radius:0 0 20px 20px;overflow:hidden;box-shadow:0 0 60px rgba(245,158,11,0.2);">
    <div style="padding:36px 36px 24px;text-align:center;border-bottom:1px solid rgba(217,119,6,0.2);background:linear-gradient(135deg,#2d1500,#1a0c00);">
      <div style="display:inline-flex;align-items:center;gap:8px;background:linear-gradient(135deg,#78350f,#d97706);padding:6px 20px;border-radius:30px;margin-bottom:20px;box-shadow:0 4px 16px rgba(245,158,11,0.35);">
        <span style="font-size:14px;">&#128081;</span>
        <span style="font-size:10px;font-weight:800;letter-spacing:4px;text-transform:uppercase;color:#fde68a;">RANG SUPRÊME</span>
        <span style="font-size:14px;">&#128081;</span>
      </div>
      <div style="font-size:44px;margin-bottom:10px;">${cfg.emoji}</div>
      <h1 style="color:#f59e0b;font-size:26px;font-weight:800;margin:0;letter-spacing:-0.5px;text-shadow:0 0 30px rgba(245,158,11,0.6);">${cfg.title}</h1>
      <p style="color:#a08040;font-size:12px;margin:8px 0 0;letter-spacing:1px;text-transform:uppercase;">Notification officielle &bull; Brenne Aerial</p>
    </div>
    <div style="padding:32px 36px;">
      <p style="color:#c8943a;font-size:15px;margin:0 0 4px;">Bonjour,</p>
      <p style="font-size:22px;font-weight:700;margin:0 0 24px;color:#f59e0b;">${name}</p>
      <p style="color:#e8c06a;font-size:15px;font-weight:600;line-height:1.5;margin:0 0 12px;">${msg.headline}</p>
      <p style="color:#a08040;font-size:13px;line-height:1.8;margin:0 0 20px;">${msg.detail}</p>
      ${reasonBlock}
      ${untilBlock}
      <div style="background:linear-gradient(135deg,rgba(245,158,11,0.05),transparent);border-left:3px solid #d97706;padding:14px 18px;margin:20px 0;border-radius:0 8px 8px 0;">
        <p style="color:#c8943a;font-size:13px;line-height:1.7;margin:0;">${msg.note}</p>
      </div>
      <div style="height:1px;background:linear-gradient(90deg,transparent,rgba(217,119,6,0.4),transparent);margin:28px 0;"></div>
      <div style="text-align:center;">
        <p style="color:#7a6030;font-size:12px;margin:0 0 12px;">Pour toute contestation prioritaire ou demande d'information :</p>
        <a href="mailto:contact@brenneaerial.fr" style="display:inline-block;background:linear-gradient(135deg,#78350f,#d97706);color:#fff;font-size:13px;font-weight:700;padding:12px 28px;border-radius:30px;text-decoration:none;box-shadow:0 4px 16px rgba(245,158,11,0.35);">Contacter le support Suprême</a>
        <p style="color:#5a4010;font-size:11px;margin:12px 0 0;">contact@brenneaerial.fr &bull; Réponse prioritaire garantie</p>
      </div>
    </div>
    <div style="padding:20px 36px;border-top:1px solid rgba(217,119,6,0.15);text-align:center;background:rgba(0,0,0,0.2);">
      <p style="color:#d97706;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;margin:0 0 6px;">&#9733; BRENNE AERIAL SUPRÊME &#9733;</p>
      <p style="color:#5a4010;font-size:10px;margin:0;">Cette notification vous est envoyée en raison de votre appartenance au Rang Suprême.<br>Ne répondez pas directement à cet e-mail.</p>
    </div>
  </div>
  <div style="height:2px;background:linear-gradient(90deg,transparent,#d97706,transparent);margin-top:2px;"></div>
</div>
</body></html>`;
}

function buildSupremeRestoreEmail({ name }) {
  return `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#0d0800;font-family:'Inter',Arial,sans-serif;">
<div style="max-width:580px;margin:40px auto;padding:0 16px;">
  <div style="height:4px;background:linear-gradient(90deg,#92400e,#f59e0b,#fde68a,#f59e0b,#92400e);border-radius:4px 4px 0 0;"></div>
  <div style="background:linear-gradient(180deg,#1a0e00 0%,#0d0800 60%,#120a00 100%);border:1px solid #d97706;border-top:none;border-radius:0 0 20px 20px;overflow:hidden;box-shadow:0 0 60px rgba(245,158,11,0.2);">
    <div style="padding:36px 36px 24px;text-align:center;border-bottom:1px solid rgba(217,119,6,0.2);background:linear-gradient(135deg,#2d1500,#1a0c00);">
      <div style="display:inline-flex;align-items:center;gap:8px;background:linear-gradient(135deg,#78350f,#d97706);padding:6px 20px;border-radius:30px;margin-bottom:20px;box-shadow:0 4px 16px rgba(245,158,11,0.35);">
        <span style="font-size:14px;">&#128081;</span>
        <span style="font-size:10px;font-weight:800;letter-spacing:4px;text-transform:uppercase;color:#fde68a;">RANG SUPRÊME</span>
        <span style="font-size:14px;">&#128081;</span>
      </div>
      <div style="font-size:44px;margin-bottom:10px;">&#10004;</div>
      <h1 style="color:#4ade80;font-size:26px;font-weight:800;margin:0;text-shadow:0 0 20px rgba(74,222,128,0.4);">Accès pleinement restauré</h1>
      <p style="color:#a08040;font-size:12px;margin:8px 0 0;letter-spacing:1px;text-transform:uppercase;">Notification officielle &bull; Brenne Aerial</p>
    </div>
    <div style="padding:32px 36px;">
      <p style="color:#c8943a;font-size:15px;margin:0 0 4px;">Bonjour,</p>
      <p style="font-size:22px;font-weight:700;margin:0 0 24px;color:#f59e0b;">${name}</p>
      <p style="color:#e8c06a;font-size:15px;font-weight:600;line-height:1.5;margin:0 0 12px;">Votre compte Rang Suprême est de nouveau pleinement actif.</p>
      <p style="color:#a08040;font-size:13px;line-height:1.8;margin:0 0 20px;">Nous avons le plaisir de vous annoncer que toutes les restrictions appliquées à votre compte ont été levées. Vous bénéficiez de nouveau de l'ensemble de vos privilèges et accès exclusifs liés au Rang Suprême.</p>
      <div style="background:linear-gradient(135deg,rgba(74,222,128,0.05),transparent);border-left:3px solid #4ade80;padding:14px 18px;margin:20px 0;border-radius:0 8px 8px 0;">
        <p style="color:#86efac;font-size:13px;line-height:1.7;margin:0;">Tous vos avantages, données et accès Suprême sont intacts. Nous vous remercions de votre compréhension et vous souhaitons une excellente continuation sur la plateforme.</p>
      </div>
      <div style="height:1px;background:linear-gradient(90deg,transparent,rgba(217,119,6,0.4),transparent);margin:28px 0;"></div>
      <div style="text-align:center;">
        <p style="color:#7a6030;font-size:12px;margin:0 0 12px;">Pour toute question ou remarque :</p>
        <a href="mailto:contact@brenneaerial.fr" style="display:inline-block;background:linear-gradient(135deg,#78350f,#d97706);color:#fff;font-size:13px;font-weight:700;padding:12px 28px;border-radius:30px;text-decoration:none;box-shadow:0 4px 16px rgba(245,158,11,0.35);">Contacter le support Suprême</a>
        <p style="color:#5a4010;font-size:11px;margin:12px 0 0;">contact@brenneaerial.fr &bull; Réponse prioritaire garantie</p>
      </div>
    </div>
    <div style="padding:20px 36px;border-top:1px solid rgba(217,119,6,0.15);text-align:center;background:rgba(0,0,0,0.2);">
      <p style="color:#d97706;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;margin:0 0 6px;">&#9733; BRENNE AERIAL SUPRÊME &#9733;</p>
      <p style="color:#5a4010;font-size:10px;margin:0;">Cette notification vous est envoyée en raison de votre appartenance au Rang Suprême.<br>Ne répondez pas directement à cet e-mail.</p>
    </div>
  </div>
  <div style="height:2px;background:linear-gradient(90deg,transparent,#d97706,transparent);margin-top:2px;"></div>
</div>
</body></html>`;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    const isOwner = user.role === 'owner' || user.email === 'contact.astuceson@gmail.com';
    if (!user || (user.role !== 'admin' && !isOwner)) {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const { id, data } = await req.json();
    if (!id || !data) {
      return Response.json({ error: 'Missing id or data' }, { status: 400 });
    }

    let targetUser = null;
    try { targetUser = await base44.asServiceRole.entities.User.get(id); } catch(_) {}

    const updated = await base44.asServiceRole.entities.User.update(id, data);

    const restrictedStatuses = ['banned', 'suspended', 'restricted'];
    const statusChanged = data.account_status && data.account_status !== targetUser?.account_status;
    const isBeingRestricted = statusChanged && restrictedStatuses.includes(data.account_status);
    const isBeingRestored = statusChanged && data.account_status === 'active' && restrictedStatuses.includes(targetUser?.account_status);

    if ((isBeingRestricted || isBeingRestored) && targetUser?.email) {
      try {
        const isSupreme = (targetUser.verifications || []).includes('supreme');
        const uname = targetUser.full_name || 'Membre';
        let html, subject;

        if (isBeingRestored) {
          html = isSupreme
            ? buildSupremeRestoreEmail({ name: uname })
            : buildStandardRestoreEmail({ name: uname });
          subject = isSupreme ? '&#128081; ✅ Accès restauré — Rang Suprême' : '✅ Accès restauré — Brenne Aerial';
        } else {
          const cfg = STATUS_LABELS[data.account_status];
          html = isSupreme
            ? buildSupremeEmail({ name: uname, status: data.account_status, reason: data.suspension_reason, until: data.suspension_until })
            : buildStandardEmail({ name: uname, status: data.account_status, reason: data.suspension_reason, until: data.suspension_until });
          subject = isSupreme
            ? `&#128081; ${cfg.emoji} ${cfg.title} — Rang Suprême`
            : `${cfg.emoji} ${cfg.title} — Brenne Aerial`;
        }

        await base44.asServiceRole.integrations.Core.SendEmail({ to: targetUser.email, subject, body: html });
      } catch(_) {}
    }

    return Response.json({ user: updated });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});