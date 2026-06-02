import React from 'react';
import { VERIFICATION_CONFIG } from './VerificationChip';
import BadgePopup from './BadgePopup';

// Forme seal/badge style Twitter-Meta Verified (étoile à 12 pointes)
const SEAL_PATH = "M12 2 L13.8 5.2 L17.4 4.2 L17.6 7.9 L21.1 9.2 L19.5 12.5 L21.8 15.5 L18.5 17.3 L18.3 21 L14.7 20.3 L12 23 L9.3 20.3 L5.7 21 L5.5 17.3 L2.2 15.5 L4.5 12.5 L2.9 9.2 L6.4 7.9 L6.6 4.2 L10.2 5.2 Z";

const bgColorMap = {
  'text-sky-400':     '#0ea5e9',
  'text-amber-400':   '#f59e0b',
  'text-purple-400':  '#a855f7',
  'text-emerald-400': '#10b981',
  'text-yellow-300':  null,
};

export default function VerificationIcons({ verifications = [], size = 'sm' }) {
  if (!verifications?.length) return null;

  const s = size === 'sm' ? 20 : 24;
  const iconSize = size === 'sm' ? 10 : 12;

  return (
    <>
      {verifications.map(key => {
        const cfg = VERIFICATION_CONFIG[key];
        if (!cfg) return null;
        const Icon = cfg.icon;
        const isGold = cfg.gradient;
        const fillColor = isGold ? null : (bgColorMap[cfg.color] || '#0ea5e9');

        return (
          <BadgePopup key={key} badgeKey={key}>
            <span
              className="inline-flex items-center justify-center flex-shrink-0 relative"
              style={{ width: s, height: s }}
            >
              <svg viewBox="0 0 25 25" width={s} height={s}>
                {isGold && (
                  <defs>
                    <linearGradient id={`gold-${key}`} x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#f59e0b" />
                      <stop offset="50%" stopColor="#fde68a" />
                      <stop offset="100%" stopColor="#b45309" />
                    </linearGradient>
                  </defs>
                )}
                <path
                  d="M12.5 1.5 L14.6 5.1 L18.7 4 L18.9 8.2 L22.8 9.7 L21 13.3 L23.5 16.6 L19.8 18.6 L19.6 22.8 L15.5 22 L12.5 24.5 L9.5 22 L5.4 22.8 L5.2 18.6 L1.5 16.6 L4 13.3 L2.2 9.7 L6.1 8.2 L6.3 4 L10.4 5.1 Z"
                  fill={isGold ? `url(#gold-${key})` : fillColor}
                  style={isGold ? { filter: 'drop-shadow(0 0 3px rgba(245,158,11,0.5))' } : {}}
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center">
                <Icon
                  style={{
                    width: iconSize,
                    height: iconSize,
                    color: isGold ? '#78350f' : 'white',
                    strokeWidth: 3.5,
                    flexShrink: 0,
                  }}
                />
              </span>
            </span>
          </BadgePopup>
        );
      })}
    </>
  );
}