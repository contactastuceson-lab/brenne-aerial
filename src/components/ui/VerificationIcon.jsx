import React from 'react';
import { VERIFICATION_CONFIG } from './VerificationChip';
import BadgePopup from './BadgePopup';

const bgColorMap = {
  'text-sky-400':     '#0ea5e9',
  'text-amber-400':   '#f59e0b',
  'text-purple-400':  '#a855f7',
  'text-emerald-400': '#10b981',
  'text-yellow-300':  null,
};

// Seal badge shape — même path que Twitter/Meta verified (12-pointed star)
function SealBadge({ fill, glow, size, children }) {
  return (
    <span className="inline-flex items-center justify-center flex-shrink-0 relative" style={{ width: size, height: size }}>
      <svg viewBox="0 0 100 100" width={size} height={size} style={{ position: 'absolute', inset: 0 }}>
        <defs>
          {glow && (
            <filter id="glow">
              <feGaussianBlur stdDeviation="2" result="coloredBlur" />
              <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          )}
        </defs>
        <path
          fill={fill}
          filter={glow ? 'url(#glow)' : undefined}
          d="M50 5
             L57 20 L73 15 L72 32 L88 35 L80 50
             L88 65 L72 68 L73 85 L57 80 L50 95
             L43 80 L27 85 L28 68 L12 65 L20 50
             L12 35 L28 32 L27 15 L43 20 Z"
        />
      </svg>
      <span style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {children}
      </span>
    </span>
  );
}

export default function VerificationIcons({ verifications = [], size = 'sm' }) {
  if (!verifications?.length) return null;

  const s = size === 'sm' ? 18 : 22;
  const iconSize = size === 'sm' ? 9 : 11;

  return (
    <>
      {verifications.map(key => {
        const cfg = VERIFICATION_CONFIG[key];
        if (!cfg) return null;
        const Icon = cfg.icon;
        const isGold = cfg.gradient;
        const fill = isGold ? '#f59e0b' : (bgColorMap[cfg.color] || '#0ea5e9');

        return (
          <BadgePopup key={key} badgeKey={key}>
            <SealBadge fill={fill} glow={isGold} size={s}>
              <Icon
                style={{
                  width: iconSize,
                  height: iconSize,
                  color: isGold ? '#451a03' : 'white',
                  strokeWidth: 3,
                  flexShrink: 0,
                }}
              />
            </SealBadge>
          </BadgePopup>
        );
      })}
    </>
  );
}