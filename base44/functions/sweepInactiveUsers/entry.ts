import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { secrets } from 'base44:runtime';
import { sendEzaEmail } from '../../shared/ezaEmails.ts';

// Tâche planifiée quotidienne : relance par email les utilisateurs inactifs depuis
// ~12 mois. Fenêtre étroite (360-372 jours d'inactivité) pour ne relancer chaque
// utilisateur qu'une seule fois et éviter le spam récurrent.

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const now = Date.now();
    const day = 24 * 3600 * 1000;
    const minOld = new Date(now - 372 * day);
    const maxOld = new Date(now - 360 * day);

    const users = await base44.asServiceRole.entities.User.list().catch(() => []);
    if (!users || !users.length) return Response.json({ ok: true, sent: 0 });

    const appUrl = (secrets.get('APP_URL') || 'https://eza.group').replace(/\/$/, '');

    let sent = 0;
    for (const u of users) {
      if (!u.updated_date) continue;
      const d = new Date(u.updated_date);
      if (d < minOld || d > maxOld) continue;
      await sendEzaEmail(base44, {
        to: u.email,
        subject: '🚀 On vous manque sur eza !',
        title: 'On vous manque',
        body: `Bonjour **${u.display_name || u.username || ''}**,\n\nCela fait un moment que vous n'êtes pas venu sur eza !\n\nVotre communauté vous attend : nouvelles publications, événements à venir, et crédits Eza à récupérer.\n\nRevenez partager votre actualité :\n${appUrl}\n\nÀ très vite,\n— L'équipe eza`,
        tagline: 'eza',
      }).catch(() => {});
      sent++;
    }

    return Response.json({ ok: true, sent });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}