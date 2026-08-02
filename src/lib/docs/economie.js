// Documentation EZA — catégorie Économie & crédits.
// Contenu 100% utilisateur : aucun jargon technique, pas de nom d'entité ni de fonction.

export const economieTopics = [
  {
    slug: 'events', cat: 'economie', icon: 'Calendar',
    title: "Les événements", tagline: "Inscriptions, billets, check-in", color: '#ff6d3f',
    intro: "eza organise des événements en ligne, hybrides ou en présentiel. Vous vous inscrivez en ligne, vous récupérez un billet avec un code unique, et vous pouvez même vous faire rembourser en crédits si vous ne pouvez plus venir.",
    sections: [
      {
        title: "S'inscrire à un événement",
        body: "L'inscription se fait depuis la page de l'événement. Si l'événement est payant, le prix est en crédits Eza — vos crédits sont débités à l'inscription, sans carte bancaire.",
        steps: [
          "Ouvrez « Événements » depuis le menu.",
          "Parcourez la liste et ouvrez l'événement qui vous intéresse.",
          "Appuyez sur « S'inscrire » (les crédits sont débités si c'est payant).",
          "Vous recevez un billet avec un code unique.",
        ],
        callout: { kind: 'tip', title: "Place limitée", text: "Certains événements ont un nombre de places limité. Inscrivez-vous tôt : une fois la capacité atteinte, l'inscription se ferme." },
      },
      {
        title: "Mon billet & le check-in",
        body: "Chaque inscription génère un billet avec un code unique. Sur place, le scan de ce code valide votre entrée.",
        bullets: [
          "Votre billet est dans « Mes événements ».",
          "Il contient un code unique (ex : EZA-AB12CD34).",
          "Sur place, présentez le code pour le check-in.",
          "Les événements en ligne vous envoient un lien de connexion.",
        ],
      },
      {
        title: "Annuler & se faire rembourser",
        body: "Vous ne pouvez plus venir ? Demandez l'annulation. Si elle est approuvée, les crédits que vous aviez payés vous sont rendus.",
        steps: [
          "Ouvrez votre inscription dans « Mes événements ».",
          "Appuyez sur « Demander l'annulation » et indiquez le motif.",
          "Un responsable examine la demande sous 24-48h.",
          "Si approuvée, vos crédits reviennent sur votre portefeuille.",
        ],
        callout: { kind: 'note', title: "Besoin d'aide ?", text: "Pour une annulation urgente, ouvrez un ticket de support : l'IA Nexus peut traiter le remboursement en crédits automatiquement." },
      },
      {
        title: "Organiser un événement",
        body: "Si vous avez le rôle d'organisateur, vous créez vos événements (titre, dates, lieu, prix), vous suivez les inscrits et vous validez les entrées sur place avec le scan des billets.",
        bullets: [
          "Créez l'événement avec ses infos et son prix en crédits.",
          "Suivez la liste des inscrits et les check-ins.",
          "Validez les entrées en scannant les billets.",
          "Consultez les statistiques (inscrits, revenus).",
        ],
      },
    ],
  },
  {
    slug: 'economie-credits', cat: 'economie', icon: 'Coins',
    title: "Les crédits Eza", tagline: "La monnaie interne d'eza", color: '#ff6d3f',
    intro: "Les crédits Eza sont la monnaie interne de la plateforme. Vous en gagnez en participant à la vie d'eza (posts, likes, parrainage) et vous les dépensez pour des événements, la boutique ou des avantages. Chaque mouvement est tracé dans votre historique.",
    sections: [
      {
        title: "Gagner des crédits",
        body: "Vous gagnez des crédits gratuitement en étant actif sur la plateforme. Plus vous participez, plus vous gagnez.",
        bullets: [
          "Publier un post : récompense automatique.",
          "Recevoir des likes sur vos posts.",
          "Connexion quotidienne : bonus de présence.",
          "Parrainage : crédits quand vos invités rejoignent eza.",
          "Badges et jalons : récompenses ponctuelles.",
        ],
        callout: { kind: 'tip', title: "Suivez votre solde", text: "Votre solde de crédits est visible dans la Banque, avec l'historique complet de tous vos mouvements (gains, dépenses, transferts)." },
      },
      {
        title: "Dépenser des crédits",
        body: "Les crédits servent à accéder à des choses payantes sur eza, sans sortir de carte bancaire.",
        table: [
          { k: 'Événements', v: "S'inscrire à un événement payant." },
          { k: 'Boutique', v: 'Tokens boost, épinglage, design premium de communauté.' },
          { k: 'Abonnements', v: 'Avantages Business/Enterprise.' },
        ],
        steps: [
          "Trouvez un événement ou un article en boutique.",
          "Appuyez sur « S'inscrire » ou « Acheter ».",
          "Vos crédits sont débités automatiquement.",
        ],
      },
      {
        title: "L'historique de mes crédits",
        body: "Chaque mouvement (gain, dépense, transfert) est enregistré dans votre historique avec le montant, la date et le contexte. Vous ne voyez que vos propres mouvements.",
        bullets: [
          "Gains : récompenses, parrainage, badges.",
          "Dépenses : boutique, événements.",
          "Transferts : entrants et sortants entre utilisateurs.",
          "Montants clairs : un signe + pour les entrées, − pour les sorties.",
        ],
        callout: { kind: 'warning', title: "Anti-fraude", text: "Les tentatives d'abus (multi-comptes, automatisation) sont détectées automatiquement et peuvent entraîner l'annulation des récompenses. Jouez le jeu, tout est surveillé." },
      },
    ],
  },
  {
    slug: 'economie-boutique', cat: 'economie', icon: 'Gift',
    title: "La boutique", tagline: "Packs, abonnements, avantages", color: '#f59e0b',
    intro: "La boutique vend des packs de crédits (en euros), des abonnements qui débloquent des avantages, et des tokens consommables (boost de visibilité, épinglage, design premium de communauté).",
    sections: [
      {
        title: "Acheter des crédits",
        body: "Si vous voulez plus de crédits sans attendre de les gagner, vous achetez des packs dans la boutique. Le paiement se fait en euros, de façon sécurisée — aucune donnée de carte n'est stockée par eza.",
        steps: [
          "Ouvrez « Boutique » depuis le menu.",
          "Choisissez un pack de crédits.",
          "Payez en euros (paiement sécurisé).",
          "Les crédits sont ajoutés à votre compte.",
        ],
        callout: { kind: 'tip', title: "Paiement sécurisé", text: "Le paiement passe par un prestataire sécurisé. eza ne stocke jamais vos données de carte — tout est traité de façon sécurisée." },
      },
      {
        title: "Les abonnements",
        body: "Quatre paliers d'abonnement débloquent progressivement plus d'avantages et d'outils. Vous choisissez celui qui correspond à votre usage.",
        table: [
          { k: 'Gratuit', v: 'Accès de base : réseau social, forum, communautés.' },
          { k: 'Pro', v: 'Plus de crédits, avantages créateur, statistiques avancées.' },
          { k: 'Business', v: 'Publicité, posts sponsorisés, capacité étendue.' },
          { k: 'Enterprise', v: 'Tout Business + vérification entreprise, support prioritaire.' },
        ],
        callout: { kind: 'note', title: "Avantages réservés", text: "Certaines fonctionnalités (publicité, posts sponsorisés, communauté premium) ne sont accessibles qu'aux abonnements Business et Enterprise." },
      },
      {
        title: "Les tokens (avantages consommables)",
        body: "Les tokens sont des avantages que vous consommez quand vous le voulez : boost de visibilité d'un post, épinglage pendant 24h ou 7 jours, design premium pour une communauté, ou capacité étendue.",
        bullets: [
          "Boost : plus de visibilité pour un post.",
          "Épinglage 24h ou 7 jours : votre post en haut.",
          "Design premium : communauté avec un look amélioré.",
          "Capacité étendue : plus de membres pour une communauté.",
        ],
      },
      {
        title: "Gérer mon abonnement",
        body: "Vous pouvez annuler votre abonnement quand vous voulez, et gérer vos moyens de paiement depuis un portail sécurisé. L'annulation prend effet à la fin de la période en cours.",
        bullets: [
          "Annulation à tout moment, depuis votre compte.",
          "Portail sécurisé pour gérer vos paiements.",
          "L'abonnement reste actif jusqu'à la fin de la période payée.",
        ],
      },
    ],
  },
  {
    slug: 'banque', cat: 'economie', icon: 'Coins',
    title: "La banque & mes portefeuilles", tagline: "Solde, transferts, organisation", color: '#38aadc',
    intro: "La banque vous permet de ranger vos crédits dans plusieurs portefeuilles (épargne, dépenses, projet) et de les transférer entre eux ou vers d'autres utilisateurs. Vous suivez tous vos mouvements d'un coup d'œil.",
    sections: [
      {
        title: "Mes portefeuilles",
        body: "Vous possédez plusieurs portefeuilles pour organiser vos crédits. Chacun a un nom, un type et un solde. Vous pouvez en créer autant que besoin.",
        steps: [
          "Ouvrez « Banque » depuis le menu.",
          "Consultez vos portefeuilles et leurs soldes.",
          "Créez un nouveau portefeuille si besoin.",
        ],
        callout: { kind: 'tip', title: "Rangez vos crédits", text: "Séparez vos crédits d'épargne, de dépenses courantes et de projets pour mieux piloter votre budget. C'est comme des enveloppes virtuelles." },
      },
      {
        title: "Transférer des crédits",
        body: "Vous déplacez des crédits entre vos portefeuilles, ou vous en envoyez à un autre utilisateur. Chaque transfert vérifie que vous avez assez de crédits et qu'aucun portefeuille n'est gelé.",
        steps: [
          "Ouvrez un portefeuille et appuyez sur « Transférer » ou « Déplacer ».",
          "Choisissez le destinataire (vous-même ou un autre utilisateur).",
          "Saisissez le montant et confirmez.",
          "Le transfert est enregistré dans votre historique.",
        ],
        callout: { kind: 'warning', title: "Portefeuille gelé", text: "Si un portefeuille est gelé par l'administration, il ne peut ni envoyer ni recevoir de crédits. Le gel se lève une fois la situation vérifiée." },
      },
      {
        title: "Mon historique",
        body: "La banque affiche l'historique complet de vos mouvements : gains, dépenses, transferts entrants et sortants. Chaque ligne indique le montant, la date et le contexte.",
        bullets: [
          "Tous vos mouvements en un seul endroit.",
          "Montants clairs (+ pour les entrées, − pour les sorties).",
          "Filtrez pour retrouver une transaction précise.",
        ],
      },
    ],
  },
  {
    slug: 'parrainage', cat: 'economie', icon: 'Gift',
    title: "Le parrainage", tagline: "Inviter des amis, gagner des crédits", color: '#fb7185',
    intro: "Le parrainage récompense l'apport de nouveaux membres. Vous partagez votre code de parrainage, vos invités rejoignent eza, et vous gagnez des crédits à chaque étape. Plus vous parrainez, plus vous gagnez.",
    sections: [
      {
        title: "Mon code de parrainage",
        body: "Votre code de parrainage est votre @username. Partagez-le à vos amis : quand ils s'inscrivent avec votre code, vous gagnez des crédits.",
        steps: [
          "Ouvrez « Parrainage » depuis le menu.",
          "Copiez votre code (votre @username) ou le lien de partage.",
          "Envoyez-le à vos amis.",
          "Quand ils rejoignent eza, vous gagnez des crédits.",
        ],
        callout: { kind: 'tip', title: "Partagez largement", text: "Partagez votre lien sur vos réseaux, par message ou par email. Chaque inscription validée vous rapporte des crédits." },
      },
      {
        title: "Les jalons",
        body: "Plus vous parrainez, plus vous débloquez des récompenses bonus à chaque jalon (1er, 5e, 10e filleul…). Les récompenses se cumulent : inscription + chaque jalon atteint.",
        bullets: [
          "Crédit initial à la première inscription d'un filleul.",
          "Récompenses bonus à chaque jalon (5e, 10e filleul…).",
          "Cumul progressif : plus de parrainages = plus de gains.",
          "Suivez votre progression vers le prochain jalon.",
        ],
        callout: { kind: 'note', title: "Suivez vos gains", text: "La page Parrainage affiche votre code, vos filleuls, vos gains et votre progression vers le prochain jalon." },
      },
      {
        title: "Jouer loyalement",
        body: "Les tentatives de fraude (multi-comptes, robots d'inscription) sont détectées automatiquement et peuvent entraîner l'annulation des récompenses et un bannissement. Parrainez de vraies personnes.",
        callout: { kind: 'warning', title: "Pas de triche", text: "Chaque parrainage est vérifié. La fraude (multi-comptes, bots) entraîne l'annulation des récompenses et peut bloquer votre compte. Jouez le jeu." },
      },
    ],
  },
  {
    slug: 'ads', cat: 'economie', icon: 'Megaphone',
    title: "La publicité business", tagline: "Promouvoir son contenu", color: '#f59e0b',
    intro: "La publicité permet aux comptes Business et Enterprise de promouvoir leur contenu. Vous définissez un budget en crédits, un placement et un ciblage, et eza diffuse votre annonce en suivant votre budget.",
    sections: [
      {
        title: "Créer une campagne",
        body: "Une campagne a une créa (image), un texte d'accroche, un bouton d'appel à l'action et un lien de destination. Vous choisissez où elle apparaît et, si vous voulez, les hashtags à cibler.",
        steps: [
          "Ouvrez votre espace Business.",
          "Créez une campagne : créa, texte, lien, placement.",
          "Définissez le budget total et le budget par jour.",
          "Lancez la campagne après validation.",
        ],
        callout: { kind: 'note', title: "Réservé Business", text: "La publicité n'est accessible qu'aux abonnements Business et Enterprise. C'est un avantage réservé aux comptes professionnels." },
      },
      {
        title: "Budget et diffusion",
        body: "Votre budget se déduit chaque jour à hauteur du budget journalier que vous avez fixé. Quand le budget est épuisé, la campagne se met en pause automatiquement. Vous êtes prévenu quand le budget devient bas.",
        bullets: [
          "Budget total + budget par jour : vous gardez le contrôle.",
          "Pause automatique quand les crédits sont épuisés.",
          "Alerte quand le budget devient bas.",
          "La campagne reprend si vous rajoutez du budget.",
        ],
      },
      {
        title: "Suivre les performances",
        body: "Vous suivez les impressions (nombre d'affichages) et les clics de chaque campagne. Vous voyez ce qui fonctionne et ajustez vos créations.",
        bullets: [
          "Impressions : combien de fois votre annonce est vue.",
          "Clics : combien de personnes ont cliqué.",
          "Portée estimée selon votre budget.",
          "Ajustez vos créas pour améliorer vos résultats.",
        ],
        callout: { kind: 'tip', title: "Une bonne créa change tout", text: "Une image accrocheuse et un texte clair multiplient les clics. Testez plusieurs versions pour voir ce qui marche." },
      },
    ],
  },
];