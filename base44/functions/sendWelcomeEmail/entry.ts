import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const LOGO_URL = 'https://media.base44.com/images/public/69c5c081406b9e20deaed582/6de51adde_1775602844308.png';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);

  const user = await base44.auth.me();
  if (!user) return Response.json({ error: 'Non authentifié' }, { status: 401 });

  const userEmail = user.email;
  const userName = user.full_name || 'cher client';

  if (!userEmail) return Response.json({ error: 'Pas d\'email' }, { status: 400 });

  const body = `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Bienvenue chez Brenne Aerial</title></head>
<body style="margin:0;padding:0;background:#0a1120;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a1120;padding:40px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
        <tr><td align="center" style="background:#0d1a2e;border-radius:16px 16px 0 0;padding:32px 40px 24px;border-bottom:1px solid #1e3048;">
          <img src="${LOGO_URL}" width="110" alt="Brenne Aerial" style="display:block;margin:0 auto 12px;border-radius:50%;" />
          <p style="margin:0;font-size:11px;letter-spacing:3px;color:#3ab0dc;font-weight:700;text-transform:uppercase;">Brenne Aerial — Premium Drone Services</p>
        </td></tr>
        <tr><td style="background:#0f1f36;padding:40px;">
          <h1 style="margin:0 0 20px;font-size:24px;font-weight:700;color:#e8f4fc;">🎉 Bienvenue, ${userName} !</h1>
          <p style="color:#8aaec8;font-size:15px;line-height:1.8;margin:0 0 16px;">
            Votre compte <strong style="color:#e8f4fc;">Brenne Aerial</strong> vient d'être créé avec succès. Nous sommes ravis de vous accueillir sur notre plateforme.
          </p>
          <div style="background:#0a1120;border-left:3px solid #3ab0dc;border-radius:8px;padding:16px 20px;margin:0 0 24px;">
            <p style="margin:0 0 8px;color:#3ab0dc;font-size:13px;font-weight:700;">✈️ Ce que vous pouvez faire dès maintenant :</p>
            <ul style="margin:0;padding-left:18px;color:#8aaec8;font-size:13px;line-height:2;">
              <li>Demander un <strong style="color:#e8f4fc;">devis personnalisé</strong> pour votre projet</li>
              <li>Consulter notre <strong style="color:#e8f4fc;">portfolio</strong> de réalisations</li>
              <li>Prendre <strong style="color:#e8f4fc;">rendez-vous</strong> directement en ligne</li>
              <li>Suivre l'avancement de vos <strong style="color:#e8f4fc;">commandes</strong> depuis votre espace</li>
            </ul>
          </div>
          <div style="text-align:center;margin:0 0 24px;">
            <a href="https://brenneaerial.fr/dashboard" style="display:inline-block;background:#3ab0dc;color:#0a1120;font-weight:700;font-size:14px;padding:14px 32px;border-radius:10px;text-decoration:none;">
              Accéder à mon espace →
            </a>
          </div>
          <p style="color:#4a6a8a;font-size:13px;line-height:1.7;margin:0;">
            Une question ? Contactez-nous à <a href="mailto:contact@brenneaerial.fr" style="color:#3ab0dc;text-decoration:none;">contact@brenneaerial.fr</a>
          </p>
        </td></tr>
        <tr><td align="center" style="background:#0d1a2e;border-radius:0 0 16px 16px;padding:24px 40px;border-top:1px solid #1e3048;">
          <p style="margin:0 0 6px;font-size:12px;color:#4a6a8a;">© 2026 Brenne Aerial · Premium Drone Services</p>
          <p style="margin:0;font-size:11px;color:#3a5a7a;">Brenne, Creuse, France · <a href="mailto:contact@brenneaerial.fr" style="color:#3ab0dc;text-decoration:none;">contact@brenneaerial.fr</a></p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;

  await base44.integrations.Core.SendEmail({
    to: userEmail,
    subject: '🎉 Bienvenue chez Brenne Aerial !',
    body,
  });

  return Response.json({ success: true });
});