import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const PAGE_LABELS = {
  page_homepage_enabled:       'Page Accueil',
  page_services_enabled:       'Page Services',
  page_portfolio_enabled:      'Page Portfolio',
  page_blog_enabled:           'Page Blog',
  page_contact_enabled:        'Page Contact',
  page_quote_enabled:          'Page Devis',
  page_planning_enabled:       'Page Planning',
  page_discover_enabled:       'Page Découvrir',
  page_messages_enabled:       'Page Messages',
  page_espace_client_enabled:  'Espace Client',
  page_partenaires_enabled:    'Page Partenaires',
  page_parrainage_enabled:     'Page Parrainage',
  page_avant_apres_enabled:    'Page Avant/Après',
  page_certification_enabled:  'Système de Certification',
  page_donation_enabled:       'Page Donation',
  page_garage_enabled:         'Page Garage',
  page_calculator_enabled:     'Calculateur de Devis',
  page_reglementation_enabled: 'Page Réglementation',
  page_simulateur_enabled:     'Simulateur de Vue',
  page_comparateur_enabled:    'Comparateur de Résolution',
  page_flash_enabled:          'Flash Delivery',
  messaging_enabled:           'Messagerie inter-membres',
  registration_open:           'Inscriptions',
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const { mode, settingKey, enabled } = body.payload ?? body;

    const users = await base44.asServiceRole.entities.User.list();
    const usersToNotify = users.filter(u => u.email);
    const now = new Date().toLocaleString('fr-FR', { timeZone: 'Europe/Paris', dateStyle: 'full', timeStyle: 'short' });

    let emailBody, subject;

    // ── MODE SUMMARY : récap de tous les systèmes en panne ──
    if (mode === 'summary') {
      const { downServices = [] } = body.payload ?? body;

      const rows = downServices.map(key => {
        const label = PAGE_LABELS[key] || key;
        return `<tr>
          <td style="padding:10px 16px;border-bottom:1px solid #1a2a3d;">
            <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:#ef4444;margin-right:8px;"></span>
            <span style="color:#fca5a5;font-weight:600;">${label}</span>
          </td>
          <td style="padding:10px 16px;border-bottom:1px solid #1a2a3d;color:#ef4444;font-weight:700;text-align:right;">EN PANNE</td>
        </tr>`;
      }).join('');

      subject = `🚨 Alerte panne — ${downServices.length} service(s) indisponible(s) | Brenne Aerial`;
      emailBody = `
<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"/>
<style>
  body{font-family:'Inter',Arial,sans-serif;background:#070d1a;color:#e0eaf5;margin:0;padding:0;}
  .wrapper{max-width:600px;margin:0 auto;padding:40px 20px;}
  .header{text-align:center;margin-bottom:32px;}
  .logo{font-size:22px;font-weight:800;letter-spacing:-0.5px;color:#38aadc;}
  .logo span{color:#e0eaf5;}
  .card{background:#0d1829;border:1px solid #1a2a3d;border-radius:16px;padding:32px;margin-bottom:24px;}
  .badge{display:inline-block;background:#7f1d1d;color:#fca5a5;border:1px solid #ef4444;border-radius:999px;padding:4px 14px;font-size:11px;font-weight:600;letter-spacing:0.05em;text-transform:uppercase;margin-bottom:20px;}
  h2{font-size:20px;font-weight:700;color:#e0eaf5;margin:0 0 12px;}
  p{font-size:14px;color:#8fafc9;line-height:1.7;margin:0 0 16px;}
  .highlight{color:#e0eaf5;font-weight:600;}
  .btn{display:inline-block;background:#38aadc;color:#07111f;font-weight:700;font-size:14px;padding:12px 28px;border-radius:10px;text-decoration:none;margin-top:8px;}
  table{width:100%;border-collapse:collapse;background:#0a1525;border-radius:10px;overflow:hidden;margin:20px 0;}
  th{padding:10px 16px;background:#0f1e30;color:#8fafc9;font-size:11px;text-transform:uppercase;letter-spacing:0.05em;text-align:left;}
  .footer{text-align:center;font-size:11px;color:#3d5a7a;margin-top:32px;}
  .divider{border:none;border-top:1px solid #1a2a3d;margin:24px 0;}
</style>
</head><body>
<div class="wrapper">
  <div class="header">
    <div class="logo">Brenne <span>Aerial</span></div>
    <p style="font-size:12px;color:#3d5a7a;margin-top:4px;">Alerte système — ${now}</p>
  </div>
  <div class="card">
    <div class="badge">🚨 ${downServices.length} service(s) en panne</div>
    <h2>Plusieurs services sont tombés en panne</h2>
    <p>Les services suivants sont actuellement <span class="highlight">hors ligne</span> sur la plateforme Brenne Aerial. Nos équipes techniques sont mobilisées pour les rétablir dans les meilleurs délais.</p>
    <table>
      <thead><tr><th>Service</th><th style="text-align:right;">Statut</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
    <p>Nous nous excusons sincèrement pour la gêne occasionnée. Vous serez notifié dès le rétablissement des services.</p>
    <hr class="divider"/>
    <p><span class="highlight">Suivez l'état en temps réel</span> sur notre page de statut officielle :</p>
    <a href="https://statut.brenneaerial.org" class="btn">🔍 Voir le statut des services</a>
    <p style="margin-top:16px;">Statut interne de la plateforme :</p>
    <a href="https://brenneaerial.fr/uptime" class="btn" style="background:#1a2a3d;color:#38aadc;">📊 Statut Brenne Aerial</a>
  </div>
  <div class="card" style="background:#070d1a;">
    <p style="margin:0;"><strong style="color:#e0eaf5;">Une question urgente ?</strong> Contactez-nous à <a href="mailto:contact@brenneaerial.fr" style="color:#38aadc;">contact@brenneaerial.fr</a>.</p>
  </div>
  <div class="footer">
    <p>© ${new Date().getFullYear()} Brenne Aerial — Tous droits réservés<br/>Brenne, Indre, France</p>
    <p style="margin-top:8px;">Vous recevez cet email car vous êtes inscrit sur la plateforme Brenne Aerial.</p>
  </div>
</div>
</body></html>`.trim();

    // ── MODE RESTORED : panne résolue ──
    // ── MODE RETABLISSEMENT : récap de tous les systèmes en marche ──
    } else if (mode === 'retablissement') {
      const { upServices = [] } = body.payload ?? body;

      const rows = upServices.map(key => {
        const label = PAGE_LABELS[key] || key;
        return `<tr>
          <td style="padding:10px 16px;border-bottom:1px solid #1a2a3d;">
            <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:#22c55e;margin-right:8px;"></span>
            <span style="color:#86efac;font-weight:600;">${label}</span>
          </td>
          <td style="padding:10px 16px;border-bottom:1px solid #1a2a3d;color:#22c55e;font-weight:700;text-align:right;">OPÉRATIONNEL</td>
        </tr>`;
      }).join('');

      subject = `✅ Retour des systèmes — ${upServices.length} service(s) opérationnel(s) | Brenne Aerial`;
      emailBody = `
<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"/>
<style>
  body{font-family:'Inter',Arial,sans-serif;background:#070d1a;color:#e0eaf5;margin:0;padding:0;}
  .wrapper{max-width:600px;margin:0 auto;padding:40px 20px;}
  .header{text-align:center;margin-bottom:32px;}
  .logo{font-size:22px;font-weight:800;letter-spacing:-0.5px;color:#38aadc;}
  .logo span{color:#e0eaf5;}
  .card{background:#0d1829;border:1px solid #1a2a3d;border-radius:16px;padding:32px;margin-bottom:24px;}
  .badge{display:inline-block;background:#14532d;color:#86efac;border:1px solid #22c55e;border-radius:999px;padding:4px 14px;font-size:11px;font-weight:600;letter-spacing:0.05em;text-transform:uppercase;margin-bottom:20px;}
  h2{font-size:20px;font-weight:700;color:#e0eaf5;margin:0 0 12px;}
  p{font-size:14px;color:#8fafc9;line-height:1.7;margin:0 0 16px;}
  .highlight{color:#e0eaf5;font-weight:600;}
  .btn{display:inline-block;background:#22c55e;color:#052e16;font-weight:700;font-size:14px;padding:12px 28px;border-radius:10px;text-decoration:none;margin-top:8px;}
  table{width:100%;border-collapse:collapse;background:#0a1525;border-radius:10px;overflow:hidden;margin:20px 0;}
  th{padding:10px 16px;background:#0f1e30;color:#8fafc9;font-size:11px;text-transform:uppercase;letter-spacing:0.05em;text-align:left;}
  .footer{text-align:center;font-size:11px;color:#3d5a7a;margin-top:32px;}
  .divider{border:none;border-top:1px solid #1a2a3d;margin:24px 0;}
</style>
</head><body>
<div class="wrapper">
  <div class="header">
    <div class="logo">Brenne <span>Aerial</span></div>
    <p style="font-size:12px;color:#3d5a7a;margin-top:4px;">Mise à jour des systèmes — ${now}</p>
  </div>
  <div class="card">
    <div class="badge">✅ ${upServices.length} service(s) opérationnel(s)</div>
    <h2>Retour des systèmes</h2>
    <p>Voici l'état actuel des services <span class="highlight">opérationnels</span> sur la plateforme Brenne Aerial :</p>
    <table>
      <thead><tr><th>Service</th><th style="text-align:right;">Statut</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
    <p>Tous ces services sont pleinement fonctionnels et accessibles normalement. Merci pour votre confiance.</p>
    <hr class="divider"/>
    <a href="https://brenneaerial.fr" class="btn">🚀 Accéder à la plateforme</a>
  </div>
  <div class="card" style="background:#070d1a;">
    <p style="margin:0;"><strong style="color:#e0eaf5;">Une question ?</strong> Contactez-nous à <a href="mailto:contact@brenneaerial.fr" style="color:#38aadc;">contact@brenneaerial.fr</a>.</p>
  </div>
  <div class="footer">
    <p>© ${new Date().getFullYear()} Brenne Aerial — Tous droits réservés<br/>Brenne, Indre, France</p>
    <p style="margin-top:8px;">Vous recevez cet email car vous êtes inscrit sur la plateforme Brenne Aerial.</p>
  </div>
</div>
</body></html>`.trim();

    } else if (mode === 'restored' || enabled === true) {
      const pageLabel = PAGE_LABELS[settingKey] || settingKey;
      subject = `✅ Panne résolue — ${pageLabel} | Brenne Aerial`;
      emailBody = `
<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"/>
<style>
  body{font-family:'Inter',Arial,sans-serif;background:#070d1a;color:#e0eaf5;margin:0;padding:0;}
  .wrapper{max-width:600px;margin:0 auto;padding:40px 20px;}
  .header{text-align:center;margin-bottom:32px;}
  .logo{font-size:22px;font-weight:800;letter-spacing:-0.5px;color:#38aadc;}
  .logo span{color:#e0eaf5;}
  .card{background:#0d1829;border:1px solid #1a2a3d;border-radius:16px;padding:32px;margin-bottom:24px;}
  .badge{display:inline-block;background:#14532d;color:#86efac;border:1px solid #22c55e;border-radius:999px;padding:4px 14px;font-size:11px;font-weight:600;letter-spacing:0.05em;text-transform:uppercase;margin-bottom:20px;}
  h2{font-size:20px;font-weight:700;color:#e0eaf5;margin:0 0 12px;}
  p{font-size:14px;color:#8fafc9;line-height:1.7;margin:0 0 16px;}
  .highlight{color:#e0eaf5;font-weight:600;}
  .btn{display:inline-block;background:#22c55e;color:#052e16;font-weight:700;font-size:14px;padding:12px 28px;border-radius:10px;text-decoration:none;margin-top:8px;}
  .module-box{background:#0a1525;border:1px solid #22c55e40;border-radius:10px;padding:16px 20px;margin:20px 0;}
  .module-name{font-size:16px;font-weight:700;color:#86efac;}
  .footer{text-align:center;font-size:11px;color:#3d5a7a;margin-top:32px;}
  .status-row{display:flex;align-items:center;gap:8px;margin-top:16px;}
  .dot{width:8px;height:8px;border-radius:50%;background:#22c55e;flex-shrink:0;}
  .status-label{font-size:12px;color:#8fafc9;}
  .divider{border:none;border-top:1px solid #1a2a3d;margin:24px 0;}
</style>
</head><body>
<div class="wrapper">
  <div class="header">
    <div class="logo">Brenne <span>Aerial</span></div>
    <p style="font-size:12px;color:#3d5a7a;margin-top:4px;">Notification système automatique</p>
  </div>
  <div class="card">
    <div class="badge">✅ Panne résolue</div>
    <h2>La panne a été résolue</h2>
    <p>Bonne nouvelle ! La panne affectant le service suivant a été <span class="highlight">entièrement résolue</span> par nos équipes techniques :</p>
    <div class="module-box">
      <div class="module-name">🟢 ${pageLabel}</div>
      <div class="status-row">
        <div class="dot"></div>
        <div class="status-label">Rétabli le ${now}</div>
      </div>
    </div>
    <p>Vous pouvez à nouveau accéder à ce service normalement. Merci pour votre patience et votre compréhension.</p>
    <hr class="divider"/>
    <a href="https://brenneaerial.fr" class="btn">🚀 Accéder à la plateforme</a>
  </div>
  <div class="card" style="background:#070d1a;">
    <p style="margin:0;"><strong style="color:#e0eaf5;">Une question ?</strong> Contactez-nous à <a href="mailto:contact@brenneaerial.fr" style="color:#38aadc;">contact@brenneaerial.fr</a>. Notre équipe vous répondra dans les 24h.</p>
  </div>
  <div class="footer">
    <p>© ${new Date().getFullYear()} Brenne Aerial — Tous droits réservés<br/>Brenne, Indre, France</p>
    <p style="margin-top:8px;">Vous recevez cet email car vous êtes inscrit sur la plateforme Brenne Aerial.</p>
  </div>
</div>
</body></html>`.trim();
    } else {
      return Response.json({ ok: true, skipped: true, message: 'Aucun email envoyé (appel sans mode).' });
    }

    const emailPromises = usersToNotify.map(u =>
      base44.asServiceRole.integrations.Core.SendEmail({ to: u.email, subject, body: emailBody })
    );
    await Promise.allSettled(emailPromises);

    return Response.json({ ok: true, notified: usersToNotify.length });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});