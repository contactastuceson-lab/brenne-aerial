import { useId } from 'react';

// Scalloped rosette path (same shape as verification marks)
const ROSETTE_PATH = 'M22.5 12.5c0-1.58-.875-2.95-2.148-3.6.154-.435.238-.905.238-1.4 0-2.21-1.71-3.99-3.818-3.99-.48 0-.941.1-1.358.275C14.77 2.515 13.435 1.5 11.89 1.5c-1.545 0-2.88 1.015-3.513 2.285-.417-.175-.878-.275-1.358-.275-2.108 0-3.818 1.78-3.818 3.99 0 .495.084.965.238 1.4-1.273.65-2.148 2.02-2.148 3.6 0 1.58.875 2.95 2.148 3.6-.154.435-.238.905-.238 1.4 0 2.21 1.71 3.99 3.818 3.99.48 0 .941-.1 1.358-.275.633 1.27 1.968 2.285 3.513 2.285 1.545 0 2.88-1.015 3.513-2.285.417.175.878.275 1.358.275 2.108 0 3.818-1.78 3.818-3.99 0-.495-.084-.965-.238-1.4 1.273-.65 2.148-2.02 2.148-3.6z';

/**
 * PartnerBadgeMark — renders a partner badge as a verification-style SVG rosette.
 * @param {object} badge - The PartnerBadge entity { name, color, icon, description }
 * @param {string} size - CSS size (e.g. '1.1em', '16px')
 * @param {string} className
 */
export default function PartnerBadgeMark({ badge, size = '1.1em', className = '', showIcon = true, marginLeft = '2px' }) {
  const uniqueId = useId().replace(/:/g, '');
  const gradId = `partnerBadgeGrad-${uniqueId}`;
  const color = badge?.color || '#38aadc';
  const icon = badge?.icon || '🏆';

  // Generate a slightly darker shade for the gradient end
  const darker = shadeColor(color, -25);

  return (
    <svg viewBox="0 0 24 24" aria-label={badge?.name || 'Badge'} className={className} style={{ width: size, height: size, verticalAlign: 'text-bottom', marginLeft }}>
      <defs>
        <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={color} />
          <stop offset="100%" stopColor={darker} />
        </linearGradient>
      </defs>
      <path fill={`url(#${gradId})`} d={ROSETTE_PATH} />
      {showIcon && (
        <text x="12" y="15" textAnchor="middle" fontSize="8" style={{ pointerEvents: 'none' }}>{icon}</text>
      )}
      {!showIcon && (
        <path fill="#fff" d="M10.5 16.25l-4-4 1.41-1.42L10.5 13.42l6.59-6.59L18.5 8.25z" />
      )}
    </svg>
  );
}

// Helper: darken/lighten a hex color
function shadeColor(hex, percent) {
  const num = parseInt(hex.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const R = Math.max(0, Math.min(255, (num >> 16) + amt));
  const G = Math.max(0, Math.min(255, ((num >> 8) & 0x00ff) + amt));
  const B = Math.max(0, Math.min(255, (num & 0x0000ff) + amt));
  return `#${((R << 16) | (G << 8) | B).toString(16).padStart(6, '0')}`;
}

/**
 * PartnerBadges — renders multiple partner badges inline.
 * @param {array} badges - Array of PartnerBadge entities
 * @param {string} size
 * @param {object} badgeMap - Optional map of badge id -> badge for resolving ids
 * @param {array} badgeIds - Array of badge IDs to resolve via badgeMap
 */
export function PartnerBadges({ badges = [], badgeIds = [], badgeMap = {}, size = '1.1em', showIcon = true, max = 5 }) {
  const resolved = badges.length > 0 ? badges : badgeIds.map(id => badgeMap[id]).filter(Boolean);
  if (resolved.length === 0) return null;
  const shown = resolved.slice(0, max);
  const overflow = resolved.length - shown.length;

  return (
    <span className="inline-flex items-center gap-0.5">
      {shown.map((b, i) => (
        <span key={b.id || i} title={b.description ? `${b.name}: ${b.description}` : b.name} className="inline-flex">
          <PartnerBadgeMark badge={b} size={size} showIcon={showIcon} marginLeft={i === 0 ? 0 : 1} />
        </span>
      ))}
      {overflow > 0 && (
        <span className="text-[10px] text-muted-foreground font-mono ml-0.5">+{overflow}</span>
      )}
    </span>
  );
}