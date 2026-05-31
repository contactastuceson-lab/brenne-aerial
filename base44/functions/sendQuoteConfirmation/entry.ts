import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const APP_URL = Deno.env.get('APP_URL') || 'https://brenneaerial.fr';

const SERVICE_LABELS = {
  video_evenement: 'Vidéo événement',
  inspection_toiture: 'Inspection toiture',
  suivi_chantier: 'Suivi chantier',
  captation_particulier: 'Captation particulier',
  captation_entreprise: 'Captation entreprise',
  retour_temps_reel: 'Retour temps réel',
  autre: 'Autre prestation',
};

Deno.serve(async (req) => {
  try {
    const body = await req.json();
    const base44 = createClientFromRequest(req);

    const { clientName, clientEmail, serviceType, estimatedPrice, dateStr, quoteId } = body;

    if (!clientEmail || !clientName) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Notification admin (best effort)
    try {
      const admins = await base44.asServiceRole.entities.User.filter({ role: 'admin' });
      for (const admin of admins) {
        await base44.asServiceRole.entities.Notification.create({
          user_email: admin.email,
          title: `📋 Nouveau devis de ${clientName}`,
          content: `Service: ${SERVICE_LABELS[serviceType] || serviceType} | Email: ${clientEmail}${estimatedPrice ? ` | Estimé: ${estimatedPrice}€` : ''}`,
          type: 'quote_pending',
          link: '/admin/quotes',
        });
      }
    } catch (_) { /* ignore */ }

    // Email de confirmation au client
    const ref = (quoteId || '').slice(-6).toUpperCase();
    const service = SERVICE_LABELS[serviceType] || serviceType;
    const APP_URL_VAL = Deno.env.get('APP_URL') || 'https://brenneaerial.fr';

    const html = `<!DOCTYPE html>
<html lang="fr"><head><meta charset="UTF-8"><title>Brenne Aerial</title></head>
<body style="margin:0;padding:0;background:#06080f;font-family:'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#06080f;padding:40px 16px;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
  <tr><td style="padding-bottom:32px;text-align:center;">
    <span style="font-size:15px;font-weight:800;letter-spacing:3px;text-transform:uppercase;color:#e8edf5;">BRENNE <span style="color:#38aadc;">AERIAL</span></span>
  </td></tr>
  <tr><td style="background:linear-gradient(145deg,#0c1828,#0f2040);border:1px solid rgba(56,170,220,0.2);border-radius:16px;padding:40px;">
    <div style="display:inline-block;padding:6px 16px;border-radius:30px;background:rgba(56,170,220,0.12);border:1px solid rgba(56,170,220,0.3);margin-bottom:24px;">
      <span style="font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#38aadc;">📋 Demande reçue</span>
    </div>
    <h1 style="margin:0 0 10px;font-size:24px;font-weight:900;color:#e8edf5;">Votre demande de devis a bien été reçue</h1>
    <p style="font-size:14px;color:#6a8aaa;line-height:1.6;">Bonjour <strong style="color:#a0c0d8;">${clientName}</strong>,<br/>Notre équipe va étudier votre demande et vous répondra sous 24–48h ouvrées.</p>
    <table width="100%" cellpadding="0" cellspacing="0" style="background:rgba(8,16,32,0.6);border-radius:10px;border:1px solid rgba(56,170,220,0.12);margin:20px 0;">
      <tr><td style="padding:10px 16px;border-bottom:1px solid rgba(56,170,220,0.06);"><span style="font-size:11px;color:#38aadc;">Référence</span></td><td style="padding:10px 16px;border-bottom:1px solid rgba(56,170,220,0.06);"><span style="font-size:13px;color:#c8d8e8;">#${ref || 'N/A'}</span></td></tr>
      <tr><td style="padding:10px 16px;border-bottom:1px solid rgba(56,170,220,0.06);"><span style="font-size:11px;color:#38aadc;">Prestation</span></td><td style="padding:10px 16px;border-bottom:1px solid rgba(56,170,220,0.06);"><span style="font-size:13px;color:#c8d8e8;">${service}</span></td></tr>
      ${dateStr ? `<tr><td style="padding:10px 16px;border-bottom:1px solid rgba(56,170,220,0.06);"><span style="font-size:11px;color:#38aadc;">Date souhaitée</span></td><td style="padding:10px 16px;border-bottom:1px solid rgba(56,170,220,0.06);"><span style="font-size:13px;color:#c8d8e8;">${dateStr}</span></td></tr>` : ''}
      ${estimatedPrice ? `<tr><td style="padding:10px 16px;"><span style="font-size:11px;color:#38aadc;">Estimation</span></td><td style="padding:10px 16px;"><span style="font-size:13px;color:#c8d8e8;">${estimatedPrice} €</span></td></tr>` : ''}
    </table>
    <a href="${APP_URL_VAL}/dashboard" style="display:inline-block;padding:14px 32px;font-size:15px;font-weight:700;color:#fff;text-decoration:none;border-radius:10px;background:linear-gradient(135deg,#1a6aaa,#38aadc);">Suivre ma demande →</a>
  </td></tr>
  <tr><td style="padding-top:24px;text-align:center;">
    <p style="font-size:12px;color:#2e4a6a;margin:0;"><strong style="color:#38aadc;">Brenne Aerial</strong> · <a href="${APP_URL_VAL}" style="color:#38aadc;text-decoration:none;">brenneaerial.fr</a></p>
  </td></tr>
</table>
</td></tr>
</table>
</body></html>`;

    // Use the sendQuoteEmail function which handles external emails
    await base44.asServiceRole.functions.invoke('sendQuoteEmail', {
      clientName,
      clientEmail,
      serviceType,
      estimatedPrice,
      dateStr,
      quoteId: ref,
      emailType: 'received',
    });

    return Response.json({ success: true });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
});