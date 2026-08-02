// Documentation EZA — catégorie « Modes d'emploi » : guides pratiques, pas à pas,
// pensés pour les utilisateurs (pas pour les développeurs). On garde l'id 'tech'
// pour ne pas casser l'agrégateur docsContent.js, mais le label devient
// « Modes d'emploi » côté UI.

export const techTopics = [
  {
    slug: 'demarrer', cat: 'tech', icon: 'Zap',
    title: "Démarrer sur eza", tagline: "Créer son compte et faire ses premiers pas", color: '#ff6d3f',
    intro: "Nouveau sur eza ? Voici comment créer votre compte, compléter votre profil et comprendre l'interface en 5 minutes. Aucune compétence technique requise.",
    sections: [
      {
        title: "Créer mon compte",
        body: "L'inscription est gratuite et prend moins d'une minute. Vous pouvez utiliser votre email ou votre compte Google.",
        steps: [
          "Ouvrez eza et appuyez sur « S'inscrire ».",
          "Saisissez votre email et un mot de passe (ou utilisez « Continuer avec Google »).",
          "Vous recevez un code par email : recopiez-le pour valider votre compte.",
          "C'est fait — vous êtes connecté et prêt à explorer.",
        ],
        callout: { kind: 'tip', title: "Vérifiez vos spams", text: "Le code de validation arrive par email. Si vous ne le voyez pas dans les 2 minutes, regardez dans les spams ou appuyez sur « Renvoyer le code »." },
      },
      {
        title: "Compléter mon profil",
        body: "Un profil complet vous rend plus facile à trouver et plus crédible. Ajoutez une photo, un nom et une bio dès le début.",
        steps: [
          "Allez dans « Mon profil » (icône profil ou menu Plus).",
          "Appuyez sur « Modifier » pour ajouter une photo et un nom d'affichage.",
          "Choisissez un @username unique — c'est votre identité sur eza.",
          "Rédigez une bio courte : qui vous êtes, ce que vous faites.",
        ],
        callout: { kind: 'note', title: "Le @username", text: "Votre @username est unique et sert pour les mentions (@pseudo) et le lien de votre profil public (eza.group/@pseudo). Choisissez-le une fois pour toutes." },
      },
      {
        title: "Comprendre l'interface",
        body: "eza réunit tout dans une seule app. Voici les zones principales à connaître.",
        bullets: [
          "Accueil : le fil d'actualités avec les posts de la communauté.",
          "Explorer : découvrez de nouveaux profils, communautés et contenus.",
          "Messages : vos conversations privées en direct.",
          "Bouton « + » / Publier : créez un post, une story ou plus.",
          "Menu « Plus » : tout le reste (banque, boutique, événements, support…).",
        ],
        callout: { kind: 'tip', title: "Installez l'app", text: "eza est installable sur votre téléphone : depuis le navigateur, menu « Ajouter à l'écran d'accueil ». Vous obtenez une app plein écran, comme une vraie app native." },
      },
    ],
  },
  {
    slug: 'publier', cat: 'tech', icon: 'MessageSquare',
    title: "Publier un post", tagline: "Partager du contenu en quelques gestes", color: '#1dd8b4',
    intro: "Le post est au cœur d'eza. Voici comment rédiger, enrichir d'images ou de vidéos, utiliser les hashtags, mentions et sondages pour publier du contenu qui compte.",
    sections: [
      {
        title: "Rédiger mon post",
        body: "Un post peut être du texte seul, ou accompagné de photos, vidéos ou GIFs. La rédaction se fait depuis le bouton « Publier ».",
        steps: [
          "Appuyez sur « + Publier » (barre du bas ou Accueil).",
          "Rédigez votre message dans la zone de texte.",
          "Ajoutez du contenu : photo, vidéo, GIF ou sondage.",
          "Choisissez la visibilité (public, abonnés, certifiés) si besoin.",
          "Appuyez sur « Publier » — votre post est en ligne immédiatement.",
        ],
        callout: { kind: 'tip', title: "Hashtags & mentions", text: "Tapez # suivi d'un mot pour créer un hashtag (ex : #photo). Tapez @ suivi d'un pseudo pour mentionner quelqu'un (ex : @enor). Les hashtags rendent votre post trouvable." },
      },
      {
        title: "Ajouter un sondage",
        body: "Un sondage permet de solliciter l'avis de votre audience sur une question. Vos abonnés votent en un geste.",
        steps: [
          "Dans le composer, appuyez sur l'icône sondage.",
          "Posez votre question.",
          "Ajoutez 2 à 4 options de réponse.",
          "Publiez — les votes s'affichent en temps réel.",
        ],
      },
      {
        title: "Programmer une publication",
        body: "Vous pouvez préparer un post et le publier automatiquement plus tard — utile pour planifier votre contenu.",
        steps: [
          "Rédigez votre post comme d'habitude.",
          "Activez « Programmer » et choisissez la date et l'heure.",
          "Enregistrez — le post sera publié seul au bon moment.",
        ],
        callout: { kind: 'note', title: "Visibilité", text: "Par défaut, vos posts sont publics. Vous pouvez limiter à vos abonnés, aux certifiés ou au cercle eza selon le contexte. Choisissez la portée avant de publier." },
      },
    ],
  },
  {
    slug: 'credits-guide', cat: 'tech', icon: 'Coins',
    title: "Gagner & dépenser des crédits", tagline: "L'argent d'eza expliqué simplement", color: '#f59e0b',
    intro: "Les crédits Eza sont la monnaie interne de la plateforme. Vous en gagnez en étant actif et vous les dépensez pour des événements, la boutique ou des avantages. Voici comment ça marche au quotidien.",
    sections: [
      {
        title: "Gagner des crédits",
        body: "Vous gagnez des crédits gratuitement en participant à la vie de la plateforme. Plus vous êtes actif, plus vous gagnez.",
        bullets: [
          "Publier un post : récompense automatique.",
          "Recevoir des likes sur vos posts.",
          "Connexion quotidienne : bonus de présence.",
          "Parrainage : crédits quand vos invités rejoignent eza.",
          "Badges & milestones : récompenses ponctuelles.",
        ],
        callout: { kind: 'tip', title: "Suivez votre solde", text: "Votre solde de crédits est visible dans la Banque. Vous y voyez aussi l'historique de tous vos mouvements (gains, dépenses, transferts)." },
      },
      {
        title: "Dépenser des crédits",
        body: "Les crédits servent à accéder à des choses payantes sur la plateforme sans sortir de carte bancaire.",
        table: [
          { k: 'Événements', v: "S'inscrire à un événement payant (le prix est en crédits)." },
          { k: 'Boutique', v: 'Tokens boost, épinglage de post, design premium de communauté.' },
          { k: 'Abonnements', v: 'Avantages Business/Enterprise (visibilité, fonctionnalités).' },
        ],
        steps: [
          "Trouvez un événement ou un article en boutique.",
          "Appuyez sur « S'inscrire » ou « Acheter ».",
          "Vos crédits sont débités automatiquement.",
          "L'article ou le billet est ajouté à votre compte.",
        ],
      },
      {
        title: "Gérer mes portefeuilles",
        body: "La Banque vous permet de ranger vos crédits dans plusieurs portefeuilles (épargne, dépenses, projet) et de transférer entre eux.",
        steps: [
          "Ouvrez la « Banque » depuis le menu.",
          "Consultez vos portefeuilles et leurs soldes.",
          "Créez un nouveau portefeuille si besoin.",
          "Transférez des crédits d'un portefeuille à l'autre avec « Déplacer ».",
        ],
        callout: { kind: 'note', title: "Acheter des crédits", text: "Si vous voulez plus de crédits sans attendre, vous pouvez acheter des packs dans la Boutique (paiement carte bancaire sécurisé via Stripe)." },
      },
    ],
  },
  {
    slug: 'evenements-guide', cat: 'tech', icon: 'Calendar',
    title: "Participer à un événement", tagline: "S'inscrire, obtenir son billet, annuler", color: '#a78bfa',
    intro: "eza organise des événements en ligne, hybrides ou en présentiel. Voici comment vous inscrire, récupérer votre billet et même vous faire rembourser en crédits si besoin.",
    sections: [
      {
        title: "S'inscrire à un événement",
        body: "L'inscription se fait en deux gestes depuis la page de l'événement. Si l'événement est payant, vos crédits Eza sont débités.",
        steps: [
          "Ouvrez « Événements » depuis le menu.",
          "Parcourez la liste et ouvrez l'événement qui vous intéresse.",
          "Appuyez sur « S'inscrire » (les crédits sont débités si l'événement est payant).",
          "Vous recevez un billet avec un code unique — présenté à l'entrée ou en ligne.",
        ],
        callout: { kind: 'tip', title: "Place limitée", text: "Certains événements ont un nombre de places limité. Inscrivez-vous tôt : une fois la capacité atteinte, l'inscription se ferme." },
      },
      {
        title: "Mon billet & le check-in",
        body: "Chaque inscription génère un billet avec un code. Sur place, le scan du code valide votre entrée.",
        bullets: [
          "Votre billet est dans « Mes événements » (Espace utilisateur).",
          "Il contient un code unique (ex : EZA-AB12CD34).",
          "Sur place, présentez le code à un organisateur pour le check-in.",
          "Les événements en ligne vous envoient un lien de connexion.",
        ],
      },
      {
        title: "Annuler & se faire rembourser",
        body: "Vous ne pouvez plus venir ? Vous pouvez demander l'annulation. Si elle est approuvée, vos crédits vous sont rendus.",
        steps: [
          "Ouvrez votre inscription dans « Mes événements ».",
          "Appuyez sur « Demander l'annulation » et indiquez le motif.",
          "Un admin examine la demande sous 24-48h.",
          "Si approuvée, les crédits payés reviennent sur votre portefeuille.",
        ],
        callout: { kind: 'note', title: "Besoin d'aide ?", text: "Pour une annulation urgente ou un problème de billet, ouvrez un ticket de support : Nexus IA peut traiter le remboursement en crédits automatiquement." },
      },
    ],
  },
  {
    slug: 'communautes-guide', cat: 'tech', icon: 'Users',
    title: "Rejoindre une communauté", tagline: "Trouver sa tribu et échanger", color: '#1dd8b4',
    intro: "Les communautés rassemblent des membres autour d'un thème. Voici comment en trouver une, la rejoindre et y participer.",
    sections: [
      {
        title: "Trouver & rejoindre une communauté",
        body: "Parcourez les communautés par catégorie et rejoignez celles qui vous intéressent. Certaines sont ouvertes à tous, d'autres sur invitation.",
        steps: [
          "Ouvrez « Communautés » depuis le menu.",
          "Filtrez par catégorie (tech, business, art, musique, sport…).",
          "Ouvrez une communauté pour lire sa description et ses règles.",
          "Appuyez sur « Rejoindre » — vous devenez membre instantanément.",
        ],
        callout: { kind: 'note', title: "Communautés fermées", text: "Les communautés fermées demandent l'approbation du créateur. Votre demande reste en attente jusqu'à validation." },
      },
      {
        title: "Participer à une communauté",
        body: "Une fois membre, vous pouvez publier dans la communauté, réagir aux posts et échanger avec les autres membres.",
        bullets: [
          "Publiez un post directement dans la communauté (sélecteur en haut).",
          "Réagissez, commentez et partagez les posts des membres.",
          "Respectez les règles affichées sur la page de la communauté.",
          "Les posts communautaires apparaissent aussi dans votre fil.",
        ],
        callout: { kind: 'tip', title: "Créer la vôtre", text: "Envie de créer votre propre communauté ? Depuis la page Communautés, appuyez sur « Créer ». Choisissez un nom, une catégorie et des règles. Les abonnés Business peuvent épingler et passer leur communauté en design premium." },
      },
    ],
  },
  {
    slug: 'stories-guide', cat: 'tech', icon: 'Smartphone',
    title: "Créer une story", tagline: "Partager un moment éphémère", color: '#a78bfa',
    intro: "Les stories sont des photos, vidéos ou textes qui disparaissent après 24h. Voici comment créer la vôtre avec filtres, stickers et textes colorés.",
    sections: [
      {
        title: "Créer ma story",
        body: "La création se fait depuis le Studio Story, avec la caméra ou une image de votre galerie.",
        steps: [
          "Appuyez sur l'avatar story en haut de l'Accueil.",
          "Choisissez : prendre une photo, filmer, ou ajouter une image.",
          "Appliquez un filtre, ajoutez du texte, des stickers ou un dessin.",
          "Appuyez sur « Publier » — votre story est visible 24h.",
        ],
        callout: { kind: 'tip', title: "Stories texte", text: "Pas envie de photo ? Créez une story texte : choisissez un fond en dégradé, écrivez votre message, et publiez. Simple et efficace." },
      },
      {
        title: "Voir qui a vu ma story",
        body: "Vous voyez en direct qui a regardé vos stories et les réactions reçues.",
        bullets: [
          "Ouvrez votre story et glissez vers le haut.",
          "Vous voyez la liste des viewers et leurs réactions.",
          "Les likes et réponses emoji s'affichent en temps réel.",
        ],
      },
    ],
  },
  {
    slug: 'spaces-guide', cat: 'tech', icon: 'Radio',
    title: "Participer à un Space", tagline: "L'audio en direct, comme une radio", color: '#fb7185',
    intro: "Les Spaces sont des salons audio en direct — comme une radio interactive. Vous pouvez écouter, demander à parler ou créer le vôtre.",
    sections: [
      {
        title: "Rejoindre un Space en direct",
        body: "Quand un Space est en live, vous pouvez l'écouter et interagir en temps réel.",
        steps: [
          "Ouvrez « Spaces » depuis le menu.",
          "Choisissez un Space « En direct » et appuyez pour entrer.",
          "Vous êtes d'abord auditeur — vous écoutez l'hôte.",
          "Levez la main pour demander à parler (l'hôte vous donne la parole).",
        ],
        callout: { kind: 'note', title: "Micro & caméra", text: "eza vous demande l'accès au micro pour participer à un Space. Vous pouvez aussi partager votre caméra si l'hôte l'autorise." },
      },
      {
        title: "Créer mon propre Space",
        body: "Vous pouvez lancer votre propre salon audio quand vous voulez.",
        steps: [
          "Depuis « Spaces », appuyez sur « Créer un Space ».",
          "Donnez un titre et une description.",
          "Lancez le direct — vos auditeurs rejoignent en direct.",
          "Vous gérez qui parle et vous terminez le Space quand vous voulez.",
        ],
      },
    ],
  },
  {
    slug: 'securite-guide', cat: 'tech', icon: 'Lock',
    title: "Sécuriser mon compte", tagline: "Protéger son compte et ses données", color: '#38aadc',
    intro: "Votre compte contient votre identité, vos crédits et vos données. Voici comment le protéger : mot de passe fort, double authentification, gestion des appareils et confidentialité.",
    sections: [
      {
        title: "Activer la double authentification (2FA)",
        body: "La 2FA ajoute une couche de sécurité : même si quelqu'un connaît votre mot de passe, il ne peut pas se connecter sans votre code.",
        steps: [
          "Allez dans « Mon profil » › « Sécurité ».",
          "Activez la 2FA et suivez les instructions (scan d'un QR code).",
          "Votre app d'authentification génère un code à 6 chiffres.",
          "Saisissez le code pour confirmer — la 2FA est active.",
        ],
        callout: { kind: 'warning', title: "Conservez votre code de récupération", text: "Gardez précieusement le code de récupération fourni lors de l'activation. Sans lui, vous pourriez perdre l'accès à votre compte si vous perdez votre téléphone." },
      },
      {
        title: "Gérer mes appareils connectés",
        body: "Vous pouvez voir tous les appareils connectés à votre compte et révoquer ceux que vous ne reconnaissez pas.",
        bullets: [
          "« Sécurité » › « Appareils connectés ».",
          "Chaque appareil est listé avec sa dernière connexion.",
          "Appuyez sur « Révoquer » pour déconnecter un appareil.",
          "En cas de doute, révoquez tout et re-connectez-vous proprement.",
        ],
      },
      {
        title: "Confidentialité & suppression de compte",
        body: "Vous contrôlez vos données : qui voit votre profil, vos posts, et vous pouvez demander la suppression de votre compte (droit RGPD).",
        bullets: [
          "Réglez la visibilité de vos posts (public, abonnés, certifiés).",
          "Gérez votre liste de blocs (qui ne peut plus vous contacter).",
          "Demandez la suppression de votre compte depuis « Account Deletion ».",
          "Vos données sont traitées conformément au RGPD européen.",
        ],
        callout: { kind: 'tip', title: "Mot de passe oublié", text: "Sur la page de connexion, appuyez sur « Mot de passe oublié » : un email de réinitialisation vous est envoyé. Vérifiez vos spams." },
      },
    ],
  },
  {
    slug: 'notifications-guide', cat: 'tech', icon: 'Bell',
    title: "Gérer mes notifications", tagline: "Recevoir l'essentiel, éviter le bruit", color: '#38aadc',
    intro: "eza vous informe par trois canaux : dans l'app, par notification push sur votre téléphone, et par email. Voici comment réguler ce que vous recevez.",
    sections: [
      {
        title: "Régler mes préférences",
        body: "Chaque type d'événement (likes, messages, annonces, badges…) peut être activé ou désactivé individuellement. Vous ne recevez que ce qui vous intéresse.",
        steps: [
          "Allez dans « Mon profil » › « Notifications ».",
          "Parcourez les catégories (social, messagerie, système, digests).",
          "Activez ou désactivez chaque type selon vos préférences.",
          "Vos réglages s'appliquent immédiatement.",
        ],
        callout: { kind: 'tip', title: "Push sur votre téléphone", text: "Pour recevoir les notifications sur votre téléphone, autorisez les notifications quand eza vous le demande — puis installez l'app pour un rendu natif." },
      },
      {
        title: "Les trois canaux",
        body: "eza utilise trois façons de vous prévenir, selon le contexte.",
        table: [
          { k: "Dans l'app", v: "La cloche en haut — visible quand vous naviguez sur eza." },
          { k: 'Push', v: "Sur votre téléphone, même quand l'app est fermée." },
          { k: 'Email', v: "Récapitulatifs et annonces importantes par email." },
        ],
      },
    ],
  },
  {
    slug: 'aide-guide', cat: 'tech', icon: 'LifeBuoy',
    title: "Obtenir de l'aide", tagline: "Documentation, communauté et support Nexus", color: '#ff6d3f',
    intro: "Besoin d'aide ? eza met à votre disposition trois ressources : cette documentation, la communauté (forum & communautés), et le support intelligent Nexus qui répond en direct et peut agir sur votre compte.",
    sections: [
      {
        title: "Par où commencer",
        body: "Avant d'ouvrir un ticket, consultez la documentation et la communauté — votre réponse y est peut-être déjà.",
        bullets: [
          "Documentation : les guides pratiques (ici-même) couvrent l'essentiel.",
          "Communauté : posez votre question sur le forum ou dans une communauté.",
          "Support : ouvrez un ticket si vous avez un problème précis sur votre compte.",
        ],
      },
      {
        title: "Ouvrir un ticket de support",
        body: "Quand vous ouvrez un ticket, Nexus — l'IA de support d'eza — vous répond en direct. Elle ne fait pas que répondre : elle peut exécuter des actions concrètes sur votre compte.",
        steps: [
          "Allez dans « Support » (menu Plus).",
          "Appuyez sur « Ouvrir un ticket ».",
          "Décrivez votre problème le plus précisément possible.",
          "Nexus analyse, propose une solution ou agit (crédits, inscription, dégel…).",
        ],
        callout: { kind: 'tip', title: "Décrivez bien", text: "Plus votre description est précise, plus Nexus est efficace. Mentionnez l'élément concerné (événement, post, portefeuille) et ce que vous attendez." },
      },
      {
        title: "Ce que Nexus peut faire",
        body: "Nexus ne se contente pas de parler — il peut réellement agir sur votre compte, comme un support humain.",
        table: [
          { k: 'Inscriptions', v: "Vous inscrire à un événement et débiter vos crédits." },
          { k: 'Remboursements', v: "Annuler une inscription et rendre les crédits payés." },
          { k: 'Crédits', v: "Créditer un geste commercial ou rembourser un achat en crédits." },
          { k: 'Portefeuilles', v: "Déplacer des crédits entre vos portefeuilles, dégeler un wallet." },
          { k: 'Compteurs', v: "Recalculer les likes/compteurs d'un post si nécessaire." },
        ],
        callout: { kind: 'note', title: "Et si Nexus ne peut pas ?", text: "Pour ce qui dépasse ses capacités (suppression de compte, remboursement carte bancaire, litige), Nexus transmet à un humain qui reprend le dossier sous 24-48h." },
      },
    ],
  },
];