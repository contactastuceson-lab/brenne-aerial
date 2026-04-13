import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const STATUS_LABELS = {
  banned: { fr: 'banni', title: 'Compte banni', emoji: '⛔' },
  suspended: { fr: 'suspendu', title: 'Compte suspendu', emoji: '⏸' },
  restricted: { fr: 'restreint', title: 'Accès restreint', emoji: '⚠️' },
};

function buildStandardEmail({ name, status, reason, until }) {
  const cfg = STATUS_LABELS[status] || { fr: status, title: 'Statut mis à jour', emoji: '⚠️' };
  const untilBlock = until ? `<p style="color:#aaa;font-size:13px;">Fin prévue : <strong style="color:#fff">${new Date(until).toLocaleDateString('fr-FR', { day:'numeric', month:'long', year:'numeric' })}</strong></p>` : '';
  const reasonBlock = reason ? `<div style="background:#1a1a2e;border:1px solid #333;border-radius:10px;padding:14px 18px;margin:16px 0;"><p style="color:#888;font-size:11px;margin:0 0 4px;">MOTIF</p><p style="color:#ccc;font-size:13px;margin:0;">${reason}</p></div>` : '';
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

function buildSupremeEmail({ name, status, reason, until }) {
  const cfg = STATUS_LABELS[status] || { fr: status, title: 'Statut mis à jour', emoji: '⚠️' };
  const untilBlock = until ? `<p style="color:#a08040;font-size:13px;">Fin prévue : <strong style="color:#f59e0b">${new Date(until).toLocaleDateString('fr-FR', { day:'numeric', month:'long', year:'numeric' })}</strong></p>` : '';
  const reasonBlock = reason ? `<div style="background:linear-gradient(135deg,rgba(245,158,11,0.07),rgba(217,119,6,0.04));border:1px solid rgba(217,119,6,0.35);border-radius:10px;padding:14px 18px;margin:16px 0;"><p style="color:#d97706;font-size:10px;font-weight:700;letter-spacing:2px;text-transform:uppercase;margin:0 0 6px;">MOTIF</p><p style="color:#c8943a;font-size:13px;margin:0;">${reason}</p></div>` : '';
  return `<!DOCTYPE html><html><body style="margin:0;padding:0;background:#0d0800;font-family:Inter,sans-serif;">
<div style="max-width:520px;margin:40px auto;background:linear-gradient(180deg,#1a0e00,#0d0800);border:1px solid #d97706;border-radius:16px;overflow:hidden;box-shadow:0 0 40px rgba(245,158,11,0.15);">
  <div style="background:linear-gradient(135deg,#2d1500,#1a0c00);padding:30px 32px;border-bottom:1px solid rgba(217,119,6,0.3);text-align:center;">
    <div style="display:inline-block;background:linear-gradient(135deg,#92400e,#d97706);padding:6px 16px;border-radius:20px;margin-bottom:14px;">
      <span style="font-size:10px;font-weight:700;letter-spacing:3px;text-transform:uppercase;color:#fde68a;">👑 RANG SUPRÊME</span>
    </div>
    <h1 style="color:#f59e0b;font-size:24px;margin:0;text-shadow:0 0 20px rgba(245,158,11,0.5);">${cfg.emoji} ${cfg.title}</h1>
  </div>
  <div style="padding:28px 32px;">
    <p style="color:#c8943a;font-size:14px;">Bonjour <strong style="background:linear-gradient(90deg,#f59e0b,#fde68a);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;">${name}</strong>,</p>
    <p style="color:#a08040;font-size:13px;line-height:1.6;">En tant que membre du <strong style="color:#f59e0b;">Rang Suprême</strong>, nous vous informons que votre compte a été <strong style="color:#d97706;">${cfg.fr}</strong> sur la plateforme Brenne Aerial.</p>
    ${reasonBlock}${untilBlock}
    <p style="color:#7a6030;font-size:12px;margin-top:20px;">Pour toute contestation prioritaire, contactez-nous à <a href="mailto:contact@brenneaerial.fr" style="color:#d97706;">contact@brenneaerial.fr</a></p>
  </div>
  <div style="padding:16px 32px;border-top:1px solid rgba(217,119,6,0.2);text-align:center;">
    <p style="color:#5a4010;font-size:11px;margin:0;">© Brenne Aerial — Membre Suprême</p>
  </div>
</div></body></html>`;
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

    // Fetch target user before update to detect status changes
    let targetUser = null;
    try { targetUser = await base44.asServiceRole.entities.User.get(id); } catch(_) {}

    const updated = await base44.asServiceRole.entities.User.update(id, data);

    // Send email if account status changed
    const restrictedStatuses = ['banned', 'suspended', 'restricted'];
    const statusChanged = data.account_status && data.account_status !== targetUser?.account_status;
    const isBeingRestricted = statusChanged && restrictedStatuses.includes(data.account_status);
    const isBeingRestored = statusChanged && data.account_status === 'active' && restrictedStatuses.includes(targetUser?.account_status);

    if ((isBeingRestricted || isBeingRestored) && targetUser?.email) {
      try {
        const isSupreme = (targetUser.verifications || []).includes('supreme');
        let html, subject;

        if (isBeingRestored) {
          if (isSupreme) {
            html = `<!DOCTYPE html><html><body style="margin:0;padding:0;background:#0d0800;font-family:Inter,sans-serif;">
<div style="max-width:520px;margin:40px auto;background:linear-gradient(180deg,#1a0e00,#0d0800);border:1px solid #d97706;border-radius:16px;overflow:hidden;box-shadow:0 0 40px rgba(245,158,11,0.15);">
  <div style="background:linear-gradient(135deg,#2d1500,#1a0c00);padding:30px 32px;border-bottom:1px solid rgba(217,119,6,0.3);text-align:center;">
    <div style="display:inline-block;background:linear-gradient(135deg,#92400e,#d97706);padding:6px 16px;border-radius:20px;margin-bottom:14px;">
      <span style="font-size:10px;font-weight:700;letter-spacing:3px;text-transform:uppercase;color:#fde68a;">&#128081; RANG SUPRÊME</span>
    </div>
    <h1 style="color:#f59e0b;font-size:24px;margin:0;text-shadow:0 0 20px rgba(245,158,11,0.5);">&#10003; Accès restauré</h1>
  </div>
  <div style="padding:28px 32px;">
    <p style="color:#c8943a;font-size:14px;">Bonjour <strong style="background:linear-gradient(90deg,#f59e0b,#fde68a);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;">${targetUser.full_name || 'Membre'}</strong>,</p>
    <p style="color:#a08040;font-size:13px;line-height:1.6;">En tant que membre du <strong style="color:#f59e0b;">Rang Suprême</strong>, nous avons le plaisir de vous informer que votre compte a été <strong style="color:#f59e0b;">pleinement restauré</strong>. Vous pouvez de nouveau accéder à l'ensemble de la plateforme.</p>
    <p style="color:#7a6030;font-size:12px;margin-top:20px;">Contactez-nous à <a href="mailto:contact@brenneaerial.fr" style="color:#d97706;">contact@brenneaerial.fr</a> pour toute question.</p>
  </div>
  <div style="padding:16px 32px;border-top:1px solid rgba(217,119,6,0.2);text-align:center;">
    <p style="color:#5a4010;font-size:11px;margin:0;">© Brenne Aerial — Membre Suprême</p>
  </div>
</div></body></html>`;
            subject = '👑 ✅ Accès restauré — Rang Suprême';
          } else {
            html = `<!DOCTYPE html><html><body style="margin:0;padding:0;background:#0a0a0f;font-family:Inter,sans-serif;">
<div style="max-width:520px;margin:40px auto;background:#111118;border:1px solid #222;border-radius:16px;overflow:hidden;">
  <div style="background:linear-gradient(135deg,#1a1a2e,#0f0f1a);padding:30px 32px;border-bottom:1px solid #222;">
    <p style="color:#38aae0;font-size:11px;font-weight:700;letter-spacing:3px;text-transform:uppercase;margin:0 0 8px;">BRENNE AERIAL</p>
    <h1 style="color:#4ade80;font-size:22px;margin:0;">&#10003; Accès restauré</h1>
  </div>
  <div style="padding:28px 32px;">
    <p style="color:#bbb;font-size:14px;">Bonjour <strong style="color:#fff;">${targetUser.full_name || 'Membre'}</strong>,</p>
    <p style="color:#999;font-size:13px;line-height:1.6;">Votre compte a été <strong style="color:#4ade80;">restauré</strong> et vous pouvez de nouveau accéder à l'ensemble de la plateforme Brenne Aerial.</p>
    <p style="color:#888;font-size:12px;margin-top:20px;">Une question ? Contactez-nous à <a href="mailto:contact@brenneaerial.fr" style="color:#38aae0;">contact@brenneaerial.fr</a></p>
  </div>
  <div style="padding:16px 32px;border-top:1px solid #222;text-align:center;">
    <p style="color:#555;font-size:11px;margin:0;">© Brenne Aerial — Plateforme drone professionnelle</p>
  </div>
</div></body></html>`;
            subject = '✅ Accès restauré — Brenne Aerial';
          }
        } else {
          const cfg = STATUS_LABELS[data.account_status];
          html = isSupreme
            ? buildSupremeEmail({ name: targetUser.full_name || 'Membre', status: data.account_status, reason: data.suspension_reason, until: data.suspension_until })
            : buildStandardEmail({ name: targetUser.full_name || 'Membre', status: data.account_status, reason: data.suspension_reason, until: data.suspension_until });
          subject = isSupreme ? `👑 ${cfg.emoji} ${cfg.title} — Rang Suprême` : `${cfg.emoji} ${cfg.title} — Brenne Aerial`;
        }

        await base44.asServiceRole.integrations.Core.SendEmail({ to: targetUser.email, subject, body: html });
      } catch(_) {}
    }

    return Response.json({ user: updated });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});