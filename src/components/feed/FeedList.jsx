import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import PostCard from './PostCard';
import { Loader2, RefreshCw, Rss, Sparkles } from 'lucide-react';

const FEED_FILTERS = [
  { id: 'all',       label: '✨ Pour vous' },
  { id: 'recent',    label: '🕐 Récents' },
  { id: 'popular',   label: '🔥 Populaires' },
  { id: 'general',   label: '💬 Général' },
  { id: 'partages',  label: '📸 Partages' },
  { id: 'technique', label: '🔧 Technique' },
  { id: 'aide',      label: '🙏 Aide' },
];

const PAGE_SIZE = 10;

export default function FeedList({ currentUser }) {
  const [filter, setFilter] = useState('all');
  const [page, setPage]     = useState(0);
  const [newCount, setNewCount] = useState(0);
  const queryClient = useQueryClient();

  const { data: posts = [], isLoading, refetch, isFetching } = useQuery({
    queryKey: ['feed-posts', filter],
    queryFn: async () => {
      if (filter === 'popular') return base44.entities.Discussion.list('-views_count', 50);
      if (filter === 'recent')  return base44.entities.Discussion.list('-created_date', 50);
      if (['general', 'technique', 'partages', 'aide', 'autres'].includes(filter))
        return base44.entities.Discussion.filter({ category: filter }, '-created_date', 50);
      return base44.entities.Discussion.list('-created_date', 50);
    },
    staleTime: 60 * 1000,
  });

  // Real-time subscription
  useEffect(() => {
    const unsub = base44.entities.Discussion.subscribe((event) => {
      if (event.type === 'create') {
        setNewCount(c => c + 1);
      }
    });
    return unsub;
  }, []);

  const handleRefresh = () => {
    setNewCount(0);
    setPage(0);
    refetch();
  };

  const handleFilterChange = (f) => {
    setFilter(f);
    setPage(0);
    setNewCount(0);
  };

  const visible = posts.slice(0, (page + 1) * PAGE_SIZE);
  const hasMore = posts.length > visible.length;

  return (
    <div className="space-y-4">
      {/* Filter tabs */}
      <div className="flex items-center gap-1.5">
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide flex-1 pb-0.5">
          {FEED_FILTERS.map(f => (
            <button
              key={f.id}
              onClick={() => handleFilterChange(f.id)}
              className={`flex-shrink-0 px-3.5 py-2 rounded-xl text-xs font-inter font-medium transition-all whitespace-nowrap ${
                filter === f.id
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary/60'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <button
          onClick={handleRefresh}
          disabled={isFetching}
          className="flex-shrink-0 p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors border border-border/50"
          title="Actualiser"
        >
          <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* New posts banner */}
      <AnimatePresence>
        {newCount > 0 && (
          <motion.button
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            onClick={handleRefresh}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-primary/30 bg-primary/8 text-primary text-sm font-inter font-medium hover:bg-primary/12 transition-colors"
          >
            <Sparkles className="w-4 h-4" />
            {newCount} nouvelle{newCount > 1 ? 's' : ''} publication{newCount > 1 ? 's' : ''} — Cliquez pour afficher
          </motion.button>
        )}
      </AnimatePresence>

      {/* Posts */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center gap-3 py-24 text-muted-foreground">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
          <span className="font-inter text-sm">Chargement du fil d'actualité…</span>
        </div>
      ) : visible.length === 0 ? (
        <div className="py-24 text-center">
          <div className="w-16 h-16 rounded-2xl bg-primary/8 border border-primary/15 flex items-center justify-center mx-auto mb-4">
            <Rss className="w-7 h-7 text-primary/40" />
          </div>
          <p className="font-grotesk font-bold text-base mb-1">Aucune publication</p>
          <p className="font-inter text-sm text-muted-foreground max-w-xs mx-auto">
            Soyez le premier à partager quelque chose avec la communauté !
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence initial={false}>
            {visible.map((post, i) => (
              <PostCard key={post.id} post={post} currentUser={currentUser} index={i} />
            ))}
          </AnimatePresence>

          {/* Load more */}
          {hasMore && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-center pt-2"
            >
              <button
                onClick={() => setPage(p => p + 1)}
                className="px-6 py-2.5 rounded-xl border border-border text-sm font-inter text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-all"
              >
                Voir plus de publications
              </button>
            </motion.div>
          )}
        </div>
      )}
    </div>
  );
}