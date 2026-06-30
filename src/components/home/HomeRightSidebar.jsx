import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  TrendingUp, Hash, Sparkles, UserPlus, Flame, Users,
  ArrowRight, Building2, Shield, Star, CheckCircle2
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import VerificationIcons from '@/components/ui/VerificationIcon';

const TRENDING = [
  { tag: 'communauté',  count: 284, rise: '+18%', hot: true  },
  { tag: 'créateurs',   count: 193, rise: '+31%', hot: true  },
  { tag: 'organisations',count: 147, rise: '+12%', hot: false },
  { tag: 'publications', count: 112, rise: '+9%',  hot: false },
  { tag: 'partages',    count: 89,  rise: '+22%', hot: true  },
  { tag: 'events',      count: 64,  rise: '+45%', hot: false },
];

function SectionCard({ children, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="rounded-3xl overflow-hidden"
      style={{
        background: 'linear-gradient(145deg, rgba(255,255,255,0.065) 0%, rgba(255,255,255,0.025) 100%)',
        border: '1px solid rgba(255,255,255,0.09)',
        boxShadow: '0 4px 32px rgba(0,0,0,0.18), inset 0 1px 0 rgba(255,255,255,0.06)',
        backdropFilter: 'blur(12px)',
      }}
    >
      {children}
    </motion.div>
  );
}

function SectionHeader({ icon: Icon, iconColor = 'text-primary', title, to }) {
  return (
    <div className="flex items-center justify-between px-4 py-3.5 border-b border-white/7">
      <div className="flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-xl flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.07)' }}>
          <Icon className={`w-3.5 h-3.5 ${iconColor}`} />
        </div>
        <p className="font-grotesk font-bold text-sm text-foreground">{title}</p>
      </div>
      {to && (
        <Link to={to} className="text-[11px] font-inter text-muted-foreground/50 hover:text-primary transition-colors flex items-center gap-1">
          Tout <ArrowRight className="w-3 h-3" />
        </Link>
      )}
    </div>
  );
}

function TrendRow({ tag, count, rise, hot, i }) {
  return (
    <Link to="/forum" className="group flex items-center gap-3 px-4 py-2.5 hover:bg-white/6 transition-colors rounded-xl mx-1">
      <span className="font-mono text-xs text-muted-foreground/25 w-4 text-right flex-shrink-0">{i + 1}</span>
      <div className="w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: hot ? 'rgba(251,146,60,0.12)' : 'rgba(255,255,255,0.05)' }}
      >
        {hot ? <Flame className="w-3.5 h-3.5 text-orange-400" /> : <Hash className="w-3.5 h-3.5 text-muted-foreground/40" />}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-inter text-sm font-medium text-foreground group-hover:text-primary transition-colors truncate">#{tag}</p>
        <p className="font-mono text-[10px] text-muted-foreground/35">{count} publications</p>
      </div>
      <span className="font-mono text-[10px] text-emerald-400 flex-shrink-0">{rise}</span>
    </Link>
  );
}

function SuggestedUserRow({ u }) {
  const name = u.display_name || u.full_name || u.username;
  const initial = (name?.[0] || 'U').toUpperCase();
  const profileLink = u.username ? `/@${u.username}` : null;

  return (
    <div className="flex items-center gap-3 px-4 py-2.5">
      <div className="w-10 h-10 rounded-2xl overflow-hidden border border-white/8 flex-shrink-0"
        style={{ background: 'hsl(var(--primary)/0.12)' }}
      >
        {u.avatar_url
          ? <img src={u.avatar_url} alt={name} className="w-full h-full object-cover" />
          : <div className="w-full h-full flex items-center justify-center">
              <span className="font-grotesk font-bold text-primary text-xs">{initial}</span>
            </div>
        }
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
          {profileLink
            ? <Link to={profileLink} className="font-grotesk font-semibold text-sm text-foreground hover:text-primary transition-colors truncate">{name}</Link>
            : <span className="font-grotesk font-semibold text-sm text-foreground truncate">{name}</span>
          }
          {u.verifications?.length > 0 && <VerificationIcons verifications={u.verifications} size="sm" user={u} />}
        </div>
        {u.username && <p className="font-mono text-[10px] text-muted-foreground/35">@{u.username}</p>}
      </div>
      {profileLink && (
        <Link to={profileLink}>
          <button className="flex-shrink-0 flex items-center gap-1 text-[10px] font-inter font-semibold text-primary border border-primary/25 hover:bg-primary/15 px-2.5 py-1.5 rounded-xl transition-all hover:scale-105">
            <UserPlus className="w-2.5 h-2.5" /> Suivre
          </button>
        </Link>
      )}
    </div>
  );
}

function HotPostRow({ post, i }) {
  return (
    <Link to={`/forum/${post.id}`} className="group flex items-start gap-3 px-4 py-3 hover:bg-white/5 rounded-xl mx-1 transition-colors">
      <span className="font-mono text-xs text-muted-foreground/20 flex-shrink-0 mt-0.5 w-4">{i + 1}</span>
      <div className="flex-1 min-w-0">
        <p className="font-inter text-sm text-foreground/80 group-hover:text-primary transition-colors line-clamp-2 leading-snug">{post.title}</p>
        <div className="flex items-center gap-2 mt-1.5">
          <span className="font-mono text-[10px] text-muted-foreground/30">{post.replies_count || 0} rép.</span>
          {post.created_date && (
            <>
              <span className="w-0.5 h-0.5 rounded-full bg-muted-foreground/20" />
              <span className="font-mono text-[10px] text-muted-foreground/30">
                {formatDistanceToNow(new Date(post.created_date), { addSuffix: true, locale: fr })}
              </span>
            </>
          )}
        </div>
      </div>
    </Link>
  );
}

export default function HomeRightSidebar() {
  const { data: suggestedUsers = [] } = useQuery({
    queryKey: ['sidebar-suggested-users'],
    queryFn: async () => {
      const res = await base44.functions.invoke('getPublicUsers', {});
      return (res?.data || []).filter(u => u.username).slice(0, 4);
    },
    staleTime: 5 * 60 * 1000,
  });

  const { data: hotPosts = [] } = useQuery({
    queryKey: ['sidebar-hot-posts'],
    queryFn: () => base44.entities.Discussion.list('-views_count', 5),
    staleTime: 2 * 60 * 1000,
  });

  return (
    <aside className="hidden xl:flex flex-col w-80 flex-shrink-0 h-[calc(100vh-68px)] sticky top-[68px] overflow-y-auto py-4 px-3 scrollbar-hide space-y-3">

      {/* Trending hashtags */}
      <SectionCard delay={0}>
        <SectionHeader icon={TrendingUp} title="Tendances" to="/forum" />
        <div className="py-2">
          {TRENDING.map((t, i) => <TrendRow key={t.tag} {...t} i={i} />)}
        </div>
      </SectionCard>

      {/* Comptes à suivre */}
      {suggestedUsers.length > 0 && (
        <SectionCard delay={0.08}>
          <SectionHeader icon={Sparkles} title="Comptes suggérés" to="/discover" />
          <div className="py-2">
            {suggestedUsers.map(u => <SuggestedUserRow key={u.id} u={u} />)}
          </div>
          <div className="px-4 pb-3">
            <Link to="/discover" className="block w-full text-center text-xs font-inter font-medium text-primary/80 hover:text-primary py-2.5 rounded-2xl border border-primary/15 hover:bg-primary/8 transition-all">
              Voir tous les membres →
            </Link>
          </div>
        </SectionCard>
      )}

      {/* Discussions populaires */}
      {hotPosts.length > 0 && (
        <SectionCard delay={0.14}>
          <SectionHeader icon={Flame} iconColor="text-orange-400" title="Discussions populaires" to="/forum" />
          <div className="py-2">
            {hotPosts.map((p, i) => <HotPostRow key={p.id} post={p} i={i} />)}
          </div>
        </SectionCard>
      )}

      {/* Vérification */}
      <SectionCard delay={0.2}>
        <div className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Shield className="w-4 h-4 text-primary" />
            <p className="font-grotesk font-bold text-sm">Système de vérification</p>
          </div>
          <p className="font-inter text-xs text-muted-foreground leading-relaxed mb-3">
            Les badges de vérification attestent l'authenticité des profils et des organisations sur Brenne Aerial.
          </p>
          <div className="space-y-2">
            {[
              { label: 'Compte vérifié', color: 'text-blue-400', desc: 'Identité confirmée' },
              { label: 'Certifié', color: 'text-emerald-400', desc: 'Compétences validées' },
              { label: 'Officiel', color: 'text-amber-400', desc: 'Entité officielle' },
            ].map(b => (
              <div key={b.label} className="flex items-center gap-2">
                <CheckCircle2 className={`w-3.5 h-3.5 flex-shrink-0 ${b.color}`} />
                <div>
                  <span className={`font-inter text-xs font-medium ${b.color}`}>{b.label}</span>
                  <span className="font-inter text-xs text-muted-foreground/50"> · {b.desc}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </SectionCard>

      {/* Footer links */}
      <div className="px-2 pb-4">
        <div className="flex flex-wrap gap-x-3 gap-y-2 text-[11px] font-inter text-muted-foreground/35">
          {[['À propos', '/about'], ['Blog', '/blog'], ['Forum', '/forum'], ['Contact', '/contact'], ['Confidentialité', '/legal/privacy'], ['CGU', '/legal/terms']].map(([l, to]) => (
            <Link key={l} to={to} className="hover:text-muted-foreground/70 transition-colors">{l}</Link>
          ))}
        </div>
        <p className="text-[10px] font-mono text-muted-foreground/20 mt-2.5">© 2026 Brenne Aerial</p>
      </div>
    </aside>
  );
}