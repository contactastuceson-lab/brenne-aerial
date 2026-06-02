import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, Check, CheckCheck, Trash2, ExternalLink } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Button } from '@/components/ui/button';

const TYPE_COLORS = {
  quote_accepted: 'bg-green-400/10 border-green-400/30 text-green-400',
  quote_refused: 'bg-destructive/10 border-destructive/30 text-destructive',
  quote_pending: 'bg-primary/10 border-primary/30 text-primary',
  new_message: 'bg-accent/10 border-accent/30 text-accent',
  appointment: 'bg-chart-5/10 border-chart-5/30 text-chart-5',
  system: 'bg-muted border-border text-muted-foreground',
  badge: 'bg-purple-400/10 border-purple-400/30 text-purple-400',
  blog: 'bg-blue-400/10 border-blue-400/30 text-blue-400',
};

export default function NotificationsPanel({ user, open, onClose }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: rawNotifs = [] } = useQuery({
    queryKey: ['notifs-panel', user?.email],
    queryFn: () => base44.entities.Notification.filter({ user_email: user.email }, '-created_date', 30),
    enabled: !!user?.email && open,
  });

  // Déduplication: garder la plus récente par titre+type
  const notifs = rawNotifs.reduce((acc, n) => {
    const key = `${n.type}|${n.title}`;
    const existing = acc.find(x => `${x.type}|${x.title}` === key);
    if (!existing || new Date(n.created_date) > new Date(existing.created_date)) {
      return [...acc.filter(x => `${x.type}|${x.title}` !== key), n];
    }
    return acc;
  }, []);

  const markRead = useMutation({
    mutationFn: (id) => base44.entities.Notification.update(id, { is_read: true }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifs-panel'] });
      queryClient.invalidateQueries({ queryKey: ['unread-notifs'] });
    },
  });

  const markAllRead = async () => {
    // Fetch fresh list first to avoid stale IDs
    const fresh = await base44.entities.Notification.filter({ user_email: user.email }, '-created_date', 30);
    const unread = fresh.filter(n => !n.is_read);
    for (const n of unread) {
      try {
        await base44.entities.Notification.update(n.id, { is_read: true });
      } catch (e) { /* ignore */ }
    }
    queryClient.invalidateQueries({ queryKey: ['notifs-panel'] });
    queryClient.invalidateQueries({ queryKey: ['unread-notifs'] });
  };

  const deleteAll = async () => {
    // Fetch fresh list first to avoid stale IDs
    const fresh = await base44.entities.Notification.filter({ user_email: user.email }, '-created_date', 30);
    // Optimistically clear UI immediately
    queryClient.setQueryData(['notifs-panel', user?.email], []);
    queryClient.setQueryData(['unread-notifs', user?.email], []);
    for (const n of fresh) {
      try {
        await base44.entities.Notification.delete(n.id);
      } catch (e) { /* ignore */ }
    }
    queryClient.invalidateQueries({ queryKey: ['notifs-panel'] });
    queryClient.invalidateQueries({ queryKey: ['unread-notifs'] });
  };

  const unreadCount = notifs.filter(n => !n.is_read).length;

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            initial={{ opacity: 0, x: 20, scale: 0.97 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 20, scale: 0.97 }}
            transition={{ duration: 0.18 }}
            className="fixed top-16 right-4 z-50 w-[360px] max-h-[80vh] flex flex-col rounded-2xl border border-border bg-card shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border flex-shrink-0">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-primary" />
                <span className="font-grotesk font-semibold text-sm">Notifications</span>
                {unreadCount > 0 && (
                  <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground text-[10px] font-mono flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1">
                {unreadCount > 0 && (
                  <Button size="sm" variant="ghost" onClick={markAllRead} className="text-xs h-7 gap-1 text-muted-foreground hover:text-foreground">
                    <CheckCheck className="w-3 h-3" /> Tout lire
                  </Button>
                )}
                {notifs.length > 0 && (
                  <Button size="sm" variant="ghost" onClick={deleteAll} className="text-xs h-7 gap-1 text-muted-foreground hover:text-destructive">
                    <Trash2 className="w-3 h-3" /> Tout supprimer
                  </Button>
                )}
                <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="overflow-y-auto flex-1">
              {notifs.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-14 gap-3 text-muted-foreground">
                  <Bell className="w-10 h-10 opacity-20" />
                  <p className="font-inter text-sm">Aucune notification</p>
                </div>
              ) : (
                <div className="divide-y divide-border/50">
                  {notifs.map(n => (
                    <div
                      key={n.id}
                      onClick={() => {
                        if (!n.is_read) markRead.mutate(n.id);
                        if (n.action_url) {
                          navigate(n.action_url);
                          onClose();
                        }
                      }}
                      className={`px-4 py-3 cursor-pointer transition-all hover:bg-secondary/40 ${!n.is_read ? 'bg-primary/5' : ''} ${n.action_url ? 'group' : ''}`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`mt-0.5 w-1.5 h-1.5 rounded-full flex-shrink-0 ${!n.is_read ? 'bg-primary' : 'bg-transparent'}`} />
                        <div className="flex-1 min-w-0">
                          <p className={`font-inter text-sm ${!n.is_read ? 'font-medium text-foreground' : 'text-muted-foreground'}`}>
                            {n.title}
                          </p>
                          {n.message && (
                            <p className="font-inter text-xs text-muted-foreground mt-0.5 line-clamp-2">{n.message}</p>
                          )}
                          <p className="font-mono text-[10px] text-muted-foreground/60 mt-1">
                            {n.created_date ? format(new Date(n.created_date), "d MMM 'à' HH:mm", { locale: fr }) : ''}
                          </p>
                        </div>
                        {n.is_read && <Check className="w-3 h-3 text-muted-foreground/40 flex-shrink-0 mt-1" />}
                        {n.action_url && <ExternalLink className="w-3.5 h-3.5 text-muted-foreground/60 group-hover:text-primary flex-shrink-0 mt-1 opacity-0 group-hover:opacity-100 transition-opacity" />}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}