// Base de connaissance eza — injectée dans le contexte NEXUS pour qu'il puisse
// répondre factuellement sans escalader systématiquement.

export const EZA_KNOWLEDGE = `
## Base de connaissance eza (NEXUS l'a lue)

### Crédits Eza
- **Gagner des crédits** : publier des posts, créer des stories, parrainer (/parrainage), recevoir des récompenses/badges, événements spéciaux.
- **Dépenser des crédits** : /boutique (tokens boost, pin, abonnements), /events (inscription), /banque (transferts entre wallets).
- Le solde visible = somme des wallets de l'utilisateur (entité Wallet).
- Un wallet peut être gelé (**frozen=true**) → transferts bloqués. Message : "compte gelé par l'administration".
- **Transferts** : /banque → transférer entre ses propres wallets ou vers un autre utilisateur.

### Parrainage (/parrainage)
- Code de parrainage = votre username. Partagez le lien, le filleul s'inscrit, vous gagnez des crédits.
- **Jalons** (milestones) : crédits bonus à 1, 3, 5, 10 filleuls validés.
- Statut d'un parrainage : pending → validated → rewarded.
- Système anti-fraude automatique (détection des parrainages abusifs).

### Boutique (/boutique)
- **Tokens** : boost (visibilité post), pin_24h, pin_7d, communauté premium, capacité étendue.
- **Abonnements** : Business, Enterprise (gestion pub, analytics avancés, tokens inclus).
- **Achat de crédits** via Stripe (CreditPacks) — paiements sécurisés.
- **Récompenses** : échangez vos crédits contre des tokens ou des avantages.

### Événements (/events)
- Inscription par **crédits Eza** ou **gratuit** selon l'événement.
- Annulation possible avec motif → demande admin → remboursement en crédits si approuvée.
- Billet généré avec code unique (EZA-XXXX), validation par **scan admin** (/admin/scan-tickets).
- Capacité maximale affichée. Statut : draft → upcoming → live → ended → cancelled.

### Publications / Communautés / Spaces
- **Posts** : like, repost, quote, bookmark, sondage, visibilité (public/followers/certified/eza_circle).
- **Stories** : image, vidéo, texte. Expirent après 24h. Stickers, filtres, polices.
- **Communities** : ouvertes/fermées, membres, posts communautaires. Owner gère les paramètres.
- **Spaces** : audio live via LiveKit, host + participants, officiel ou non. Rejoignez en direct.

### Banque (/banque)
- Gérez vos **wallets** (épargne, dépenses, projet, custom).
- **Transferts** entre wallets ou vers d'autres utilisateurs.
- **Gel** : un wallet gelé par l'admin bloque les transferts sortants.
- Historique des transactions (CreditTransaction).

### Compte / Auth
- **Login** : email + mot de passe, ou Google OAuth.
- **MDP oublié** → /forgot-password → email de réinitialisation → /reset-password.
- **2FA** : activation possible via paramètres de sécurité.
- **Vérification email** : OTP à l'inscription (register → OTP → verifyOtp → connecté).
- **Suppression de compte** → /account-deletion (demande traitée par admin sous 30 jours).
- **Certification** : demande de badge vérifié. Paiement Stripe + validation admin.

### Espace Utilisateur (/espace)
- Vue unifiée : événements inscrits, posts programmés, affiliations, analytics, facturation.
- **Posts programmés** : planifiez vos publications.
- **Analytics** : statistiques de vos posts, vues, engagements.

### Modération
- **Signalement** : via ReportModal sur tout contenu. Modération auto (moderateNewPost) + humaine.
- Posts supprimables par admin. Utilisateurs bannables/suspendables.
- **Signalements** : report → ack email → traitement admin → notification de résolution.

### Support (tickets)
- Le ticket a un statut : **open** (en cours) → **ai_resolved** (résolu par IA après confirmation user) → **awaiting_human** (escaladé) → **resolved** → **closed**.
- **Nexus** (IA) répond en premier, fait sa recherche contextuelle (doc + élément concerné + compte).
- Le ticket **RESTE OUVERT** jusqu'à ce que l'utilisateur confirme que le problème est résolu.
- **Escalader** UNIQUEMENT si : bug bloquant confirmé, sécurité, remboursement Stripe, suppression de compte, fraude.
- Ne JAMAIS escalader "par précaution" — d'abord proposer une solution.

### Documentation externe
- Documentation complète et guides utilisateur : **https://docs.ezagroup.org/**
- Redirigez les utilisateurs vers la doc pour les tutoriels détaillés.
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
  event: '📅',
  community: '👥',
  space: '🎙️',
  story: '⭕',
  referral: '🎁',
  registration: '🎟️',
  reward: '🏆',
  cart: '🛒',
  ticket: '🎫',
  discussion: '💬',
  forum: '📋',
  review: '⭐',
  certification: '✅',
  donation: '❤️',
  list: '📝',
  ad: '📣',
};

// Étape de recherche associée à chaque type d'élément concerné.
const RELATED_STEP = {
  post: { icon: 'post', label: "Examen de la publication concernée" },
  conversation: { icon: 'history', label: "Analyse de la discussion concernée" },
  wallet: { icon: 'wallet', label: "Vérification du portefeuille concerné" },
  event: { icon: 'event', label: "Examen de l'événement concerné" },
  community: { icon: 'community', label: "Examen de la communauté concernée" },
  space: { icon: 'space', label: "Examen du Space audio concerné" },
  story: { icon: 'story', label: "Examen de la story concernée" },
  referral: { icon: 'referral', label: "Examen du parrainage concerné" },
  registration: { icon: 'registration', label: "Examen de l'inscription événement concernée" },
  reward: { icon: 'reward', label: "Examen de la récompense concernée" },
  cart: { icon: 'cart', label: "Examen du panier concerné" },
  ticket: { icon: 'ticket', label: "Examen du ticket concerné" },
  discussion: { icon: 'discussion', label: "Examen de la discussion forum concernée" },
  forum: { icon: 'forum', label: "Examen du sujet forum concerné" },
  review: { icon: 'review', label: "Examen de l'avis concerné" },
  certification: { icon: 'certification', label: "Examen de la demande de certification concernée" },
  donation: { icon: 'donation', label: "Examen du don concerné" },
  list: { icon: 'list', label: "Examen de la liste concernée" },
  ad: { icon: 'ad', label: "Examen de la campagne pub concernée" },
};

// Recherche RÉELLE de l'élément concerné par le ticket.
// Fetch l'entité correspondante et retourne { researchBit, step } :
//   - researchBit : texte injecté dans le prompt Nexus (données vérifiées)
//   - step        : étape affichée en temps réel (reflète la vraie action)
// Retourne { null, null } si type none / id absent / fetch échoué.
export async function buildRelatedItemResearch(base44, type, id) {
  if (!type || type === 'none' || !id) return { researchBit: null, step: null };
  const sr = base44.asServiceRole;
  const step = RELATED_STEP[type] || null;
  try {
    if (type === 'post') {
      const p = await sr.entities.Post.get(id).catch(() => null);
      if (p) return { researchBit: `PUBLICATION CONCERNÉE (examinée par Nexus) :\n- Auteur : ${p.author_username || '?'}\n- Contenu : ${(p.content || '').slice(0, 400)}\n- Likes : ${p.likes_count || 0} · Vues : ${p.views_count || 0}\n- Visibilité : ${p.visibility || 'public'}`, step };
    } else if (type === 'event') {
      const e = await sr.entities.Event.get(id).catch(() => null);
      if (e) return { researchBit: `ÉVÉNEMENT CONCERNÉ (examiné par Nexus) :\n- ID:${e.id} · « ${e.title} »\n- Début : ${e.start_date || '?'} · Lieu : ${e.city || e.location || '?'}\n- Prix : ${e.price_credits || 0} crédits · ${e.attendees_count || 0}/${e.capacity || '∞'} inscrits · Statut : ${e.status}`, step };
    } else if (type === 'wallet') {
      return { researchBit: null, step };
    } else if (type === 'conversation') {
      return { researchBit: null, step };
    } else if (type === 'community') {
      const c = await sr.entities.Community.get(id).catch(() => null);
      if (c) return { researchBit: `COMMUNAUTÉ CONCERNÉE (examinée par Nexus) :\n- « ${c.name} » · ${c.members_count || 0} membres · ${c.type || 'open'}\n- Catégorie : ${c.category || '?'}\n- Owner : ${c.owner_username || '?'}`, step };
    } else if (type === 'space') {
      const s = await sr.entities.Space.get(id).catch(() => null);
      if (s) return { researchBit: `SPACE AUDIO CONCERNÉ (examiné par Nexus) :\n- « ${s.title} » · statut ${s.status}\n- Host : ${s.host_username || '?'}${s.is_official ? ' · officiel EZA' : ''}`, step };
    } else if (type === 'story') {
      const st = await sr.entities.Story.get(id).catch(() => null);
      if (st) return { researchBit: `STORY CONCERNÉE (examinée par Nexus) :\n- Type : ${st.media_type} · Auteur : ${st.author_username || '?'}\n- Vues : ${(st.viewers || []).length} · Expire : ${st.expires_at || '?'}`, step };
    } else if (type === 'referral') {
      const r = await sr.entities.Referral.get(id).catch(() => null);
      if (r) return { researchBit: `PARRAINAGE CONCERNÉ (examiné par Nexus) :\n- Code : ${r.referral_code || '?'} · Filleul : ${r.referred_email || r.referred_name || '?'}\n- Statut : ${r.status} · Crédits gagnés : ${r.credits_earned || 0}`, step };
    } else if (type === 'registration') {
      const reg = await sr.entities.EventRegistration.get(id).catch(() => null);
      if (reg) return { researchBit: `INSCRIPTION ÉVÉNEMENT CONCERNÉE (examinée par Nexus) :\n- « ${reg.event_title || '?'} » · ${reg.event_start_date ? reg.event_start_date.slice(0, 10) : '?'}\n- Crédits payés : ${reg.credits_paid || 0} · Statut : ${reg.status} · Billet : ${reg.ticket_code || ''}`, step };
    } else if (type === 'reward') {
      const rw = await sr.entities.RewardRedemption.get(id).catch(() => null);
      if (rw) return { researchBit: `RÉCOMPENSE CONCERNÉE (examinée par Nexus) :\n- « ${rw.item_label} » · ${rw.cost || 0} crédits · Catégorie : ${rw.item_category || '?'}\n- Statut : ${rw.status} · Fulfillment : ${rw.fulfillment_type}`, step };
    } else if (type === 'cart') {
      const cart = await sr.entities.Cart.get(id).catch(() => null);
      if (cart) return { researchBit: `PANIER CONCERNÉ (examiné par Nexus) :\n- ${(cart.items || []).length} article(s) · ${cart.total_credits || 0} crédits · Statut : ${cart.status}`, step };
    } else if (type === 'ticket') {
      const t = await sr.entities.SupportTicket.get(id).catch(() => null);
      if (t) return { researchBit: `TICKET CONCERNÉ (examiné par Nexus) :\n- #${String(t.id).slice(-6)} « ${t.subject} »\n- Statut : ${t.status} · Catégorie : ${t.category}`, step };
    } else if (type === 'discussion') {
      const d = await sr.entities.Discussion.get(id).catch(() => null);
      if (d) return { researchBit: `DISCUSSION FORUM CONCERNÉE (examinée par Nexus) :\n- « ${d.title} » · ${d.replies_count || 0} réponses · ${d.views_count || 0} vues\n- Catégorie : ${d.category || '?'}`, step };
    } else if (type === 'forum') {
      const f = await sr.entities.ForumTopic.get(id).catch(() => null);
      if (f) return { researchBit: `SUJET FORUM CONCERNÉ (examiné par Nexus) :\n- « ${f.title} » · ${f.replies_count || 0} réponses · ${f.views_count || 0} vues\n- Catégorie : ${f.category || '?'}`, step };
    } else if (type === 'review') {
      const rv = await sr.entities.Review.get(id).catch(() => null);
      if (rv) return { researchBit: `AVIS CONCERNÉ (examiné par Nexus) :\n- Note : ${rv.rating}/5 · Auteur : ${rv.author_name || '?'}${rv.is_verified_client ? ' · client vérifié' : ''}\n- Commentaire : ${(rv.comment || '').slice(0, 300)}`, step };
    } else if (type === 'certification') {
      const c = await sr.entities.CertificationRequest.get(id).catch(() => null);
      if (c) return { researchBit: `DEMANDE DE CERTIFICATION CONCERNÉE (examinée par Nexus) :\n- Statut : ${c.status} · Paiement : ${c.payment_status || '?'}\n- Soumise : ${c.submitted_at || '?'}`, step };
    } else if (type === 'donation') {
      const d = await sr.entities.Donation.get(id).catch(() => null);
      if (d) return { researchBit: `DON CONCERNÉ (examiné par Nexus) :\n- Montant : ${d.amount} € · Statut : ${d.status}${d.is_anonymous ? ' · anonyme' : ''}`, step };
    } else if (type === 'list') {
      const l = await sr.entities.UserList.get(id).catch(() => null);
      if (l) return { researchBit: `LISTE CONCERNÉE (examinée par Nexus) :\n- « ${l.name} » · ${(l.member_ids || []).length} membres · ${l.is_private ? 'privée' : 'publique'}`, step };
    } else if (type === 'ad') {
      const a = await sr.entities.AdCampaign.get(id).catch(() => null);
      if (a) return { researchBit: `CAMPAGNE PUB CONCERNÉE (examinée par Nexus) :\n- « ${a.title} » · Statut : ${a.status}\n- Crédits : ${a.credits_remaining || 0}/${a.budget_credits || 0} · ${a.impressions || 0} impressions · ${a.clicks || 0} clics`, step };
    }
  } catch {}
  return { researchBit: null, step: null };
}

// Extrait les étapes de recherche que l'IA doit afficher, basées sur le contexte.
// `relatedStep` = étape réelle de l'élément concerné (issue de buildRelatedItemResearch).
export function buildResearchSteps({ relatedStep, category, relatedType }) {
  const steps = [
    { icon: 'book', label: "Lecture de la documentation eza" },
  ];
  if (relatedStep) {
    steps.push(relatedStep);
  } else if (relatedType && relatedType !== 'none') {
    const fallback = RELATED_STEP[relatedType];
    if (fallback) steps.push(fallback);
  }
  if (category === 'credits' || category === 'billing' || relatedType === 'wallet') {
    steps.push({ icon: 'wallet', label: "Vérification de votre solde Eza" });
  }
  if (category === 'account') {
    steps.push({ icon: 'user', label: "Vérification de votre compte" });
  }
  if (category === 'events' || relatedType === 'event' || relatedType === 'registration') {
    steps.push({ icon: 'event', label: "Recherche des événements & inscriptions" });
  }
  steps.push({ icon: 'search', label: "Recherche d'une solution applicable" });
  return steps;
}