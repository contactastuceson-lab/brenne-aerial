import { useId } from 'react';

// Scalloped rosette path with checkmark cut out (same shape as user verification marks)
// The checkmark subpath is wound opposite to the rosette so fill-rule nonzero creates a hole.
const ROSETTE_PATH = 'M22.5 12.5c0-1.58-.875-2.95-2.148-3.6.154-.435.238-.905.238-1.4 0-2.21-1.71-3.99-3.818-3.99-.48 0-.941.1-1.358.275C14.77 2.515 13.435 1.5 11.89 1.5c-1.545 0-2.88 1.015-3.513 2.285-.417-.175-.878-.275-1.358-.275-2.108 0-3.818 1.78-3.818 3.99 0 .495.084.965.238 1.4-1.273.65-2.148 2.02-2.148 3.6 0 1.58.875 2.95 2.148 3.6-.154.435-.238.905-.238 1.4 0 2.21 1.71 3.99 3.818 3.99.48 0 .941-.1 1.358-.275.633 1.27 1.968 2.285 3.513 2.285 1.545 0 2.88-1.015 3.513-2.285.417.175.878.275 1.358.275 2.108 0 3.818-1.78 3.818-3.99 0-.495-.084-.965-.238-1.4 1.273-.65 2.148-2.02 2.148-3.6zm-12.72 3.425l-3.64-3.51 1.4-1.35 2.14 2.065 5.22-5.03 1.4 1.35-6.52 6.285z';

const LEVEL_CONFIG = {
  partner: { label: 'Partenaire', color: '#38aadc', gradient: ['#7dd3fc', '#38bdf8', '#0284c7'] },
  certified: { label: 'Certifié', color: '#22c55e', gradient: ['#86efac', '#22c55e', '#15803d'] },
  premium: { label: 'Premium', color: '#a855f7', gradient: ['#d8b4fe', '#a855f7', '#7c3aed'] },
  gold: { label: 'Gold', color: '#f59e0b', gradient: ['#fde047', '#f59e0b', '#b45309'] },
};

/**
 * PartnerLevelMark — renders the partnership level as a verification-style SVG rosette
 * with a cut-out checkmark (coche), identical to user verification badges.
 * @param {string} level - partnership_level value (partner|certified|premium|gold)
 * @param {string} size - CSS size (e.g. '18px', '1.1em')
 * @param {number} marginLeft
 */
export default function PartnerLevelMark({ level = 'partner', size = '18px', marginLeft = 0, className = '' }) {
  const uniqueId = useId().replace(/:/g, '');
  const gradId = `partnerLvlGrad-${uniqueId}`;
  const cfg = LEVEL_CONFIG[level] || LEVEL_CONFIG.partner;

  return (
    <svg viewBox="0 0 24 24" aria-label={cfg.label} className={className} style={{ width: size, height: size, verticalAlign: 'text-bottom', marginLeft }}>
      <defs>
        <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
          {cfg.gradient.map((c, i) => <stop key={i} offset={`${(i / (cfg.gradient.length - 1)) * 100}%`} stopColor={c} />)}
        </linearGradient>
      </defs>
      <path fill={`url(#${gradId})`} fillRule="evenodd" d={ROSETTE_PATH} />
    </svg>
  );
}

export { LEVEL_CONFIG };