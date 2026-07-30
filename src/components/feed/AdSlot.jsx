import { useState, useEffect, memo } from 'react';
import { motion } from 'framer-motion';
import { Megaphone, X, ExternalLink } from 'lucide-react';
import { base44 } from '@/api/base44Client';

// AdSlot — renders an active AdCampaign banner inside the feed or sidebar.
// Tracks impressions (on view) and clicks (on click) via the entity.
const AdSlot = memo(function AdSlot({ placement = 'feed_banner', className = '' }) {
  const [ad, setAd] = useState(null);
  const [dismissed, setDismissed] = useState(false);
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

  if (dismissed || !ad) return null;

  const isSidebar = placement === 'sidebar';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`relative ${className}`}
    >
      <div
        className={`relative rounded-2xl border border-amber-400/20 bg-gradient-to-br from-amber-400/8 to-primary/5 overflow-hidden ${isSidebar ? 'p-3' : 'p-4'}`}
        style={{ minHeight: isSidebar ? 'auto' : '88px' }}
      >
        {/* Sponsorisé label */}
        <div className="flex items-center justify-between mb-2">
          <span className="inline-flex items-center gap-1 text-[9px] font-mono uppercase tracking-wider text-amber-400/80">
            <Megaphone className="w-2.5 h-2.5" /> Sponsorisé
          </span>
          <button
            onClick={() => setDismissed(true)}
            className="text-muted-foreground/60 hover:text-foreground transition-colors"
            aria-label="Masquer la pub"
          >
            <X className="w-3 h-3" />
          </button>
        </div>

        <button onClick={handleClick} className="w-full text-left flex gap-3 group">
          {ad.image_url && (
            <div className={`flex-shrink-0 ${isSidebar ? 'w-12 h-12' : 'w-20 h-20'} rounded-xl overflow-hidden bg-muted/20 border border-white/5`}>
              <img src={ad.image_url} alt={ad.advertiser_name || ad.title}
                className="w-full h-full object-cover" loading="lazy" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            {ad.headline && (
              <p className="font-grotesk font-bold text-sm text-foreground truncate">{ad.headline}</p>
            )}
            <p className="font-inter text-xs text-muted-foreground line-clamp-2 mt-0.5">
              {ad.body || ad.title}
            </p>
            <span className="inline-flex items-center gap-1 mt-2 text-[11px] font-mono text-primary group-hover:gap-1.5 transition-all">
              {ad.cta_label || 'En savoir plus'}
              <ExternalLink className="w-3 h-3" />
            </span>
          </div>
        </button>
      </div>
    </motion.div>
  );
});

export default AdSlot;