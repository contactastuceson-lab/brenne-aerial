import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { message } = await req.json();

    if (!message?.trim()) {
      return Response.json({ error: 'Message vide' }, { status: 400 });
    }

    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `Tu es un assistant de rédaction pour Brenne Aerial, une entreprise de services de drone. 
      
      Reformule ce message officiel pour qu'il soit plus professionnel, clair et impactant. 
      Garde le même sens et la même longueur environ. Utilise un ton courtois et expert.
      
      ✨ IMPORTANT: Utilise le Markdown de manière généreuse pour rendre le message visuellement beau:
      - Utilise **gras** pour les éléments importants et les appels à l'action
      - Utilise *italique* pour mettre en avant certains détails
      - Crée des listes à puces (-) pour les points clés
      - Utilise les citations (>) pour les témoignages ou points importants
      - Utilise des retours à la ligne pour une meilleure lisibilité
      - Utilise \`code\` pour les détails techniques si nécessaire
      
      Message original:
      "${message}"
      
      Retourne UNIQUEMENT le message reformulé avec Markdown, sans explications.`,
      response_json_schema: {
        type: 'object',
        properties: {
          refined_message: { type: 'string', description: 'Le message reformulé avec Markdown' }
        },
        required: ['refined_message']
      }
    });

    return Response.json({ success: true, refined_message: result.refined_message });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});