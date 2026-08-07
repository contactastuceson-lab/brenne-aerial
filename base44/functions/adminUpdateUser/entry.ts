import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import { ezaEmailShell } from '../../shared/ezaEmails.ts';

const STATUS_LABELS = {
  banned:     { fr: 'banni',     title: 'Compte banni',     emoji: '⛔' },
  suspended:  { fr: 'suspendu',  title: 'Compte suspendu',  emoji: '⏸' },
  restricted: { fr: 'restreint', title: 'Accès restreint',  emoji: '⚠️' },
};

function buildStandardEmail({ name, status, reason, until }) {
  const cfg = STATUS_LABELS[status] || { fr: status, title: 'Statut mis à jour', emoji: '⚠️' };
  const untilBlock = until
    ? `<p style="color:#aaa;font-size:13px;">Fin prévue : <strong style="color:#fff">${new Date(until).toLocaleDateString('fr-FR', { day:'numeric', month:'long', year:'numeric' })}</strong></p>`
    : '';
  const reasonBlock = reason
    ? `<div style="background:#1a1a2e;border:1px solid #333;border-radius:10px;padding:14px 18px;margin:16px 0;"><p style="color:#888;font-size:11px;margin:0 0 4px;">MOTIF</p><p style="color:#ccc;font-size:13px;margin:0;">${reason}</p></div>`
    : '';
  return `<!DOCTYPE html><html><body style="margin:0;padding:0;background:#0a0a0f;font-family:Inter,sans-serif;">
<div style="max-width:520px;margin:40px auto;background:#111118;border:1px solid #222;border-radius:16px;overflow:hidden;">
  <div style="background:linear-gradient(135deg,#1a1a2e,#0f0f1a);padding:30px 32px;border-bottom:1px solid #222;">
    <p style="color:#38aae0;font-size:11px;font-weight:700;letter-spacing:3px;text-transform:uppercase;margin:0 0 8px;">BRENNE AERIAL</p>
    <h1 style="color:#fff;font-size:22px;margin:0;">${cfg.emoji} ${cfg.title}</h1>
  </div>
  <div style="padding:28px 32px;">
    <p style="color:#bbb;font-size:14px;">Bonjour <strong style="color:#fff;">${name}</strong>,</p>
    <p style="color:#999;font-size:13px;line-height:1.6;">Votre compte a été <strong style="color:#fff;">${cfg.fr}</strong> sur la plateforme Brenne Aerial.</p>
    ${reasonBlock}${untilBlock}
    <p style="color:#888;font-size:12px;margin-top:20px;">Pour toute contestation, contactez-nous à <a href="mailto:contact@brenneaerial.fr" style="color:#38aae0;">contact@brenneaerial.fr</a></p>
  </div>
  <div style="padding:16px 32px;border-top:1px solid #222;text-align:center;">
    <p style="color:#555;font-size:11px;margin:0;">© Brenne Aerial — Plateforme drone professionnelle</p>
  </div>
</div></body></html>`;
}

function buildStandardRestoreEmail({ name }) {
  return `<!DOCTYPE html><html><body style="margin:0;padding:0;background:#0a0a0f;font-family:Inter,sans-serif;">
<div style="max-width:520px;margin:40px auto;background:#111118;border:1px solid #222;border-radius:16px;overflow:hidden;">
  <div style="background:linear-gradient(135deg,#1a1a2e,#0f0f1a);padding:30px 32px;border-bottom:1px solid #222;">
    <p style="color:#38aae0;font-size:11px;font-weight:700;letter-spacing:3px;text-transform:uppercase;margin:0 0 8px;">BRENNE AERIAL</p>
    <h1 style="color:#4ade80;font-size:22px;margin:0;">✅ Accès restauré</h1>
  </div>
  <div style="padding:28px 32px;">
    <p style="color:#bbb;font-size:14px;">Bonjour <strong style="color:#fff;">${name}</strong>,</p>
    <p style="color:#999;font-size:13px;line-height:1.6;">Votre compte a été <strong style="color:#4ade80;">restauré</strong> et vous pouvez de nouveau accéder à l'ensemble de la plateforme Brenne Aerial.</p>
    <p style="color:#888;font-size:12px;margin-top:20px;">Une question ? Contactez-nous à <a href="mailto:contact@brenneaerial.fr" style="color:#38aae0;">contact@brenneaerial.fr</a></p>
  </div>
  <div style="padding:16px 32px;border-top:1px solid #222;text-align:center;">
    <p style="color:#555;font-size:11px;margin:0;">© Brenne Aerial — Plateforme drone professionnelle</p>
  </div>
</div></body></html>`;
}

const SUPREME_STATUS_MESSAGES = {
  banned: {
    headline: 'Votre accès à la plateforme Brenne Aerial a été définitivement et irrévocablement révoqué.',
    detail: "Suite à une ou plusieurs violations graves et caractérisées de nos Conditions Générales d'Utilisation, notre équipe administrative a pris la décision de procéder au bannissement permanent de votre compte. Cette décision n'a pas été prise à la légère : elle fait suite à un examen approfondi, rigoureux et collégial de l'ensemble des éléments portés à notre connaissance. Le Rang Suprême confère des privilèges d'exception sur notre plateforme, mais implique en contrepartie une responsabilité et une exemplarité accrues. Ces exigences n'ont pas été respectées.",
    note: "Malgré la gravité de cette décision, nous reconnaissons votre appartenance passée au Rang Suprême. À ce titre, vous bénéficiez d'une voie de recours prioritaire et confidentielle. Si vous estimez que cette décision est injuste, erronée ou disproportionnée, nous vous encourageons vivement à nous contacter par email en exposant vos arguments. Chaque contestation sera examinée avec sérieux par un membre senior de notre équipe. Passé un délai de 30 jours sans contestation de votre part, la décision sera considérée comme définitivement acceptée.",
  },
  suspended: {
    headline: 'Votre accès à la plateforme est temporairement suspendu.',
    detail: "Votre compte Rang Suprême a été temporairement suspendu suite à un manquement identifié à nos règles communautaires. Cette mesure conservatoire a été prise dans l'intérêt de la communauté et de l'intégrité de la plateforme. Elle n'est pas définitive : une résolution satisfaisante de la situation peut entraîner une levée anticipée de la suspension, avant même l'échéance prévue.",
    note: "Durant toute la durée de cette suspension, votre statut Suprême, l'ensemble de vos données, vos avantages exclusifs et vos contenus sont intégralement préservés. Aucune information ne sera supprimée. À la levée de la suspension, vous retrouverez un accès complet et intact à votre espace Suprême.",
  },
  restricted: {
    headline: "Votre compte est actuellement placé en mode d'accès restreint.",
    detail: "Certaines fonctionnalités de votre compte Rang Suprême ont été temporairement désactivées à titre préventif. Cette mesure fait suite à des signalements ou à une situation nécessitant vérification de notre part. Elle ne préjuge en rien d'une sanction définitive et a pour unique objectif de protéger l'ensemble de la communauté le temps que la situation soit clarifiée.",
    note: "Vos privilèges Suprême restent partiellement actifs. Notre équipe dédiée traite votre dossier en priorité absolue. Nous nous engageons à vous tenir informé(e) dans les meilleurs délais de l'issue de cet examen.",
  },
};

function buildSupremeEmail({ name, status, reason, until }) {
  const cfg = STATUS_LABELS[status] || { fr: status, title: 'Statut mis à jour', emoji: '⚠️' };
  const msg = SUPREME_STATUS_MESSAGES[status] || SUPREME_STATUS_MESSAGES.restricted;

  const untilBlock = until
    ? `<div style="margin:16px 0;padding:14px 18px;background:rgba(245,158,11,0.05);border:1px solid rgba(217,119,6,0.3);border-radius:10px;">
        <p style="color:#d97706;font-size:10px;font-weight:700;letter-spacing:2px;text-transform:uppercase;margin:0 0 6px;">&#9200; LEVÉE AUTOMATIQUE</p>
        <p style="color:#f59e0b;font-size:14px;font-weight:700;margin:0;">${new Date(until).toLocaleDateString('fr-FR', { day:'numeric', month:'long', year:'numeric', hour:'2-digit', minute:'2-digit' })}</p>
      </div>`
    : '';
  const reasonBlock = reason
    ? `<div style="background:linear-gradient(135deg,rgba(245,158,11,0.08),rgba(217,119,6,0.04));border:1px solid rgba(217,119,6,0.4);border-radius:12px;padding:16px 20px;margin:16px 0;">
        <p style="color:#d97706;font-size:10px;font-weight:700;letter-spacing:2px;text-transform:uppercase;margin:0 0 8px;">&#128221; MOTIF OFFICIEL</p>
        <p style="color:#c8943a;font-size:13px;line-height:1.6;margin:0;">${reason}</p>
      </div>`
    : '';

  return `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#0d0800;font-family:'Inter',Arial,sans-serif;">
<div style="max-width:580px;margin:40px auto;padding:0 16px;">
  <div style="height:4px;background:linear-gradient(90deg,#92400e,#f59e0b,#fde68a,#f59e0b,#92400e);border-radius:4px 4px 0 0;"></div>
  <div style="background:linear-gradient(180deg,#1a0e00 0%,#0d0800 60%,#120a00 100%);border:1px solid #d97706;border-top:none;border-radius:0 0 20px 20px;overflow:hidden;box-shadow:0 0 60px rgba(245,158,11,0.2);">
    <div style="padding:36px 36px 24px;text-align:center;border-bottom:1px solid rgba(217,119,6,0.2);background:linear-gradient(135deg,#2d1500,#1a0c00);">
      <div style="display:inline-flex;align-items:center;gap:8px;background:linear-gradient(135deg,#78350f,#d97706);padding:6px 20px;border-radius:30px;margin-bottom:20px;box-shadow:0 4px 16px rgba(245,158,11,0.35);">
        <span style="font-size:14px;">&#128081;</span>
        <span style="font-size:10px;font-weight:800;letter-spacing:4px;text-transform:uppercase;color:#fde68a;">RANG SUPRÊME</span>
        <span style="font-size:14px;">&#128081;</span>
      </div>
      <div style="font-size:44px;margin-bottom:10px;">${cfg.emoji}</div>
      <h1 style="color:#f59e0b;font-size:26px;font-weight:800;margin:0;letter-spacing:-0.5px;text-shadow:0 0 30px rgba(245,158,11,0.6);">${cfg.title}</h1>
      <p style="color:#a08040;font-size:12px;margin:8px 0 0;letter-spacing:1px;text-transform:uppercase;">Notification officielle &bull; Brenne Aerial</p>
    </div>
    <div style="padding:32px 36px;">
      <p style="color:#c8943a;font-size:15px;margin:0 0 4px;">Bonjour,</p>
      <p style="font-size:22px;font-weight:700;margin:0 0 24px;color:#f59e0b;">${name}</p>
      <p style="color:#e8c06a;font-size:15px;font-weight:600;line-height:1.5;margin:0 0 12px;">${msg.headline}</p>
      <p style="color:#a08040;font-size:13px;line-height:1.8;margin:0 0 20px;">${msg.detail}</p>
      ${reasonBlock}
      ${untilBlock}
      <div style="background:linear-gradient(135deg,rgba(245,158,11,0.05),transparent);border-left:3px solid #d97706;padding:14px 18px;margin:20px 0;border-radius:0 8px 8px 0;">
        <p style="color:#c8943a;font-size:13px;line-height:1.7;margin:0;">${msg.note}</p>
      </div>
      <div style="height:1px;background:linear-gradient(90deg,transparent,rgba(217,119,6,0.4),transparent);margin:28px 0;"></div>
      <div style="text-align:center;">
        <p style="color:#7a6030;font-size:12px;margin:0 0 12px;">Pour toute contestation prioritaire ou demande d'information :</p>
        <a href="mailto:contact@brenneaerial.fr" style="display:inline-block;background:linear-gradient(135deg,#78350f,#d97706);color:#fff;font-size:13px;font-weight:700;padding:12px 28px;border-radius:30px;text-decoration:none;box-shadow:0 4px 16px rgba(245,158,11,0.35);">Contacter le support Suprême</a>
        <p style="color:#5a4010;font-size:11px;margin:12px 0 0;">contact@brenneaerial.fr &bull; Réponse prioritaire garantie</p>
      </div>
    </div>
    <div style="padding:20px 36px;border-top:1px solid rgba(217,119,6,0.15);text-align:center;background:rgba(0,0,0,0.2);">
      <p style="color:#d97706;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;margin:0 0 6px;">&#9733; BRENNE AERIAL SUPRÊME &#9733;</p>
      <p style="color:#5a4010;font-size:10px;margin:0;">Cette notification vous est envoyée en raison de votre appartenance au Rang Suprême.<br>Ne répondez pas directement à cet e-mail.</p>
    </div>
  </div>
  <div style="height:2px;background:linear-gradient(90deg,transparent,#d97706,transparent);margin-top:2px;"></div>
</div>
</body></html>`;
}

function buildSupremeRestoreEmail({ name }) {
  return `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#0d0800;font-family:'Inter',Arial,sans-serif;">
<div style="max-width:580px;margin:40px auto;padding:0 16px;">
  <div style="height:4px;background:linear-gradient(90deg,#92400e,#f59e0b,#fde68a,#f59e0b,#92400e);border-radius:4px 4px 0 0;"></div>
  <div style="background:linear-gradient(180deg,#1a0e00 0%,#0d0800 60%,#120a00 100%);border:1px solid #d97706;border-top:none;border-radius:0 0 20px 20px;overflow:hidden;box-shadow:0 0 60px rgba(245,158,11,0.2);">

    <!-- Header -->
    <div style="padding:36px 36px 24px;text-align:center;border-bottom:1px solid rgba(217,119,6,0.2);background:linear-gradient(135deg,#2d1500,#1a0c00);">
      <div style="display:inline-flex;align-items:center;gap:8px;background:linear-gradient(135deg,#78350f,#d97706);padding:6px 20px;border-radius:30px;margin-bottom:20px;box-shadow:0 4px 16px rgba(245,158,11,0.35);">
        <span style="font-size:14px;">&#128081;</span>
        <span style="font-size:10px;font-weight:800;letter-spacing:4px;text-transform:uppercase;color:#fde68a;">RANG SUPRÊME</span>
        <span style="font-size:14px;">&#128081;</span>
      </div>
      <div style="font-size:44px;margin-bottom:10px;">&#127775;</div>
      <h1 style="color:#f59e0b;font-size:26px;font-weight:800;margin:0;text-shadow:0 0 30px rgba(245,158,11,0.6);">Une nouvelle chance vous a été accordée</h1>
      <p style="color:#a08040;font-size:12px;margin:8px 0 0;letter-spacing:1px;text-transform:uppercase;">Décision administrative officielle &bull; Brenne Aerial</p>
    </div>

    <!-- Body -->
    <div style="padding:32px 36px;">
      <p style="color:#c8943a;font-size:15px;margin:0 0 4px;">Bonjour,</p>
      <p style="font-size:22px;font-weight:700;margin:0 0 24px;color:#f59e0b;">${name}</p>

      <p style="color:#e8c06a;font-size:15px;font-weight:600;line-height:1.5;margin:0 0 16px;">Votre compte Rang Suprême a été intégralement réactivé. L'ensemble de vos droits, privilèges et accès exclusifs vous sont restitués dès à présent.</p>

      <p style="color:#a08040;font-size:13px;line-height:1.9;margin:0 0 16px;">Cette décision a été prise après examen attentif et délibération au sein de notre équipe administrative. Elle traduit la volonté de Brenne Aerial de ne pas rester figé dans une sanction lorsque les circonstances, l'évolution du dossier ou vos échanges avec notre équipe permettent d'envisager une issue positive. Nous croyons en la capacité de chacun à tirer les leçons de ses erreurs.</p>

      <!-- Chance block -->
      <div style="background:linear-gradient(135deg,rgba(245,158,11,0.08),rgba(217,119,6,0.03));border:1px solid rgba(217,119,6,0.5);border-radius:14px;padding:20px 24px;margin:20px 0;">
        <p style="color:#d97706;font-size:10px;font-weight:800;letter-spacing:3px;text-transform:uppercase;margin:0 0 12px;">&#9889; UNE CHANCE RARE</p>
        <p style="color:#c8943a;font-size:13px;line-height:1.8;margin:0 0 10px;">Le Rang Suprême est réservé à une élite restreinte de notre communauté. La réactivation d'un compte après bannissement est une décision exceptionnelle, qui ne se produit qu'en de très rares circonstances. Nous vous demandons d'en prendre pleinement conscience.</p>
        <p style="color:#a08040;font-size:13px;line-height:1.8;margin:0;">Cette opportunité représente un nouveau départ. Elle s'accompagne d'une confiance renouvelée de notre part envers vous, et nous espérons sincèrement que vous saurez honorer cette confiance par vos actes et votre comportement sur la plateforme.</p>
      </div>

      <!-- Expectations block -->
      <div style="background:rgba(245,158,11,0.03);border-left:3px solid #d97706;padding:16px 20px;margin:20px 0;border-radius:0 10px 10px 0;">
        <p style="color:#d97706;font-size:10px;font-weight:800;letter-spacing:3px;text-transform:uppercase;margin:0 0 10px;">&#128218; CE QUE NOUS ATTENDONS DE VOUS</p>
        <ul style="color:#a08040;font-size:13px;line-height:2;margin:0;padding-left:18px;">
          <li>Respect scrupuleux de nos Conditions Générales d'Utilisation</li>
          <li>Exemplarité et bienveillance envers l'ensemble de la communauté</li>
          <li>Aucune récidive des comportements ayant conduit à la sanction précédente</li>
          <li>Coopération immédiate avec notre équipe en cas de nouveau signalement</li>
        </ul>
      </div>

      <p style="color:#7a6030;font-size:13px;line-height:1.8;margin:20px 0;">Sachez que tout manquement futur aux règles de notre plateforme entraînera une sanction définitive, sans possibilité de recours ni de réactivation. Nous ne vous faisons part de cela non pas pour vous menacer, mais pour vous donner toutes les clés afin que cette situation ne se reproduise pas.</p>

      <div style="height:1px;background:linear-gradient(90deg,transparent,rgba(217,119,6,0.4),transparent);margin:28px 0;"></div>

      <!-- CTA -->
      <div style="text-align:center;">
        <p style="color:#7a6030;font-size:12px;margin:0 0 12px;">Pour toute question ou pour remercier notre équipe :</p>
        <a href="mailto:contact@brenneaerial.fr" style="display:inline-block;background:linear-gradient(135deg,#78350f,#d97706);color:#fff;font-size:13px;font-weight:700;padding:12px 28px;border-radius:30px;text-decoration:none;box-shadow:0 4px 16px rgba(245,158,11,0.35);">Contacter le support Suprême</a>
        <p style="color:#5a4010;font-size:11px;margin:12px 0 0;">contact@brenneaerial.fr &bull; Réponse prioritaire garantie</p>
      </div>
    </div>

    <!-- Footer -->
    <div style="padding:20px 36px;border-top:1px solid rgba(217,119,6,0.15);text-align:center;background:rgba(0,0,0,0.2);">
      <p style="color:#d97706;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;margin:0 0 6px;">&#9733; BRENNE AERIAL SUPRÊME &#9733;</p>
      <p style="color:#5a4010;font-size:10px;margin:0;">Cette notification vous est envoyée en raison de votre appartenance au Rang Suprême.<br>Ne répondez pas directement à cet e-mail.</p>
    </div>
  </div>
  <div style="height:2px;background:linear-gradient(90deg,transparent,#d97706,transparent);margin-top:2px;"></div>
</div>
</body></html>`;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    const PDG_EMAILS = ['contact.astuceson@gmail.com', 'thecommitteescp@gmail.com'];
    const PDG_ADJOINT_EMAILS = ['sentenacborys@gmail.com'];
    const ADMIN_ROLES = ['owner', 'pdg_adjoint', 'admin', 'conseil_admin', 'directeur'];
    const isTopLevel = PDG_EMAILS.includes(user?.email) || PDG_ADJOINT_EMAILS.includes(user?.email) || ADMIN_ROLES.includes(user?.role);
    if (!user || !isTopLevel) {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }
    // PDG-Adjoint a les mêmes droits que le PDG pour gérer les Suprêmes
    const canManageSupreme = PDG_EMAILS.includes(user.email) || PDG_ADJOINT_EMAILS.includes(user.email) || user.role === 'owner' || user.role === 'pdg_adjoint';

    const { id, data } = await req.json();
    if (!id || !data) {
      return Response.json({ error: 'Missing id or data' }, { status: 400 });
    }

    // Sécurité — empêche l'élévation de privilèges : seul le propriétaire (owner)
    // ou le PDG authentifié peut modifier le rôle d'un utilisateur.
    const canAssignRoles = user.role === 'owner' || PDG_EMAILS.includes(user.email);
    if (!canAssignRoles && 'role' in data) {
      return Response.json({ error: 'Forbidden: Seul le propriétaire peut modifier le rôle d\'un utilisateur' }, { status: 403 });
    }

    let targetUser = null;
    try { targetUser = await base44.asServiceRole.entities.User.get(id); } catch(_) {}

    // Non-éligibilité aux badges : bloquer toute attribution de badges/vérifications
    if (targetUser?.badges_eligible === false && data.badges_eligible !== true) {
      const curBadges = targetUser.badges || [];
      const curVerifs = targetUser.verifications || [];
      if (data.badges && data.badges.some(b => !curBadges.includes(b))) {
        return Response.json({ error: 'Profil non-éligible aux badges' }, { status: 403 });
      }
      if (data.verifications && data.verifications.some(v => !curVerifs.includes(v))) {
        return Response.json({ error: 'Profil non-éligible aux badges' }, { status: 403 });
      }
      if (data.verified_status === 'yes' && targetUser.verified_status !== 'yes') {
        return Response.json({ error: 'Profil non-éligible aux badges' }, { status: 403 });
      }
    }

    // Horodatage automatique de la non-éligibilité
    if (data.badges_eligible === false) {
      data.badge_ineligibility_set_at = new Date().toISOString();
      data.badge_ineligibility_set_by = user?.email || 'admin';
    } else if (data.badges_eligible === true) {
      data.badge_ineligibility_reason = null;
      data.badge_ineligibility_set_at = null;
      data.badge_ineligibility_set_by = null;
    }

    // Vérifier si on essaie d'attribuer/retirer supreme sans les droits nécessaires
    if (data.verifications) {
      const targetUser2 = await base44.asServiceRole.entities.User.get(id).catch(() => null);
      const hadSupreme = (targetUser2?.verifications || []).includes('supreme');
      const willHaveSupreme = data.verifications.includes('supreme');
      if (hadSupreme !== willHaveSupreme && !canManageSupreme) {
        return Response.json({ error: 'Forbidden: Seuls le PDG et PDG-Adjoint peuvent gérer le rang Suprême' }, { status: 403 });
      }
    }
    // Détection d'un ajustement manuel de crédits par l'admin → email branded
    let creditEmailHtml = null;
    let creditEmailSubject = null;
    if (data.referral_credits != null && targetUser) {
      const oldCredits = targetUser.referral_credits || 0;
      const newCredits = Number(data.referral_credits) || 0;
      if (newCredits !== oldCredits) {
        const delta = newCredits - oldCredits;
        const isCredit = delta > 0;
        const reason = data.credit_reason ? String(data.credit_reason).trim().slice(0, 500) : null;
        const adminName = 'admin';
        const dateStr = new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });
        const accentColor = isCredit ? '#34d399' : '#f87171';
        const actionLabel = isCredit ? 'Crédit ajouté à votre compte' : 'Débit effectué sur votre compte';
        const reasonBlock = reason
          ? `<div style="background:#111827;border:1px solid #1e293b;border-radius:10px;padding:14px 18px;margin:16px 0;"><p style="color:#64748b;font-size:11px;margin:0 0 6px;letter-spacing:1px;text-transform:uppercase;">Motif de l'opération</p><p style="color:#e2e8f0;font-size:14px;margin:0;line-height:1.5;">${reason.replace(/</g, '&lt;')}</p></div>`
          : '';
        const contentHtml = `
          <p style="color:#cbd5e1;font-size:15px;line-height:1.6;margin:0 0 16px;">Bonjour <strong style="color:#f1f5f9;">${(targetUser.full_name || 'Membre').replace(/</g, '&lt;')}</strong>,</p>
          <p style="color:#cbd5e1;font-size:15px;line-height:1.6;margin:0 0 16px;">Un ajustement manuel de vos crédits Eza vient d'être effectué par <strong style="color:#f1f5f9;">${adminName}</strong> depuis le panneau d'administration.</p>
          <div style="background:#0b1220;border:1px solid #1e293b;border-radius:14px;padding:20px;margin:16px 0;text-align:center;">
            <p style="color:#64748b;font-size:11px;letter-spacing:2px;text-transform:uppercase;margin:0 0 8px;">${actionLabel}</p>
            <p style="font-size:34px;font-weight:800;margin:0;color:${accentColor};">${isCredit ? '＋' : '－'} ${Math.abs(delta).toLocaleString('fr-FR')} crédits</p>
            <div style="display:flex;justify-content:center;gap:24px;margin-top:18px;">
              <div><p style="color:#64748b;font-size:10px;margin:0;letter-spacing:1px;text-transform:uppercase;">Solde avant</p><p style="color:#94a3b8;font-size:18px;font-weight:700;margin:4px 0 0;">${oldCredits.toLocaleString('fr-FR')}</p></div>
              <div style="width:1px;background:#1e293b;"></div>
              <div><p style="color:#64748b;font-size:10px;margin:0;letter-spacing:1px;text-transform:uppercase;">Nouveau solde</p><p style="color:${accentColor};font-size:18px;font-weight:700;margin:4px 0 0;">${newCredits.toLocaleString('fr-FR')}</p></div>
            </div>
          </div>
          ${reasonBlock}
          <p style="color:#64748b;font-size:12px;margin:16px 0 0;">Date de l'opération : <strong style="color:#94a3b8;">${dateStr}</strong></p>
          <p style="color:#64748b;font-size:12px;margin:10px 0 0;">Retrouvez votre solde et votre historique dans la <a href="/boutique" style="color:#38bdf8;text-decoration:none;">Boutique Eza</a>.</p>`;
        creditEmailHtml = ezaEmailShell(`${isCredit ? 'Crédit ajouté' : 'Débit effectué'}`, contentHtml, { accent: accentColor, tagline: 'Transaction de crédits' });
        creditEmailSubject = `eza — ${isCredit ? '✅ Crédit ajouté' : '⚠️ Débit effectué'} : ${Math.abs(delta)} crédits`;
      }
    }
    if (data.credit_reason) delete data.credit_reason; // champ transient, ne pas stocker

    const updated = await base44.asServiceRole.entities.User.update(id, data);

    const restrictedStatuses = ['banned', 'suspended', 'restricted'];
    const statusChanged = data.account_status && data.account_status !== targetUser?.account_status;
    const isBeingRestricted = statusChanged && restrictedStatuses.includes(data.account_status);
    const isBeingRestored = statusChanged && data.account_status === 'active' && restrictedStatuses.includes(targetUser?.account_status);

    if ((isBeingRestricted || isBeingRestored) && targetUser?.email) {
      try {
        const isSupreme = (targetUser.verifications || []).includes('supreme');
        const uname = targetUser.full_name || 'Membre';
        let html, subject;

        if (isBeingRestored) {
          html = isSupreme
            ? buildSupremeRestoreEmail({ name: uname })
            : buildStandardRestoreEmail({ name: uname });
          subject = isSupreme ? '&#128081; ✅ Accès restauré — Rang Suprême' : '✅ Accès restauré — Brenne Aerial';
        } else {
          const cfg = STATUS_LABELS[data.account_status];
          html = isSupreme
            ? buildSupremeEmail({ name: uname, status: data.account_status, reason: data.suspension_reason, until: data.suspension_until })
            : buildStandardEmail({ name: uname, status: data.account_status, reason: data.suspension_reason, until: data.suspension_until });
          subject = isSupreme
            ? `&#128081; ${cfg.emoji} ${cfg.title} — Rang Suprême`
            : `${cfg.emoji} ${cfg.title} — Brenne Aerial`;
        }

        await base44.asServiceRole.integrations.Core.SendEmail({ to: targetUser.email, subject, body: html });
      } catch(_) {}
    }

    // Envoi de l'email de transaction de crédits (ajustement admin)
    if (creditEmailHtml && targetUser?.email) {
      try {
        await base44.asServiceRole.integrations.Core.SendEmail({
          to: targetUser.email,
          subject: creditEmailSubject,
          body: creditEmailHtml,
          from_name: 'eza — Direction',
        });
      } catch(_) {}
    }

    return Response.json({ user: updated });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});