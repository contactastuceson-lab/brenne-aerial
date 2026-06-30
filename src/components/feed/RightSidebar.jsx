import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { TrendingUp, Hash, Sparkles, UserPlus, Flame, Users, Calendar, ArrowRight, Zap } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import VerificationIcons from '@/components/ui/VerificationIcon';

const TRENDING_TAGS = [
  { tag: 'drone',       posts: 142, trend: '+12%' },
  { tag: 'aerial',      posts: 98,  trend: '+8%' },
  { tag: 'captation4k', posts: 76,  trend: '+24%' },
  { tag: 'inspection',  posts: 64,  trend: '+5%' },
  { tag: 'brenne',      posts: 51,  trend: '+18%' },
  { tag: 'innovation',  posts: 43,  trend: '+31%' },
];

function SideSection({ icon: Icon, iconColor = 'text-primary', title, children, to, toLabel }) {
  return (
    <div className="rounded-2xl border border-border/60 bg-card/70 backdrop-blur-md overflow-hidden"
      style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.1)' }}
    >
      <div className="flex items-center justify-between px-4 py-3.5 border-b border-border/40">
        <div className="flex items-center gap-2.5">
          <Icon className={`w-4 h-4 ${iconColor}`} />
          <p className="font-inter text-sm font-semibold text-foreground">{title}</p>
        </div>
        {to && (
          <Link to={to} className="text-xs font-inter text-primary hover:text-primary/80 transition-colors flex items-center gap-1">
            {toLabel || 'Voir tout'} <ArrowRight className="w-3 h-3" />
          </Link>
        )}
      </div>
      <div className="p-2">{children}</div>
    </div>
  );
}

function TrendRow({ tag, posts, trend }) {
  return (
    <Link to="/forum" className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-secondary/50 transition-colors group cursor-pointer">
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
          <Hash className="w-3.5 h-3.5 text-primary" />
        </div>
        <div className="min-w-0">
          <p className="font-inter text-sm font-medium text-foreground group-hover:text-primary transition-colors truncate">#{tag}</p>
          <p className="font-mono text-[10px] text-muted-foreground">{posts} publications</p>
        </div>
      </div>
      <span className="font-mono text-[10px] text-emerald-400 flex-shrink-0">{trend}</span>
    </Link>
  );
}

function SuggestedUserRow({ u }) {
  const name = u.display_name || u.full_name || u.username;
  const avatarInitial = (name?.[0] || 'U').toUpperCase();
  const profileLink = u.username ? `/@${u.username}` : null;

  return (
    <div className="flex items-center gap-3 px-3 py-2.5">
      <div className="w-9 h-9 rounded-full bg-primary/10 border border-primary/15 flex items-center justify-center overflow-hidden flex-shrink-0">
        {u.avatar_url
          ? <img src={u.avatar_url} alt={name} className="w-full h-full object-cover" />
          : <span className="font-grotesk font-bold text-primary text-xs">{avatarInitial}</span>
        }
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          {profileLink ? (
            <Link to={profileLink} className="font-inter text-sm font-medium text-foreground hover:text-primary transition-colors truncate">
              {name}
            </Link>
          ) : (
            <span className="font-inter text-sm font-medium text-foreground truncate">{name}</span>
          )}
          {u.verifications?.length > 0 && <VerificationIcons verifications={u.verifications} size="sm" user={u} />}
        </div>
        {u.username && <p className="font-mono text-[11px] text-muted-foreground">@{u.username}</p>}
      </div>
      {profileLink && (
        <Link to={profileLink} className="flex-shrink-0">
          <button className="flex items-center gap-1 text-[11px] font-inter font-medium text-primary border border-primary/25 hover:bg-primary/10 px-2.5 py-1 rounded-full transition-colors">
            <UserPlus className="w-3 h-3" />
            Suivre
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
      return (res?.data || []).filter(u => u.username).slice(0, 5);
    },
    staleTime: 5 * 60 * 1000,
  });

  const { data: hotPosts = [] } = useQuery({
    queryKey: ['hot-discussions-sidebar'],
    queryFn: () => base44.entities.Discussion.list('-views_count', 4),
    staleTime: 2 * 60 * 1000,
  });

  const { data: recentUsers = [] } = useQuery({
    queryKey: ['recent-users-sidebar'],
    queryFn: async () => {
      const res = await base44.functions.invoke('getPublicUsers', {});
      const all = res?.data || [];
      return all.sort((a, b) => new Date(b.created_date || 0) - new Date(a.created_date || 0)).slice(0, 3);
    },
    staleTime: 5 * 60 * 1000,
  });

  return (
    <aside className="hidden xl:block w-72 flex-shrink-0">
      <div className="sticky top-20 space-y-3">

        {/* Trending */}
        <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }}>
          <SideSection icon={TrendingUp} title="Tendances" to="/forum" toLabel="Forum">
            {TRENDING_TAGS.map(t => <TrendRow key={t.tag} {...t} />)}
          </SideSection>
        </motion.div>

        {/* Suggested accounts */}
        {users.length > 0 && (
          <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.05 }}>
            <SideSection icon={Sparkles} title="Comptes suggérés" to="/discover" toLabel="Découvrir">
              {users.map(u => <SuggestedUserRow key={u.id} u={u} />)}
            </SideSection>
          </motion.div>
        )}

        {/* Hot posts */}
        {hotPosts.length > 0 && (
          <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
            <SideSection icon={Flame} iconColor="text-orange-400" title="Populaires" to="/forum">
              <div className="space-y-1">
                {hotPosts.map((p, i) => (
                  <Link key={p.id} to={`/forum/${p.id}`} className="block px-3 py-2.5 rounded-xl hover:bg-secondary/50 transition-colors group">
                    <div className="flex items-start gap-2.5">
                      <span className="font-mono text-xs text-muted-foreground/50 flex-shrink-0 mt-0.5 w-4">{i + 1}.</span>
                      <div className="min-w-0">
                        <p className="font-inter text-sm text-foreground group-hover:text-primary transition-colors line-clamp-2 leading-snug">{p.title}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="font-mono text-[10px] text-muted-foreground">{p.replies_count || 0} rép.</span>
                          {p.created_date && (
                            <span className="font-mono text-[10px] text-muted-foreground">
                              {formatDistanceToNow(new Date(p.created_date), { addSuffix: true, locale: fr })}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </SideSection>
          </motion.div>
        )}

        {/* Nouveaux membres */}
        {recentUsers.length > 0 && (
          <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }}>
            <SideSection icon={Users} title="Nouveaux membres" to="/discover">
              {recentUsers.map(u => <SuggestedUserRow key={u.id} u={u} />)}
            </SideSection>
          </motion.div>
        )}

        {/* Quick links */}
        <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
          <div className="px-2 py-3">
            <div className="flex flex-wrap gap-x-3 gap-y-1.5 text-[11px] font-inter text-muted-foreground/60">
              {['À propos', 'Blog', 'Forum', 'Partenaires', 'Parrainage', 'Contact', 'Confidentialité', 'CGU'].map(l => (
                <Link key={l} to="/" className="hover:text-muted-foreground transition-colors">{l}</Link>
              ))}
            </div>
            <p className="text-[10px] font-mono text-muted-foreground/30 mt-3">© 2026 Brenne Aerial · Tous droits réservés</p>
          </div>
        </motion.div>

      </div>
    </aside>
  );
}