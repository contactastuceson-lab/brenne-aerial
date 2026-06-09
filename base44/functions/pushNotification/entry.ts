import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const APP_URL = 'https://brenneaerial.fr';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const payload = await req.json();

    const message = payload.data;
    if (!message) return Response.json({ error: 'No message data' }, { status: 400 });

    // Skip demandes de contact en attente
    if (message.is_request && message.request_status === 'pending') {
      return Response.json({ skipped: 'pending_request' });
    }

    const senderName = message.sender_name || 'Quelqu\'un';
    const senderEmail = message.sender_email || '';
    const recipientEmail = message.recipient_email;
    const recipientName = message.recipient_name || '';
    const preview = (message.content || '').slice(0, 280);
    const isOfficial = message.is_official === true;

    if (!recipientEmail) return Response.json({ error: 'No recipient email' }, { status: 400 });

    // Vérifier les préférences de notification du destinataire
    try {
      const users = await base44.asServiceRole.entities.User.filter({ email: recipientEmail });
      const recipientUser = users?.[0] || null;
      const prefs = recipientUser?.notification_prefs || {};
      if (prefs.email_notifications === false) {
        return Response.json({ skipped: 'email_notifications_disabled' });
      }
      if (!isOfficial && prefs.new_messages === false) {
        return Response.json({ skipped: 'new_messages_disabled' });
      }
    } catch (_) {}

    let subject, body;

    if (isOfficial) {
      subject = `📢 Message officiel de Brenne Aerial`;
      body = `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Message officiel</title></head>
<body style="margin:0;padding:0;background-color:#030810;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#030810;padding:40px 16px;">
    <tr><td align="center">
      <table width="580" cellpadding="0" cellspacing="0" style="max-width:580px;width:100%;">

        <tr><td style="padding-bottom:28px;text-align:center;">
          <span style="font-size:13px;font-weight:700;letter-spacing:4px;text-transform:uppercase;color:#38aadc;">BRENNE AERIAL</span>
        </td></tr>

        <tr><td style="background:linear-gradient(160deg,#080f20,#0a1830,#06111e);border:1px solid rgba(56,170,220,0.35);border-radius:16px;overflow:hidden;">
          <tr><td style="height:4px;background:linear-gradient(90deg,#1a6aaa,#38aadc,#1dd8b4,#38aadc,#1a6aaa);display:block;"></td></tr>
          <tr><td style="padding:40px 44px;">
            <table cellpadding="0" cellspacing="0" style="margin-bottom:30px;width:100%;">
              <tr>
                <td style="vertical-align:middle;">
                  <div style="width:58px;height:58px;border-radius:14px;background:linear-gradient(135deg,#0e2848,#0a1e38);border:1.5px solid rgba(56,170,220,0.5);text-align:center;line-height:58px;font-size:26px;box-shadow:0 0 20px rgba(56,170,220,0.2);">🛡️</div>
                </td>
                <td style="vertical-align:middle;padding-left:18px;">
                  <div style="font-size:11px;font-weight:700;letter-spacing:3px;text-transform:uppercase;color:#38aadc;opacity:0.8;margin-bottom:4px;">Communication Officielle</div>
                  <div style="font-size:18px;font-weight:800;color:#e8edf5;">Brenne Aerial</div>
                </td>
                <td style="vertical-align:middle;text-align:right;">
                  <span style="background:linear-gradient(135deg,rgba(56,170,220,0.2),rgba(29,216,180,0.15));border:1px solid rgba(56,170,220,0.4);border-radius:20px;padding:6px 16px;font-size:11px;font-weight:700;color:#38aadc;letter-spacing:1.5px;text-transform:uppercase;">✦ OFFICIEL</span>
                </td>
              </tr>
            </table>
            <div style="height:1px;background:linear-gradient(90deg,transparent,rgba(56,170,220,0.3),transparent);margin-bottom:28px;"></div>
            <h1 style="margin:0 0 10px;font-size:26px;font-weight:900;color:#e8edf5;">Message de la direction</h1>
            <p style="margin:0 0 26px;font-size:14px;color:#5a7a9a;line-height:1.6;">
              ${recipientName ? `Bonjour <strong style="color:#a0c0d8;">${recipientName}</strong>,` : 'Bonjour,'} vous avez reçu un message officiel de l'équipe Brenne Aerial.
            </p>
            <div style="background:linear-gradient(135deg,rgba(14,40,80,0.6),rgba(10,26,56,0.5));border:1px solid rgba(56,170,220,0.2);border-left:4px solid #38aadc;border-radius:10px;padding:22px 24px;margin-bottom:10px;">
              <div style="font-size:10px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#38aadc;opacity:0.7;margin-bottom:12px;">MESSAGE</div>
              <p style="margin:0;font-size:14px;line-height:1.8;color:#c8d8e8;">${preview}${preview.length >= 280 ? '…' : ''}</p>
            </div>
            <p style="font-size:12px;color:#2e4a6a;margin:12px 0 32px;"><em>🔒 Ce message est en lecture seule — il n'est pas possible d'y répondre directement.</em></p>
            <table cellpadding="0" cellspacing="0">
              <tr><td style="border-radius:10px;background:linear-gradient(135deg,#0e3a6a,#1a5a9a);border:1px solid rgba(56,170,220,0.3);">
                <a href="${APP_URL}/messages" style="display:inline-block;padding:14px 32px;font-size:15px;font-weight:700;color:#e8edf5;text-decoration:none;">📬 Voir le message →</a>
              </td></tr>
            </table>
          </td></tr>
        </table>

        <tr><td style="padding-top:28px;text-align:center;">
          <p style="font-size:12px;color:#1e3050;margin:0;"><strong style="color:#2a4a7a;">Brenne Aerial</strong> · <a href="${APP_URL}" style="color:#2a5080;text-decoration:none;">brenneaerial.fr</a></p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
    } else {
      subject = `💬 ${senderName} vous a envoyé un message`;
      body = `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Nouveau message</title></head>
<body style="margin:0;padding:0;background-color:#060e1a;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#060e1a;padding:40px 16px;">
    <tr><td align="center">
      <table width="580" cellpadding="0" cellspacing="0" style="max-width:580px;width:100%;">

        <tr><td style="padding-bottom:28px;text-align:center;">
          <span style="font-size:13px;font-weight:700;letter-spacing:3px;text-transform:uppercase;color:#38aadc;opacity:0.8;">BRENNE AERIAL</span>
        </td></tr>

        <tr><td style="background:linear-gradient(145deg,#0c1a30,#0f2040);border:1px solid rgba(56,170,220,0.2);border-radius:16px;overflow:hidden;">
          <tr><td style="height:3px;background:linear-gradient(90deg,#38aadc,#1dd8b4,#38aadc);display:block;"></td></tr>
          <tr><td style="padding:36px 40px;">
            <table cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
              <tr>
                <td style="vertical-align:middle;">
                  <div style="width:52px;height:52px;border-radius:50%;background:linear-gradient(135deg,#1a3a5c,#0f2a44);border:2px solid rgba(56,170,220,0.4);text-align:center;line-height:52px;font-size:22px;font-weight:700;color:#38aadc;">${senderName.charAt(0).toUpperCase()}</div>
                </td>
                <td style="vertical-align:middle;padding-left:16px;">
                  <div style="font-size:16px;font-weight:700;color:#e8edf5;">${senderName}</div>
                  <div style="font-size:12px;color:#5a7a9a;margin-top:3px;">${senderEmail}</div>
                </td>
                <td style="vertical-align:middle;text-align:right;">
                  <span style="background:rgba(56,170,220,0.12);border:1px solid rgba(56,170,220,0.25);border-radius:20px;padding:5px 14px;font-size:11px;font-weight:600;color:#38aadc;letter-spacing:1px;text-transform:uppercase;">Message</span>
                </td>
              </tr>
            </table>
            <h1 style="margin:0 0 8px;font-size:24px;font-weight:800;color:#e8edf5;">Vous avez un nouveau message</h1>
            <p style="margin:0 0 24px;font-size:14px;color:#6a8aaa;line-height:1.5;">
              ${recipientName ? `Bonjour <strong style="color:#a0c0d8;">${recipientName}</strong>,` : 'Bonjour,'} <strong style="color:#a0c0d8;">${senderName}</strong> vous a envoyé un message sur Brenne Aerial.
            </p>
            <div style="background:rgba(10,22,40,0.7);border:1px solid rgba(56,170,220,0.15);border-left:3px solid #38aadc;border-radius:10px;padding:20px 22px;margin-bottom:32px;">
              <p style="margin:0;font-size:14px;line-height:1.7;color:#c8d8e8;font-style:italic;">"${preview}${preview.length >= 280 ? '…' : ''}"</p>
            </div>
            <table cellpadding="0" cellspacing="0">
              <tr><td style="border-radius:10px;background:linear-gradient(135deg,#38aadc,#1b8ab8);">
                <a href="${APP_URL}/messages" style="display:inline-block;padding:14px 32px;font-size:15px;font-weight:700;color:#fff;text-decoration:none;">💬 Répondre au message →</a>
              </td></tr>
            </table>
          </td></tr>
        </table>

        <tr><td style="padding-top:28px;text-align:center;">
          <p style="font-size:12px;color:#2a4060;margin:0;">Brenne Aerial · <a href="${APP_URL}" style="color:#38aadc;text-decoration:none;">brenneaerial.fr</a></p>
          <p style="font-size:11px;color:#1e3050;margin:6px 0 0;">Vous recevez cet email car quelqu'un vous a envoyé un message sur notre plateforme.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
    }

    await base44.asServiceRole.integrations.Core.SendEmail({
      to: recipientEmail,
      subject,
      body,
    });

    // Web push notification
    await base44.asServiceRole.functions.invoke('sendWebPush', {
      user_email: recipientEmail,
      title: isOfficial ? '📢 Message officiel de Brenne Aerial' : `💬 ${senderName} vous a écrit`,
      body: preview.slice(0, 100),
      url: `${APP_URL}/messages`,
    }).catch(() => {});

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});