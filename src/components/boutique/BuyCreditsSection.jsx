import { useState } from 'react';
import { motion } from 'framer-motion';
import { Coins, CreditCard, Loader2, Zap, Sparkles, ShieldCheck } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

const PACKS = [
  { id: 'pack_50',   credits: 50,   price: '2,99 €' },
  { id: 'pack_120',  credits: 120,  price: '5,99 €',  popular: true },
  { id: 'pack_250',  credits: 250,  price: '9,99 €' },
  { id: 'pack_500',  credits: 500,  price: '17,99 €' },
  { id: 'pack_1000', credits: 1000, price: '29,99 €' },
  { id: 'pack_2000', credits: 2000, price: '49,99 €' },
];

export default function BuyCreditsSection() {
  const [buying, setBuying] = useState(null);

  const handleBuy = async (pack) => {
    setBuying(pack.id);
    try {
      const res = await base44.functions.invoke('createCreditPurchase', { packId: pack.id });
      const data = res?.data || res;
      if (data?.url) {
        window.location.href = data.url;
      } else {
        toast.error(data?.error || 'Erreur lors de la création du paiement');
      }
    } catch (err) {
      toast.error(err?.message || 'Erreur lors de la création du paiement');
    }
    setBuying(null);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-6 rounded-2xl border border-primary/30 bg-primary/5 p-4"
    >
      <div className="flex items-center gap-2 mb-1">
        <CreditCard className="w-4 h-4 text-primary" />
        <h2 className="font-grotesk font-bold text-sm text-foreground">Recharger mes crédits</h2>
      </div>
      <p className="font-inter text-xs text-muted-foreground mb-4">
        Achetez des crédits Eza en argent réel et dépensez-les dans la boutique. Paiement sécurisé via Stripe.
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
        {PACKS.map(p => {
          const isBuying = buying === p.id;
          return (
            <button
              key={p.id}
              onClick={() => handleBuy(p)}
              disabled={!!buying}
              className={`relative rounded-xl border p-3 flex flex-col items-center text-center transition-all hover-lift disabled:opacity-50 ${
                p.popular ? 'border-primary/50 bg-primary/10' : 'border-border bg-card hover:border-primary/30'
              }`}
            >
              {p.popular && (
                <span className="absolute -top-2 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-primary text-primary-foreground text-[8px] font-mono font-bold uppercase tracking-wider flex items-center gap-1 whitespace-nowrap">
                  <Sparkles className="w-2.5 h-2.5" /> Populaire
                </span>
              )}
              <div className="flex items-center gap-1 mb-1">
                <Coins className="w-4 h-4 text-primary" />
                <span className="font-grotesk font-black text-lg text-foreground">{p.credits}</span>
              </div>
              <span className="font-grotesk font-bold text-sm text-foreground">{p.price}</span>
              {isBuying ? (
                <Loader2 className="w-3 h-3 animate-spin text-primary mt-1.5" />
              ) : (
                <span className="font-mono text-[9px] text-muted-foreground/60 mt-1 flex items-center gap-1">
                  <Zap className="w-2.5 h-2.5" /> Acheter
                </span>
              )}
            </button>
          );
        })}
      </div>

      <p className="font-mono text-[9px] text-muted-foreground/50 mt-3 flex items-center justify-center gap-1">
        <ShieldCheck className="w-3 h-3" /> Paiement 100% sécurisé · Crédits crédités immédiatement
      </p>
    </motion.div>
  );
}