import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { sendEzaEmail } from '../../shared/ezaEmails.ts';
import { logAutomation } from '../../shared/logAutomation.ts';

// Tâche planifiée hebdomadaire (lundi 08h) : envoie à chaque utilisateur actif
// cette semaine un mini-bilan (publications + crédits Eza gagnés). Cible uniquement
// les utilisateurs ayant eu une activité sur les 7 derniers jours pour limiter le
// bruit. Cap anti-volume à 200 emails.

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const since = Date.now() - 7 * 24 * 3600 * 1000;
    const dayAgo = (d) => d && new Date(d).getTime() > since;

    const [posts, txs, users] = await Promise.all([
      base44.asServiceRole.entities.Post.list('-created_date', 500).catch(() => []),
      base44.asServiceRole.entities.CreditTransaction.list('-created_date', 500).catch(() => []),
      base44.asServiceRole.entities.User.list().catch(() => []),
    ]);

    const weekPosts = (posts || []).filter((p) => dayAgo(p.created_date));
    const weekTx = (txs || []).filter((t) => dayAgo(t.created_date) && Number(t.amount) > 0);

    const postByAuthor = {};
    for (const p of weekPosts) postByAuthor[p.author_id] = (postByAuthor[p.author_id] || 0) + 1;
    const creditsByOwner = {};
    for (const t of weekTx) creditsByOwner[t.owner_id] = (creditsByOwner[t.owner_id] || 0) + Number(t.amount);

    const userMap = {};
    for (const u of (users || [])) userMap[u.id] = u;
    const activeIds = new Set([...Object.keys(postByAuthor), ...Object.keys(creditsByOwner)]);

    let sent = 0;
    for (const uid of activeIds) {
      const u = userMap[uid];
      if (!u || !u.email) continue;
      const postsCount = postByAuthor[uid] || 0;
      const credits = Math.round(creditsByOwner[uid] || 0);
      if (!postsCount && !credits) continue;
      await sendEzaEmail(base44, {
        to: u.email,
        subject: '📊 Votre activité eza cette semaine',
        title: 'Bilan hebdomadaire',
        body: `Bonjour **${u.display_name || u.username || ''}**,\n\nVoici votre activité eza sur les 7 derniers jours :\n\n- **Publications :** ${postsCount}\n- **Crédits Eza gagnés :** ${credits}\n\nContinuez votre belle dynamique !\n\n— L'équipe eza`,
        tagline: 'eza',
      }).catch(() => {});
      sent++;
      if (sent >= 200) break;
    }

    await logAutomation(base44, {
      automation_name: 'send_weekly_activity_report', label: 'Bilan hebdo utilisateurs', category: 'retention',
      status: 'success',
      summary: `${sent} bilan(s) hebdo envoyés (${activeIds.size} utilisateurs actifs)`,
      count: sent,
    });

    return Response.json({ ok: true, sent, activeUsers: activeIds.size });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}