import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { sendEzaEmail } from '../../shared/ezaEmails.ts';

// Tâche planifiée quotidienne : compile les chiffres clés des dernières 24h,
// demande à un LLM (Nexus) de rédiger un digest matinal, et l'envoie par email
// aux administrateurs.

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const since = Date.now() - 24 * 3600 * 1000;
    const dayAgo = (d) => d && new Date(d).getTime() > since;

    const [posts, users, regs, reports, campaigns, events] = await Promise.all([
      base44.asServiceRole.entities.Post.list('-created_date', 200).catch(() => []),
      base44.asServiceRole.entities.User.list().catch(() => []),
      base44.asServiceRole.entities.EventRegistration.list('-created_date', 200).catch(() => []),
      base44.asServiceRole.entities.Report.filter({ status: 'pending' }).catch(() => []),
      base44.asServiceRole.entities.AdCampaign.filter({ status: 'active' }).catch(() => []),
      base44.asServiceRole.entities.Event.list('-start_date', 50).catch(() => []),
    ]);

    const stats = {
      nouveaux_posts: (posts || []).filter((p) => dayAgo(p.created_date)).length,
      nouveaux_utilisateurs: (users || []).filter((u) => dayAgo(u.created_date)).length,
      nouvelles_inscriptions_evenements: (regs || []).filter((r) => dayAgo(r.registered_at || r.created_date)).length,
      signalements_en_attente: (reports || []).length,
      campagnes_pub_actives: (campaigns || []).length,
      evenements_a_venir: (events || []).filter((e) => e.status === 'upcoming').length,
      total_utilisateurs: (users || []).length,
    };

    const digest = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `Tu es Nexus, l'assistant IA du PDG d'eza (plateforme communautaire professionnelle française).
Rédige un DIGEST MATINAL court (5-8 lignes max) pour l'équipe d'administration : ton professionnel, chaleureux et concis.
Mets en avant les chiffres clés des dernières 24h, les points d'attention (signalements, événements à venir) et une phrase de motivation.
Données : ${JSON.stringify(stats)}.
Réponds en texte brut, pas de JSON.`,
    }).catch(() => null);

    const digestText = typeof digest === 'string' && digest.trim()
      ? digest
      : 'Digest indisponible — voir les chiffres ci-dessous.';

    const body =
      digestText +
      `\n\n**Chiffres clés (24h)**\n- Nouveaux posts : ${stats.nouveaux_posts}\n- Nouveaux utilisateurs : ${stats.nouveaux_utilisateurs}\n- Inscriptions événements : ${stats.nouvelles_inscriptions_evenements}\n- Signalements en attente : ${stats.signalements_en_attente}\n- Campagnes pub actives : ${stats.campagnes_pub_actives}\n- Événements à venir : ${stats.evenements_a_venir}\n- Total utilisateurs : ${stats.total_utilisateurs}`;

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

    return Response.json({ ok: true, stats, delivered });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}