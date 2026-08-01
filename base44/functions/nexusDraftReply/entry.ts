import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

// Rédaction assistée par Nexus : génère une réponse officielle (à un signalement,
// un ticket, une demande) à partir du contexte. Réservé aux admins (invocation
// depuis l'interface d'administration). Renvoie un brouillon en texte brut.

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ ok: false, error: 'Unauthorized' }, { status: 401 });

    const { context, recipient, tone } = await req.json().catch(() => ({}));
    if (!context) return Response.json({ ok: false, error: 'Contexte manquant' }, { status: 400 });

    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `Tu es Nexus, l'assistant IA de l'équipe d'administration d'eza (plateforme communautaire professionnelle française).
Rédige une réponse officielle à destination de ${recipient || "un utilisateur"}.
Contexte :
"""${context}"""

Ton souhaité : ${tone || 'professionnel, rassurant et ferme si besoin'}.
La réponse doit être en français, courtoise, claire, et indiquer la décision ou les prochaines étapes (4 à 8 lignes).
Réponds en texte brut, pas de JSON.`,
    }).catch(() => null);

    const draft = typeof result === 'string' && result.trim() ? result.trim() : '';
    return Response.json({ ok: true, draft });
  } catch (error) {
    return Response.json({ ok: false, error: error.message }, { status: 500 });
  }
}