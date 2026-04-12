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

export default function AnnouncementBanner({ user }) {
  const [dismissed, setDismissed] = useState([]);

  // Load dismissed IDs from localStorage
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('dismissed_announcements') || '[]');
    setDismissed(saved);
  }, []);

  const { data: announcements = [] } = useQuery({
    queryKey: ['announcements-banner'],
    queryFn: () => base44.entities.Announcement.filter({ is_active: true }),
    refetchInterval: 60000,
  });

  const dismiss = (id) => {
    const next = [...dismissed, id];
    setDismissed(next);
    localStorage.setItem('dismissed_announcements', JSON.stringify(next));
  };

  const now = new Date();
  const visible = announcements.filter(a => {
    if (dismissed.includes(a.id)) return false;
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
              <span className={`font-inter text-sm ${cfg.text}`}>{a.content}</span>
            </div>
            {a.dismissible !== false && (
              <button onClick={() => dismiss(a.id)} className="text-white/70 hover:text-white flex-shrink-0">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </motion.div>
        );
      })}
    </AnimatePresence>
  );
}