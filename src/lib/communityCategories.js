export const COMMUNITY_CATEGORIES = [
  { key: 'tech', label: 'Technologie', emoji: '💻', color: 'text-blue-400', bg: 'bg-blue-400/10', border: 'border-blue-400/30' },
  { key: 'business', label: 'Business', emoji: '💼', color: 'text-emerald-400', bg: 'bg-emerald-400/10', border: 'border-emerald-400/30' },
  { key: 'art', label: 'Art & Créatif', emoji: '🎨', color: 'text-pink-400', bg: 'bg-pink-400/10', border: 'border-pink-400/30' },
  { key: 'music', label: 'Musique', emoji: '🎵', color: 'text-purple-400', bg: 'bg-purple-400/10', border: 'border-purple-400/30' },
  { key: 'gaming', label: 'Gaming', emoji: '🎮', color: 'text-indigo-400', bg: 'bg-indigo-400/10', border: 'border-indigo-400/30' },
  { key: 'sport', label: 'Sport', emoji: '⚽', color: 'text-orange-400', bg: 'bg-orange-400/10', border: 'border-orange-400/30' },
  { key: 'formation', label: 'Formation', emoji: '📚', color: 'text-amber-400', bg: 'bg-amber-400/10', border: 'border-amber-400/30' },
  { key: 'social', label: 'Social', emoji: '🌐', color: 'text-cyan-400', bg: 'bg-cyan-400/10', border: 'border-cyan-400/30' },
  { key: 'other', label: 'Autre', emoji: '✨', color: 'text-slate-400', bg: 'bg-slate-400/10', border: 'border-slate-400/30' },
];

export const getCategoryMeta = (key) => COMMUNITY_CATEGORIES.find(c => c.key === key) || COMMUNITY_CATEGORIES[COMMUNITY_CATEGORIES.length - 1];

export const slugify = (name) =>
  name.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');