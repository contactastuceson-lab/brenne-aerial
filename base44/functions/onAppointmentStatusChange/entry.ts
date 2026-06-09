import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const SERVICE_LABELS = {
  video_evenement: 'Vidéo événement',
  inspection_toiture: 'Inspection toiture',
  suivi_chantier: 'Suivi chantier',
  captation_particulier: 'Captation particulier',
  captation_entreprise: 'Captation entreprise',
  retour_temps_reel: 'Retour temps réel',
  autre: 'Autre prestation',
};

const CONTACT_LABELS = {
  telephone: 'Téléphone',
  email: 'Email',
  presentiel: 'Présentiel',
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const payload = await req.json();

    const { data, old_data } = payload;

    // On ne fait rien si pas de client email
    if (!data?.client_email) return Response.json({ skipped: 'no client' });

    const newStatus = data.status;
    const oldStatus = old_data?.status;

    // On n'envoie un email que si le statut a vraiment changé
    if (newStatus === oldStatus) return Response.json({ skipped: 'same status' });

    const clientName = data.client_name || 'Client';
    const clientEmail = data.client_email;
    const dateLabel = data.date || '';
    const timeStart = data.time_start || '';
    const timeEnd = data.time_end || null;
    const serviceType = data.service_type || null;
    const location = data.location || null;
    const contactType = data.contact_type || null;
    const meetingAddress = data.meeting_address || null;
    const serviceLabel = SERVICE_LABELS[serviceType] || serviceType || 'prestation drone';
    const dateStr = `${dateLabel}${timeStart ? ' à ' + timeStart : ''}`;

    if (newStatus === 'scheduled') {
      await base44.asServiceRole.integrations.Core.SendEmail({
        to: clientEmail,
        subject: '✅ Votre rendez-vous est confirmé — Brenne Aerial',
        body: getHtmlAccepted(clientName, dateStr, timeEnd, contactType, meetingAddress, location),
      });
      await base44.asServiceRole.functions.invoke('sendWebPush', {
        user_email: clientEmail,
        title: '✅ Rendez-vous confirmé !',
        body: `Votre rendez-vous du ${dateStr} est confirmé.`,
        url: 'https://brenneaerial.fr/dashboard',
      }).catch(() => {});

      try {
        const appointment_id = payload.event?.entity_id;
        if (appointment_id) {
          await base44.asServiceRole.functions.invoke('syncAppointmentToOutlook', { appointment_id, data });
        }
      } catch (e) {
        console.error('Outlook sync failed:', e.message);
      }

    } else if (newStatus === 'cancelled') {
      await base44.asServiceRole.integrations.Core.SendEmail({
        to: clientEmail,
        subject: '❌ Votre demande de rendez-vous a été refusée — Brenne Aerial',
        body: getHtmlRefused(clientName, dateStr, serviceLabel, location),
      });
      await base44.asServiceRole.functions.invoke('sendWebPush', {
        user_email: clientEmail,
        title: '❌ Rendez-vous non retenu',
        body: `Votre demande du ${dateStr} n'a pas pu être acceptée.`,
        url: 'https://brenneaerial.fr/planning',
      }).catch(() => {});

    } else if (newStatus === 'completed') {
      await base44.asServiceRole.integrations.Core.SendEmail({
        to: clientEmail,
        subject: '✅ Merci pour votre confiance — Brenne Aerial',
        body: getHtmlCompleted(clientName, dateStr, serviceLabel),
      });
      await base44.asServiceRole.functions.invoke('sendWebPush', {
        user_email: clientEmail,
        title: '🚁 Prestation terminée !',
        body: `Merci pour votre confiance. Votre avis nous intéresse !`,
        url: 'https://brenneaerial.fr/dashboard',
      }).catch(() => {});
    }

    return Response.json({ success: true, newStatus });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
});

function getHtmlAccepted(name, dateStr, timeEnd, contactType, meetingAddress, location) {
  const contactLabel = CONTACT_LABELS[contactType] || contactType || 'À confirmer';
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><style>
    body{font-family:'Segoe UI',Arial,sans-serif;background:#f4f6fa;margin:0;padding:0;}
    .wrap{max-width:580px;margin:40px auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);}
    .header{background:linear-gradient(135deg,#0c4a6e 0%,#0369a1 100%);padding:36px 40px;text-align:center;}
    .header h1{color:#fff;font-size:22px;margin:0;font-weight:700;}
    .header p{color:#bae6fd;font-size:13px;margin:6px 0 0;}
    .badge{display:inline-block;background:#22c55e;color:#fff;padding:6px 16px;border-radius:20px;font-size:12px;font-weight:700;margin-bottom:24px;letter-spacing:1px;}
    .body{padding:36px 40px;}
    .body p{color:#374151;font-size:15px;line-height:1.7;margin:0 0 16px;}
    .info-box{background:#f0fdf4;border:1px solid #bbf7d0;border-radius:10px;padding:18px 22px;margin:20px 0;}
    .info-box p{margin:6px 0;font-size:14px;color:#374151;}
    .info-box strong{color:#15803d;}
    .footer{background:#f8fafc;padding:24px 40px;text-align:center;border-top:1px solid #e5e7eb;}
    .footer p{color:#94a3b8;font-size:12px;margin:4px 0;}
    .cta{display:inline-block;margin:20px 0;padding:12px 28px;background:#0ea5e9;color:#fff;text-decoration:none;border-radius:8px;font-weight:600;font-size:14px;}
  </style></head><body>
  <div class="wrap">
    <div class="header">
      <h1>🚁 Brenne Aerial</h1>
      <p>Solutions drone professionnelles</p>
    </div>
    <div class="body">
      <div style="text-align:center;margin-bottom:8px;"><span class="badge">RENDEZ-VOUS CONFIRMÉ</span></div>
      <p>Bonjour <strong>${name}</strong>,</p>
      <p>Votre demande de rendez-vous a été <strong>acceptée</strong>. Voici le récapitulatif :</p>
      <div class="info-box">
        <p>📅 <strong>Date :</strong> ${dateStr}${timeEnd ? ' → ' + timeEnd : ''}</p>
        <p>📞 <strong>Type de contact :</strong> ${contactLabel}</p>
        ${contactType === 'presentiel' && meetingAddress ? `<p>📍 <strong>Adresse :</strong> ${meetingAddress}</p>` : ''}
        ${location ? `<p>📍 <strong>Lieu :</strong> ${location}</p>` : ''}
      </div>
      <p>Nous vous contacterons prochainement pour confirmer les détails. En attendant, n'hésitez pas à nous contacter si vous avez des questions.</p>
      <div style="text-align:center;"><a class="cta" href="https://brenneaerial.fr/contact">Nous contacter</a></div>
    </div>
    <div class="footer">
      <p>Brenne Aerial · contact@brenneaerial.fr</p>
      <p>© 2026 Brenne Aerial — Tous droits réservés</p>
    </div>
  </div>
  </body></html>`;
}

function getHtmlRefused(name, dateStr, service, location) {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><style>
    body{font-family:'Segoe UI',Arial,sans-serif;background:#f4f6fa;margin:0;padding:0;}
    .wrap{max-width:580px;margin:40px auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);}
    .header{background:linear-gradient(135deg,#1a1a2e 0%,#16213e 100%);padding:36px 40px;text-align:center;}
    .header h1{color:#fff;font-size:22px;margin:0;font-weight:700;}
    .header p{color:#94a3b8;font-size:13px;margin:6px 0 0;}
    .badge{display:inline-block;background:#ef4444;color:#fff;padding:6px 16px;border-radius:20px;font-size:12px;font-weight:700;margin-bottom:24px;letter-spacing:1px;}
    .body{padding:36px 40px;}
    .body p{color:#374151;font-size:15px;line-height:1.7;margin:0 0 16px;}
    .info-box{background:#fef2f2;border:1px solid #fecaca;border-radius:10px;padding:18px 22px;margin:20px 0;}
    .info-box p{margin:4px 0;font-size:14px;color:#374151;}
    .footer{background:#f8fafc;padding:24px 40px;text-align:center;border-top:1px solid #e5e7eb;}
    .footer p{color:#94a3b8;font-size:12px;margin:4px 0;}
    .cta{display:inline-block;margin:20px 0;padding:12px 28px;background:#0ea5e9;color:#fff;text-decoration:none;border-radius:8px;font-weight:600;font-size:14px;}
  </style></head><body>
  <div class="wrap">
    <div class="header">
      <h1>Brenne Aerial</h1>
      <p>Solutions drone professionnelles</p>
    </div>
    <div class="body">
      <div style="text-align:center;margin-bottom:8px;"><span class="badge">DEMANDE NON RETENUE</span></div>
      <p>Bonjour <strong>${name}</strong>,</p>
      <p>Nous sommes désolés, mais nous ne sommes pas en mesure d'honorer votre demande de rendez-vous pour le créneau suivant :</p>
      <div class="info-box">
        <p>📅 <strong>Date demandée :</strong> ${dateStr}</p>
        ${location ? `<p>📍 <strong>Lieu :</strong> ${location}</p>` : ''}
      </div>
      <p>N'hésitez pas à consulter nos autres disponibilités ou à nous contacter pour trouver une autre solution.</p>
      <div style="text-align:center;"><a class="cta" href="https://brenneaerial.fr/planning">Voir les disponibilités</a></div>
    </div>
    <div class="footer">
      <p>Brenne Aerial · contact@brenneaerial.fr</p>
      <p>© 2026 Brenne Aerial — Tous droits réservés</p>
    </div>
  </div>
  </body></html>`;
}

function getHtmlCompleted(name, dateStr, service) {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><style>
    body{font-family:'Segoe UI',Arial,sans-serif;background:#f4f6fa;margin:0;padding:0;}
    .wrap{max-width:580px;margin:40px auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);}
    .header{background:linear-gradient(135deg,#0c4a6e 0%,#0369a1 100%);padding:36px 40px;text-align:center;}
    .header h1{color:#fff;font-size:22px;margin:0;font-weight:700;}
    .header p{color:#bae6fd;font-size:13px;margin:6px 0 0;}
    .badge{display:inline-block;background:#22c55e;color:#fff;padding:6px 16px;border-radius:20px;font-size:12px;font-weight:700;margin-bottom:24px;letter-spacing:1px;}
    .body{padding:36px 40px;}
    .body p{color:#374151;font-size:15px;line-height:1.7;margin:0 0 16px;}
    .footer{background:#f8fafc;padding:24px 40px;text-align:center;border-top:1px solid #e5e7eb;}
    .footer p{color:#94a3b8;font-size:12px;margin:4px 0;}
    .cta{display:inline-block;margin:20px 0;padding:12px 28px;background:#0ea5e9;color:#fff;text-decoration:none;border-radius:8px;font-weight:600;font-size:14px;}
  </style></head><body>
  <div class="wrap">
    <div class="header">
      <h1>Brenne Aerial</h1>
      <p>Solutions drone professionnelles</p>
    </div>
    <div class="body">
      <div style="text-align:center;margin-bottom:8px;"><span class="badge">PRESTATION TERMINÉE</span></div>
      <p>Bonjour <strong>${name}</strong>,</p>
      <p>Merci de nous avoir fait confiance pour votre prestation <strong>${service}</strong> du <strong>${dateStr}</strong>.</p>
      <p>Nous espérons que vous êtes satisfait(e) du résultat. N'hésitez pas à laisser un avis ou à nous contacter pour tout retour.</p>
      <div style="text-align:center;"><a class="cta" href="https://brenneaerial.fr/portfolio">Voir notre portfolio</a></div>
    </div>
    <div class="footer">
      <p>Brenne Aerial · contact@brenneaerial.fr</p>
      <p>© 2026 Brenne Aerial — Tous droits réservés</p>
    </div>
  </div>
  </body></html>`;
}