import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { logAutomation } from '../../shared/logAutomation.ts';

// Suggère les articles de documentation les plus pertinents pour l'utilisateur
// en analysant SES tickets de support ouverts (sujets + descriptions).
// L'IA croise le contenu des tickets avec le catalogue de la documentation EZA
// et renvoie une liste ordonnée d'articles pertinents, chacun avec une raison
// courte et une référence aux tickets qui ont motivé la suggestion.
//
// Utilisé par la page /documentation pour afficher une section
// « Articles suggérés pour vous » personnalisée selon les demandes en cours.

const DOC_CATALOG = [
  { slug: 'overview', title: "Vue d'ensemble", kw: 'plateforme, fonctionnement, présentation' },
  { slug: 'social', title: 'Réseau social', kw: 'publication, post, like, hashtag, mention, visibilité, fil' },
  { slug: 'messaging', title: 'Messagerie', kw: 'message, conversation, demande de contact, spam, officiel' },
  { slug: 'forum', title: 'Forum & discussions', kw: 'forum, discussion, sujet, réponse, markdown, lien externe' },
  { slug: 'communities', title: 'Communautés', kw: 'communauté, membres, règles, post communautaire, capacité' },
  { slug: 'stories', title: 'Stories', kw: 'story, ephemere, caméra, filtre, sticker, 24h' },
  { slug: 'spaces', title: 'Spaces audio', kw: 'space, audio, live, livekit, orateur, direct' },
  { slug: 'events', title: 'Événements', kw: 'événement, inscription, billet, check-in, annulation, remboursement, qr' },
  { slug: 'economie-credits', title: 'Crédits Eza', kw: 'crédit, gain, récompense, dépense, fraude, récompense action' },
  { slug: 'economie-boutique', title: 'Boutique', kw: 'boutique, pack, abonnement, pro, business, enterprise, token, stripe' },
  { slug: 'banque', title: 'Banque & portefeuilles', kw: 'wallet, portefeuille, solde, transfert, gel, frozen, banque' },
  { slug: 'parrainage', title: 'Parrainage & récompenses', kw: 'parrainage, filleul, code, jalon, fraude parrainage' },
  { slug: 'ads', title: 'Publicité business', kw: 'publicité, campagne, budget, impression, clic, business, ciblage' },
  { slug: 'profile', title: 'Profil & identité', kw: 'profil, username, compte, personnalisation, thème, badge' },
  { slug: 'certifications', title: 'Certifications', kw: 'certification, vérification, badge, paiement stripe, questionnaire' },
  { slug: 'affiliations', title: 'Affiliations & écosystème', kw: 'affiliation, organisation, logo, écosystème, entreprise' },
  { slug: 'enor', title: "Enor & identité fondatrice", kw: 'enor, pdg, histoire, vision, eza group' },
  { slug: 'support', title: 'Support & Nexus IA', kw: 'support, ticket, nexus, ia, escalade, action, ia support' },
  { slug: 'stack', title: 'Stack technique', kw: 'technique, react, vite, base44, architecture, technologies' },
  { slug: 'notifications', title: 'Notifications', kw: 'notification, push, email, digest, préférences, fcm, vapid' },
  { slug: 'pwa', title: 'PWA & installation', kw: 'pwa, installation, ios, android, manifest, offline, écran accueil' },
  { slug: 'auth', title: 'Authentification', kw: 'connexion, login, oauth, otp, reset, mot de passe, 2fa, session' },
  { slug: 'data', title: 'Modèle de données', kw: 'données, entité, snapshot, base de données, sdk, realtime' },
  { slug: 'design', title: 'Système de design', kw: 'design, thème, tokens, couleurs, typographie, sky, glassmorphism' },
  { slug: 'integrations', title: 'Intégrations & services', kw: 'intégration, connecteur, oauth, secret, stripe, livekit, giphy' },
  { slug: 'security', title: 'Sécurité & RGPD', kw: 'sécurité, rgpd, suppression compte, audit, session, device, 2fa' },
  { slug: 'automations', title: 'Automatisations', kw: 'automatisation, cron, schedule, webhook, digest, modération auto' },
  { slug: 'rls', title: 'Row-Level Security', kw: 'rls, sécurité ligne, isolation, permission, rôle, ownership' },
  { slug: 'conventions', title: 'Conventions de code', kw: 'convention, code, esm, import, composant, entité, tailwind' },
  { slug: 'portfolio', title: 'Portfolio', kw: 'portfolio, projet, avant après, avis, carte, géolocalisation' },
  { slug: 'blog', title: 'Blog & articles', kw: 'blog, article, rédaction, catégorie, publication article' },
];

const OPEN_STATUSES = ['open', 'awaiting_human', 'ai_resolved'];

export default async function(req) {
  let base44;
  try {
    base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Non connecté' }, { status: 401 });

    // Tickets ouverts / en cours de l'utilisateur (les résolus/fermés ne sont
    // plus pertinents pour suggérer de la doc à lire).
    const tickets = await base44.asServiceRole.entities.SupportTicket
      .filter({ user_email: user.email }, '-created_date', 15)
      .catch(() => []);

    const open = (tickets || []).filter((t) => OPEN_STATUSES.includes(t.status));

    // Aucun ticket ouvert → pas de suggestion personnalisée.
    if (open.length === 0) {
      return Response.json({ suggestions: [], ticketsAnalyzed: 0 });
    }

    // Contexte compact : pour chaque ticket, le sujet + la description + le
    // dernier message utilisateur. On limite à ~2500 caractères au total.
    const ticketDigests = [];
    let totalChars = 0;
    for (const t of open) {
      const lastUser = (Array.isArray(t.messages) ? t.messages.filter((m) => m.role === 'user').pop() : null);
      const digest = `#${String(t.id).slice(-6)} [${t.category || 'other'}] « ${t.subject || ''} »\n${(t.description || '').slice(0, 400)}${lastUser ? '\nDERNIER MSG: ' + String(lastUser.content || '').slice(0, 300) : ''}`;
      if (totalChars + digest.length > 2500) break;
      totalChars += digest.length;
      ticketDigests.push(digest);
    }

    const catalogText = DOC_CATALOG.map((d) => `- ${d.slug} : « ${d.title} » (${d.kw})`).join('\n');

    const prompt = `Tu es l'assistant de documentation EZA. On te donne les tickets de support OUVERTS d'un utilisateur. Analyse leurs sujets et descriptions, et suggère les articles de documentation les plus pertinents pour l'aider à résoudre ou comprendre ses demandes.

CATALOGUE DE LA DOCUMENTATION (slug : titre — mots-clés) :
${catalogText}

TICKETS OUVERTS DE L'UTILISATEUR :
${ticketDigests.join('\n\n')}

Réponds en JSON STRICT conforme à ce schéma :
{
  "suggestions": [
    { "slug": "...", "reason": "courte raison en français pourquoi cet article est pertinent pour les tickets de cet utilisateur" }
  ]
}

Règles :
- Entre 1 et 4 suggestions, ordonnées par pertinence décroissante (le plus utile en premier).
- Le slug DOIT exister dans le catalogue ci-dessus (copie exactement la valeur slug).
- La reason est une phrase courte, en français, qui relie l'article aux tickets (ex: "Vous avez un ticket sur le gel de votre portefeuille — la doc explique le dégel et les transferts").
- Ne suggère jamais un article technique (stack, conventions, rls…) pour un ticket utilisateur non-développeur.
- Si aucun article n'est clairement pertinent, renvoie un tableau vide.`;

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
                slug: { type: 'string' },
                reason: { type: 'string' },
              },
            },
          },
        },
      },
    }).catch((e) => ({ __error: String(e?.message || e) }));

    if (ai?.__error) {
      return Response.json({ suggestions: [], ticketsAnalyzed: open.length, error: ai.__error });
    }

    // Valide les slugs retournés contre le catalogue réel.
    const validSlugs = new Set(DOC_CATALOG.map((d) => d.slug));
    const bySlug = Object.fromEntries(DOC_CATALOG.map((d) => [d.slug, d]));
    const seen = new Set();
    const suggestions = (Array.isArray(ai?.suggestions) ? ai.suggestions : [])
      .filter((s) => s && s.slug && validSlugs.has(s.slug))
      .map((s) => {
        if (seen.has(s.slug)) return null;
        seen.add(s.slug);
        const meta = bySlug[s.slug];
        return {
          slug: s.slug,
          title: meta.title,
          reason: String(s.reason || '').slice(0, 200),
        };
      })
      .filter(Boolean)
      .slice(0, 4);

    return Response.json({ suggestions, ticketsAnalyzed: open.length });
  } catch (error) {
    if (base44) {
      await logAutomation(base44, {
        automation_name: 'suggest_doc_for_user', label: 'Doc — suggestions personnalisées', category: 'system',
        status: 'error', summary: 'Échec', details: String(error?.message || error),
      }).catch(() => {});
    }
    return Response.json({ error: String(error?.message || error) }, { status: 500 });
  }
}