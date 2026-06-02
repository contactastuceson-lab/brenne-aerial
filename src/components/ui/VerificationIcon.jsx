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

export default function VerificationIcons({ verifications = [], size = 'sm' }) {
  if (!verifications?.length) return null;

  const s = size === 'sm' ? 16 : 20;
  const iconSize = size === 'sm' ? 9 : 11;

  return (
    <>
      {verifications.map(key => {
        const cfg = VERIFICATION_CONFIG[key];
        if (!cfg) return null;
        const Icon = cfg.icon;
        const isGold = cfg.gradient;
        const bg = isGold
          ? 'linear-gradient(135deg, #f59e0b, #fde68a, #b45309)'
          : bgColorMap[cfg.color] || '#0ea5e9';

        return (
          <BadgePopup key={key} badgeKey={key}>
            <span
              className="inline-flex items-center justify-center flex-shrink-0 rounded-full"
              style={{
                width: s,
                height: s,
                background: bg,
                boxShadow: isGold ? '0 0 6px rgba(245,158,11,0.5)' : undefined,
              }}
            >
              <Icon
                style={{
                  width: iconSize,
                  height: iconSize,
                  color: isGold ? '#78350f' : 'white',
                  strokeWidth: 2.5,
                  flexShrink: 0,
                }}
              />
            </span>
          </BadgePopup>
        );
      })}
    </>
  );
}