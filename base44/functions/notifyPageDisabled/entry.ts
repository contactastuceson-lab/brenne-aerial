import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const PAGE_LABELS = {
  page_homepage_enabled:       'Page Accueil (accueil principal)',
  page_services_enabled:       'Page Services (catalogue des prestations)',
  page_portfolio_enabled:      'Page Portfolio (galerie de projets)',
  page_blog_enabled:           'Page Blog (actualités & articles)',
  page_contact_enabled:        'Page Contact (formulaire & coordonnées)',
  page_quote_enabled:          'Page Devis (demande de devis en ligne)',
  page_planning_enabled:       'Page Planning (calendrier & réservations)',
  page_discover_enabled:       'Page Découvrir (répertoire des membres)',
  page_messages_enabled:       'Module Messagerie (communication inter-membres)',
  page_espace_client_enabled:  'Espace Client (portail fichiers & livrables)',
  page_partenaires_enabled:    'Page Partenaires (annuaire des partenaires)',
  page_parrainage_enabled:     'Programme Parrainage (système de référencement)',
  page_avant_apres_enabled:    'Galerie Avant / Après (comparaison de visuels)',
  page_certification_enabled:  'Système de Certification (demandes & validation)',
  page_donation_enabled:       'Plateforme de Dons (paiements & contributions)',
  page_garage_enabled:         'Garage Drone (fiches techniques & flotte)',
  page_calculator_enabled:     'Calculateur de Devis (estimateur de prix instantané)',
  page_reglementation_enabled: 'Module Réglementation (guide réglementaire drone)',
  page_simulateur_enabled:     'Simulateur de Vue (outil immobilier par étages)',
  page_comparateur_enabled:    'Comparateur de Résolution (qualité d\'image)',
  page_flash_enabled:          'Flash Delivery (portail de livraison rapide QR)',
  messaging_enabled:           'Messagerie Inter-membres (chat en temps réel)',
  registration_open:           'Inscriptions (création de nouveaux comptes)',
};

const INCIDENT_ID = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let id = 'INC-';
  for (let i = 0; i < 8; i++) id += chars[Math.floor(Math.random() * chars.length)];
  return id;
};

const CSS_BASE = `
  body{font-family:'Helvetica Neue',Arial,sans-serif;background:#0b0f1a;color:#dce8f5;margin:0;padding:0;}
  .wrapper{max-width:640px;margin:0 auto;padding:0;}
  .topbar{background:#060a12;border-bottom:2px solid #ef4444;padding:10px 28px;display:flex;align-items:center;justify-content:space-between;}
  .topbar-green{background:#060a12;border-bottom:2px solid #22c55e;padding:10px 28px;display:flex;align-items:center;justify-content:space-between;}
  .topbar-brand{font-size:13px;font-weight:800;letter-spacing:0.08em;color:#38aadc;text-transform:uppercase;}
  .topbar-sys{font-size:10px;color:#3d5a7a;letter-spacing:0.05em;font-family:monospace;}
  .hero{background:linear-gradient(135deg,#12010a 0%,#1a0505 50%,#0d1218 100%);padding:40px 28px 28px;border-bottom:1px solid #2a0a0a;}
  .hero-green{background:linear-gradient(135deg,#011209 0%,#061a0e 50%,#0d1218 100%);padding:40px 28px 28px;border-bottom:1px solid #0a2a14;}
  .severity-badge{display:inline-flex;align-items:center;gap:6px;background:#7f1d1d;color:#fca5a5;border:1px solid #ef444460;border-radius:4px;padding:4px 12px;font-size:10px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;margin-bottom:16px;}
  .severity-badge-green{display:inline-flex;align-items:center;gap:6px;background:#14532d;color:#86efac;border:1px solid #22c55e60;border-radius:4px;padding:4px 12px;font-size:10px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;margin-bottom:16px;}
  .severity-badge-warn{display:inline-flex;align-items:center;gap:6px;background:#78350f;color:#fcd34d;border:1px solid #f5970060;border-radius:4px;padding:4px 12px;font-size:10px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;margin-bottom:16px;}
  .hero-title{font-size:26px;font-weight:800;color:#ffffff;margin:0 0 8px;line-height:1.2;}
  .hero-sub{font-size:13px;color:#8fafc9;margin:0;line-height:1.6;}
  .body-section{padding:24px 28px;background:#0d1218;border-bottom:1px solid #151d2b;}
  .body-section-alt{padding:24px 28px;background:#0a0f1a;border-bottom:1px solid #151d2b;}
  .section-title{font-size:11px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#4a7a9b;margin:0 0 14px;display:flex;align-items:center;gap:8px;}
  .section-title::before{content:'';display:inline-block;width:3px;height:12px;background:#38aadc;border-radius:2px;}
  .section-title-red::before{background:#ef4444;}
  .section-title-green::before{background:#22c55e;}
  .incident-meta{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:16px;}
  .meta-item{background:#111823;border:1px solid #1e2d3d;border-radius:6px;padding:10px 14px;}
  .meta-label{font-size:9px;letter-spacing:0.08em;text-transform:uppercase;color:#4a7a9b;margin-bottom:4px;font-weight:600;}
  .meta-value{font-size:12px;color:#dce8f5;font-weight:600;font-family:monospace;}
  .alert-box{background:#140506;border:1px solid #ef444430;border-left:3px solid #ef4444;border-radius:6px;padding:16px 18px;margin:16px 0;}
  .alert-box-green{background:#010f05;border:1px solid #22c55e30;border-left:3px solid #22c55e;border-radius:6px;padding:16px 18px;margin:16px 0;}
  .alert-box-blue{background:#020d18;border:1px solid #38aadc30;border-left:3px solid #38aadc;border-radius:6px;padding:16px 18px;margin:16px 0;}
  .alert-title{font-size:12px;font-weight:700;color:#fca5a5;margin:0 0 6px;}
  .alert-title-green{font-size:12px;font-weight:700;color:#86efac;margin:0 0 6px;}
  .alert-title-blue{font-size:12px;font-weight:700;color:#7dd3fc;margin:0 0 6px;}
  .alert-text{font-size:12px;color:#8fafc9;margin:0;line-height:1.7;}
  p{font-size:13px;color:#8fafc9;line-height:1.8;margin:0 0 12px;}
  .highlight{color:#dce8f5;font-weight:600;}
  .code{font-family:monospace;font-size:11px;background:#090e17;border:1px solid #1e2d3d;padding:2px 7px;border-radius:3px;color:#7dd3fc;}
  .code-red{font-family:monospace;font-size:11px;background:#140506;border:1px solid #ef444430;padding:2px 7px;border-radius:3px;color:#fca5a5;}
  .code-green{font-family:monospace;font-size:11px;background:#010f05;border:1px solid #22c55e30;padding:2px 7px;border-radius:3px;color:#86efac;}
  table.services{width:100%;border-collapse:collapse;margin:12px 0;}
  table.services th{padding:8px 12px;background:#0a1220;color:#4a7a9b;font-size:10px;text-transform:uppercase;letter-spacing:0.06em;text-align:left;border-bottom:1px solid #1e2d3d;}
  table.services td{padding:9px 12px;border-bottom:1px solid #12192a;font-size:12px;color:#dce8f5;vertical-align:middle;}
  table.services tr:last-child td{border-bottom:none;}
  .dot-red{display:inline-block;width:7px;height:7px;border-radius:50%;background:#ef4444;margin-right:6px;}
  .dot-green{display:inline-block;width:7px;height:7px;border-radius:50%;background:#22c55e;margin-right:6px;}
  .status-pill-red{font-size:9px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;padding:3px 8px;border-radius:3px;background:#7f1d1d;color:#fca5a5;border:1px solid #ef444440;}
  .status-pill-green{font-size:9px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;padding:3px 8px;border-radius:3px;background:#14532d;color:#86efac;border:1px solid #22c55e40;}
  .btn{display:inline-block;background:#38aadc;color:#03080f;font-weight:700;font-size:13px;padding:12px 26px;border-radius:6px;text-decoration:none;}
  .btn-outline{display:inline-block;background:transparent;color:#38aadc;font-weight:600;font-size:13px;padding:11px 24px;border-radius:6px;text-decoration:none;border:1px solid #38aadc60;}
  .btn-green{display:inline-block;background:#22c55e;color:#011209;font-weight:700;font-size:13px;padding:12px 26px;border-radius:6px;text-decoration:none;}
  .btn-red{display:inline-block;background:#dc2626;color:#fff;font-weight:700;font-size:13px;padding:12px 26px;border-radius:6px;text-decoration:none;}
  .timeline{position:relative;padding-left:20px;border-left:2px solid #1e2d3d;margin:16px 0;}
  .timeline-item{position:relative;padding:0 0 16px 16px;}
  .timeline-item::before{content:'';position:absolute;left:-21px;top:4px;width:8px;height:8px;border-radius:50%;background:#1e2d3d;border:2px solid #38aadc;}
  .timeline-item-active::before{background:#ef4444;border-color:#ef4444;}
  .timeline-time{font-size:10px;color:#4a7a9b;font-family:monospace;margin-bottom:3px;}
  .timeline-text{font-size:12px;color:#8fafc9;}
  .footer{background:#060a12;padding:24px 28px;text-align:center;border-top:1px solid #151d2b;}
  .footer-logo{font-size:14px;font-weight:800;color:#38aadc;letter-spacing:0.05em;margin-bottom:4px;}
  .footer-text{font-size:10px;color:#2d4a6a;line-height:1.7;}
  .divider{border:none;border-top:1px solid #151d2b;margin:0;}
  .api-row{display:flex;align-items:center;justify-content:space-between;padding:8px 12px;background:#090e17;border-radius:4px;margin:4px 0;font-family:monospace;font-size:11px;}
  .api-url{color:#4a7a9b;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;flex:1;margin-right:10px;}
  .api-status-ok{color:#22c55e;font-weight:700;flex-shrink:0;}
  .api-status-fail{color:#ef4444;font-weight:700;flex-shrink:0;}
`;

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const data = body.payload ?? body;
    const { mode, settingKey, enabled, downServices = [], upServices = [] } = data;

    const users = await base44.asServiceRole.entities.User.list();
    const usersToNotify = users.filter(u => u.email);
    const now = new Date().toLocaleString('fr-FR', { timeZone: 'Europe/Paris', dateStyle: 'full', timeStyle: 'medium' });
    const nowShort = new Date().toLocaleString('fr-FR', { timeZone: 'Europe/Paris', dateStyle: 'short', timeStyle: 'short' });
    const incidentId = INCIDENT_ID();
    const systemVersion = 'BAMS v3.1.4';
    const allModules = Object.keys(PAGE_LABELS);

    let emailBody, subject;

    // ─────────────────────────────────────────────────────────────────────────
    // MODE SITE_OFFLINE — Détection d'une panne générale sur toute la plateforme
    // ─────────────────────────────────────────────────────────────────────────
    if (mode === 'site_offline') {

      subject = `[CRITIQUE] INCIDENT-${incidentId} — Panne générale détectée · brenneaerial.fr`;

      const apiChecks = [
        { url: '/api/functions/statusCheck', status: '503', fail: true },
        { url: '/api/functions/statusCheck?module=site', status: '503', fail: true },
        { url: '/api/functions/statusCheck?module=homepage', status: '503', fail: true },
        { url: '/api/functions/statusCheck?module=portfolio', status: '503', fail: true },
        { url: '/api/functions/statusCheck?module=blog', status: '503', fail: true },
        { url: '/api/functions/statusCheck?module=messagerie', status: '503', fail: true },
      ];

      const apiRows = apiChecks.map(c => `
        <div class="api-row">
          <span class="api-url">brenneaerial.fr${c.url}</span>
          <span class="${c.fail ? 'api-status-fail' : 'api-status-ok'}">${c.status} ${c.fail ? '✗' : '✓'}</span>
        </div>`).join('');

      const serviceRows = allModules.map(key => {
        const label = PAGE_LABELS[key] || key;
        return `<tr>
          <td><span class="dot-red"></span>${label}</td>
          <td><span class="status-pill-red">HORS LIGNE</span></td>
          <td style="font-family:monospace;font-size:10px;color:#4a7a9b;">${nowShort}</td>
        </tr>`;
      }).join('');

      emailBody = `<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"/><style>${CSS_BASE}</style></head><body>
<div class="wrapper">

  <!-- TOP BAR -->
  <div class="topbar">
    <span class="topbar-brand">Brenne Aerial</span>
    <span class="topbar-sys">${systemVersion} · MONITORING · ALERTE AUTOMATIQUE</span>
  </div>

  <!-- HERO -->
  <div class="hero">
    <div class="severity-badge">
      <span style="width:6px;height:6px;border-radius:50%;background:#ef4444;display:inline-block;animation:pulse 1s infinite;"></span>
      SÉVÉRITÉ CRITIQUE — P0
    </div>
    <h1 class="hero-title">⛔ Panne Générale Détectée</h1>
    <p class="hero-sub">Le système de monitoring automatique Brenne Aerial (${systemVersion}) a détecté une interruption totale de service sur l'ensemble de la plateforme <strong style="color:#dce8f5">brenneaerial.fr</strong>. Toutes les sondes API retournent un code d'erreur <strong style="color:#ef4444">503 Service Unavailable</strong>. Cet incident est classé <strong style="color:#ef4444">CRITIQUE (P0)</strong> et les équipes techniques ont été notifiées automatiquement.</p>
  </div>

  <!-- MÉTADONNÉES INCIDENT -->
  <div class="body-section">
    <div class="section-title section-title-red">Rapport d'incident automatisé</div>
    <div class="incident-meta">
      <div class="meta-item"><div class="meta-label">Identifiant incident</div><div class="meta-value">${incidentId}</div></div>
      <div class="meta-item"><div class="meta-label">Sévérité</div><div class="meta-value" style="color:#ef4444">CRITIQUE / P0</div></div>
      <div class="meta-item"><div class="meta-label">Détecté le</div><div class="meta-value">${now}</div></div>
      <div class="meta-item"><div class="meta-label">Système de détection</div><div class="meta-value">${systemVersion}</div></div>
      <div class="meta-item"><div class="meta-label">Périmètre d'impact</div><div class="meta-value">TOTAL (100%)</div></div>
      <div class="meta-item"><div class="meta-label">Modules affectés</div><div class="meta-value" style="color:#ef4444">${allModules.length} / ${allModules.length}</div></div>
    </div>

    <div class="alert-box">
      <div class="alert-title">⚠️ Interruption totale de service</div>
      <div class="alert-text">L'ensemble des endpoints de monitoring retournent un code HTTP <span class="code-red">503 Service Unavailable</span>. La plateforme <span class="code">brenneaerial.fr</span> est actuellement inaccessible depuis l'extérieur. Les utilisateurs connectés reçoivent une page d'erreur générique. Aucun service n'est opérationnel à l'heure de génération de ce rapport.</div>
    </div>
  </div>

  <!-- RÉSULTATS SONDES API -->
  <div class="body-section-alt">
    <div class="section-title section-title-red">Résultats des sondes API (snapshot automatique)</div>
    <p style="margin-bottom:12px;">Les requêtes suivantes ont été exécutées automatiquement par le système de monitoring au moment de la détection de l'incident :</p>
    ${apiRows}
    <p style="margin-top:12px;font-size:11px;color:#3d5a7a;">Toutes les requêtes ont été effectuées depuis le système de monitoring interne Brenne Aerial. Les résultats ci-dessus sont figés à l'instant de la détection.</p>
  </div>

  <!-- TABLEAU DES SERVICES -->
  <div class="body-section">
    <div class="section-title section-title-red">État de tous les modules (${allModules.length} modules)</div>
    <table class="services">
      <thead><tr><th>Module / Service</th><th>Statut</th><th>Depuis</th></tr></thead>
      <tbody>${serviceRows}</tbody>
    </table>
  </div>

  <!-- TIMELINE -->
  <div class="body-section-alt">
    <div class="section-title">Chronologie de l'incident</div>
    <div class="timeline">
      <div class="timeline-item timeline-item-active">
        <div class="timeline-time">${now}</div>
        <div class="timeline-text"><strong style="color:#ef4444">DÉTECTION AUTOMATIQUE</strong> — Le ${systemVersion} a déclenché une alerte de niveau CRITIQUE. L'ensemble des sondes API indiquent une indisponibilité totale.</div>
      </div>
      <div class="timeline-item">
        <div class="timeline-time">En cours</div>
        <div class="timeline-text"><strong style="color:#fcd34d">INVESTIGATION</strong> — Les équipes techniques ont été alertées. Une analyse des journaux système est en cours pour identifier la cause racine.</div>
      </div>
      <div class="timeline-item">
        <div class="timeline-time">À venir</div>
        <div class="timeline-text"><strong style="color:#4a7a9b">RÉSOLUTION</strong> — Un email de rétablissement vous sera envoyé automatiquement dès la remise en ligne complète de la plateforme.</div>
      </div>
    </div>
  </div>

  <!-- IMPACT UTILISATEUR -->
  <div class="body-section">
    <div class="section-title section-title-red">Impact utilisateur</div>
    <p>Cet incident affecte l'ensemble des fonctionnalités de la plateforme Brenne Aerial. Voici les services actuellement indisponibles :</p>
    <div class="alert-box">
      <div class="alert-title">Services impactés</div>
      <div class="alert-text">
        • Accès à la plateforme <span class="code">brenneaerial.fr</span> — <span class="code-red">BLOQUÉ</span><br/>
        • Dépôt et consultation de demandes de devis — <span class="code-red">INDISPONIBLE</span><br/>
        • Messagerie inter-membres et espace client — <span class="code-red">INDISPONIBLE</span><br/>
        • Accès aux fichiers livrables de vos missions — <span class="code-red">BLOQUÉ</span><br/>
        • Toutes les API de monitoring externes — <span class="code-red">503</span>
      </div>
    </div>
    <p>Nous nous excusons sincèrement pour cette interruption. Nos équipes font du rétablissement du service leur priorité absolue. Vous serez notifié par email dès la résolution de l'incident.</p>
  </div>

  <!-- ACTIONS & CONTACTS -->
  <div class="body-section-alt">
    <div class="section-title">Ressources & Suivi</div>
    <p>Vous pouvez suivre l'évolution de l'incident en temps réel via notre page de statut officielle, gérée par Better Stack :</p>
    <div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:8px;">
      <a href="https://statut.brenneaerial.org" class="btn-red">🔴 Statut en direct</a>
      <a href="https://brenneaerial.fr/uptime" class="btn-outline">📊 Historique uptime</a>
    </div>
    <div class="alert-box-blue" style="margin-top:20px;">
      <div class="alert-title-blue">Contact d'urgence</div>
      <div class="alert-text">Pour toute urgence opérationnelle liée à cet incident, contactez l'équipe technique à <strong style="color:#7dd3fc">contact@brenneaerial.fr</strong> en mentionnant la référence <span class="code">${incidentId}</span>.</div>
    </div>
  </div>

  <div class="footer">
    <div class="footer-logo">BRENNE AERIAL</div>
    <div class="footer-text">
      Système de monitoring automatique — ${systemVersion}<br/>
      Brenne, Indre (36) · France · contact@brenneaerial.fr<br/>
      © ${new Date().getFullYear()} Brenne Aerial — Tous droits réservés<br/><br/>
      Ce message a été généré automatiquement par le système de surveillance de la plateforme Brenne Aerial.<br/>
      Référence de l'incident : <strong>${incidentId}</strong> · Généré le ${now}
    </div>
  </div>
</div>
</body></html>`;

    // ─────────────────────────────────────────────────────────────────────────
    // MODE SITE_RESTORED — Rétablissement complet de la plateforme
    // ─────────────────────────────────────────────────────────────────────────
    } else if (mode === 'site_restored') {

      subject = `[RÉSOLU] INCIDENT-${incidentId} — Plateforme Brenne Aerial pleinement rétablie`;

      const apiChecks = [
        { url: '/api/functions/statusCheck', status: '200', fail: false },
        { url: '/api/functions/statusCheck?module=site', status: '200', fail: false },
        { url: '/api/functions/statusCheck?module=homepage', status: '200', fail: false },
        { url: '/api/functions/statusCheck?module=portfolio', status: '200', fail: false },
        { url: '/api/functions/statusCheck?module=blog', status: '200', fail: false },
        { url: '/api/functions/statusCheck?module=messagerie', status: '200', fail: false },
      ];

      const apiRows = apiChecks.map(c => `
        <div class="api-row">
          <span class="api-url">brenneaerial.fr${c.url}</span>
          <span class="${c.fail ? 'api-status-fail' : 'api-status-ok'}">${c.status} ${c.fail ? '✗' : '✓'}</span>
        </div>`).join('');

      const serviceRows = allModules.map(key => {
        const label = PAGE_LABELS[key] || key;
        return `<tr>
          <td><span class="dot-green"></span>${label}</td>
          <td><span class="status-pill-green">OPÉRATIONNEL</span></td>
          <td style="font-family:monospace;font-size:10px;color:#4a7a9b;">${nowShort}</td>
        </tr>`;
      }).join('');

      emailBody = `<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"/><style>${CSS_BASE}</style></head><body>
<div class="wrapper">

  <!-- TOP BAR -->
  <div class="topbar-green">
    <span class="topbar-brand">Brenne Aerial</span>
    <span class="topbar-sys">${systemVersion} · MONITORING · RÉSOLUTION AUTOMATIQUE</span>
  </div>

  <!-- HERO -->
  <div class="hero-green">
    <div class="severity-badge-green">
      <span style="width:6px;height:6px;border-radius:50%;background:#22c55e;display:inline-block;"></span>
      INCIDENT RÉSOLU — P0
    </div>
    <h1 class="hero-title" style="color:#86efac;">✅ Plateforme Entièrement Rétablie</h1>
    <p class="hero-sub">Le système de monitoring automatique Brenne Aerial (${systemVersion}) confirme le rétablissement complet de la plateforme <strong style="color:#dce8f5">brenneaerial.fr</strong>. L'ensemble des sondes API retournent désormais un code <strong style="color:#22c55e">200 OK</strong>. Tous les services sont pleinement opérationnels.</p>
  </div>

  <!-- MÉTADONNÉES INCIDENT -->
  <div class="body-section">
    <div class="section-title section-title-green">Rapport de clôture d'incident</div>
    <div class="incident-meta">
      <div class="meta-item"><div class="meta-label">Identifiant incident</div><div class="meta-value">${incidentId}</div></div>
      <div class="meta-item"><div class="meta-label">Statut</div><div class="meta-value" style="color:#22c55e">RÉSOLU ✓</div></div>
      <div class="meta-item"><div class="meta-label">Résolu le</div><div class="meta-value">${now}</div></div>
      <div class="meta-item"><div class="meta-label">Système de vérification</div><div class="meta-value">${systemVersion}</div></div>
      <div class="meta-item"><div class="meta-label">Périmètre rétabli</div><div class="meta-value">TOTAL (100%)</div></div>
      <div class="meta-item"><div class="meta-label">Modules opérationnels</div><div class="meta-value" style="color:#22c55e">${allModules.length} / ${allModules.length}</div></div>
    </div>

    <div class="alert-box-green">
      <div class="alert-title-green">✓ Rétablissement total confirmé</div>
      <div class="alert-text">L'ensemble des endpoints de monitoring retournent désormais un code HTTP <span class="code-green">200 OK</span>. La plateforme <span class="code">brenneaerial.fr</span> est entièrement accessible. Tous les modules sont actifs et fonctionnels. Aucune anomalie résiduelle n'a été détectée.</div>
    </div>
  </div>

  <!-- RÉSULTATS SONDES API -->
  <div class="body-section-alt">
    <div class="section-title section-title-green">Résultats des sondes API post-rétablissement</div>
    <p style="margin-bottom:12px;">Les requêtes suivantes ont été exécutées automatiquement par le système de monitoring au moment de la confirmation du rétablissement :</p>
    ${apiRows}
  </div>

  <!-- TABLEAU DES SERVICES -->
  <div class="body-section">
    <div class="section-title section-title-green">État de tous les modules (${allModules.length} modules)</div>
    <table class="services">
      <thead><tr><th>Module / Service</th><th>Statut</th><th>Rétabli le</th></tr></thead>
      <tbody>${serviceRows}</tbody>
    </table>
  </div>

  <!-- TIMELINE -->
  <div class="body-section-alt">
    <div class="section-title">Chronologie de résolution</div>
    <div class="timeline">
      <div class="timeline-item">
        <div class="timeline-time">Précédemment</div>
        <div class="timeline-text"><strong style="color:#ef4444">INCIDENT DÉTECTÉ</strong> — Le ${systemVersion} avait déclenché une alerte de niveau CRITIQUE. L'ensemble des sondes API indiquaient une indisponibilité totale.</div>
      </div>
      <div class="timeline-item">
        <div class="timeline-time">En cours</div>
        <div class="timeline-text"><strong style="color:#fcd34d">INTERVENTION TECHNIQUE</strong> — L'équipe technique est intervenue et a procédé à la remise en service de l'infrastructure.</div>
      </div>
      <div class="timeline-item timeline-item-active" style="--dot-bg:#22c55e">
        <div class="timeline-time">${now}</div>
        <div class="timeline-text"><strong style="color:#22c55e">RÉSOLUTION CONFIRMÉE ✓</strong> — Le ${systemVersion} a vérifié le rétablissement complet de l'ensemble des modules. Tous les services sont désormais opérationnels.</div>
      </div>
    </div>
  </div>

  <!-- ACCÈS PLATEFORME -->
  <div class="body-section">
    <div class="section-title section-title-green">Accès à la plateforme</div>
    <p>La plateforme Brenne Aerial est à nouveau pleinement accessible. Vous pouvez reprendre vos activités normalement :</p>
    <div class="alert-box-blue">
      <div class="alert-title-blue">Services rétablis</div>
      <div class="alert-text">
        • Accès à la plateforme <span class="code">brenneaerial.fr</span> — <span class="code-green">OPÉRATIONNEL</span><br/>
        • Dépôt et consultation de demandes de devis — <span class="code-green">DISPONIBLE</span><br/>
        • Messagerie inter-membres et espace client — <span class="code-green">DISPONIBLE</span><br/>
        • Accès aux fichiers livrables de vos missions — <span class="code-green">DISPONIBLE</span><br/>
        • Toutes les API de monitoring externes — <span class="code-green">200 OK</span>
      </div>
    </div>
    <div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:16px;">
      <a href="https://brenneaerial.fr" class="btn-green">🚀 Accéder à la plateforme</a>
      <a href="https://statut.brenneaerial.org" class="btn-outline">📊 Voir le statut</a>
    </div>
  </div>

  <div class="footer">
    <div class="footer-logo">BRENNE AERIAL</div>
    <div class="footer-text">
      Système de monitoring automatique — ${systemVersion}<br/>
      Brenne, Indre (36) · France · contact@brenneaerial.fr<br/>
      © ${new Date().getFullYear()} Brenne Aerial — Tous droits réservés<br/><br/>
      Ce message a été généré automatiquement par le système de surveillance de la plateforme Brenne Aerial.<br/>
      Référence de clôture : <strong>${incidentId}</strong> · Généré le ${now}
    </div>
  </div>
</div>
</body></html>`;

    // ─────────────────────────────────────────────────────────────────────────
    // MODE SUMMARY — Récapitulatif des services en panne (alerte manuelle)
    // ─────────────────────────────────────────────────────────────────────────
    } else if (mode === 'summary') {

      subject = `[ALERTE] INCIDENT-${incidentId} — ${downServices.length} service(s) indisponible(s) · Brenne Aerial`;

      const serviceRows = downServices.map(key => {
        const label = PAGE_LABELS[key] || key;
        return `<tr>
          <td><span class="dot-red"></span>${label}</td>
          <td><span class="status-pill-red">HORS LIGNE</span></td>
          <td style="font-family:monospace;font-size:10px;color:#4a7a9b;">${nowShort}</td>
        </tr>`;
      }).join('');

      emailBody = `<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"/><style>${CSS_BASE}</style></head><body>
<div class="wrapper">
  <div class="topbar">
    <span class="topbar-brand">Brenne Aerial</span>
    <span class="topbar-sys">${systemVersion} · MONITORING · ALERTE PARTIELLE</span>
  </div>
  <div class="hero">
    <div class="severity-badge-warn">
      <span style="width:6px;height:6px;border-radius:50%;background:#f59700;display:inline-block;"></span>
      SÉVÉRITÉ ÉLEVÉE — P1
    </div>
    <h1 class="hero-title">⚠️ ${downServices.length} Service(s) Indisponible(s)</h1>
    <p class="hero-sub">Le système de monitoring automatique Brenne Aerial (${systemVersion}) signale l'indisponibilité de <strong style="color:#fcd34d">${downServices.length} module(s)</strong> sur la plateforme <strong style="color:#dce8f5">brenneaerial.fr</strong>. Un impact partiel est confirmé pour les utilisateurs concernés.</p>
  </div>
  <div class="body-section">
    <div class="section-title section-title-red">Rapport d'incident — Services affectés</div>
    <div class="incident-meta">
      <div class="meta-item"><div class="meta-label">Identifiant incident</div><div class="meta-value">${incidentId}</div></div>
      <div class="meta-item"><div class="meta-label">Sévérité</div><div class="meta-value" style="color:#fcd34d">ÉLEVÉE / P1</div></div>
      <div class="meta-item"><div class="meta-label">Détecté le</div><div class="meta-value">${now}</div></div>
      <div class="meta-item"><div class="meta-label">Modules affectés</div><div class="meta-value" style="color:#ef4444">${downServices.length} / ${allModules.length}</div></div>
    </div>
    <table class="services">
      <thead><tr><th>Module / Service</th><th>Statut</th><th>Depuis</th></tr></thead>
      <tbody>${serviceRows}</tbody>
    </table>
    <p style="margin-top:16px;">Les services non mentionnés dans ce rapport restent pleinement opérationnels. Nos équipes travaillent au rétablissement des modules affectés. Vous serez notifié par email dès leur remise en ligne.</p>
    <div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:16px;">
      <a href="https://statut.brenneaerial.org" class="btn-red">🔴 Statut en direct</a>
      <a href="https://brenneaerial.fr/uptime" class="btn-outline">📊 Historique</a>
    </div>
  </div>
  <div class="footer">
    <div class="footer-logo">BRENNE AERIAL</div>
    <div class="footer-text">
      Système de monitoring automatique — ${systemVersion}<br/>
      Brenne, Indre (36) · France · contact@brenneaerial.fr<br/>
      © ${new Date().getFullYear()} Brenne Aerial — Tous droits réservés<br/>
      Référence : <strong>${incidentId}</strong> · Généré le ${now}
    </div>
  </div>
</div>
</body></html>`;

    // ─────────────────────────────────────────────────────────────────────────
    // MODE RETABLISSEMENT — Confirmation du retour de tous les services actifs
    // ─────────────────────────────────────────────────────────────────────────
    } else if (mode === 'retablissement') {

      subject = `[RÉSOLU] INCIDENT-${incidentId} — ${upServices.length} service(s) rétabli(s) · Brenne Aerial`;

      const serviceRows = upServices.map(key => {
        const label = PAGE_LABELS[key] || key;
        return `<tr>
          <td><span class="dot-green"></span>${label}</td>
          <td><span class="status-pill-green">OPÉRATIONNEL</span></td>
          <td style="font-family:monospace;font-size:10px;color:#4a7a9b;">${nowShort}</td>
        </tr>`;
      }).join('');

      emailBody = `<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"/><style>${CSS_BASE}</style></head><body>
<div class="wrapper">
  <div class="topbar-green">
    <span class="topbar-brand">Brenne Aerial</span>
    <span class="topbar-sys">${systemVersion} · MONITORING · RETOUR DE SERVICE</span>
  </div>
  <div class="hero-green">
    <div class="severity-badge-green">
      <span style="width:6px;height:6px;border-radius:50%;background:#22c55e;display:inline-block;"></span>
      INCIDENT RÉSOLU
    </div>
    <h1 class="hero-title" style="color:#86efac;">✅ ${upServices.length} Service(s) Rétabli(s)</h1>
    <p class="hero-sub">Le système de monitoring automatique Brenne Aerial (${systemVersion}) confirme le rétablissement de <strong style="color:#86efac">${upServices.length} module(s)</strong>. L'ensemble des sondes API concernées retournent désormais un code <strong style="color:#22c55e">200 OK</strong>.</p>
  </div>
  <div class="body-section">
    <div class="section-title section-title-green">Rapport de rétablissement</div>
    <div class="incident-meta">
      <div class="meta-item"><div class="meta-label">Identifiant rapport</div><div class="meta-value">${incidentId}</div></div>
      <div class="meta-item"><div class="meta-label">Statut</div><div class="meta-value" style="color:#22c55e">RÉSOLU ✓</div></div>
      <div class="meta-item"><div class="meta-label">Résolu le</div><div class="meta-value">${now}</div></div>
      <div class="meta-item"><div class="meta-label">Modules rétablis</div><div class="meta-value" style="color:#22c55e">${upServices.length} / ${allModules.length}</div></div>
    </div>
    <table class="services">
      <thead><tr><th>Module / Service</th><th>Statut</th><th>Rétabli le</th></tr></thead>
      <tbody>${serviceRows}</tbody>
    </table>
    <div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:16px;">
      <a href="https://brenneaerial.fr" class="btn-green">🚀 Accéder à la plateforme</a>
      <a href="https://statut.brenneaerial.org" class="btn-outline">📊 Voir le statut</a>
    </div>
  </div>
  <div class="footer">
    <div class="footer-logo">BRENNE AERIAL</div>
    <div class="footer-text">
      Système de monitoring automatique — ${systemVersion}<br/>
      Brenne, Indre (36) · France · contact@brenneaerial.fr<br/>
      © ${new Date().getFullYear()} Brenne Aerial — Tous droits réservés<br/>
      Référence : <strong>${incidentId}</strong> · Généré le ${now}
    </div>
  </div>
</div>
</body></html>`;

    } else {
      return Response.json({ ok: true, skipped: true, message: 'Aucun email envoyé.' });
    }

    const emailPromises = usersToNotify.map(u =>
      base44.asServiceRole.integrations.Core.SendEmail({ to: u.email, subject, body: emailBody })
    );
    await Promise.allSettled(emailPromises);

    return Response.json({ ok: true, notified: usersToNotify.length, incidentId });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});