import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const LOGO_URL = 'https://media.base44.com/images/public/69c5c081406b9e20deaed582/6de51adde_1775602844308.png';

function buildVerifEmail(userName, code) {
  return `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><title>Vérification de votre adresse e-mail</title></head>
<body style="margin:0;padding:0;background:#0a1120;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a1120;padding:40px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
        <tr><td align="center" style="background:#0d1a2e;border-radius:16px 16px 0 0;padding:32px 40px 24px;border-bottom:1px solid #1e3048;">
          <img src="${LOGO_URL}" width="90" alt="eza" style="display:block;margin:0 auto 12px;border-radius:50%;" />
          <p style="margin:0;font-size:11px;letter-spacing:3px;color:#3ab0dc;font-weight:700;text-transform:uppercase;">eza — Vérification</p>
        </td></tr>
        <tr><td style="background:#0f1f36;padding:40px;text-align:center;">
          <p style="margin:0 0 8px;font-size:14px;color:#4a6a8a;">Bonjour ${userName},</p>
          <h1 style="margin:0 0 12px;font-size:20px;font-weight:700;color:#e8f4fc;">Confirmez votre adresse e-mail</h1>
          <p style="margin:0 0 32px;font-size:14px;color:#8aaec8;line-height:1.7;">Utilisez le code ci-dessous pour accéder à votre espace eza. Ce code est valable <strong style="color:#e8f4fc;">10 minutes</strong>.</p>
          <div style="display:inline-block;background:#1a3050;border:2px solid #3ab0dc;border-radius:16px;padding:24px 48px;margin:0 0 32px;">
            <span style="font-size:40px;font-weight:900;letter-spacing:12px;color:#3ab0dc;font-family:monospace;">${code}</span>
          </div>
          <p style="margin:0;font-size:12px;color:#3a5a7a;">Si vous n'êtes pas à l'origine de cette connexion, ignorez cet e-mail.</p>
        </td></tr>
        <tr><td align="center" style="background:#0d1a2e;border-radius:0 0 16px 16px;padding:24px 40px;border-top:1px solid #1e3048;">
          <p style="margin:0;font-size:12px;color:#4a6a8a;">© 2026 eza · <a href="mailto:contact@ezagroup.org" style="color:#3ab0dc;text-decoration:none;">contact@ezagroup.org</a></p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Non authentifié' }, { status: 401 });

    const code = String(Math.floor(100000 + Math.random() * 900000));
    const expires = Date.now() + 15 * 60 * 1000; // 15 minutes

    await base44.auth.updateMe({
      verification_code: code,
      verification_code_expires: String(expires),
    });

    await base44.asServiceRole.integrations.Core.SendEmail({
      to: user.email,
      subject: '🔐 Votre code de vérification eza',
      body: buildVerifEmail(user.full_name || 'cher client', code),
    });

    return Response.json({ success: true });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
});