import { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Crown, Trophy, Star, TrendingUp, Rocket, Camera, Bell,
  Palette, Sparkles, Shield, Landmark, Award, Gem,
} from 'lucide-react';

// ── Helpers ────────────────────────────────────────────────────────────────
function daysLeft(iso) {
  if (!iso) return 0;
  return Math.max(0, Math.ceil((new Date(iso).getTime() - Date.now()) / 86400000));
}
function isActive(v) {
  if (v === true || v === null) return true;
  if (v && typeof v === 'string') return new Date(v).getTime() > Date.now();
  return false;
}

// ── Catalog of perks that produce a visible badge ─────────────────────────
const PERK_BADGES = [
  { key: 'vip_until',          label: 'VIP',              icon: Trophy,     color: 'text-yellow-400',  ring: '#facc15' },
  { key: 'premium_until',      label: 'Premium',          icon: Crown,      color: 'text-sky-400',    ring: '#38bdf8' },
  { key: 'business_until',     label: 'Business',         icon: Crown,      color: 'text-amber-400',  ring: '#f59e0b' },
  { key: 'enterprise_until',   label: 'Enterprise',        icon: Landmark,   color: 'text-indigo-400', ring: '#818cf8' },
  { key: 'featured_until',      label: 'Profil à la une',  icon: Star,       color: 'text-orange-400', ring: '#fb923c' },
  { key: 'top_explorer_until',  label: 'Top explorateur',  icon: TrendingUp, color: 'text-orange-400', ring: '#fb923c' },
  { key: 'analytics_until',      label: 'Analytics Pro',    icon: TrendingUp, color: 'text-cyan-400',  ring: '#22d3ee' },
  { key: 'scheduled_posts_until', label: 'Posts programmés', icon: Bell,     color: 'text-cyan-400',  ring: '#22d3ee' },
  { key: 'early_access_until',  label: 'Accès anticipé',   icon: Rocket,     color: 'text-yellow-400', ring: '#facc15' },
  { key: 'storage_until',       label: 'Stockage étendu',  icon: Camera,     color: 'text-cyan-400',  ring: '#22d3ee' },
  { key: 'custom_colors',        label: 'Couleurs perso',   icon: Palette,    color: 'text-cyan-400',  ring: '#22d3ee', permanent: true },
  { key: 'custom_animated_badge', label: 'Badge animé',    icon: Sparkles,   color: 'text-cyan-400',  ring: '#22d3ee', permanent: true },
  { key: 'custom_notif_sound',   label: 'Son perso',       icon: Bell,       color: 'text-cyan-400',  ring: '#22d3ee', permanent: true },
  { key: 'particle_effects',     label: 'Particules',      icon: Sparkles,   color: 'text-cyan-400',  ring: '#22d3ee', permanent: true },
  { key: 'custom_watermark',     label: 'Watermark',       icon: Shield,     color: 'text-cyan-400',  ring: '#22d3ee', permanent: true },
];

// ── Compute active perks from a user.perks object ──────────────────────────
export function getActivePerks(perks = {}) {
  const out = [];
  for (const def of PERK_BADGES) {
    const v = perks[def.key];
    if (def.permanent ? (v === true || v === null) : isActive(v)) {
      out.push({
        key: def.key,
        label: def.label,
        icon: def.icon,
        color: def.color,
        ring: def.ring,
        permanent: !!def.permanent,
        until: typeof v === 'string' ? v : null,
        daysLeft: typeof v === 'string' ? daysLeft(v) : null,
      });
    }
  }
  if (perks.founder_number) {
    out.push({
      key: 'founder',
      label: `Fondateur #${perks.founder_number}`,
      icon: Crown,
      color: 'text-yellow-400',
      ring: '#facc15',
      permanent: true,
    });
  }
  return out;
}

// ── Visual effects derived from active perks ───────────────────────────────
const flag = (v) => v === true || v === null;

export function getPerkEffects(perks = {}) {
  const cust = perks?.customization || {};
  return {
    hasParticles: flag(perks.particle_effects),
    hasCustomColor: flag(perks.custom_colors),
    hasAnimatedBadge: flag(perks.custom_animated_badge),
    isVip: isActive(perks.vip_until),
    isPremium: isActive(perks.premium_until),
    isBusiness: isActive(perks.business_until),
    isEnterprise: isActive(perks.enterprise_until),
    isFeatured: isActive(perks.featured_until),
    badgeText: flag(perks.custom_animated_badge) ? (cust.badgeText || '') : '',
    accentRing: isActive(perks.vip_until) ? '#facc15'
      : isActive(perks.premium_until) ? '#38bdf8'
      : isActive(perks.business_until) ? '#f59e0b'
      : isActive(perks.enterprise_until) ? '#818cf8'
      : flag(perks.custom_colors) ? (cust.accentColor || '#22d3ee')
      : null,
    particleColor: cust.particleColor || null,
  };
}

// ── Particle field (CSS-only, cheap) ────────────────────────────────────────
export function PerkParticles({ color = '#22d3ee' }) {
  const dots = useMemo(() => Array.from({ length: 12 }).map((_, i) => ({
    id: i,
    left: Math.random() * 100,
    top: Math.random() * 100,
    delay: Math.random() * 4,
    dur: 3 + Math.random() * 3,
    size: 3 + Math.random() * 4,
  })), []);
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
      {dots.map(d => (
        <motion.span
          key={d.id}
          className="absolute rounded-full"
          style={{ left: `${d.left}%`, top: `${d.top}%`, width: d.size, height: d.size, background: color, boxShadow: `0 0 6px ${color}` }}
          animate={{ y: [0, -16, 0], opacity: [0, 0.85, 0] }}
          transition={{ duration: d.dur, delay: d.delay, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}
    </div>
  );
}

// ── Badge row component ────────────────────────────────────────────────────
export default function PerkBadges({ perks = {}, size = 'sm' }) {
  const active = getActivePerks(perks);
  if (active.length === 0) return null;

  // Grille riche (carte "Avantages boutique" du profil public)
  if (size === 'md') {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
        {active.map(p => {
          const Icon = p.icon;
          return (
            <div
              key={p.key}
              className="flex items-center gap-2 rounded-xl px-2.5 py-2.5 border transition-all hover:bg-white/[0.03]"
              style={{ borderColor: `${p.ring}28`, background: '#111827' }}
            >
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: `${p.ring}14`, boxShadow: `0 0 12px ${p.ring}22` }}
              >
                <Icon className={`w-4 h-4 ${p.color}`} />
              </div>
              <div className="min-w-0">
                <p className={`font-grotesk font-bold text-[11px] truncate ${p.color}`}>{p.label}</p>
                <p className="font-mono text-[8px] uppercase tracking-wider text-muted-foreground/50 mt-0.5">
                  {p.permanent ? 'Permanent' : `${p.daysLeft}j restant`}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  const pad = size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs';
  return (
    <div className="flex flex-wrap gap-1.5">
      {active.map(p => {
        const Icon = p.icon;
        return (
          <span
            key={p.key}
            className={`inline-flex items-center gap-1 font-mono ${pad} rounded-full border ${p.color}`}
            style={{ borderColor: `${p.ring}40`, background: `${p.ring}12` }}
          >
            <Icon className={size === 'sm' ? 'w-2.5 h-2.5' : 'w-3 h-3'} />
            <span className={p.color}>{p.label}</span>
            {p.permanent
              ? null
              : <span className="text-muted-foreground/60">{p.daysLeft}j</span>}
          </span>
        );
      })}
    </div>
  );
}