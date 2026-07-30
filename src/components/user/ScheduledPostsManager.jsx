import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import {
  Calendar as CalIcon, Clock, ChevronLeft, ChevronRight, Trash2, Pencil,
  Loader2, RefreshCw, Plus, AlertCircle, CheckCircle2, X,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { getScheduledPostsLimit, hasScheduledPostsUnlimited } from '@/lib/subscriptionGating';
import { toast } from 'sonner';

const WEEKDAYS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

function startOfMonth(d) { return new Date(d.getFullYear(), d.getMonth(), 1); }
function endOfMonth(d) { return new Date(d.getFullYear(), d.getMonth() + 1, 0); }

export default function ScheduledPostsManager({ user }) {
  const [cursor, setCursor] = useState(new Date());
  const [selectedPost, setSelectedPost] = useState(null);
  const qc = useQueryClient();

  const perks = user?.perks || {};
  const unlimited = hasScheduledPostsUnlimited(perks);
  const limit = getScheduledPostsLimit(perks);

  const { data: scheduled = [], isLoading } = useQuery({
    queryKey: ['my-scheduled-posts', user?.id],
    queryFn: () => base44.entities.Post.filter(
      { author_id: user.id, is_draft: true },
      'scheduled_at',
      100
    ),
    enabled: !!user?.id,
    staleTime: 0,
    refetchOnMount: true,
  });

  const { data: allDrafts = [] } = useQuery({
    queryKey: ['my-all-drafts', user?.id],
    queryFn: () => base44.entities.Post.filter(
      { author_id: user.id, is_draft: true },
      'scheduled_at',
      100
    ),
    enabled: !!user?.id,
  });

  const upcoming = useMemo(() =>
    scheduled.filter(p => p.scheduled_at).sort((a, b) =>
      new Date(a.scheduled_at) - new Date(b.scheduled_at)
    ), [scheduled]);

  const usedQuota = allDrafts.filter(p => p.scheduled_at).length;
  const quotaLeft = unlimited ? Infinity : Math.max(0, limit - usedQuota);

  // Calendar grid
  const monthData = useMemo(() => {
    const start = startOfMonth(cursor);
    const end = endOfMonth(cursor);
    const startWeekday = (start.getDay() + 6) % 7; // Monday = 0
    const days = [];
    // Leading blanks
    for (let i = 0; i < startWeekday; i++) days.push(null);
    for (let d = 1; d <= end.getDate(); d++) {
      const date = new Date(cursor.getFullYear(), cursor.getMonth(), d);
      const dayPosts = upcoming.filter(p => {
        const pd = new Date(p.scheduled_at);
        return pd.getDate() === d && pd.getMonth() === cursor.getMonth() && pd.getFullYear() === cursor.getFullYear();
      });
      days.push({ date, posts: dayPosts, isToday: date.toDateString() === new Date().toDateString() });
    }
    return days;
  }, [cursor, upcoming]);

  const monthLabel = cursor.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });

  const cancelScheduled = async (post) => {
    if (!confirm('Annuler la programmation ? Le post sera supprimé.')) return;
    try {
      await base44.entities.Post.delete(post.id);
      toast.success('Post programmé annulé');
      qc.invalidateQueries({ queryKey: ['my-scheduled-posts', user.id] });
      qc.invalidateQueries({ queryKey: ['my-all-drafts', user.id] });
      setSelectedPost(null);
    } catch (e) {
      toast.error('Erreur: ' + (e.message || e));
    }
  };

  const publishNow = async (post) => {
    try {
      await base44.entities.Post.update(post.id, { is_draft: false, scheduled_at: null });
      toast.success('Publication immédiate');
      qc.invalidateQueries({ queryKey: ['my-scheduled-posts', user.id] });
      qc.invalidateQueries({ queryKey: ['my-all-drafts', user.id] });
      setSelectedPost(null);
    } catch (e) {
      toast.error('Erreur: ' + (e.message || e));
    }
  };

  return (
    <div className="space-y-4">
      {/* Quota banner */}
      <div className="rounded-2xl border border-border bg-card p-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
          <CalIcon className="w-5 h-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-grotesk font-bold text-sm">
            {upcoming.length} publication{upcoming.length > 1 ? 's' : ''} programmée{upcoming.length > 1 ? 's' : ''}
          </p>
          <p className="font-mono text-[10px] text-muted-foreground">
            {unlimited ? 'Quota illimité' : `${usedQuota}/${limit} créneaux utilisés`}
          </p>
        </div>
        {!unlimited && quotaLeft === 0 && (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-mono bg-amber-400/10 text-amber-400 border border-amber-400/30">
            <AlertCircle className="w-3 h-3" /> Quota atteint
          </span>
        )}
        <Link to="/create-post" className="flex-shrink-0">
          <Button size="sm" className="h-8 text-xs gap-1.5">
            <Plus className="w-3.5 h-3.5" /> Programmer
          </Button>
        </Link>
      </div>

      <div className="grid md:grid-cols-[1fr,minmax(0,300px)] gap-4">
        {/* Calendar */}
        <div className="rounded-2xl border border-border bg-card p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-grotesk font-bold text-sm capitalize">{monthLabel}</h3>
            <div className="flex gap-1">
              <button onClick={() => setCursor(d => new Date(d.getFullYear(), d.getMonth() - 1, 1))}
                className="p-1.5 rounded-lg hover:bg-secondary/40 text-muted-foreground">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button onClick={() => setCursor(new Date())}
                className="px-2 py-1 rounded-lg text-[10px] font-mono text-primary hover:bg-primary/10">
                Auj.
              </button>
              <button onClick={() => setCursor(d => new Date(d.getFullYear(), d.getMonth() + 1, 1))}
                className="p-1.5 rounded-lg hover:bg-secondary/40 text-muted-foreground">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-1">
            {WEEKDAYS.map(w => (
              <div key={w} className="text-center font-mono text-[9px] text-muted-foreground/50 uppercase py-1">
                {w}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {monthData.map((day, i) => (
              <div key={i} className={`min-h-[52px] rounded-lg border p-1 ${
                day === null ? 'border-transparent' :
                day.isToday ? 'border-primary/40 bg-primary/5' :
                'border-border/50'
              }`}>
                {day && (
                  <>
                    <p className={`font-mono text-[10px] ${day.isToday ? 'text-primary font-bold' : 'text-muted-foreground/60'}`}>
                      {day.date.getDate()}
                    </p>
                    <div className="space-y-0.5 mt-0.5">
                      {day.posts.slice(0, 2).map(p => (
                        <button key={p.id} onClick={() => setSelectedPost(p)}
                          className="block w-full text-left px-1 py-0.5 rounded text-[9px] font-inter truncate bg-primary/15 text-primary hover:bg-primary/25 transition-colors">
                          {p.content?.slice(0, 20) || 'Post'}
                        </button>
                      ))}
                      {day.posts.length > 2 && (
                        <p className="text-[9px] text-muted-foreground/50 px-1">+{day.posts.length - 2}</p>
                      )}
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming list */}
        <div className="rounded-2xl border border-border bg-card p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-grotesk font-bold text-sm">À venir</h3>
            <Button variant="ghost" size="icon" className="h-7 w-7"
              onClick={() => qc.invalidateQueries({ queryKey: ['my-scheduled-posts', user.id] })}>
              <RefreshCw className="w-3.5 h-3.5" />
            </Button>
          </div>
          {isLoading ? (
            <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>
          ) : upcoming.length === 0 ? (
            <div className="text-center py-8">
              <Clock className="w-7 h-7 text-muted-foreground/30 mx-auto mb-2" />
              <p className="font-inter text-xs text-muted-foreground">Aucune publication programmée</p>
            </div>
          ) : (
            <div className="space-y-1.5 max-h-[400px] overflow-y-auto pr-1">
              {upcoming.map(p => {
                const dt = new Date(p.scheduled_at);
                const overdue = dt.getTime() < Date.now();
                return (
                  <button key={p.id} onClick={() => setSelectedPost(p)}
                    className="w-full text-left p-2.5 rounded-xl border border-border hover:border-primary/30 transition-colors">
                    <div className="flex items-center gap-2 mb-1">
                      <Clock className={`w-3 h-3 ${overdue ? 'text-amber-400' : 'text-primary'}`} />
                      <span className={`font-mono text-[10px] ${overdue ? 'text-amber-400' : 'text-primary'}`}>
                        {dt.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })} · {dt.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      {overdue && <span className="ml-auto text-[9px] font-mono text-amber-400">en attente</span>}
                    </div>
                    <p className="font-inter text-xs text-foreground/80 line-clamp-2">
                      {p.content || '(post vide)'}
                    </p>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Detail dialog */}
      <AnimatePresence>
        {selectedPost && (
          <PostDetailDialog
            post={selectedPost}
            onClose={() => setSelectedPost(null)}
            onCancel={cancelScheduled}
            onPublishNow={publishNow}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function PostDetailDialog({ post, onClose, onCancel, onPublishNow }) {
  const dt = new Date(post.scheduled_at);
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}>
      <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-card border border-border rounded-2xl w-full max-w-md shadow-2xl"
        onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h3 className="font-grotesk font-bold text-sm flex items-center gap-2">
            <Clock className="w-4 h-4 text-primary" /> Détail du post programmé
          </h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground p-1">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-4 space-y-3">
          <div className="rounded-xl bg-primary/5 border border-primary/20 p-3">
            <p className="font-mono text-[10px] text-primary uppercase mb-1">Programmé pour</p>
            <p className="font-grotesk font-bold text-sm">
              {dt.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
            <p className="font-mono text-xs text-muted-foreground mt-0.5">
              à {dt.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
          <div>
            <p className="font-mono text-[10px] text-muted-foreground uppercase mb-1.5">Contenu</p>
            <p className="font-inter text-sm text-foreground/90 whitespace-pre-wrap break-words max-h-[200px] overflow-y-auto">
              {post.content || '(post vide)'}
            </p>
          </div>
          {post.media_urls?.length > 0 && (
            <div className="flex gap-2 flex-wrap">
              {post.media_urls.map((url, i) => (
                <img key={i} src={url} alt="" className="w-16 h-16 rounded-lg object-cover border border-border" />
              ))}
            </div>
          )}
        </div>
        <div className="flex gap-2 p-4 border-t border-border">
          <Button variant="outline" size="sm" className="flex-1 text-xs gap-1.5"
            onClick={() => onPublishNow(post)}>
            <CheckCircle2 className="w-3.5 h-3.5 text-green-400" /> Publier maintenant
          </Button>
          <Button variant="destructive" size="sm" className="flex-1 text-xs gap-1.5"
            onClick={() => onCancel(post)}>
            <Trash2 className="w-3.5 h-3.5" /> Annuler
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}