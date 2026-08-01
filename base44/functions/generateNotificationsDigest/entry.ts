import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

// Synthèse vocale du résumé de notifications de l'utilisateur courant.
// Récupère les dernières notifications, compose un texte en français,
// génère un MP3 via GenerateSpeech et renvoie l'URL lisible.

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ ok: false, error: 'Non connecté' }, { status: 401 });

    const notifs = await base44.entities.Notification.filter({ user_email: user.email }, '-created_date', 20);
    if (!notifs || notifs.length === 0)
      return Response.json({ ok: false, error: 'Aucune notification à résumer' });

    const unread = notifs.filter((n) => !n.is_read).length;
    let text = `Bonjour, vous avez ${unread} notification${unread > 1 ? 's' : ''} non lue${unread > 1 ? 's' : ''}. Voici vos dernières notifications. `;
    for (const n of notifs.slice(0, 8)) {
      const t = (n.title || '').replace(/\s+/g, ' ').trim();
      if (t) text += `${t}. `;
    }
    text += "C'est tout pour le moment. À bientôt sur Eza.";

    const res = await base44.integrations.Core.GenerateSpeech({ text, language_code: 'fr' });
    const url = res?.url || res?.data?.url;
    if (!url) return Response.json({ ok: false, error: 'Échec de la génération audio' });
    return Response.json({ ok: true, audio_url: url, text });
  } catch (error) {
    return Response.json({ ok: false, error: error.message }, { status: 500 });
  }
}