import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import PostCard from '@/components/post/PostCard';
import { Bookmark, Loader2, FileEdit, Trash2, Send, CalendarClock } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import AdSlot from '@/components/feed/AdSlot';

export default function BookmarksPage() {
  const qc = useQueryClient();
  const [tab, setTab] = useState('signets');

  const { data: user } = useQuery({ queryKey: ['current-user'], queryFn: () => base44.auth.me(), staleTime: 60000, retry: false });

  const { data: bookmarks = [], isLoading: bmLoading } = useQuery({
    queryKey: ['my-bookmarks', user?.id],
    queryFn: () => base44.entities.Bookmark.filter({ user_id: user.id }, '-created_date', 100),
    enabled: !!user?.id,
  });

  const postIds = bookmarks.map(b => b.post_id);

  const { data: bookmarkedPosts = [], isLoading: postsLoading } = useQuery({
    queryKey: ['bookmarked-posts', postIds.join(',')],
    queryFn: async () => {
      if (!postIds.length) return [];
      const all = await base44.entities.Post.list('-created_date', 200);
      return all.filter(p => postIds.includes(p.id));
    },
    enabled: postIds.length > 0,
  });

  const { data: drafts = [], isLoading: draftsLoading } = useQuery({
    queryKey: ['my-drafts', user?.id],
    queryFn: () => base44.entities.Post.filter({ author_id: user.id, is_draft: true }, '-created_date', 100),
    enabled: !!user?.id,
  });

  if (!user) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-6 h-6 text-primary animate-spin" />
      </div>
    );
  }

  const orderedBookmarks = postIds.map(id => bookmarkedPosts.find(p => p.id === id)).filter(Boolean);

  const publishDraft = async (draft) => {
    try {
      await base44.entities.Post.update(draft.id, { is_draft: false, scheduled_at: null });
      toast.success('Publication publiée');
      qc.invalidateQueries({ queryKey: ['my-drafts', user.id] });
      qc.invalidateQueries({ queryKey: ['home-feed-posts'] });
    } catch {
      toast.error('Erreur');
    }
  };

  const deleteDraft = async (draft) => {
    try {
      await base44.entities.Post.delete(draft.id);
      toast.success('Brouillon supprimé');
      qc.invalidateQueries({ queryKey: ['my-drafts', user.id] });
    } catch {
      toast.error('Erreur');
    }
  };

  const loading = tab === 'signets' ? (bmLoading || postsLoading) : draftsLoading;

  return (
    <div className="w-full max-w-[680px] min-w-0 mx-auto pb-20">
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border/60">
        <div className="px-4 py-3 flex items-center gap-2">
          <Bookmark className="w-5 h-5 text-primary" />
          <h1 className="font-grotesk font-bold text-lg">Signets & Brouillons</h1>
        </div>
        <div className="flex">
          <button onClick={() => setTab('signets')}
            className={`flex-1 py-3 text-sm font-inter font-medium border-b-2 -mb-px transition-all ${tab === 'signets' ? 'border-primary text-foreground font-bold' : 'border-transparent text-muted-foreground hover:text-foreground'}`}>
            Signets <span className="font-mono text-xs opacity-60">{orderedBookmarks.length}</span>
          </button>
          <button onClick={() => setTab('drafts')}
            className={`flex-1 py-3 text-sm font-inter font-medium border-b-2 -mb-px transition-all ${tab === 'drafts' ? 'border-primary text-foreground font-bold' : 'border-transparent text-muted-foreground hover:text-foreground'}`}>
            Brouillons <span className="font-mono text-xs opacity-60">{drafts.length}</span>
          </button>
        </div>
      </div>

      <div className="px-4 py-3 border-b border-border/40"><AdSlot placement="feed_banner" /></div>

      {loading ? (
        <div className="flex items-center justify-center py-24"><Loader2 className="w-6 h-6 text-primary animate-spin" /></div>
      ) : tab === 'signets' ? (
        orderedBookmarks.length === 0 ? (
          <div className="py-24 text-center px-4">
            <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center bg-primary/5 border border-primary/20">
              <Bookmark className="w-7 h-7 text-primary/40" />
            </div>
            <p className="font-grotesk font-bold text-lg mb-1">Aucun signet</p>
            <p className="font-inter text-sm text-muted-foreground">Enregistrez discrètement des posts via l'icône signet sous chaque publication.</p>
          </div>
        ) : (
          orderedBookmarks.map(post => <PostCard key={post.id} post={post} currentUser={user} />)
        )
      ) : (
        drafts.length === 0 ? (
          <div className="py-24 text-center px-4">
            <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center bg-primary/5 border border-primary/20">
              <FileEdit className="w-7 h-7 text-primary/40" />
            </div>
            <p className="font-grotesk font-bold text-lg mb-1">Aucun brouillon</p>
            <p className="font-inter text-sm text-muted-foreground">Vos brouillons et publications programmées apparaissent ici.</p>
          </div>
        ) : (
          drafts.map(draft => (
            <div key={draft.id} className="px-4 py-3 border-b border-border/40">
              <div className="flex items-center gap-1.5 mb-1.5">
                {draft.scheduled_at ? (
                  <span className="inline-flex items-center gap-1 text-[11px] text-amber-400 bg-amber-400/10 border border-amber-400/30 px-2 py-0.5 rounded-full">
                    <CalendarClock className="w-3 h-3" /> Programmé · {format(new Date(draft.scheduled_at), 'dd MMM HH:mm', { locale: fr })}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">
                    <FileEdit className="w-3 h-3" /> Brouillon
                  </span>
                )}
              </div>
              <p className="font-inter text-sm text-foreground/80 leading-relaxed line-clamp-4 mb-2">{draft.content || '(sans texte)'}</p>
              <div className="flex gap-2">
                <button onClick={() => publishDraft(draft)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90">
                  <Send className="w-3 h-3" /> Publier maintenant
                </button>
                <button onClick={() => deleteDraft(draft)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-destructive/30 text-destructive text-xs font-semibold hover:bg-destructive/10">
                  <Trash2 className="w-3 h-3" /> Supprimer
                </button>
              </div>
            </div>
          ))
        )
      )}
    </div>
  );
}