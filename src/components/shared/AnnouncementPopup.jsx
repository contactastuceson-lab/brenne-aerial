import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Info, AlertTriangle, CheckCircle, AlertCircle, Megaphone } from 'lucide-react';
import { Button } from '@/components/ui/button';

const TYPE_CONFIG = {
  info:    { icon: Info,          border: 'border-primary/40',       title: 'text-primary',       bg: 'bg-primary/5' },
  warning: { icon: AlertTriangle, border: 'border-yellow-400/40',    title: 'text-yellow-300',    bg: 'bg-yellow-400/5' },
  success: { icon: CheckCircle,   border: 'border-green-400/40',     title: 'text-green-300',     bg: 'bg-green-400/5' },
  error:   { icon: AlertCircle,   border: 'border-destructive/40',   title: 'text-destructive',   bg: 'bg-destructive/5' },
};

export default function AnnouncementPopup({ user }) {
  const [dismissed, setDismissed] = useState([]); // Session-only, resets on refresh
  const [current, setCurrent] = useState(null);

  const { data: announcements = [] } = useQuery({
    queryKey: ['announcements-popup'],
    queryFn: () => base44.entities.Announcement.filter({ is_active: true }),
    refetchInterval: 60000,
  });

  useEffect(() => {
    const now = new Date();
    const popupAnn = announcements.find(a => {
      if (dismissed.includes(a.id)) return false;
      if (a.display_mode !== 'popup' && a.display_mode !== 'both') return false;
      if (a.expires_at && new Date(a.expires_at) < now) return false;
      if (a.target === 'users_only' && !user) return false;
      if (a.target === 'visitors_only' && user) return false;
      return true;
    });
    setCurrent(popupAnn || null);
  }, [announcements, dismissed, user]);

  const dismiss = () => {
    if (!current) return;
    const next = [...dismissed, current.id];
    setDismissed(next);
    setCurrent(null);
  };

  if (!current) return null;

  const cfg = TYPE_CONFIG[current.type] || TYPE_CONFIG.info;
  const Icon = cfg.icon;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        onClick={current.dismissible !== false ? dismiss : undefined}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={e => e.stopPropagation()}
          className={`relative max-w-md w-full rounded-2xl border ${cfg.border} ${cfg.bg} bg-card p-6 shadow-2xl`}
        >
          {current.dismissible !== false && (
            <button onClick={dismiss} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground">
              <X className="w-4 h-4" />
            </button>
          )}
          <div className="flex items-start gap-4">
            <div className={`w-10 h-10 rounded-xl ${cfg.bg} border ${cfg.border} flex items-center justify-center flex-shrink-0`}>
              <Icon className={`w-5 h-5 ${cfg.title}`} />
            </div>
            <div className="flex-1 min-w-0">
              {current.title && (
                <h3 className={`font-grotesk font-bold text-base mb-2 ${cfg.title}`}>{current.title}</h3>
              )}
              <p className="font-inter text-sm text-foreground/90 leading-relaxed">{current.content}</p>
            </div>
          </div>
          {current.dismissible !== false && (
            <div className="flex justify-end mt-5">
              <Button size="sm" onClick={dismiss} className="font-inter text-xs bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20">
                Compris
              </Button>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}