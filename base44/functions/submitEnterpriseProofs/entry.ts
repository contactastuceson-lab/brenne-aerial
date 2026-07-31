import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { waitUntil } from 'base44:runtime';
import { sendEzaEmail } from '../../shared/ezaEmails.ts';

const ADMIN_EMAIL = 'contact.astuceson@gmail.com';
const ENTERPRISE_COST = 600;
const MONTH = 30;

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Non connecté' }, { status: 401 });

    let body;
    try { body = await req.json(); } catch { return Response.json({ error: 'Payload invalide' }, { status: 400 }); }

    const { questionnaire, file_urls } = body || {};
    if (!questionnaire || !questionnaire.company_name) {
      return Response.json({ error: 'Nom de l\u2019entreprise requis' }, { status: 400 });
    }

    const currentCredits = user.referral_credits || 0;
    if (currentCredits < ENTERPRISE_COST) {
      return Response.json({
        error: 'Cr\u00e9dits insuffisants',
        needed: ENTERPRISE_COST,
        available: currentCredits,
      }, { status: 400 });
    }

    // Déduire les crédits (conservés pendant la revue IA / admin)
    const newCredits = currentCredits - ENTERPRISE_COST;
    await base44.asServiceRole.entities.User.update(user.id, { referral_credits: newCredits });

    const now = new Date().toISOString();
    const files = Array.isArray(file_urls) ? file_urls : [];

    // Créer la demande de certification (preuves archivées)
    const certReq = await base44.entities.CertificationRequest.create({
      user_email: user.email,
      user_name: user.display_name || user.full_name || user.username,
      status: 'pending',
      responses: { ...questionnaire, file_urls: files, tier: 'enterprise_1m' },
      submitted_at: now,
      payment_status: 'completed',
      admin_notes: `Enterprise tier \u2014 ${ENTERPRISE_COST} cr\u00e9dits \u2014 validation IA en cours`,
    });

    // ── Validation IA ──
    let aiDecision: 'approved' | 'rejected' | 'needs_review' = 'needs_review';
    let aiReason = '';
    let aiConfidence: any = null;
    try {
      const prompt = `Tu es un agent de validation Enterprise pour la plateforme Eza. \u00c9value si la demande suivante provient d'une organisation l\u00e9gitime et m\u00e9rite le statut Enterprise (badge Officiel).

Demande soumise:
- Nom de l'entreprise: ${questionnaire.company_name}
- Forme juridique: ${questionnaire.legal_form || 'non pr\u00e9cis\u00e9e'}
- Num\u00e9ro d'immatriculation (SIRET/RCS/\u00e9quivalent): ${questionnaire.registration_number || 'non pr\u00e9cis\u00e9'}
- Site web: ${questionnaire.website || 'non pr\u00e9cis\u00e9'}
- Description de l'activit\u00e9: ${questionnaire.description || 'non pr\u00e9cis\u00e9e'}
- Nombre d'employ\u00e9s: ${questionnaire.employees || 'non pr\u00e9cis\u00e9'}
- Pays: ${questionnaire.country || 'non pr\u00e9cis\u00e9'}

${files.length > 0 ? `${files.length} justificatif(s) (pi\u00e8ce d'identit\u00e9, extrait KBIS / document d'immatriculation) ont \u00e9t\u00e9 t\u00e9l\u00e9vers\u00e9(s). Analyse-les si visible.` : 'Aucun justificatif t\u00e9l\u00e9vers\u00e9.'}

R\u00e8gles:
- "approved": informations coh\u00e9rentes ET compl\u00e8tes (nom + immatriculation + description pertinente) \u2014 organisation l\u00e9gitime probable.
- "rejected": informations manifestement fausses, incompl\u00e8tes ou non pertinentes.
- "needs_review": doute l\u00e9gitime ou infos partielles \u2014 laisse un humain d\u00e9cider.

R\u00e9ponds en JSON uniquement.`;

      const aiRes: any = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: 'object',
          properties: {
            decision: { type: 'string', enum: ['approved', 'rejected', 'needs_review'] },
            reason: { type: 'string' },
            confidence: { type: 'number' },
          },
          required: ['decision', 'reason'],
        },
        file_urls: files.length > 0 ? files : undefined,
      });
      aiDecision = aiRes?.decision || 'needs_review';
      aiReason = aiRes?.reason || '';
      aiConfidence = aiRes?.confidence ?? null;
    } catch (e: any) {
      aiDecision = 'needs_review';
      aiReason = 'Erreur IA: ' + (e?.message || 'unknown');
    }

    // ── Approuvé par l'IA → attribution immédiate ──
    if (aiDecision === 'approved') {
      const perks = { ...(user.perks || {}) };
      const verifs = [...(user.verifications || [])];
      if (!verifs.includes('official')) verifs.push('official');
      if (!verifs.includes('certified')) verifs.push('certified');
      const baseDate = perks.enterprise_until && new Date(perks.enterprise_until) > new Date()
        ? new Date(perks.enterprise_until) : new Date();
      baseDate.setDate(baseDate.getDate() + MONTH);
      perks.enterprise_until = baseDate.toISOString();
      await base44.asServiceRole.entities.User.update(user.id, { perks, verifications: verifs });

      await base44.asServiceRole.entities.CertificationRequest.update(certReq.id, {
        status: 'approved',
        admin_notes: `Auto-approuv\u00e9 par IA${aiConfidence !== null ? ` (confiance ${aiConfidence}/100)` : ''}. ${aiReason}`,
      });

      waitUntil(sendEzaEmail(base44, {
        to: user.email,
        title: 'Bienvenue dans Enterprise',
        subject: '\u2705 Votre statut Enterprise est actif sur Eza',
        body: `Bonjour **${user.display_name || user.username}**,\n\nF\u00e9licitations \u2014 votre demande Enterprise a \u00e9t\u00e9 **valid\u00e9e** par notre agent IA et votre statut est d\u00e9sormais **actif**.\n\n**Badge attribu\u00e9 :** Officiel\n**Dur\u00e9e :** 1 mois\n**Cr\u00e9dits d\u00e9pens\u00e9s :** ${ENTERPRISE_COST}\n**Cr\u00e9dits restants :** ${newCredits}\n\nVotre badge de v\u00e9rification **Officiel** est d\u00e9sormais visible sur votre profil. Vos avantages Enterprise (analytics avanc\u00e9es, stockage \u00e9tendu, acc\u00e8s anticip\u00e9) sont disponibles imm\u00e9diatement.\n\nPour g\u00e9rer vos avantages, rendez-vous dans votre **Espace Utilisateur**.\n\nMerci de votre confiance,\n\u2014 L'\u00e9quipe eza`,
        tagline: 'Enterprise activ\u00e9',
      }).catch(() => {}));

      return Response.json({
        success: true,
        decision: 'approved',
        reason: aiReason,
        remainingCredits: newCredits,
        message: 'Demande Enterprise valid\u00e9e par IA ! Badge Officiel attribu\u00e9.',
      });
    }

    // ── Rejeté par l'IA → remboursement ──
    if (aiDecision === 'rejected') {
      await base44.asServiceRole.entities.User.update(user.id, { referral_credits: currentCredits });
      await base44.asServiceRole.entities.CertificationRequest.update(certReq.id, {
        status: 'rejected',
        admin_notes: `Rejet\u00e9 par IA. ${aiReason}. Cr\u00e9dits rembours\u00e9s.`,
      });
      waitUntil(sendEzaEmail(base44, {
        to: user.email,
        title: 'Demande Enterprise',
        subject: 'Mise \u00e0 jour de votre demande Enterprise',
        body: `Bonjour **${user.display_name || user.username}**,\n\nVotre demande Enterprise n'a pas pu \u00eatre valid\u00e9e automatiquement.\n\n**Raison :** ${aiReason}\n\nVos cr\u00e9dits (${ENTERPRISE_COST}) ont \u00e9t\u00e9 **rembours\u00e9s**. Vous pouvez retenter avec des justificatifs plus complets.\n\n\u2014 L'\u00e9quipe eza`,
        tagline: 'Demande Enterprise',
      }).catch(() => {}));
      return Response.json({
        success: false,
        decision: 'rejected',
        reason: aiReason,
        message: 'Demande rejet\u00e9e \u2014 cr\u00e9dits rembours\u00e9s.',
      });
    }

    // ── needs_review → validation admin requise ──
    await base44.asServiceRole.entities.CertificationRequest.update(certReq.id, {
      admin_notes: `En attente de validation admin. IA: ${aiReason}`,
    });
    waitUntil(
      base44.asServiceRole.entities.Notification.create({
        user_email: ADMIN_EMAIL,
        type: 'system',
        title: '\u1f3ed Demande Enterprise \u00e0 valider',
        content: `${user.display_name || user.username} (${user.email}) a soumis une demande Enterprise (${ENTERPRISE_COST} cr\u00e9dits). L'IA recommande une revue humaine. Raison: ${aiReason}`,
        sender_name: user.display_name || user.username,
      }).catch(() => {})
    );
    waitUntil(sendEzaEmail(base44, {
      to: user.email,
      title: 'Demande Enterprise en revue',
      subject: 'Votre demande Enterprise est en cours de validation',
      body: `Bonjour **${user.display_name || user.username}**,\n\nVotre demande Enterprise est en cours de **validation par notre \u00e9quipe**.\n\n**Cr\u00e9dits d\u00e9pens\u00e9s :** ${ENTERPRISE_COST} (conserv\u00e9s pendant la revue)\n**Statut :** En attente de validation humaine\n\nVous recevrez une notification d\u00e8s qu'elle sera trait\u00e9e. En cas de refus, vos cr\u00e9dits seront rembours\u00e9s.\n\n\u2014 L'\u00e9quipe eza`,
      tagline: 'Enterprise en revue',
    }).catch(() => {}));

    return Response.json({
      success: true,
      decision: 'needs_review',
      reason: aiReason,
      remainingCredits: newCredits,
      message: 'Demande soumise \u2014 validation admin en cours. L\u2019IA aiguill\u00e9 votre dossier vers un humain.',
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}