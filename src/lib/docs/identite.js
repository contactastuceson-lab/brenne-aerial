// Documentation EZA — catégorie Identité & confiance.
// Contenu 100% utilisateur : aucun jargon technique, pas de nom d'entité ni de fonction.

export const identiteTopics = [
  {
    slug: 'profile', cat: 'identite', icon: 'User',
    title: "Mon profil", tagline: "Compte, identité, personnalisation", color: '#a78bfa',
    intro: "Votre profil est votre identité publique sur eza. Il affiche vos publications, votre portfolio, vos badges, vos affiliations et vos statistiques. Accessible via eza.group/@votrePseudo, c'est la vitrine de chaque membre de la communauté.",
    sections: [
      {
        title: "Le profil public",
        body: "Votre profil est visible par tout le monde, connecté ou non — comme sur TikTok ou Instagram. On y voit votre photo, votre couverture, votre bio, vos badges de vérification, vos affiliations et vos publications.",
        bullets: [
          "Votre profil est à eza.group/@votrePseudo.",
          "Photo, couverture, bio et badges visibles par tous.",
          "Vos publications, épinglées en premier.",
          "Vos statistiques : abonnés, abonnements, publications.",
          "Lien vers votre portfolio si vous en avez un.",
        ],
      },
      {
        title: "Mon @username",
        body: "Votre @username est unique et vous identifie partout. Choisissez-le avec soin : il sert pour les mentions (@pseudo) et le lien de votre profil public. Un username pris n'est plus disponible.",
        callout: { kind: 'warning', title: "Choisi pour la vie", text: "Après une suppression de compte, l'ancien @username est gardé en réserve pour empêcher qu'un nouveau compte ne prenne le même nom et usurpe votre identité." },
      },
      {
        title: "Personnaliser mon profil",
        body: "Vous personnalisez votre profil dans les paramètres : thème (clair, sombre ou automatique), mode compact pour gagner en densité, bio, localisation, site web et préférences de notification. Vos réglages vous suivent sur tous vos appareils.",
        bullets: [
          "Thème clair, sombre ou automatique.",
          "Mode compact pour plus de densité.",
          "Bio, localisation, site web.",
          "Préférences de notification.",
          "Vos réglages s'appliquent sur tous vos appareils.",
        ],
        callout: { kind: 'tip', title: "Un profil complet rassure", text: "Une photo claire, une bio précise et un site web donnent confiance. Un profil complet est plus facile à trouver et plus crédible." },
      },
      {
        title: "Les badges de vérification",
        body: "Plusieurs types de badges existent, affichés sur votre profil et vos publications. Ils signalent que votre identité ou votre statut a été vérifié par eza.",
        table: [
          { k: 'Vérifié', v: "Votre identité est vérifiée." },
          { k: 'Pro', v: "Votre statut professionnel est confirmé." },
          { k: 'Certifié', v: "Vous avez passé la certification eza." },
          { k: 'Officiel', v: "Compte officiel (équipe eza ou organisation)." },
        ],
      },
    ],
  },
  {
    slug: 'certifications', cat: 'identite', icon: 'Award',
    title: "Les certifications", tagline: "Obtenir un badge de vérification", color: '#f59e0b',
    intro: "Les certifications permettent d'obtenir un badge de vérification officiel. Le processus combine un questionnaire, un paiement sécurisé et une revue par l'équipe eza. Une fois approuvé, le badge apparaît sur votre profil et toutes vos publications.",
    sections: [
      {
        title: "Demander une certification",
        body: "Vous soumettez une demande avec un questionnaire et des preuves, vous réglez les frais (paiement sécurisé), puis l'équipe eza examine votre demande. En cas d'approbation, le badge est ajouté à votre profil.",
        steps: [
          "Ouvrez « Certifications » depuis votre profil.",
          "Remplissez le questionnaire et joignez vos preuves.",
          "Réglez les frais (paiement sécurisé en ligne).",
          "L'équipe eza examine votre demande.",
          "Si approuvée, votre badge apparaît sur votre profil.",
        ],
        callout: { kind: 'tip', title: "Paiement sécurisé", text: "Le paiement des frais de certification se fait en ligne de façon sécurisée. eza ne stocke jamais vos données de carte." },
      },
      {
        title: "Les types de badges",
        body: "Chaque badge a un sens précis. Ils sont affichés sur votre profil, vos publications, vos stories et vos Spaces.",
        table: [
          { k: 'Vérifié', v: "Votre identité est vérifiée (preuve d'identité)." },
          { k: 'Pro', v: "Votre activité professionnelle est confirmée." },
          { k: 'Certifié', v: "Vous avez passé la certification eza." },
          { k: 'Officiel', v: "Compte officiel (équipe eza / organisation vérifiée)." },
        ],
        callout: { kind: 'note', title: "Un signal de confiance", text: "Un badge de certification n'est pas cosmétique : il signale que votre identité ou votre statut a été vérifié par eza. C'est un gage de confiance pour les clients et la communauté." },
      },
      {
        title: "Suivre ma demande",
        body: "Vous suivez l'avancement de votre demande en temps réel. En cas de refus, un remboursement est possible. Vous gardez l'historique de toutes vos demandes.",
        bullets: [
          "Statut en temps réel de votre demande.",
          "Page de confirmation une fois approuvée.",
          "Remboursement possible en cas de refus.",
          "Historique complet de vos demandes.",
        ],
      },
    ],
  },
  {
    slug: 'affiliations', cat: 'identite', icon: 'Network',
    title: "Les affiliations", tagline: "Représenter une organisation", color: '#38aadc',
    intro: "Les affiliations vous rattachent à des organisations. Une fois affilié, le logo de l'organisation apparaît sur votre profil. C'est l'équivalent d'un badge d'emploi vérifié, nativement intégré.",
    sections: [
      {
        title: "Comment ça marche",
        body: "Une affiliation relie un utilisateur à une organisation. Une fois approuvée, le logo et le nom de l'organisation s'affichent sur votre profil. Vous pouvez représenter plusieurs organisations, et une organisation peut avoir plusieurs affiliés.",
        bullets: [
          "Une affiliation = un rattachement à une organisation.",
          "Le logo de l'organisation apparaît sur votre profil.",
          "Vous pouvez représenter plusieurs organisations.",
          "Une organisation peut avoir plusieurs affiliés.",
        ],
        callout: { kind: 'tip', title: "Un signal de confiance", text: "Une affiliation approuvée prouve que vous représentez officiellement une organisation. C'est un signal de confiance vérifiable par tout le monde." },
      },
      {
        title: "Le workflow d'affiliation",
        body: "Une demande d'affiliation est soumise, puis validée par l'organisation. Une fois approuvée, les deux parties sont notifiées et le badge apparaît sur le profil.",
        steps: [
          "Une demande d'affiliation est soumise.",
          "L'organisation (ou l'admin) l'examine.",
          "À l'approbation, le logo apparaît sur le profil.",
          "Les deux parties sont notifiées.",
        ],
      },
      {
        title: "Retirer une affiliation",
        body: "Une affiliation peut être retirée — par vous, par l'organisation ou par l'admin dans les cas litigieux. Une demande de retrait peut aussi être soumise pour les cas sensibles.",
        callout: { kind: 'note', title: "Écosystème visible", text: "Les affiliations créent un écosystème visible : on voit d'un coup d'œil quelles organisations vous représentez. C'est un réseau de confiance lisible." },
      },
    ],
  },
  {
    slug: 'enor', cat: 'identite', icon: 'Crown',
    title: "Enor & l'écosystème", tagline: "Le PDG, l'histoire, la vision", color: '#f59e0b',
    intro: "Enor est l'identité fondatrice et le PDG d'eza. Sa biographie, sa vision pour la plateforme et l'écosystème EZA Group sont présentés sur des pages dédiées, accessibles publiquement. C'est la vitrine narrative d'eza.",
    sections: [
      {
        title: "La biographie d'Enor",
        body: "La page Enor présente le parcours et la vision du PDG d'eza. C'est la vitrine narrative — qui est le fondateur, quelle est l'histoire, où va la plateforme.",
        bullets: [
          "Page dédiée accessible publiquement.",
          "Récit fondateur et vision stratégique.",
          "Liens vers l'écosystème EZA Group.",
        ],
      },
      {
        title: "L'écosystème EZA Group",
        body: "La page Écosystème présente les entités et marques du groupe EZA, et la façon dont elles interagissent autour de la plateforme. Toutes les initiatives convergent vers eza.",
        callout: { kind: 'note', title: "Une seule marque", text: "EZA Group regroupe toutes les initiatives sous une marque unique, pilotée par Enor et l'IA Nexus. Tout converge vers la plateforme eza." },
      },
    ],
  },
  {
    slug: 'support', cat: 'identite', icon: 'LifeBuoy',
    title: "Le support Nexus", tagline: "Une IA qui répond et qui agit", color: '#38aadc',
    intro: "Le support est piloté par Nexus, l'IA d'eza. Quand vous ouvrez un ticket, Nexus lit votre compte avant de répondre, vous répond de façon claire et structurée, et peut exécuter des actions concrètes (inscriptions, crédits, remboursements). L'escalade vers un humain est réservée aux cas critiques.",
    sections: [
      {
        title: "Ouvrir un ticket",
        body: "Vous décrivez votre problème, éventuellement avec des pièces jointes. Nexus analyse votre description, détecte l'élément concerné et propose une solution ou agit directement.",
        steps: [
          "Ouvrez « Support » depuis le menu.",
          "Appuyez sur « Ouvrir un ticket ».",
          "Décrivez votre problème le plus précisément possible.",
          "Nexus analyse et répond, ou agit sur votre compte.",
        ],
        callout: { kind: 'tip', title: "Décrivez bien", text: "Plus votre description est précise, plus Nexus est efficace. Mentionnez l'élément concerné (événement, post, portefeuille) et ce que vous attendez." },
      },
      {
        title: "Ce que Nexus peut faire",
        body: "Nexus ne se contente pas de répondre — il peut réellement agir sur votre compte, comme un support humain.",
        table: [
          { k: 'Inscriptions', v: "Vous inscrire à un événement et débiter vos crédits." },
          { k: 'Annulations', v: "Annuler une inscription et rendre les crédits payés." },
          { k: 'Crédits', v: "Créditer un geste commercial ou rembourser un achat." },
          { k: 'Transferts', v: "Déplacer des crédits entre vos portefeuilles." },
          { k: 'Dégel', v: "Dégeler un portefeuille vérifié (situation confirmée)." },
          { k: 'Compteurs', v: "Recalculer les likes/compteurs d'un post si besoin." },
        ],
        callout: { kind: 'note', title: "Agent, pas chatbot", text: "Nexus lit votre compte, vérifie votre solde, vos inscriptions et vos posts avant de répondre. C'est un agent qui peut exécuter des actions réelles, pas un simple chatbot." },
      },
      {
        title: "Quand Nexus transmet à un humain",
        body: "Nexus transmet à un humain uniquement pour les cas critiques réels : sécurité (compte piraté, harcèlement), remboursement bancaire par carte (pas les crédits), bug bloquant confirmé, suppression de compte, ou litige. Un simple « ça ne marche pas » vague reste en dépannage.",
        bullets: [
          "Sécurité : compte piraté, harcèlement.",
          "Remboursement bancaire par carte (pas les crédits Eza).",
          "Suppression de compte (RGPD).",
          "Litige ou fraude.",
          "Un humain reprend le dossier sous 24-48h.",
        ],
        callout: { kind: 'info', title: "Pas d'escalade par précaution", text: "Nexus ne transmet pas « au cas où ». Un problème vague reste en dépannage. L'escalade est réservée aux cas critiques réels." },
      },
      {
        title: "Mes conversations de support",
        body: "Vous retrouvez tous vos tickets dans « Support » : un tableau de bord avec vos tickets ouverts et résolus, et chaque ticket ouvre une conversation avec Nexus où vous voyez ses étapes de recherche et ses réponses.",
        bullets: [
          "Tableau de bord de vos tickets.",
          "Conversation en direct avec Nexus.",
          "Étapes de recherche affichées en temps réel.",
          "Cartes d'action pour les opérations sensibles (Oui/Non).",
        ],
      },
    ],
  },
];