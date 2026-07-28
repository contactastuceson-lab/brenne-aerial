import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const LOGO_URL = 'https://media.base44.com/images/public/69c5c081406b9e20deaed582/6de51adde_1775602844308.png';

function standardEmailTemplate({ title, preheader, bodyHtml, ctaUrl, ctaLabel }) {
  return `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title></head>
<body style="margin:0;padding:0;background:#0a1120;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <div style="display:none;max-height:0;overflow:hidden;">${preheader || ''}</div>
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a1120;padding:40px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
        <tr><td align="center" style="background:#0d1a2e;border-radius:16px 16px 0 0;padding:32px 40px 24px;border-bottom:1px solid #1e3048;">
          <img src="${LOGO_URL}" width="110" alt="eza" style="display:block;margin:0 auto 12px;border-radius:50%;" />
          <p style="margin:0;font-size:11px;letter-spacing:3px;color:#3ab0dc;font-weight:700;text-transform:uppercase;">eza — Réseau social et communautés</p>
        </td></tr>
        <tr><td style="background:#0f1f36;padding:40px;">
          <h1 style="margin:0 0 20px;font-size:22px;font-weight:700;color:#e8f4fc;">${title}</h1>
          ${bodyHtml}
          ${ctaUrl ? `<div style="text-align:center;margin:32px 0 0;"><a href="${ctaUrl}" style="display:inline-block;background:#3ab0dc;color:#0a1120;font-weight:700;font-size:14px;padding:14px 32px;border-radius:10px;text-decoration:none;letter-spacing:0.5px;">${ctaLabel || 'Voir'}</a></div>` : ''}
        </td></tr>
        <tr><td align="center" style="background:#0d1a2e;border-radius:0 0 16px 16px;padding:24px 40px;border-top:1px solid #1e3048;">
          <p style="margin:0 0 6px;font-size:12px;color:#4a6a8a;">© 2026 eza · Réseau social et communautés</p>
          <p style="margin:0;font-size:11px;color:#3a5a7a;">France · <a href="mailto:contact@ezagroup.org" style="color:#3ab0dc;text-decoration:none;">contact@ezagroup.org</a></p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

function supremeEmailTemplate(userName) {
  return `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>eza — Rang Suprême</title></head>
<body style="margin:0;padding:0;background:#0d0800;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <div style="display:none;max-height:0;overflow:hidden;">Votre demande a été reçue avec toute l'attention qu'elle mérite.</div>
  <table width="100%" cellpadding="0" cellspacing="0" style="background:linear-gradient(180deg,#0d0800 0%,#120a00 100%);padding:40px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

        <!-- Header -->
        <tr><td align="center" style="background:linear-gradient(135deg,#1a0c00,#2d1500,#1a0c00);border-radius:16px 16px 0 0;padding:40px 40px 28px;border-bottom:1px solid rgba(217,119,6,0.4);">
          <div style="font-size:52px;line-height:1;margin-bottom:14px;">👑</div>
          <p style="margin:4px 0 2px;font-size:10px;letter-spacing:5px;color:#d97706;font-weight:800;text-transform:uppercase;">Rang Exclusif · Suprême</p>
          <p style="margin:0;font-size:10px;letter-spacing:3px;color:rgba(217,119,6,0.6);font-weight:600;text-transform:uppercase;">eza — Services Élite</p>
        </td></tr>

        <!-- Gold divider -->
        <tr><td style="height:2px;background:linear-gradient(90deg,transparent,#d97706,#f59e0b,#d97706,transparent);"></td></tr>

        <!-- Body -->
        <tr><td style="background:linear-gradient(145deg,#1a0c00,#150a00);padding:48px 40px;">
          <p style="margin:0 0 6px;font-size:10px;letter-spacing:4px;color:#d97706;text-transform:uppercase;font-weight:700;">Message Personnel</p>
          <h1 style="margin:0 0 28px;font-size:24px;font-weight:800;color:#f59e0b;">Votre demande a été transmise</h1>

          <p style="color:#c9a050;font-size:15px;line-height:1.8;margin:0 0 20px;">Bonjour <strong style="color:#fde68a;">${userName}</strong>,</p>

          <p style="color:#a08040;font-size:14px;line-height:1.8;margin:0 0 24px;">En tant que membre <strong style="color:#f59e0b;">Suprême</strong> de la communauté eza, votre demande de suppression de compte a été reçue avec toute l'attention et le respect qu'elle mérite.</p>

          <!-- Gold box -->
          <div style="background:linear-gradient(135deg,rgba(245,158,11,0.08),rgba(217,119,6,0.05));border:1px solid rgba(217,119,6,0.35);border-radius:12px;padding:24px 28px;margin:0 0 28px;">
            <p style="margin:0 0 10px;color:#f59e0b;font-size:13px;font-weight:800;letter-spacing:1px;">👑 RANG SUPRÊME — TRAITEMENT PRIORITAIRE</p>
            <p style="margin:0;color:#a08040;font-size:13px;line-height:1.7;">Votre demande sera traitée en <strong style="color:#fde68a;">priorité absolue</strong> par notre équipe. Un administrateur vous contactera personnellement avant toute action définitive.</p>
          </div>

          <div style="background:rgba(139,69,19,0.1);border-left:3px solid #d97706;border-radius:0 8px 8px 0;padding:16px 20px;margin:0 0 28px;">
            <p style="margin:0 0 6px;color:#d97706;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:1px;">⚠️ Action irréversible</p>
            <p style="margin:0;color:#a08040;font-size:13px;line-height:1.6;">Une fois confirmée, toutes vos données seront définitivement effacées de notre plateforme.</p>
          </div>

          <p style="color:#806030;font-size:13px;line-height:1.8;margin:0;">Si cette demande est une erreur, contactez immédiatement notre équipe à <a href="mailto:contact@ezagroup.org" style="color:#d97706;text-decoration:none;font-weight:600;">contact@ezagroup.org</a>. Nous ferons notre possible pour annuler le processus.</p>
        </td></tr>

        <!-- Gold divider -->
        <tr><td style="height:2px;background:linear-gradient(90deg,transparent,#d97706,#f59e0b,#d97706,transparent);"></td></tr>

        <!-- Footer -->
        <tr><td align="center" style="background:linear-gradient(135deg,#1a0c00,#0d0800);border-radius:0 0 16px 16px;padding:28px 40px;">
          <p style="margin:0 0 4px;font-size:10px;letter-spacing:3px;color:rgba(217,119,6,0.6);text-transform:uppercase;">eza · Rang Suprême</p>
          <p style="margin:0;font-size:11px;color:rgba(139,90,30,0.7);">France · <a href="mailto:contact@ezagroup.org" style="color:#d97706;text-decoration:none;">contact@ezagroup.org</a></p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body></html>`;
}

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { reason } = await req.json();

  // Check if there's already a pending request
  const existing = await base44.entities.DeletionRequest.filter({ user_email: user.email, status: 'pending' });
  if (existing.length > 0) {
    return Response.json({ error: 'Une demande est déjà en cours' }, { status: 400 });
  }

  // Create the deletion request
  await base44.entities.DeletionRequest.create({
    user_id: user.id,
    user_email: user.email,
    user_name: user.full_name || user.email,
    reason: reason || '',
    status: 'pending',
  });

  // Fetch full user profile to get custom fields like verifications
  const fullUser = await base44.asServiceRole.entities.User.filter({ email: user.email });
  const userVerifications = fullUser.length > 0 ? (fullUser[0].verifications || []) : [];
  const isSupreme = Array.isArray(userVerifications) && userVerifications.includes('supreme');

  // Send confirmation email to the user
  if (isSupreme) {
    await base44.integrations.Core.SendEmail({
      to: user.email,
      subject: '👑 Rang Suprême — Votre demande a été transmise · eza',
      body: supremeEmailTemplate(user.full_name || 'cher membre'),
    });
  } else {
    await base44.integrations.Core.SendEmail({
      to: user.email,
      subject: '⚠️ Demande de suppression de compte reçue — eza',
      body: standardEmailTemplate({
        title: 'Demande de suppression reçue',
        preheader: 'Nous avons bien reçu votre demande de suppression de compte.',
        bodyHtml: `
          <p style="color:#8aaec8;font-size:15px;line-height:1.7;margin:0 0 16px;">Bonjour <strong style="color:#e8f4fc;">${user.full_name || 'cher utilisateur'}</strong>,</p>
          <p style="color:#8aaec8;font-size:15px;line-height:1.7;margin:0 0 16px;">Nous avons bien reçu votre demande de <strong style="color:#e8f4fc;">suppression définitive</strong> de votre compte eza.</p>
          <div style="background:#0a1120;border-left:3px solid #f59e0b;border-radius:8px;padding:16px 20px;margin:20px 0;">
            <p style="margin:0;color:#f59e0b;font-size:13px;font-weight:700;">⚠️ Action irréversible</p>
            <p style="margin:6px 0 0;color:#8aaec8;font-size:13px;">Une fois traitée, toutes vos données seront définitivement supprimées.</p>
          </div>
          <p style="color:#8aaec8;font-size:15px;line-height:1.7;margin:0 0 8px;">Un administrateur examinera votre demande dans les meilleurs délais.</p>
          <p style="color:#8aaec8;font-size:14px;line-height:1.7;margin:0;">Si vous avez fait cette demande par erreur, contactez-nous rapidement à <a href="mailto:contact@ezagroup.org" style="color:#3ab0dc;">contact@ezagroup.org</a></p>
        `,
      }),
    });
  }

  // Notify admins
  const admins = await base44.asServiceRole.entities.User.filter({ role: 'admin' });
  for (const admin of admins) {
    if (admin.email) {
      await base44.integrations.Core.SendEmail({
        to: admin.email,
        subject: isSupreme ? `👑 [SUPRÊME] Demande de suppression — ${user.full_name || user.email}` : `🗑️ Nouvelle demande de suppression — ${user.full_name || user.email}`,
        body: standardEmailTemplate({
          title: 'Demande de suppression de compte',
          preheader: `${user.full_name || user.email} souhaite supprimer son compte.`,
          bodyHtml: `
            <p style="color:#8aaec8;font-size:15px;line-height:1.7;margin:0 0 20px;">${isSupreme ? '👑 Un membre <strong style="color:#f59e0b;">Suprême</strong> a demandé la suppression de son compte.' : 'Un utilisateur a demandé la suppression de son compte.'}</p>
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a1120;border-radius:10px;overflow:hidden;margin-bottom:20px;">
              <tr><td style="padding:12px 16px;border-bottom:1px solid #1e3048;">
                <span style="color:#4a6a8a;font-size:12px;display:block;margin-bottom:2px;">Utilisateur</span>
                <span style="color:#e8f4fc;font-size:14px;font-weight:600;">${user.full_name || '—'}</span>
              </td></tr>
              <tr><td style="padding:12px 16px;border-bottom:1px solid #1e3048;">
                <span style="color:#4a6a8a;font-size:12px;display:block;margin-bottom:2px;">Email</span>
                <span style="color:#3ab0dc;font-size:14px;">${user.email}</span>
              </td></tr>
              <tr><td style="padding:12px 16px;">
                <span style="color:#4a6a8a;font-size:12px;display:block;margin-bottom:2px;">Raison</span>
                <span style="color:#e8f4fc;font-size:14px;">${reason || 'Non précisée'}</span>
              </td></tr>
            </table>
          `,
          ctaUrl: 'https://eza.social/admin/users',
          ctaLabel: "→ Traiter dans l'administration",
        }),
      });
    }
  }

  return Response.json({ success: true });
});