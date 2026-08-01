import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { sendEzaEmail } from '../../shared/ezaEmails.ts';
import { logAutomation } from '../../shared/logAutomation.ts';

// Tâche planifiée quotidienne : séquence d'onboarding en 3 emails (J1, J3, J7).
// Fenêtre étroite autour du jour cible pour n'envoyer chaque étape qu'une seule fois.

const STEPS = [
  {
    day: 1,
    subject: 'Bienvenue sur eza — vos premières étapes 🚀',
    title: 'Bienvenue sur eza',
    bodyFn: (n) =>
      `Bonjour **${n}**,\n\nBienvenue dans la communauté eza ! Pour bien démarrer :\n\n- Complétez votre profil (photo, bio, centres d'intérêt)\n- Présentez-vous en une publication\n- Rejoignez une communauté qui vous ressemble\n\n— L'équipe eza`,
  },
  {
    day: 3,
    subject: '3 idées pour publier sur eza ✍️',
    title: "Trouvez l'inspiration",
    bodyFn: (n) =>
      `Bonjour **${n}**,\n\nPas d'inspiration ? Voici 3 idées de publications :\n\n- Une réalisation récente dont vous êtes fier\n- Une question à la communauté\n- Un lien utile ou une actualité de votre domaine\n\nVos premières publications lancent la conversation.\n\n— L'équipe eza`,
  },
  {
    day: 7,
    subject: 'On vous attend sur eza ! 👋',
    title: 'On vous attend',
    bodyFn: (n) =>
      `Bonjour **${n}**,\n\nCela fait une semaine que vous avez rejoint eza. Votre communauté s'agrandit chaque jour !\n\nRevenez publier, échanger ou participer à un événement — chaque interaction vous rapporte des crédits Eza.\n\nÀ très vite,\n— L'équipe eza`,
  },
];

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const users = await base44.asServiceRole.entities.User.list().catch(() => []);
    if (!users || !users.length) {
      await logAutomation(base44, { automation_name: 'send_onboarding_sequence', label: 'Séquence onboarding J1/J3/J7', category: 'onboarding', status: 'success', summary: 'Aucun utilisateur à onboarder', count: 0 });
      return Response.json({ ok: true, sent: 0 });
    }

    const now = Date.now();
    const day = 24 * 3600 * 1000;
    let sent = 0;
    for (const u of users) {
      if (!u.created_date) continue;
      const ageDays = Math.floor((now - new Date(u.created_date).getTime()) / day);
      const name = u.display_name || u.username || '';
      for (const step of STEPS) {
        if (ageDays === step.day) {
          await sendEzaEmail(base44, {
            to: u.email,
            subject: step.subject,
            title: step.title,
            body: step.bodyFn(name),
            tagline: 'eza',
          }).catch(() => {});
          sent++;
        }
      }
    }
    await logAutomation(base44, {
      automation_name: 'send_onboarding_sequence', label: 'Séquence onboarding J1/J3/J7', category: 'onboarding',
      status: 'success',
      summary: sent > 0 ? `${sent} email(s) d'onboarding envoyés` : 'Aucun utilisateur au jour cible',
      count: sent,
    });

    return Response.json({ ok: true, sent });
  } catch (error) {
    await logAutomation(base44, {
      automation_name: 'send_onboarding_sequence', label: 'Séquence onboarding J1/J3/J7', category: 'onboarding',
      status: 'error', summary: 'Échec de la séquence onboarding', details: String(error?.message || error),
    });
    return Response.json({ error: error.message }, { status: 500 });
  }
}