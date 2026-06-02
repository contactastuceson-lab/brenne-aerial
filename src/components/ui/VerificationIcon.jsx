import React from 'react';
import { VERIFICATION_CONFIG } from './VerificationChip';
import BadgePopup from './BadgePopup';

const bgColorMap = {
  'text-sky-400':     '#0ea5e9',
  'text-amber-400':   '#f59e0b',
  'text-purple-400':  '#a855f7',
  'text-emerald-400': '#10b981',
  'text-yellow-300':  '#f59e0b',
};

// Path exact du badge Twitter/X verified (seal shape officiel)
const TWITTER_SEAL = "M22.25 12c0-1.43-.88-2.67-2.19-3.34.46-1.39.2-2.9-.81-3.91s-2.52-1.27-3.91-.81c-.66-1.31-1.91-2.19-3.34-2.19s-2.67.88-3.33 2.19c-1.4-.46-2.91-.2-3.92.81s-1.26 2.52-.8 3.91C3.38 9.33 2.5 10.57 2.5 12s.88 2.67 2.19 3.34c-.46 1.39-.2 2.9.81 3.91s2.52 1.26 3.91.8c.66 1.31 1.9 2.19 3.33 2.19s2.68-.88 3.34-2.19c1.39.46 2.9.2 3.91-.81s1.27-2.52.81-3.91c1.31-.67 2.19-1.91 2.19-3.34z";

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
        const isSupreme = key === 'supreme';
        const isGold = cfg.gradient;
        const fill = bgColorMap[cfg.color] || '#0ea5e9';

        const supremeSize = size === 'sm' ? 28 : 34;
        const supremeIconSize = size === 'sm' ? 13 : 16;
        const finalSize = isSupreme ? supremeSize : s;
        const finalIconSize = isSupreme ? supremeIconSize : iconSize;

        return (
          <BadgePopup key={key} badgeKey={key}>
            <span
              className="inline-flex items-center justify-center flex-shrink-0 relative"
              style={{
                width: finalSize,
                height: finalSize,
                filter: isSupreme ? 'drop-shadow(0 0 6px rgba(245,158,11,0.9)) drop-shadow(0 0 12px rgba(245,158,11,0.5))' : 'none',
              }}
            >
              {/* Seal shape */}
              <svg
                viewBox="0 0 24 24"
                width={finalSize}
                height={finalSize}
                style={{ position: 'absolute', inset: 0 }}
              >
                <path fill={fill} d={TWITTER_SEAL} />
              </svg>
              {/* Icon on top */}
              <span style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon
                  style={{
                    width: finalIconSize,
                    height: finalIconSize,
                    color: isGold ? '#451a03' : '#050d1a',
                    strokeWidth: 3,
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