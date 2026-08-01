/**
 * Hiérarchie des rôles Brenne Aerial
 * PDG (owner) = PDG-Adjoint (pdg_adjoint) = 100 (direction suprême)
 * Conseil d'Administration = 80
 * Admin = 70
 * Directeur = 60
 */

export const PDG_EMAILS = ['contact.astuceson@gmail.com'];
export const PDG_ADJOINT_EMAILS = [];

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
    color: 'text-yellow-400',
    bg: 'bg-yellow-400/10',
    border: 'border-yellow-400/30',
    level: 100,
  },
  conseil_admin: {
    label: "Conseil d'Administration",
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
  event_manager: {
    label: 'Organisateur',
    sublabel: "Gestionnaire d'événements",
    emoji: '🎫',
    color: 'text-orange-400',
    bg: 'bg-orange-400/10',
    border: 'border-orange-400/30',
    level: 50,
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
 * Retourne le niveau numérique d'un utilisateur.
 */
export function getUserLevel(user) {
  if (!user) return 0;
  if (user.role === 'owner' || PDG_EMAILS.includes(user.email)) return 100;
  if (user.role === 'pdg_adjoint' || PDG_ADJOINT_EMAILS.includes(user.email)) return 100;
  return ROLE_CONFIG[user.role]?.level || 10;
}

/**
 * Retourne la liste des rôles qu'un user peut attribuer à d'autres.
 * Un user ne peut attribuer QUE des rôles de niveau STRICTEMENT inférieur au sien.
 * Exception : PDG (level 100 via owner) peut attribuer pdg_adjoint.
 *             PDG-Adjoint (level 100 via pdg_adjoint) ne peut PAS attribuer owner.
 */
export function getAssignableRoles(currentUser) {
  const level = getUserLevel(currentUser);
  const isOwner = currentUser?.role === 'owner' || PDG_EMAILS.includes(currentUser?.email);

  return Object.entries(ROLE_CONFIG)
    .filter(([role, cfg]) => {
      // owner ne peut être attribué par personne
      if (role === 'owner') return false;
      // pdg_adjoint uniquement par le PDG (owner)
      if (role === 'pdg_adjoint') return isOwner;
      // Tous les rôles de niveau < celui du user actuel
      return cfg.level < level;
    })
    .map(([role, cfg]) => ({ role, ...cfg }))
    .sort((a, b) => b.level - a.level);
}

/**
 * Vérifie si un user est PDG ou PDG-Adjoint (top management)
 */
export function isTopManagement(user) {
  if (!user) return false;
  return getUserLevel(user) >= 100;
}

/**
 * Vérifie si un user a accès à l'admin (directeur+)
 */
export function hasAdminAccess(user) {
  if (!user) return false;
  return getUserLevel(user) >= 60;
}

/**
 * Vérifie si un user peut gérer les Suprêmes (PDG/PDG-Adjoint)
 */
export function canManageSupreme(user) {
  if (!user) return false;
  return getUserLevel(user) >= 100;
}

/**
 * Vérifie si l'actuel peut modifier la cible (son level doit être > celui de la cible)
 */
export function canEditUser(currentUser, targetUser) {
  if (!currentUser || !targetUser) return false;
  const myLevel = getUserLevel(currentUser);
  const targetLevel = getUserLevel(targetUser);
  // PDG peut tout modifier sauf lui-même
  if (currentUser.id === targetUser.id) return false;
  return myLevel > targetLevel;
}

/**
 * Retourne la signature utilisée dans les emails officiels
 */
export function getEmailSignature(user) {
  if (!user) return '— La Direction de Brenne Aerial';
  if (user.role === 'owner' || PDG_EMAILS.includes(user.email)) return '— Le PDG de Brenne Aerial';
  if (user.role === 'pdg_adjoint' || PDG_ADJOINT_EMAILS.includes(user.email)) return '— Le PDG-Adjoint de Brenne Aerial';
  if (user.role === 'conseil_admin') return "— Le Conseil d'Administration de Brenne Aerial";
  if (user.role === 'admin') return "— L'équipe Administration de Brenne Aerial";
  return '— La Direction de Brenne Aerial';
}

export function getRoleConfig(role) {
  return ROLE_CONFIG[role] || ROLE_CONFIG.user;
}