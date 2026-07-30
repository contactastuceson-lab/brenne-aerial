// Helpers pour la personnalisation des perks boutique.
// Chaque perk "fonctionnalité" redeemed pose un flag dans user.perks.
// La personnalisation utilisateur (couleur, texte, son…) vit dans
// user.perks.customization = { accentColor, badgeText, notifSound, watermarkText, particleColor }.

export const NOTIF_SOUNDS = [
  { id: 'default', label: 'Par défaut', pattern: 'ding' },
  { id: 'ding',    label: 'Ding',       pattern: 'ding' },
  { id: 'chime',   label: 'Carillon',   pattern: 'chime' },
  { id: 'pop',     label: 'Pop',        pattern: 'pop' },
  { id: 'bell',    label: 'Cloche',     pattern: 'bell' },
  { id: 'spark',   label: 'Étincelle',  pattern: 'spark' },
];

export const ACCENT_PRESETS = [
  '#22d3ee', '#38bdf8', '#facc15', '#fb923c', '#f87171',
  '#a78bfa', '#34d399', '#f472b6', '#60a5fa', '#fbbf24',
];

export function getCustomization(perks = {}) {
  return perks?.customization || {};
}

export function isPerkActive(perks = {}, key) {
  const v = perks?.[key];
  // true ou null (flag permanent sans expiration) = actif ; undefined = non débloqué
  if (v === true || v === null) return true;
  if (v && typeof v === 'string') return new Date(v).getTime() > Date.now();
  return false;
}

// ── Son de notification synthétisé (Web Audio, aucun fichier requis) ──
let _audioCtx = null;
function audioCtx() {
  if (typeof window === 'undefined') return null;
  if (!_audioCtx) {
    try { _audioCtx = new (window.AudioContext || window.webkitAudioContext)(); }
    catch { return null; }
  }
  return _audioCtx;
}

function tone(ctx, freq, start, dur, type = 'sine', gain = 0.15) {
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  g.gain.setValueAtTime(0, ctx.currentTime + start);
  g.gain.linearRampToValueAtTime(gain, ctx.currentTime + start + 0.02);
  g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + dur);
  osc.connect(g); g.connect(ctx.destination);
  osc.start(ctx.currentTime + start);
  osc.stop(ctx.currentTime + start + dur + 0.02);
}

export function playNotifSound(pattern = 'ding') {
  const ctx = audioCtx();
  if (!ctx) return;
  if (ctx.state === 'suspended') ctx.resume();
  switch (pattern) {
    case 'chime':
      tone(ctx, 880, 0, 0.5, 'sine', 0.12);
      tone(ctx, 1320, 0.12, 0.5, 'sine', 0.1);
      break;
    case 'pop':
      tone(ctx, 600, 0, 0.12, 'triangle', 0.18);
      tone(ctx, 900, 0.04, 0.12, 'triangle', 0.12);
      break;
    case 'bell':
      tone(ctx, 523, 0, 0.8, 'sine', 0.14);
      tone(ctx, 784, 0.05, 0.8, 'sine', 0.08);
      break;
    case 'spark':
      tone(ctx, 1200, 0, 0.15, 'square', 0.06);
      tone(ctx, 1800, 0.06, 0.15, 'square', 0.05);
      break;
    case 'ding':
    default:
      tone(ctx, 880, 0, 0.3, 'sine', 0.14);
      tone(ctx, 1318, 0.05, 0.3, 'sine', 0.08);
      break;
  }
}

export function playUserNotifSound(perks = {}) {
  if (!isPerkActive(perks, 'custom_notif_sound')) return;
  const cust = getCustomization(perks);
  const soundId = cust.notifSound || 'default';
  const def = NOTIF_SOUNDS.find(s => s.id === soundId) || NOTIF_SOUNDS[0];
  playNotifSound(def.pattern);
}

// ── Watermark sur image (canvas) — renvoie un File watermarked ──
export async function applyWatermark(file, text) {
  if (!text || !file || !file.type?.startsWith('image/')) return file;
  try {
    const url = URL.createObjectURL(file);
    const img = await new Promise((res, rej) => {
      const i = new Image();
      i.onload = () => res(i);
      i.onerror = rej;
      i.src = url;
    });
    URL.revokeObjectURL(url);
    const canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);
    const fontSize = Math.max(16, Math.round(img.width * 0.045));
    ctx.font = `bold ${fontSize}px Inter, system-ui, sans-serif`;
    ctx.textAlign = 'right';
    ctx.textBaseline = 'bottom';
    ctx.shadowColor = 'rgba(0,0,0,0.6)';
    ctx.shadowBlur = 6;
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    const pad = fontSize * 0.7;
    ctx.fillText(text.slice(0, 40), img.width - pad, img.height - pad);
    const blob = await new Promise(res => canvas.toBlob(res, 'image/jpeg', 0.92));
    if (!blob) return file;
    return new File([blob], file.name.replace(/\.\w+$/, '.jpg'), { type: 'image/jpeg' });
  } catch {
    return file;
  }
}