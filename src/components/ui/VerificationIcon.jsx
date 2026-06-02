import React from 'react';
import { VERIFICATION_CONFIG } from './VerificationChip';
import BadgePopup from './BadgePopup';

const colorMap = {
  'text-sky-400':     '#38bdf8',
  'text-amber-400':   '#fbbf24',
  'text-purple-400':  '#c084fc',
  'text-emerald-400': '#34d399',
  'text-yellow-300':  '#fde047',
};

export default function VerificationIcons({ verifications = [], size = 'sm' }) {
  if (!verifications?.length) return null;

  const iconSize = size === 'sm' ? 16 : 20;

  return (
    <>
      {verifications.map(key => {
        const cfg = VERIFICATION_CONFIG[key];
        if (!cfg) return null;
        const Icon = cfg.icon;
        const color = colorMap[cfg.color] || '#38bdf8';

        return (
          <BadgePopup key={key} badgeKey={key}>
            <Icon
              style={{
                width: iconSize,
                height: iconSize,
                color,
                flexShrink: 0,
                filter: cfg.gradient ? 'drop-shadow(0 0 4px rgba(251,191,36,0.6))' : undefined,
              }}
              strokeWidth={2}
            />
          </BadgePopup>
        );
      })}
    </>
  );
}