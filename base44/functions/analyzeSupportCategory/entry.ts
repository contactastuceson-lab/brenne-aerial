import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

// Analyse IA de la description d'un problème (étape 2 du wizard de ticket).
// Retourne 3 suggestions de type de problème, chacune avec un element_type
// ("post" = afficher les publications, "conversation" = discussions, "none" = rien).
// Appelée depuis le wizard NewTicketDialog avant la sélection du type.

export default async function(req) {
  let base44;
  try {
    base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Non connecté' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const description = (body?.description || '').toString().trim();
    if (!description) {
      return Response.json({ error: 'description requise' }, { status: 400 });
    }

    const prompt = `Tu es l'assistant de tri du support eza (réseau professionnel/communautaire : profil, posts, stories, communities, Spaces, events, boutique, banque de crédits, parrainage, messagerie).

Analyse la description ci-dessous et propose EXACTEMENT 3 types de problème possibles, du plus probable au moins probable.

Pour chaque suggestion, choisis:
- "label": un libellé court et clair en français (ex: "Bug d'affichage d'une publication", "Problème de facturation", "Signalement de contenu")
- "category": une valeur parmi ["account","billing","credits","bug","feature","events","moderation","messaging","other"]
- "element_type": "post" si l'utilisateur devrait sélectionner une publication concernée (problème d'affichage, likes, visibilité, signalement de contenu), "conversation" s'il devrait sélectionner une discussion/messagerie, "wallet" s'il s'agit d'un problème de portefeuille/crédits/solde/banque Eza, "event" s'il s'agit d'une inscription/remboursement/annulation d'événement, "none" s'il n'y a pas d'élément spécifique à sélectionner
- "description": une phrase courte expliquant ce type

Description de l'utilisateur:
"""
${description.slice(0, 2000)}
"""

Réponds en JSON STRICT conforme à ce schéma:
{
  "suggestions": [
    { "label": "...", "category": "...", "element_type": "post|conversation|wallet|event|none", "description": "..." },
    { "label": "...", "category": "...", "element_type": "...", "description": "..." },
    { "label": "...", "category": "...", "element_type": "...", "description": "..." }
  ]
}

Règles:
- 3 suggestions exactement, ordonnées par probabilité.
- element_type "post" pour les problèmes d'affichage/likes/visibilité d'une publication ou signalement de contenu.
- element_type "conversation" pour les problèmes de messagerie/discussions.
- element_type "wallet" pour les problèmes de portefeuille, crédits, solde, transfert, ou banque Eza.
- element_type "event" pour les problèmes d'inscription, remboursement, annulation ou accès à un événement.
- element_type "none" pour les problèmes de compte, facturation générale, fonctionnalité, ou généraux.
- Libellés en français, concis.`;

    const ai = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: 'object',
        properties: {
          suggestions: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                label: { type: 'string' },
                category: { type: 'string' },
                element_type: { type: 'string' },
                description: { type: 'string' },
              },
            },
          },
        },
      },
    }).catch((e) => ({ __error: String(e?.message || e) }));

    if (ai?.__error) {
      return Response.json({ error: ai.__error }, { status: 500 });
    }

    const suggestions = Array.isArray(ai?.suggestions) ? ai.suggestions.slice(0, 3).map((s) => ({
      label: String(s.label || 'Autre').slice(0, 80),
      category: ['account','billing','credits','bug','feature','events','moderation','messaging','other'].includes(s.category) ? s.category : 'other',
      element_type: ['post','conversation','wallet','event','none'].includes(s.element_type) ? s.element_type : 'none',
      description: String(s.description || '').slice(0, 200),
    })) : [];

    // Fallback si l'IA n'a rien retourné d'exploitable
    if (suggestions.length === 0) {
      return Response.json({
        suggestions: [
          { label: 'Problème de compte', category: 'account', element_type: 'none', description: 'Compte, connexion, profil' },
          { label: 'Bug technique', category: 'bug', element_type: 'post', description: 'Bug d\'affichage ou technique' },
          { label: 'Autre demande', category: 'other', element_type: 'none', description: 'Question générale' },
        ],
      });
    }

    return Response.json({ suggestions });
  } catch (error) {
    return Response.json({ error: String(error?.message || error) }, { status: 500 });
  }
}