/**
 * Utilitaires pour gérer les restrictions de compte.
 * account_status: "active" | "suspended" | "banned" | "restricted"
 *
 * "restricted" = peut lire, mais ne peut pas :
 *   - publier un post
 *   - répondre à un post
 *   - envoyer un message privé
 */

export function isRestricted(user) {
  return user?.account_status === 'restricted';
}

export const RESTRICTED_TOAST = "⚠️ Votre compte est restreint. Vous ne pouvez pas effectuer cette action.";