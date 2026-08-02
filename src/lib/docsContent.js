// Contenu de la documentation publique EZA.
// Chaque sujet = une page dédiée (/documentation/:slug) avec plusieurs sections riches.
// Modèle de section enrichi :
//   { title, body, table?: [{k,v}], bullets?: [], callout?: {kind,title,text}, steps?: [], code?: string }
// kind de callout : 'tip' | 'note' | 'warning' | 'info' | 'success'

// Illustrations IA par thème, assignées à chaque sujet.
export const DOC_IMAGES = {
  platform: 'https://media.base44.com/images/public/69c5c081406b9e20deaed582/15b445f90_generated_image.png',
  social: 'https://media.base44.com/images/public/69c5c081406b9e20deaed582/fc64bbf29_generated_image.png',
  technical: 'https://media.base44.com/images/public/69c5c081406b9e20deaed582/ba5be6dc9_generated_image.png',
  economy: 'https://media.base44.com/images/public/69c5c081406b9e20deaed582/dd1701cb0_generated_image.png',
  identity: 'https://media.base44.com/images/public/69c5c081406b9e20deaed582/ba8d47f9_generated_image.png',
  security: 'https://media.base44.com/images/public/69c5c081406b9e20deaed582/447b7b854_generated_image.png',
  notifications: 'https://media.base44.com/images/public/69c5c081406b9e20deaed582/858e916d4_generated_image.png',
  design: 'https://media.base44.com/images/public/69c5c081406b9e20deaed582/cc7fb5fb8_generated_image.png',
};

export const DOC_IMAGE_BY_SLUG = {
  overview: 'platform', stack: 'technical', social: 'social', messaging: 'social',
  forum: 'social', portfolio: 'design', blog: 'social', profile: 'identity',
  certifications: 'identity', affiliations: 'platform', enor: 'identity',
  notifications: 'notifications', pwa: 'technical', auth: 'security', data: 'technical',
  design: 'design', integrations: 'technical', security: 'security',
  'economie-credits': 'economy', 'economie-boutique': 'economy', 'economie-tokens': 'economy',
  'economie-admin': 'economy', conventions: 'technical', communities: 'social',
  stories: 'social', spaces: 'social', events: 'economy', banque: 'economy',
  parrainage: 'economy', ads: 'economy', support: 'identity', automations: 'technical', rls: 'security',
};

export const getDocImage = (slug) => DOC_IMAGES[DOC_IMAGE_BY_SLUG[slug] || 'platform'];
export const getDocTopic = (slug) => DOC_TOPICS.find((t) => t.slug === slug) || null;

// Catégories pour filtrer la grille.
export const DOC_CATEGORIES = [
  { id: 'all', label: 'Tout', color: '#38aadc' },
  { id: 'plateforme', label: 'Plateforme', color: '#38aadc' },
  { id: 'social', label: 'Social & communauté', color: '#1dd8b4' },
  { id: 'economie', label: 'Économie & crédits', color: '#ff6d3f' },
  { id: 'identite', label: 'Identité & confiance', color: '#a78bfa' },
  { id: 'tech', label: 'Technique', color: '#f59e0b' },
];

export const DOC_TOPICS = [
  {
    slug: 'overview', cat: 'plateforme', icon: 'Book',
    title: "Vue d'ensemble", tagline: "La plateforme EZA en un coup d'œil", color: '#38aadc',
    intro: "EZA est une plateforme communautaire et sociale tout-en-un, installable en PWA sur iOS et Android depuis le même code. Elle réunit un réseau social, une messagerie, un forum, un portfolio, un blog, des communautés, des Spaces audio, des stories, des événements, des certifications, des affiliations, une économie de crédits interne et un support IA — dans une seule application responsive et rapide.",
    sections: [
      {
        title: "Les grands pôles",
        body: "L'application est organisée autour de plusieurs pôles qui partagent la même identité, le même système de design et les mêmes utilisateurs. Chaque pôle a sa propre page et ses propres interactions, mais tout est interconnecté : un auteur de publication est aussi un utilisateur avec un profil public, des badges, des affiliations et un portefeuille de crédits.",
        table: [
          { k: 'Réseau social', v: 'Publications, médias, sondages, likes, réponses, mentions, hashtags, reposts, suivi.' },
          { k: 'Messagerie', v: 'Conversations 1-à-1, demandes de contact, modération, messages officiels.' },
          { k: 'Forum', v: 'Discussions thématiques, réponses, likes, annonces, épinglage.' },
          { k: 'Communautés', v: 'Espaces thématiques avec membres, posts communautaires, règles.' },
          { k: 'Spaces', v: 'Salons audio en direct (LiveKit) avec hôtes, orateurs, auditeurs.' },
          { k: 'Stories', v: 'Contenus éphémères 24h, réactions, caméra intégrée, filtres, stickers.' },
          { k: 'Portfolio', v: 'Galerie de projets, comparaisons avant/après, avis clients, carte interactive.' },
          { k: 'Blog', v: 'Articles d\'actualité, conseils, techniques, projets et formation.' },
          { k: 'Événements', v: 'Inscriptions, billetterie en crédits, check-in, QR codes.' },
          { k: 'Certifications', v: 'Questionnaire + paiement, badges de vérification officiels.' },
          { k: 'Banque', v: 'Portefeuilles, transferts, gel, historique des transactions.' },
          { k: 'Boutique', v: 'Packs de crédits, abonnements, tokens fonctionnels.' },
          { k: 'Parrainage', v: 'Code de parrainage, filleuls, jalons, récompenses cumulées.' },
          { k: 'Publicité', v: 'Campagnes business, budgets en crédits, placements, analytics.' },
          { k: 'Support Nexus', v: 'Tickets IA contextuels, actions autonomes, escalade humaine.' },
        ],
      },
      {
        title: "Pour qui ?",
        body: "EZA s'adresse à une communauté de créateurs, de professionnels et de clients. Les créateurs partagent leurs réalisations, les clients découvrent un portfolio et demandent des devis, et la communauté échange via le forum, les communautés et la messagerie. Les organisations peuvent s'affilier et afficher leur logo sur les profils.",
        bullets: [
          "Créateurs et auteurs de contenu (publications, stories, portfolio, blog).",
          "Clients à la recherche de prestations (portfolio, devis, événements).",
          "Communauté souhaitant échanger (forum, communautés, Spaces, social).",
          "Organisations et comptes business souhaitant exister et recruter des affiliés.",
          "Professionnels cherchant crédibilité (certifications, badges, vérifications).",
        ],
        callout: { kind: 'info', title: 'Une seule identité', text: "Un compte EZA donne accès à TOUS les pôles. Pas besoin de recréer un profil par fonctionnalité — votre réputation, vos badges et votre solde vous suivent partout." },
      },
      {
        title: "Principes de conception",
        body: "L'application est pensée comme une application native : rapide, tactile, avec un design sombre « Sky » par défaut et un thème clair optionnel. Tout est responsive, optimisé pour le mobile, et installable sur l'écran d'accueil.",
        table: [
          { k: 'Design', v: 'Dark-first (palette bleu/cyan) + thème clair, glassmorphism, halos lumineux.' },
          { k: 'Mobile', v: 'Mobile-first, safe areas, momentum scroll, sans flash au tap, press feedback.' },
          { k: 'Performance', v: 'Lazy loading, contain layout, GPU layers, skeleton shimmers.' },
          { k: 'Accessibilité', v: 'Reduced-motion, contrastes lisibles, focus rings, tailles tactiles.' },
          { k: 'PWA', v: 'Installable, offline shell, push notifications, écran d\'accueil.' },
        ],
      },
      {
        title: "Le PDG IA (Nexus)",
        body: "EZA est pilotée par un agent IA nommé Nexus, qui agit comme un PDG numérique. Nexus traite le support, génère des digests, attribue des badges, détecte la fraude, surveille l'économie et rédige des brouillons de réponses — le tout automatiquement via des automatisations planifiées.",
        bullets: [
          "Support IA contextuel : Nexus lit le compte de l'utilisateur avant de répondre.",
          "Actions autonomes : inscriptions, crédits, remboursements, transferts, dégel.",
          "Escalade humaine : Nexus sait quand transmettre à un humain (sécurité, litige).",
          "Digests automatiques : quotidien, hebdomadaire, activité de la communauté.",
          "Modération prédictive : analyse des nouveaux posts, détection de fraude parrainage.",
        ],
        callout: { kind: 'tip', title: 'Nexus connaît votre compte', text: "Quand vous ouvrez un ticket, Nexus vérifie votre solde, vos inscriptions, vos posts et votre documentation AVANT de répondre — pas une réponse générique." },
      },
    ],
  },
  {
    slug: 'stack', cat: 'tech', icon: 'Zap',
    title: "Stack technique", tagline: "Technologies et architecture", color: '#1dd8b4',
    intro: "EZA repose sur React + Vite pour le front, Tailwind CSS + shadcn/ui pour le style, et le backend-as-a-service Base44 pour les données, l'authentification, les fonctions backend, les automatisations et les intégrations.",
    sections: [
      {
        title: "Frontend",
        body: "L'interface est une SPA React construite avec Vite (ESM, pas de require). Le style utilise Tailwind CSS mappé sur des tokens CSS personnalisés, et shadcn/ui fournit les primitives (boutons, dialogues, selects, tabs, sheets…).",
        table: [
          { k: 'React 18', v: 'Hooks, suspense, concurrent rendering.' },
          { k: 'Vite (ESM)', v: 'Build rapide, HMR, imports dynamiques, pas de require().' },
          { k: 'Tailwind CSS', v: 'Tokens HSL mappés, dark/light, animations, safelist runtime.' },
          { k: 'shadcn/ui', v: 'Primitives Radix stylées dans src/components/ui.' },
          { k: 'react-router-dom v6', v: 'Routing, layout routes, ProtectedRoute.' },
          { k: '@tanstack/react-query', v: 'Cache, data fetching, états de requête.' },
          { k: 'framer-motion', v: 'Animations, transitions, gestures, layout.' },
          { k: 'lucide-react', v: 'Icônes (uniquement celles qui existent réellement).' },
          { k: 'react-leaflet', v: 'Cartes interactives (portfolio, maps).' },
          { k: 'recharts', v: 'Graphiques et dataviz.' },
          { k: '@hello-pangea/dnd', v: 'Drag & drop accessible.' },
        ],
      },
      {
        title: "Backend (Base44)",
        body: "Base44 fournit les entités (schémas JSON), l'authentification, les fonctions backend (handlers HTTP dans base44/functions), les automatisations (cron, entity events, connector webhooks) et les intégrations Core. Le SDK est pré-initialisé dans src/api/base44Client.js.",
        table: [
          { k: 'Entités', v: 'Schémas JSON dans base44/entities — RLS par opération.' },
          { k: 'Auth', v: 'Email/password, Google OAuth, OTP, reset — géré par la plateforme.' },
          { k: 'Fonctions', v: 'Handlers HTTP dans base44/functions/<name>/entry.ts.' },
          { k: 'Automations', v: 'Planifiées (cron), entité (create/update/delete), connecteur (webhooks).' },
          { k: 'Intégrations Core', v: 'InvokeLLM, UploadFile, GenerateImage, SendEmail, TTS, vidéo, extraction.' },
          { k: 'Realtime', v: 'base44.entities.X.subscribe() — événements create/update/delete.' },
          { k: 'Connecteurs', v: 'OAuth partagés ou par utilisateur (Slack, Google, Outlook…).' },
        ],
      },
      {
        title: "Services externes",
        body: "L'app s'appuie sur plusieurs services externes pour les paiements, les notifications, les GIFs, l'audio en direct et l'authentification sociale.",
        table: [
          { k: 'Stripe', v: 'Certifications, donations, abonnements, achat de crédits, portail client.' },
          { k: 'web-push (VAPID)', v: 'Notifications push web (service worker).' },
          { k: 'Firebase Cloud Messaging', v: 'Push cross-platform.' },
          { k: 'GIPHY', v: 'Recherche de GIFs dans le composer et les stories.' },
          { k: 'Google OAuth', v: 'Connexion sociale + One Tap.' },
          { k: 'Outlook', v: 'Synchronisation du calendrier (rendez-vous).' },
          { k: 'LiveKit', v: 'Audio temps réel pour les Spaces.' },
        ],
      },
      {
        title: "Organisation du code",
        body: "Le projet suit une structure claire : pages dans src/pages, composants dans src/components (ui, partagés, par feature), logique partagée dans src/lib, entités dans base44/entities, fonctions dans base44/functions.",
        bullets: [
          "src/pages — une page par fichier, export default nommé.",
          "src/components/ui — primitives shadcn (un import par fichier).",
          "src/components/<feature> — composants métier (post, support, banque…).",
          "src/lib — utils, hooks, constants (cn, createPageUrl, roles…).",
          "base44/entities — schémas JSON + RLS.",
          "base44/functions — handlers HTTP (entry.ts) + shared.",
          "base44/agents — configs d'agents IA (JSON).",
        ],
        callout: { kind: 'warning', title: 'ESM uniquement', text: "Le projet est Vite ESM : jamais de require() ni module.exports. Les imports utilisent l'alias @/ (pas de chemins relatifs src/)." },
      },
    ],
  },
  {
    slug: 'social', cat: 'social', icon: 'Users',
    title: "Réseau social", tagline: "Fil, publications, likes, réponses, reposts", color: '#38aadc',
    intro: "Le réseau social est le cœur d'EZA. Les utilisateurs publient du contenu (texte, médias, sondages), interagissent (likes, réponses, partages, reposts, citations) et suivent d'autres comptes dans un fil infini.",
    sections: [
      {
        title: "Les publications (Post)",
        body: "Une publication contient du texte libre dans lequel les hashtags (#) et les mentions (@username) sont extraits automatiquement. On peut y joindre des médias (images, vidéos, GIFs) et un sondage. La visibilité est configurable et le post peut appartenir à une communauté.",
        table: [
          { k: 'Contenu', v: 'Texte libre, hashtags et mentions auto-extraits.' },
          { k: 'Médias', v: 'Images, vidéos, GIFs (GIPHY) multiples.' },
          { k: 'Sondage', v: 'Question, options, votes, durée, total des votes.' },
          { k: 'Auteur', v: 'Snapshot : nom, username, avatar, vérifications.' },
          { k: 'Visibilité', v: 'Public, abonnés, certifiés, cercle EZA.' },
          { k: 'Communauté', v: 'Post rattaché à une communauté (community_id).' },
          { k: 'Brouillon', v: 'is_draft + scheduled_at pour la programmation.' },
        ],
      },
      {
        title: "Interactions",
        body: "Chaque publication expose des actions sociales : aimer, répondre, partager, signaler, éditer, supprimer. Les compteurs sont maintenus en temps réel.",
        steps: [
          "Like — incrémente likes_count, ajoute l'utilisateur à liked_by (togglePostLike).",
          "Réponse — crée un Post avec reply_to_id (thread de conversation).",
          "Repost — partage simple (reposts_count) ou citation (quote post, quotes_count).",
          "Signalement — ouvre un ReportModal (entité Report, notifie les admins).",
          "Vues — views_count incrémenté via incrementPostViews.",
          "Édition / suppression — par l'auteur (RLS) ou un admin.",
        ],
      },
      {
        title: "Hashtags & tendances",
        body: "Les hashtags alimentent la recherche et les tendances affichées dans la sidebar droite. La barre de recherche accepte aussi bien des noms d'utilisateurs que des #hashtags.",
        bullets: [
          "Extraction automatique des hashtags depuis le contenu.",
          "Sidebar tendances : hashtags les plus utilisés (Discussion + Post).",
          "Recherche par hashtag via /?tag=monTag.",
          "Recherche d'utilisateurs par nom ou @username.",
        ],
        callout: { kind: 'tip', title: 'Astuce visibilité', text: "Un post en visibilité « certifiés » n'est visible que par les comptes certifiés — idéal pour les annonces réservées aux professionnels vérifiés." },
      },
      {
        title: "Suivi (Follow) & découverte",
        body: "Les utilisateurs peuvent s'abonner les uns aux autres. L'entité Follow relie un follower à un following. La sidebar propose des suggestions, et la page /discover permet d'explorer la communauté.",
        bullets: [
          "Entité Follow : follower_id / following_id.",
          "Suggestions d'utilisateurs dans la sidebar.",
          "Page /discover pour explorer la communauté.",
          "Profil public /@username avec publications et statistiques.",
          "Listes personnalisées (UserList) — publiques ou privées.",
        ],
      },
      {
        title: "Création de contenu",
        body: "La création d'une publication passe par un composer riche : upload de médias, recherche de GIF, créateur de sondage, autocomplétion des mentions et programmation.",
        bullets: [
          "Upload de fichiers (intégration UploadFile).",
          "GifPicker — recherche GIPHY.",
          "PollCreator — sondage avec options et durée.",
          "MentionAutocomplete — suggestion de @username.",
          "LazyMedia / VideoPlayer — chargement différé et lecture vidéo.",
          "ScheduledPostsManager — programmation de publications.",
        ],
      },
    ],
  },
  {
    slug: 'messaging', cat: 'social', icon: 'MessageSquare',
    title: "Messagerie", tagline: "Conversations 1-à-1 en temps réel", color: '#1dd8b4',
    intro: "La messagerie permet des conversations privées entre deux utilisateurs, avec gestion des demandes de contact, modération fine, messages officiels et raffinement par IA.",
    sections: [
      {
        title: "Les conversations",
        body: "Chaque conversation est identifiée par les emails des deux participants triés alphabétiquement (emailA_emailB). Les messages stockent expéditeur, destinataire, contenu et statut de lecture.",
        table: [
          { k: 'Identifiant', v: 'Emails triés alphabétiquement (emailA_emailB).' },
          { k: 'Champs', v: 'sender_email, recipient_email, content, is_read.' },
          { k: 'Temps réel', v: 'Subscription, polling, statut en ligne.' },
          { k: 'Lu', v: 'Marquage automatique + auto-scroll.' },
        ],
      },
      {
        title: "Demandes de contact",
        body: "Le premier message envoyé à quelqu'un est une demande de contact (is_request). Le destinataire peut l'accepter, la refuser ou l'ignorer. Tant qu'elle est en attente, elle apparaît dans le panneau des demandes.",
        steps: [
          "is_request = true pour le premier message vers un nouveau contact.",
          "request_status : pending → accepted / declined.",
          "Panneau MessageRequestsPanel pour les demandes entrantes.",
          "ConversationList avec filtre « demandes ».",
        ],
        callout: { kind: 'note', title: 'Anti-spam', text: "Tant qu'une demande n'est pas acceptée, la conversation reste isolée. Cela empêche le spam et protège la boîte de réception." },
      },
      {
        title: "Messages officiels & avertissements",
        body: "L'équipe peut envoyer des messages officiels (is_official) mis en forme distinctement, et des avertissements (is_warning). Des notes internes (is_admin_note) existent mais ne sont pas visibles côté utilisateur.",
        table: [
          { k: 'is_official', v: 'Message de l\'équipe, style dédié (badge officiel).' },
          { k: 'is_warning', v: 'Avertissement, style orange, visible par l\'utilisateur.' },
          { k: 'is_admin_note', v: 'Note interne modération, invisible pour l\'utilisateur.' },
        ],
      },
      {
        title: "Modération (ConversationControl)",
        body: "Chaque conversation peut être modérée via l'entité ConversationControl : verrouillage, blocage unidirectionnel, notes et raison de modération.",
        bullets: [
          "Verrouillage pour les deux participants (locked_for_all).",
          "Verrouillage unilatéral (locked_for_email).",
          "Blocage unidirectionnel (blocked_a_to_b / blocked_b_to_a).",
          "Notes de modération et raison (persistées).",
        ],
      },
      {
        title: "Raffinement par IA",
        body: "Le composer peut raffiner un message via une fonction backend (refineMessageWithAI) qui appelle un LLM pour reformuler, adoucir ou résumer le texte avant l'envoi.",
        callout: { kind: 'tip', title: 'Restez maître', text: "Le raffinement IA est optionnel : l'utilisateur prévisualise le résultat et décide d'envoyer ou non. L'IA n'envoie jamais à sa place." },
      },
    ],
  },
  {
    slug: 'forum', cat: 'social', icon: 'MessagesSquare',
    title: "Forum & discussions", tagline: "Échanges thématiques communautaires", color: '#f59e0b',
    intro: "Le forum regroupe des discussions classées par catégorie. Les utilisateurs créent des sujets, y répondent, likent les réponses et marquent des solutions. Le rendu Markdown style Discord rend les échanges lisibles et riches.",
    sections: [
      {
        title: "Les discussions",
        body: "Une Discussion a un titre, un contenu, une catégorie et un auteur (snapshot persistant). Elle expose des compteurs (réponses, vues) et la date de dernière réponse.",
        table: [
          { k: 'Catégories', v: 'general, technique, aide, partages, autres.' },
          { k: 'Auteur', v: 'Snapshot : nom, username, avatar, vérifications, badges.' },
          { k: 'Compteurs', v: 'Réponses, vues, dernière réponse.' },
          { k: 'Épinglage', v: 'is_pinned + is_locked (verrouillage).' },
          { k: 'Officiel', v: 'is_official + is_announcement.' },
        ],
      },
      {
        title: "Les réponses",
        body: "Chaque DiscussionReply contient un texte, un auteur (snapshot), un compteur de likes et la liste des likers. Une réponse peut être marquée comme solution.",
        bullets: [
          "Contenu + auteur (snapshot persistant).",
          "Likes (likes_count, liked_by).",
          "Marquage comme solution (is_solution).",
          "Rendu Markdown style Discord (DiscordMarkdown).",
        ],
      },
      {
        title: "Modèle alternatif (ForumTopic / ForumPost)",
        body: "Le forum existe aussi sous forme ForumTopic / ForumPost, un modèle où l'auteur est persistant même après suppression du compte (username et email conservés).",
        callout: { kind: 'note', title: 'Persistance', text: "Avec ForumTopic, le username et l'email de l'auteur sont conservés même si le compte est supprimé — utile pour l'historique et la traçabilité." },
      },
      {
        title: "Liens externes",
        body: "Le forum gère les liens externes via un modal dédié (ExternalLinkModal) qui prévisualise et confirme la sortie vers un domaine tiers, protégeant les utilisateurs du phishing.",
        bullets: [
          "Prévisualisation du lien avant redirection.",
          "Confirmation explicite pour les domaines externes.",
          "Protection anti-phishing intégrée.",
        ],
      },
    ],
  },
  {
    slug: 'communities', cat: 'social', icon: 'Users',
    title: "Communautés", tagline: "Espaces thématiques avec membres", color: '#1dd8b4',
    intro: "Les communautés sont des espaces thématiques où les utilisateurs se rassemblent autour d'un sujet. Ouvertes ou fermées, elles ont des membres, des posts communautaires, des règles et une capacité configurable.",
    sections: [
      {
        title: "Création & types",
        body: "Une communauté appartient à un créateur (owner). Elle peut être ouverte (publique, visible de tous) ou fermée (membres uniquement). Une couverture, une description, des tags et des règles la définissent.",
        table: [
          { k: 'Type ouvert', v: 'Publique, visible et joignable par tous.' },
          { k: 'Type fermé', v: 'Membres uniquement (sur invitation / approbation).' },
          { k: 'Catégorie', v: 'tech, business, art, music, gaming, sport, formation, social, autre.' },
          { k: 'Métadonnées', v: 'Cover, description, tags, règles, catégorie.' },
        ],
      },
      {
        title: "Membres & capacité",
        body: "Les membres sont stockés dans member_ids. La capacité maximale est configurable (défaut 100) et peut être étendue via un token boutique. Le compte de membres et de posts est maintenu à jour.",
        bullets: [
          "member_ids — liste des IDs membres.",
          "members_count, posts_count — compteurs synchronisés.",
          "capacity_limit — capacité maximale (extensible via token).",
          "Adhésion via joinCommunity (fonction backend).",
        ],
        callout: { kind: 'tip', title: 'Premium', text: "Une communauté peut être marquée is_premium (design amélioré) et is_pinned (épinglée en haut de la liste) via des tokens boutique." },
      },
      {
        title: "Posts communautaires",
        body: "Les publications peuvent être rattachées à une communauté (community_id). Elles apparaissent dans le fil de la communauté et respectent ses règles. La création passe par createCommunityPost.",
        bullets: [
          "Post avec community_id rattaché.",
          "Fil dédié à la communauté (getCommunityPosts).",
          "Création via createCommunityPost (vérifie l'adhésion).",
          "Modération par le propriétaire + admins.",
        ],
      },
    ],
  },
  {
    slug: 'stories', cat: 'social', icon: 'Bell',
    title: "Stories", tagline: "Contenus éphémères 24h", color: '#fb7185',
    intro: "Les stories sont des contenus éphémères qui disparaissent après 24h. Elles supportent image, vidéo et texte, avec une caméra intégrée, des filtres, des stickers emoji et des réactions.",
    sections: [
      {
        title: "Types de médias",
        body: "Une story a un media_type (image, video, text) et un media_url. Les stories texte ont une couleur de fond et une police personnalisables.",
        table: [
          { k: 'image', v: 'Photo avec filtre optionnel.' },
          { k: 'video', v: 'Vidéo courte (caméra ou upload).' },
          { k: 'text', v: 'Texte sur fond dégradé, police et couleur custom.' },
        ],
      },
      {
        title: "Création (Story Studio)",
        body: "Le Story Creator intègre une caméra, un picker de GIF, un calque de dessin, des stickers emoji déplaçables, des filtres photo et le choix de la police/couleur pour le texte.",
        bullets: [
          "CameraCapture — capture photo/vidéo in-app.",
          "GifPicker — recherche GIPHY.",
          "DrawingLayer — dessin sur le média.",
          "DraggableLayer — stickers emoji déplaçables (x, y en %).",
          "STORY_FONTS + STORY_FILTERS — personnalisation.",
        ],
        callout: { kind: 'note', title: 'Expiration', text: "expires_at = création + 24h. Les stories expirées ne s'affichent plus dans la barre mais restent en base pour modération." },
      },
      {
        title: "Visionnage & réactions",
        body: "La barre des stories (StoriesBar) affiche les stories actives des abonnés. Chaque story enregistre ses viewers. Les réactions (like / reply emoji) sont stockées dans StoryReaction.",
        bullets: [
          "viewers — liste {id, name, username, avatar}.",
          "StoryReaction — like ou reply (emoji + texte).",
          "StoryViewer — visionnage plein écran avec navigation.",
          "StoryActionBar — like, réponse emoji, partage.",
        ],
      },
    ],
  },
  {
    slug: 'spaces', cat: 'social', icon: 'Radio',
    title: "Spaces audio", tagline: "Salons en direct (LiveKit)", color: '#a78bfa',
    intro: "Les Spaces sont des salons audio en direct, façon X Spaces. Un hôte démarre un direct, des orateurs parlent, des auditeurs écoutent. Gérés via LiveKit, ils peuvent être officiels (badgés EZA).",
    sections: [
      {
        title: "Le modèle Space",
        body: "Un Space a un titre, une description, un hôte (snapshot) et un statut (live, scheduled, ended). Il référence une room LiveKit (livekit_room) et peut être officiel.",
        table: [
          { k: 'Statuts', v: 'live, scheduled, ended.' },
          { k: 'Hôte', v: 'snapshot : nom, username, avatar, vérifications.' },
          { k: 'LiveKit', v: 'livekit_room — nom de la room audio.' },
          { k: 'Officiel', v: 'is_official — badge EZA.' },
          { k: 'Programmation', v: 'scheduled_at pour un direct planifié.' },
        ],
      },
      {
        title: "Cycle de vie",
        body: "Un Space passe par plusieurs états : création (createSpace), démarrage du direct, gestion des participants (updateSpaceParticipant), puis clôture (endSpace) avec notification.",
        steps: [
          "Création : createSpace génère un token LiveKit (generateSpaceToken).",
          "Direct : le hôte rejoint en tant qu'orateur, publie son audio.",
          "Participants : orateurs (publient), auditeurs (écoutent).",
          "Clôture : endSpace + notifySpaceEnd aux participants.",
        ],
        callout: { kind: 'warning', title: 'LiveKit requis', text: "Les Spaces nécessitent des identifiants LiveKit (API key, secret, WS URL) configurés dans les secrets de l'app. Sans ça, la connexion échoue." },
      },
      {
        title: "Interface",
        body: "L'interface Spaces affiche les salons actifs (SpacesPage), une carte par Space (SpaceCard), et la room audio (SpaceRoomPage) avec gestion des orateurs, badges de statut et caméra optionnelle.",
        bullets: [
          "SpacesPage — liste des salons live + programmés.",
          "SpaceCard — carte d'un salon avec hôte et statut.",
          "SpaceRoomPage — room audio temps réel.",
          "CreateSpaceDialog — création d'un salon.",
          "Badges de vérification réduits dans l'interface audio.",
        ],
      },
    ],
  },
  {
    slug: 'events', cat: 'economie', icon: 'Calendar',
    title: "Événements", tagline: "Inscriptions, billetterie, check-in", color: '#ff6d3f',
    intro: "Les événements EZA permettent l'inscription en ligne avec billetterie en crédits Eza. Chaque inscription génère un billet avec code QR, un check-in sur place et un historique pour l'utilisateur.",
    sections: [
      {
        title: "Le modèle Event",
        body: "Un événement a un titre, une catégorie, un format (online, hybrid, physical), des dates, un lieu, une capacité, un prix (euros et/ou crédits) et un statut calculé.",
        table: [
          { k: 'Catégories', v: 'conference, workshop, meetup, concert, hackathon, webinar, expo, sport, party, other.' },
          { k: 'Formats', v: 'online, hybrid, physical.' },
          { k: 'Prix', v: 'Euros (price) et/ou crédits Eza (price_credits), is_free.' },
          { k: 'Capacité', v: 'capacity (0 = illimité), attendees_count.' },
          { k: 'Statuts', v: 'draft, upcoming, live, ended, cancelled.' },
        ],
      },
      {
        title: "Inscription",
        body: "L'inscription se fait via registerForEvent : débit des crédits (si payant), création d'une EventRegistration avec un ticket_code unique, et ajout à registered_ids de l'événement.",
        steps: [
          "Vérification de la capacité et du solde de l'utilisateur.",
          "Débit des crédits Eza (price_credits) le cas échéant.",
          "Création de l'EventRegistration (status: registered).",
          "Génération du ticket_code (format EZA-AB12CD34).",
          "Snapshot : event_title, event_image_url, event_start_date, event_city.",
        ],
        callout: { kind: 'tip', title: 'Billetterie en crédits', text: "Un événement peut être gratuit ou payant en crédits Eza. Nexus peut aussi inscrire un utilisateur directement depuis un ticket de support." },
      },
      {
        title: "Billets & check-in",
        body: "Chaque inscription produit un billet avec un code QR (AdminQrGenerator) scannable sur place (AdminScanTickets) pour marquer le participant comme entré (checked_in).",
        bullets: [
          "ticket_code — code court unique par inscription.",
          "QR code généré (qrcode) pour le check-in.",
          "AdminScanTickets — scan sur place, validation checked_in.",
          "Annulation / remboursement : cancelMyEventRegistration.",
        ],
      },
      {
        title: "Gestion côté organisateur",
        body: "Les organisateurs (admin ou event_manager) gèrent leurs événements via AdminEvents, avec édition, liste des inscrits, check-in manuel et statistiques.",
        bullets: [
          "EventEditDialog — création / édition complète.",
          "AdminRegisterDialog — inscription manuelle d'un utilisateur.",
          "Liste des inscrits avec statut (registered, cancelled, refunded).",
          "Statistiques : inscrits, check-ins, revenus crédits.",
        ],
      },
    ],
  },
  {
    slug: 'portfolio', cat: 'plateforme', icon: 'Map',
    title: "Portfolio", tagline: "Projets, avant/après, avis clients", color: '#a78bfa',
    intro: "Le portfolio présente les projets réalisés, filtrables par catégorie, avec un détail riche (média, description, tags), des comparaisons avant/après interactives, une carte géographique et des avis clients notés en étoiles.",
    sections: [
      {
        title: "Les projets",
        body: "Chaque projet (Project) a un titre, une catégorie, des médias, une description, des tags et un auteur. Ils sont filtrables et triables, et exposent des compteurs de vues.",
        bullets: [
          "Catégories filtrables (tech, business, art…).",
          "Médias : images et vidéos.",
          "Description longue, tags, vues.",
          "Carte interactive (react-leaflet) pour les projets géolocalisés (MapProject).",
        ],
      },
      {
        title: "Avant / après",
        body: "Les comparaisons avant/après (BeforeAfterGallery) utilisent un slider interactif (BeforeAfterSlider) qui révèle la transformation en glissant. Idéal pour montrer un résultat de prestation.",
        callout: { kind: 'tip', title: 'Preuve sociale', text: "Le slider avant/après est l'outil le plus convaincant pour convertir un visiteur en client — montrez le résultat, pas seulement la promesse." },
      },
      {
        title: "Avis clients (Review)",
        body: "Les avis (Review) notent une prestation en étoiles (1-5) avec un commentaire. Ils apparaissent sur le portfolio public et renforcent la crédibilité de l'auteur.",
        table: [
          { k: 'Note', v: '1 à 5 étoiles.' },
          { k: 'Commentaire', v: 'Texte libre, modéré.' },
          { k: 'Auteur', v: 'Snapshot persistant (email).' },
          { k: 'Affichage', v: 'ReviewsSection sur le portfolio public.' },
        ],
      },
    ],
  },
  {
    slug: 'blog', cat: 'plateforme', icon: 'FileText',
    title: "Blog & articles", tagline: "Actualités, conseils, techniques", color: '#38aadc',
    intro: "Le blog publie des articles d'actualité, de conseils, techniques, projets et formation. Chaque article a une couverture, une catégorie, un auteur et un contenu riche (éditeur Quill).",
    sections: [
      {
        title: "Le modèle BlogPost",
        body: "Un article a un titre, un slug, une couverture, une catégorie, un extrait, un contenu long (réact-quill), un auteur (snapshot), des tags et un statut (draft, published).",
        table: [
          { k: 'Slug', v: 'URL propre (/blog/:id).' },
          { k: 'Catégorie', v: 'actualité, conseil, technique, projet, formation.' },
          { k: 'Contenu', v: 'Éditeur riche (react-quill), rendu sécurisé.' },
          { k: 'Couverture', v: 'image_url de l\'article.' },
          { k: 'Auteur', v: 'Snapshot persistant.' },
        ],
      },
      {
        title: "Aperçu & publication",
        body: "Les admins peuvent prévisualiser un article avant publication (blogPreview) et le publier/dépublier. Le rendu public affiche le contenu formaté avec une mise en page lecture.",
        callout: { kind: 'note', title: 'Brouillon', text: "Un article en statut 'draft' n'est pas visible publiquement. Seuls les admins voient les brouillons dans AdminBlog." },
      },
    ],
  },
  {
    slug: 'profile', cat: 'identite', icon: 'User',
    title: "Profil & identité", tagline: "Compte, username, vérifications", color: '#a78bfa',
    intro: "Le profil est l'identité publique d'un utilisateur. Il affiche les publications, le portfolio, les badges, les affiliations, les statistiques et permet la personnalisation (thème, bio, username).",
    sections: [
      {
        title: "Le profil public",
        body: "Accessible via /@username, le profil public montre l'avatar, la couverture, la bio, les vérifications, les affiliations, les statistiques (followers, following, posts) et les publications.",
        table: [
          { k: 'URL', v: '/@username ou /:pathUsername.' },
          { k: 'Vérifications', v: 'verified, pro, certified, official.' },
          { k: 'Badges', v: 'Badges communautaires (badges communautaires).' },
          { k: 'Statistiques', v: 'followers, following, posts counts.' },
          { k: 'Affiliations', v: 'Organisations rattachées (logo sur le profil).' },
        ],
      },
      {
        title: "Username & changement",
        body: "Le username est unique et réservé à vie. Un changement libère l'ancien (stocké dans DeletedUsername pour réutilisation future). La disponibilité est vérifiée via checkUsernameAvailable.",
        callout: { kind: 'warning', title: 'Username unique', text: "Un username pris n'est plus disponible. Après suppression de compte, l'ancien username est gardé en réserve (DeletedUsername) pour éviter l'usurpation." },
      },
      {
        title: "Personnalisation",
        body: "L'utilisateur personnalise son profil : thème (clair/sombre), mode compact, bio, localisation, site web, et les préférences de notification. Les changements sont appliqués globalement (PreferencesApplier).",
        bullets: [
          "ThemeSelector — clair / sombre / système.",
          "Mode compact — densité d'information.",
          "UsernameChanger — changement de username (vérifié).",
          "Préférences — notifications, langue, affichage.",
          "DangerZone — suppression de compte (RGPD).",
        ],
      },
    ],
  },
  {
    slug: 'certifications', cat: 'identite', icon: 'Award',
    title: "Certifications", tagline: "Badges de vérification officiels", color: '#f59e0b',
    intro: "Les certifications permettent d'obtenir un badge de vérification officiel (certified, pro, verified). Le processus combine un questionnaire, un paiement Stripe et une revue administrative.",
    sections: [
      {
        title: "Le processus",
        body: "L'utilisateur soumet une demande de certification (CertificationRequest) avec un questionnaire et des preuves. Après paiement Stripe (createCertificationPayment), un admin révise et approuve ou refuse.",
        steps: [
          "Soumission : CertificationRequest + questionnaire + preuves.",
          "Paiement : createCertificationPayment (Stripe Checkout).",
          "Confirmation : sendCertificationPaymentConfirmation + sendCertificationEmail.",
          "Revue admin : AdminCertifications — approbation ou refus.",
          "Badge attribué : vérification ajoutée au profil de l'utilisateur.",
        ],
        callout: { kind: 'info', title: 'Paiement sécurisé', text: "Le paiement de certification passe par Stripe Checkout. Aucune donnée carte n'est stockée côté EZA — Stripe gère tout." },
      },
      {
        title: "Types de badges",
        body: "Plusieurs types de vérifications existent, affichés comme des badges sur le profil et les publications.",
        table: [
          { k: 'verified', v: 'Identité vérifiée (baseline).' },
          { k: 'pro', v: 'Statut professionnel.' },
          { k: 'certified', v: 'Certifié EZA (questionnaire + paiement).' },
          { k: 'official', v: 'Compte officiel (équipe / organisation).' },
        ],
      },
      {
        title: "Suivi & remboursement",
        body: "L'utilisateur suit l'avancement de sa demande (CertificationTracking). Un remboursement est possible (refundCertification) en cas de refus ou d'annulation, via le portail Stripe.",
        bullets: [
          "CertificationTracking — statut en temps réel.",
          "CertificationSuccessPage — page de réussite.",
          "refundCertification — remboursement via Stripe.",
          "Historique des demandes côté admin (AdminCertifications).",
        ],
      },
    ],
  },
  {
    slug: 'affiliations', cat: 'identite', icon: 'Network',
    title: "Affiliations & écosystème", tagline: "Rattachement d'organisations", color: '#38aadc',
    intro: "Les affiliations relient des utilisateurs à des organisations. Une fois affilié, l'organisation affiche son logo sur le profil de l'utilisateur et peut le représenter publiquement.",
    sections: [
      {
        title: "Le modèle OrganizationAffiliation",
        body: "Une affiliation relie un utilisateur à une organisation avec un statut (pending, approved, rejected) et un rôle. Le logo de l'org apparaît sur le profil affilié (AffiliationBadges).",
        table: [
          { k: 'Statuts', v: 'pending, approved, rejected.' },
          { k: 'Rôle', v: 'Rôle de l\'utilisateur dans l\'organisation.' },
          { k: 'Affichage', v: 'Logo + nom de l\'org sur le profil.' },
          { k: 'Admin', v: 'AdminAffiliations — gestion + retraits.' },
        ],
      },
      {
        title: "Workflow d'affiliation",
        body: "L'affiliation passe par processOrganizationAffiliation : validation, snapshot du profil, et notification. Les admins gèrent les demandes et les retraits (RemovalRequestDialog).",
        callout: { kind: 'note', title: 'Écosystème', text: "L'affiliation crée un écosystème visible : un utilisateur peut représenter plusieurs organisations, et une organisation peut avoir plusieurs affiliés." },
      },
    ],
  },
  {
    slug: 'enor', cat: 'identite', icon: 'Crown',
    title: "Enor & identité fondatrice", tagline: "Le PDG, l'histoire, la vision", color: '#f59e0b',
    intro: "Enor est l'identité fondatrice et le PDG IA d'EZA. Sa biographie, sa vision et l'écosystème EZA Group sont présentés sur des pages dédiées accessibles publiquement.",
    sections: [
      {
        title: "La biographie",
        body: "La page /enor présente la biographie d'Enor, son parcours, sa vision pour EZA et l'écosystème EZA Group. C'est la vitrine narrative de la plateforme.",
        bullets: [
          "Page dédiée : /enor (EnorBiographyPage).",
          "Récit fondateur et vision stratégique.",
          "Liens vers l'écosystème : /ecosysteme.",
        ],
      },
      {
        title: "L'écosystème EZA Group",
        body: "La page /ecosysteme présente les entités et marques du groupe EZA, et la façon dont elles interagissent autour de la plateforme.",
        callout: { kind: 'info', title: 'Une seule marque', text: "EZA Group regroupe toutes les initiatives sous une marque unique, pilotée par Enor et l'agent IA Nexus." },
      },
    ],
  },
  {
    slug: 'notifications', cat: 'tech', icon: 'Bell',
    title: "Notifications", tagline: "In-app, push web, email", color: '#38aadc',
    intro: "EZA notifie les utilisateurs via trois canaux : in-app (NotificationsPage), push web (VAPID + FCM) et email (SendEmail aux utilisateurs enregistrés). Les préférences sont granulaires.",
    sections: [
      {
        title: "Canaux",
        body: "Trois canaux de notification couvrent tous les contextes : in-app pour la navigation, push web pour l'engagement hors app, email pour le récapitulatif.",
        table: [
          { k: 'In-app', v: 'NotificationsPage + panneau déroulant, temps réel.' },
          { k: 'Push web', v: 'VAPID + service worker (push-sw.js), FCM cross-platform.' },
          { k: 'Email', v: 'SendEmail (utilisateurs enregistrés uniquement).' },
        ],
      },
      {
        title: "Types d'événements",
        body: "Les notifications couvrent les likes, réponses, mentions, nouveaux followers, messages, annonces, rapports, badges attribués, et les digests automatiques.",
        bullets: [
          "Social : likes, réponses, mentions, follows.",
          "Messagerie : nouveaux messages, demandes de contact.",
          "Système : annonces, rapports, badges, mises à jour.",
          "Digests : quotidien (nexusDailyDigest), hebdo (sendWeeklyActivityReport).",
        ],
        callout: { kind: 'tip', title: 'Préférences', text: "Chaque type de notification peut être activé/désactivé individuellement dans les paramètres (NotificationSettings)." },
      },
      {
        title: "Push technique",
        body: "L'abonnement push utilise savePushSubscription (PushSubscription entity) avec les clés VAPID. L'envoi passe par sendWebPush / pushNotification / sendBroadcastPush.",
        bullets: [
          "VAPID keys générées (generateVapidKeys).",
          "PushSubscription stockée par utilisateur / device.",
          "sendBroadcastPush — envoi massif.",
          "Service worker : public/push-sw.js + firebase-messaging-sw.js.",
        ],
      },
    ],
  },
  {
    slug: 'pwa', cat: 'tech', icon: 'Smartphone',
    title: "PWA & installation", tagline: "Installable sur iOS et Android", color: '#1dd8b4',
    intro: "EZA est une PWA installable sur l'écran d'accueil d'iOS et Android depuis le même code. Le manifest, le service worker et les push en font une expérience quasi-native.",
    sections: [
      {
        title: "Installation",
        body: "L'utilisateur est invité à installer l'app via PwaInstallPrompt (beforeinstallprompt sur Chrome, instructions manuelles sur iOS). Le manifest.json définit les icônes, le nom, le thème.",
        steps: [
          "Visite de l'app sur un navigateur compatible.",
          "Prompt d'installation (PwaInstallPrompt) ou menu Ajouter à l'écran d'accueil.",
          "Icône ajoutée à l'écran d'accueil, lancement plein écran.",
          "Notifications push activées après autorisation.",
        ],
        callout: { kind: 'note', title: 'Un seul code', text: "iOS et Android partagent exactement le même code React. Pas d'app native séparée — la PWA suffit pour une expérience native." },
      },
      {
        title: "Manifest & service worker",
        body: "Le manifest.json (public/manifest.json) configure l'app installable. Le service worker gère le cache offline shell et les push.",
        table: [
          { k: 'Manifest', v: 'Nom, icônes, thème, display standalone.' },
          { k: 'Service worker', v: 'Cache offline, push, sync.' },
          { k: 'Cache', v: 'Shell HTML/CSS/JS pour démarrage offline.' },
        ],
      },
    ],
  },
  {
    slug: 'auth', cat: 'tech', icon: 'Lock',
    title: "Authentification", tagline: "Email, Google OAuth, OTP, reset", color: '#f59e0b',
    intro: "L'authentification est gérée intégralement par la plateforme Base44 : email/password, Google OAuth (incluant One Tap), OTP par email, et reset de mot de passe par token.",
    sections: [
      {
        title: "Méthodes de connexion",
        body: "Plusieurs méthodes coexistent, toutes gérées par le SDK Base44. Les pages Login/Register/ForgotPassword/ResetPassword sont des templates fonctionnels qu'on personnalise en place.",
        table: [
          { k: 'Email + mot de passe', v: 'loginViaEmailPassword — token + redirection.' },
          { k: 'Google OAuth', v: 'loginWithProvider("google") + One Tap (googleOneTapAuth).' },
          { k: 'Inscription', v: 'register → OTP → verifyOtp → setToken → redirect.' },
          { k: 'Reset', v: 'resetPasswordRequest → email → resetPassword(?token=).' },
          { k: '2FA (TOTP)', v: 'setupTOTP + verifyLoginCode (optionnel).' },
        ],
        callout: { kind: 'warning', title: 'Jamais de logique auth maison', text: "La plateforme gère les tokens, sessions et vérification email. Ne réimplémentez jamais l'auth backend — utilisez le SDK." },
      },
      {
        title: "Flux d'inscription",
        body: "L'inscription ne connecte PAS immédiatement : l'utilisateur est non vérifié. Le flux complet est register → OTP → verifyOtp → setToken → redirection.",
        steps: [
          "register({email, password}) — crée le compte (non vérifié).",
          "OTP envoyé par email (sendVerificationCode).",
          "verifyOtp({email, otpCode}) — retourne un access_token.",
          "setToken(token) — connecte l'utilisateur.",
          "Redirection hard (window.location.href) vers la destination.",
        ],
      },
      {
        title: "Protection des routes",
        body: "Les routes authentifiées sont protégées par ProtectedRoute (layout route). Les routes publiques (profils, blog, documentation) restent accessibles sans connexion.",
        bullets: [
          "ProtectedRoute — layout route avec <Outlet />.",
          "unauthenticatedElement — redirige vers /login.",
          "Routes publiques listées explicitement dans AuthenticatedApp.",
          "logout(redirectUrl?) — déconnexion + redirection.",
        ],
      },
    ],
  },
  {
    slug: 'data', cat: 'tech', icon: 'Database',
    title: "Modèle de données", tagline: "Entités, relations, snapshots", color: '#38aadc',
    intro: "Les données sont des entités JSON stockées dans Base44. Chaque entité a un schéma (base44/entities), des attributs built-in (id, created_date, updated_date, created_by_id) et une sécurité par ligne (RLS).",
    sections: [
      {
        title: "Entités principales",
        body: "L'app compte une trentaine d'entités couvrant social, messagerie, forum, portfolio, économie, événements, certifications, support, etc.",
        table: [
          { k: 'Social', v: 'Post, Follow, Bookmark, UserList, Story, StoryReaction.' },
          { k: 'Communauté', v: 'Community, Discussion, DiscussionReply, ForumTopic, ForumPost.' },
          { k: 'Messagerie', v: 'Message, ConversationControl, ChatMessage.' },
          { k: 'Économie', v: 'Wallet, CreditTransaction, Cart, RewardLog, RewardRedemption, Referral, AdCampaign.' },
          { k: 'Événements', v: 'Event, EventRegistration.' },
          { k: 'Identité', v: 'User, SampleProfile, OrganizationAffiliation, CertificationRequest.' },
          { k: 'Support', v: 'SupportTicket, NexusConversation.' },
          { k: 'Système', v: 'Notification, AutomationLog, AuditLog, AppSettings, AppUpdate, AppModuleStatus.' },
        ],
      },
      {
        title: "Snapshots persistants",
        body: "Pour résister à la suppression de compte et accélérer les lectures, plusieurs entités stockent des snapshots de l'auteur (nom, username, avatar, vérifications) au moment de la création.",
        callout: { kind: 'tip', title: 'Pourquoi des snapshots ?', text: "Un snapshot évite une jointure à chaque affichage et préserve l'affichage même si l'auteur supprime son compte ou change son username." },
      },
      {
        title: "Built-ins",
        body: "Toute entité a automatiquement : id, created_date, updated_date, created_by_id. Ne jamais les redéclarer dans le schéma.",
        bullets: [
          "id — identifiant unique.",
          "created_date — date de création.",
          "updated_date — date de dernière modification.",
          "created_by_id — ID du créateur.",
        ],
      },
    ],
  },
  {
    slug: 'design', cat: 'tech', icon: 'Palette',
    title: "Système de design", tagline: "Tokens, palette Sky, dark/light", color: '#a78bfa',
    intro: "Le système de design EZA est « Sky » : une palette bleu/cyan sombre par défaut, un thème clair optionnel, du glassmorphism, des halos lumineux et un texte en dégradé. Tout est piloté par des tokens CSS.",
    sections: [
      {
        title: "Tokens CSS",
        body: "src/index.css détient les valeurs des tokens (HSL). tailwind.config.js les mappe en classes Tailwind. Changer une couleur = modifier :root et .dark dans index.css.",
        table: [
          { k: 'background', v: 'Couleur de fond (HSL).' },
          { k: 'primary', v: 'Bleu principal (#0ea5e9-ish).' },
          { k: 'accent', v: 'Cyan accent.' },
          { k: 'card', v: 'Fond des cartes.' },
          { k: 'sidebar', v: 'Couleurs de la sidebar.' },
          { k: 'border', v: 'Bordures subtiles.' },
        ],
      },
      {
        title: "Typographie",
        body: "Trois rôles de polices : grotesk (titres), inter (corps), mono (code). Les variables --font-* dans index.css pilotent tout.",
        bullets: [
          "font-grotesk — Space Grotesk (titres, gros textes).",
          "font-inter — Inter (corps de texte, UI).",
          "font-mono — JetBrains Mono (code, labels mono).",
        ],
        callout: { kind: 'note', title: 'Classes littérales', text: "Tailwind purge les classes non trouvées en littéral dans le source. Écrivez toujours les classes en chaînes littérales, jamais en dynamique (bg-${color}-500)." },
      },
      {
        title: "Effets visuels",
        body: "Des classes utilitaires custom (.glass, .glass-card, .sky-glow, .gradient-text, .grid-bg, .scan-line, .hover-lift) enrichissent l'esthétique.",
        bullets: [
          ".glass — glassmorphism avec backdrop-blur.",
          ".sky-glow — halo lumineux bleu.",
          ".gradient-text — texte en dégradé.",
          ".grid-bg — grille technique en fond.",
          ".hover-lift — élévation au survol.",
          ".scan-line — ligne de scan animée.",
        ],
      },
    ],
  },
  {
    slug: 'integrations', cat: 'tech', icon: 'Code2',
    title: "Intégrations & services", tagline: "Core, connecteurs OAuth, secrets", color: '#38aadc',
    intro: "EZA s'intègre à des services externes via les intégrations Core (LLM, upload, image, email…), les connecteurs OAuth (Slack, Google, Outlook…) et les secrets (Stripe, LiveKit, GIPHY…).",
    sections: [
      {
        title: "Intégrations Core",
        body: "Les intégrations Core sont toujours disponibles sur le client pré-initialisé (base44.integrations.Core).",
        table: [
          { k: 'InvokeLLM', v: 'Génération de texte (avec option web search + vision).' },
          { k: 'UploadFile', v: 'Upload de fichier publique (retourne file_url).' },
          { k: 'UploadPrivateFile', v: 'Upload privé + signed URL.' },
          { k: 'GenerateImage', v: 'Génération d\'image IA.' },
          { k: 'GenerateSpeech', v: 'Text-to-speech (MP3).' },
          { k: 'GenerateVideo', v: 'Génération vidéo IA (Veo).' },
          { k: 'TranscribeAudio', v: 'Transcription audio (Whisper).' },
          { k: 'SendEmail', v: 'Email aux utilisateurs enregistrés.' },
          { k: 'ExtractDataFromUploadedFile', v: 'Extraction structurée (CSV, PDF…).' },
        ],
      },
      {
        title: "Connecteurs OAuth",
        body: "Les connecteurs relient l'app à des services tiers via OAuth. Trois modes : partagé (builder connecte son compte), par utilisateur (chaque app user connecte le sien), BYO shared (workspace).",
        bullets: [
          "Google Calendar, Drive, Gmail, Sheets, Docs, Meet…",
          "Slack (User + Bot), Notion, GitHub, GitLab, Linear.",
          "Outlook — synchronisation calendrier (rendez-vous).",
          "Salesforce, HubSpot, LinkedIn, TikTok, Instagram…",
          "Stripe (via backend functions + secrets).",
        ],
        callout: { kind: 'tip', title: 'Webhooks', text: "Les connecteurs supportent les webhooks : une fois autorisés, create_automation route les événements vers une fonction backend." },
      },
      {
        title: "Secrets",
        body: "Les secrets (Stripe, LiveKit, GIPHY, VAPID, FCM, Google OAuth…) sont déclarés via set_secrets et lus dans les fonctions backend. Les valeurs ne transitent jamais par le chat.",
        bullets: [
          "STRIPE_SECRET_KEY — paiements.",
          "LIVEKIT_API_KEY / SECRET / WS_URL — Spaces audio.",
          "GIPHY_API_KEY — recherche de GIFs.",
          "VAPID_PUBLIC_KEY / PRIVATE_KEY — push web.",
          "FCM_SERVER_KEY — push cross-platform.",
          "GOOGLE_CLIENT_ID / google_oauth_client_secret — OAuth.",
        ],
      },
    ],
  },
  {
    slug: 'security', cat: 'tech', icon: 'Shield',
    title: "Sécurité & RGPD", tagline: "Données, suppression, audit", color: '#fb7185',
    intro: "La sécurité des données est centrale : Row-Level Security par entité, audit logs, suppression de compte RGPD, gestion des sessions et devices, et 2FA optionnel.",
    sections: [
      {
        title: "Row-Level Security (RLS)",
        body: "Chaque entité peut restreindre qui crée, lit, modifie et supprime ses enregistrements via des règles RLS dans base44/entities/<Entity>.jsonc. C'est le mécanisme d'isolation des données.",
        callout: { kind: 'warning', title: 'À ne pas négliger', text: "Une RLS trop permissive laisse les enregistrements ouverts à tous les utilisateurs connectés. Une RLS trop stricte verrouille l'utilisateur hors de ses propres données. Voir la doc RLS dédiée." },
      },
      {
        title: "Suppression de compte (RGPD)",
        body: "L'utilisateur peut demander la suppression de son compte (requestAccountDeletion). La demande est traitée par un admin (refuseDeletionRequest ou exécution), avec email de confirmation (sendDeletionEmail).",
        steps: [
          "Demande : requestAccountDeletion (AccountDeletionPage).",
          "Email de confirmation au demandeur.",
          "Traitement admin : approbation ou refus.",
          "Ancien username réservé (DeletedUsername) anti-usurpation.",
        ],
      },
      {
        title: "Sessions & devices",
        body: "Les sessions appareil (DeviceSession) et la 2FA (TOTP) renforcent la sécurité. L'utilisateur voit ses devices actifs et peut les révoquer.",
        bullets: [
          "createDeviceSession — enregistrement d'un appareil.",
          "ActiveDevices — liste + révocation.",
          "adminDeleteAllSessions — révocation massive admin.",
          "2FA : setupTOTP + verifyLoginCode.",
        ],
      },
      {
        title: "Audit logs",
        body: "Les actions sensibles (admin) sont tracées dans AuditLog via logAuditAction. Les logs d'automatisation (AutomationLog) suivent les cron et connecteurs.",
        bullets: [
          "AuditLog — actions administratives (logAuditAction).",
          "AutomationLog — exécutions d'automatisations.",
          "AdminAuditLogs — consultation admin.",
          "MonitoringLog — logs de surveillance système.",
        ],
      },
    ],
  },
  {
    slug: 'economie-credits', cat: 'economie', icon: 'Coins',
    title: "Économie : Crédits Eza", tagline: "Devise interne, gains, dépenses", color: '#ff6d3f',
    intro: "Les crédits Eza sont la devise interne d'EZA. Ils se gagnent en accomplissant des actions (posts, likes, parrainage) et se dépensent en boutique, événements et tokens. Chaque mouvement est tracé.",
    sections: [
      {
        title: "Gains de crédits",
        body: "Les crédits se gagnent via des actions récompensées (awardActionCredits). Chaque action a une valeur en crédits et est tracée dans RewardLog.",
        table: [
          { k: 'create_post', v: 'Création d\'une publication.' },
          { k: 'like_post', v: 'Aimer une publication.' },
          { k: 'daily_login', v: 'Connexion quotidienne.' },
          { k: 'Parrainage', v: 'Inscription + jalons d\'un filleul.' },
          { k: 'Badges', v: 'Attribution de badges (runBadgeAttribution).' },
        ],
        callout: { kind: 'tip', title: 'Anti-abus', text: "Les récompenses sont plafonnées et surveillées (detectReferralFraud) pour éviter la fraude et l'automatisation abusive." },
      },
      {
        title: "Dépenses de crédits",
        body: "Les crédits se dépensent en boutique (packs, abonnements, tokens), en événements (inscriptions) et en publicité (campagnes business).",
        bullets: [
          "Boutique — packs de crédits (achat en euros) et tokens.",
          "Événements — inscription en price_credits.",
          "Publicité — budget_credits pour les campagnes ads.",
          "Remboursements — en crédits Eza (refund_credits).",
        ],
      },
      {
        title: "Transactions (CreditTransaction)",
        body: "Chaque mouvement de crédits est tracé dans CreditTransaction avec un type (transfer_in/out, wallet_move, admin_credit/debit, reward, boutique_spend), un montant et les parties.",
        bullets: [
          "transfer_in / transfer_out — transferts entre utilisateurs.",
          "wallet_move — déplacement entre portefeuilles d'un même utilisateur.",
          "admin_credit / admin_debit — ajustements admin.",
          "reward — récompense d'action.",
          "boutique_spend — dépense boutique.",
        ],
      },
    ],
  },
  {
    slug: 'economie-boutique', cat: 'economie', icon: 'Gift',
    title: "Économie : Boutique", tagline: "Packs, abonnements, tokens", color: '#f59e0b',
    intro: "La boutique EZA vend des packs de crédits (en euros via Stripe), des abonnements (Free, Pro, Business, Enterprise) et des tokens fonctionnels (boost, pin, premium communauté).",
    sections: [
      {
        title: "Packs de crédits",
        body: "Les packs de crédits s'achètent en euros via Stripe (createCreditPurchase). Chaque pack a un prix, un montant de crédits et un éventuel bonus. Le webhook Stripe confirme le paiement.",
        bullets: [
          "BuyCreditsSection + CreditPacksDialog — achat.",
          "createCreditPurchase — session Stripe Checkout.",
          "handleStripeWebhook — confirmation + crédit du compte.",
          "Bonus sur certains packs.",
        ],
      },
      {
        title: "Abonnements",
        body: "Quatre paliers d'abonnement définissent les avantages : Free, Pro, Business, Enterprise. Ils gèrent les perks (avantages) et le gating de fonctionnalités (subscriptionGating).",
        table: [
          { k: 'Free', v: 'Accès de base, communauté, social.' },
          { k: 'Pro', v: 'Plus de crédits, perks créateur, analytics.' },
          { k: 'Business', v: 'Publicité, posts sponsorisés, tokens.' },
          { k: 'Enterprise', v: 'Tout + preuves entreprise, support prioritaire.' },
        ],
        callout: { kind: 'note', title: 'Gating', text: "Certaines fonctionnalités (ads, sponsorisé, communauté premium) ne sont accessibles qu'aux paliers Business/Enterprise (subscriptionGating)." },
      },
      {
        title: "Tokens fonctionnels",
        body: "Les tokens sont des avantages consommables : boost de visibilité, épinglage 24h/7j, communauté premium, capacité étendue. Ils s'achètent ou se gagnent et s'utilisent via UseTokenDialog.",
        bullets: [
          "boost — boost de visibilité d'un post.",
          "pin_24h / pin_7d — épinglage temporaire.",
          "Communauté premium — design amélioré.",
          "Capacité étendue — member cap des communautés.",
        ],
      },
      {
        title: "Remboursements",
        body: "Les abonnements peuvent être annulés (cancelMySubscription / cancelSubscription) et remboursés via le portail Stripe (getStripePortalUrl / createBillingPortal).",
        bullets: [
          "cancelMySubscription — annulation par l'utilisateur.",
          "createBillingPortal — portail de gestion Stripe.",
          "getStripePortalUrl — lien vers le portail client.",
        ],
      },
    ],
  },
  {
    slug: 'banque', cat: 'economie', icon: 'Coins',
    title: "Banque & portefeuilles", tagline: "Wallets, transferts, gel", color: '#38aadc',
    intro: "La banque EZA gère des portefeuilles (Wallet) par utilisateur. Chaque wallet a un type, un solde en crédits, une couleur et un statut de gel. Les transferts entre wallets et entre utilisateurs sont tracés.",
    sections: [
      {
        title: "Les portefeuilles (Wallet)",
        body: "Un utilisateur possède plusieurs wallets (épargne, dépenses, projet, custom). Chacun a un solde en crédits, un type, une couleur et un statut frozen (gel admin).",
        table: [
          { k: 'Types', v: 'epargne, depenses, projet, custom.' },
          { k: 'Solde', v: 'balance en crédits Eza.' },
          { k: 'Couleur', v: 'Couleur d\'affichage (optionnel).' },
          { k: 'Gel', v: 'frozen — bloqué par l\'admin.' },
        ],
      },
      {
        title: "Transferts",
        body: "Les transferts se font entre wallets d'un même utilisateur (moveCredits) ou entre utilisateurs (transferCredits). Chaque transfert crée des CreditTransaction pour les deux parties.",
        steps: [
          "moveCredits — déplacement entre wallets du même utilisateur.",
          "transferCredits — envoi à un autre utilisateur.",
          "Vérification du solde et du gel (frozen bloqué).",
          "CreditTransaction pour l'expéditeur (négatif) et le destinataire (positif).",
        ],
        callout: { kind: 'warning', title: 'Wallet gelé', text: "Un wallet frozen=true ne peut ni envoyer ni recevoir. Nexus peut le dégeler (unfreeze_wallet) si le gel est confirmé et vérifié." },
      },
      {
        title: "Interface utilisateur",
        body: "La page Banque (BanquePage) affiche le récap des wallets, l'historique des transactions et un formulaire de transfert. Un bandeau signale les wallets gelés (BankFreezeBanner).",
        bullets: [
          "WalletSummary — solde total + répartition.",
          "WalletCard — carte par portefeuille.",
          "TransactionHistory — historique des mouvements.",
          "TransferForm + MoveDialog — transferts.",
          "CreateWalletDialog — création d'un wallet.",
        ],
      },
      {
        title: "Administration (AdminBanque)",
        body: "Les admins gèrent l'économie via AdminBanque : soldes, wallets, distribution, transactions, règles, transferts admin et profils. C'est le centre de contrôle financier.",
        bullets: [
          "OverviewTab — vue d'ensemble de l'économie.",
          "WalletsTab — gestion des wallets (gel inclus).",
          "TransactionsTab — audit des mouvements.",
          "DistributionTab — distribution de crédits.",
          "RulesTab — règles économiques.",
          "adminBanque — fonction backend de gestion.",
        ],
      },
    ],
  },
  {
    slug: 'parrainage', cat: 'economie', icon: 'Gift',
    title: "Parrainage & récompenses", tagline: "Code, filleuls, jalons", color: '#fb7185',
    intro: "Le parrainage EZA récompense l'apport de nouveaux membres. Un code de parrainage (username du parrain), des filleuls, des jalons et des récompenses cumulatives composent le système.",
    sections: [
      {
        title: "Le modèle Referral",
        body: "Une entrée Referral relie un parrain (referrer) à un filleul (referred). Le statut passe de pending → validated → rewarded. Les jalons récompensés sont tracés pour éviter le double-crédit.",
        table: [
          { k: 'Code', v: 'referral_code = username du parrain.' },
          { k: 'Statuts', v: 'pending, validated, rewarded.' },
          { k: 'Crédits', v: 'credits_earned (inscription + jalons).' },
          { k: 'Jalons', v: 'milestones_rewarded — jalons déjà récompensés.' },
        ],
      },
      {
        title: "Traitement",
        body: "processReferral valide un parrainage à l'inscription du filleul. evaluateReferralMilestones attribue les récompenses de jalons. redeemReferralReward encaisse une récompense.",
        steps: [
          "processReferral — à l'inscription du filleul (crédit initial au parrain).",
          "evaluateReferralMilestones — jalons (1er, 5e, 10e filleul…).",
          "redeemReferralReward — encaissement de la récompense.",
          "launchReferralActivation — campagne d'activation des parrains inactifs.",
        ],
        callout: { kind: 'tip', title: 'Cumul', text: "Les récompenses se cumulent : inscription + chaque jalon. milestones_rewarded évite le double-crédit d'un même jalon." },
      },
      {
        title: "Anti-fraude",
        body: "detectReferralFraud surveille les parrainages suspects (multi-comptes, robots) et alerte les admins. Les cas flagués sont tracés dans AutomationLog.",
        callout: { kind: 'warning', title: 'Surveillance', text: "La fraude au parrainage est détectée automatiquement et peut entraîner l'annulation des récompenses et un bannissement." },
      },
    ],
  },
  {
    slug: 'ads', cat: 'economie', icon: 'Megaphone',
    title: "Publicité business", tagline: "Campagnes, budgets, analytics", color: '#f59e0b',
    intro: "La publicité EZA permet aux comptes Business/Enterprise de promouvoir leur contenu. Une campagne a un budget en crédits, un placement, un ciblage par hashtags et des analytics d'impressions/clics.",
    sections: [
      {
        title: "Le modèle AdCampaign",
        body: "Une campagne a un titre, un annonceur, une créa (image_url), un CTA (label + URL), un placement, un budget en crédits et un budget journalier qui se déduit chaque jour.",
        table: [
          { k: 'Placements', v: 'feed_banner, between_posts, sidebar.' },
          { k: 'Budget', v: 'budget_credits (total) + daily_budget (par jour).' },
          { k: 'Crédits restants', v: 'credits_remaining — quand à 0, pause auto.' },
          { k: 'Portée', v: 'estimated_reach = budget × 50 vues/crédit.' },
          { k: 'Ciblage', v: 'target_hashtags (optionnel).' },
          { k: 'Statuts', v: 'draft, active, paused, ended.' },
        ],
      },
      {
        title: "Cycle de vie",
        body: "Une campagne part en draft, devient active à validation admin, se met en pause automatiquement quand les crédits s'épuisent, et se termine à la date de fin.",
        steps: [
          "Création : manageBusinessAdCampaign (débit du budget business).",
          "Validation admin : passage draft → active.",
          "Diffusion : processDailyAdBudgets débite le daily_budget.",
          "Pause auto : credits_remaining = 0 → auto_paused_reason.",
          "Fin : ends_at → statut ended.",
          "Alerte : alertLowAdBudgets notifie quand le budget est bas.",
        ],
        callout: { kind: 'info', title: 'Gating Business', text: "La publicité n'est accessible qu'aux abonnements Business et Enterprise (subscriptionGating). Les autres paliers ne voient pas l'option." },
      },
      {
        title: "Analytics",
        body: "Chaque campagne suit ses impressions et ses clics. L'admin visualise les performances dans AdminAds et alerte les annonceurs quand le budget est bas.",
        bullets: [
          "impressions — nombre d'affichages.",
          "clicks — nombre de clics sur le CTA.",
          "AdminAds — tableau de bord admin.",
          "BusinessAdsPage — gestion côté annonceur.",
          "AdSlot — emplacement publicitaire dans le feed.",
        ],
      },
    ],
  },
  {
    slug: 'support', cat: 'identite', icon: 'LifeBuoy',
    title: "Support & Nexus IA", tagline: "Tickets contextuels, actions autonomes", color: '#38aadc',
    intro: "Le support EZA est piloté par Nexus, l'IA PDG. Les tickets sont contextuels (Nexus lit le compte de l'utilisateur), les réponses sont professionnelles et structurées, et Nexus peut exécuter des actions concrètes (inscriptions, crédits, remboursements) avec confirmation.",
    sections: [
      {
        title: "Création d'un ticket",
        body: "L'utilisateur décrit son problème (NewTicketDialog). L'IA analyse (analyzeSupportCategory) et propose 3 catégories + l'élément concerné détecté automatiquement. Le ticket est créé avec le contexte.",
        steps: [
          "Description du problème + pièces jointes optionnelles.",
          "Analyse IA : catégorie + élément concerné suggérés.",
          "Sélection de l'élément concerné (post, wallet, event…).",
          "Création du SupportTicket avec contexte complet.",
          "autoHandleSupportTicket répond instantanément.",
        ],
        callout: { kind: 'tip', title: 'Détection auto', text: "Nexus détecte l'élément concerné (événement, post, inscription…) depuis votre description et pré-remplit la sélection — pas de recherche manuelle." },
      },
      {
        title: "Réponse de Nexus",
        body: "Nexus fait d'abord sa recherche (documentation, élément concerné, solde, inscriptions) affichée en étapes en temps réel, PUIS répond avec un markdown professionnel structuré.",
        bullets: [
          "Recherche contextuelle : doc, post, wallet, événements, inscriptions.",
          "Étapes affichées en direct (AiSteps + Recherche Nexus).",
          "Réponse en markdown Discord (titres, gras, listes, citations).",
          "Ton professionnel, vouvoiement, jamais familier.",
        ],
      },
      {
        title: "Actions autonomes",
        body: "Nexus peut exécuter des actions concrètes sur le compte de l'utilisateur, avec confirmation pour les actions sensibles (carte Oui/Non).",
        table: [
          { k: 'register_event', v: 'Inscription à un événement (débit crédits).' },
          { k: 'cancel_event_registration', v: 'Annulation + remboursement crédits.' },
          { k: 'grant_credits', v: 'Crédit de courtoisie (max 100).' },
          { k: 'refund_credits', v: 'Remboursement en crédits Eza.' },
          { k: 'move_credits', v: 'Transfert entre wallets du même user.' },
          { k: 'unfreeze_wallet', v: 'Dégel d\'un wallet vérifié gelé.' },
          { k: 'recalc_post', v: 'Recalcul des compteurs d\'un post.' },
          { k: 'close_ticket / reopen_ticket', v: 'Fermeture / réouverture du ticket.' },
        ],
        callout: { kind: 'warning', title: 'Anti-danger', text: "Les actions sensibles ne sont JAMAIS proposées spontanément. Nexus ne dégel un wallet que si le gel est vérifié, et ne rembourse qu'à demande explicite avec un montant justifié." },
      },
      {
        title: "Escalade humaine",
        body: "Nexus escalade à un humain UNIQUEMENT pour : sécurité, remboursement bancaire Stripe (carte), bug bloquant, suppression de compte, litige/fraude, ou après 3+ insistances sans solution.",
        bullets: [
          "awaiting_human — statut d'escalade.",
          "Notification des admins (Notification entity).",
          "Email au demandeur (sendEzaEmail).",
          "Logs d'automatisation (logAutomation).",
        ],
      },
    ],
  },
  {
    slug: 'automations', cat: 'tech', icon: 'Zap',
    title: "Automatisations", tagline: "Cron, entités, connecteurs, agents", color: '#1dd8b4',
    intro: "Les automatisations exécutent des fonctions backend automatiquement : sur un schedule (cron), sur des changements d'entité, sur des webhooks de connecteurs, ou au démarrage d'une conversation d'agent IA.",
    sections: [
      {
        title: "Types d'automatisations",
        body: "Quatre types couvrent tous les besoins : planifié (cron/interval), entité (create/update/delete), connecteur (webhooks OAuth), et agent in-app (conversation démarrée).",
        table: [
          { k: 'Scheduled', v: 'Cron ou interval (min 5 min), hebdo, mensuel, one-time.' },
          { k: 'Entity', v: 'Déclenchée par create/update/delete d\'une entité.' },
          { k: 'Connector', v: 'Webhook d\'un connecteur OAuth (Slack, Google…).' },
          { k: 'In-app agent', v: 'Conversation d\'agent IA démarrée.' },
        ],
      },
      {
        title: "Automatisations actives",
        body: "EZA exécute de nombreuses automatisations : digests, modération, fraude, badges, paniers abandonnés, onboarding, économie, ads, rétention.",
        bullets: [
          "nexusDailyDigest / nexusWeeklyDigest — résumés auto.",
          "moderateNewPost — modération des nouveaux posts.",
          "detectReferralFraud — détection de fraude parrainage.",
          "runBadgeAttribution — attribution automatique de badges.",
          "recoverAbandonedCarts — récupération des paniers abandonnés.",
          "sendOnboardingSequence — séquence d'onboarding.",
          "processDailyAdBudgets / alertLowAdBudgets — gestion des pubs.",
          "sweepInactiveUsers — rétention des utilisateurs inactifs.",
        ],
        callout: { kind: 'tip', title: 'Logs', text: "Chaque exécution est tracée dans AutomationLog (status, summary, count) — visible dans AdminAutomations." },
      },
      {
        title: "Gestion",
        body: "Les automatisations se créent et gèrent via les outils plateforme. AdminAutomations affiche l'état, les logs, et permet d'activer/désactiver.",
        bullets: [
          "create_automation — création (type, schedule, fonction).",
          "manage_automation — update / toggle / archive.",
          "AdminAutomations — vue admin + logs.",
          "trigger_conditions — filtres optionnels par champ.",
        ],
      },
    ],
  },
  {
    slug: 'rls', cat: 'tech', icon: 'Lock',
    title: "Row-Level Security", tagline: "Isolation des données par entité", color: '#fb7185',
    intro: "La Row-Level Security (RLS) restreint quels utilisateurs peuvent créer, lire, modifier et supprimer les enregistrements de chaque entité. C'est le mécanisme qui empêche un utilisateur de voir ou modifier les données d'un autre.",
    sections: [
      {
        title: "Les quatre opérations",
        body: "Chaque entité peut définir une règle RLS pour create, read, update et delete. Sans règle, l'accès dépend du défaut (read true, write restreint).",
        table: [
          { k: 'create', v: 'Qui peut créer un enregistrement.' },
          { k: 'read', v: 'Qui peut lire les enregistrements.' },
          { k: 'update', v: 'Qui peut modifier un enregistrement.' },
          { k: 'delete', v: 'Qui peut supprimer un enregistrement.' },
        ],
      },
      {
        title: "Variables & opérateurs",
        body: "Les règles utilisent des template variables ({{user.id}}, {{user.email}}, {{user.role}}) et des user_condition (role). Les opérateurs standards ($or, $and, égalité, etc.) s'appliquent.",
        bullets: [
          "{{user.id}} — ID de l'utilisateur courant.",
          "{{user.email}} — email de l'utilisateur courant.",
          "{{user.role}} — rôle (admin, owner, user…).",
          "user_condition: { role: 'admin' } — condition de rôle.",
          "$or / $and — combinaisons de règles.",
        ],
      },
      {
        title: "Patterns courants",
        body: "Trois patterns couvrent la plupart des cas : ownership (l'utilisateur ne voit que ses enregistrements), role-based (seuls les admins), et tenant isolation.",
        callout: { kind: 'warning', title: 'Lock-out', text: "Une règle trop stricte verrouille l'utilisateur hors de ses propres données. Toujours tester qu'un utilisateur peut accéder à SES enregistrements après avoir écrit la RLS." },
      },
      {
        title: "Exemples EZA",
        body: "Plusieurs entités EZA illustrent les patterns : Wallet (ownership), AutomationLog (admin only), Post (ownership create + public read), SupportTicket (ownership + admin).",
        bullets: [
          "Wallet — data.owner_id = {{user.id}} sur les 4 opérations.",
          "AutomationLog — user_condition role admin partout.",
          "Post — create par l'auteur, read public, update/delete auteur+admin.",
          "SupportTicket — create/read/update par email ou admin, delete admin.",
        ],
      },
    ],
  },
  {
    slug: 'conventions', cat: 'tech', icon: 'Code2',
    title: "Conventions de code", tagline: "ESM, imports, composants, entités", color: '#38aadc',
    intro: "Des conventions strictes garantissent la fiabilité du build et la cohérence du code : ESM uniquement, alias @/, composants focalisés, entités en JSON complet.",
    sections: [
      {
        title: "Imports & ESM",
        body: "Le projet est Vite ESM : jamais de require() ni module.exports. Les imports utilisent l'alias @/ (pas de chemins relatifs src/).",
        table: [
          { k: 'ESM', v: 'Import/export uniquement, pas de require().' },
          { k: 'Alias', v: '@/components, @/lib, @/api — jamais ../src.' },
          { k: 'JSX', v: 'Uniquement dans .jsx/.tsx, jamais .js.' },
          { k: 'cn', v: 'import { cn } from "@/lib/utils".' },
          { k: 'createPageUrl', v: 'import depuis "@/utils".' },
        ],
        callout: { kind: 'warning', title: 'Build breakers', text: "Un require() ou un import manquant casse tout le build. Vérifiez chaque import — un icône lucide inexistant ou un ui réexporté inexistant plante l'app." },
      },
      {
        title: "Composants & pages",
        body: "Chaque page/composant est export default nommé comme son fichier. Les composants font <50 lignes ; un nouveau composant = un nouveau fichier.",
        bullets: [
          "export default function MyPage() — nommé comme le fichier.",
          "Composants < 50 lignes, sinon découper.",
          "Primitives shadcn : un import par fichier (Label depuis @/components/ui/label).",
          "Icônes lucide : uniquement celles qui existent réellement.",
          "Hooks au top level, jamais conditionnels ni en boucle.",
        ],
      },
      {
        title: "Entités & RLS",
        body: "Les entités sont le schéma JSON complet (base44/entities/<Name>.jsonc) — pas de placeholders ni de commentaires. La RLS se déclare sous une clé rls.",
        bullets: [
          "Schéma JSON complet, remplace le stocké.",
          "Built-ins (id, created_date…) jamais redéclarés.",
          "rls: { create, read, update, delete } avec règles.",
          "Champs volumineux (base64, blobs) interdits — utiliser file_url.",
        ],
      },
      {
        title: "Styling Tailwind",
        body: "Les classes Tailwind s'écrivent en littérales (le purge supprime le non-littéral). Les tokens CSS pilotent les couleurs via index.css + tailwind.config.js.",
        callout: { kind: 'tip', title: 'Safelist', text: "Le safelist de tailwind.config.js est uniquement pour les valeurs runtime (entity records, API). Jamais pour des classes présentes dans le source." },
      },
    ],
  },
];

// Helpers exportés pour les pages.
export const DOC_TOPIC_COUNT = DOC_TOPICS.length;
export const DOC_SECTION_COUNT = DOC_TOPICS.reduce((s, t) => s + (t.sections?.length || 0), 0);