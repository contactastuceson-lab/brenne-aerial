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

// ── Composants communs ──────────────────────────────────────────────────────
function emailWrapper(content) {
  return `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>Brenne Aerial</title></head>
<body style="margin:0;padding:0;background:#06080f;font-family:'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#06080f;padding:40px 16px;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

  <!-- Logo -->
  <tr><td style="padding-bottom:32px;text-align:center;">
    <div style="display:inline-flex;align-items:center;gap:10px;">
      <div style="width:36px;height:36px;border-radius:8px;background:linear-gradient(135deg,#38aadc,#1dd8b4);display:flex;align-items:center;justify-content:center;font-size:18px;">🚁</div>
      <span style="font-size:15px;font-weight:800;letter-spacing:3px;text-transform:uppercase;color:#e8edf5;">BRENNE <span style="color:#38aadc;">AERIAL</span></span>
    </div>
  </td></tr>

  ${content}

  <!-- Footer -->
  <tr><td style="padding-top:32px;text-align:center;border-top:1px solid rgba(56,170,220,0.08);margin-top:8px;">
    <p style="font-size:12px;color:#2e4a6a;margin:8px 0 4px;">
      <strong style="color:#38aadc;">Brenne Aerial</strong> · <a href="${APP_URL}" style="color:#38aadc;text-decoration:none;">brenneaerial.fr</a>
    </p>
    <p style="font-size:11px;color:#1e3050;margin:0;">Pour toute question, répondez à cet email ou contactez-nous sur notre site.</p>
  </td></tr>

</table>
</td></tr>
</table>
</body>
</html>`;
}

function infoRow(label, value) {
  return `<tr>
    <td style="padding:9px 16px;border-bottom:1px solid rgba(56,170,220,0.06);">
      <span style="font-size:11px;font-weight:600;letter-spacing:1px;text-transform:uppercase;color:#38aadc;opacity:0.7;">${label}</span>
    </td>
    <td style="padding:9px 16px;border-bottom:1px solid rgba(56,170,220,0.06);">
      <span style="font-size:13px;color:#c8d8e8;font-weight:500;">${value || '—'}</span>
    </td>
  </tr>`;
}

// ── Email 1 : Devis envoyé (confirmation au client) ─────────────────────────
function buildQuoteReceivedEmail({ clientName, serviceType, quoteId, dateStr, prix_estime }) {
  const service = SERVICE_LABELS[serviceType] || serviceType;
  const ref = (quoteId || '').slice(-6).toUpperCase();

  return emailWrapper(`
  <tr><td style="background:linear-gradient(145deg,#0c1828,#0f2040);border:1px solid rgba(56,170,220,0.2);border-radius:16px;overflow:hidden;">
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr><td style="height:3px;background:linear-gradient(90deg,#38aadc,#1dd8b4,#38aadc);"></td></tr>
      <tr><td style="padding:40px 44px;">

        <!-- Badge -->
        <div style="display:inline-block;padding:6px 16px;border-radius:30px;background:rgba(56,170,220,0.12);border:1px solid rgba(56,170,220,0.3);margin-bottom:24px;">
          <span style="font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#38aadc;">📋 Demande reçue</span>
        </div>

        <h1 style="margin:0 0 10px;font-size:26px;font-weight:900;color:#e8edf5;line-height:1.2;">
          Votre demande de devis<br/>a bien été reçue
        </h1>
        <p style="margin:0 0 28px;font-size:14px;color:#6a8aaa;line-height:1.6;">
          Bonjour <strong style="color:#a0c0d8;">${clientName}</strong>,<br/>
          Nous avons bien reçu votre demande et notre équipe va l'étudier dans les plus brefs délais. Vous serez notifié par email dès qu'une décision sera prise.
        </p>

        <!-- Récapitulatif -->
        <div style="border-radius:12px;overflow:hidden;border:1px solid rgba(56,170,220,0.15);margin-bottom:28px;">
          <div style="background:rgba(56,170,220,0.08);padding:12px 16px;">
            <span style="font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#38aadc;">Récapitulatif</span>
          </div>
          <table width="100%" cellpadding="0" cellspacing="0" style="background:rgba(8,16,32,0.6);">
            ${infoRow('Référence', '#' + ref)}
            ${infoRow('Prestation', service)}
            ${dateStr ? infoRow('Date souhaitée', dateStr) : ''}
            ${prix_estime ? infoRow('Estimation indicative', prix_estime + ' €') : ''}
          </table>
        </div>

        <!-- CTA -->
        <table cellpadding="0" cellspacing="0">
          <tr><td style="border-radius:10px;background:linear-gradient(135deg,#1a6aaa,#38aadc);">
            <a href="${APP_URL}/dashboard" style="display:inline-block;padding:14px 32px;font-size:15px;font-weight:700;color:#fff;text-decoration:none;">
              Suivre ma demande →
            </a>
          </td></tr>
        </table>

        <p style="margin:24px 0 0;font-size:12px;color:#2e4a6a;">Délai de réponse habituel : 24–48h ouvrées.</p>

      </td></tr>
    </table>
  </td></tr>`);
}

// ── Email 2 : Devis accepté ─────────────────────────────────────────────────
function buildQuoteAcceptedEmail({ clientName, serviceType, quoteId, prix_final, adminNotes }) {
  const service = SERVICE_LABELS[serviceType] || serviceType;
  const ref = (quoteId || '').slice(-6).toUpperCase();

  return emailWrapper(`
  <tr><td style="background:linear-gradient(145deg,#071a12,#0a2318);border:1px solid rgba(34,197,94,0.25);border-radius:16px;overflow:hidden;">
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr><td style="height:3px;background:linear-gradient(90deg,#16a34a,#22c55e,#4ade80,#22c55e,#16a34a);"></td></tr>
      <tr><td style="padding:40px 44px;">

        <!-- Icone succès -->
        <div style="width:64px;height:64px;border-radius:50%;background:rgba(34,197,94,0.12);border:2px solid rgba(34,197,94,0.3);text-align:center;line-height:64px;font-size:32px;margin-bottom:24px;">✅</div>

        <div style="display:inline-block;padding:6px 16px;border-radius:30px;background:rgba(34,197,94,0.12);border:1px solid rgba(34,197,94,0.3);margin-bottom:20px;">
          <span style="font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#22c55e;">Devis accepté</span>
        </div>

        <h1 style="margin:0 0 10px;font-size:26px;font-weight:900;color:#e8edf5;line-height:1.2;">
          Bonne nouvelle !<br/>Votre devis a été accepté
        </h1>
        <p style="margin:0 0 28px;font-size:14px;color:#6aaa7a;line-height:1.6;">
          Bonjour <strong style="color:#a0d8b0;">${clientName}</strong>,<br/>
          Nous avons le plaisir de vous informer que votre demande de prestation drone a été acceptée. Notre équipe vous contactera très prochainement pour finaliser les détails de l'intervention.
        </p>

        <!-- Récapitulatif -->
        <div style="border-radius:12px;overflow:hidden;border:1px solid rgba(34,197,94,0.15);margin-bottom:28px;">
          <div style="background:rgba(34,197,94,0.08);padding:12px 16px;">
            <span style="font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#22c55e;">Votre prestation</span>
          </div>
          <table width="100%" cellpadding="0" cellspacing="0" style="background:rgba(4,12,8,0.7);">
            ${infoRow('Référence', '#' + ref)}
            ${infoRow('Prestation', service)}
            ${prix_final ? `<tr>
              <td style="padding:9px 16px;border-bottom:1px solid rgba(34,197,94,0.06);">
                <span style="font-size:11px;font-weight:600;letter-spacing:1px;text-transform:uppercase;color:#22c55e;opacity:0.7;">Prix convenu</span>
              </td>
              <td style="padding:9px 16px;border-bottom:1px solid rgba(34,197,94,0.06);">
                <span style="font-size:18px;color:#4ade80;font-weight:800;">${prix_final} €</span>
              </td>
            </tr>` : ''}
            ${adminNotes ? infoRow('Message de notre équipe', adminNotes) : ''}
          </table>
        </div>

        <!-- CTA -->
        <table cellpadding="0" cellspacing="0">
          <tr><td style="border-radius:10px;background:linear-gradient(135deg,#15803d,#22c55e);">
            <a href="${APP_URL}/dashboard" style="display:inline-block;padding:14px 32px;font-size:15px;font-weight:700;color:#fff;text-decoration:none;">
              🎉 Voir ma prestation →
            </a>
          </td></tr>
        </table>

        <p style="margin:24px 0 0;font-size:12px;color:#1e4a2e;">Nous vous contacterons par email ou téléphone pour organiser l'intervention.</p>

      </td></tr>
    </table>
  </td></tr>`);
}

// ── Email 3 : Devis refusé ──────────────────────────────────────────────────
function buildQuoteRefusedEmail({ clientName, serviceType, quoteId, adminNotes }) {
  const service = SERVICE_LABELS[serviceType] || serviceType;
  const ref = (quoteId || '').slice(-6).toUpperCase();

  return emailWrapper(`
  <tr><td style="background:linear-gradient(145deg,#1a0a08,#200e0a);border:1px solid rgba(239,68,68,0.2);border-radius:16px;overflow:hidden;">
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr><td style="height:3px;background:linear-gradient(90deg,#991b1b,#ef4444,#fca5a5,#ef4444,#991b1b);"></td></tr>
      <tr><td style="padding:40px 44px;">

        <h1 style="margin:0 0 10px;font-size:26px;font-weight:900;color:#e8edf5;line-height:1.2;">
          Suite à votre demande de devis
        </h1>
        <p style="margin:0 0 28px;font-size:14px;color:#aa7a6a;line-height:1.6;">
          Bonjour <strong style="color:#d8b0a0;">${clientName}</strong>,<br/>
          Après examen de votre demande de prestation drone, nous sommes dans l'impossibilité de donner suite à votre demande dans les conditions souhaitées. Nous vous en remercions et restons disponibles pour toute future collaboration.
        </p>

        <!-- Récapitulatif -->
        <div style="border-radius:12px;overflow:hidden;border:1px solid rgba(239,68,68,0.15);margin-bottom:28px;">
          <div style="background:rgba(239,68,68,0.06);padding:12px 16px;">
            <span style="font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#ef4444;opacity:0.8;">Demande concernée</span>
          </div>
          <table width="100%" cellpadding="0" cellspacing="0" style="background:rgba(12,4,4,0.7);">
            ${infoRow('Référence', '#' + ref)}
            ${infoRow('Prestation', service)}
            ${adminNotes ? infoRow('Précision de notre équipe', adminNotes) : ''}
          </table>
        </div>

        <!-- Proposition alternative -->
        <div style="background:rgba(56,170,220,0.06);border:1px solid rgba(56,170,220,0.15);border-left:3px solid #38aadc;border-radius:10px;padding:18px 20px;margin-bottom:28px;">
          <p style="margin:0 0 8px;font-size:13px;font-weight:700;color:#a0c0d8;">Nous restons à votre disposition</p>
          <p style="margin:0;font-size:13px;color:#6a8aaa;line-height:1.6;">
            N'hésitez pas à soumettre une nouvelle demande avec des dates ou critères différents, ou à nous contacter directement pour en discuter.
          </p>
        </div>

        <!-- CTA -->
        <table cellpadding="0" cellspacing="0">
          <tr><td style="border-radius:10px;background:linear-gradient(135deg,#1a5a8a,#38aadc);">
            <a href="${APP_URL}/quote" style="display:inline-block;padding:14px 32px;font-size:15px;font-weight:700;color:#fff;text-decoration:none;">
              Faire une nouvelle demande →
            </a>
          </td></tr>
        </table>

      </td></tr>
    </table>
  </td></tr>`);
}

// ── Email 4 : Confirmation de réservation planning ──────────────────────────
function buildAppointmentConfirmedEmail({ clientName, date, timeStart, timeEnd, serviceType, location, notes }) {
  const service = SERVICE_LABELS[serviceType] || serviceType || 'Prestation drone';

  return emailWrapper(`
  <tr><td style="background:linear-gradient(145deg,#080c1a,#0c1428);border:1px solid rgba(56,170,220,0.25);border-radius:16px;overflow:hidden;">
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr><td style="height:3px;background:linear-gradient(90deg,#38aadc,#1dd8b4,#38aadc);"></td></tr>
      <tr><td style="padding:40px 44px;">

        <!-- Header icone -->
        <div style="width:64px;height:64px;border-radius:16px;background:rgba(56,170,220,0.12);border:2px solid rgba(56,170,220,0.3);text-align:center;line-height:64px;font-size:30px;margin-bottom:24px;">📅</div>

        <div style="display:inline-block;padding:6px 16px;border-radius:30px;background:rgba(56,170,220,0.12);border:1px solid rgba(56,170,220,0.3);margin-bottom:20px;">
          <span style="font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#38aadc;">Réservation confirmée</span>
        </div>

        <h1 style="margin:0 0 10px;font-size:26px;font-weight:900;color:#e8edf5;line-height:1.2;">
          Votre créneau est réservé !
        </h1>
        <p style="margin:0 0 28px;font-size:14px;color:#6a8aaa;line-height:1.6;">
          Bonjour <strong style="color:#a0c0d8;">${clientName}</strong>,<br/>
          Votre réservation a bien été enregistrée. Retrouvez ci-dessous le récapitulatif de votre intervention drone.
        </p>

        <!-- Créneau mise en avant -->
        <div style="background:linear-gradient(135deg,rgba(56,170,220,0.1),rgba(29,216,180,0.06));border:1px solid rgba(56,170,220,0.25);border-radius:14px;padding:24px;margin-bottom:20px;text-align:center;">
          <p style="margin:0 0 6px;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#38aadc;opacity:0.7;">Date &amp; Heure</p>
          <p style="margin:0 0 4px;font-size:28px;font-weight:900;color:#e8edf5;">${date}</p>
          <p style="margin:0;font-size:18px;font-weight:700;color:#38aadc;">${timeStart}${timeEnd ? ' → ' + timeEnd : ''}</p>
        </div>

        <!-- Détails -->
        <div style="border-radius:12px;overflow:hidden;border:1px solid rgba(56,170,220,0.12);margin-bottom:28px;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background:rgba(8,14,28,0.7);">
            ${infoRow('Prestation', service)}
            ${location ? infoRow('Lieu', location) : ''}
            ${notes ? infoRow('Notes', notes) : ''}
          </table>
        </div>

        <!-- CTA -->
        <table cellpadding="0" cellspacing="0">
          <tr><td style="border-radius:10px;background:linear-gradient(135deg,#1a6aaa,#38aadc);">
            <a href="${APP_URL}/dashboard" style="display:inline-block;padding:14px 32px;font-size:15px;font-weight:700;color:#fff;text-decoration:none;">
              Voir mon rendez-vous →
            </a>
          </td></tr>
        </table>

        <p style="margin:24px 0 0;font-size:12px;color:#2e4a6a;">Pour toute modification ou annulation, contactez-nous à l'avance.</p>

      </td></tr>
    </table>
  </td></tr>`);
}

// ── Handler ─────────────────────────────────────────────────────────────────
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const { type, ...data } = body;

    // Auth minimal — certains appels viennent de l'admin
    // On utilise asServiceRole pour l'envoi

    let subject, html;

    if (type === 'quote_received') {
      subject = `📋 Demande de devis reçue — Brenne Aerial (#${(data.quoteId || '').slice(-6).toUpperCase()})`;
      html = buildQuoteReceivedEmail(data);
    } else if (type === 'quote_accepted') {
      subject = `✅ Votre devis a été accepté — Brenne Aerial`;
      html = buildQuoteAcceptedEmail(data);
    } else if (type === 'quote_refused') {
      subject = `Mise à jour de votre demande — Brenne Aerial`;
      html = buildQuoteRefusedEmail(data);
    } else if (type === 'appointment_confirmed') {
      subject = `📅 Votre réservation est confirmée — Brenne Aerial`;
      html = buildAppointmentConfirmedEmail(data);
    } else {
      return Response.json({ error: 'Unknown email type' }, { status: 400 });
    }

    await base44.asServiceRole.integrations.Core.SendEmail({
      to: data.clientEmail,
      subject,
      body: html,
    });

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});