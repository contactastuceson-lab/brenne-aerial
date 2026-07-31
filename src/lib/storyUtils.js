// ── Utilitaires stories ────────────────────────────────────────────────────

export const STORY_DURATION_MS = 5000;
export const STORY_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24h

export function isStoryActive(story) {
  if (!story) return false;
  const created = new Date(story.created_date).getTime();
  const expires = story.expires_at
    ? new Date(story.expires_at).getTime()
    : created + STORY_EXPIRY_MS;
  return expires > Date.now();
}

export function storyExpiresAt(story) {
  if (story?.expires_at) return new Date(story.expires_at).getTime();
  return new Date(story.created_date).getTime() + STORY_EXPIRY_MS;
}

export function storyDuration(story) {
  if (!story) return STORY_DURATION_MS;
  if (story.media_type === 'video') return 30000;
  return STORY_DURATION_MS;
}

// Groupe les stories actives par auteur (ordre chronologique ascendant par story)
export function groupStoriesByAuthor(stories) {
  const map = new Map();
  for (const s of stories || []) {
    if (!isStoryActive(s)) continue;
    const aid = s.author_id;
    if (!map.has(aid)) {
      map.set(aid, {
        author_id: aid,
        author_name: s.author_name,
        author_username: s.author_username,
        author_avatar: s.author_avatar,
        stories: [],
      });
    }
    map.get(aid).stories.push(s);
  }
  for (const g of map.values()) {
    g.stories.sort((a, b) => new Date(a.created_date) - new Date(b.created_date));
  }
  return Array.from(map.values());
}

// True si l'utilisateur courant n'a pas encore vu au moins une story du groupe
export function hasUnseen(group, userId) {
  if (!group || !userId) return true;
  return group.stories.some(
    (s) => !((Array.isArray(s.viewers) ? s.viewers : []).some((v) => v?.id === userId))
  );
}

export function timeAgo(story) {
  if (!story?.created_date) return '';
  const ms = Date.now() - new Date(story.created_date).getTime();
  const h = Math.floor(ms / 3600000);
  if (h >= 1) return `il y a ${h}h`;
  const m = Math.floor(ms / 60000);
  if (m >= 1) return `il y a ${m}min`;
  return "à l'instant";
}

// Emojis de réaction rapide (façon Instagram)
export const QUICK_REACTION_EMOJIS = ['❤️', '🔥', '😂', '👏', '💯', '🙌'];

// Filtres photo (façon Instagram)
export const STORY_FILTERS = [
  { key: 'none', label: 'Normal', css: 'none' },
  { key: 'clarendon', label: 'Clarendon', css: 'contrast(1.2) saturate(1.35)' },
  { key: 'gingham', label: 'Gingham', css: 'brightness(1.05) sepia(0.2)' },
  { key: 'moon', label: 'Moon', css: 'grayscale(1) contrast(1.1) brightness(1.1)' },
  { key: 'lark', label: 'Lark', css: 'saturate(1.05) brightness(1.08)' },
  { key: 'reyes', label: 'Reyes', css: 'sepia(0.3) contrast(1.05) brightness(1.05)' },
  { key: 'juno', label: 'Juno', css: 'saturate(1.4) contrast(1.05)' },
  { key: 'aden', label: 'Aden', css: 'hue-rotate(-20deg) saturate(1.3) contrast(1.05)' },
  { key: 'slumber', label: 'Slumber', css: 'saturate(1.2) contrast(0.9) brightness(1.05)' },
  { key: 'noir', label: 'Noir', css: 'grayscale(1) contrast(1.3) brightness(0.9)' },
];
export function filterCss(key) {
  const f = STORY_FILTERS.find((s) => s.key === key);
  return f && f.key !== 'none' ? f.css : '';
}

// Polices pour stories texte
export const STORY_FONTS = [
  { key: 'grotesk', label: 'Grotesk', css: "'Space Grotesk', sans-serif" },
  { key: 'inter', label: 'Inter', css: "'Inter', sans-serif" },
  { key: 'mono', label: 'Mono', css: "'JetBrains Mono', monospace" },
  { key: 'serif', label: 'Serif', css: 'Georgia, serif' },
  { key: 'cursive', label: 'Manuscrit', css: "'Comic Sans MS', cursive" },
];
export function fontCss(key) {
  return (STORY_FONTS.find((f) => f.key === key) || STORY_FONTS[0]).css;
}

// Couleurs de texte
export const STORY_TEXT_COLORS = ['#ffffff', '#000000', '#fde047', '#f472b6', '#22d3ee', '#a78bfa', '#f87171', '#34d399'];

// Stickers emoji disponibles
export const STORY_STICKERS = ['❤️', '🔥', '✨', '😂', '😍', '🥳', '👏', '💯', '🙌', '🤩', '😎', '🤔', '👀', '💚', '💙', '💜', '⭐', '🌟', '💫', '🎉', '🎊', '🌈', '☀️', '🌙'];

// Dégradés de fond pour les stories texte
export const TEXT_GRADIENTS = [
  { key: 'sunset', label: 'Sunset', css: 'linear-gradient(135deg,#FF512F 0%,#DD2476 100%)' },
  { key: 'ocean', label: 'Ocean', css: 'linear-gradient(135deg,#2193b0 0%,#6dd5ed 100%)' },
  { key: 'purple', label: 'Violet', css: 'linear-gradient(135deg,#8E2DE2 0%,#4A00E0 100%)' },
  { key: 'forest', label: 'Forêt', css: 'linear-gradient(135deg,#11998e 0%,#38ef7d 100%)' },
  { key: 'night', label: 'Nuit', css: 'linear-gradient(135deg,#0f2027 0%,#203a43 50%,#2c5364 100%)' },
  { key: 'rose', label: 'Rose', css: 'linear-gradient(135deg,#ee9ca7 0%,#ffdde1 100%)' },
];

export function gradientByKey(key) {
  return (TEXT_GRADIENTS.find((g) => g.key === key) || TEXT_GRADIENTS[0]).css;
}