import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import PostCard from './PostCard';
import { Loader2, RefreshCw, Rss } from 'lucide-react';
import { Button } from '@/components/ui/button';

const FEED_FILTERS = [
  { id: 'all',       label: 'Pour vous' },
  { id: 'recent',    label: 'Récents' },
  { id: 'popular',   label: 'Populaires' },
  { id: 'general',   label: 'Général' },
  { id: 'technique', label: 'Technique' },
  { id: 'partages',  label: 'Partages' },
];

export default function FeedList({ currentUser }) {
  const [filter, setFilter] = useState('all');
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 10;

  const { data: posts = [], isLoading, refetch } = useQuery({
    queryKey: ['feed-posts', filter],
    queryFn: async () => {
      if (filter === 'popular') {
        return base44.entities.Discussion.list('-views_count', 30);
      } else if (filter === 'recent') {
        return base44.entities.Discussion.list('-created_date', 30);
      } else if (['general', 'technique', 'partages', 'aide', 'autres'].includes(filter)) {
        return base44.entities.Discussion.filter({ category: filter }, '-created_date', 30);
      } else {
        return base44.entities.Discussion.list('-created_date', 30);
      }
    },
    staleTime: 60 * 1000,
  });

  // Real-time updates
  useEffect(() => {
    const unsub = base44.entities.Discussion.subscribe((event) => {
      if (event.type === 'create') refetch();
    });
    return unsub;
  }, [refetch]);

  const visible = posts.slice(0, (page + 1) * PAGE_SIZE);
  const hasMore = posts.length > visible.length;

  return (
    <div className="space-y-4 flex-1 min-w-0">
      {/* Filter tabs */}
      <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide pb-1">
        {FEED_FILTERS.map(f => (
          <button
            key={f.id}
            onClick={() => { setFilter(f.id); setPage(0); }}
            className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-inter font-medium transition-all ${
              filter === f.id
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground hover:bg-secondary/60'
            }`}
          >
            {f.label}
          </button>
        ))}
        <button
          onClick={() => refetch()}
          className="flex-shrink-0 ml-auto p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors"
          title="Actualiser"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Posts */}
      {isLoading ? (
        <div className="flex items-center justify-center gap-3 py-20 text-muted-foreground">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span className="font-inter text-sm">Chargement du fil…</span>
        </div>
      ) : visible.length === 0 ? (
        <div className="py-20 text-center">
          <div className="w-16 h-16 rounded-2xl bg-primary/5 border border-primary/10 flex items-center justify-center mx-auto mb-4">
            <Rss className="w-7 h-7 text-primary/30" />
          </div>
          <p className="font-grotesk font-semibold text-base mb-1">Aucune publication</p>
          <p className="font-inter text-sm text-muted-foreground">Soyez le premier à partager quelque chose !</p>
        </div>
      ) : (
        <AnimatePresence initial={false}>
          <div className="space-y-3">
            {visible.map((post, i) => (
              <PostCard key={post.id} post={post} currentUser={currentUser} />
            ))}
          </div>
        </AnimatePresence>
      )}

      {/* Load more */}
      {hasMore && (
        <div className="flex justify-center pt-2">
          <Button
            variant="outline"
            onClick={() => setPage(p => p + 1)}
            className="border-border text-muted-foreground hover:text-foreground font-inter gap-2"
          >
            Voir plus de publications
          </Button>
        </div>
      )}
    </div>
  );
}