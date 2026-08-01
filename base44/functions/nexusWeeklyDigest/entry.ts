import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { sendEzaEmail } from '../../shared/ezaEmails.ts';
import { logAutomation } from '../../shared/logAutomation.ts';

// Tâche planifiée hebdomadaire (lundi 08h) : digest stratégique Nexus pour la direction.
// Vue d'ensemble de la semaine : croissance, engagement, économie, modération, fraude, pub.
// Synthétisé par Claude et envoyé aux admins + tracé dans le journal d'automatisation.

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const since = Date.now() - 7 * 24 * 3600 * 1000;
    const weekAgo = (d) => d && new Date(d).getTime() > since;

    const [users, posts, regs, txs, communities, reports, referrals, campaigns, certs, aLogs] = await Promise.all([
      base44.asServiceRole.entities.User.list().catch(() => []),
      base44.asServiceRole.entities.Post.list('-created_date', 300).catch(() => []),
      base44.asServiceRole.entities.EventRegistration.list('-created_date', 200).catch(() => []),
      base44.asServiceRole.entities.CreditTransaction.list('-created_date', 300).catch(() => []),
      base44.asServiceRole.entities.Community.list('-members_count', 10).catch(() => []),
      base44.asServiceRole.entities.Report.filter({ status: 'pending' }).catch(() => []),
      base44.asServiceRole.entities.Referral.list('-created_date', 200).catch(() => []),
      base44.asServiceRole.entities.AdCampaign.list('-created_date', 50).catch(() => []),
      base44.asServiceRole.entities.CertificationRequest.filter({ status: 'pending' }).catch(() => []),
      base44.asServiceRole.entities.AutomationLog.list('-run_at', 60).catch(() => []),
    ]);

    const newUsers = (users || []).filter((u) => weekAgo(u.created_date));
    const newPosts = (posts || []).filter((p) => weekAgo(p.created_date));
    const newRegs = (regs || []).filter((r) => weekAgo(r.registered_at || r.created_date));
    const weekTx = (txs || []).filter((t) => weekAgo(t.created_date));
    const rewardsCredits = weekTx.filter((t) => t.type === 'reward').reduce((s, t) => s + Number(t.amount), 0);
    const boutiqueSpend = Math.abs(weekTx.filter((t) => t.type === 'boutique_spend').reduce((s, t) => s + Number(t.amount), 0));
    const fraudFlags = (referrals || []).filter((r) => r.admin_notes && String(r.admin_notes).includes('Fraude suspectée'));
    const topCommunities = (communities || []).slice(0, 5).map((c) => `${c.name} (${c.members_count || 0} membres)`);
    const totalImpressions = (campaigns || []).reduce((s, c) => s + Number(c.impressions || 0), 0);
    const totalClicks = (campaigns || []).reduce((s, c) => s + Number(c.clicks || 0), 0);

    const weekLogs = (aLogs || []).filter((l) => weekAgo(l.run_at));
    const logByStatus = {
      success: weekLogs.filter((l) => l.status === 'success').length,
      warning: weekLogs.filter((l) => l.status === 'warning').length,
      error: weekLogs.filter((l) => l.status === 'error').length,
    };

    const metrics = {
      periode: '7 derniers jours',
      nouveaux_membres: newUsers.length,
      total_membres: (users || []).length,
      nouveaux_posts: newPosts.length,
      nouvelles_inscriptions_evenements: newRegs.length,
      evenements_a_venir: (communities || []) ? null : null, // placeholder removed below
      credits_recompenses: Math.round(rewardsCredits),
      credits_depenses_boutique: boutiqueSpend,
      top_communautes: topCommunities,
      signalements_en_attente: (reports || []).length,
      certifications_en_attente: (certs || []).length,
      parrainages_valides: (referrals || []).filter((r) => r.status === 'validated' || r.status === 'rewarded').length,
      parrainages_fraudes_flags: fraudFlags.length,
      impressions_pub: totalImpressions,
      clics_pub: totalClicks,
      taux_engagement_pub: totalImpressions > 0 ? (totalClicks / totalImpressions * 100).toFixed(1) + '%' : 'n/a',
      automatisations_7j: logByStatus,
    };
    delete metrics.evenements_a_venir;

    const digest = await base44.asServiceRole.integrations.Core.InvokeLLM({
      model: 'claude_sonnet_4_6',
      prompt: `Tu es NEXUS, l'IA de direction d'eza. Rédige le BILAN HEBDOMADAIRE stratégique pour le comité de direction (12-16 lignes).

Structure :
1. **Synthèse exécutive** : 2 lignes sur la santé globale de la semaine (croissance, engagement).
2. **Croissance & engagement** : nouveaux membres, posts, inscriptions événements — vs tendance.
3. **Économie** : crédits récompensés, dépenses boutique, performance pub (impressions, clics, taux d'engagement).
4. **Communautés** : top communautés de la semaine.
5. **Risques & opérations** : signalements, certifications en attente, fraude parrainage détectée, erreurs d'automatisation.
6. **Priorités de la semaine** : 3 actions concrètes pour la direction.

Données : ${JSON.stringify(metrics)}.
Texte brut, pas de JSON. Ton exécutif. Termine par "— Nexus, IA de direction eza".`,
    }).catch(() => null);

    const digestText = typeof digest === 'string' && digest.trim()
      ? digest
      : 'Bilan indisponible — voir les métriques ci-dessous.';

    const body =
      digestText +
      `\n\n**Métriques (7 jours)**\n- Nouveaux membres : ${metrics.nouveaux_membres} (total ${metrics.total_membres})\n- Nouveaux posts : ${metrics.nouveaux_posts}\n- Inscriptions événements : ${metrics.nouvelles_inscriptions_evenements}\n- Crédits récompensés : ${metrics.credits_recompenses}\n- Crédits dépensés (boutique) : ${metrics.credits_depenses_boutique}\n- Top communautés : ${topCommunities.join(' · ') || 'n/a'}\n- Impressions pub : ${metrics.impressions_pub} · clics : ${metrics.clics_pub} (${metrics.taux_engagement_pub})\n- Signalements en attente : ${metrics.signalements_en_attente}\n- Certifications en attente : ${metrics.certifications_en_attente}\n- Parrainages validés : ${metrics.parrainages_valides} · fraudes flaguées : ${metrics.parrainages_fraudes_flags}\n- Automatisations : ${logByStatus.success} succès, ${logByStatus.warning} alertes, ${logByStatus.error} erreurs`;

    const admins = (users || []).filter((u) => u.role === 'admin' || u.role === 'owner').map((u) => u.email);
    let delivered = 0;
    if (admins.length) {
      const res = await sendEzaEmail(base44, {
        to: admins,
        subject: '📊 Bilan hebdomadaire eza — Nexus',
        title: 'Bilan hebdomadaire — Nexus',
        body,
        tagline: 'Nexus — Direction',
      }).catch(() => ({ delivered: 0 }));
      delivered = res?.delivered || 0;
    }

    await logAutomation(base44, {
      automation_name: 'nexus_weekly_digest',
      label: 'Bilan hebdo Nexus (direction)',
      category: 'digest',
      status: 'success',
      summary: `${metrics.nouveaux_membres} membres, ${metrics.nouveaux_posts} posts, ${metrics.impressions_pub} impr. pub, ${metrics.parrainages_fraudes_flags} fraudes`,
      details: body,
      count: delivered,
    });

    return Response.json({ ok: true, metrics, delivered });
  } catch (error) {
    await logAutomation(base44, {
      automation_name: 'nexus_weekly_digest', label: 'Bilan hebdo Nexus', category: 'digest',
      status: 'error', summary: 'Échec du bilan hebdo', details: String(error?.message || error),
    });
    return Response.json({ error: error.message }, { status: 500 });
  }
}