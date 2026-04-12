import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const LOGO_URL = 'https://media.base44.com/images/public/69c5c081406b9e20deaed582/6de51adde_1775602844308.png';

function emailTemplate({ title, preheader, bodyHtml }) {
  return `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title></head>
<body style="margin:0;padding:0;background:#0a1120;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <div style="display:none;max-height:0;overflow:hidden;">${preheader || ''}</div>
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a1120;padding:40px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
        <tr><td align="center" style="background:#0d1a2e;border-radius:16px 16px 0 0;padding:32px 40px 24px;border-bottom:1px solid #1e3048;">
          <img src="${LOGO_URL}" width="110" alt="Brenne Aerial" style="display:block;margin:0 auto 12px;border-radius:50%;" />
          <p style="margin:0;font-size:11px;letter-spacing:3px;color:#3ab0dc;font-weight:700;text-transform:uppercase;">Brenne Aerial — Premium Drone Services</p>
        </td></tr>
        <tr><td style="background:#0f1f36;padding:40px;">
          <h1 style="margin:0 0 20px;font-size:22px;font-weight:700;color:#e8f4fc;">${title}</h1>
          ${bodyHtml}
        </td></tr>
        <tr><td align="center" style="background:#0d1a2e;border-radius:0 0 16px 16px;padding:24px 40px;border-top:1px solid #1e3048;">
          <p style="margin:0 0 6px;font-size:12px;color:#4a6a8a;">© 2026 Brenne Aerial · Premium Drone Services</p>
          <p style="margin:0;font-size:11px;color:#3a5a7a;">Brenne, Creuse, France · <a href="mailto:contact@brenneaerial.fr" style="color:#3ab0dc;text-decoration:none;">contact@brenneaerial.fr</a></p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();
  if (!user || user.role !== 'admin') {
    return Response.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { requestId, userEmail, userName } = await req.json();
  if (!requestId) return Response.json({ error: 'requestId requis' }, { status: 400 });

  // Mark as cancelled (refused)
  await base44.asServiceRole.entities.DeletionRequest.update(requestId, { status: 'cancelled' });

  // Send refusal email to user
  await base44.integrations.Core.SendEmail({
    to: userEmail,
    subject: '❌ Demande de suppression de compte refusée — Brenne Aerial',
    body: emailTemplate({
      title: 'Demande de suppression refusée',
      preheader: 'Votre demande de suppression de compte a été refusée par un administrateur.',
      bodyHtml: `
        <p style="color:#8aaec8;font-size:15px;line-height:1.7;margin:0 0 16px;">Bonjour <strong style="color:#e8f4fc;">${userName || 'cher utilisateur'}</strong>,</p>
        <p style="color:#8aaec8;font-size:15px;line-height:1.7;margin:0 0 16px;">Suite à l'examen de votre dossier, votre demande de suppression de compte a été <strong style="color:#e8f4fc;">refusée</strong> par notre équipe.</p>
        <div style="background:#0a1120;border-left:3px solid #3ab0dc;border-radius:8px;padding:16px 20px;margin:20px 0;">
          <p style="margin:0;color:#3ab0dc;font-size:13px;font-weight:700;">ℹ️ Vous pouvez renouveler votre demande</p>
          <p style="margin:6px 0 0;color:#8aaec8;font-size:13px;">Si vous souhaitez toujours supprimer votre compte, vous pouvez soumettre une nouvelle demande depuis votre espace personnel.</p>
        </div>
        <p style="color:#8aaec8;font-size:14px;line-height:1.7;margin:0;">Pour toute question, contactez-nous à <a href="mailto:contact@brenneaerial.fr" style="color:#3ab0dc;">contact@brenneaerial.fr</a></p>
      `,
    }),
  });

  return Response.json({ success: true });
});