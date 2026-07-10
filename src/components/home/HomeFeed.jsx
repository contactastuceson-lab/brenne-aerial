import { useEffect, useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import PostCard from '@/components/post/PostCard';
import CreatePost from '@/components/post/CreatePost';
import { RefreshCw, Rss, Sparkles, ArrowUp, Users, TrendingUp, Zap, ArrowRight, Hash, X } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { extractHashtags } from '@/lib/hashtags';

const FILTERS = [
  { id: 'foryou',  label: 'Pour vous' },
  { id: 'recent',  label: 'Récents' },
  { id: 'popular', label: 'Populaires' },
  { id: 'medias',  label: 'Médias' },
];

function GuestHero() {
  return (
    <motion.div
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-3xl overflow-hidden mb-5 relative mx-4 mt-4"
      style={{
        background: 'linear-gradient(135deg, hsl(205 90% 6%) 0%, hsl(214 50% 5%) 40%, hsl(195 80% 6%) 100%)',
        border: '1px solid rgba(255,255,255,0.08)',
        boxShadow: '0 16px 64px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06)',
      }}
    >
      <div className="absolute inset-0 grid-bg opacity-25 pointer-events-none" />
      <div className="absolute right-0 top-0 w-56 h-56 rounded-full opacity-15 pointer-events-none"
        style={{ background: 'radial-gradient(circle, hsl(var(--primary)) 0%, transparent 70%)', transform: 'translate(30%, -30%)' }} />
      <div className="relative p-6 md:p-8">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-4"
          style={{ background: 'hsl(var(--primary)/0.15)', border: '1px solid hsl(var(--primary)/0.25)' }}>
          <Sparkles className="w-3.5 h-3.5 text-primary" />
          <span className="font-mono text-xs text-primary">Réseau social · Communautés · Créateurs</span>
        </div>
        <h1 className="font-grotesk font-black text-2xl md:text-3xl xl:text-4xl mb-3 leading-tight"
          style={{ background: 'linear-gradient(135deg, #fff 0%, hsl(var(--primary)) 55%, hsl(var(--accent)) 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
          Le réseau des créateurs<br />et organisations modernes
        </h1>
        <p className="font-inter text-sm text-muted-foreground mb-6 leading-relaxed max-w-md">
          Publiez, échangez, rejoignez des organisations, obtenez des badges de vérification et construisez votre communauté.
        </p>
        <div className="flex flex-wrap gap-3 mb-7">
          <Link to="/register"
            className="flex items-center gap-2 px-5 py-3 rounded-2xl font-grotesk font-bold text-sm text-primary-foreground transition-all duration-200 hover:scale-105 active:scale-95"
            style={{ background: 'linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--accent)) 100%)', boxShadow: '0 0 30px hsl(var(--primary)/0.4), inset 0 1px 0 rgba(255,255,255,0.15)' }}>
            Rejoindre gratuitement <ArrowRight className="w-4 h-4" />
          </Link>
          <Link to="/login"
            className="flex items-center gap-2 px-5 py-3 rounded-2xl font-inter text-sm text-muted-foreground border border-white/10 hover:bg-white/8 hover:text-foreground transition-all">
            Se connecter
          </Link>
        </div>
        <div className="flex items-center gap-6 flex-wrap">
          {[
            { Icon: Users,      label: 'Membres',      value: '1 000+', color: 'text-blue-400'  },
            { Icon: TrendingUp, label: 'Publications',  value: '500+',   color: 'text-emerald-400'},
            { Icon: Zap,        label: 'Organisations', value: '50+',    color: 'text-amber-400' },
          ].map(({ Icon, label, value, color }) => (
            <div key={label} className="flex items-center gap-2">
              <Icon className={`w-4 h-4 ${color}`} />
              <div>
                <p className={`font-grotesk font-bold text-sm ${color}`}>{value}</p>
                <p className="font-mono text-[10px] text-muted-foreground/50">{label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

function FeedSkeleton() {
  return (
    <div className="space-y-0">
      {[1, 2, 3].map(i => (
        <div key={i} className="flex gap-3 px-4 py-4 border-b border-border/40 animate-pulse">
          <div className="w-10 h-10 rounded-full bg-white/8 flex-shrink-0" />
          <div className="flex-1 space-y-2 pt-1">
            <div className="h-3.5 bg-white/8 rounded-lg w-32" />
            <div className="h-2.5 bg-white/5 rounded-lg w-20" />
            <div className="h-4 bg-white/6 rounded-lg w-4/5 mt-2" />
            <div className="h-3 bg-white/4 rounded-lg w-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function HomeFeed({ user }) {
  const [filter, setFilter] = useState('foryou');
  const [newCount, setNewCount] = useState(0);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const urlTag = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return params.get('tag') || '';
  }, [location.search]);

  const clearTag = () => navigate('/', { replace: true });

  const { data: posts = [], isLoading, refetch, isFetching } = useQuery({
    queryKey: ['home-feed-posts', filter],
    queryFn: async () => {
      if (filter === 'popular') return base44.entities.Post.list('-likes_count', 50);
      if (filter === 'medias') {
        const all = await base44.entities.Post.list('-created_date', 100);
        return all.filter(p => p.media_urls?.length > 0);
      }
      // foryou + recent : on récupère les 100 derniers, le tri est fait en front
      return base44.entities.Post.list('-created_date', 100);
    },
    staleTime: 60000,
  });

  useEffect(() => {
    const unsub = base44.entities.Post.subscribe((event) => {
      if (event.type === 'create') setNewCount(c => c + 1);
    });
    return unsub;
  }, []);

  useEffect(() => {
    const onScroll = () => setShowScrollTop(window.scrollY > 600);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleRefresh = useCallback(() => { setNewCount(0); refetch(); }, [refetch]);
  const handleFilter = useCallback((f) => { setFilter(f); setNewCount(0); }, []);

  const filteredPosts = useMemo(() => {
    let result = posts;

    // Hashtag filter
    if (urlTag) {
      result = result.filter(p => {
        const tags = p.hashtags?.length ? p.hashtags : extractHashtags(p.content || '');
        return tags.includes(urlTag.toLowerCase());
      });
    }

    // Algorithmic sort for "Pour vous"
    if (filter === 'foryou') {
      const now = Date.now();
      // Seed stable par session pour que l'ordre ne change pas à chaque render
      const sessionSeed = parseInt(sessionStorage.getItem('feed_seed') || String(Math.floor(Math.random() * 10000)));
      sessionStorage.setItem('feed_seed', String(sessionSeed));

      result = result
        .map((p, i) => {
          const ageHours = (now - new Date(p.created_date).getTime()) / 3600000;
          // Fraîcheur : forte pondération dans les 6 premières heures, décroit sur 72h
          const recencyScore = ageHours < 1 ? 50
            : ageHours < 6 ? 30
            : ageHours < 24 ? 15
            : Math.max(0, 72 - ageHours) * 0.2;
          // Engagement
          const engagementScore = (p.likes_count || 0) * 4 + (p.replies_count || 0) * 8 + (p.views_count || 0) * 0.05;
          // Médias
          const mediaBoost = (p.media_urls?.length > 0) ? 8 : 0;
          // Variabilité stable par session (évite l'ordre identique pour tous)
          const seededRandom = ((sessionSeed * (i + 1) * 9301 + 49297) % 233280) / 233280;
          const randomBoost = seededRandom * 6;

          return { ...p, algoScore: engagementScore + recencyScore + mediaBoost + randomBoost };
        })
        .sort((a, b) => b.algoScore - a.algoScore);
    }

    return result;
  }, [posts, urlTag, filter]);

  return (
    <main className="w-full max-w-[680px] min-w-0 border-r border-zinc-800/60">

      {/* Guest hero */}
      {user === null && <GuestHero />}

      {/* Create post — desktop only */}
      {user && (
        <div className="hidden md:block border-b border-zinc-800/60">
          <CreatePost user={user} onPost={() => { setNewCount(0); refetch(); }} />
        </div>
      )}

      {/* Filter bar */}
      <div className="flex items-center border-b border-zinc-800/60 sticky top-0 bg-background/95 backdrop-blur-md z-10">
        <div className="flex items-center flex-1">
          {FILTERS.map((f) => (
            <button key={f.id} onClick={() => handleFilter(f.id)}
              className={`flex-1 flex justify-center items-center py-4 text-[15px] font-inter font-medium transition-all duration-150 whitespace-nowrap border-b-2 -mb-px relative ${
                filter === f.id
                  ? 'border-primary text-foreground font-bold'
                  : 'border-transparent text-muted-foreground/60 hover:text-foreground hover:bg-white/3'
              }`}>
              {f.label}
            </button>
          ))}
        </div>
        <button onClick={handleRefresh} disabled={isFetching}
          className="flex-shrink-0 px-4 py-4 text-muted-foreground/50 hover:text-foreground transition-all">
          <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* New posts banner */}
      <AnimatePresence>
        {newCount > 0 && (
          <motion.button
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            onClick={handleRefresh}
            className="w-full flex items-center justify-center gap-2 py-3 text-sm font-inter font-medium transition-all hover:bg-primary/5 border-b border-border/40"
            style={{ color: 'hsl(var(--primary))' }}>
            <Sparkles className="w-4 h-4" />
            {newCount} nouveau{newCount > 1 ? 'x' : ''} post{newCount > 1 ? 's' : ''} — Cliquer pour afficher
          </motion.button>
        )}
      </AnimatePresence>

      {/* Active hashtag filter */}
      {urlTag && (
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border/40 bg-primary/5">
          <Hash className="w-4 h-4 text-primary flex-shrink-0" />
          <p className="text-sm text-primary flex-1">#{urlTag}</p>
          <button onClick={clearTag} className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Feed */}
      {user === undefined || isLoading ? (
        <FeedSkeleton />
      ) : filteredPosts.length === 0 ? (
        <div className="py-24 text-center px-4">
          <div className="w-20 h-20 rounded-3xl mx-auto mb-6 flex items-center justify-center"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <Rss className="w-9 h-9 text-primary/25" />
          </div>
          <p className="font-grotesk font-bold text-xl mb-2">Aucune publication</p>
          <p className="font-inter text-sm text-muted-foreground max-w-xs mx-auto">
            {user ? 'Soyez le premier à partager quelque chose !' : 'Connectez-vous pour voir les publications de la communauté.'}
          </p>
        </div>
      ) : (
        <div>
          {filteredPosts.map(post => (
            <PostCard key={post.id} post={post} currentUser={user} />
          ))}
        </div>
      )}

      {/* Scroll to top */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="fixed bottom-24 right-4 lg:bottom-8 lg:right-8 z-40 w-11 h-11 rounded-2xl flex items-center justify-center shadow-2xl transition-all hover:scale-110"
            style={{ background: 'linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--accent)) 100%)', boxShadow: '0 8px 32px hsl(var(--primary)/0.4)' }}>
            <ArrowUp className="w-5 h-5 text-white" />
          </motion.button>
        )}
      </AnimatePresence>
    </main>
  );
}