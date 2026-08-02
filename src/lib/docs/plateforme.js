// Documentation EZA — catégorie Plateforme (vue d'ensemble, portfolio, blog).
// Contenu 100% utilisateur : aucun jargon technique, pas de nom d'entité ni de fonction.

export const plateauTopics = [
  {
    slug: 'overview', cat: 'plateforme', icon: 'Book',
    title: "Découvrir eza", tagline: "La plateforme en un coup d'œil", color: '#38aadc',
    intro: "eza est une application tout-en-un qui réunit un réseau social, une messagerie, un forum, des communautés, des salons audio en direct, des stories, un portfolio, un blog, des événements, des certifications et un système de crédits — le tout dans une seule app installable sur votre téléphone.",
    sections: [
      {
        title: "Une seule application, un seul compte",
        body: "Là où la plupart des communautés s'éparpillent entre cinq ou six sites différents, eza réunit tout au même endroit. Vous créez un compte une fois et accédez à tout de suite. Votre profil, vos badges, votre solde de crédits et vos affiliations vous suivent partout, sans jamais rien re-configurer.",
        bullets: [
          "Un seul compte pour tous les espaces de la plateforme.",
          "Une seule identité : votre profil et vos badges sont partagés partout.",
          "Un seul solde de crédits, utilisable dans toute eza.",
          "Une app installable sur iPhone et Android depuis le même code.",
        ],
        callout: { kind: 'tip', title: "Tout est connecté", text: "Un créateur qui publie un post est aussi un membre de communauté, un certifié, un parrain et un acheteur de billets — sans jamais changer d'application. Votre réputation se construit une fois et se déploie partout." },
      },
      {
        title: "Les grands espaces",
        body: "eza s'organise autour d'une quinzaine d'espaces qui partagent la même identité et les mêmes utilisateurs. Chacun a sa page et ses propres interactions, mais tout est interconnecté.",
        table: [
          { k: 'Réseau social', v: 'Publier, aimer, répondre, mentionner, partager.' },
          { k: 'Messagerie', v: 'Conversations privées en temps réel.' },
          { k: 'Forum', v: 'Discussions thématiques, questions et réponses.' },
          { k: 'Communautés', v: 'Groupes thématiques avec leurs propres règles.' },
          { k: 'Spaces', v: 'Salons audio en direct, façon radio interactive.' },
          { k: 'Stories', v: 'Contenus éphémères qui disparaissent après 24h.' },
          { k: 'Portfolio', v: 'Vitrine de vos projets et avis clients.' },
          { k: 'Blog', v: 'Articles d\'actualité, conseils et tutoriels.' },
          { k: 'Événements', v: 'Inscriptions en ligne et billetterie.' },
          { k: 'Crédits', v: 'La monnaie interne d\'eza, gagnée et dépensée.' },
          { k: 'Certifications', v: 'Badges de vérification officiels.' },
          { k: 'Support Nexus', v: 'Une IA qui vous répond et peut agir sur votre compte.' },
        ],
      },
      {
        title: "Pour qui ?",
        body: "eza s'adresse à tout le monde : créateurs, clients, communautés et organisations. Que vous vouliez partager votre travail, trouver un prestataire, échanger avec une communauté ou promouvoir votre entreprise, il y a une place pour vous.",
        table: [
          { k: 'Créateurs', v: 'Publier, raconter, construire une audience.' },
          { k: 'Clients', v: 'Découvrir des prestataires, demander des devis.' },
          { k: 'Communauté', v: 'Échanger sur le forum, dans les communautés et les Spaces.' },
          { k: 'Organisations', v: 'Affilier votre entreprise, afficher votre logo, recruter.' },
          { k: 'Professionnels', v: 'Obtenir un badge de certification et gagner en crédibilité.' },
        ],
        callout: { kind: 'note', title: "Tous profils bienvenus", text: "Que vous soyez solo, une petite entreprise, une association ou un grand groupe, eza s'adapte. Les abonnements (gratuit à Enterprise) débloquent progressivement plus d'avantages et d'outils." },
      },
      {
        title: "Une app pensée comme une vraie application",
        body: "eza est rapide, tactile et conçue pour le mobile. Vous pouvez l'installer sur l'écran d'accueil de votre téléphone pour une expérience plein écran, comme une vraie app native. Le design est sombre par défaut avec un thème clair disponible, et l'accessibilité est soignée.",
        bullets: [
          "Installable sur iPhone et Android (PWA) — plein écran, comme une app native.",
          "Design sombre élégant + thème clair au choix.",
          "Optimisée pour le mobile : tactile, rapide, fluide.",
          "Notifications sur votre téléphone, même quand l'app est fermée.",
        ],
        callout: { kind: 'tip', title: "Installez eza", text: "Depuis votre navigateur, menu « Ajouter à l'écran d'accueil ». Vous obtenez une icône sur votre téléphone et une app plein écran, sans passer par un store." },
      },
    ],
  },
  {
    slug: 'portfolio', cat: 'plateforme', icon: 'Map',
    title: "Mon portfolio", tagline: "Vitrine de projets et avis clients", color: '#a78bfa',
    intro: "Le portfolio est votre vitrine professionnelle sur eza. Il présente vos projets, filtrables par catégorie, avec des comparaisons avant/après interactives, une carte géographique pour les projets localisés et des avis clients notés en étoiles. C'est l'outil le plus convaincant pour prouver ce que vous savez faire.",
    sections: [
      {
        title: "Mes projets",
        body: "Chaque projet a un titre, une catégorie, des photos et vidéos, une description et des mots-clés. Vos projets sont filtrables par catégorie et apparaissent dans une galerie élégante. Un projet peut être placé sur la carte si sa localisation compte.",
        steps: [
          "Ouvrez le Portfolio depuis le menu.",
          "Parcourez les projets par catégorie (tech, business, art…).",
          "Ouvrez un projet pour voir ses médias et sa description.",
          "Consultez la carte pour les projets géolocalisés.",
        ],
        callout: { kind: 'tip', title: "Plus c'est visuel, mieux c'est", text: "Ajoutez plusieurs photos et vidéos à chaque projet : un visuel vaut mille mots. Le portfolio est votre meilleure carte de visite." },
      },
      {
        title: "Les comparaisons avant / après",
        body: "Le portfolio propose des comparaisons avant/après avec un curseur interactif : on glisse de gauche à droite pour révéler la transformation. C'est l'effet le plus parlant pour montrer un résultat de prestation.",
        bullets: [
          "Curseur interactif : on fait glisser pour comparer.",
          "Idéal pour les rénovations, transformations et refontes.",
          "Effet « waouh » qui transforme un visiteur hésitant en client.",
        ],
        callout: { kind: 'note', title: "Preuve sociale maximale", text: "Montrez le résultat réel d'une prestation plutôt qu'une promesse. Un curseur avant/après vaut mille mots et convertit mieux que n'importe quel argument." },
      },
      {
        title: "Les avis clients",
        body: "Vos clients peuvent laisser des avis notés en étoiles (1 à 5) avec un commentaire. Ces avis apparaissent sur votre portfolio et renforcent votre crédibilité auprès des futurs clients.",
        bullets: [
          "Notes de 1 à 5 étoiles + commentaire libre.",
          "Affichés publiquement sur votre portfolio.",
          "Plus d'avis positifs = plus de confiance des futurs clients.",
        ],
      },
      {
        title: "La carte interactive",
        body: "Les projets localisés apparaissent sur une carte interactive. Chaque marqueur ouvre le détail du projet. C'est idéal pour les prestations où la géographie compte (photographie locale, construction, services sur site…).",
        bullets: [
          "Carte zoomable avec un marqueur par projet.",
          "Filtre par catégorie superposé à la carte.",
          "Parfait pour les prestations géolocalisées.",
        ],
      },
    ],
  },
  {
    slug: 'blog', cat: 'plateforme', icon: 'FileText',
    title: "Le blog eza", tagline: "Actualités, conseils et tutoriels", color: '#38aadc',
    intro: "Le blog eza publie des articles d'actualité, des conseils, des tutoriels et des retours d'expérience. Chaque article a une couverture, une catégorie et un contenu riche. Les nouveaux articles apparaissent dès leur publication.",
    sections: [
      {
        title: "Lire les articles",
        body: "Le blog est organisé par catégories pour vous aider à trouver ce qui vous intéresse. Ouvrez un article pour le lire dans une mise en page pensée pour la lecture, avec sa couverture et ses mots-clés.",
        steps: [
          "Ouvrez « Blog » depuis le menu.",
          "Parcourez les articles par catégorie.",
          "Ouvrez un article pour le lire en entier.",
        ],
      },
      {
        title: "Les catégories",
        body: "Le blog range ses articles en cinq catégories pour vous aider à naviguer.",
        table: [
          { k: 'Actualité', v: 'Nouveautés de la plateforme et annonces.' },
          { k: 'Conseil', v: 'Guides pratiques, astuces et bonnes pratiques.' },
          { k: 'Technique', v: 'Articles techniques et explications approfondies.' },
          { k: 'Projet', v: 'Retours d\'expérience et études de cas.' },
          { k: 'Formation', v: 'Tutoriels et apprentissage progressif.' },
        ],
      },
      {
        title: "Publier un article",
        body: "Si vous avez le droit de publier (équipe eza ou rôle autorisé), vous rédigez vos articles dans l'éditeur riche, les enregistrez en brouillon, les prévisualisez, puis les publiez quand ils sont prêts.",
        bullets: [
          "Rédaction avec un éditeur de texte enrichi.",
          "Prévisualisation avant publication.",
          "Brouillon invisible tant que vous ne publiez pas.",
          "Publication en un clic quand l'article est prêt.",
        ],
        callout: { kind: 'note', title: "Brouillon invisible", text: "Un article en brouillon n'est visible que par vous. Vous pouvez le préparer tranquillement et le publier au moment voulu." },
      },
    ],
  },
];