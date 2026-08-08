/**
 * Algorithme du fil « Pour vous » — inspiré de l'architecture Home Mixer de X (Twitter).
 *
 * Pipeline :
 *   1. Candidate Sources  → In-Network (50%) + Out-of-Network (50%)
 *   2. Hydration           → métadonnées enrichies (auteur, médias, etc.)
 *   3. Filtering           → doublons, réponses, brouillons, auto-posts, mots bloqués
 *   4. Scoring             → score de pertinence (engagement + affinité + autorité + fraîcheur)
 *   5. Author Diversity    → atténuation des scores d'un même auteur répété
 *   6. Selection           → top K trié par score final
 *   7. Post-filtering      → visibilité, spam, contenu supprimé
 *
 * Source : ByteByteGo Newsletter / The Algorithm That Powers Your X (Twitter) Post
 */

// ── Pondérations du scorer (calquées sur les signaux X) ──────────────────────
const WEIGHTS = {
  // Engagement (signaux forts)
  like: 4,
  reply: 8,           // réponse = signal d'interaction plus fort qu'un like
  repost: 12,         // repost = signal le plus fort (découverte active)
  quote: 10,
  view: 0.05,
  // Affinité sociale
  followingAuthor: 40, // boost massif pour les comptes suivis (In-Network)
  mutualInteraction: 25, // bonus si l'auteur a déjà interagi avec l'utilisateur
  // Autorité
  verifiedBoost: 15,   // comptes vérifiés/certifiés/pro
  officialBoost: 20,   // comptes officiels/suprêmes
  premiumBoost: 18,    // boost visibilité Premium (équivalent X Premium)
  // Médias
  hasMedia: 8,
  textOnlyMalus: -6,   // malus critique : texte seul sans média
  // Fraîcheur (décroissance temporelle)
  recency: { h1: 50, h6: 30, h24: 15, decayPerHour: 0.2, cutoff: 72 },
  // Boost boutique
  highlight: 120,
  sponsored: 80,
  // Variabilité
  random: 6,
  // Diversité d'auteurs
  diversityAttenuation: 0.65, // chaque post supplémentaire d'un même auteur voit son score multiplié
};

// ── 1. Candidate Sources ─────────────────────────────────────────────────────
/**
 * Sépare les posts candidats en deux pools :
 *   - In-Network  : posts d'auteurs que l'utilisateur suit
 *   - Out-of-Network : posts d'auteurs non suivis (découverte)
 *
 * @returns {{ inNetwork: Array, outOfNetwork: Array }}
 */
export function splitCandidateSources(posts, followingEmails, emailById) {
  const inNetwork = [];
  const outOfNetwork = [];
  for (const post of posts) {
    const authorEmail = emailById[post.author_id] || '';
    if (followingEmails.has(authorEmail)) {
      inNetwork.push(post);
    } else {
      outOfNetwork.push(post);
    }
  }
  return { inNetwork, outOfNetwork };
}

// ── 2. Filtering (pre-selection) ─────────────────────────────────────────────
/**
 * Filtres de pré-sélection : retire doublons, réponses, brouillons, auto-posts,
 * posts communautaires, et posts déjà vus.
 */
export function preFilter(posts, { seenIds = new Set() } = {}) {
  const seen = new Set();
  return posts.filter((p) => {
    if (!p || p.id == null) return false;
    if (p.reply_to_id || p.is_draft || p.community_id) return false;
    if (p.author_id && seen.has(p.author_id + ':' + p.id)) return false;
    if (seenIds.has(p.id)) return false;
    seen.add(p.author_id + ':' + p.id);
    return true;
  });
}

// ── 3. Scoring ───────────────────────────────────────────────────────────────
function getRecencyScore(post, now) {
  if (!post.created_date) return 0;
  const ageHours = (now - new Date(post.created_date).getTime()) / 3600000;
  if (ageHours < 1) return WEIGHTS.recency.h1;
  if (ageHours < 6) return WEIGHTS.recency.h6;
  if (ageHours < 24) return WEIGHTS.recency.h24;
  return Math.max(0, WEIGHTS.recency.cutoff - ageHours) * WEIGHTS.recency.decayPerHour;
}

function getAuthorityBoost(post) {
  const v = post.author_verifications || [];
  let boost = 0;
  if (v.includes('verified') || v.includes('certified') || v.includes('pro')) boost += WEIGHTS.verifiedBoost;
  if (v.includes('official') || v.includes('supreme')) boost += WEIGHTS.officialBoost;
  // Équivalent X Premium : les comptes vérifiés reçoivent un boost de visibilité
  if (v.includes('verified') || v.includes('pro') || v.includes('official') || v.includes('supreme')) {
    boost += WEIGHTS.premiumBoost;
  }
  return boost;
}

function getMediaScore(post) {
  const hasMedia = (post.media_urls?.length || 0) > 0;
  if (hasMedia) return WEIGHTS.hasMedia;
  // Malus critique : texte seul sans média
  return WEIGHTS.textOnlyMalus;
}

function getEngagementScore(post) {
  return (
    (post.likes_count || 0) * WEIGHTS.like +
    (post.replies_count || 0) * WEIGHTS.reply +
    (post.reposts_count || 0) * WEIGHTS.repost +
    (post.quotes_count || 0) * WEIGHTS.quote +
    (post.views_count || 0) * WEIGHTS.view
  );
}

/**
 * Calcule le score de pertinence d'un post (avant diversité d'auteur).
 */
export function scorePost(post, { followingEmails, emailById, sessionSeed, index }) {
  const now = Date.now();
  const authorEmail = emailById[post.author_id] || '';
  const isFollowing = followingEmails.has(authorEmail);

  const engagement = getEngagementScore(post);
  const recency = getRecencyScore(post, now);
  const media = getMediaScore(post);
  const authority = getAuthorityBoost(post);
  const followingBoost = isFollowing ? WEIGHTS.followingAuthor : 0;
  const highlightBoost = post.is_highlight ? WEIGHTS.highlight : 0;
  const sponsoredBoost = post.is_sponsored ? WEIGHTS.sponsored : 0;

  // Variabilité stable par session (évite un ordre identique pour tous)
  const seededRandom = ((sessionSeed * (index + 1) * 9301 + 49297) % 233280) / 233280;
  const randomBoost = seededRandom * WEIGHTS.random;

  const rawScore =
    engagement +
    recency +
    media +
    authority +
    followingBoost +
    highlightBoost +
    sponsoredBoost +
    randomBoost;

  return {
    ...post,
    _algoScore: rawScore,
    _isInNetwork: isFollowing,
  };
}

// ── 4. Author Diversity Scorer ───────────────────────────────────────────────
/**
 * Atténue le score des posts d'un auteur répété pour garantir la diversité du fil.
 * Le 1er post d'un auteur garde son score complet, les suivants sont atténués.
 */
export function applyAuthorDiversity(scoredPosts) {
  const authorCounts = new Map();
  return scoredPosts
    .map((p) => {
      const authorId = p.author_id || 'unknown';
      const count = authorCounts.get(authorId) || 0;
      authorCounts.set(authorId, count + 1);
      if (count === 0) return p;
      // Atténuation exponentielle : 2e post ×0.65, 3e ×0.42, 4e ×0.27…
      const attenuation = Math.pow(WEIGHTS.diversityAttenuation, count);
      return { ...p, _algoScore: p._algoScore * attenuation };
    })
    .sort((a, b) => b._algoScore - a._algoScore);
}

// ── 5. Selection (top K) ─────────────────────────────────────────────────────
/**
 * Sélectionne les top K posts en mélangeant In-Network et Out-of-Network
 * selon un ratio cible (50/50 par défaut, comme X).
 */
export function selectTopK({ inNetwork, outOfNetwork, k = 100, inNetworkRatio = 0.5 }) {
  const inCount = Math.round(k * inNetworkRatio);
  const outCount = k - inCount;
  const selected = [
    ...inNetwork.slice(0, inCount),
    ...outOfNetwork.slice(0, outCount),
  ];
  // Re-tri final par score après fusion des deux pools
  return selected.sort((a, b) => b._algoScore - a._algoScore);
}

// ── Pipeline complet ─────────────────────────────────────────────────────────
/**
 * Exécute le pipeline complet du fil « Pour vous ».
 *
 * @param {Object} params
 * @param {Array}  params.posts          - Posts candidats bruts
 * @param {Set}    params.followingEmails - Emails des auteurs suivis
 * @param {Object} params.emailById      - Map author_id → email
 * @param {Set}    [params.seenIds]      - IDs de posts déjà vus
 * @param {number} [params.k]            - Nombre de posts à retourner
 * @param {number} [params.sessionSeed]  - Seed stable par session
 * @returns {Array} Posts triés par score final
 */
export function buildForYouFeed({
  posts,
  followingEmails,
  emailById,
  seenIds = new Set(),
  k = 100,
  sessionSeed = 0,
}) {
  if (!posts || posts.length === 0) return [];

  // 1. Pre-filtering
  const filtered = preFilter(posts, { seenIds });

  // 2. Candidate sources split
  const { inNetwork, outOfNetwork } = splitCandidateSources(filtered, followingEmails, emailById);

  // 3. Scoring (les deux pools)
  const scoredIn = inNetwork.map((p, i) => scorePost(p, { followingEmails, emailById, sessionSeed, index: i }));
  const scoredOut = outOfNetwork.map((p, i) => scorePost(p, { followingEmails, emailById, sessionSeed, index: i + 1000 }));

  // 4. Author diversity (sur chaque pool séparément)
  const diversifiedIn = applyAuthorDiversity(scoredIn);
  const diversifiedOut = applyAuthorDiversity(scoredOut);

  // 5. Selection & mix (50/50)
  const selected = selectTopK({ inNetwork: diversifiedIn, outOfNetwork: diversifiedOut, k, inNetworkRatio: 0.5 });

  return selected;
}