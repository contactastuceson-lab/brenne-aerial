import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { TrendingUp, Hash, Users, Sparkles, UserPlus, ArrowRight, Flame } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

const TRENDING_TAGS = [
  { tag: 'drone', posts: 142 },
  { tag: 'aerial', posts: 98 },
  { tag: 'captation4k', posts: 76 },
  { tag: 'inspection', posts: 64 },
  { tag: 'brenne', posts: 51 },
  { tag: 'innovation', posts: 43 },
];

function TrendCard({ tag, posts }) {
  return (
    <Link to={`/forum`} className="flex items-center justify-between py-2.5 px-3 rounded-xl hover:bg-secondary/50 transition-colors group">
      <div className="flex items-center gap-2">
        <Hash className="w-3.5 h-3.5 text-primary flex-shrink-0" />
        <div>
          <p className="font-inter text-sm font-medium text-foreground group-hover:text-primary transition-colors">#{tag}</p>
          <p className="font-mono text-[10px] text-muted-foreground">{posts} publications</p>
        </div>
      </div>
      <ArrowRight className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
    </Link>
  );
}

function SuggestedUser({ u }) {
  const name = u.display_name || u.full_name || u.username;
  const avatarInitial = (name?.[0] || 'U').toUpperCase();
  const profileLink = u.username ? `/@${u.username}` : null;

  return (
    <div className="flex items-center gap-3 py-2.5">
      <div className="w-9 h-9 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center overflow-hidden flex-shrink-0">
        {u.avatar_url
          ? <img src={u.avatar_url} alt={name} className="w-full h-full object-cover" />
          : <span className="font-grotesk font-bold text-primary text-xs">{avatarInitial}</span>
        }
      </div>
      <div className="flex-1 min-w-0">
        {profileLink ? (
          <Link to={profileLink} className="font-inter text-sm font-medium text-foreground hover:text-primary transition-colors truncate block">
            {name}
          </Link>
        ) : (
          <p className="font-inter text-sm font-medium text-foreground truncate">{name}</p>
        )}
        {u.username && <p className="font-mono text-[11px] text-muted-foreground">@{u.username}</p>}
      </div>
      {profileLink && (
        <Link to={profileLink}>
          <button className="flex items-center gap-1 text-[11px] font-inter text-primary hover:bg-primary/10 px-2.5 py-1 rounded-full border border-primary/20 transition-colors flex-shrink-0">
            <UserPlus className="w-3 h-3" /> Suivre
          </button>
        </Link>
      )}
    </div>
  );
}

export default function RightSidebar() {
  const { data: users = [] } = useQuery({
    queryKey: ['public-users-sidebar'],
    queryFn: async () => {
      const res = await base44.functions.invoke('getPublicUsers', {});
      return (res?.data || []).slice(0, 5);
    },
    staleTime: 5 * 60 * 1000,
  });

  const { data: hotPosts = [] } = useQuery({
    queryKey: ['hot-discussions'],
    queryFn: () => base44.entities.Discussion.list('-views_count', 3),
    staleTime: 2 * 60 * 1000,
  });

  return (
    <aside className="hidden xl:block w-72 flex-shrink-0">
      <div className="sticky top-24 space-y-3">

        {/* Trending hashtags */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="rounded-2xl border border-border bg-card/60 backdrop-blur-sm overflow-hidden"
        >
          <div className="flex items-center gap-2.5 px-4 py-3.5 border-b border-border/50">
            <TrendingUp className="w-4 h-4 text-primary" />
            <p className="font-inter text-sm font-semibold text-foreground">Tendances</p>
          </div>
          <div className="p-2">
            {TRENDING_TAGS.map(t => <TrendCard key={t.tag} {...t} />)}
          </div>
        </motion.div>

        {/* Suggested users */}
        {users.length > 0 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.05 }}
            className="rounded-2xl border border-border bg-card/60 backdrop-blur-sm overflow-hidden"
          >
            <div className="flex items-center justify-between px-4 py-3.5 border-b border-border/50">
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-4 h-4 text-primary" />
                <p className="font-inter text-sm font-semibold text-foreground">Découvrir</p>
              </div>
              <Link to="/discover" className="text-xs font-inter text-primary hover:underline">Voir tous</Link>
            </div>
            <div className="px-4 py-2 divide-y divide-border/30">
              {users.map(u => <SuggestedUser key={u.id} u={u} />)}
            </div>
          </motion.div>
        )}

        {/* Hot posts */}
        {hotPosts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-2xl border border-border bg-card/60 backdrop-blur-sm overflow-hidden"
          >
            <div className="flex items-center gap-2.5 px-4 py-3.5 border-b border-border/50">
              <Flame className="w-4 h-4 text-orange-400" />
              <p className="font-inter text-sm font-semibold text-foreground">Populaires</p>
            </div>
            <div className="p-3 space-y-2">
              {hotPosts.map(p => (
                <Link key={p.id} to={`/forum/${p.id}`} className="block p-3 rounded-xl hover:bg-secondary/50 transition-colors group">
                  <p className="font-inter text-sm font-medium text-foreground group-hover:text-primary transition-colors line-clamp-2 leading-snug">{p.title}</p>
                  <div className="flex items-center gap-3 mt-1.5">
                    <span className="font-mono text-[10px] text-muted-foreground">{p.replies_count || 0} rép.</span>
                    {p.created_date && (
                      <span className="font-mono text-[10px] text-muted-foreground">
                        {formatDistanceToNow(new Date(p.created_date), { addSuffix: true, locale: fr })}
                      </span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </motion.div>
        )}

        {/* Quick links */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.15 }}
          className="rounded-2xl border border-border/50 bg-card/40 p-4"
        >
          <div className="flex flex-wrap gap-2 text-[11px] font-inter text-muted-foreground">
            {['À propos', 'Mentions légales', 'Confidentialité', 'Forum', 'Blog', 'Contact'].map(l => (
              <Link key={l} to="/" className="hover:text-primary transition-colors">{l}</Link>
            ))}
          </div>
          <p className="text-[10px] font-mono text-muted-foreground/50 mt-3">© 2026 Brenne Aerial</p>
        </motion.div>

      </div>
    </aside>
  );
}