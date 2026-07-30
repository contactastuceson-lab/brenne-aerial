import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Crown, Building2, Rocket, Sparkles, CalendarClock, XCircle, Loader2, ArrowRight } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { getActiveTierLabel } from '@/lib/subscriptionGating';

const TIER_META = {
  Premium: { icon: Sparkles, color: 'text-primary', bg: 'bg-primary/10', border: 'border-primary/30' },
  Business: { icon: Building2, color: 'text-amber-400', bg: 'bg-amber-400/10', border: 'border-amber-400/30' },
  Enterprise: { icon: Rocket, color: 'text-violet-400', bg: 'bg-violet-400/10', border: 'border-violet-400/30' },
  VIP: { icon: Crown, color: 'text-pink-400', bg: 'bg-pink-400/10', border: 'border-pink-400/30' },
};

const TIER_KEY = {
  Enterprise: 'enterprise_until',
  VIP: 'vip_until',
  Business: 'business_until',
  Premium: 'premium_until',
};

export default function MySubscriptionCard({ perks, onCancelled }) {
  const [cancelling, setCancelling] = useState(false);
  const label = getActiveTierLabel(perks);
  const tierKey = label ? TIER_KEY[label] : null;
  const expiry = tierKey ? perks[tierKey] : null;

  const handleCancel = async () => {
    if (!confirm('Annuler votre abonnement maintenant ? Vous perdrez immédiatement les avantages associés.')) return;
    setCancelling(true);
    try {
      const res = await base44.functions.invoke('cancelMySubscription', {});
      if (res.data?.success) {
        toast.success('Abonnement annulé');
        onCancelled?.();
      } else {
        toast.error(res.data?.error || 'Erreur lors de l\'annulation');
      }
    } catch (e) {
      toast.error(e?.message || 'Erreur lors de l\'annulation');
    } finally {
      setCancelling(false);
    }
  };

  if (!label) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-card/50 p-5">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-muted/30 border border-border flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-muted-foreground/50" />
          </div>
          <div>
            <h3 className="font-grotesk font-bold text-sm">Aucun abonnement Eza actif</h3>
            <p className="font-inter text-xs text-muted-foreground">Plan gratuit — 500 Mo, 5 posts programmés/mois.</p>
          </div>
        </div>
        <Link to="/premium" className="inline-flex items-center gap-1.5 mt-3 px-4 py-2 rounded-full bg-primary text-primary-foreground font-grotesk font-bold text-xs hover:bg-primary/90 transition-all">
          Passer Premium <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    );
  }

  const meta = TIER_META[label] || TIER_META.Premium;
  const Icon = meta.icon;
  const daysLeft = expiry ? Math.max(0, Math.ceil((new Date(expiry).getTime() - Date.now()) / 86400000)) : null;

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      className={`rounded-2xl border ${meta.border} ${meta.bg} p-5`}>
      <div className="flex items-start gap-3">
        <div className={`w-11 h-11 rounded-xl border ${meta.border} flex items-center justify-center flex-shrink-0 ${meta.bg}`}>
          <Icon className={`w-6 h-6 ${meta.color}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className={`font-grotesk font-black text-base ${meta.color}`}>Abonnement {label}</h3>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono border ${meta.border} ${meta.bg} ${meta.color}`}>Actif</span>
          </div>
          {daysLeft !== null && (
            <div className={`inline-flex items-center gap-1.5 mt-2 px-3 py-1.5 rounded-full bg-background/60 border ${meta.border}`}>
              <CalendarClock className={`w-3.5 h-3.5 ${meta.color}`} />
              <span className="font-mono text-[11px] text-foreground/80">{daysLeft} jours restants</span>
            </div>
          )}
        </div>
      </div>
      <div className="flex gap-2 mt-4 flex-wrap">
        <Link to="/premium" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-primary text-primary-foreground font-grotesk font-bold text-xs hover:bg-primary/90 transition-all">
          Changer d'offre <ArrowRight className="w-3.5 h-3.5" />
        </Link>
        <button onClick={handleCancel} disabled={cancelling}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-destructive/30 text-destructive hover:bg-destructive/10 font-grotesk font-bold text-xs transition-all disabled:opacity-50">
          {cancelling ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <XCircle className="w-3.5 h-3.5" />}
          Annuler mon abonnement
        </button>
      </div>
    </motion.div>
  );
}