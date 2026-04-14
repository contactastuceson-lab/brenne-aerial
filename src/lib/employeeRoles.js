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
];