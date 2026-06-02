import React from 'react';
import { CheckCircle, BadgeCheck, Building2, Gem, Crown } from 'lucide-react';

export const VERIFICATION_CONFIG = {
  verified:  { 
    label: 'Vérifié',   
    icon: CheckCircle, 
    color: 'text-sky-400',     
    border: 'border-sky-400/40',     
    bg: 'bg-sky-400/10',
    description: 'Identité confirmée.',
    price: '5€'
  },
  pro: { 
    label: 'Pro',       
    icon: Gem,         
    color: 'text-emerald-400', 
    border: 'border-emerald-400/40', 
    bg: 'bg-emerald-400/10',
    description: 'Activité professionnelle vérifiée.',
    price: '10€'
  },
  certified: { 
    label: 'Certifié',  
    icon: BadgeCheck,  
    color: 'text-amber-400',   
    border: 'border-amber-400/40',   
    bg: 'bg-amber-400/10',
    description: 'Expertise reconnue.',
    price: '20€'
  },
  official:  { 
    label: 'Officiel',  
    icon: Building2,   
    color: 'text-purple-400',  
    border: 'border-purple-400/40',  
    bg: 'bg-purple-400/10',
    description: 'Organisation, marque ou entité officielle.',
    price: '40€'
  },
  supreme:   { 
    label: 'Suprême',   
    icon: Crown,       
    color: 'text-yellow-300',  
    border: 'border-yellow-400/60',  
    bg: 'bg-yellow-400/15', 
    gradient: true,
    description: 'Badge exceptionnel attribué uniquement sur invitation.',
    price: '👑'
  },
};

export default function VerificationChip({ type, size = 'sm', iconOnly = false }) {
  const cfg = VERIFICATION_CONFIG[type];
  if (!cfg) return null;
  const Icon = cfg.icon;
  
  if (iconOnly) {
    return (
      <div className={`inline-flex items-center justify-center border rounded-full ${cfg.border} ${cfg.bg} ${
        size === 'sm' ? 'w-6 h-6' : 'w-8 h-8'
      } cursor-help group relative`} title={`${cfg.label} • ${cfg.description}`}>
        <Icon className={`${size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'} ${cfg.color}`} />
        <span className="hidden group-hover:block absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap bg-background border border-border rounded-lg px-2 py-1 text-[10px] font-inter z-50">
          {cfg.description}
        </span>
      </div>
    );
  }
  
  return (
    <span className={`inline-flex items-center gap-1 font-mono border rounded-full ${
      size === 'sm' ? 'text-[10px] px-2 py-0.5' : 'text-xs px-2.5 py-1'
    } ${cfg.border} ${cfg.bg} group relative cursor-help`} title={cfg.description}>
      <Icon className={`${size === 'sm' ? 'w-2.5 h-2.5' : 'w-3.5 h-3.5'} ${cfg.color}`} />
      <span className={cfg.color}>{cfg.label}</span>
      <span className="hidden group-hover:block absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap bg-background border border-border rounded-lg px-2 py-1 text-[10px] font-inter z-50 text-foreground">
        {cfg.description}
      </span>
    </span>
  );
}