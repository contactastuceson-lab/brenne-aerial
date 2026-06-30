import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import HomePostCard from './HomePostCard';
import HomeCreatePost from './HomeCreatePost';
import { Loader2, RefreshCw, Rss, Sparkles, Flame, Clock, ArrowUp, Users, TrendingUp, Zap, ArrowRight, MessageSquare, Image, Wrench, HelpCircle, Grid3x3 } from 'lucide-react';
import { Link } from 'react-router-dom';

const FILTERS = [
  { id: 'recent',    label: 'Récents',    icon: Clock },
  { id: 'popular',   label: 'Populaires', icon: Flame },
  { id: 'general',   label: 'Général',    icon: MessageSquare },
  { id: 'partages',  label: 'Partages',   icon: Image },
  { id: 'technique', label: 'Technique',  icon: Wrench },
  { id: 'aide',      label: 'Aide',       icon: HelpCircle },
];

function GuestHero() {
  return (
    <motion.div
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-3xl overflow-hidden mb-5 relative"
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
          style={{ background: 'hsl(var(--primary)/0.15)', border: '1px solid hsl(var(--primary)/0.25)' }}
        >
          <Sparkles className="w-3.5 h-3.5 text-primary" />
          <span className="font-mono text-xs text-primary">Réseau social · Communautés · Créateurs</span>
        </div>

        <h1 className="font-grotesk font-black text-2xl md:text-3xl xl:text-4xl mb-3 leading-tight"
          style={{ background: 'linear-gradient(135deg, #fff 0%, hsl(var(--primary)) 55%, hsl(var(--accent)) 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}
        >
          Le réseau des créateurs<br />et organisations modernes
        </h1>
        <p className="font-inter text-sm text-muted-foreground mb-6 leading-relaxed max-w-md">
          Publiez, échangez, rejoignez des organisations, obtenez des badges de vérification et construisez votre communauté.
        </p>

        <div className="flex flex-wrap gap-3 mb-7">
          <Link to="/register"
            className="flex items-center gap-2 px-5 py-3 rounded-2xl font-grotesk font-bold text-sm text-primary-foreground transition-all duration-200 hover:scale-105 active:scale-95"
            style={{ background: 'linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--accent)) 100%)', boxShadow: '0 0 30px hsl(var(--primary)/0.4), inset 0 1px 0 rgba(255,255,255,0.15)' }}
          >
            Rejoindre gratuitement <ArrowRight className="w-4 h-4" />
          </Link>
          <Link to="/login"
            className="flex items-center gap-2 px-5 py-3 rounded-2xl font-inter text-sm text-muted-foreground border border-white/10 hover:bg-white/8 hover:text-foreground transition-all"
          >
            Se connecter
          </Link>
        </div>

        <div className="flex items-center gap-6 flex-wrap">
          {[
            { icon: Users, label: 'Membres', value: '1 000+', color: 'text-blue-400' },
            { icon: TrendingUp, label: 'Publications', value: '500+', color: 'text-emerald-400' },
            { icon: Zap, label: 'Organisations', value: '50+', color: 'text-amber-400' },
          ].map(({ icon: Icon, label, value, color }) => (
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
    <div className="space-y-4">
      {[1, 2, 3].map(i => (
        <div key={i} className="rounded-3xl border border-white/6 overflow-hidden animate-pulse"
          style={{ background: 'rgba(255,255,255,0.03)', boxShadow: '0 4px 24px rgba(0,0,0,0.2)' }}
        >
          <div className="p-5">
            <div className="flex gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-white/8 flex-shrink-0" />
              <div className="flex-1 space-y-2 py-1">
                <div className="h-3.5 bg-white/8 rounded-lg w-32" />
                <div className="h-2.5 bg-white/5 rounded-lg w-20" />
              </div>
            </div>
            <div className="space-y-2.5">
              <div className="h-5 bg-white/8 rounded-lg w-4/5" />
              <div className="h-3.5 bg-white/5 rounded-lg w-full" />
              <div className="h-3.5 bg-white/5 rounded-lg w-5/6" />
              <div className="h-3.5 bg-white/4 rounded-lg w-3/4" />
            </div>
          </div>
          <div className="px-5 pb-4 flex gap-3 pt-3 border-t border-white/5">
            <div className="h-9 w-20 bg-white/5 rounded-2xl" />
            <div className="h-9 w-16 bg-white/5 rounded-2xl" />
            <div className="h-9 w-16 bg-white/5 rounded-2xl" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function HomeFeed({ user }) {
  const [filter, setFilter] = useState('recent');
  const [newCount, setNewCount] = useState(0);
  const [showScrollTop, setShowScrollTop] = useState(false);

  const { data: posts = [], isLoading, refetch, isFetching } = useQuery({
    queryKey: ['home-feed', filter],
    queryFn: async () => {
      if (filter === 'popular') return base44.entities.Discussion.list('-views_count', 30);
      if (['general', 'technique', 'partages', 'aide', 'autres'].includes(filter))
        return base44.entities.Discussion.filter({ category: filter }, '-created_date', 30);
      return base44.entities.Discussion.list('-created_date', 30);
    },
    staleTime: 60000,
  });

  useEffect(() => {
    const unsub = base44.entities.Discussion.subscribe((event) => {
      if (event.type === 'create') setNewCount(c => c + 1);
    });
    return unsub;
  }, []);

  useEffect(() => {
    const onScroll = () => setShowScrollTop(window.scrollY > 600);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleRefresh = () => { setNewCount(0); refetch(); };
  const handleFilter = (f) => { setFilter(f); setNewCount(0); };

  return (
    <main className="flex-1 min-w-0 max-w-2xl mx-auto w-full py-0">

      {/* Guest hero */}
      {user === null && <div className="px-4"><GuestHero /></div>}

      {/* Create post — flat, délimité uniquement par une ligne basse */}
      {user && (
        <div className="border-b border-zinc-800/60">
          <HomeCreatePost user={user} onPost={() => { setNewCount(0); refetch(); }} />
        </div>
      )}

      {/* Filter bar */}
      <div className="flex items-center border-b border-border/40">
        <div className="flex items-center overflow-x-auto scrollbar-hide flex-1">
          {FILTERS.map((f) => (
            <button key={f.id} onClick={() => handleFilter(f.id)}
              className={`flex-shrink-0 px-4 py-4 text-sm font-inter font-medium transition-all duration-150 whitespace-nowrap border-b-2 -mb-px ${
                filter === f.id
                  ? 'border-primary text-foreground font-bold'
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-white/3'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <button onClick={handleRefresh} disabled={isFetching} className="flex-shrink-0 p-4 text-muted-foreground hover:text-foreground transition-all">
          <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* New posts banner */}
      <AnimatePresence>
        {newCount > 0 && (
          <motion.button
            initial={{ opacity: 0, y: -12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.96 }}
            onClick={handleRefresh}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl mb-4 text-sm font-inter font-medium transition-all hover:scale-[1.01]"
            style={{
              background: 'linear-gradient(135deg, hsl(var(--primary)/0.15) 0%, hsl(var(--accent)/0.08) 100%)',
              border: '1px solid hsl(var(--primary)/0.3)',
              color: 'hsl(var(--primary))',
            }}
          >
            <Sparkles className="w-4 h-4" />
            {newCount} nouvelle{newCount > 1 ? 's' : ''} publication{newCount > 1 ? 's' : ''} — Cliquer pour afficher
          </motion.button>
        )}
      </AnimatePresence>

      {/* Feed content */}
      {user === undefined ? (
        <FeedSkeleton />
      ) : isLoading ? (
        <FeedSkeleton />
      ) : posts.length === 0 ? (
        <div className="py-24 text-center">
          <div className="w-20 h-20 rounded-3xl mx-auto mb-6 flex items-center justify-center"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
          >
            <Rss className="w-9 h-9 text-primary/25" />
          </div>
          <p className="font-grotesk font-bold text-xl mb-2">Aucune publication</p>
          <p className="font-inter text-sm text-muted-foreground max-w-xs mx-auto">
            {user ? 'Soyez le premier à partager quelque chose !' : 'Connectez-vous pour voir les publications de la communauté.'}
          </p>
        </div>
      ) : (
        <div>
          {posts.map((post, i) => (
            <HomePostCard key={post.id} post={post} currentUser={user} index={i} />
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
            style={{
              background: 'linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--accent)) 100%)',
              boxShadow: '0 8px 32px hsl(var(--primary)/0.4)',
            }}
          >
            <ArrowUp className="w-5 h-5 text-white" />
          </motion.button>
        )}
      </AnimatePresence>
    </main>
  );
}