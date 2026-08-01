import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { sendEzaEmail } from '../../shared/ezaEmails.ts';
import { logAutomation } from '../../shared/logAutomation.ts';

// Tâche planifiée quotidienne (08h) : digest matinal Nexus pour la direction.
// Chiffres 24h + points d'attention prédictifs + actions recommandées par l'IA (Claude).

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const since = Date.now() - 24 * 3600 * 1000;
    const dayAgo = (d) => d && new Date(d).getTime() > since;
    const daysAgo = (d, n) => d && Date.now() - new Date(d).getTime() < n * 24 * 3600 * 1000;

    const [posts, users, regs, reports, campaigns, events, delReqs, cancelReqs, certs] = await Promise.all([
      base44.asServiceRole.entities.Post.list('-created_date', 200).catch(() => []),
      base44.asServiceRole.entities.User.list().catch(() => []),
      base44.asServiceRole.entities.EventRegistration.list('-created_date', 200).catch(() => []),
      base44.asServiceRole.entities.Report.filter({ status: 'pending' }).catch(() => []),
      base44.asServiceRole.entities.AdCampaign.filter({ status: 'active' }).catch(() => []),
      base44.asServiceRole.entities.Event.list('-start_date', 50).catch(() => []),
      base44.asServiceRole.entities.DeletionRequest.filter({ status: 'pending' }).catch(() => []),
      base44.asServiceRole.entities.EventRegistration.filter({ cancel_request_status: 'pending' }).catch(() => []),
      base44.asServiceRole.entities.CertificationRequest.filter({ status: 'pending' }).catch(() => []),
    ]);

    // Pic d'inscriptions
    const surgeMap = {};
    for (const r of (regs || [])) {
      if (dayAgo(r.registered_at || r.created_date)) {
        const eid = r.event_id || r.event_title;
        if (eid) surgeMap[eid] = (surgeMap[eid] || 0) + 1;
      }
    }
    const surgeEntries = Object.entries(surgeMap).sort((a, b) => b[1] - a[1]);
    const topSurge = surgeEntries[0];
    const topSurgeEvent = topSurge
      ? (events || []).find((e) => e.id === topSurge[0]) || { title: topSurge[0] }
      : null;

    // Alertes prédictives
    const evenementsBientotComplets = (events || [])
      .filter((e) => e.status === 'upcoming' && Number(e.capacity) > 0 && e.attendees_count / e.capacity >= 0.8)
      .map((e) => `${e.title} (${e.attendees_count}/${e.capacity})`);
    const campagnesBientotEpuisees = (campaigns || [])
      .filter((c) => Number(c.daily_budget) > 0 && Number(c.credits_remaining) <= Number(c.daily_budget) * 2)
      .map((c) => `${c.title} (${c.credits_remaining} crédits restants)`);
    const signalementsAnciens = (reports || []).filter((r) => r.created_date && daysAgo(r.created_date, 3)).length;

    const stats = {
      nouveaux_posts: (posts || []).filter((p) => dayAgo(p.created_date)).length,
      nouveaux_utilisateurs: (users || []).filter((u) => dayAgo(u.created_date)).length,
      nouvelles_inscriptions_evenements: (regs || []).filter((r) => dayAgo(r.registered_at || r.created_date)).length,
      signalements_en_attente: (reports || []).length,
      signalements_anciens_3j: signalementsAnciens,
      campagnes_pub_actives: (campaigns || []).length,
      evenements_a_venir: (events || []).filter((e) => e.status === 'upcoming').length,
      total_utilisateurs: (users || []).length,
      demandes_suppression_en_attente: (delReqs || []).length,
      demandes_remboursement_en_attente: (cancelReqs || []).length,
      certifications_en_attente: (certs || []).length,
      pic_inscriptions: topSurgeEvent ? `${topSurgeEvent.title} (+${topSurge[1]} inscriptions)` : 'aucun',
      evenements_bientot_complets: evenementsBientotComplets,
      campagnes_pub_bientot_epuisees: campagnesBientotEpuisees,
    };

    const digest = await base44.asServiceRole.integrations.Core.InvokeLLM({
      model: 'claude_sonnet_4_6',
      prompt: `Tu es NEXUS, l'IA de direction d'eza (plateforme communautaire professionnelle française).
Rédige le DIGEST MATINAL du jour pour l'équipe de direction (8-12 lignes), ton exécutif, professionnel et chaleureux.

Structure :
1. Une phrase d'ouverture + chiffres clés des dernières 24h (membres, posts, inscriptions).
2. "⚠️ Points d'attention" : pour chaque alerte non nulle ci-dessous, une ligne concrète.
3. "🎯 Actions recommandées" : 2-3 actions concrètes que la direction devrait mener aujourd'hui (examiner les remboursements, traiter les signalements anciens, recharger une campagne pub, préparer un événement bientôt complet…).
4. Une phrase de motivation.

Données : ${JSON.stringify(stats)}.
Texte brut, pas de JSON. Termine par "— Nexus, IA de direction eza".`,
    }).catch(() => null);

    const digestText = typeof digest === 'string' && digest.trim()
      ? digest
      : 'Digest indisponible — voir les chiffres ci-dessous.';

    const body =
      digestText +
      `\n\n**Chiffres clés (24h)**\n- Nouveaux membres : ${stats.nouveaux_utilisateurs} (total ${stats.total_utilisateurs})\n- Nouveaux posts : ${stats.nouveaux_posts}\n- Inscriptions événements : ${stats.nouvelles_inscriptions_evenements} (pic : ${stats.pic_inscriptions})\n- Événements à venir : ${stats.evenements_a_venir}\n\n**Points d'attention**\n- Signalements en attente : ${stats.signalements_en_attente} (dont ${stats.signalements_anciens_3j} > 3 jours)\n- Demandes de remboursement en attente : ${stats.demandes_remboursement_en_attente}\n- Demandes de suppression en attente : ${stats.demandes_suppression_en_attente}\n- Certifications en attente : ${stats.certifications_en_attente}\n- Campagnes pub actives : ${stats.campagnes_pub_actives}\n- Événements bientôt complets : ${evenementsBientotComplets.length ? evenementsBientotComplets.join(', ') : 'aucun'}\n- Campagnes pub bientôt épuisées : ${campagnesBientotEpuisees.length ? campagnesBientotEpuisees.join(', ') : 'aucune'}`;

    const admins = (users || []).filter((u) => u.role === 'admin' || u.role === 'owner').map((u) => u.email);
    let delivered = 0;
    if (admins.length) {
      const res = await sendEzaEmail(base44, {
        to: admins,
        subject: '☀️ Digest matinal eza — Nexus',
        title: 'Digest matinal — Nexus',
        body,
        tagline: 'Nexus — Direction',
      }).catch(() => ({ delivered: 0 }));
      delivered = res?.delivered || 0;
    }

    await logAutomation(base44, {
      automation_name: 'nexus_daily_digest',
      label: 'Digest matinal Nexus',
      category: 'digest',
      status: 'success',
      summary: `${stats.nouveaux_utilisateurs} membres, ${stats.nouvelles_inscriptions_evenements} inscr., ${stats.demandes_remboursement_en_attente} remb., ${evenementsBientotComplets.length} év. bientôt complets`,
      details: body,
      count: delivered,
    });

    return Response.json({ ok: true, stats, delivered });
  } catch (error) {
    await logAutomation(base44, {
      automation_name: 'nexus_daily_digest', label: 'Digest matinal Nexus', category: 'digest',
      status: 'error', summary: 'Échec du digest', details: String(error?.message || error),
    });
    return Response.json({ error: error.message }, { status: 500 });
  }
}