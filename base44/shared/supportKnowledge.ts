// Base de connaissance eza — injectée dans le contexte NEXUS pour qu'il puisse
// répondre factuellement sans escalader systématiquement.

export const EZA_KNOWLEDGE = `
## Base de connaissance eza (NEXUS l'a lue)

### Crédits Eza
- On gagne des crédits en publiant (posts, stories), en parrainant (/parrainage), en recevant des récompenses/badges.
- On dépense les crédits dans /boutique (tokens boost, pin, abonnements), /events (inscription), /banque (transferts).
- Le solde visible est la somme des wallets de l'utilisateur (entité Wallet).
- Un wallet peut être gelé (frozen=true) → transferts bloqués, afficher un message "compte gelé par l'administration".

### Parrainage (/parrainage)
- Code de parrainage = username. On partage le lien, le filleul s'inscrit, on gagne des crédits.
- Jalons (milestones) : crédits bonus à 1, 3, 5, 10 filleuls validés.
- Statut d'un parrainage : pending → validated → rewarded.

### Boutique (/boutique)
- Tokens : boost (visibilité post), pin_24h, pin_7d, communauté premium, etc.
- Abonnements : Business, Enterprise (gestion pub, analytics avancés).
- Achat de crédits via Stripe (CreditPacks).

### Événements (/events)
- Inscription par crédits Eza ou gratuit. Annulation possible avec motif (demande admin).
- Billet généré avec code (EZA-XXXX), validation par scan admin (/admin/scan-tickets).

### Publications / Communautés / Spaces
- Posts : like, repost, quote, bookmark, sondage, visibilité (public/followers/certified/eza_circle).
- Communities : ouvertes/fermées, membres, posts communautaires.
- Spaces : audio live via LiveKit, host + participants, officiel ou non.

### Compte / Auth
- Login email + Google. MDP oublié → /forgot-password → resetPassword.
- 2FA possible. Vérification email par OTP à l'inscription.
- Suppression de compte → /account-deletion (demande traitée par admin).

### Modération
- Signalement via ReportModal. Modération auto (moderateNewPost) + humaine.
- Posts supprimables par admin. Utilisateurs bannables.

### Support
- Le ticket a un statut : open → ai_resolved → (awaiting_human) → resolved → closed.
- L'IA (Nexus) DOIT d'abord chercher dans cette doc + examiner l'élément concerné + vérifier le compte avant de répondre.
- ESCALADER UNIQUEMENT si : bug bloquant confirmé, sécurité, demande de remboursement, suppression de compte, ou l'utilisateur insiste 3+ fois sans solution.
- Ne JAMAIS escalader juste "par précaution" — d'abord proposer une solution.
`;

export const STEP_ICONS = {
  book: '📖',
  post: '📄',
  wallet: '💰',
  user: '👤',
  search: '🔍',
  history: '💬',
  check: '✅',
  alert: '⚠️',
};

// Extrait les étapes de recherche que l'IA doit afficher, basées sur le contexte.
// Retourne un tableau d'objets { icon, label } que le frontend rendra en chips.
export function buildResearchSteps({ hasRelatedPost, hasRelatedConversation, category }) {
  const steps = [
    { icon: 'book', label: "Lecture de la documentation eza" },
  ];
  if (hasRelatedPost) steps.push({ icon: 'post', label: "Examen de la publication concernée" });
  if (hasRelatedConversation) steps.push({ icon: 'history', label: "Analyse de la discussion" });
  if (category === 'credits' || category === 'billing') {
    steps.push({ icon: 'wallet', label: "Vérification de votre solde Eza" });
  }
  if (category === 'account') {
    steps.push({ icon: 'user', label: "Vérification de votre compte" });
  }
  steps.push({ icon: 'search', label: "Recherche d'une solution applicable" });
  return steps;
}