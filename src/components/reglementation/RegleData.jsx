export const CATEGORIES = [
  {
    id: 'ouverte',
    label: 'Catégorie OUVERTE (Open)',
    emoji: '🟢',
    color: '#22c55e',
    bg: 'rgba(34,197,94,0.08)',
    border: 'rgba(34,197,94,0.3)',
    risk: 'Risque faible',
    desc: 'Loisirs et professionnels à faible risque — vol en vue directe (VLOS), hors zones restreintes. Aucune autorisation préalable si règles respectées.',
    details: [
      'Drone doit rester à vue directe du pilote (VLOS), sans aide optique',
      'Altitude maximale : 120 m au-dessus du sol (ou du point de décollage le plus haut)',
      'Interdit au-dessus des rassemblements de personnes (quelle que soit la sous-catégorie)',
      'Interdiction de vol de nuit sauf autorisation spéciale',
      'Signalement électronique obligatoire pour tout drone ≥ 250 g',
    ],
    subcats: [
      {
        name: 'A1 — Vol au-dessus des personnes',
        drones: 'Classe C0 (< 250 g) · Classe C1 (250–900 g)',
        survol: 'C0 : survol de personnes toléré · C1 : survol accidentel et transitoire autorisé (≤ 400 g)',
        altitude: '120 m max',
        formation: 'C0 : recommandée (non obligatoire) · C1 : examen en ligne A1/A3 obligatoire (40 questions, 75%)',
        note: 'Interdiction formelle de survol de rassemblements même en A1.',
      },
      {
        name: 'A2 — Vol à proximité des personnes',
        drones: 'Classe C2 (900 g – 4 kg)',
        survol: 'Survol de personnes interdit · Distance min : 5 m en mode basse vitesse · 30 m sinon',
        altitude: '120 m max',
        formation: 'Examen A1/A3 + examen complémentaire OPEN A2 (30 questions, 75%) + formation pratique auto-certifiée',
        note: 'Mode "basse vitesse" obligatoire activé via le drone.',
      },
      {
        name: 'A3 — Vol loin des personnes',
        drones: 'Classe C2, C3, C4 · Anciens drones > 250 g sans classe CE',
        survol: 'Survol de personnes strictement interdit · Distance min : 150 m de toute zone résidentielle, commerciale, industrielle',
        altitude: '120 m max',
        formation: 'Examen A1/A3 obligatoire (40 questions, 75%)',
        note: 'Les anciens drones professionnels (DJI Phantom, Mavic 2, etc.) sont limités à A3 en 2026.',
      },
    ],
  },
  {
    id: 'specifique',
    label: 'Catégorie SPÉCIFIQUE (Specific)',
    emoji: '🟡',
    color: '#f59e0b',
    bg: 'rgba(245,158,11,0.08)',
    border: 'rgba(245,158,11,0.3)',
    risk: 'Risque modéré',
    desc: 'Opérations professionnelles hors catégorie Ouverte — déclaration ou autorisation DSAC requise. Couvre la majorité des missions professionnelles.',
    details: [
      "Nécessite une déclaration d'exploitation ou une autorisation spécifique (PDRA/SORA)",
      "Depuis le 1er janvier 2026 : scénarios nationaux S1, S2, S3 supprimés → STS-01 et STS-02 s'appliquent",
      'Drone doit être certifié classe C5 (STS-01) ou C6 (STS-02)',
      'Télépilote doit être titulaire du certificat CATS (A pour STS-01, B pour STS-02)',
      'Couverture assurance RC professionnelle obligatoire',
    ],
    subcats: [
      {
        name: 'STS-01 — Vol en vue en zone urbaine',
        drones: 'Classe C5 obligatoire',
        survol: 'VLOS en zone peuplée · Zone au sol contrôlée · Distance de sécurité maintenue',
        altitude: '120 m max',
        formation: 'CATS certificat de compétences A · Examen théorique + évaluation pratique · Reconnu UE',
        note: 'Typique : captation événementielle urbaine, inspection en zone peuplée, chantier urbain.',
      },
      {
        name: 'STS-02 — Vol hors vue en zone peu peuplée',
        drones: 'Classe C6 obligatoire',
        survol: 'BVLOS avec observateurs · Zone faible densité de population · Hauteur ≤ 120 m',
        altitude: '120 m max',
        formation: 'CATS certificat de compétences B · Examen théorique renforcé + évaluation terrain · Reconnu UE',
        note: 'Typique : inspection longue distance (lignes électriques, pipelines), surveillance agricole étendue.',
      },
      {
        name: 'PDRA / Autorisation SORA',
        drones: 'Tout drone selon analyse risque',
        survol: 'Toute opération complexe non couverte par STS · Analyse SORA obligatoire · Autorisation DSAC',
        altitude: 'Variable selon autorisation préfectorale',
        formation: 'Dossier SORA complet + autorisation DSAC + télépilote certifié',
        note: 'Pour opérations atypiques : vols de nuit, opérations industrielles sensibles, zones complexes.',
      },
    ],
  },
  {
    id: 'certifiee',
    label: 'Catégorie CERTIFIÉE (Certified)',
    emoji: '🟣',
    color: '#8b5cf6',
    bg: 'rgba(139,92,246,0.08)',
    border: 'rgba(139,92,246,0.3)',
    risk: 'Risque élevé',
    desc: "Opérations à haut risque nécessitant la certification complète du drone et de l'opérateur par l'AESA (EASA). Cas rares et très réglementés.",
    details: [
      "Drone certifié par l'AESA (Agence de l'Aviation Européenne)",
      "Opérateur certifié et audité par l'autorité nationale compétente (DSAC en France)",
      'Équivalent de la certification aéronef pour les drones',
      'Applicable au transport de passagers, fret dangereux, vols au-dessus de rassemblements importants',
    ],
    subcats: [
      {
        name: 'Certifiée — Risque très élevé',
        drones: 'Drones certifiés EASA (équivalent aéronef)',
        survol: 'Survol de rassemblements à grande échelle · Transport de personnes · Marchandises dangereuses',
        altitude: 'Variable selon autorisation',
        formation: 'Certification EASA complète — organisme agréé · Analogie avec brevet de pilote aéronef',
        note: 'Réservé aux opérateurs spécialisés. Non applicable aux drones grand public.',
      },
    ],
  },
];

export const CLASSES_CE = [
  { classe: 'C0', masse: '< 250 g', cat: 'A1', usages: 'Photographie légère, mini-drones, FPV racing', sts: false, color: '#22c55e', note: 'Enregistrement requis si caméra · Pas de formation obligatoire' },
  { classe: 'C1', masse: '250 – 900 g', cat: 'A1', usages: 'DJI Mini 3, Mini 4 Pro, drones caméra compacts', sts: false, color: '#22c55e', note: 'Enregistrement · Formation A1/A3 · Identif. électronique' },
  { classe: 'C2', masse: '900 g – 4 kg', cat: 'A2/A3', usages: 'DJI Air 3, Autel EVO, drones semi-pro', sts: false, color: '#f59e0b', note: 'Enregistrement · Formation A1/A3 + A2 · Mode basse vitesse requis' },
  { classe: 'C3', masse: '4 – 25 kg', cat: 'A3', usages: 'Drones cinéma lourds, charges utiles', sts: false, color: '#ef4444', note: 'Enregistrement · Formation A1/A3 · Identif. électronique obligatoire' },
  { classe: 'C4', masse: '4 – 25 kg', cat: 'A3', usages: 'Drones pro ancienne génération (sans module ID)', sts: false, color: '#ef4444', note: 'Enregistrement · Formation A1/A3 · Sans identif. directe à distance' },
  { classe: 'C5', masse: 'Variable', cat: 'STS-01', usages: 'Opérations urbaines professionnelles certifiées', sts: true, color: '#f59e0b', note: 'Arrêt d\'urgence indépendant · Mode vitesse réduite · Scénario urbain certifié' },
  { classe: 'C6', masse: 'Variable', cat: 'STS-02', usages: 'Inspection longue distance, BVLOS pro', sts: true, color: '#f59e0b', note: 'Vol hors vue (BVLOS) autorisé · Observateurs terrain requis · Zone faible densité' },
];

export const TIMELINE = [
  { year: '2019', label: 'Règlement UE 2019/947', desc: 'Publication du cadre réglementaire européen commun UAS par l\'AESA. Instauration des 3 catégories (Ouverte, Spécifique, Certifiée).', status: 'done' },
  { year: '2021', label: 'Entrée en vigueur EASA', desc: 'Application progressive dans les États membres. Lancement d\'AlphaTango en France. Coexistence avec anciens scénarios nationaux S1/S2/S3.', status: 'done' },
  { year: '2024', label: 'Remote ID EU obligatoire', desc: 'Signalement électronique européen rendu obligatoire en catégorie Spécifique STS. Classes C5 et C6 définies dans le règlement délégué EU 2019/945.', status: 'done' },
  { year: '1er jan. 2026', label: 'Suppression S1, S2, S3', desc: 'Fin définitive des scénarios nationaux français. Bascule obligatoire vers STS-01/STS-02 ou PDRA/SORA. Invalidation des BAPD par déclaration.', status: 'current' },
  { year: '2027+', label: 'Harmonisation totale EU', desc: 'Déploiement complet des infrastructures U-Space. Gestion automatisée de l\'espace aérien basse altitude. Intégration des UTM (UAS Traffic Management).', status: 'upcoming' },
];

export const OBLIGATIONS_TELEPILOTE = [
  {
    icon: 'FileText',
    title: 'Enregistrement sur AlphaTango',
    desc: 'Obligatoire pour tout drone ≥ 250 g OU équipé d\'une caméra (classe C0). Numéro FRA + 13 caractères à apposer physiquement sur le drone. Renouvellement annuel.',
    lien: 'https://alphatango.aviation-civile.gouv.fr',
    tag: 'Obligatoire',
    tagColor: '#ef4444',
  },
  {
    icon: 'BookOpen',
    title: 'Formation & examen en ligne A1/A3',
    desc: 'Gratuit sur AlphaTango · 40 questions · 75% de bonnes réponses · Attestation valable 5 ans · Reconnue dans tous les États membres UE. Amende 450 € en cas de vol sans attestation.',
    lien: 'https://formation-telepilote.aviation-civile.gouv.fr',
    tag: 'Si drone ≥ 250 g',
    tagColor: '#f59e0b',
  },
  {
    icon: 'Award',
    title: 'Examen complémentaire A2 (si nécessaire)',
    desc: '30 questions sur table · 75% requis · Formation pratique auto-certifiée · Nécessaire pour exploiter un drone C2 en sous-catégorie A2 (survol à proximité des personnes).',
    tag: 'Drone C2 en A2',
    tagColor: '#f59e0b',
  },
  {
    icon: 'Shield',
    title: 'Certificat CATS (Spécifique STS)',
    desc: 'CATS A pour STS-01 (VLOS urbain) · CATS B pour STS-02 (BVLOS) · Examen théorique renforcé + évaluation pratique terrain · Valable dans toute l\'UE · Délivré par organisme agréé DSAC.',
    tag: 'Cat. Spécifique',
    tagColor: '#8b5cf6',
  },
  {
    icon: 'Radio',
    title: 'Signalement électronique (Remote ID)',
    desc: 'Obligatoire pour tout drone ≥ 250 g. Signalement FR (> 800 g) + signalement EU (STS). Identification à distance par les autorités. Module physique ou logiciel selon le drone.',
    tag: 'Obligatoire',
    tagColor: '#ef4444',
  },
  {
    icon: 'Insurance',
    title: 'Assurance RC professionnelle',
    desc: 'Obligatoire pour toute activité professionnelle rémunérée. Couvre la responsabilité civile pour dommages matériels et corporels aux tiers. Attestation à présenter sur demande.',
    tag: 'Professionnel',
    tagColor: '#3b82f6',
  },
  {
    icon: 'ClipboardCheck',
    title: 'Vérifications pré-vol',
    desc: 'Consultation Géoportail Drones (zones R, D, P, CTR) · Vérification météo (vent < 12 m/s, visibilité ≥ 5 km) · État de la batterie · Calibration compas · Espace mémoire disponible.',
    tag: 'Avant chaque vol',
    tagColor: '#22c55e',
  },
  {
    icon: 'FileCheck',
    title: 'Documentation de mission',
    desc: 'Journal de vol (télépilote, drone, lieu, durée) · Copie de l\'attestation de formation · Numéro d\'enregistrement AlphaTango · En catégorie Spécifique : déclaration DSAC + copie autorisation.',
    tag: 'Obligatoire',
    tagColor: '#ef4444',
  },
  {
    icon: 'Clock',
    title: 'Âge minimum légal',
    desc: '14 ans minimum pour piloter un drone de façon autonome. Sans condition d\'âge pour les drones C0 (jouets) ou si accompagné d\'un télépilote certifié ≥ 16 ans.',
    tag: 'Tous drones',
    tagColor: '#6b7280',
  },
];

export const SECURITE = [
  {
    icon: 'AlertTriangle',
    title: 'Analyse des risques SORA',
    desc: 'Pour les opérations en catégorie Spécifique hors STS, une analyse SORA (Specific Operation Risk Assessment) complète est requise. Elle évalue les risques au sol (GRC) et dans les airs (ARC) pour définir les mesures d\'atténuation.',
    color: '#f59e0b',
  },
  {
    icon: 'MapPin',
    title: 'Vérification de l\'espace aérien',
    desc: 'Consultation obligatoire de Géoportail Drones avant chaque vol. Vérification des zones temporaires (NOTAM), zones de danger, espaces aéroportuaires (CTR 5 km). Application SkyDemon ou AIP France recommandées.',
    color: '#3b82f6',
  },
  {
    icon: 'Cloud',
    title: 'Conditions météorologiques',
    desc: 'Vent max recommandé : 12 m/s (Beaufort 6). Visibilité minimale : 5 km (catégorie Ouverte). Interdiction de vol dans les nuages. Éviter les orages, grêle, givre. Consultation Météo-France avant chaque mission.',
    color: '#06b6d4',
  },
  {
    icon: 'Eye',
    title: 'Respect de la vie privée',
    desc: 'Interdiction de filmer l\'intérieur des propriétés privées sans autorisation. Toute captation de personnes identifiables nécessite leur consentement explicite (art. 226-1 du Code pénal). Pas de survol de jardins privés à basse altitude.',
    color: '#8b5cf6',
  },
  {
    icon: 'Camera',
    title: 'Droit à l\'image',
    desc: 'Toute personne identifiable sur une image dispose d\'un droit à l\'image protégé. Les images aériennes de manifestations, événements publics ou propriétés privées doivent respecter ce droit. Diffusion commerciale = accord écrit obligatoire.',
    color: '#ec4899',
  },
  {
    icon: 'Database',
    title: 'Protection des données (RGPD)',
    desc: 'Les images de drones impliquant des personnes identifiables constituent des données personnelles au sens du RGPD (UE 2016/679). Obligation de finalité, minimisation des données, durée de conservation limitée, et droit d\'accès/suppression.',
    color: '#ef4444',
  },
];

export const ENGAGEMENT_BRENNE = [
  { icon: 'Shield', text: 'Titulaire des certifications DGAC/EASA à jour (formations A1/A3, CATS, STS)' },
  { icon: 'CheckCircle', text: 'Vérification systématique des zones de vol sur Géoportail Drones avant chaque mission' },
  { icon: 'FileText', text: 'Gestion complète des protocoles administratifs (communes, préfectures, aérodromes)' },
  { icon: 'Shield2', text: 'Assurance RC professionnelle couvrant chaque intervention — attestation disponible sur demande' },
  { icon: 'Users', text: 'Respect du consentement des personnes filmées et des droits à l\'image' },
  { icon: 'Database', text: 'Traitement des données conforme au RGPD — fichiers supprimés après livraison client' },
  { icon: 'Cloud', text: 'Vols conditionnés à des conditions météo sûres — report systématique si nécessaire' },
  { icon: 'Plane', text: 'Drones équipés Remote ID EU conformes EASA pour toutes les opérations Spécifiques' },
  { icon: 'BookOpen', text: 'Documentation complète de mission : journal de vol, zones survolées, fichiers d\'enregistrement' },
  { icon: 'Leaf', text: 'Engagement environnemental : minimisation des zones de dérangement de la faune et flore' },
];

export const FAQ_EXTENDED = [
  {
    q: 'Peut-on voler au-dessus d\'une ville ou d\'un village ?',
    a: 'Voler au-dessus d\'une agglomération est interdit en catégorie Ouverte (sous-catégorie A3) qui exige une distance de 150 m des zones résidentielles. Pour opérer légalement en milieu urbain, il faut passer en catégorie Spécifique avec un drone classe C5 et le scénario STS-01. Brenne Aerial est qualifié pour ces opérations après déclaration DSAC.',
  },
  {
    q: 'Faut-il une autorisation de la mairie pour voler ?',
    a: 'Une autorisation de la mairie n\'est pas systématiquement obligatoire mais fortement recommandée, notamment pour voler dans un espace public ou à proximité de bâtiments communaux. En catégorie Spécifique (STS-01), un protocole ou une information préalable à la commune concernée est généralement requis. Brenne Aerial gère ces démarches pour ses clients.',
  },
  {
    q: 'Quelle est la hauteur maximale de vol autorisée ?',
    a: 'En catégorie Ouverte, la hauteur maximale est de 120 m au-dessus du sol ou du point de décollage le plus haut dans un rayon de 50 m. Des dérogations jusqu\'à 150 m sont possibles à proximité de structures artificielles (pylônes, antennes) avec autorisation du gestionnaire. En catégorie Spécifique STS, la limite reste également à 120 m sauf autorisation préfectorale spécifique.',
  },
  {
    q: 'Peut-on filmer des particuliers ou des propriétés privées ?',
    a: 'Non, sans leur consentement explicite. Filmer l\'intérieur d\'une propriété privée ou une personne identifiable sans autorisation constitue une violation du droit à l\'image (art. 226-1 Code pénal) et du RGPD. Brenne Aerial obtient systématiquement les accords nécessaires et évite toute captation de données personnelles non consenties.',
  },
  {
    q: 'Les drones de Brenne Aerial sont-ils assurés ?',
    a: 'Oui. Chaque prestation de Brenne Aerial est couverte par une assurance Responsabilité Civile Professionnelle spécifique aux opérations de drones. Cette assurance couvre les dommages matériels et corporels causés aux tiers. L\'attestation d\'assurance est disponible sur demande avant chaque mission.',
  },
  {
    q: 'Qui est responsable en cas d\'incident ou d\'accident ?',
    a: 'La responsabilité incombe en premier lieu au télépilote (et à son employeur si activité professionnelle), conformément à la réglementation aéronautique française. En cas de dommage à un tiers, l\'assurance RC Pro prend en charge les indemnisations. Brenne Aerial applique des procédures de sécurité rigoureuses pour minimiser tout risque.',
  },
  {
    q: 'Quelles sont les formations obligatoires pour un télépilote professionnel ?',
    a: 'Pour la catégorie Ouverte : examen en ligne A1/A3 (40 questions, 75%, gratuit sur AlphaTango). Pour un drone C2 en A2 : examen supplémentaire A2 sur table + formation pratique auto-certifiée. Pour la catégorie Spécifique STS-01/02 : certificat CATS (A ou B) comprenant examen théorique renforcé + évaluation pratique terrain par un organisme agréé DSAC.',
  },
  {
    q: 'Qu\'est-ce que le Remote ID / signalement électronique ?',
    a: 'Le Remote ID (identification électronique à distance) est un dispositif transmettant en temps réel l\'identité du drone, sa position GPS, son altitude et la position du pilote. Il permet aux autorités d\'identifier les drones en vol. Obligatoire pour tout drone ≥ 250 g. En catégorie Spécifique STS, le signalement électronique européen est requis en plus du signalement national français.',
  },
  {
    q: 'Quelle est la différence entre STS-01 et STS-02 ?',
    a: 'STS-01 couvre les vols en vue directe (VLOS) en zone peuplée, avec un drone classe C5. Il est typiquement utilisé pour les captations événementielles urbaines, inspections de bâtiments, ou suivis de chantier en ville. STS-02 autorise les vols hors vue (BVLOS) mais uniquement en zone faiblement peuplée, avec un drone classe C6 et des observateurs terrain. Il est adapté aux inspections longue distance de lignes, pipelines ou zones agricoles étendues.',
  },
  {
    q: 'Peut-on voler la nuit avec un drone ?',
    a: 'Les vols de nuit sont interdits en catégorie Ouverte standard. En catégorie Spécifique, ils nécessitent une dérogation préfectorale (à déposer 30 jours minimum avant le vol) et l\'équipement du drone de feux de navigation conformes aux normes EASA. Brenne Aerial est habilité à effectuer ces démarches et dispose d\'équipements lumineux conformes.',
  },
  {
    q: 'Peut-on voler dans ou près d\'un parc national ?',
    a: 'Les parcs nationaux et réserves naturelles sont soumis à des réglementations strictes variant selon les zones. Le survol de certaines zones est interdit (zones cœur) ou soumis à autorisation de la direction du parc ou du préfet. Il est impératif de consulter la réglementation spécifique de chaque parc avant toute opération. Brenne Aerial gère ces autorisations pour vous.',
  },
  {
    q: 'Que risque-t-on à voler sans autorisation ou sans formation ?',
    a: 'Les sanctions peuvent être importantes : amende de 450 € pour vol sans attestation de formation, jusqu\'à 75 000 € d\'amende et 1 an d\'emprisonnement pour mise en danger délibérée d\'autrui (art. L. 6232-4 Code des transports), saisie du drone, et annulation de l\'assurance en cas d\'incident si les règles n\'étaient pas respectées. La DGAC dispose d\'agents assermentés habilités à verbaliser.',
  },
  {
    q: 'Comment vérifier si une zone est autorisée au vol ?',
    a: 'Utilisez la carte interactive Géoportail Drones (geoportail.gouv.fr) mise à disposition par la DGAC. Elle affiche les zones R (restreintes), D (dangereuses), P (interdites), CTR aéroportuaires, et zones à autorisation préfectorale. Les applications SkyDemon, Airmap ou DroneZone peuvent aussi être utilisées. Brenne Aerial effectue systématiquement cette vérification avant chaque mission.',
  },
  {
    q: 'Les anciens drones (DJI Phantom, Mavic 2...) peuvent-ils encore voler en 2026 ?',
    a: 'Oui, mais avec des limitations importantes. Les anciens drones sans marquage CE de classe sont considérés comme des drones "ancienne génération" et sont cantonnés à la sous-catégorie A1 (si < 250 g) ou A3 (si ≥ 250 g, donc à 150 m des zones habitées). Ils ne peuvent plus être utilisés dans les scénarios STS-01 ou STS-02, qui nécessitent des drones certifiés C5 ou C6.',
  },
  {
    q: 'Un particulier peut-il filmer son propre mariage avec un drone ?',
    a: 'Un particulier peut filmer son propre événement en catégorie Ouverte, à condition de respecter les règles (altitude ≤ 120 m, VLOS, distance des aérodromes, pas de survol de tiers non consentants). Pour filmer un mariage en zone urbaine ou à proximité de bâtiments avec une qualité professionnelle, il est fortement recommandé de faire appel à un opérateur certifié comme Brenne Aerial qui gère tous les aspects réglementaires.',
  },
  {
    q: 'Combien de temps faut-il pour obtenir les autorisations nécessaires ?',
    a: 'Les délais varient selon l\'opération : pour une déclaration STS standard (DSAC), le délai est généralement de 5 à 10 jours ouvrés. Pour une dérogation préfectorale (vol de nuit, zone sensible), prévoir minimum 30 jours. Pour une autorisation SORA complexe, le délai peut atteindre 2 à 3 mois. Brenne Aerial anticipe ces délais dans son planning de projet et informe le client dès la phase de devis.',
  },
];

export const ZONES_INTERDITES = [
  { icon: 'Building2', title: 'Agglomérations / centres-villes', desc: 'Vol en espace public interdit sans autorisation (A3 interdite en zone urbaine). STS-01 requis avec drone C5.', color: '#ef4444' },
  { icon: 'Plane', title: 'Zones aéroportuaires (CTR)', desc: 'Rayon de 5 km autour des aérodromes. Consultation géoportail et demande de protocole DSAC/tour de contrôle obligatoires.', color: '#ef4444' },
  { icon: 'Shield', title: 'Installations militaires', desc: 'Zones RTBA, R-/D-. Vol strictement interdit sans autorisation du ministère des Armées. Sanction pénale immédiate.', color: '#ef4444' },
  { icon: 'Zap', title: 'Centrales nucléaires', desc: 'Survol formellement interdit dans un rayon étendu. Poursuite pénale immédiate — saisie du drone garantie.', color: '#ef4444' },
  { icon: 'MapPin', title: 'Parcs nationaux / réserves', desc: 'Autorisation de la direction du parc ou du préfet requise selon la zone. Délai variable (10 à 45 jours).', color: '#f59e0b' },
  { icon: 'Users', title: 'Rassemblements de personnes', desc: 'Jamais autorisé en catégorie Ouverte (toutes sous-catégories). STS-01 requis pour tout événement public.', color: '#ef4444' },
  { icon: 'Lock', title: 'Prisons et palais de justice', desc: 'Zone interdite de droit. Toute approche non autorisée est considérée comme une tentative d\'évasion facilitée.', color: '#ef4444' },
  { icon: 'Radio', title: 'Zones de signalement actives (NOTAM)', desc: 'NOTAM temporaires publiés par la DGAC (exercices militaires, incendies, événements). Vérification obligatoire avant vol.', color: '#f59e0b' },
  { icon: 'Eye', title: 'Propriétés privées sans autorisation', desc: 'Survol de jardins privés à basse altitude est légalement discutable. Accord écrit du propriétaire vivement recommandé.', color: '#f59e0b' },
];