import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import CreatePostCard from '@/components/feed/CreatePostCard';
import FeedList from '@/components/feed/FeedList';
import LeftSidebar from '@/components/feed/LeftSidebar';
import RightSidebar from '@/components/feed/RightSidebar';
import { Sparkles, TrendingUp, Users, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';

function WelcomeBanner({ user }) {
  if (user) return null;
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 via-card/80 to-accent/5 backdrop-blur-sm p-5 mb-4"
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-primary/20 border border-primary/30 flex items-center justify-center flex-shrink-0">
          <Sparkles className="w-6 h-6 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="font-grotesk font-bold text-base text-foreground mb-0.5">Bienvenue sur Brenne Aerial</h2>
          <p className="font-inter text-sm text-muted-foreground">Rejoignez la communauté — publiez, discutez, découvrez des créateurs et des organisations.</p>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <Link to="/register" className="px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-inter font-medium hover:bg-primary/90 transition-colors">
            Créer un compte
          </Link>
          <Link to="/login" className="px-4 py-2 bg-secondary text-foreground rounded-xl text-sm font-inter font-medium hover:bg-secondary/80 transition-colors">
            Se connecter
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

function QuickStats() {
  const { data: discussions = [] } = useQuery({
    queryKey: ['feed-stats-discussions'],
    queryFn: () => base44.entities.Discussion.list('-created_date', 1),
    staleTime: 5 * 60 * 1000,
  });

  const stats = [
    { icon: Users,       label: 'Communauté',    value: '1K+',  color: 'text-blue-400' },
    { icon: TrendingUp,  label: 'Publications',  value: '500+', color: 'text-green-400' },
    { icon: Zap,         label: 'Organisations', value: '50+',  color: 'text-amber-400' },
  ];

  return (
    <div className="grid grid-cols-3 gap-2 mb-4 xl:hidden">
      {stats.map(({ icon: Icon, label, value, color }) => (
        <div key={label} className="rounded-2xl border border-border bg-card/60 backdrop-blur-sm p-3 text-center">
          <Icon className={`w-4 h-4 ${color} mx-auto mb-1`} />
          <p className={`font-grotesk font-bold text-sm ${color}`}>{value}</p>
          <p className="font-mono text-[10px] text-muted-foreground">{label}</p>
        </div>
      ))}
    </div>
  );
}

export default function HomePage() {
  const [user, setUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    base44.auth.isAuthenticated().then(async authed => {
      if (authed) {
        try { setUser(await base44.auth.me()); } catch {}
      }
      setAuthChecked(true);
    });
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Subtle ambient background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-[600px] h-[400px] bg-primary/3 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 right-1/4 w-[400px] h-[300px] bg-accent/3 rounded-full blur-3xl" />
        <div className="absolute inset-0 grid-bg opacity-20" />
      </div>

      {/* Main layout */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-10">
        <div className="flex gap-6 items-start">

          {/* Left sidebar */}
          <LeftSidebar user={authChecked ? user : null} />

          {/* Center feed */}
          <main className="flex-1 min-w-0 max-w-2xl mx-auto lg:mx-0">

            {/* Welcome banner (guests only) */}
            {authChecked && <WelcomeBanner user={user} />}

            {/* Stats strip (mobile/tablet) */}
            <QuickStats />

            {/* Create post */}
            {user && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4"
              >
                <CreatePostCard user={user} />
              </motion.div>
            )}

            {/* Feed */}
            <FeedList currentUser={user} />
          </main>

          {/* Right sidebar */}
          <RightSidebar />

        </div>
      </div>
    </div>
  );
}