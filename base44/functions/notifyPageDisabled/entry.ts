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
    const { settingKey, enabled } = body.payload ?? body;

    const pageLabel = PAGE_LABELS[settingKey] || settingKey;

    // Get all registered users to notify
    const users = await base44.asServiceRole.entities.User.list();
    const usersToNotify = users.filter(u => u.email);

    const now = new Date().toLocaleString('fr-FR', { timeZone: 'Europe/Paris', dateStyle: 'full', timeStyle: 'short' });

    let emailBody, subject;

    if (enabled) {
      // Service restored email
      subject = `✅ Service rétabli — ${pageLabel} | Brenne Aerial`;
      emailBody = `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8"/>
  <style>
    body { font-family: 'Inter', Arial, sans-serif; background: #070d1a; color: #e0eaf5; margin: 0; padding: 0; }
    .wrapper { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
    .header { text-align: center; margin-bottom: 32px; }
    .logo { font-size: 22px; font-weight: 800; letter-spacing: -0.5px; color: #38aadc; }
    .logo span { color: #e0eaf5; }
    .card { background: #0d1829; border: 1px solid #1a2a3d; border-radius: 16px; padding: 32px; margin-bottom: 24px; }
    .badge { display: inline-block; background: #14532d; color: #86efac; border: 1px solid #22c55e; border-radius: 999px; padding: 4px 14px; font-size: 11px; font-weight: 600; letter-spacing: 0.05em; text-transform: uppercase; margin-bottom: 20px; }
    h2 { font-size: 20px; font-weight: 700; color: #e0eaf5; margin: 0 0 12px; }
    p { font-size: 14px; color: #8fafc9; line-height: 1.7; margin: 0 0 16px; }
    .highlight { color: #e0eaf5; font-weight: 600; }
    .btn { display: inline-block; background: #22c55e; color: #052e16; font-weight: 700; font-size: 14px; padding: 12px 28px; border-radius: 10px; text-decoration: none; margin-top: 8px; }
    .module-box { background: #0a1525; border: 1px solid #22c55e40; border-radius: 10px; padding: 16px 20px; margin: 20px 0; }
    .module-name { font-size: 16px; font-weight: 700; color: #86efac; }
    .footer { text-align: center; font-size: 11px; color: #3d5a7a; margin-top: 32px; }
    .status-row { display: flex; align-items: center; gap: 8px; margin-top: 16px; }
    .dot { width: 8px; height: 8px; border-radius: 50%; background: #22c55e; flex-shrink: 0; }
    .status-label { font-size: 12px; color: #8fafc9; }
    .divider { border: none; border-top: 1px solid #1a2a3d; margin: 24px 0; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <div class="logo">Brenne <span>Aerial</span></div>
      <p style="font-size:12px;color:#3d5a7a;margin-top:4px;">Notification système automatique</p>
    </div>
    <div class="card">
      <div class="badge">✅ Service rétabli</div>
      <h2>Le service est à nouveau disponible</h2>
      <p>Notre équipe technique vient de rétablir le service suivant sur la plateforme Brenne Aerial :</p>
      <div class="module-box">
        <div class="module-name">🟢 ${pageLabel}</div>
        <div class="status-row">
          <div class="dot"></div>
          <div class="status-label">Rétabli le ${now}</div>
        </div>
      </div>
      <p>Vous pouvez à nouveau accéder à ce service normalement. Merci pour votre patience.</p>
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
</body>
</html>`.trim();
    } else {
      // Service disabled email
      subject = `⚠️ Service indisponible — ${pageLabel} | Brenne Aerial`;
      emailBody = `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8"/>
  <style>
    body { font-family: 'Inter', Arial, sans-serif; background: #070d1a; color: #e0eaf5; margin: 0; padding: 0; }
    .wrapper { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
    .header { text-align: center; margin-bottom: 32px; }
    .logo { font-size: 22px; font-weight: 800; letter-spacing: -0.5px; color: #38aadc; }
    .logo span { color: #e0eaf5; }
    .card { background: #0d1829; border: 1px solid #1a2a3d; border-radius: 16px; padding: 32px; margin-bottom: 24px; }
    .badge { display: inline-block; background: #7f1d1d; color: #fca5a5; border: 1px solid #ef4444; border-radius: 999px; padding: 4px 14px; font-size: 11px; font-weight: 600; letter-spacing: 0.05em; text-transform: uppercase; margin-bottom: 20px; }
    h2 { font-size: 20px; font-weight: 700; color: #e0eaf5; margin: 0 0 12px; }
    p { font-size: 14px; color: #8fafc9; line-height: 1.7; margin: 0 0 16px; }
    .highlight { color: #e0eaf5; font-weight: 600; }
    .btn { display: inline-block; background: #38aadc; color: #07111f; font-weight: 700; font-size: 14px; padding: 12px 28px; border-radius: 10px; text-decoration: none; margin-top: 8px; }
    .module-box { background: #0a1525; border: 1px solid #ef444440; border-radius: 10px; padding: 16px 20px; margin: 20px 0; }
    .module-name { font-size: 16px; font-weight: 700; color: #fca5a5; }
    .footer { text-align: center; font-size: 11px; color: #3d5a7a; margin-top: 32px; }
    .status-row { display: flex; align-items: center; gap: 8px; margin-top: 16px; }
    .dot { width: 8px; height: 8px; border-radius: 50%; background: #ef4444; flex-shrink: 0; }
    .status-label { font-size: 12px; color: #8fafc9; }
    .divider { border: none; border-top: 1px solid #1a2a3d; margin: 24px 0; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <div class="logo">Brenne <span>Aerial</span></div>
      <p style="font-size:12px;color:#3d5a7a;margin-top:4px;">Notification système automatique</p>
    </div>
    <div class="card">
      <div class="badge">⚠️ Service temporairement indisponible</div>
      <h2>Un service a été désactivé</h2>
      <p>Notre équipe technique vient de désactiver temporairement le service suivant sur la plateforme Brenne Aerial :</p>
      <div class="module-box">
        <div class="module-name">🔴 ${pageLabel}</div>
        <div class="status-row">
          <div class="dot"></div>
          <div class="status-label">Désactivé le ${now}</div>
        </div>
      </div>
      <p>Cette action peut intervenir dans le cadre d'une <span class="highlight">maintenance planifiée</span>, d'une mise à jour technique ou d'une intervention d'urgence. Nous mettons tout en œuvre pour rétablir ce service dans les meilleurs délais.</p>
      <hr class="divider"/>
      <p><span class="highlight">Suivez l'état en temps réel</span> de tous nos services sur notre page de statut officielle :</p>
      <a href="https://statut.brenneaerial.org" class="btn">🔍 Voir le statut des services</a>
      <p style="margin-top:20px;">Vous pouvez également consulter la page statut de notre plateforme :</p>
      <a href="https://brenneaerial.fr/uptime" class="btn" style="background:#1a2a3d;color:#38aadc;">📊 Statut Brenne Aerial</a>
    </div>
    <div class="card" style="background:#070d1a;">
      <p style="margin:0;"><strong style="color:#e0eaf5;">Une question ?</strong> Contactez-nous à <a href="mailto:contact@brenneaerial.fr" style="color:#38aadc;">contact@brenneaerial.fr</a>. Notre équipe vous répondra dans les 24h.</p>
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} Brenne Aerial — Tous droits réservés<br/>Brenne, Indre, France</p>
      <p style="margin-top:8px;">Vous recevez cet email car vous êtes inscrit sur la plateforme Brenne Aerial.</p>
    </div>
  </div>
</body>
</html>`.trim();
    }

    // Send to all users
    const emailPromises = usersToNotify.map(u =>
      base44.asServiceRole.integrations.Core.SendEmail({
        to: u.email,
        subject,
        body: emailBody,
      })
    );

    await Promise.allSettled(emailPromises);

    return Response.json({ ok: true, notified: usersToNotify.length });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});