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
  const isOwner = user?.role === 'owner' || user?.email === 'contact.astuceson@gmail.com';
  if (!user || (user.role !== 'admin' && !isOwner)) {
    return Response.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { userId, userEmail, userName, reason } = await req.json();
  if (!userId) return Response.json({ error: 'userId requis' }, { status: 400 });

  // Delete the user
  try {
    await base44.asServiceRole.entities.User.delete(userId);
  } catch (e) {
    if (e?.status === 403 || e?.message?.includes('owner')) {
      return Response.json({ error: 'Impossible de supprimer le propriétaire de l\'application.' }, { status: 403 });
    }
    throw e;
  }

  // Check if there was a pending deletion request
  let hadRequest = false;
  if (userEmail) {
    const requests = await base44.asServiceRole.entities.DeletionRequest.filter({ user_email: userEmail, status: 'pending' });
    for (const r of requests) {
      await base44.asServiceRole.entities.DeletionRequest.update(r.id, { status: 'processed' });
    }
    hadRequest = requests.length > 0;
  }

  // Send email to user
  if (userEmail) {
    try {
      const isAdminInitiated = !hadRequest;
      const bodyHtml = isAdminInitiated ? `
        <p style="color:#8aaec8;font-size:15px;line-height:1.7;margin:0 0 16px;">Bonjour <strong style="color:#e8f4fc;">${userName || ''}</strong>,</p>
        <div style="background:#0a1120;border-left:3px solid #e55555;border-radius:8px;padding:16px 20px;margin:0 0 20px;">
          <p style="margin:0;color:#e55555;font-size:13px;font-weight:700;">🔴 Votre compte a été supprimé par un administrateur</p>
          ${reason ? `<p style="margin:6px 0 0;color:#8aaec8;font-size:13px;"><strong style="color:#e8f4fc;">Raison :</strong> ${reason}</p>` : ''}
        </div>
        <p style="color:#8aaec8;font-size:15px;line-height:1.7;margin:0 0 16px;">Toutes vos données personnelles ont été <strong style="color:#e8f4fc;">définitivement effacées</strong> de notre plateforme.</p>
        <p style="color:#8aaec8;font-size:14px;line-height:1.7;margin:0;">Si vous pensez qu'il s'agit d'une erreur ou souhaitez plus d'informations, contactez-nous à <a href="mailto:contact@brenneaerial.fr" style="color:#3ab0dc;">contact@brenneaerial.fr</a></p>
      ` : `
        <p style="color:#8aaec8;font-size:15px;line-height:1.7;margin:0 0 16px;">Bonjour <strong style="color:#e8f4fc;">${userName || ''}</strong>,</p>
        <div style="background:#0a1120;border-left:3px solid #22c55e;border-radius:8px;padding:16px 20px;margin:0 0 20px;">
          <p style="margin:0;color:#22c55e;font-size:13px;font-weight:700;">✅ Suppression effectuée</p>
          <p style="margin:6px 0 0;color:#8aaec8;font-size:13px;">Votre compte a bien été supprimé conformément à votre demande.</p>
        </div>
        <p style="color:#8aaec8;font-size:15px;line-height:1.7;margin:0 0 16px;">Toutes vos données personnelles ont été <strong style="color:#e8f4fc;">définitivement effacées</strong> de notre plateforme.</p>
        <p style="color:#8aaec8;font-size:14px;line-height:1.7;margin:0;">Nous vous remercions d'avoir fait confiance à Brenne Aerial. Contactez-nous à <a href="mailto:contact@brenneaerial.fr" style="color:#3ab0dc;">contact@brenneaerial.fr</a></p>
      `;

      await base44.integrations.Core.SendEmail({
        to: userEmail,
        subject: isAdminInitiated ? '🔴 Votre compte Brenne Aerial a été supprimé' : '✅ Votre compte Brenne Aerial a été supprimé',
        body: emailTemplate({
          title: 'Compte supprimé',
          preheader: 'Votre compte Brenne Aerial a été supprimé.',
          bodyHtml,
        }),
      });
    } catch (_) { /* best effort */ }
  }

  return Response.json({ success: true });
});