import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { sendEzaEmail } from '../../shared/ezaEmails.ts';
import { logAutomation } from '../../shared/logAutomation.ts';

// Tâche planifiée quotidienne (08h) : compile les chiffres clés des dernières 24h,
// demande à Nexus (LLM) de rédiger un digest matinal, l'envoie par email aux admins
// et enregistre une entrée dans le journal d'automatisation.

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const since = Date.now() - 24 * 3600 * 1000;
    const dayAgo = (d) => d && new Date(d).getTime() > since;

    const [posts, users, regs, reports, campaigns, events, delReqs, cancelReqs] = await Promise.all([
      base44.asServiceRole.entities.Post.list('-created_date', 200).catch(() => []),
      base44.asServiceRole.entities.User.list().catch(() => []),
      base44.asServiceRole.entities.EventRegistration.list('-created_date', 200).catch(() => []),
      base44.asServiceRole.entities.Report.filter({ status: 'pending' }).catch(() => []),
      base44.asServiceRole.entities.AdCampaign.filter({ status: 'active' }).catch(() => []),
      base44.asServiceRole.entities.Event.list('-start_date', 50).catch(() => []),
      base44.asServiceRole.entities.DeletionRequest.filter({ status: 'pending' }).catch(() => []),
      base44.asServiceRole.entities.EventRegistration.filter({ cancel_request_status: 'pending' }).catch(() => []),
    ]);

    // Pic d'inscriptions : événement avec le plus de nouvelles inscriptions sur 24h
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

    const stats = {
      nouveaux_posts: (posts || []).filter((p) => dayAgo(p.created_date)).length,
      nouveaux_utilisateurs: (users || []).filter((u) => dayAgo(u.created_date)).length,
      nouvelles_inscriptions_evenements: (regs || []).filter((r) => dayAgo(r.registered_at || r.created_date)).length,
      signalements_en_attente: (reports || []).length,
      campagnes_pub_actives: (campaigns || []).length,
      evenements_a_venir: (events || []).filter((e) => e.status === 'upcoming').length,
      total_utilisateurs: (users || []).length,
      demandes_suppression_en_attente: (delReqs || []).length,
      demandes_remboursement_en_attente: (cancelReqs || []).length,
      pic_inscriptions: topSurgeEvent ? `${topSurgeEvent.title} (+${topSurge[1]} inscriptions)` : 'aucun',
    };

    const digest = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `Tu es Nexus, l'assistant IA du PDG d'eza (plateforme communautaire professionnelle française).
Rédige un DIGEST MATINAL court (5-8 lignes) pour l'équipe d'administration : ton professionnel, chaleureux et concis.
Mets en avant les chiffres clés des dernières 24h et surtout les POINTS D'ATTENTION concrets :
- si demandes_remboursement_en_attente > 0 : "⚠️ X demandes de remboursement en attente"
- si pic_inscriptions notable : "Forte activité sur l'événement Y (+N inscriptions)"
- si demandes_suppression_en_attente > 0 : mentionne-le
- si signalements_en_attente > 0 : "X signalements à traiter"
Termine par une phrase de motivation. Texte brut, pas de JSON.
Données : ${JSON.stringify(stats)}.`,
    }).catch(() => null);

    const digestText = typeof digest === 'string' && digest.trim()
      ? digest
      : 'Digest indisponible — voir les chiffres ci-dessous.';

    const body =
      digestText +
      `\n\n**Chiffres clés (24h)**\n- Nouveaux posts : ${stats.nouveaux_posts}\n- Nouveaux utilisateurs : ${stats.nouveaux_utilisateurs}\n- Inscriptions événements : ${stats.nouvelles_inscriptions_evenements}\n- Pic d'inscriptions : ${stats.pic_inscriptions}\n- Signalements en attente : ${stats.signalements_en_attente}\n- Demandes de remboursement en attente : ${stats.demandes_remboursement_en_attente}\n- Demandes de suppression en attente : ${stats.demandes_suppression_en_attente}\n- Campagnes pub actives : ${stats.campagnes_pub_actives}\n- Événements à venir : ${stats.evenements_a_venir}\n- Total utilisateurs : ${stats.total_utilisateurs}`;

    const admins = (users || []).filter((u) => u.role === 'admin').map((u) => u.email);
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
      summary: `${stats.nouveaux_utilisateurs} nouveaux membres, ${stats.nouvelles_inscriptions_evenements} inscriptions, ${stats.demandes_remboursement_en_attente} remboursements en attente`,
      details: body,
      count: delivered,
    });

    return Response.json({ ok: true, stats, delivered });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}