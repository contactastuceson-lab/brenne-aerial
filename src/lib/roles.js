/**
 * Hiérarchie des rôles Brenne Aerial
 * PDG (owner) > PDG-Adjoint (pdg_adjoint) > Conseil d'Administration > Admin > ...
 */

export const PDG_EMAILS = ['contact.astuceson@gmail.com'];
export const PDG_ADJOINT_EMAILS = ['sentenacborys@gmail.com'];

export const ROLE_CONFIG = {
  owner: {
    label: 'PDG',
    sublabel: 'Président-Directeur Général',
    emoji: '👑',
    color: 'text-yellow-500',
    bg: 'bg-yellow-500/10',
    border: 'border-yellow-500/30',
    level: 100,
  },
  pdg_adjoint: {
    label: 'PDG-Adjoint',
    sublabel: 'Président-Directeur Général Adjoint',
    emoji: '🥈',
    color: 'text-orange-400',
    bg: 'bg-orange-400/10',
    border: 'border-orange-400/30',
    level: 90,
  },
  conseil_admin: {
    label: 'Conseil d\'Administration',
    sublabel: 'Membre du CA',
    emoji: '🏛️',
    color: 'text-purple-400',
    bg: 'bg-purple-400/10',
    border: 'border-purple-400/30',
    level: 80,
  },
  admin: {
    label: 'Administrateur',
    sublabel: 'Administrateur plateforme',
    emoji: '🛡️',
    color: 'text-red-400',
    bg: 'bg-red-400/10',
    border: 'border-red-400/30',
    level: 70,
  },
  directeur: {
    label: 'Directeur',
    sublabel: 'Directeur de département',
    emoji: '📊',
    color: 'text-blue-400',
    bg: 'bg-blue-400/10',
    border: 'border-blue-400/30',
    level: 60,
  },
  responsable: {
    label: 'Responsable',
    sublabel: 'Responsable de service',
    emoji: '📋',
    color: 'text-cyan-400',
    bg: 'bg-cyan-400/10',
    border: 'border-cyan-400/30',
    level: 50,
  },
  collaborateur_interne: {
    label: 'Collaborateur Interne',
    sublabel: 'Équipe Brenne Aerial',
    emoji: '🤝',
    color: 'text-green-400',
    bg: 'bg-green-400/10',
    border: 'border-green-400/30',
    level: 40,
  },
  vip: {
    label: 'VIP',
    sublabel: 'Membre VIP',
    emoji: '⭐',
    color: 'text-amber-400',
    bg: 'bg-amber-400/10',
    border: 'border-amber-400/30',
    level: 20,
  },
  collaborateur: {
    label: 'Collaborateur',
    sublabel: 'Collaborateur externe',
    emoji: '👤',
    color: 'text-sky-400',
    bg: 'bg-sky-400/10',
    border: 'border-sky-400/30',
    level: 15,
  },
  pilote: {
    label: 'Pilote',
    sublabel: 'Pilote de drone',
    emoji: '✈️',
    color: 'text-primary',
    bg: 'bg-primary/10',
    border: 'border-primary/30',
    level: 15,
  },
  user: {
    label: 'Membre',
    sublabel: 'Membre de la communauté',
    emoji: '👤',
    color: 'text-muted-foreground',
    bg: 'bg-muted/10',
    border: 'border-border',
    level: 10,
  },
};

/**
 * Vérifie si un user est PDG (owner) ou PDG-Adjoint
 */
export function isTopManagement(user) {
  if (!user) return false;
  return (
    user.role === 'owner' ||
    user.role === 'pdg_adjoint' ||
    PDG_EMAILS.includes(user.email) ||
    PDG_ADJOINT_EMAILS.includes(user.email)
  );
}

/**
 * Vérifie si un user a accès à l'admin (admin+)
 */
export function hasAdminAccess(user) {
  if (!user) return false;
  const adminRoles = ['owner', 'pdg_adjoint', 'admin', 'conseil_admin', 'directeur'];
  return adminRoles.includes(user.role) || PDG_EMAILS.includes(user.email) || PDG_ADJOINT_EMAILS.includes(user.email);
}

/**
 * Vérifie si un user peut gérer les Suprêmes (PDG + PDG-Adjoint seulement)
 */
export function canManageSupreme(user) {
  if (!user) return false;
  return (
    user.role === 'owner' ||
    user.role === 'pdg_adjoint' ||
    PDG_EMAILS.includes(user.email) ||
    PDG_ADJOINT_EMAILS.includes(user.email)
  );
}

/**
 * Retourne la signature utilisée dans les emails officiels
 */
export function getEmailSignature(user) {
  if (!user) return '— La Direction de Brenne Aerial';
  if (user.role === 'owner' || PDG_EMAILS.includes(user.email)) {
    return '— Le PDG de Brenne Aerial';
  }
  if (user.role === 'pdg_adjoint' || PDG_ADJOINT_EMAILS.includes(user.email)) {
    return '— Le PDG-Adjoint de Brenne Aerial';
  }
  if (user.role === 'conseil_admin') return '— Le Conseil d\'Administration de Brenne Aerial';
  if (user.role === 'admin') return '— L\'équipe Administration de Brenne Aerial';
  return '— La Direction de Brenne Aerial';
}

export function getRoleConfig(role) {
  return ROLE_CONFIG[role] || ROLE_CONFIG.user;
}