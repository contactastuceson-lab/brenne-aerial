/**
 * Utilitaires pour gérer les restrictions de compte.
 * account_status: "active" | "restricted" | "suspended" | "banned" | "closed"
 *
 * restrictions: tableau de permissions bloquées sur le compte "restricted"
 * Si vide ou absent → tout est bloqué (comportement par défaut).
 * Valeurs possibles :
 *   - "post"         → publier un post / discussion
 *   - "reply"        → répondre à un post ou discussion
 *   - "message"      → envoyer un message privé
 *   - "like"         → liker un post / commentaire
 *   - "poll"         → voter dans un sondage ou créer un sondage
 *   - "media"        → joindre des médias (photos, vidéos, GIF)
 *   - "forum"        → participer au forum (créer sujet, répondre)
 *   - "follow"       → suivre / se désabonner d'un utilisateur
 *   - "comment"      → commenter
 *   - "quote_request"→ envoyer une demande de devis
 *   - "profile_edit" → modifier son profil
 */

export function isFrozen(user) {
  return user?.account_status === 'frozen';
}

export function isRestricted(user) {
  return user?.account_status === 'restricted';
}

export function isSuspended(user) {
  return user?.account_status === 'suspended';
}

export function isBanned(user) {
  return user?.account_status === 'banned';
}

export function isActive(user) {
  return !user?.account_status || user?.account_status === 'active';
}

/**
 * Vérifie si une action spécifique est bloquée pour l'utilisateur.
 * @param {object} user
 * @param {string} action - clé de restriction (ex: "post", "like", "message")
 * @returns {boolean} true si l'action est bloquée
 */
export function isActionBlocked(user, action) {
  if (!user) return false;
  // Suspendu, banni et gelé = tout bloqué
  if (isSuspended(user) || isBanned(user) || isFrozen(user)) return true;
  if (!isRestricted(user)) return false;

  // Restreint : si restrictions[] définies, vérifier la liste
  const restrictions = user.restrictions;
  if (!restrictions || restrictions.length === 0) {
    // Pas de liste → tout est bloqué par défaut
    return true;
  }
  return restrictions.includes(action);
}

export const RESTRICTED_TOAST = "⚠️ Votre compte est restreint. Vous ne pouvez pas effectuer cette action.";

export const RESTRICTION_LABELS = {
  post:          { label: 'Publications', desc: 'Créer de nouveaux posts', emoji: '📝' },
  reply:         { label: 'Réponses', desc: 'Répondre aux posts', emoji: '↩️' },
  message:       { label: 'Messagerie', desc: 'Envoyer des messages privés', emoji: '💬' },
  like:          { label: 'Likes', desc: 'Aimer des publications', emoji: '❤️' },
  poll:          { label: 'Sondages', desc: 'Créer ou voter dans un sondage', emoji: '📊' },
  media:         { label: 'Médias', desc: 'Joindre photos, vidéos, GIFs', emoji: '🖼️' },
  forum:         { label: 'Forum', desc: 'Créer ou répondre dans le forum', emoji: '🗣️' },
  follow:        { label: 'Suivre', desc: 'Suivre ou se désabonner', emoji: '👥' },
  comment:       { label: 'Commentaires', desc: 'Commenter des publications', emoji: '💭' },
  quote_request: { label: 'Devis', desc: 'Envoyer une demande de devis', emoji: '📋' },
  profile_edit:  { label: 'Profil', desc: 'Modifier son profil', emoji: '✏️' },
};