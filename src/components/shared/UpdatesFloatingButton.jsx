import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, Zap, Wrench, Megaphone, Star, ArrowRight } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';

const TYPE_CONFIG = {
  feature:      { label: 'Nouveauté',     color: 'text-primary',    bg: 'bg-primary/10',    border: 'border-primary/30',    icon: Star },
  improvement:  { label: 'Amélioration',  color: 'text-accent',     bg: 'bg-accent/10',     border: 'border-accent/30',     icon: Zap },
  fix:          { label: 'Correction',    color: 'text-chart-5',    bg: 'bg-chart-5/10',    border: 'border-chart-5/30',    icon: Wrench },
  announcement: { label: 'Annonce',       color: 'text-purple-400', bg: 'bg-purple-400/5',  border: 'border-purple-400/30', icon: Megaphone },
};

export default function UpdatesFloatingButton() {
  const [open, setOpen] = useState(false);
  const [updates, setUpdates] = useState([]);
  const [hasNew, setHasNew] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      const all = await base44.entities.AppUpdate.list('-published_at', 20);
      const published = all.filter(u => u.is_published);
      setUpdates(published);

      // Check if there are updates newer than last seen
      const lastSeen = localStorage.getItem('updates_last_seen');
      if (published.length > 0) {
        const latest = published[0]?.created_date;
        if (!lastSeen || new Date(latest) > new Date(lastSeen)) {
          setHasNew(true);
        }
      }
    };
    load();
  }, []);

  const handleOpen = () => {
    setOpen(true);
    setHasNew(false);
    localStorage.setItem('updates_last_seen', new Date().toISOString());
  };

  return (
    <>
      {/* Floating button — left side */}
      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.6 }}
        className="fixed bottom-[88px] left-4 z-40"
      >
        <motion.button
          whileHover={{ scale: 1.15 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleOpen}
          className="relative w-14 h-14 rounded-full bg-gradient-to-br from-primary to-accent shadow-lg hover:shadow-xl transition-shadow flex items-center justify-center group sky-glow"
        >
          <Sparkles className="w-6 h-6 text-white" />

          {/* Pulse ring */}
          <motion.div
            animate={{ scale: [1, 1.3], opacity: [1, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute inset-0 rounded-full border-2 border-primary"
          />

          {/* Badge new */}
          {hasNew && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-background" />
          )}

          {/* Tooltip */}
          <div className="absolute bottom-full left-0 mb-3 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            <div className="bg-background border border-border rounded-lg px-3 py-1.5 text-xs font-semibold whitespace-nowrap">
              Nouveautés
              <div className="absolute top-full left-2 w-0 h-0 border-l-[6px] border-r-[6px] border-t-[6px] border-l-transparent border-r-transparent border-t-border" />
            </div>
          </div>
        </motion.button>
      </motion.div>

      {/* Panel */}
      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
            />

            {/* Drawer */}
            <motion.div
              initial={{ x: -320, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -320, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed left-0 top-0 bottom-0 z-50 w-80 bg-card border-r border-border shadow-2xl flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-border">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  <h2 className="font-grotesk font-bold text-lg text-foreground">Nouveautés</h2>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-muted transition-colors text-muted-foreground"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {updates.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Sparkles className="w-10 h-10 mx-auto mb-3 opacity-30" />
                    <p className="text-sm">Aucune mise à jour pour l'instant</p>
                  </div>
                ) : (
                  updates.map(update => {
                    const cfg = TYPE_CONFIG[update.type] || TYPE_CONFIG.feature;
                    const Icon = cfg.icon;
                    return (
                      <div
                        key={update.id}
                        className={`rounded-xl border p-3 ${cfg.bg} ${cfg.border}`}
                      >
                        <div className="flex items-start gap-2">
                          <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${cfg.bg} border ${cfg.border}`}>
                            {update.emoji
                              ? <span className="text-sm">{update.emoji}</span>
                              : <Icon className={`w-3.5 h-3.5 ${cfg.color}`} />
                            }
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
                              <span className={`text-[10px] font-mono font-semibold ${cfg.color}`}>{cfg.label}</span>
                              {update.published_at && (
                                <span className="text-[10px] text-muted-foreground">
                                  · {format(new Date(update.published_at), 'd MMM yyyy', { locale: fr })}
                                </span>
                              )}
                            </div>
                            <p className="text-sm font-semibold text-foreground leading-snug">{update.title}</p>
                            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{update.description}</p>
                            {update.link_path && (
                              <button
                                onClick={() => { setOpen(false); navigate(update.link_path); }}
                                className={`mt-2 inline-flex items-center gap-1 text-[11px] font-semibold ${cfg.color} hover:underline`}
                              >
                                Voir <ArrowRight className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Footer */}
              <div className="p-3 border-t border-border text-center">
                <p className="text-[10px] text-muted-foreground">Brenne Aerial — Journal des mises à jour</p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}