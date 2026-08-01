import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { sendEzaEmail } from '../../shared/ezaEmails.ts';
import { logAutomation } from '../../shared/logAutomation.ts';

// Tâche planifiée quotidienne : attribution automatique de badges communautaires
// basée sur l'activité réelle :
//  - pioneer      : 100 premiers inscrits
//  - contributor  : >= 20 publications
//  - organizer    : >= 2 événements organisés
// Respecte badges_eligible. Ajoute le badge aux verifications de l'utilisateur
// (mise à jour individuelle — pas de bulk sur User) + email de félicitations.

const LABELS = { pioneer: 'Pionnier', contributor: 'Contributeur', organizer: 'Organisateur' };

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const [users, posts, events] = await Promise.all([
      base44.asServiceRole.entities.User.list().catch(() => []),
      base44.asServiceRole.entities.Post.list('-created_date', 500).catch(() => []),
      base44.asServiceRole.entities.Event.list('-created_date', 500).catch(() => []),
    ]);

    const postCounts = {};
    for (const p of (posts || [])) if (p.author_id) postCounts[p.author_id] = (postCounts[p.author_id] || 0) + 1;
    const eventCounts = {};
    for (const e of (events || [])) if (e.organizer_id) eventCounts[e.organizer_id] = (eventCounts[e.organizer_id] || 0) + 1;

    const sortedByDate = (users || [])
      .filter((u) => u.created_date)
      .sort((a, b) => new Date(a.created_date) - new Date(b.created_date));
    const pioneerIds = new Set(sortedByDate.slice(0, 100).map((u) => u.id));

    let awarded = 0;
    for (const u of users || []) {
      if (u.badges_eligible === false) continue;
      const verifs = Array.isArray(u.verifications) ? [...u.verifications] : [];
      const toAdd = [];
      if (pioneerIds.has(u.id) && !verifs.includes('pioneer')) toAdd.push('pioneer');
      if ((postCounts[u.id] || 0) >= 20 && !verifs.includes('contributor')) toAdd.push('contributor');
      if ((eventCounts[u.id] || 0) >= 2 && !verifs.includes('organizer')) toAdd.push('organizer');
      if (!toAdd.length) continue;

      await base44.asServiceRole.entities.User.update(u.id, {
        verifications: [...verifs, ...toAdd],
      }).catch(() => {});
      awarded++;

      const labels = toAdd.map((b) => LABELS[b] || b);
      await sendEzaEmail(base44, {
        to: u.email,
        subject: '🎖️ Nouveau badge eza !',
        title: 'Nouveau badge débloqué',
        body: `Bonjour **${u.display_name || u.username || ''}**,\n\nFélicitations ! Vous avez reçu ${toAdd.length > 1 ? 'les badges' : 'le badge'} : **${labels.join(', ')}**.\n\nContinuez sur votre lancée — l'équipe eza vous voit.\n\n— L'équipe eza`,
        tagline: 'eza',
      }).catch(() => {});
    }

    await logAutomation(base44, {
      automation_name: 'run_badge_attribution',
      label: 'Attribution auto des badges',
      category: 'badges',
      status: 'success',
      summary: `${awarded} badge(s) attribués (${pioneerIds.size} pionniers éligibles)`,
      count: awarded,
    });

    return Response.json({ ok: true, awarded, pioneers: pioneerIds.size });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}