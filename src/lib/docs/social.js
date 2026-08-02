// Documentation EZA — catégorie Social & communauté.
// Contenu 100% utilisateur : aucun jargon technique, pas de nom d'entité ni de fonction.

export const socialTopics = [
  {
    slug: 'social', cat: 'social', icon: 'Users',
    title: "Le fil d'actualités", tagline: "Publier, aimer, répondre, partager", color: '#38aadc',
    intro: "Le fil d'actualités est le cœur d'eza. Vous y publiez du contenu (texte, photos, vidéos, sondages), vous réagissez (likes, réponses, partages) et vous suivez d'autres comptes. Les hashtags et mentions sont détectés automatiquement, et la visibilité de vos posts est réglable.",
    sections: [
      {
        title: "Publier du contenu",
        body: "Une publication peut être du texte seul, ou accompagnée de photos, de vidéos ou de GIFs. Vous rédigez depuis le bouton « Publier » et vous choisissez qui peut voir votre post.",
        steps: [
          "Appuyez sur « + Publier ».",
          "Rédigez votre message.",
          "Ajoutez photos, vidéos, GIF ou un sondage.",
          "Choisissez la visibilité (tout le monde, abonnés, certifiés…).",
          "Publiez — c'est en ligne immédiatement.",
        ],
        callout: { kind: 'tip', title: "Hashtags & mentions", text: "Tapez # suivi d'un mot pour créer un hashtag (ex : #photo) et @ suivi d'un pseudo pour mentionner quelqu'un (ex : @enor). Les hashtags rendent votre publication trouvable." },
      },
      {
        title: "Réagir et interagir",
        body: "Chaque publication propose plusieurs actions pour interagir avec la communauté. Vos likes, réponses et partages sont visibles en temps réel par l'auteur et par les autres personnes qui regardent.",
        table: [
          { k: 'J\'aime', v: 'Un clic pour montrer que vous appréciez un post.' },
          { k: 'Répondre', v: 'Créer une conversation sous le post.' },
          { k: 'Reposter', v: 'Partager un post sur votre propre fil.' },
          { k: 'Citer', v: 'Reposter en ajoutant votre commentaire.' },
          { k: 'Signaler', v: 'Prévenir l\'équipe en cas de contenu problématique.' },
        ],
      },
      {
        title: "Suivre des comptes",
        body: "Vous pouvez vous abonner aux comptes qui vous intéressent. Vos abonnements alimentent votre fil d'actualités. La page Explorer vous aide à découvrir de nouveaux profils à suivre.",
        bullets: [
          "Abonnez-vous pour voir les posts d'un compte dans votre fil.",
          "La page Explorer suggère des profils à suivre.",
          "Chaque profil public affiche ses publications et ses statistiques.",
          "Créez des listes personnalisées pour organiser vos abonnements.",
          "Mettez des posts en signet pour les retrouver plus tard.",
        ],
      },
      {
        title: "Qui voit mes publications ?",
        body: "Vous contrôlez la portée de chaque publication. Par défaut, vos posts sont visibles par tout le monde, mais vous pouvez limiter à vos abonnés, aux comptes certifiés ou au cercle eza.",
        callout: { kind: 'note', title: "Visibilité sélective", text: "Un post en visibilité « certifiés » n'est visible que par les comptes certifiés — idéal pour des annonces réservées aux professionnels vérifiés." },
      },
    ],
  },
  {
    slug: 'messaging', cat: 'social', icon: 'MessageSquare',
    title: "La messagerie", tagline: "Conversations privées en direct", color: '#1dd8b4',
    intro: "La messagerie vous permet de discuter en privé avec d'autres membres d'eza, en temps réel. Le premier message envoyé à quelqu'un est une demande de contact — l'autre personne doit l'accepter avant que la conversation ne démarre vraiment.",
    sections: [
      {
        title: "Démarrer une conversation",
        body: "Pour parler à quelqu'un en privé, ouvrez la Messagerie et écrivez à un contact. Votre premier message est une demande : tant que l'autre ne l'a pas acceptée, la conversation reste isolée dans le panneau des demandes. Une fois acceptée, elle apparaît dans votre boîte principale.",
        steps: [
          "Ouvrez « Messages » depuis le menu.",
          "Écrivez à la personne que vous voulez contacter.",
          "L'autre reçoit une demande et l'accepte (ou la refuse).",
          "Une fois acceptée, la conversation démarre en direct.",
        ],
        callout: { kind: 'tip', title: "Anti-spam natif", text: "Tant qu'une demande n'est pas acceptée, la conversation reste isolée. Votre boîte principale est protégée du spam — seules les conversations acceptées y arrivent." },
      },
      {
        title: "Messages officiels et avertissements",
        body: "L'équipe eza peut envoyer des messages officiels (avec un badge officiel) et des avertissements (en orange) si besoin. Ces messages ont un style distinct pour les reconnaître au premier coup d'œil.",
        bullets: [
          "Messages officiels : badge officiel, style dédié.",
          "Avertissements : couleur orange, bien visibles.",
          "Ces messages viennent de l'équipe eza, pas d'un autre utilisateur.",
        ],
      },
      {
        title: "Raffiner un message avec l'IA",
        body: "Dans le composeur de messagerie, vous pouvez demander à l'IA de reformuler votre message (plus poli, plus clair, plus court…) avant de l'envoyer. Vous prévisualisez le résultat et vous décidez d'envoyer ou non — l'IA n'envoie jamais à votre place.",
        callout: { kind: 'note', title: "Vous restez maître", text: "Le raffinement est optionnel : vous voyez le résultat et vous seul décidez d'envoyer. L'IA vous aide à formuler, elle ne remplace pas votre jugement." },
      },
    ],
  },
  {
    slug: 'forum', cat: 'social', icon: 'MessagesSquare',
    title: "Le forum", tagline: "Discussions et entraide communautaire", color: '#f59e0b',
    intro: "Le forum rassemble des discussions classées par catégorie. Vous créez des sujets, y répondez, aimez les réponses et marquez les meilleures comme solution. Le texte est mis en forme de façon lisible : titres, gras, listes, citations et blocs de code.",
    sections: [
      {
        title: "Créer une discussion",
        body: "Pour poser une question ou lancer un débat, créez une discussion : un titre, un contenu, une catégorie et des mots-clés. Votre discussion apparaît immédiatement dans la liste du forum.",
        steps: [
          "Ouvrez « Forum » depuis le menu.",
          "Appuyez sur « Nouvelle discussion ».",
          "Rédigez un titre et votre message.",
          "Choisissez la catégorie et publiez.",
        ],
        callout: { kind: 'tip', title: "Soyez clair", text: "Un titre précis et une question bien posée attirent plus de réponses. Expliquez votre contexte et ce que vous attendez." },
      },
      {
        title: "Répondre et marquer une solution",
        body: "Chaque réponse peut être aimée. L'auteur de la discussion (ou un modérateur) peut marquer une réponse comme « solution » quand elle résout le problème — utile pour que tout le monde la trouve rapidement.",
        bullets: [
          "Répondez sous n'importe quelle discussion.",
          "Aimez les réponses utiles.",
          "Marquez la meilleure réponse comme solution.",
          "Le texte est mis en forme (titres, gras, listes, citations).",
        ],
      },
      {
        title: "Discussions mises en avant",
        body: "Certaines discussions peuvent être épinglées en haut de la liste, verrouillées (plus de réponses possibles) ou marquées comme annonces officielles par l'équipe eza.",
        callout: { kind: 'note', title: "Liens externes sécurisés", text: "Quand vous cliquez sur un lien externe dans une discussion, un aperçu vous montre la destination avant de vous y emmener. Cela protège du phishing." },
      },
    ],
  },
  {
    slug: 'communities', cat: 'social', icon: 'Users',
    title: "Les communautés", tagline: "Groupes thématiques avec leurs règles", color: '#1dd8b4',
    intro: "Les communautés sont des groupes thématiques où les membres se rassemblent autour d'un sujet. Ouvertes (publiques) ou fermées (sur invitation), elles ont leurs propres membres, leurs propres publications et leurs propres règles. C'est l'équivalent des groupes thématiques, mais intégré à eza.",
    sections: [
      {
        title: "Rejoindre une communauté",
        body: "Parcourez les communautés par catégorie et rejoignez celles qui vous intéressent. Les communautés ouvertes acceptent tout le monde ; les fermées demandent l'approbation du créateur.",
        steps: [
          "Ouvrez « Communautés » depuis le menu.",
          "Filtrez par catégorie (tech, business, art, musique, sport…).",
          "Ouvrez une communauté pour lire sa description et ses règles.",
          "Appuyez sur « Rejoindre ».",
        ],
        callout: { kind: 'note', title: "Communautés fermées", text: "Les communautés fermées demandent l'approbation du créateur. Votre demande reste en attente jusqu'à validation." },
      },
      {
        title: "Participer à une communauté",
        body: "Une fois membre, vous publiez dans la communauté, réagissez aux posts et échangez avec les autres membres. Respectez les règles affichées sur la page de la communauté.",
        bullets: [
          "Publiez directement dans la communauté.",
          "Réagissez et commentez les posts des membres.",
          "Respectez les règles affichées par le créateur.",
          "Les posts communautaires apparaissent aussi dans votre fil.",
        ],
      },
      {
        title: "Créer ma communauté",
        body: "Vous pouvez créer votre propre communauté : un nom, une catégorie et des règles. Les abonnés Business peuvent en plus épingler leur communauté et appliquer un design premium pour gagner en visibilité.",
        callout: { kind: 'tip', title: "Capacité extensible", text: "Chaque communauté a un nombre maximum de membres. Cette capacité peut être étendue via la boutique si votre communauté grandit." },
      },
    ],
  },
  {
    slug: 'stories', cat: 'social', icon: 'Bell',
    title: "Les stories", tagline: "Contenus éphémères de 24h", color: '#fb7185',
    intro: "Les stories sont des contenus qui disparaissent après 24h, comme sur Instagram ou Snapchat. Elles peuvent être une photo, une vidéo ou un simple texte coloré. Vous les créez avec la caméra intégrée, des filtres, des stickers et du dessin.",
    sections: [
      {
        title: "Créer une story",
        body: "La création se fait depuis le studio intégré : prenez une photo, filmez, ou choisissez une image de votre galerie, puis ajoutez un filtre, du texte, des stickers ou un dessin.",
        steps: [
          "Appuyez sur l'avatar story en haut de l'accueil.",
          "Prenez une photo, filmez, ou choisissez une image.",
          "Ajoutez un filtre, du texte, des stickers ou un dessin.",
          "Publiez — votre story est visible 24h.",
        ],
        callout: { kind: 'tip', title: "Stories texte", text: "Pas envie de photo ? Créez une story texte : choisissez un fond en dégradé, écrivez votre message, publiez. Simple et efficace." },
      },
      {
        title: "Voir qui a regardé",
        body: "Vous voyez en direct qui a regardé vos stories et les réactions reçues (likes et réponses emoji). C'est un excellent indicateur de votre audience réelle.",
        bullets: [
          "Ouvrez votre story et glissez vers le haut.",
          "Vous voyez la liste des personnes et leurs réactions.",
          "Les likes et réponses s'affichent en temps réel.",
        ],
      },
    ],
  },
  {
    slug: 'spaces', cat: 'social', icon: 'Radio',
    title: "Les Spaces audio", tagline: "Salons audio en direct", color: '#a78bfa',
    intro: "Les Spaces sont des salons audio en direct, façon radio interactive. Un hôte lance un direct, des orateurs parlent, des auditeurs écoutent. Vous pouvez écouter, demander la parole ou créer votre propre Space.",
    sections: [
      {
        title: "Rejoindre un Space en direct",
        body: "Quand un Space est en direct, vous pouvez l'écouter et interagir en temps réel. Vous commencez comme auditeur, et vous pouvez lever la main pour demander à parler.",
        steps: [
          "Ouvrez « Spaces » depuis le menu.",
          "Choisissez un Space en direct et entrez.",
          "Vous êtes auditeur — vous écoutez l'hôte.",
          "Levez la main pour demander à parler.",
        ],
        callout: { kind: 'note', title: "Micro & caméra", text: "eza vous demande l'accès au micro pour participer. Vous pouvez aussi partager votre caméra si l'hôte l'autorise." },
      },
      {
        title: "Créer mon propre Space",
        body: "Vous pouvez lancer votre propre salon audio quand vous voulez : un titre, une description, et vous démarrez le direct. Vous gérez qui parle et vous terminez le Space quand vous le souhaitez.",
        steps: [
          "Depuis « Spaces », appuyez sur « Créer un Space ».",
          "Donnez un titre et une description.",
          "Lancez le direct — les auditeurs rejoignent.",
          "Gérez les orateurs et terminez quand vous voulez.",
        ],
      },
      {
        title: "Spaces officiels",
        body: "Certains Spaces sont officiels et portent un badge eza. Ils peuvent aussi être programmés à une date future pour annoncer un évènement à l'avance.",
        bullets: [
          "Badge officiel eza pour les Spaces de l'équipe.",
          "Programmation possible à une date future.",
          "Visibilité prioritaire pour les Spaces officiels.",
        ],
      },
    ],
  },
];