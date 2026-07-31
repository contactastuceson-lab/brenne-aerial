import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Coins, CheckCircle2, ArrowRight, Shield, Sparkles, Crown, Gem, Trophy, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import VerificationMark from '@/components/ui/VerificationMark';

// Métadonnées d'affichage par badge (couleurs + description)
const BADGE_META = {
  verified: {
    label: 'Verified',
    tagline: 'La coche bleue — identité confirmée.',
    color: 'text-sky-400',
    border: 'border-sky-400/40',
    bg: 'bg-sky-400/10',
    ring: 'ring-sky-400/50',
    chip: 'text-sky-400 bg-sky-400/10 border-sky-400/30',
    cheaper: true,
  },
  pro: {
    label: 'Pro',
    tagline: 'La coche verte — statut professionnel, plus prestige.',
    color: 'text-emerald-400',
    border: 'border-emerald-400/40',
    bg: 'bg-emerald-400/10',
    ring: 'ring-emerald-400/50',
    chip: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/30',
    cheaper: false,
  },
  certified: {
    label: 'Certifié',
    tagline: 'La coche dorée — expertise reconnue.',
    color: 'text-amber-400',
    border: 'border-amber-400/40',
    bg: 'bg-amber-400/10',
    ring: 'ring-amber-400/50',
    chip: 'text-amber-400 bg-amber-400/10 border-amber-400/30',
    cheaper: true,
  },
  official: {
    label: 'Officiel',
    tagline: 'La coche violette — entité officielle reconnue, plus prestige.',
    color: 'text-purple-400',
    border: 'border-purple-400/40',
    bg: 'bg-purple-400/10',
    ring: 'ring-purple-400/50',
    chip: 'text-purple-400 bg-purple-400/10 border-purple-400/30',
    cheaper: false,
  },
};

const TIER_ICON = { premium: Sparkles, business: Crown, enterprise: Trophy };

export default function SubscriptionChoiceDialog({
  tier,
  label,
  desc,
  credits,
  verifications = [],
  onClose,
  onChoose,
}) {
  const variants = (
    ({
      premium: [
        { id: 'premium_1m', label: 'Premium 1 mois', duration: '1 mois', cost: 50, badgeTier: 'verified' },
        { id: 'premium_3m', label: 'Premium 3 mois', duration: '3 mois', cost: 130, badgeTier: 'verified' },
        { id: 'premium_1y', label: 'Premium 12 mois', duration: '12 mois', cost: 450, badgeTier: 'verified' },
        { id: 'premium_pro_1m', label: 'Premium Pro 1 mois', duration: '1 mois', cost: 120, badgeTier: 'pro' },
        { id: 'premium_pro_3m', label: 'Premium Pro 3 mois', duration: '3 mois', cost: 320, badgeTier: 'pro' },
        { id: 'premium_pro_1y', label: 'Premium Pro 12 mois', duration: '12 mois', cost: 1100, badgeTier: 'pro' },
      ],
      business: [
        { id: 'business_1m', label: 'Business 1 mois', duration: '1 mois', cost: 250, badgeTier: 'certified' },
        { id: 'business_3m', label: 'Business 3 mois', duration: '3 mois', cost: 680, badgeTier: 'certified' },
        { id: 'business_official_1m', label: 'Business Officiel 1 mois', duration: '1 mois', cost: 450, badgeTier: 'official' },
        { id: 'business_official_3m', label: 'Business Officiel 3 mois', duration: '3 mois', cost: 1200, badgeTier: 'official' },
      ],
      enterprise: [
        { id: 'enterprise_1m', label: 'Enterprise — Gouvernement (1 mois)', duration: '1 mois', cost: 600, badgeTier: 'government', requiresProofs: true },
      ],
    })[tier] || []
  );

  // Regrouper par badge (conserver l'ordre d'apparition)
  const groups = [];
  const seen = new Set();
  for (const v of variants) {
    if (!seen.has(v.badgeTier)) { seen.add(v.badgeTier); groups.push({ badgeTier: v.badgeTier, items: [] }); }
    groups.find(g => g.badgeTier === v.badgeTier).items.push(v);
  }

  const [selectedId, setSelectedId] = useState(null);
  const selected = variants.find(v => v.id === selectedId) || null;
  const canAfford = selected ? credits >= selected.cost : false;
  const TierIcon = TIER_ICON[tier] || Sparkles;

  const handleConfirm = () => {
    if (!selected || !canAfford) return;
    onChoose(selected);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center p-4"
        style={{ background: 'rgba(4,10,20,0.82)', backdropFilter: 'blur(6px)' }}
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.97 }}
          transition={{ type: 'spring', damping: 24, stiffness: 280 }}
          className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl border border-border bg-card"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 z-10 flex items-center gap-3 p-4 border-b border-border bg-card/95 backdrop-blur">
            <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
              <TierIcon className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-grotesk font-bold text-base text-foreground leading-tight">Choisissez votre badge</p>
              <p className="font-inter text-xs text-muted-foreground truncate">{label} — {desc}</p>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Solde */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Votre solde</span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20">
              <Coins className="w-3.5 h-3.5 text-primary" />
              <span className="font-grotesk font-black text-sm text-primary">{credits}</span>
              <span className="font-mono text-[9px] text-muted-foreground/60">crédits</span>
            </span>
          </div>

          {/* Groupes de badges */}
          <div className="p-4 space-y-5">
            {groups.map((group, gi) => {
              const meta = BADGE_META[group.badgeTier];
              const owned = verifications.includes(group.badgeTier);
              return (
                <div key={group.badgeTier}>
                  <div className="flex items-center gap-2 mb-2.5">
                    <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg border" style={{ borderColor: 'transparent' }}>
                      <VerificationMark type={group.badgeTier} size="1.2em" />
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className={`font-grotesk font-bold text-sm ${meta?.color || 'text-foreground'}`}>
                        Badge {meta?.label || group.badgeTier}
                        {meta && !meta.cheaper && (
                          <span className={`ml-2 inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[8px] font-mono border ${meta.chip}`}>
                            <Gem className="w-2.5 h-2.5" /> Plus prestige
                          </span>
                        )}
                      </p>
                      <p className="font-inter text-[11px] text-muted-foreground leading-snug">{meta?.tagline}</p>
                    </div>
                    {owned && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-mono border border-emerald-400/30 bg-emerald-400/10 text-emerald-400">
                        <CheckCircle2 className="w-2.5 h-2.5" /> Acquis
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {group.items.map(v => {
                      const active = selectedId === v.id;
                      const affordable = credits >= v.cost;
                      return (
                        <button
                          key={v.id}
                          onClick={() => setSelectedId(v.id)}
                          disabled={!affordable}
                          className={`relative text-left rounded-xl border p-3 transition-all ${
                            active ? `${meta?.border || 'border-primary/40'} ${meta?.bg || 'bg-primary/10'} ring-2 ${meta?.ring || 'ring-primary/40'}`
                              : affordable ? 'border-border bg-secondary/40 hover:border-primary/30 hover:bg-secondary/60'
                                : 'border-border/60 bg-muted/30 opacity-50 cursor-not-allowed'
                          }`}
                        >
                          <p className="font-grotesk font-bold text-xs text-foreground leading-tight">{v.label}</p>
                          <p className="font-mono text-[10px] text-muted-foreground/70 mt-0.5">{v.duration}</p>
                          <div className="flex items-center gap-1 mt-2">
                            <Coins className={`w-3 h-3 ${meta?.color || 'text-primary'}`} />
                            <span className={`font-mono text-xs font-bold ${meta?.color || 'text-primary'}`}>{v.cost}</span>
                            {!affordable && <Lock className="w-3 h-3 text-muted-foreground/50 ml-auto" />}
                            {active && <CheckCircle2 className={`w-3.5 h-3.5 ml-auto ${meta?.color || 'text-primary'}`} />}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer / confirm */}
          <div className="sticky bottom-0 z-10 p-4 border-t border-border bg-card/95 backdrop-blur">
            <Button
              onClick={handleConfirm}
              disabled={!selected || !canAfford}
              className="w-full gap-2"
            >
              {selected ? (
                canAfford ? (
                  <>
                    Réclamer — {selected.label}
                    <ArrowRight className="w-4 h-4" />
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" /> Il vous faut {selected.cost - credits} crédits
                  </>
                )
              ) : (
                'Sélectionnez une option'
              )}
            </Button>
            <p className="font-inter text-[10px] text-muted-foreground/60 text-center mt-2">
              Vous accepterez les conditions d'utilisation à l'étape suivante.
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}