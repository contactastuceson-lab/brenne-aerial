import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Info, AlertTriangle, CheckCircle, AlertCircle } from 'lucide-react';

const TYPE_CONFIG = {
  info:    { icon: Info,          accent: 'primary',   glowColor: 'rgba(56, 170, 220, 0.1)' },
  warning: { icon: AlertTriangle, accent: 'yellow',    glowColor: 'rgba(250, 204, 21, 0.08)' },
  success: { icon: CheckCircle,   accent: 'green',     glowColor: 'rgba(34, 197, 94, 0.08)' },
  error:   { icon: AlertCircle,   accent: 'red',       glowColor: 'rgba(239, 68, 68, 0.08)' },
};

// Parse text and make URLs + emails clickable
function RichContent({ text, textClass }) {
  const parts = text.split(/(https?:\/\/[^\s]+|[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,})/g);
  return (
    <span>
      {parts.map((part, i) => {
        if (/^https?:\/\//.test(part)) {
          return <a key={i} href={part} target="_blank" rel="noopener noreferrer" className="underline font-semibold text-white hover:text-white/80">{part}</a>;
        }
        if (/^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/.test(part)) {
          return <a key={i} href={`mailto:${part}`} className="underline font-semibold text-white hover:text-white/80">{part}</a>;
        }
        return <span key={i}>{part}</span>;
      })}
    </span>
  );
}

export default function AnnouncementBanner({ user }) {
  // dismissed = { [id]: dismissedAt (ISO string) } - session only, not persistent
  const [dismissed, setDismissed] = useState({});

  const dismiss = (id) => {
    const next = { ...dismissed, [id]: new Date().toISOString() };
    setDismissed(next);
  };

  const { data: announcementsData = [] } = useQuery({
    queryKey: ['announcements-banner'],
    // Temporarily disable Base44 calls on homepage: return empty announcements
    queryFn: async () => [],
    refetchInterval: 60000,
  });
  const announcements = Array.isArray(announcementsData) ? announcementsData : [];

  const now = new Date();
  const safeAnnouncements = Array.isArray(announcements) ? announcements : [];
  const visible = safeAnnouncements.filter(a => {
    // Only filter by expiration and target - no persistent dismissals
    if (dismissed[a.id]) return false; // Only hide during this session
    if (a.display_mode === 'popup') return false; // popup handled separately
    if (a.expires_at && new Date(a.expires_at) < now) return false;
    if (a.target === 'users_only' && !user) return false;
    if (a.target === 'visitors_only' && user) return false;
    return true;
  });

  return (
    <AnimatePresence>
      {visible.map(a => {
        const cfg = TYPE_CONFIG[a.type] || TYPE_CONFIG.info;
        const Icon = cfg.icon;
        const accentColors = {
          primary: 'text-primary',
          yellow: 'text-yellow-500',
          green: 'text-green-500',
          red: 'text-red-500',
        };
        const accentClass = accentColors[cfg.accent] || 'text-primary';
        
        return (
          <motion.div
            key={a.id}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full border-b border-border/40 px-5 py-4 flex items-center gap-4 backdrop-blur-md"
            style={{
              background: `linear-gradient(135deg, rgba(8, 20, 40, 0.4) 0%, rgba(20, 30, 50, 0.3) 100%), ${cfg.glowColor}`,
              borderTop: `1px solid ${cfg.glowColor}`,
            }}
          >
            <div className="flex-shrink-0">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center`}
                style={{ background: cfg.glowColor }}>
                <Icon className={`w-4 h-4 ${accentClass}`} />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              {a.title && <span className={`font-grotesk font-bold text-sm mr-2 text-foreground`}>{a.title}</span>}
              <span className="font-inter text-sm text-muted-foreground block"><RichContent text={a.content} textClass="text-muted-foreground" /></span>
              {a.link_url && (
                <a href={a.link_url} target="_blank" rel="noopener noreferrer"
                  className={`inline-flex mt-2 gap-1 items-center px-3 py-1.5 rounded-lg font-inter text-xs font-semibold transition-all whitespace-nowrap ${accentClass} hover:opacity-70 border border-current/20 bg-current/5`}>
                  {a.link_label || 'En savoir plus'} →
                </a>
              )}
            </div>
            {a.dismissible !== false && (
              <button onClick={() => dismiss(a.id)} className="text-muted-foreground hover:text-foreground hover:bg-primary/10 rounded-lg p-1 flex-shrink-0 transition-colors" title="Masquer">
                <X className="w-4 h-4" />
              </button>
            )}
          </motion.div>
        );
      })}
    </AnimatePresence>
  );
}