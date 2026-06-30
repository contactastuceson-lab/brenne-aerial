import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import CreatePostCard from '@/components/feed/CreatePostCard';
import FeedList from '@/components/feed/FeedList';
import LeftSidebar from '@/components/feed/LeftSidebar';
import RightSidebar from '@/components/feed/RightSidebar';
import { Sparkles, ArrowRight, Users, TrendingUp, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

/* ── Guest welcome banner ── */
function GuestBanner() {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-primary/20 overflow-hidden mb-4"
      style={{
        background: 'linear-gradient(135deg, hsl(205 90% 5%) 0%, hsl(214 50% 6%) 60%, hsl(195 80% 7%) 100%)',
        boxShadow: '0 4px 32px rgba(0,0,0,0.2), 0 0 0 1px rgba(var(--primary),0.12)',
      }}
    >
      <div className="p-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-primary/20 border border-primary/30 flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-6 h-6 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-grotesk font-bold text-base text-foreground">Bienvenue sur Brenne Aerial</h2>
            <p className="font-inter text-sm text-muted-foreground mt-0.5">
              Publiez, discutez, découvrez des créateurs et rejoignez des organisations.
            </p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <Link
              to="/login"
              className="px-4 py-2 bg-secondary text-foreground rounded-xl text-sm font-inter font-medium hover:bg-secondary/80 transition-colors"
            >
              Se connecter
            </Link>
            <Link
              to="/register"
              className="flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-inter font-semibold hover:bg-primary/90 transition-colors"
              style={{ boxShadow: '0 0 20px rgba(var(--primary),0.3)' }}
            >
              Créer un compte <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Stats strip */}
        <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-border/30">
          {[
            { icon: Users,      label: 'Membres actifs',  value: '1K+',  color: 'text-blue-400' },
            { icon: TrendingUp, label: 'Publications',    value: '500+', color: 'text-green-400' },
            { icon: Zap,        label: 'Organisations',   value: '50+',  color: 'text-amber-400' },
          ].map(({ icon: Icon, label, value, color }) => (
            <div key={label} className="text-center">
              <div className="flex items-center justify-center gap-1.5 mb-0.5">
                <Icon className={`w-3.5 h-3.5 ${color}`} />
                <span className={`font-grotesk font-bold text-sm ${color}`}>{value}</span>
              </div>
              <p className="font-mono text-[10px] text-muted-foreground">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

/* ── Mobile quick stats (shown only on mobile/tablet, not on desktop with sidebars) ── */
function MobileQuickNav({ user }) {
  const links = [
    { to: '/discover',     label: 'Explorer',  emoji: '🧭' },
    { to: '/forum',        label: 'Forum',     emoji: '💬' },
    { to: '/messages',     label: 'Messages',  emoji: '✉️' },
    { to: '/partenaires',  label: 'Partenaires',emoji: '🤝' },
  ];
  return (
    <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1 lg:hidden mb-4">
      {links.map(l => (
        <Link
          key={l.to}
          to={l.to}
          className="flex-shrink-0 flex items-center gap-2 px-3 py-2 rounded-xl border border-border/60 bg-card/60 text-sm font-inter text-muted-foreground hover:text-foreground hover:bg-card transition-colors"
        >
          <span>{l.emoji}</span>
          <span>{l.label}</span>
        </Link>
      ))}
    </div>
  );
}

export default function HomePage() {
  const [user, setUser]           = useState(undefined); // undefined = loading
  const [authChecked, setChecked] = useState(false);

  useEffect(() => {
    base44.auth.isAuthenticated().then(async authed => {
      if (authed) {
        try { setUser(await base44.auth.me()); } catch { setUser(null); }
      } else {
        setUser(null);
      }
      setChecked(true);
    });
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Ambient background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 right-1/3 w-[500px] h-[400px] bg-primary/4 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/3 left-1/4 w-[400px] h-[300px] bg-accent/3 rounded-full blur-[80px]" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-5 lg:px-6 pt-[72px] pb-16">
        <div className="flex gap-5 xl:gap-6 items-start">

          {/* Left sidebar — desktop only */}
          {authChecked && <LeftSidebar user={user} />}

          {/* ── Center feed ── */}
          <main className="flex-1 min-w-0 w-full max-w-2xl mx-auto lg:mx-0">

            {/* Mobile quick nav */}
            {authChecked && <MobileQuickNav user={user} />}

            {/* Guest banner */}
            <AnimatePresence>
              {authChecked && !user && <GuestBanner />}
            </AnimatePresence>

            {/* Create post */}
            <AnimatePresence>
              {user && (
                <motion.div
                  key="create-post"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-4"
                >
                  <CreatePostCard user={user} />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Feed */}
            {authChecked && <FeedList currentUser={user} />}

            {/* Loading skeleton */}
            {!authChecked && (
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="rounded-2xl border border-border/40 bg-card/50 p-5 animate-pulse">
                    <div className="flex gap-3 mb-4">
                      <div className="w-11 h-11 rounded-full bg-secondary/60" />
                      <div className="flex-1 space-y-2">
                        <div className="h-3.5 bg-secondary/60 rounded-lg w-1/3" />
                        <div className="h-2.5 bg-secondary/40 rounded-lg w-1/5" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-3 bg-secondary/40 rounded-lg" />
                      <div className="h-3 bg-secondary/40 rounded-lg w-5/6" />
                      <div className="h-3 bg-secondary/40 rounded-lg w-3/4" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </main>

          {/* Right sidebar — xl only */}
          <RightSidebar />

        </div>
      </div>
    </div>
  );
}