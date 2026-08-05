import { useState, useEffect, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Megaphone, ExternalLink, X, Crown } from 'lucide-react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { hasPremium } from '@/lib/subscriptionGating';

// Module-level cache: fetch the current user's perks once per page load.
let _perksPromise = null;
function fetchPerksOnce() {
  if (!_perksPromise) {
    _perksPromise = base44.auth.me()
      .then(me => me?.perks || null)
      .catch(() => null);
  }
  return _perksPromise;
}

// StickyAdBanner — compact sticky ad that stays at the bottom of mobile screens.
// Dismissible but reappears after 60s. Always visible on mobile.
// Premium+ subscribers see NO ads at all.
const StickyAdBanner = memo(function StickyAdBanner({ placement = 'sticky_mobile' }) {
  const { user, isAuthenticated } = useAuth();
  const [perks, setPerks] = useState(user?.perks || null);
  const [ad, setAd] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (user?.perks) {
      setPerks(user.perks);
    } else if (isAuthenticated) {
      fetchPerksOnce().then(p => { if (p) setPerks(p); });
    }
  }, [user, isAuthenticated]);

  const isPremium = hasPremium(perks);

  // Re-show after 60s
  useEffect(() => {
    if (!dismissed) return;
    const timer = setTimeout(() => setDismissed(false), 60000);
    return () => clearTimeout(timer);
  }, [dismissed]);

  useEffect(() => {
    let done = false;
    if (isPremium) { setLoaded(true); return; }
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
               (!a.owner_id || a.credits_remaining == null || a.credits_remaining > 0)
        );
        if (eligible.length === 0) return;
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
  }, [placement, isPremium]);

  const handleClick = () => {
    if (!ad) return;
    const isHouse = !ad.owner_id;
    if (isHouse) {
      window.location.href = '/boutique';
    } else if (ad.cta_url) {
      window.open(ad.cta_url, '_blank', 'noopener,noreferrer');
    }
    base44.entities.AdCampaign.update(ad.id, {
      clicks: (ad.clicks || 0) + 1,
    }).catch(() => {});
  };

  if (isPremium || !ad || dismissed || !loaded) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ type: 'spring', damping: 24, stiffness: 320 }}
        className="fixed bottom-0 left-0 right-0 z-40 md:bottom-4 md:left-auto md:right-4 md:w-80 md:rounded-2xl md:border md:overflow-hidden"
        style={{
          background: 'linear-gradient(180deg, rgba(14,22,40,0.98) 0%, rgba(4,10,20,0.99) 100%)',
          borderTop: '1px solid rgba(251,146,60,0.3)',
          boxShadow: '0 -8px 32px rgba(0,0,0,0.5)',
        }}
      >
        {/* Pulsing top border */}
        <motion.div
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          className="h-0.5 w-full"
          style={{ background: 'linear-gradient(90deg, #F37322, #1DA890, #F37322)' }}
        />

        <div className="flex items-center gap-2 px-3 py-2">
          {/* Sponsor label */}
          <div className="flex items-center gap-1 text-[8px] font-mono uppercase tracking-wider text-amber-400 font-bold flex-shrink-0">
            <Megaphone className="w-2.5 h-2.5" />
            <span className="hidden xs:inline">Sponsorisé</span>
          </div>

          {/* Ad content */}
          <button onClick={handleClick} className="flex items-center gap-2 flex-1 min-w-0">
            {ad.image_url && (
              <div className="flex-shrink-0 w-9 h-9 rounded-lg overflow-hidden bg-muted/20 border border-amber-400/20">
                <img src={ad.image_url} alt={ad.advertiser_name || ad.title} className="w-full h-full object-cover" loading="lazy" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              {ad.headline && (
                <p className="font-grotesk font-bold text-xs text-foreground leading-tight truncate">{ad.headline}</p>
              )}
              <p className="font-inter text-[10px] text-muted-foreground line-clamp-1">{ad.body || ad.title}</p>
            </div>
            <span className="flex-shrink-0 inline-flex items-center gap-0.5 px-2 py-1 rounded-full bg-amber-400/20 text-amber-400 font-grotesk font-bold text-[9px]">
              {ad.cta_label || 'Voir'}
              <ExternalLink className="w-2.5 h-2.5" />
            </span>
          </button>

          {/* Dismiss button */}
          <button
            onClick={() => setDismissed(true)}
            className="flex-shrink-0 w-6 h-6 rounded-full bg-secondary/60 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-3 h-3" />
          </button>
        </div>

        {/* Upgrade hint */}
        <Link
          to="/boutique"
          className="flex items-center justify-center gap-1 py-1 text-[9px] font-mono text-muted-foreground/60 hover:text-amber-400 transition-colors"
          style={{ background: 'rgba(251,146,60,0.04)' }}
        >
          <Crown className="w-2.5 h-2.5" />
          Passer Premium pour supprimer les pubs
        </Link>
      </motion.div>
    </AnimatePresence>
  );
});

export default StickyAdBanner;