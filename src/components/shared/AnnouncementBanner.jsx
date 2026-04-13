import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Info, AlertTriangle, CheckCircle, AlertCircle, Megaphone } from 'lucide-react';

const TYPE_CONFIG = {
  info:    { icon: Info,          bg: 'bg-primary border-primary/80',         text: 'text-white',         iconColor: 'text-white' },
  warning: { icon: AlertTriangle, bg: 'bg-yellow-500 border-yellow-600',       text: 'text-white',         iconColor: 'text-white' },
  success: { icon: CheckCircle,   bg: 'bg-green-600 border-green-700',         text: 'text-white',         iconColor: 'text-white' },
  error:   { icon: AlertCircle,   bg: 'bg-red-600 border-red-700',             text: 'text-white',         iconColor: 'text-white' },
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

  const { data: announcements = [] } = useQuery({
    queryKey: ['announcements-banner'],
    queryFn: () => base44.entities.Announcement.filter({ is_active: true }),
    refetchInterval: 60000,
  });

  const now = new Date();
  const visible = announcements.filter(a => {
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
        return (
          <motion.div
            key={a.id}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`w-full border-b ${cfg.bg} px-5 py-3 flex items-center gap-3`}
          >
            <Icon className={`w-4 h-4 flex-shrink-0 ${cfg.iconColor}`} />
            <div className="flex-1 min-w-0">
              {a.title && <span className={`font-grotesk font-semibold text-sm mr-2 ${cfg.text}`}>{a.title}</span>}
              <span className={`font-inter text-sm ${cfg.text}`}><RichContent text={a.content} textClass={cfg.text} /></span>
              {a.link_url && (
                <a href={a.link_url} target="_blank" rel="noopener noreferrer"
                  className="flex-shrink-0 ml-2 font-inter text-xs font-semibold underline text-white hover:text-white/80 whitespace-nowrap">
                  {a.link_label || 'En savoir plus'} →
                </a>
              )}
            </div>
            {a.dismissible !== false && (
              <button onClick={() => dismiss(a.id)} className="text-white/70 hover:text-white flex-shrink-0" title="Masquer jusqu'au refresh">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </motion.div>
        );
      })}
    </AnimatePresence>
  );
}