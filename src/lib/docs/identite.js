// Documentation EZA — catégorie Identité & confiance (profile, certifications, affiliations, enor, support).

export const identiteTopics = [
  {
    slug: 'profile', cat: 'identite', icon: 'User',
    title: "Profil & identité", tagline: "Compte, username, vérifications", color: '#a78bfa',
    intro: "Le profil est l'identité publique d'un utilisateur. Il affiche les publications, le portfolio, les badges, les affiliations, les statistiques et permet la personnalisation (thème, bio, username). Accessible via /@username, c'est la vitrine de chaque membre de la communauté EZA.",
    sections: [
      {
        title: "Le profil public",
        body: "Accessible via /@username (ou /:pathUsername), le profil public montre l'avatar, la couverture, la bio, les vérifications, les affiliations (logo des organisations), les statistiques (followers, following, posts) et les publications de l'utilisateur. Le profil est public : n'importe qui, connecté ou non, peut le consulter (comme TikTok/Instagram).",
        table: [
          { k: 'URL', v: '/@username ou /:pathUsername.' },
          { k: 'Vérifications', v: 'verified, pro, certified, official.' },
          { k: 'Badges', v: 'Badges communautaires (badges communautaires).' },
          { k: 'Statistiques', v: 'followers, following, posts counts.' },
          { k: 'Affiliations', v: 'Organisations rattachées (logo sur le profil).' },
          { k: 'Publications', v: 'Fil des posts de l’utilisateur (épinglés en premier).' },
          { k: 'Portfolio', v: 'Lien vers les projets (si présents).' },
        ],
      },
      {
        title: "Username & changement",
        body: "Le username est unique et réservé à vie. Un changement libère l'ancien, qui est stocké dans DeletedUsername pour réserve anti-usurpation (personne ne peut reprendre un username récemment libéré). La disponibilité est vérifiée via checkUsernameAvailable avant tout changement. Le UsernameChanger gère l'interface de changement.",
        callout: { kind: 'warning', title: "Username unique et réservé", text: "Un username pris n'est plus disponible. Après suppression de compte, l'ancien username est gardé en réserve (DeletedUsername) pour empêcher l'usurpation d'identité par un nouveau compte qui prendrait le même nom." },
      },
      {
        title: "Personnalisation",
        body: "L'utilisateur personnalise son profil via les paramètres : thème (clair/sombre/système), mode compact (densité d'information), bio, localisation, site web, et les préférences de notification. Les changements sont appliqués globalement via PreferencesApplier qui les persiste sur l'entité User (updateMe).",
        bullets: [
          "ThemeSelector — clair / sombre / système (persisté).",
          "Mode compact — densité d'information (padding réduit).",
          "UsernameChanger — changement de username (vérifié).",
          "Préférences — notifications, langue, affichage.",
          "DangerZone — suppression de compte (RGPD, requestAccountDeletion).",
          "SecurityAndPrivacy — sécurité, 2FA, devices actifs.",
        ],
        callout: { kind: 'tip', title: "Préférences globales", text: "Vos préférences (thème, compact, notifications) sont stockées sur votre compte et appliquées sur tous vos appareils. Connectez-vous ailleurs — vos réglages vous suivent." },
      },
      {
        title: "Vérifications & badges",
        body: "Plusieurs types de vérifications existent, affichées comme des badges sur le profil et les publications. Elles renforcent la crédibilité et la confiance. Les vérifications sont gérées via le système de certifications (voir la doc dédiée).",
        table: [
          { k: 'verified', v: 'Identité vérifiée (baseline).' },
          { k: 'pro', v: 'Statut professionnel.' },
          { k: 'certified', v: 'Certifié EZA (questionnaire + paiement).' },
          { k: 'official', v: 'Compte officiel (équipe / organisation).' },
        ],
      },
    ],
  },
  {
    slug: 'certifications', cat: 'identite', icon: 'Award',
    title: "Certifications", tagline: "Badges de vérification officiels", color: '#f59e0b',
    intro: "Les certifications permettent d'obtenir un badge de vérification officiel (certified, pro, verified). Le processus combine un questionnaire, un paiement Stripe sécurisé et une revue administrative. Une fois approuvé, le badge apparaît sur le profil et toutes les publications de l'utilisateur.",
    sections: [
      {
        title: "Le processus de certification",
        body: "L'utilisateur soumet une demande de certification (CertificationRequest) avec un questionnaire et des preuves. Après paiement Stripe (createCertificationPayment — Stripe Checkout), un admin révise la demande et approuve ou refuse. En cas d'approbation, la vérification est ajoutée au profil de l'utilisateur (persistée). Le suivi se fait via CertificationTracking et la page CertificationSuccessPage confirme le succès.",
        steps: [
          "Soumission : CertificationRequest + questionnaire + preuves.",
          "Paiement : createCertificationPayment (Stripe Checkout sécurisé).",
          "Confirmation : sendCertificationPaymentConfirmation + sendCertificationEmail.",
          "Revue admin : AdminCertifications — approbation ou refus motivé.",
          "Badge attribué : vérification ajoutée au profil de l’utilisateur (persistée).",
        ],
        callout: { kind: 'info', title: "Paiement sécurisé Stripe", text: "Le paiement de certification passe par Stripe Checkout. Aucune donnée de carte n'est stockée côté EZA — Stripe gère toute la chaîne de paiement sécurisée." },
      },
      {
        title: "Types de badges",
        body: "Plusieurs types de vérifications existent, chacun avec un sens distinct. Ils sont affichés comme des badges sur le profil, les publications, les stories et les Spaces (réduits).",
        table: [
          { k: 'verified', v: "Identité vérifiée (baseline — preuve d'identité)." },
          { k: 'pro', v: "Statut professionnel (activité professionnelle confirmée)." },
          { k: 'certified', v: 'Certifié EZA (questionnaire + paiement + revue).' },
          { k: 'official', v: "Compte officiel (équipe EZA / organisation vérifiée)." },
        ],
        callout: { kind: 'tip', title: "Crédibilité vérifiable", text: "Un badge de certification n'est pas cosmétique : il signale que l'identité ou le statut professionnel a été vérifié par EZA. C'est un signal de confiance fort pour les clients et la communauté." },
      },
      {
        title: "Suivi & remboursement",
        body: "L'utilisateur suit l'avancement de sa demande (CertificationTracking). Un remboursement est possible (refundCertification) en cas de refus ou d'annulation, via le portail Stripe. L'historique des demandes est visible côté admin (AdminCertifications).",
        bullets: [
          "CertificationTracking — statut en temps réel de la demande.",
          "CertificationSuccessPage — page de réussite après approbation.",
          "refundCertification — remboursement via Stripe (refus / annulation).",
          "AdminCertifications — historique et gestion admin des demandes.",
          "sendCertificationConfirmation — email de confirmation.",
        ],
      },
    ],
  },
  {
    slug: 'affiliations', cat: 'identite', icon: 'Network',
    title: "Affiliations & écosystème", tagline: "Rattachement d'organisations", color: '#38aadc',
    intro: "Les affiliations relient des utilisateurs à des organisations. Une fois affilié, l'organisation affiche son logo sur le profil de l'utilisateur et peut le représenter publiquement. C'est l'équivalent d'un badge d'emploi vérifié, nativement intégré.",
    sections: [
      {
        title: "Le modèle OrganizationAffiliation",
        body: "Une affiliation relie un utilisateur à une organisation avec un statut (pending, approved, rejected) et un rôle dans l'organisation. Le logo et le nom de l'org apparaissent sur le profil affilié (AffiliationBadges). Une affiliation approuvée est un signal de confiance : l'utilisateur représente officiellement une organisation.",
        table: [
          { k: 'Statuts', v: 'pending, approved, rejected.' },
          { k: 'Rôle', v: "Rôle de l'utilisateur dans l'organisation." },
          { k: 'Affichage', v: "Logo + nom de l'org sur le profil (AffiliationBadges)." },
          { k: 'Admin', v: 'AdminAffiliations — gestion + retraits.' },
          { k: 'Snapshot', v: "Profil de l'org au moment de l'affiliation." },
        ],
      },
      {
        title: "Workflow d'affiliation",
        body: "L'affiliation passe par processOrganizationAffiliation : validation, snapshot du profil de l'organisation, et notification des deux parties. Les admins gèrent les demandes et les retraits via AdminAffiliations avec RemovalRequestDialog et DirectRemovalDialog pour les cas litigieux.",
        steps: [
          "processOrganizationAffiliation — validation + snapshot + notification.",
          "AdminAffiliations — gestion des demandes (approbation / refus).",
          "AffiliationDialog — création d'une affiliation.",
          "RemovalRequestDialog — demande de retrait d'affiliation.",
          "DirectRemovalDialog — retrait direct admin (cas litigieux).",
        ],
        callout: { kind: 'note', title: "Écosystème visible", text: "L'affiliation crée un écosystème visible : un utilisateur peut représenter plusieurs organisations, et une organisation peut avoir plusieurs affiliés. Le logo sur le profil est un signal de confiance vérifiable." },
      },
      {
        title: "AffiliationStats & UserPicker",
        body: "Les admins disposent de statistiques d'affiliation (AffiliationStats) et d'un sélecteur d'utilisateur (UserPicker) pour créer des affiliations ciblées. Les profils d'exemple (SampleProfile) peuvent être pré-affiliés pour démontrer le mécanisme.",
        bullets: [
          "AffiliationStats — statistiques d'affiliation (par org, par statut).",
          "UserPicker — sélecteur d'utilisateur pour affiliation ciblée.",
          "AffiliationRow — ligne d'affiliation dans l'admin.",
          "RemovalRequestsPanel — panneau des demandes de retrait.",
        ],
      },
    ],
  },
  {
    slug: 'enor', cat: 'identite', icon: 'Crown',
    title: "Enor & identité fondatrice", tagline: "Le PDG, l'histoire, la vision", color: '#f59e0b',
    intro: "Enor est l'identité fondatrice et le PDG d'EZA. Sa biographie, sa vision pour EZA et l'écosystème EZA Group sont présentés sur des pages dédiées accessibles publiquement. C'est la vitrine narrative de la plateforme.",
    sections: [
      {
        title: "La biographie d'Enor",
        body: "La page /enor (EnorBiographyPage) présente la biographie d'Enor, son parcours, sa vision pour EZA et l'écosystème EZA Group. C'est la vitrine narrative de la plateforme — qui est le PDG, quelle est l'histoire, où va EZA.",
        bullets: [
          "Page dédiée : /enor (EnorBiographyPage).",
          "Récit fondateur et vision stratégique.",
          "Liens vers l'écosystème : /ecosysteme.",
          "Identité de marque unique EZA Group.",
        ],
      },
      {
        title: "L'écosystème EZA Group",
        body: "La page /ecosysteme (EcosystemePage) présente les entités et marques du groupe EZA, et la façon dont elles interagissent autour de la plateforme. EZA Group regroupe toutes les initiatives sous une marque unique, pilotée par Enor et l'agent IA Nexus.",
        callout: { kind: 'info', title: "Une seule marque", text: "EZA Group regroupe toutes les initiatives sous une marque unique, pilotée par Enor (PDG humain) et Nexus (PDG IA). Toutes les initiatives convergent vers la plateforme EZA." },
      },
    ],
  },
  {
    slug: 'support', cat: 'identite', icon: 'LifeBuoy',
    title: "Support & Nexus IA", tagline: "Tickets contextuels, actions autonomes", color: '#38aadc',
    intro: "Le support EZA est piloté par Nexus, l'IA PDG. Les tickets sont contextuels (Nexus lit le compte de l'utilisateur avant de répondre), les réponses sont professionnelles et structurées en markdown Discord, et Nexus peut exécuter des actions concrètes (inscriptions, crédits, remboursements) avec confirmation. L'escalade humaine est réservée aux cas critiques.",
    sections: [
      {
        title: "Création d'un ticket (NewTicketDialog)",
        body: "L'utilisateur décrit son problème (NewTicketDialog) avec pièces jointes optionnelles. L'IA analyse (analyzeSupportCategory) et propose 3 catégories + l'élément concerné détecté automatiquement depuis la description. Le ticket est créé avec le contexte complet (related_item_type, related_item_id, category) et Nexus répond instantanément (autoHandleSupportTicket).",
        steps: [
          "Description du problème + pièces jointes optionnelles (max 5).",
          "Analyse IA : catégorie + élément concerné suggérés (analyzeSupportCategory).",
          "Sélection de l'élément concerné (post, wallet, event, community…).",
          "Création du SupportTicket avec contexte complet.",
          "autoHandleSupportTicket répond instantanément avec recherche contextuelle.",
        ],
        callout: { kind: 'tip', title: "Détection automatique", text: "Nexus détecte l'élément concerné (événement, post, inscription, wallet…) depuis votre description et pré-remplit la sélection. Pas de recherche manuelle dans une grille — l'IA fait le lien pour vous." },
      },
      {
        title: "Réponse de Nexus (replySupportTicket)",
        body: "Nexus fait d'abord sa recherche (documentation, élément concerné, solde, inscriptions, posts) affichée en étapes en temps réel (AiSteps + en-tête « Recherche Nexus »), PUIS répond avec un markdown professionnel structuré. Le ton est institutionnel : vouvoiement, jamais familier, jamais d'emojis décontractés.",
        bullets: [
          "Recherche contextuelle : doc, post concerné, wallet, événements, inscriptions.",
          "Étapes affichées en direct (AiSteps + Recherche Nexus).",
          "Réponse en markdown Discord (titres, gras, listes, citations, tables).",
          "Ton professionnel, vouvoiement, jamais familier, jamais d'emojis décontractés.",
          "replySupportTicket — fonction backend de réponse.",
        ],
        callout: { kind: 'note', title: "Agent, pas chatbot", text: "Nexus n'est pas un chatbot générique. Il lit votre compte, vérifie votre solde, vos inscriptions, vos posts et votre documentation avant de répondre. C'est un agent autonome qui peut exécuter des actions concrètes." },
      },
      {
        title: "Actions autonomes",
        body: "Nexus peut exécuter des actions concrètes sur le compte de l'utilisateur. Les actions automatiques (sans confirmation) s'exécutent immédiatement ; les actions sensibles (avec confirmation) affichent une carte Oui/Non et ne s'exécutent qu'au clic. Tout est tracé dans le ticket (pending_action) et dans last_action_log.",
        table: [
          { k: 'register_event', v: "Inscription à un événement (débit crédits)." },
          { k: 'cancel_event_registration', v: 'Annulation + remboursement crédits.' },
          { k: 'grant_credits', v: 'Crédit de courtoisie (max 100).' },
          { k: 'refund_credits', v: 'Remboursement en crédits Eza.' },
          { k: 'move_credits', v: 'Transfert entre wallets du même user.' },
          { k: 'unfreeze_wallet', v: "Dégel d'un wallet vérifié gelé." },
          { k: 'recalc_post', v: "Recalcul des compteurs d'un post." },
          { k: 'close_ticket', v: 'Fermeture du ticket.' },
          { k: 'reopen_ticket', v: 'Réouverture du ticket.' },
          { k: 'create_default_wallet', v: 'Création du portefeuille par défaut.' },
        ],
        callout: { kind: 'warning', title: "Anti-danger", text: "Les actions sensibles ne sont JAMAIS proposées spontanément. Nexus ne dégel un wallet que si le gel est vérifié dans la recherche, et ne rembourse qu'à demande explicite avec un montant justifié par des données réelles. L'anti-hallucination est stricte." },
      },
      {
        title: "Escalade humaine",
        body: "Nexus escalade à un humain UNIQUEMENT pour : sécurité (compte piraté, harcèlement), remboursement bancaire Stripe (carte — pas les crédits Eza), bug bloquant confirmé, suppression de compte (RGPD), litige/fraude, ou après 3+ insistances sans solution dans l'historique. L'escalade notifie les admins (Notification) et envoie un email au demandeur.",
        bullets: [
          "awaiting_human — statut d'escalade.",
          "Notification des admins (Notification entity, type system).",
          "Email au demandeur (sendEzaEmail).",
          "Logs d'automatisation (logAutomation).",
          "Nexus ne transmet JAMAIS s'il peut répondre lui-même.",
        ],
        callout: { kind: 'info', title: "Pas d'escalade par précaution", text: "Nexus n'escalade pas « au cas où ». Un simple « ça ne marche pas » vague reste en troubleshooting. L'escalade est réservée aux cas critiques réels — sécurité, argent bancaire, suppression, litige." },
      },
      {
        title: "Interface & administration",
        body: "Côté utilisateur, SupportPage propose un dashboard (Documentation, Communauté, Nouveau ticket) et la liste des tickets existants. SupportTicketPage affiche la conversation avec Nexus, les étapes de recherche, la carte d'action en attente et le picker d'événements. Côté admin, AdminSupport centralise la gestion avec PendingActionsPanel, ActiveTicketsTable, SupportKpis, NexusActionLog et CreditsRecap.",
        bullets: [
          "SupportPage — dashboard utilisateur (3 cartes + liste des tickets).",
          "SupportTicketPage — conversation avec Nexus + étapes + actions.",
          "PendingActionCard — carte Oui/Non pour les actions sensibles.",
          "EventPickerCard — picker d'événements dans un ticket.",
          "AdminSupport — gestion admin complète.",
          "PendingActionsPanel — actions en attente (admin).",
          "ActiveTicketsTable — table des tickets actifs.",
          "SupportKpis — KPI du support.",
          "NexusActionLog — journal des actions Nexus.",
          "CreditsRecap — récap des mouvements de crédits.",
        ],
      },
    ],
  },
];