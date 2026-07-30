import React from 'react';
import { Crown, Building2, Rocket, Sparkles, CalendarClock, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  hasPremium, hasBusiness, hasEnterprise, getActiveTierLabel,
} from '@/lib/subscriptionGating';

const TIER_META = {
  Premium: {
    icon: Sparkles, color: 'text-primary', bg: 'bg-primary/10', border: 'border-primary/30',
    glow: 'sky-glow', desc: 'Posts programmés illimités, profil mis en avant, 2 Go de stockage.',
  },
  Business: {
    icon: Building2, color: 'text-amber-400', bg: 'bg-amber-400/10', border: 'border-amber-400/30',
    glow: '', desc: 'Publications sponsorisées (2/mois), analytics avancées, 5 Go, priorité dans les recherches.',
  },
  Enterprise: {
    icon: Rocket, color: 'text-violet-400', bg: 'bg-violet-400/10', border: 'border-violet-400/30',
    glow: '', desc: 'Sponsorisations illimitées, 50 Go, priorité maximale, accès anticipé, support prioritaire.',
  },
  VIP: {
    icon: Crown, color: 'text-pink-400', bg: 'bg-pink-400/10', border: 'border-pink-400/30',
    glow: '', desc: 'Tous les avantages Enterprise + statut VIP visible sur votre profil.',
  },
};

function fmtDaysLeft(dateStr) {
  if (!dateStr) return null;
  const ms = new Date(dateStr).getTime() - Date.now();
  if (ms <= 0) return 'Expiré';
  const days = Math.ceil(ms / 86400000);
  if (days <= 1) return "Expire aujourd'hui";
  return `${days} jours restants`;
}

// Returns the active subscription perk key + its expiry date for display.
function getTierExpiry(perks) {
  if (hasEnterprise(perks)) return perks.enterprise_until;
  if (perks?.vip_until) return perks.vip_until;
  if (hasBusiness(perks)) return perks.business_until;
  if (hasPremium(perks)) return perks.premium_until;
  return null;
}

export default function SubscriptionTierBanner({ perks }) {
  const label = getActiveTierLabel(perks);
  const expiry = getTierExpiry(perks);

  if (!label) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-card/50 p-5">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-muted/30 border border-border flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-muted-foreground/50" />
          </div>
          <div>
            <h3 className="font-grotesk font-bold text-sm text-foreground">Aucun abonnement actif</h3>
            <p className="font-inter text-xs text-muted-foreground">Plan gratuit — 500 Mo, 5 posts programmés/mois.</p>
          </div>
        </div>
        <Link to="/premium"
          className="inline-flex items-center gap-1.5 mt-3 px-4 py-2 rounded-full bg-primary text-primary-foreground font-grotesk font-bold text-xs hover:bg-primary/90 transition-all">
          Passer Premium <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    );
  }

  const meta = TIER_META[label] || TIER_META.Premium;
  const Icon = meta.icon;
  const days = fmtDaysLeft(expiry);

  return (
    <div className={`rounded-2xl border ${meta.border} ${meta.bg} p-5 ${meta.glow}`}>
      <div className="flex items-start gap-3">
        <div className={`w-11 h-11 rounded-xl border ${meta.border} flex items-center justify-center flex-shrink-0 ${meta.bg}`}>
          <Icon className={`w-6 h-6 ${meta.color}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className={`font-grotesk font-black text-base ${meta.color}`}>Abonnement {label}</h3>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono border ${meta.border} ${meta.bg} ${meta.color}`}>
              Actif
            </span>
          </div>
          <p className="font-inter text-xs text-muted-foreground mt-1 leading-relaxed">{meta.desc}</p>
          {days && (
            <div className={`inline-flex items-center gap-1.5 mt-3 px-3 py-1.5 rounded-full bg-background/60 border ${meta.border}`}>
              <CalendarClock className={`w-3.5 h-3.5 ${meta.color}`} />
              <span className="font-mono text-[11px] text-foreground/80">{days}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}