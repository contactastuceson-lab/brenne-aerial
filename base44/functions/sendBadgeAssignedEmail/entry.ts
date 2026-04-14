import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const APP_URL = 'https://brenneaerial.fr';

const BADGE_TEMPLATES = {
  // ── VÉRIFICATIONS ──────────────────────────────────────────────────────────
  verified: {
    subject: '✅ Vous êtes maintenant Vérifié sur Brenne Aerial',
    accentColor: '#38aadc',
    emoji: '✅',
    headline: 'Compte Vérifié',
    subline: 'Votre identité a été confirmée par notre équipe.',
    message: `Bonne nouvelle ! Votre compte vient d'être vérifié manuellement par l'équipe Brenne Aerial. Ce badge bleu confirme que vous êtes bien la personne que vous prétendez être sur la plateforme.`,
    highlight: 'Votre badge ✅ Vérifié est désormais visible sur votre profil et dans la communauté.',
    cta: 'Voir mon profil',
    tone: 'standard',
  },
  pro: {
    subject: '💎 Badge Pro activé — Brenne Aerial',
    accentColor: '#10b981',
    emoji: '💎',
    headline: 'Badge Pro',
    subline: 'Votre statut de professionnel a été validé.',
    message: `Félicitations ! Votre profil professionnel a été examiné et validé par notre équipe. Le badge Pro distingue les créateurs, indépendants et professionnels actifs sur la plateforme.`,
    highlight: 'Votre badge 💎 Pro est désormais affiché sur votre profil.',
    cta: 'Voir mon profil',
    tone: 'standard',
  },
  certified: {
    subject: '🏅 Certification officielle obtenue — Brenne Aerial',
    accentColor: '#f59e0b',
    emoji: '🏅',
    headline: 'Badge Certifié',
    subline: 'Votre expertise est officiellement reconnue.',
    message: `Votre dossier a été étudié avec soin. Vos références, votre audience et votre parcours ont convaincu notre équipe : vous êtes désormais officiellement Certifié sur Brenne Aerial. Une distinction réservée aux profils d'exception.`,
    highlight: 'Badge 🏅 Certifié affiché sur votre profil — seulement pour les meilleurs.',
    cta: 'Voir mon profil certifié',
    tone: 'premium',
  },
  official: {
    subject: '🏢 Badge Officiel — Votre entité est reconnue sur Brenne Aerial',
    accentColor: '#a855f7',
    emoji: '🏢',
    headline: 'Badge Officiel',
    subline: 'Votre organisation est officiellement référencée.',
    message: `Votre entité, marque ou organisation a été vérifiée et acceptée par l'équipe Brenne Aerial. Le badge Officiel garantit à la communauté l'authenticité et la légitimité de votre présence sur la plateforme.`,
    highlight: 'Badge 🏢 Officiel activé — visible par toute la communauté.',
    cta: 'Voir le profil officiel',
    tone: 'premium',
  },
  supreme: {
    subject: '👑 Vous avez été élevé au rang Suprême — Brenne Aerial',
    accentColor: '#f59e0b',
    emoji: '👑',
    headline: 'SUPRÊME',
    subline: 'Le badge le plus rare de la plateforme.',
    message: null, // handled separately in template
    highlight: null,
    cta: 'Accéder à mon profil Suprême',
    tone: 'supreme',
  },

  // ── BADGES COMMUNAUTAIRES ──────────────────────────────────────────────────
  'Fondateur': {
    subject: '⭐ Badge Fondateur — Merci d\'être là depuis le début',
    accentColor: '#f59e0b',
    emoji: '⭐',
    headline: 'Badge Fondateur',
    subline: 'Vous faites partie de l\'histoire de Brenne Aerial.',
    message: `Ce badge est une marque de reconnaissance pour celles et ceux qui ont cru en Brenne Aerial dès ses débuts. Vous faites partie des membres qui ont contribué à bâtir cette communauté. Merci d'être là.`,
    highlight: 'Badge ⭐ Fondateur — une distinction rare et permanente.',
    cta: 'Voir mon profil',
    tone: 'premium',
  },
  'Collaborateur': {
    subject: '🤝 Vous êtes désormais Collaborateur officiel — Brenne Aerial',
    accentColor: '#38aadc',
    emoji: '🤝',
    headline: 'Badge Collaborateur',
    subline: 'Vous collaborez officiellement avec Brenne Aerial.',
    message: `Notre équipe vous a attribué le badge Collaborateur. Cela signifie que vous travaillez ou avez contribué de manière significative avec Brenne Aerial. Nous sommes ravis de cette collaboration.`,
    highlight: 'Badge Collaborateur visible sur votre profil.',
    cta: 'Voir mon profil',
    tone: 'standard',
  },
  'VIP': {
    subject: '🌟 Statut VIP activé sur Brenne Aerial',
    accentColor: '#a855f7',
    emoji: '🌟',
    headline: 'Badge VIP',
    subline: 'Vous faites partie des membres d\'exception.',
    message: `Le statut VIP est attribué à une sélection très restreinte de membres qui se distinguent par leur engagement, leur soutien ou leur apport exceptionnel à la communauté. Bienvenue dans ce cercle privilégié.`,
    highlight: 'Badge 🌟 VIP activé — accès au cercle restreint.',
    cta: 'Voir mon profil VIP',
    tone: 'premium',
  },
  'Admin': {
    subject: '🛡️ Droits Administrateur attribués — Brenne Aerial',
    accentColor: '#ef4444',
    emoji: '🛡️',
    headline: 'Badge Admin',
    subline: 'Vous disposez des droits administrateur.',
    message: `Les accès administrateur vous ont été confiés sur la plateforme Brenne Aerial. Cette responsabilité implique la gestion et la modération de la communauté. Merci pour votre engagement.`,
    highlight: 'Accès admin activé sur votre compte.',
    cta: 'Voir mon profil',
    tone: 'standard',
  },
  'Pilote': {
    subject: '✈️ Badge Pilote attribué — Brenne Aerial',
    accentColor: '#38aadc',
    emoji: '✈️',
    headline: 'Badge Pilote',
    subline: 'Votre statut de pilote est reconnu sur la plateforme.',
    message: `Le badge Pilote a été attribué à votre compte. Il distingue les membres pratiquant le pilotage de drone de manière sérieuse et reconnue au sein de la communauté Brenne Aerial.`,
    highlight: 'Badge ✈️ Pilote affiché sur votre profil.',
    cta: 'Voir mon profil',
    tone: 'standard',
  },
  'Officiel': {
    subject: '✔️ Badge Officiel attribué — Brenne Aerial',
    accentColor: '#a855f7',
    emoji: '✔️',
    headline: 'Badge Officiel',
    subline: 'Votre compte a été reconnu comme officiel.',
    message: `Votre compte a été désigné comme officiel par l'équipe Brenne Aerial. Ce badge garantit à la communauté l'authenticité de votre profil.`,
    highlight: 'Badge Officiel activé sur votre profil.',
    cta: 'Voir mon profil',
    tone: 'standard',
  },
  'Vérifié': {
    subject: '✅ Badge Vérifié attribué — Brenne Aerial',
    accentColor: '#38aadc',
    emoji: '✅',
    headline: 'Badge Vérifié',
    subline: 'Votre compte a été vérifié par notre équipe.',
    message: `Votre compte vient d'être vérifié par l'équipe Brenne Aerial. Ce badge confirme l'authenticité de votre profil au sein de la communauté.`,
    highlight: 'Badge ✅ Vérifié visible sur votre profil.',
    cta: 'Voir mon profil',
    tone: 'standard',
  },
  'Beta Testeur': {
    subject: '🧪 Badge Beta Testeur — Merci pour votre aide !',
    accentColor: '#ec4899',
    emoji: '🧪',
    headline: 'Badge Beta Testeur',
    subline: 'Vous aidez à façonner l\'avenir de Brenne Aerial.',
    message: `Vous faites partie des premiers à tester les nouvelles fonctionnalités de Brenne Aerial avant tout le monde. Votre retour est précieux et contribue directement à améliorer l'expérience de toute la communauté.`,
    highlight: 'Badge 🧪 Beta Testeur — merci pour votre précieuse contribution.',
    cta: 'Voir mon profil',
    tone: 'standard',
  },
  'Partenaire': {
    subject: '🤝 Partenariat officiel Brenne Aerial confirmé',
    accentColor: '#f97316',
    emoji: '🤝',
    headline: 'Badge Partenaire',
    subline: 'Vous êtes partenaire officiel de Brenne Aerial.',
    message: `Votre partenariat avec Brenne Aerial a été officialisé. Ce badge marque le début d'une collaboration reconnue sur la plateforme. Nous sommes ravis de vous compter parmi nos partenaires.`,
    highlight: 'Badge Partenaire visible sur votre profil et dans la communauté.',
    cta: 'Voir mon profil',
    tone: 'standard',
  },
};

function buildEmail(tpl, userName) {
  const name = userName || 'cher membre';
  const profileUrl = `${APP_URL}/profile`;

  if (tpl.tone === 'supreme') {
    return `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#000000;">
<div style="font-family:'Segoe UI',sans-serif;max-width:620px;margin:auto;background:#000000;color:#f5e6c8;">

  <!-- Supreme Header -->
  <div style="background:linear-gradient(135deg,#0a0600 0%,#1a0e00 40%,#0a0600 100%);padding:54px 40px 40px;text-align:center;border-bottom:2px solid #b45309;">
    <p style="color:#92400e;font-size:9px;font-weight:700;letter-spacing:6px;text-transform:uppercase;margin:0 0 20px;">BRENNE AERIAL · DISTINCTION SUPRÊME · CONFIDENTIEL</p>
    <div style="font-size:60px;margin:0 0 18px;">👑</div>
    <h1 style="background:linear-gradient(135deg,#f59e0b,#fde68a,#d97706,#fde68a,#f59e0b);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;font-size:46px;font-weight:900;letter-spacing:6px;margin:0 0 10px;text-transform:uppercase;">SUPRÊME</h1>
    <p style="color:#d97706;font-size:12px;letter-spacing:3px;margin:0;text-transform:uppercase;">Le rang le plus élevé · Sur invitation exclusive de la Direction</p>
  </div>

  <!-- Divider gold line -->
  <div style="height:3px;background:linear-gradient(90deg,transparent,#f59e0b,#fde68a,#f59e0b,transparent);"></div>

  <!-- Intro message -->
  <div style="padding:44px 40px 0;background:linear-gradient(180deg,#0a0600 0%,#060408 100%);">
    <p style="color:#d97706;font-size:13px;letter-spacing:1px;margin:0 0 8px;text-transform:uppercase;font-weight:600;">Message Personnel</p>
    <p style="color:#e8d5a3;font-size:15px;line-height:1.9;margin:0 0 20px;">
      À <strong style="color:#fde68a;">${name}</strong>,
    </p>
    <p style="color:#c4a47c;font-size:14px;line-height:1.9;margin:0 0 18px;">
      Ce message ne vous parvient pas par hasard. Il est le résultat d'une décision personnelle, réfléchie, et rarissime — prise directement par la <strong style="color:#fde68a;">Direction de Brenne Aerial (PDG ou PDG-Adjoint)</strong>.
    </p>
    <p style="color:#c4a47c;font-size:14px;line-height:1.9;margin:0 0 18px;">
      Le rang <strong style="color:#fde68a;">Suprême</strong> n'existe pas dans nos catalogues. Il ne s'achète pas. Il ne se demande pas. Il ne se gagne pas par le nombre de posts ou de followers. Il est attribué, à titre exceptionnel, à des individus qui ont laissé une empreinte réelle et profonde sur la communauté Brenne Aerial.
    </p>
    <p style="color:#c4a47c;font-size:14px;line-height:1.9;margin:0 0 18px;">
      Seuls le PDG et le PDG-Adjoint possèdent la clé de cette distinction. Aucun administrateur, aucun modérateur, aucun collaborateur ne peut l'attribuer. C'est une décision qui appartient à la direction — et cette décision, aujourd'hui, vous concerne.
    </p>
  </div>

  <!-- Gold separator -->
  <div style="padding:0 40px;background:#060408;">
    <div style="height:1px;background:linear-gradient(90deg,transparent,#b45309,transparent);margin:28px 0;"></div>
  </div>

  <!-- Gold card -->
  <div style="padding:0 40px;background:#060408;">
    <div style="background:linear-gradient(135deg,#1a0e00,#2d1a00);border:1px solid #b45309;border-radius:16px;padding:32px;margin:0 0 32px;text-align:center;box-shadow:0 0 60px rgba(245,158,11,0.15);">
      <p style="color:#fde68a;font-size:11px;letter-spacing:4px;text-transform:uppercase;margin:0 0 12px;">BADGE DÉCERNÉ PERSONNELLEMENT PAR LE PDG</p>
      <p style="background:linear-gradient(135deg,#f59e0b,#fde68a,#b45309,#fde68a,#f59e0b);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;font-size:36px;font-weight:900;margin:0 0 12px;letter-spacing:3px;">👑 SUPRÊME</p>
      <p style="color:#92400e;font-size:11px;margin:0 0 6px;">Sur invitation exclusive · Non transférable · Permanent</p>
      <p style="color:#78350f;font-size:10px;margin:0;">Attribué à : <span style="color:#d97706;">${name}</span></p>
    </div>
  </div>

  <!-- What it means -->
  <div style="padding:0 40px 8px;background:#060408;">
    <p style="color:#d97706;font-size:11px;letter-spacing:3px;text-transform:uppercase;font-weight:700;margin:0 0 16px;">Ce que cela signifie</p>
    <p style="color:#c4a47c;font-size:14px;line-height:1.9;margin:0 0 16px;">
      En portant le badge Suprême, vous rejoignez un cercle d'une extrême exclusivité. Vous êtes désormais l'un des rares membres à bénéficier du rang le plus élevé que Brenne Aerial puisse offrir. Ce badge est affiché en premier sur votre profil, visible par l'ensemble de la communauté, et identifié comme la distinction ultime de la plateforme.
    </p>
    <p style="color:#c4a47c;font-size:14px;line-height:1.9;margin:0 0 16px;">
      Il témoigne non seulement de votre valeur en tant que membre, mais aussi de la confiance directe que le PDG de Brenne Aerial vous accorde. C'est une marque d'estime sincère et personnelle.
    </p>
  </div>

  <!-- Divider -->
  <div style="padding:0 40px;background:#060408;">
    <div style="height:1px;background:linear-gradient(90deg,transparent,#b45309,transparent);margin:24px 0;"></div>
  </div>

  <!-- Closing words -->
  <div style="padding:0 40px 40px;background:#060408;">
    <p style="color:#c4a47c;font-size:14px;line-height:1.9;margin:0 0 16px;">
      Portez ce rang avec la discrétion et la fierté qu'il mérite. Vous faites désormais partie d'une histoire — celle de Brenne Aerial — à un niveau que très peu atteindront jamais.
    </p>
    <p style="color:#92400e;font-size:13px;font-style:italic;margin:0 0 36px;">
      — La Direction de Brenne Aerial (PDG &amp; PDG-Adjoint)
    </p>

    <!-- CTA -->
    <div style="text-align:center;margin:0 0 8px;">
      <a href="${profileUrl}" style="display:inline-block;background:linear-gradient(135deg,#f59e0b,#d97706);color:#000000;padding:18px 48px;border-radius:12px;text-decoration:none;font-weight:800;font-size:15px;letter-spacing:1.5px;box-shadow:0 6px 30px rgba(245,158,11,0.35);text-transform:uppercase;">
        👑 Accéder à mon profil Suprême
      </a>
    </div>
  </div>

  <!-- Footer -->
  <div style="padding:20px 40px;border-top:1px solid #1a0e00;text-align:center;background:#000000;">
    <p style="color:#4a3510;font-size:10px;margin:0;letter-spacing:2px;text-transform:uppercase;">BRENNE AERIAL · DISTINCTION EXCLUSIVE · CONFIDENTIEL</p>
    <p style="color:#3a2a0a;font-size:10px;margin:6px 0 0;"><a href="${profileUrl}" style="color:#4a3510;text-decoration:underline;">brenneaerial.fr/profile</a></p>
  </div>
</div>
</body>
</html>`;
  }

  if (tpl.tone === 'premium') {

    return `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#060e1c;">
<div style="font-family:'Segoe UI',sans-serif;max-width:580px;margin:auto;background:#060e1c;color:#e8edf5;border:1px solid #1a2d4a;border-radius:16px;overflow:hidden;">

  <!-- Header premium -->
  <div style="background:linear-gradient(135deg,#0a1628 0%,#0f1f3d 60%,#0a1628 100%);padding:40px 36px 32px;text-align:center;border-bottom:1px solid ${tpl.accentColor}30;">
    <p style="color:${tpl.accentColor};font-size:10px;font-weight:700;letter-spacing:4px;text-transform:uppercase;margin:0 0 14px;">BRENNE AERIAL</p>
    <div style="font-size:44px;margin:0 0 14px;">${tpl.emoji}</div>
    <h1 style="color:#ffffff;font-size:28px;font-weight:800;margin:0 0 6px;">${tpl.headline}</h1>
    <p style="color:${tpl.accentColor};font-size:13px;margin:0;">${tpl.subline}</p>
  </div>

  <!-- Body -->
  <div style="padding:36px;">
    <p style="color:#a0aec0;margin:0 0 20px;font-size:14px;">Bonjour <strong style="color:#e8edf5;">${name}</strong>,</p>

    <p style="color:#c8d3e0;font-size:14px;line-height:1.8;margin:0 0 24px;">${tpl.message}</p>

    <!-- Highlight card -->
    <div style="background:linear-gradient(135deg,#0f1f3d,#0a1628);border:1px solid ${tpl.accentColor}50;border-radius:12px;padding:20px 24px;margin:0 0 28px;border-left:3px solid ${tpl.accentColor};">
      <p style="color:${tpl.accentColor};font-size:13px;font-weight:600;margin:0;">${tpl.highlight}</p>
    </div>

    <!-- CTA -->
    <div style="text-align:center;margin:0 0 8px;">
      <a href="${profileUrl}" style="display:inline-block;background:${tpl.accentColor};color:#060e1c;padding:14px 36px;border-radius:10px;text-decoration:none;font-weight:700;font-size:14px;letter-spacing:0.5px;">
        ${tpl.cta} →
      </a>
    </div>
  </div>

  <!-- Footer -->
  <div style="padding:18px 36px;border-top:1px solid #1a2d4a;text-align:center;background:#040b17;">
    <p style="color:#374151;font-size:11px;margin:0;">Brenne Aerial · Communauté de créateurs</p>
    <p style="color:#374151;font-size:11px;margin:4px 0 0;"><a href="${profileUrl}" style="color:#4b5563;text-decoration:underline;">Voir mon profil</a></p>
  </div>
</div>
</body>
</html>`;
  }

  // Standard tone
  return `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#060e1c;">
<div style="font-family:'Segoe UI',sans-serif;max-width:560px;margin:auto;background:#060e1c;color:#e8edf5;border:1px solid #1a2d4a;border-radius:14px;overflow:hidden;">

  <!-- Header -->
  <div style="background:#0a1628;padding:32px 32px 24px;text-align:center;border-bottom:1px solid #1a2d4a;">
    <p style="color:#38aadc;font-size:10px;font-weight:600;letter-spacing:3px;text-transform:uppercase;margin:0 0 12px;">BRENNE AERIAL</p>
    <div style="font-size:36px;margin:0 0 12px;">${tpl.emoji}</div>
    <h1 style="color:#ffffff;font-size:22px;font-weight:800;margin:0 0 4px;">${tpl.headline}</h1>
    <p style="color:${tpl.accentColor};font-size:12px;margin:0;">${tpl.subline}</p>
  </div>

  <!-- Body -->
  <div style="padding:28px 32px;">
    <p style="color:#a0aec0;margin:0 0 16px;font-size:14px;">Bonjour <strong style="color:#e8edf5;">${name}</strong>,</p>
    <p style="color:#c8d3e0;font-size:14px;line-height:1.7;margin:0 0 20px;">${tpl.message}</p>

    <!-- Badge pill -->
    <div style="background:#0f1f3d;border:1px solid ${tpl.accentColor}40;border-radius:10px;padding:14px 20px;margin:0 0 24px;display:inline-block;">
      <span style="color:${tpl.accentColor};font-size:14px;font-weight:700;">${tpl.emoji} ${tpl.headline}</span>
      <span style="color:#4a5568;font-size:12px;margin-left:8px;">attribué ✓</span>
    </div>

    <p style="color:#6b7280;font-size:13px;margin:0 0 24px;">${tpl.highlight}</p>

    <!-- CTA -->
    <div style="text-align:center;">
      <a href="${profileUrl}" style="display:inline-block;background:${tpl.accentColor};color:#060e1c;padding:13px 32px;border-radius:9px;text-decoration:none;font-weight:700;font-size:14px;">
        ${tpl.cta}
      </a>
    </div>
  </div>

  <!-- Footer -->
  <div style="padding:16px 32px;border-top:1px solid #1a2d4a;text-align:center;background:#040b17;">
    <p style="color:#374151;font-size:11px;margin:0;">Brenne Aerial · <a href="${profileUrl}" style="color:#4b5563;text-decoration:underline;">Voir mon profil</a></p>
  </div>
</div>
</body>
</html>`;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { userEmail, userName, badgeKey, badgeLabel, type } = await req.json();

    if (!userEmail) return Response.json({ error: 'Missing userEmail' }, { status: 400 });

    // Resolve template key
    const key = type === 'verification' ? badgeKey : (badgeLabel || badgeKey);
    const tpl = BADGE_TEMPLATES[key] || BADGE_TEMPLATES['verified'];

    const html = buildEmail(tpl, userName);

    await base44.asServiceRole.integrations.Core.SendEmail({
      to: userEmail,
      subject: tpl.subject,
      body: html,
    });

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});