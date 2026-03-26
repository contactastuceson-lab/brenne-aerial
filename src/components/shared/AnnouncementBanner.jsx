import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Info, AlertTriangle, CheckCircle, AlertCircle, Megaphone } from 'lucide-react';

const TYPE_CONFIG = {
  info:    { icon: Info,          bg: 'bg-primary/10 border-primary/30',       text: 'text-primary',       iconColor: 'text-primary' },
  warning: { icon: AlertTriangle, bg: 'bg-yellow-400/10 border-yellow-400/30', text: 'text-yellow-300',    iconColor: 'text-yellow-400' },
  success: { icon: CheckCircle,   bg: 'bg-green-400/10 border-green-400/30',   text: 'text-green-300',     iconColor: 'text-green-400' },
  error:   { icon: AlertCircle,   bg: 'bg-destructive/10 border-destructive/30', text: 'text-destructive', iconColor: 'text-destructive' },
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
            className={`w-full border-b ${cfg.bg} px-5 py-2.5 flex items-center gap-3`}
          >
            <Icon className={`w-4 h-4 flex-shrink-0 ${cfg.iconColor}`} />
            <div className="flex-1 min-w-0">
              {a.title && <span className={`font-grotesk font-semibold text-xs mr-2 ${cfg.text}`}>{a.title}</span>}
              <span className={`font-inter text-xs ${cfg.text}/90`}>{a.content}</span>
            </div>
            {a.dismissible !== false && (
              <button onClick={() => dismiss(a.id)} className="text-muted-foreground hover:text-foreground flex-shrink-0">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </motion.div>
        );
      })}
    </AnimatePresence>
  );
}