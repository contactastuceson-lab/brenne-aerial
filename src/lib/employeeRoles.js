export const POLES = {
  direction: {
    label: 'Direction & Gouvernance',
    emoji: '🛡️',
    color: 'text-purple-400',
    bg: 'bg-purple-400/10',
    border: 'border-purple-400/30',
  },
  operations: {
    label: 'Opérations & Flotte',
    emoji: '✈️',
    color: 'text-primary',
    bg: 'bg-primary/10',
    border: 'border-primary/30',
  },
  technique: {
    label: 'Technique & Data',
    emoji: '🔬',
    color: 'text-cyan-400',
    bg: 'bg-cyan-400/10',
    border: 'border-cyan-400/30',
  },
  securite: {
    label: 'Sécurité, Qualité & Légal',
    emoji: '⚖️',
    color: 'text-green-400',
    bg: 'bg-green-400/10',
    border: 'border-green-400/30',
  },
  commercial: {
    label: 'Commercial & Finances',
    emoji: '💰',
    color: 'text-yellow-400',
    bg: 'bg-yellow-400/10',
    border: 'border-yellow-400/30',
  },
  marketing: {
    label: 'Marketing & Communication',
    emoji: '📣',
    color: 'text-pink-400',
    bg: 'bg-pink-400/10',
    border: 'border-pink-400/30',
  },
  maintenance: {
    label: 'Maintenance & Logistique',
    emoji: '🛠️',
    color: 'text-orange-400',
    bg: 'bg-orange-400/10',
    border: 'border-orange-400/30',
  },
  surete: {
    label: 'Sûreté & Gestion des Risques',
    emoji: '🚨',
    color: 'text-red-400',
    bg: 'bg-red-400/10',
    border: 'border-red-400/30',
  },
  data_ia: {
    label: 'Data Science & Intelligence Artificielle',
    emoji: '🤖',
    color: 'text-violet-400',
    bg: 'bg-violet-400/10',
    border: 'border-violet-400/30',
  },
  rh: {
    label: 'Support & Ressources Humaines',
    emoji: '🤝',
    color: 'text-teal-400',
    bg: 'bg-teal-400/10',
    border: 'border-teal-400/30',
  },
  relation_client: {
    label: 'Relation Client & Succès',
    emoji: '📞',
    color: 'text-lime-400',
    bg: 'bg-lime-400/10',
    border: 'border-lime-400/30',
  },
  creatif: {
    label: 'Créatif & Spécialistes',
    emoji: '🎭',
    color: 'text-fuchsia-400',
    bg: 'bg-fuchsia-400/10',
    border: 'border-fuchsia-400/30',
  },
};

export const JOB_ROLES = {
  // Direction
  secretaire_general: { label: 'Secrétaire Général', pole: 'direction', desc: 'Organise les réunions du CA, gère les statuts et archives légales.' },
  admin_independant: { label: 'Administrateur Indépendant', pole: 'direction', desc: 'Membre du CA sans rôle exécutif, accès lecture seule pour auditer la stratégie.' },
  directeur_strategie: { label: 'Directeur de la Stratégie (CSO)', pole: 'direction', desc: 'Analyse la concurrence et planifie l\'expansion de Brenne Aerial.' },

  // Opérations
  directeur_operations: { label: 'Directeur des Opérations (COO)', pole: 'operations', desc: 'Supervise tout le département terrain et valide les déploiements complexes.' },
  fleet_manager: { label: 'Responsable de Flotte (Fleet Manager)', pole: 'operations', desc: 'Gère l\'inventaire, l\'achat des machines et l\'état d\'usure.' },
  chef_pilote: { label: 'Chef Pilote', pole: 'operations', desc: 'Responsable de la formation des pilotes et validation des compétences.' },
  pilote_senior_s1: { label: 'Pilote Senior S1', pole: 'operations', desc: 'Missions complexes en zone urbaine ou hors vue — niveau S1.' },
  pilote_senior_s2: { label: 'Pilote Senior S2', pole: 'operations', desc: 'Missions complexes en zone urbaine ou hors vue — niveau S2.' },
  pilote_senior_s3: { label: 'Pilote Senior S3', pole: 'operations', desc: 'Missions complexes en zone urbaine ou hors vue — niveau S3.' },
  pilote_junior: { label: 'Pilote Junior', pole: 'operations', desc: 'Missions simples (S1 - Campagne) sous supervision.' },

  // Technique
  directeur_technique: { label: 'Directeur Technique (CTO)', pole: 'technique', desc: 'Responsable de l\'infrastructure logicielle et du panel admin.' },
  data_analyst: { label: 'Data Analyst / Géomaticien', pole: 'technique', desc: 'Traite les données de photogrammétrie et de cartographie (SIG).' },
  expert_thermographe: { label: 'Expert Thermographe', pole: 'technique', desc: 'Analyse les données infrarouges pour l\'industrie et le bâtiment.' },
  monteur_video: { label: 'Monteur Vidéo / Étalonneur', pole: 'technique', desc: 'Post-production artistique pour prestations cinéma et mariage.' },

  // Sécurité
  responsable_conformite: { label: 'Responsable Conformité & Réglementation', pole: 'securite', desc: 'Gère les relations avec la DGAC et les demandes de protocoles.' },
  officier_securite: { label: 'Officier de Sécurité Aérienne', pole: 'securite', desc: 'Analyse les risques et rédige les MANEX.' },
  responsable_qualite: { label: 'Responsable Qualité (QHSÉ)', pole: 'securite', desc: 'S\'assure que les prestations respectent les normes ISO.' },

  // Commercial
  directeur_financier: { label: 'Directeur Financier (CFO)', pole: 'commercial', desc: 'Gère la trésorerie, les levées de fonds et les budgets.' },
  controleur_gestion: { label: 'Contrôleur de Gestion', pole: 'commercial', desc: 'Analyse la rentabilité de chaque drone et type de mission.' },
  directeur_commercial: { label: 'Directeur Commercial (Sales Manager)', pole: 'commercial', desc: 'Supervise l\'équipe de vente et fixe les objectifs de CA.' },
  key_account_manager: { label: 'Responsable Grands Comptes (KAM)', pole: 'commercial', desc: 'Gère les relations avec les clients VIP (Industries, État, BTP).' },

  // Marketing
  responsable_marketing: { label: 'Responsable Marketing & Communication', pole: 'marketing', desc: 'Gère l\'image de marque, le site web et les réseaux sociaux.' },

  // Maintenance & Logistique
  ingenieur_mco: { label: 'Ingénieur Maintenance (MCO)', pole: 'maintenance', desc: 'Répare les drones crashés, change les moteurs et calibre les capteurs.' },
  gestionnaire_stock: { label: 'Gestionnaire de Stock & Batteries', pole: 'maintenance', desc: 'Surveille le cycle de vie des Lipos et commande les pièces détachées.' },
  responsable_transport: { label: 'Responsable Transport & Logistique', pole: 'maintenance', desc: 'Gère les véhicules de mission (camions régies) et les déplacements lointains.' },
  technicien_reseau: { label: 'Technicien Réseau & Transmissions', pole: 'maintenance', desc: 'S\'assure que le Retour Temps Réel fonctionne via 4G/5G ou satellite.' },

  // Sûreté & Risques
  analyste_risques: { label: 'Analyste de Risques (SORA/LUC)', pole: 'surete', desc: 'Spécialiste des études de sécurité complexes pour les vols hors-vue (BVLOS).' },
  officier_liaison: { label: 'Officier de Liaison Aéroportuaire', pole: 'surete', desc: 'Contact direct avec les tours de contrôle (VHF) pour les zones sensibles.' },
  responsable_cyber: { label: 'Responsable Cyber-sécurité', pole: 'surete', desc: 'Protège le panel admin et les données sensibles des clients contre le piratage.' },
  auditeur_interne: { label: 'Auditeur Interne', pole: 'surete', desc: 'Vérifie que tout le monde respecte les procédures (checklists) sans tricher.' },

  // Data Science & IA
  ingenieur_ia: { label: 'Ingénieur IA & Computer Vision', pole: 'data_ia', desc: 'Développe des algorithmes pour détecter automatiquement des défauts sur les images.' },
  data_steward: { label: 'Data Steward', pole: 'data_ia', desc: 'Organise le stockage massif de données (plusieurs To de rushs 4K) et le cloud.' },
  cartographe_ortho: { label: 'Cartographe Orthophoto', pole: 'data_ia', desc: 'Spécialiste de l\'assemblage millimétré des milliers de photos de chantiers.' },

  // RH & Support
  directeur_rh: { label: 'Directeur des Ressources Humaines (CHRO)', pole: 'rh', desc: 'Gère les contrats, les paies et le bien-être des équipes.' },
  responsable_formation: { label: 'Responsable Formation & Certification', pole: 'rh', desc: 'Organise le passage des examens drone pour les nouveaux employés.' },
  psychologue_travail: { label: 'Psychologue du Travail', pole: 'rh', desc: 'Gère le stress des pilotes sur des missions critiques ou de longue durée.' },
  responsable_rse: { label: 'Responsable RSE (Environnement)', pole: 'rh', desc: 'Calcule le bilan carbone des missions et gère le recyclage des batteries.' },

  // Relation Client
  customer_success: { label: 'Customer Success Manager (CSM)', pole: 'relation_client', desc: 'S\'assure que le client sait utiliser ses modèles 3D après la livraison.' },
  support_technique: { label: 'Chargé de Support Technique Client', pole: 'relation_client', desc: 'Aide les clients qui n\'arrivent pas à ouvrir leurs fichiers sur le panel.' },
  inside_sales: { label: 'Inside Sales (Prospection)', pole: 'relation_client', desc: 'Chasse les nouveaux contrats par téléphone et LinkedIn.' },

  // Créatif
  directeur_photo: { label: 'Directeur de la Photographie (DoP)', pole: 'creatif', desc: 'Supervise l\'esthétique visuelle sur les tournages cinématographiques.' },
  scenariste: { label: 'Scénariste / Storyboarder', pole: 'creatif', desc: 'Prépare les plans de vol artistiques pour les vidéos d\'entreprise avant le décollage.' },
};

export const ALL_PERMISSIONS = [
  { key: 'view_quotes', label: 'Voir les devis', pole: 'commercial' },
  { key: 'edit_quotes', label: 'Modifier les devis', pole: 'commercial' },
  { key: 'view_users', label: 'Voir les utilisateurs', pole: 'direction' },
  { key: 'edit_users', label: 'Modifier les utilisateurs', pole: 'direction' },
  { key: 'view_fleet', label: 'Voir la flotte', pole: 'operations' },
  { key: 'edit_fleet', label: 'Modifier la flotte', pole: 'operations' },
  { key: 'view_analytics', label: 'Voir les analytiques', pole: 'technique' },
  { key: 'view_reports', label: 'Voir les signalements', pole: 'securite' },
  { key: 'manage_blog', label: 'Gérer le blog', pole: 'marketing' },
  { key: 'manage_portfolio', label: 'Gérer le portfolio', pole: 'marketing' },
  { key: 'send_emails', label: 'Envoyer des emails', pole: 'marketing' },
  { key: 'view_finances', label: 'Voir les finances', pole: 'commercial' },
  { key: 'manage_appointments', label: 'Gérer les rendez-vous', pole: 'operations' },
  { key: 'view_certifications', label: 'Voir les certifications', pole: 'securite' },
  { key: 'manage_announcements', label: 'Gérer les annonces', pole: 'marketing' },
  { key: 'manage_maintenance', label: 'Gérer la maintenance', pole: 'maintenance' },
  { key: 'view_stock', label: 'Voir le stock', pole: 'maintenance' },
  { key: 'manage_risks', label: 'Gérer les risques', pole: 'surete' },
  { key: 'view_cyber', label: 'Accès cybersécurité', pole: 'surete' },
  { key: 'manage_ia', label: 'Gérer les modèles IA', pole: 'data_ia' },
  { key: 'view_data', label: 'Voir les données / cloud', pole: 'data_ia' },
  { key: 'manage_hr', label: 'Gérer les RH', pole: 'rh' },
  { key: 'manage_clients', label: 'Gérer les clients', pole: 'relation_client' },
  { key: 'creative_access', label: 'Accès pôle créatif', pole: 'creatif' },
];