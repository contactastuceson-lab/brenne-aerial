import { useState, useEffect } from 'react';
import { Coins, Plus } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import CreditPacksDialog from './CreditPacksDialog';

/**
 * Petite pilule "crédits + Recharger" à déposer partout sur le site.
 * - Affiche le solde courant de l'utilisateur (referral_credits)
 * - Au clic, ouvre le dialog d'achat de crédits (Stripe)
 * - Renvoie null si l'utilisateur n'est pas authentifié
 */
export default function CreditPill({ credits: propCredits, className = '' }) {
  const [open, setOpen] = useState(false);
  const [credits, setCredits] = useState(propCredits ?? null);

  useEffect(() => {
    if (propCredits != null) { setCredits(propCredits); return; }
    let active = true;
    base44.auth.isAuthenticated().then(ok => {
      if (!ok || !active) return;
      base44.auth.me().then(me => { if (active) setCredits(me.referral_credits || 0); }).catch(() => {});
    }).catch(() => {});
    return () => { active = false; };
  }, [propCredits]);

  if (credits === null) return null;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-primary/10 border border-primary/30 text-primary font-grotesk font-bold text-xs hover:bg-primary/20 active:scale-95 transition-all ${className}`}
      >
        <Coins className="w-3.5 h-3.5" />
        <span>{credits}</span>
        <Plus className="w-3 h-3 ml-0.5" />
      </button>
      <CreditPacksDialog open={open} onClose={() => setOpen(false)} />
    </>
  );
}