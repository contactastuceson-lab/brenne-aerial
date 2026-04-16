import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const LOGO_URL = 'https://media.base44.com/images/public/69c5c081406b9e20deaed582/6de51adde_1775602844308.png';

function buildEmail(userName, subject, message, senderName, senderRole, attachments = []) {
  const images = attachments.filter(a => a.type?.startsWith('image/'));
  const files = attachments.filter(a => !a.type?.startsWith('image/'));

  const imagesBlock = images.length ? `
    <div style="margin:20px 0;display:flex;flex-wrap:wrap;gap:10px;">
      ${images.map(img => `<img src="${img.url}" style="max-width:100%;border-radius:10px;border:1px solid #1e3048;" alt="${img.name}" />`).join('')}
    </div>` : '';

  const filesBlock = files.length ? `
    <div style="margin:16px 0;">
      <p style="margin:0 0 8px;font-size:13px;color:#4a6a8a;">Pièces jointes :</p>
      ${files.map(f => `<a href="${f.url}" style="display:inline-block;margin:4px;padding:8px 14px;background:#1a3050;border:1px solid #1e3048;border-radius:8px;color:#3ab0dc;font-size:13px;text-decoration:none;">📎 ${f.name}</a>`).join('')}
    </div>` : '';

  const paragraphs = message.split('\n').filter(l => l.trim()).map(l =>
    `<p style="margin:0 0 14px;color:#8aaec8;font-size:15px;line-height:1.8;">${l}</p>`
  ).join('');

  return `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${subject}</title></head>
<body style="margin:0;padding:0;background:#0a1120;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a1120;padding:40px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
        <tr><td align="center" style="background:#0d1a2e;border-radius:16px 16px 0 0;padding:32px 40px 24px;border-bottom:1px solid #1e3048;">
          <img src="${LOGO_URL}" width="110" alt="Brenne Aerial" style="display:block;margin:0 auto 12px;border-radius:50%;" />
          <p style="margin:0;font-size:11px;letter-spacing:3px;color:#3ab0dc;font-weight:700;text-transform:uppercase;">Brenne Aerial — Premium Drone Services</p>
        </td></tr>
        <tr><td style="background:#0f1f36;padding:40px;">
          <p style="margin:0 0 8px;font-size:13px;color:#4a6a8a;">Bonjour ${userName},</p>
          <h1 style="margin:0 0 24px;font-size:22px;font-weight:700;color:#e8f4fc;">${subject}</h1>
          ${paragraphs}
          ${imagesBlock}
          ${filesBlock}
          <div style="margin:32px 0 0;border-top:1px solid #1e3048;padding-top:24px;">
            <table cellpadding="0" cellspacing="0"><tr>
              <td style="padding-right:14px;vertical-align:middle;">
                <div style="width:44px;height:44px;border-radius:50%;background:#1a3050;border:2px solid #3ab0dc;text-align:center;font-size:20px;line-height:44px;">✈️</div>
              </td>
              <td>
                <p style="margin:0;font-size:14px;font-weight:700;color:#e8f4fc;">${senderName}</p>
                <p style="margin:2px 0 0;font-size:12px;color:#3ab0dc;">${senderRole} · Brenne Aerial</p>
              </td>
            </tr></table>
          </div>
          <div style="text-align:center;margin:28px 0 0;">
            <a href="https://brenneaerial.fr/dashboard" style="display:inline-block;background:#3ab0dc;color:#0a1120;font-weight:700;font-size:14px;padding:14px 32px;border-radius:10px;text-decoration:none;">Accéder à mon espace →</a>
          </div>
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
  try {
    const body = await req.json();
    console.log('Body parsed:', JSON.stringify(body).slice(0, 100));

    const base44 = createClientFromRequest(req);

    const user = await base44.auth.me();
    console.log('User:', user?.email, user?.role);

    if (!user || (user.role !== 'admin' && user.role !== 'owner')) {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const { subject, message, senderName, senderRole, recipients, attachments = [] } = body;

    if (!subject || !message || !recipients?.length) {
      return Response.json({ error: 'Paramètres manquants' }, { status: 400 });
    }

    console.log(`Sending to ${recipients.length} recipients...`);

    let sent = 0;
    for (const recipient of recipients) {
      console.log('Sending to:', recipient.email);
      const html = buildEmail(recipient.name || 'cher client', subject, message, senderName, senderRole, attachments);
      await base44.asServiceRole.integrations.Core.SendEmail({
        to: recipient.email,
        subject,
        body: html,
      });
      sent++;
      console.log('Sent to:', recipient.email);
    }

    return Response.json({ success: true, sent });
  } catch (err) {
    console.error('Error:', err.message, err.stack);
    return Response.json({ error: err.message }, { status: 500 });
  }
});