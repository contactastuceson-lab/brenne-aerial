import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, ExternalLink } from 'lucide-react';

const CATEGORY_CONFIG = {
  feature: { label: 'Nouveauté', color: '#38aadc', bg: 'rgba(56,170,220,0.10)', border: 'rgba(56,170,220,0.25)' },
  improvement: { label: 'Amélioration', color: '#22c55e', bg: 'rgba(34,197,94,0.10)', border: 'rgba(34,197,94,0.25)' },
  fix: { label: 'Correction', color: '#f59e0b', bg: 'rgba(245,158,11,0.10)', border: 'rgba(245,158,11,0.25)' },
  announcement: { label: 'Annonce', color: '#a855f7', bg: 'rgba(168,85,247,0.10)', border: 'rgba(168,85,247,0.25)' },
};

export default function WhatsNewModal({ announcement, open, onClose, preview = false }) {
  const accent = announcement?.accent_color || '#38aadc';

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === 'Escape' && !preview) onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose, preview]);

  return (
    <AnimatePresence>
      {open && announcement && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md"
          onClick={preview ? undefined : onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ type: 'spring', stiffness: 350, damping: 28 }}
            className="w-full max-w-lg max-h-[88vh] flex flex-col rounded-2xl overflow-hidden shadow-2xl"
            style={{ background: 'hsl(var(--card))', border: `1px solid ${accent}33` }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header image */}
            {announcement.header_image_url && (
              <div className="relative h-32 flex-shrink-0 overflow-hidden">
                <img src={announcement.header_image_url} alt="" className="w-full h-full object-cover" />
                <div className="absolute inset-0" style={{ background: `linear-gradient(to bottom, transparent, hsl(var(--card)))` }} />
              </div>
            )}

            {/* Header */}
            <div className="flex items-start justify-between px-6 pt-5 pb-3 flex-shrink-0">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Sparkles className="w-5 h-5 flex-shrink-0" style={{ color: accent }} />
                  <h2 className="font-grotesk font-bold text-xl text-foreground truncate">{announcement.title}</h2>
                </div>
                {announcement.version && (
                  <span
                    className="inline-block text-xs font-mono font-semibold px-2 py-0.5 rounded-full"
                    style={{ color: accent, background: `${accent}15` }}
                  >
                    {announcement.version}
                  </span>
                )}
              </div>
              {!preview && (
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-muted transition-colors flex-shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Intro */}
            {announcement.intro && (
              <p className="px-6 pb-3 text-sm text-muted-foreground leading-relaxed flex-shrink-0">{announcement.intro}</p>
            )}

            {/* Sections scrollable */}
            <div className="flex-1 overflow-y-auto px-6 pb-4 space-y-2.5">
              {(announcement.sections || []).map((section, i) => {
                const cfg = CATEGORY_CONFIG[section.category] || CATEGORY_CONFIG.feature;
                return (
                  <div
                    key={section.id || i}
                    className="flex items-start gap-3 rounded-xl p-3 border"
                    style={{ background: cfg.bg, borderColor: cfg.border }}
                  >
                    <div
                      className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 text-lg"
                      style={{ background: `${cfg.color}20`, border: `1px solid ${cfg.color}40` }}
                    >
                      {section.icon || '✨'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider" style={{ color: cfg.color }}>
                          {cfg.label}
                        </span>
                      </div>
                      <h3 className="text-sm font-bold text-foreground leading-snug">{section.title}</h3>
                      {section.description && (
                        <ul className="mt-1.5 space-y-1">
                          {section.description.split(/\s*·\s*|\n/).filter(Boolean).map((point, j) => (
                            <li key={j} className="flex items-start gap-1.5 text-xs text-muted-foreground leading-relaxed">
                              <span className="mt-1 w-1 h-1 rounded-full flex-shrink-0" style={{ background: cfg.color }} />
                              <span>{point}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                );
              })}
              {(!announcement.sections || announcement.sections.length === 0) && (
                <div className="text-center py-8 text-muted-foreground text-sm">Aucune nouveauté à afficher</div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center gap-3 px-6 py-4 border-t border-border flex-shrink-0">
              {announcement.custom_button_text && announcement.custom_button_url && (
                <a
                  href={announcement.custom_button_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold border border-border text-foreground hover:bg-muted transition-colors"
                >
                  {announcement.custom_button_text}
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
              <button
                onClick={preview ? undefined : onClose}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white transition-opacity hover:opacity-90"
                style={{ background: accent }}
              >
                {announcement.custom_button_text && !announcement.custom_button_url ? announcement.custom_button_text : "C'est compris !"}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}