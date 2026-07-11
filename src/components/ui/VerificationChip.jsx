import { Check } from 'lucide-react';

export const VERIFICATION_CONFIG = {
  verified: { label: 'Vérifié', color: 'text-sky-400', border: 'border-sky-400/40', bg: 'bg-sky-400/10', description: 'Identité confirmée.', price: '5€' },
  pro: { label: 'Pro', color: 'text-emerald-400', border: 'border-emerald-400/40', bg: 'bg-emerald-400/10', description: 'Activité professionnelle vérifiée.', price: '10€' },
  certified: { label: 'Certifié', color: 'text-amber-400', border: 'border-amber-400/40', bg: 'bg-amber-400/10', description: 'Expertise reconnue.', price: '20€' },
  official: { label: 'Officiel', color: 'text-purple-400', border: 'border-purple-400/40', bg: 'bg-purple-400/10', description: 'Organisation, marque ou entité officielle.', price: '40€' },
  supreme: { label: 'Suprême', color: 'text-yellow-300', border: 'border-yellow-400/60', bg: 'bg-yellow-400/15', description: 'Badge exceptionnel attribué sur invitation.', price: '—' },
  government: { label: 'Gouvernement et multilatéral', color: 'text-zinc-300', border: 'border-zinc-400/50', bg: 'bg-zinc-500/20', description: 'Compte d’une institution gouvernementale ou multilatérale vérifiée.', price: '—', shape: 'institutional' },
};

export default function VerificationChip({ type, size = 'sm', iconOnly = false }) {
  const cfg = VERIFICATION_CONFIG[type];
  if (!cfg) return null;
  const dimensions = size === 'sm' ? 'w-6 h-6' : 'w-8 h-8';
  const iconSize = size === 'sm' ? 'w-3 h-3' : 'w-4 h-4';
  if (iconOnly) return <span title={`${cfg.label} • ${cfg.description}`} className={`inline-flex ${dimensions} items-center justify-center border ${cfg.shape === 'institutional' ? 'rounded-md' : 'rounded-full'} ${cfg.border} ${cfg.bg}`}><Check className={`${iconSize} text-[#050d1a]`} strokeWidth={3.5} /></span>;
  return <span title={cfg.description} className={`inline-flex items-center gap-1 border ${cfg.shape === 'institutional' ? 'rounded-md' : 'rounded-full'} ${size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs'} ${cfg.border} ${cfg.bg}`}><Check className={`${size === 'sm' ? 'w-2.5 h-2.5' : 'w-3.5 h-3.5'} text-[#050d1a]`} strokeWidth={3.5} /><span className={cfg.color}>{cfg.label}</span></span>;
}