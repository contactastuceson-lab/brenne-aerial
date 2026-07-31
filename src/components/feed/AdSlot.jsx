import { useState, useEffect, memo } from 'react';
import { motion } from 'framer-motion';
import { Megaphone, ExternalLink, Sparkles } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { hasPremium } from '@/lib/subscriptionGating';

// Module-level cache: fetch the current user's perks once per page load.
// Avoids one me() call per AdSlot instance when the AuthContext user is stale.
let _perksPromise = null;
function fetchPerksOnce() {
  if (!_perksPromise) {
    _perksPromise = base44.auth.me()
      .then(me => me?.perks || null)
      .catch(() => null);
  }
  return _perksPromise;
}

// AdSlot — renders an active AdCampaign banner inside the feed or sidebar.
// Tracks impressions (on view) and clicks (on click) via the entity.
// Ads are intentionally intrusive (no dismiss, animated, large) to
// incentivize users to upgrade to a premium tier that removes them.
// Premium+ subscribers see NO ads at all.
const AdSlot = memo(function AdSlot({ placement = 'feed_banner', className = '' }) {
  const { user, isAuthenticated } = useAuth();
  const [perks, setPerks] = useState(user?.perks || null);

  // If the AuthContext user already has perks, use them. Otherwise (stale
  // context after a subscription was granted), fetch fresh perks once.
  useEffect(() => {
    if (user?.perks) {
      setPerks(user.perks);
    } else if (isAuthenticated) {
      fetchPerksOnce().then(p => { if (p) setPerks(p); });
    }
  }, [user, isAuthenticated]);

  const isPremium = hasPremium(perks);
  const [ad, setAd] = useState(null);
  const [loaded, setLoaded] = useState(false);

  // Fetch an active ad for this placement once
  useEffect(() => {
    let done = false;
    (async () => {
      try {
        const all = await base44.entities.AdCampaign.filter(
          { placement, status: 'active' },
          '-created_date',
          10
        );
        if (done || !all || all.length === 0) return;
        const eligible = all.filter(
          a => (!a.starts_at || new Date(a.starts_at) <= new Date()) &&
               (!a.ends_at || new Date(a.ends_at) >= new Date()) &&
               (a.credits_remaining == null || a.credits_remaining > 0)
        );
        if (eligible.length === 0) return;
        // Sélection pondérée par budget journalier : plus le budget est élevé,
        // plus la campagne a de chances d'être affichée (modèle type Promouvoir).
        const totalWeight = eligible.reduce((s, a) => s + Math.max(1, a.daily_budget || 1), 0);
        let roll = Math.random() * totalWeight;
        let chosen = eligible[0];
        for (const a of eligible) {
          roll -= Math.max(1, a.daily_budget || 1);
          if (roll <= 0) { chosen = a; break; }
        }
        setAd(chosen);
        base44.entities.AdCampaign.update(chosen.id, {
          impressions: (chosen.impressions || 0) + 1,
        }).catch(() => {});
      } catch { /* ignore */ }
      setLoaded(true);
    })();
    return () => { done = true; };
  }, [placement]);

  const handleClick = () => {
    if (!ad) return;
    if (ad.cta_url) window.open(ad.cta_url, '_blank', 'noopener,noreferrer');
    base44.entities.AdCampaign.update(ad.id, {
      clicks: (ad.clicks || 0) + 1,
    }).catch(() => {});
  };

  if (isPremium || !ad) return null;

  const isSidebar = placement === 'sidebar';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`relative ${className}`}
    >
      {/* Outer floating wrapper — continuous floating + slight rotation for "movement" feel */}
      <motion.div
        animate={{
          y: [0, -6, 0],
          rotate: [-0.4, 0.4, -0.4],
        }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      >
        {/* Flashing border — rapid color pulse to grab attention */}
        <motion.div
          animate={{
            borderColor: ['rgba(251,146,60,0.5)', 'rgba(244,63,94,0.6)', 'rgba(251,146,60,0.5)'],
            boxShadow: [
              '0 0 0px rgba(251,146,60,0), 0 0 0px rgba(251,191,36,0)',
              '0 0 28px rgba(251,146,60,0.5), 0 0 60px rgba(251,191,36,0.2)',
              '0 0 0px rgba(251,146,60,0), 0 0 0px rgba(251,191,36,0)',
            ],
          }}
          transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
          className={`relative rounded-2xl border-2 overflow-hidden ${isSidebar ? 'p-3' : 'p-5'}`}
          style={{ minHeight: isSidebar ? 'auto' : '140px' }}
        >
          {/* Animated gradient background — shifts continuously for movement feel */}
          <motion.div
            className="absolute inset-0"
            animate={{
              background: [
                'linear-gradient(135deg, rgba(251,146,60,0.12), rgba(244,63,94,0.06), rgba(56,170,220,0.05))',
                'linear-gradient(225deg, rgba(251,191,36,0.15), rgba(244,63,94,0.08), rgba(168,85,247,0.06))',
                'linear-gradient(315deg, rgba(251,146,60,0.10), rgba(56,170,220,0.08), rgba(251,191,36,0.06))',
                'linear-gradient(45deg, rgba(251,146,60,0.12), rgba(244,63,94,0.06), rgba(56,170,220,0.05))',
              ],
            }}
            transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
          />

          {/* Diagonal moving shine sweep — perpetual light streak */}
          <motion.div
            className="absolute inset-0 pointer-events-none"
            animate={{ x: ['-120%', '120%'] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
            style={{
              background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.12) 50%, transparent 60%)',
              width: '100%',
            }}
          />

          {/* Content layer — above animated bg */}
          <div className="relative z-10">
            {/* Blinking sponsorisé label */}
            <motion.div
              animate={{ opacity: [1, 0.25, 1] }}
              transition={{ duration: 0.9, repeat: Infinity, ease: 'easeInOut' }}
              className="flex items-center justify-between mb-3"
            >
              <span className="inline-flex items-center gap-1 text-[10px] font-mono uppercase tracking-wider text-amber-400 font-bold">
                <motion.span animate={{ rotate: [0, 15, -15, 0] }} transition={{ duration: 1, repeat: Infinity }}>
                  <Megaphone className="w-3 h-3" />
                </motion.span>
                Sponsorisé · EZA Ads
              </span>
              <span className="inline-flex items-center gap-1 text-[9px] font-mono text-muted-foreground/50">
                <Sparkles className="w-2.5 h-2.5" /> Publicité
              </span>
            </motion.div>

            <button onClick={handleClick} className="w-full text-left flex gap-4 group">
              {ad.image_url && (
                <motion.div
                  animate={{ scale: [1, 1.08, 1] }}
                  transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
                  className={`flex-shrink-0 ${isSidebar ? 'w-16 h-16' : 'w-28 h-28'} rounded-xl overflow-hidden bg-muted/20 border border-amber-400/30`}
                >
                  <img src={ad.image_url} alt={ad.advertiser_name || ad.title}
                    className="w-full h-full object-cover" loading="lazy" />
                </motion.div>
              )}
              <div className="flex-1 min-w-0">
                {ad.headline && (
                  <motion.p
                    animate={{ x: [0, 2, 0] }}
                    transition={{ duration: 0.8, repeat: Infinity, ease: 'easeInOut' }}
                    className="font-grotesk font-black text-base text-foreground leading-tight"
                  >
                    {ad.headline}
                  </motion.p>
                )}
                <p className="font-inter text-sm text-muted-foreground line-clamp-3 mt-1">
                  {ad.body || ad.title}
                </p>
                {/* Pulsing CTA button — aggressive scale pulse */}
                <motion.span
                  animate={{ scale: [1, 1.06, 1], boxShadow: ['0 0 0px rgba(251,146,60,0)', '0 0 16px rgba(251,146,60,0.5)', '0 0 0px rgba(251,146,60,0)'] }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'easeInOut' }}
                  className="inline-flex items-center gap-1.5 mt-3 px-4 py-2 rounded-full bg-amber-400/25 text-amber-400 font-grotesk font-bold text-xs group-hover:bg-amber-400/40 transition-all"
                >
                  {ad.cta_label || 'En savoir plus'}
                  <motion.span animate={{ x: [0, 3, 0] }} transition={{ duration: 0.8, repeat: Infinity }}>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </motion.span>
                </motion.span>
              </div>
            </button>
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
});

export default AdSlot;