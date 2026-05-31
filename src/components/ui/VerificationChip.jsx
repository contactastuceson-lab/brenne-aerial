import React from 'react';
import { CheckCircle, BadgeCheck, Building2, Gem, Crown } from 'lucide-react';

export const VERIFICATION_CONFIG = {
  verified:  { label: 'Vérifié',   icon: CheckCircle, color: 'text-sky-400',     border: 'border-sky-400/40',     bg: 'bg-sky-400/10' },
  certified: { label: 'Certifié',  icon: BadgeCheck,  color: 'text-amber-400',   border: 'border-amber-400/40',   bg: 'bg-amber-400/10' },
  official:  { label: 'Officiel',  icon: Building2,   color: 'text-purple-400',  border: 'border-purple-400/40',  bg: 'bg-purple-400/10' },
  pro:       { label: 'Pro',       icon: Gem,         color: 'text-emerald-400', border: 'border-emerald-400/40', bg: 'bg-emerald-400/10' },
  supreme:   { label: 'Suprême',   icon: Crown,       color: 'text-yellow-300',  border: 'border-yellow-400/60',  bg: 'bg-yellow-400/15', gradient: true },
};

export default function VerificationChip({ type, size = 'sm', iconOnly = false }) {
  const cfg = VERIFICATION_CONFIG[type];
  if (!cfg) return null;
  const Icon = cfg.icon;
  
  if (iconOnly) {
    return (
      <div className={`inline-flex items-center justify-center border rounded-full ${cfg.border} ${cfg.bg} ${
        size === 'sm' ? 'w-6 h-6' : 'w-8 h-8'
      }`} title={cfg.label}>
        <Icon className={`${size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'} ${cfg.color}`} />
      </div>
    );
  }
  
  return (
    <span className={`inline-flex items-center gap-1 font-mono border rounded-full ${
      size === 'sm' ? 'text-[10px] px-2 py-0.5' : 'text-xs px-2.5 py-1'
    } ${cfg.border} ${cfg.bg}`}>
      <Icon className={`${size === 'sm' ? 'w-2.5 h-2.5' : 'w-3.5 h-3.5'} ${cfg.color}`} />
      <span className={cfg.color}>{cfg.label}</span>
    </span>
  );
}