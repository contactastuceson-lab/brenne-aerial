import React from 'react';
import { VERIFICATION_CONFIG } from './VerificationChip';

const bgMap = {
  'text-sky-400':     'bg-sky-500',
  'text-amber-400':   'bg-amber-500',
  'text-purple-400':  'bg-purple-500',
  'text-emerald-400': 'bg-emerald-500',
  'text-chart-5':     'bg-amber-400',
};

export default function VerificationIcons({ verifications = [], size = 'sm' }) {
  if (!verifications?.length) return null;

  const dim = size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4';
  const iconDim = size === 'sm' ? 'w-2 h-2' : 'w-2.5 h-2.5';

  return (
    <>
      {verifications.map(key => {
        const cfg = VERIFICATION_CONFIG[key];
        if (!cfg) return null;
        const Icon = cfg.icon;
        const bg = bgMap[cfg.color] || 'bg-sky-500';
        return (
          <span
            key={key}
            title={cfg.label}
            className={`inline-flex items-center justify-center ${dim} rounded-full ${bg} flex-shrink-0`}
          >
            <Icon className={`${iconDim} text-white`} strokeWidth={3} />
          </span>
        );
      })}
    </>
  );
}