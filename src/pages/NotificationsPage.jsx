import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Bell, Heart, MessageCircle, UserPlus, CheckCircle, AtSign, CheckCheck, Trash2, Volume2 } from 'lucide-react';
import { toast } from 'sonner';
import HomeRightSidebar from '@/components/home/HomeRightSidebar';
import AdSlot from '@/components/feed/AdSlot';

const TYPE_CONFIG = {
  LIKE: {
    icon: <Heart className="w-5 h-5 text-rose-400 fill-rose-400" />,
    bg: 'bg-rose-400/10',
  },
  REPLY: {
    icon: <MessageCircle className="w-5 h-5 text-blue-400" />,
    bg: 'bg-blue-400/10',
  },
  FOLLOW: {
    icon: <UserPlus className="w-5 h-5 text-primary" />,
    bg: 'bg-primary/10',
  },
  VERIFICATION: {
    icon: <CheckCircle className="w-5 h-5 text-sky-400" />,
    bg: 'bg-sky-400/10',
  },
  MENTION: {
    icon: <AtSign className="w-5 h-5 text-purple-400" />,
    bg: 'bg-purple-400/10',
  },
};

function NotifCard({ notif, onRead }) {
  const navigate = useNavigate();
  const config = TYPE_CONFIG[notif.type];
  const timeAgo = notif.created_date
    ? formatDistanceToNow(new Date(notif.created_date), { addSuffix: true, locale: fr })
    : '';

  const handleClick = () => {
    if (!notif.is_read) onRead(notif.id);
    if (notif.link) navigate(notif.link);
    else if (notif.post_id) navigate(`/post/${notif.post_id}`);
  };

  return (
    <div
      onClick={handleClick}
      className={`flex items-start gap-3 px-4 py-4 border-b border-border/40 cursor-pointer transition-colors hover:bg-white/[0.03] ${!notif.is_read ? 'bg-primary/[0.03]' : ''}`}
    >
      {/* Unread dot */}
      <div className="flex-shrink-0 mt-2.5">
        <div className={`w-1.5 h-1.5 rounded-full ${!notif.is_read ? 'bg-primary' : 'bg-transparent'}`} />
      </div>

      {/* Type icon */}
      <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${config ? config.bg : 'bg-muted'}`}>
        {config ? config.icon : <Bell className="w-5 h-5 text-muted-foreground" />}
      </div>

      {/* Body */}
      <div className="flex-1 min-w-0">
        {/* Sender avatar + title */}
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          {notif.sender_avatar && (
            <img src={notif.sender_avatar} alt="" className="w-6 h-6 rounded-full object-cover border border-white/10 flex-shrink-0" />
          )}
          <span className={`text-sm leading-snug ${!notif.is_read ? 'font-semibold text-foreground' : 'text-foreground/80'}`}>
            {notif.title}
          </span>
        </div>

        {/* Post excerpt */}
        {notif.post_excerpt && notif.type !== 'FOLLOW' && notif.type !== 'VERIFICATION' && (
          <p className="text-sm text-muted-foreground/60 line-clamp-2 mb-1 border-l-2 border-border/60 pl-2 italic">
            {notif.post_excerpt}
          </p>
        )}

        <span className="text-xs text-muted-foreground/40 font-mono">{timeAgo}</span>
      </div>
    </div>
  );
}

export default function NotificationsPage() {
  const [user, setUser] = useState(null);
  const [tab, setTab] = useState('all');
  const [digestLoading, setDigestLoading] = useState(false);
  const queryClient = useQueryClient();

  const playDigest = async () => {
    setDigestLoading(true);
    try {
      const res = await base44.functions.invoke('generateNotificationsDigest', {});
      const data = res?.data || res;
      if (data?.ok && data.audio_url) {
        new Audio(data.audio_url).play();
      } else {
        toast.error(data?.error || 'Aucun résumé disponible');
      }
    } catch {
      toast.error('Erreur lors de la génération vocale');
    }
    setDigestLoading(false);
  };

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: notifs = [], isLoading } = useQuery({
    queryKey: ['notifs-page', user?.email],
    queryFn: () => base44.entities.Notification.filter({ user_email: user.email }, '-created_date', 80),
    enabled: !!user?.email,
    refetchInterval: 30000,
  });

  const markRead = useMutation({
    mutationFn: (id) => base44.entities.Notification.update(id, { is_read: true }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifs-page'] });
      queryClient.invalidateQueries({ queryKey: ['unread-notifs'] });
    },
  });

  const markAllRead = async () => {
    const unread = notifs.filter(n => !n.is_read);
    for (const n of unread) await base44.entities.Notification.update(n.id, { is_read: true }).catch(() => {});
    queryClient.invalidateQueries({ queryKey: ['notifs-page'] });
    queryClient.invalidateQueries({ queryKey: ['unread-notifs'] });
  };

  const deleteAll = async () => {
    queryClient.setQueryData(['notifs-page', user?.email], []);
    for (const n of notifs) await base44.entities.Notification.delete(n.id).catch(() => {});
    queryClient.invalidateQueries({ queryKey: ['notifs-page'] });
    queryClient.invalidateQueries({ queryKey: ['unread-notifs'] });
  };

  const MENTION_TYPES = ['MENTION', 'REPLY'];
  const filtered = tab === 'mentions'
    ? notifs.filter(n => MENTION_TYPES.includes(n.type))
    : notifs;

  const unreadCount = notifs.filter(n => !n.is_read).length;

  return (
    <div className="flex min-h-screen">
        {/* Center feed */}
        <main className="flex-1 min-w-0 border-x border-border/40">

          {/* Header */}
          <div className="sticky top-0 z-20 bg-background/90 backdrop-blur-md border-b border-border/40 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-primary" />
              <h1 className="font-grotesk font-bold text-lg">Notifications</h1>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-primary text-primary-foreground text-xs font-mono font-bold">
                  {unreadCount}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button onClick={playDigest} disabled={digestLoading} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors px-2 py-1 rounded-lg hover:bg-white/5 disabled:opacity-50">
                {digestLoading ? <span className="w-3.5 h-3.5 border border-primary border-t-transparent rounded-full animate-spin" /> : <Volume2 className="w-3.5 h-3.5" />} Résumé vocal
              </button>
              {unreadCount > 0 && (
                <button onClick={markAllRead} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded-lg hover:bg-white/5">
                  <CheckCheck className="w-3.5 h-3.5" /> Tout lire
                </button>
              )}
              {notifs.length > 0 && (
                <button onClick={deleteAll} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-destructive transition-colors px-2 py-1 rounded-lg hover:bg-destructive/10">
                  <Trash2 className="w-3.5 h-3.5" /> Tout supprimer
                </button>
              )}
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-border/40">
            {[{ key: 'all', label: 'Tous' }, { key: 'mentions', label: 'Mentions' }].map(t => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`flex-1 py-3 text-sm font-semibold transition-colors relative ${tab === t.key ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
              >
                {t.label}
                {tab === t.key && (
                  <div className="absolute bottom-0 left-1/4 right-1/4 h-0.5 bg-primary rounded-full" />
                )}
              </button>
            ))}
          </div>

          {/* Pub intrusive */}
          <div className="px-4 py-3 border-b border-border/40"><AdSlot placement="feed_banner" /></div>

          {/* Notifications list */}
          {isLoading ? (
            <div className="flex flex-col">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="flex gap-3 px-4 py-4 border-b border-border/40 animate-pulse">
                  <div className="w-10 h-10 rounded-full bg-white/6 flex-shrink-0" />
                  <div className="flex-1 space-y-2 pt-1">
                    <div className="h-3 bg-white/6 rounded w-3/4" />
                    <div className="h-3 bg-white/6 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 gap-3 text-center px-6">
              <Bell className="w-12 h-12 text-muted-foreground/20" />
              <p className="font-grotesk font-semibold text-foreground/60">
                {tab === 'mentions' ? 'Aucune mention pour l\u2019instant' : 'Aucune notification'}
              </p>
              <p className="text-sm text-muted-foreground/40">
                {tab === 'mentions'
                  ? 'Quand quelqu\u2019un vous mentionne, c\u2019est ici.'
                  : 'Vos interactions appara\u00eetront ici.'}
              </p>
            </div>
          ) : (
            <div>
              {filtered.map(n => (
                <NotifCard key={n.id} notif={n} onRead={(id) => markRead.mutate(id)} />
              ))}
            </div>
          )}
        </main>

        {/* Right sidebar */}
        <div className="hidden xl:flex flex-col w-[300px] flex-shrink-0 sticky top-0 h-screen overflow-y-auto py-4 px-3" style={{ scrollbarWidth: 'none' }}>
          <HomeRightSidebar />
        </div>
    </div>
  );
}