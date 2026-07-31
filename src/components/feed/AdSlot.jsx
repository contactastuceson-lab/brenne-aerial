import { useState, useEffect, memo } from 'react';
import { motion } from 'framer-motion';
import { Megaphone, ExternalLink, Sparkles } from 'lucide-react';
import { base44 } from '@/api/base44Client';

// AdSlot — renders an active AdCampaign banner inside the feed or sidebar.
// Tracks impressions (on view) and clicks (on click) via the entity.
// Ads are intentionally intrusive (no dismiss, animated, large) to
// incentivize users to upgrade to a premium tier that removes them.
const AdSlot = memo(function AdSlot({ placement = 'feed_banner', className = '' }) {
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
               (!a.ends_at || new Date(a.ends_at) >= new Date())
        );
        if (eligible.length === 0) return;
        const chosen = eligible[Math.floor(Math.random() * eligible.length)];
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

  if (!ad) return null;

  const isSidebar = placement === 'sidebar';

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative ${className}`}
    >
      {/* Pulsing glow border — eye-catching, slightly annoying */}
      <motion.div
        animate={{ boxShadow: ['0 0 0px rgba(251,146,60,0)', '0 0 20px rgba(251,146,60,0.35)', '0 0 0px rgba(251,146,60,0)'] }}
        transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
        className={`relative rounded-2xl border-2 border-amber-400/40 bg-gradient-to-br from-amber-400/10 via-orange-400/6 to-primary/5 overflow-hidden ${isSidebar ? 'p-3' : 'p-5'}`}
        style={{ minHeight: isSidebar ? 'auto' : '120px' }}
      >
        {/* Sponsorisé label — blinking */}
        <motion.div
          animate={{ opacity: [1, 0.35, 1] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
          className="flex items-center justify-between mb-3"
        >
          <span className="inline-flex items-center gap-1 text-[10px] font-mono uppercase tracking-wider text-amber-400 font-bold">
            <Megaphone className="w-3 h-3" /> Sponsorisé · EZA Ads
          </span>
          <span className="inline-flex items-center gap-1 text-[9px] font-mono text-muted-foreground/50">
            <Sparkles className="w-2.5 h-2.5" /> Publicité
          </span>
        </motion.div>

        <button onClick={handleClick} className="w-full text-left flex gap-4 group">
          {ad.image_url && (
            <div className={`flex-shrink-0 ${isSidebar ? 'w-16 h-16' : 'w-28 h-28'} rounded-xl overflow-hidden bg-muted/20 border border-amber-400/20`}>
              <img src={ad.image_url} alt={ad.advertiser_name || ad.title}
                className="w-full h-full object-cover" loading="lazy" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            {ad.headline && (
              <p className="font-grotesk font-black text-base text-foreground leading-tight">{ad.headline}</p>
            )}
            <p className="font-inter text-sm text-muted-foreground line-clamp-3 mt-1">
              {ad.body || ad.title}
            </p>
            <span className="inline-flex items-center gap-1.5 mt-3 px-3 py-1.5 rounded-full bg-amber-400/20 text-amber-400 font-grotesk font-bold text-xs group-hover:bg-amber-400/30 group-hover:gap-2.5 transition-all">
              {ad.cta_label || 'En savoir plus'}
              <ExternalLink className="w-3.5 h-3.5" />
            </span>
          </div>
        </button>

        {/* No dismiss button — ads cannot be closed (premium removes them) */}
      </motion.div>
    </motion.div>
  );
});

export default AdSlot;