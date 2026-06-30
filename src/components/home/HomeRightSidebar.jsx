import { Link } from 'react-router-dom';
import {
  TrendingUp, Hash, Sparkles, UserPlus, Flame,
  ArrowRight, Shield, CheckCircle2
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import VerificationIcons from '@/components/ui/VerificationIcon';

const TRENDING = [
  { tag: 'communauté',    count: 284, rise: '+18%', hot: true  },
  { tag: 'créateurs',     count: 193, rise: '+31%', hot: true  },
  { tag: 'organisations', count: 147, rise: '+12%', hot: false },
  { tag: 'publications',  count: 112, rise: '+9%',  hot: false },
  { tag: 'partages',      count: 89,  rise: '+22%', hot: true  },
];

function Block({ children }) {
  return (
    <div className="rounded-2xl border border-zinc-800/50 overflow-hidden">
      {children}
    </div>
  );
}

function BlockTitle({ icon: Icon, iconColor = 'text-primary', title, to }) {
  return (
    <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800/50">
      <div className="flex items-center gap-2">
        <Icon className={`w-4 h-4 ${iconColor}`} />
        <span className="font-grotesk font-bold text-sm text-foreground">{title}</span>
      </div>
      {to && (
        <Link to={to} className="text-[11px] text-muted-foreground/50 hover:text-primary transition-colors flex items-center gap-0.5">
          Tout <ArrowRight className="w-3 h-3" />
        </Link>
      )}
    </div>
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
    <aside className="hidden xl:flex flex-col w-72 flex-shrink-0 h-screen sticky top-0 overflow-y-auto py-5 px-4 scrollbar-hide gap-4 border-l border-zinc-800/50">

      {/* Tendances */}
      <Block>
        <BlockTitle icon={TrendingUp} title="Tendances" to="/forum" />
        <div className="divide-y divide-zinc-800/40">
          {TRENDING.map((t, i) => (
            <Link key={t.tag} to="/forum"
              className="flex items-center gap-3 px-4 py-2.5 hover:bg-white/4 transition-colors group"
            >
              <span className="font-mono text-[10px] text-muted-foreground/30 w-3 flex-shrink-0">{i + 1}</span>
              <div className="flex-1 min-w-0">
                <p className="font-inter text-sm font-medium text-foreground group-hover:text-primary transition-colors">#{t.tag}</p>
                <p className="font-mono text-[10px] text-muted-foreground/40">{t.count} publications</p>
              </div>
              <span className="font-mono text-[10px] text-emerald-400 flex-shrink-0">{t.rise}</span>
            </Link>
          ))}
        </div>
      </Block>

      {/* Comptes suggérés */}
      {suggestedUsers.length > 0 && (
        <Block>
          <BlockTitle icon={Sparkles} title="Comptes suggérés" to="/discover" />
          <div className="divide-y divide-zinc-800/40">
            {suggestedUsers.map(u => {
              const name = u.display_name || u.full_name || u.username;
              const initial = (name?.[0] || 'U').toUpperCase();
              const profileLink = u.username ? `/@${u.username}` : null;
              return (
                <div key={u.id} className="flex items-center gap-3 px-4 py-3">
                  <div className="w-9 h-9 rounded-full overflow-hidden border border-white/10 flex-shrink-0"
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
                    <div className="flex items-center gap-1 flex-wrap">
                      {profileLink
                        ? <Link to={profileLink} className="font-grotesk font-semibold text-sm text-foreground hover:text-primary transition-colors truncate">{name}</Link>
                        : <span className="font-grotesk font-semibold text-sm text-foreground truncate">{name}</span>
                      }
                      {u.verifications?.length > 0 && <VerificationIcons verifications={u.verifications} size="sm" user={u} />}
                    </div>
                    {u.username && <p className="font-mono text-[10px] text-muted-foreground/40">@{u.username}</p>}
                  </div>
                  {profileLink && (
                    <Link to={profileLink}>
                      <button className="flex-shrink-0 text-[10px] font-semibold text-primary border border-primary/30 hover:bg-primary/10 px-2.5 py-1 rounded-full transition-colors">
                        Suivre
                      </button>
                    </Link>
                  )}
                </div>
              );
            })}
          </div>
          <div className="px-4 py-3 border-t border-zinc-800/40">
            <Link to="/discover" className="text-xs text-primary/70 hover:text-primary transition-colors">
              Voir tous les membres →
            </Link>
          </div>
        </Block>
      )}

      {/* Discussions populaires */}
      {hotPosts.length > 0 && (
        <Block>
          <BlockTitle icon={Flame} iconColor="text-orange-400" title="Discussions populaires" to="/forum" />
          <div className="divide-y divide-zinc-800/40">
            {hotPosts.map((p, i) => (
              <Link key={p.id} to={`/forum/${p.id}`}
                className="flex items-start gap-3 px-4 py-3 hover:bg-white/4 transition-colors group"
              >
                <span className="font-mono text-[10px] text-muted-foreground/25 flex-shrink-0 mt-0.5 w-3">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-inter text-sm text-foreground/80 group-hover:text-primary transition-colors line-clamp-2 leading-snug">{p.title}</p>
                  <p className="font-mono text-[10px] text-muted-foreground/35 mt-1">
                    {p.replies_count || 0} rép.
                    {p.created_date && ` · ${formatDistanceToNow(new Date(p.created_date), { addSuffix: true, locale: fr })}`}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </Block>
      )}

      {/* Vérification */}
      <Block>
        <div className="px-4 py-3">
          <div className="flex items-center gap-2 mb-2.5">
            <Shield className="w-3.5 h-3.5 text-primary" />
            <p className="font-grotesk font-bold text-sm">Vérification</p>
          </div>
          <div className="space-y-2">
            {[
              { label: 'Vérifié',  color: 'text-blue-400',    desc: 'Identité confirmée' },
              { label: 'Certifié', color: 'text-emerald-400', desc: 'Compétences validées' },
              { label: 'Officiel', color: 'text-amber-400',   desc: 'Entité officielle' },
            ].map(b => (
              <div key={b.label} className="flex items-center gap-2">
                <CheckCircle2 className={`w-3 h-3 flex-shrink-0 ${b.color}`} />
                <span className={`font-inter text-xs font-medium ${b.color}`}>{b.label}</span>
                <span className="font-inter text-xs text-muted-foreground/40">· {b.desc}</span>
              </div>
            ))}
          </div>
        </div>
      </Block>

      {/* Footer */}
      <div className="px-1 pb-2">
        <div className="flex flex-wrap gap-x-2.5 gap-y-1.5 text-[10px] text-muted-foreground/30">
          {[['À propos', '/about'], ['Blog', '/blog'], ['Forum', '/forum'], ['Contact', '/contact'], ['Confidentialité', '/legal/privacy'], ['CGU', '/legal/terms']].map(([l, to]) => (
            <Link key={l} to={to} className="hover:text-muted-foreground/60 transition-colors">{l}</Link>
          ))}
        </div>
        <p className="text-[10px] font-mono text-muted-foreground/20 mt-2">© 2026 Brenne Aerial</p>
      </div>
    </aside>
  );
}