import { useState, useRef, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, X, TrendingUp, Flame, ArrowRight } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import VerificationIcons from '@/components/ui/VerificationIcon';
import { extractHashtags } from '@/lib/hashtags';
import SportsWidget from '@/components/home/SportsWidget';

const TRENDING = [
  { tag: 'communauté',    count: 284, rise: '+18%' },
  { tag: 'créateurs',     count: 193, rise: '+31%' },
  { tag: 'organisations', count: 147, rise: '+12%' },
  { tag: 'publications',  count: 112, rise: '+9%'  },
  { tag: 'partages',      count: 89,  rise: '+22%' },
];

function SearchBar({ allUsers, allTags }) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handler = (e) => { if (!ref.current?.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const isHashSearch = query.startsWith('#');
  const hashQuery = isHashSearch ? query.slice(1).toLowerCase() : '';

  const filteredUsers = !isHashSearch && query.trim().length > 0
    ? allUsers.filter(u => {
        const q = query.toLowerCase();
        return (u.username || '').toLowerCase().includes(q)
          || (u.display_name || u.full_name || '').toLowerCase().includes(q);
      }).slice(0, 6)
    : [];

  const filteredTags = isHashSearch && hashQuery.length > 0
    ? allTags.filter(({ tag }) => tag.toLowerCase().includes(hashQuery)).slice(0, 6)
    : isHashSearch && hashQuery.length === 0
    ? allTags.slice(0, 6)
    : [];

  const handleTagClick = (tag) => {
    setQuery('');
    setOpen(false);
    navigate(`/?tag=${tag}`);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && isHashSearch && hashQuery) {
      handleTagClick(hashQuery);
    }
  };

  return (
    <div ref={ref} className="relative mb-4">
      <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl border border-white/8 bg-white/3 focus-within:border-primary/40 focus-within:bg-white/5 transition-all">
        <Search className="w-4 h-4 text-muted-foreground/50 flex-shrink-0" />
        <input
          value={query}
          onChange={e => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Chercher ou #hashtag"
          className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/40 outline-none min-w-0"
        />
        {query && (
          <button onClick={() => { setQuery(''); setOpen(false); }}
            className="w-4 h-4 rounded-full bg-muted-foreground/30 flex items-center justify-center flex-shrink-0 hover:bg-muted-foreground/50 transition-colors">
            <X className="w-2.5 h-2.5 text-foreground" />
          </button>
        )}
      </div>

      {/* Dropdown results */}
      {open && (filteredUsers.length > 0 || filteredTags.length > 0) && (
        <div className="absolute top-full left-0 right-0 mt-1 rounded-2xl overflow-hidden z-50 shadow-2xl"
          style={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}>

          {/* Hashtag results */}
          {filteredTags.map(({ tag, count }) => (
            <button key={tag} onClick={() => handleTagClick(tag)}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors text-left">
              <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                <span className="font-grotesk font-bold text-primary text-sm">#</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-grotesk font-semibold text-sm text-foreground">#{tag}</p>
                <p className="font-mono text-xs text-muted-foreground/50">{count} publication{count > 1 ? 's' : ''}</p>
              </div>
            </button>
          ))}

          {/* User results */}
          {filteredUsers.map(u => {
            const name = u.display_name || u.full_name || u.username;
            const initial = (name?.[0] || 'U').toUpperCase();
            const profileLink = u.username ? `/@${u.username}` : null;
            return (
              <Link key={u.id} to={profileLink || '#'}
                onClick={() => { setQuery(''); setOpen(false); }}
                className="flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors"
              >
                <div className="w-10 h-10 rounded-full overflow-hidden border border-white/10 flex-shrink-0"
                  style={{ background: 'hsl(var(--primary)/0.12)' }}>
                  {u.avatar_url
                    ? <img src={u.avatar_url} alt={name} className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center">
                        <span className="font-grotesk font-bold text-primary text-sm">{initial}</span>
                      </div>
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1">
                    <span className="font-grotesk font-semibold text-sm text-foreground truncate">{name}</span>
                    {u.verifications?.length > 0 && <VerificationIcons verifications={u.verifications} size="sm" user={u} />}
                  </div>
                  {u.username && <p className="font-mono text-xs text-muted-foreground/50">@{u.username}</p>}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

function SuggestedUsers({ users }) {
  if (!users.length) return null;
  return (
    <div className="mb-4 rounded-2xl bg-white/3 border border-white/8 overflow-hidden">
      <div className="px-4 pt-3.5 pb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-primary/15 border border-primary/20 flex items-center justify-center text-sm">✨</div>
          <span className="font-grotesk font-semibold text-[13px] text-foreground">Suggestions</span>
        </div>
        <Link to="/discover" className="text-[11px] text-primary/70 hover:text-primary transition-colors font-medium">Voir plus</Link>
      </div>
      <div className="px-3 pb-2 space-y-0.5">
        {users.map(u => {
          const name = u.display_name || u.full_name || u.username;
          const initial = (name?.[0] || 'U').toUpperCase();
          const profileLink = u.username ? `/@${u.username}` : null;
          return (
            <div key={u.id} className="flex items-center gap-2.5 px-2 py-2 rounded-xl hover:bg-white/5 transition-colors">
              <div className="w-9 h-9 rounded-full overflow-hidden border border-white/10 flex-shrink-0 bg-primary/10">
                {u.avatar_url
                  ? <img src={u.avatar_url} alt={name} className="w-full h-full object-cover" />
                  : <div className="w-full h-full flex items-center justify-center">
                      <span className="font-grotesk font-bold text-primary text-xs">{initial}</span>
                    </div>
                }
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1">
                  {profileLink
                    ? <Link to={profileLink} className="font-grotesk font-semibold text-[12px] text-foreground hover:text-primary transition-colors truncate">{name}</Link>
                    : <span className="font-grotesk font-semibold text-[12px] text-foreground truncate">{name}</span>
                  }
                  {u.verifications?.length > 0 && <VerificationIcons verifications={u.verifications} size="sm" user={u} />}
                </div>
                {u.username && <p className="font-mono text-[10px] text-muted-foreground/40">@{u.username}</p>}
              </div>
              {profileLink && (
                <Link to={profileLink} className="flex-shrink-0">
                  <button className="px-3 py-1 rounded-full bg-primary/10 border border-primary/25 text-primary text-[11px] font-grotesk font-bold hover:bg-primary/20 transition-colors">
                    Suivre
                  </button>
                </Link>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function TrendingSection({ trendingTags }) {
  if (!trendingTags.length) return null;
  return (
    <div className="mb-4 rounded-2xl bg-white/3 border border-white/8 overflow-hidden">
      <div className="px-4 pt-3.5 pb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-orange-500/15 border border-orange-500/20 flex items-center justify-center text-sm">🔥</div>
          <span className="font-grotesk font-semibold text-[13px] text-foreground">Tendances</span>
        </div>
        <Link to="/forum" className="text-[11px] text-primary/70 hover:text-primary transition-colors font-medium">Forum</Link>
      </div>
      <div className="px-3 pb-2 space-y-0.5">
        {trendingTags.slice(0, 5).map(({ tag, count }, i) => (
          <Link key={tag} to={`/?tag=${tag}`}
            className="flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-white/5 transition-colors group">
            <span className="font-mono text-[10px] text-muted-foreground/25 w-4 flex-shrink-0 text-center">{i + 1}</span>
            <div className="flex-1 min-w-0">
              <p className="font-grotesk font-bold text-[12px] text-foreground group-hover:text-primary transition-colors">#{tag}</p>
              <p className="font-mono text-[10px] text-muted-foreground/35">{count} pub{count > 1 ? 's' : ''}</p>
            </div>
            <div className="w-1.5 h-1.5 rounded-full bg-primary/30 flex-shrink-0" />
          </Link>
        ))}
      </div>
    </div>
  );
}

export default function HomeRightSidebar() {
  const { data: allUsers = [] } = useQuery({
    queryKey: ['sidebar-all-users'],
    queryFn: async () => {
      const res = await base44.functions.invoke('getPublicUsers', {});
      return (res?.data || []).filter(u => u.username);
    },
    staleTime: 5 * 60 * 1000,
  });

  const suggestedUsers = useMemo(() => {
    if (!allUsers.length) return [];
    const shuffled = [...allUsers].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 3);
  }, [allUsers.length]);

  const { data: recentDiscussions = [] } = useQuery({
    queryKey: ['sidebar-recent-discussions-tags'],
    queryFn: () => base44.entities.Discussion.list('-created_date', 100),
    staleTime: 2 * 60 * 1000,
  });

  const { data: recentSocialPosts = [] } = useQuery({
    queryKey: ['sidebar-recent-social-posts-tags'],
    queryFn: () => base44.entities.Post.list('-created_date', 100),
    staleTime: 2 * 60 * 1000,
  });

  // Compute trending hashtags from discussions + social posts
  const trendingTags = useMemo(() => {
    const freq = {};
    recentDiscussions.forEach(p => {
      const tags = p.tags?.length ? p.tags : extractHashtags((p.content || '') + ' ' + (p.title || ''));
      tags.forEach(tag => { freq[tag] = (freq[tag] || 0) + 1; });
    });
    recentSocialPosts.forEach(p => {
      const tags = p.hashtags?.length ? p.hashtags : extractHashtags(p.content || '');
      tags.forEach(tag => { freq[tag] = (freq[tag] || 0) + 1; });
    });
    return Object.entries(freq)
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count);
  }, [recentDiscussions, recentSocialPosts]);

  return (
    <div className="flex flex-col w-full">
      <SearchBar allUsers={allUsers} allTags={trendingTags} />
      <SportsWidget />
      <SuggestedUsers users={suggestedUsers} />
      <TrendingSection trendingTags={trendingTags} />

      {/* Footer */}
      <div className="px-2 pb-6 mt-2">
        <div className="flex flex-wrap gap-x-2 gap-y-1 text-[10px] text-muted-foreground/25">
          {[['À propos', '/about'], ['Blog', '/blog'], ['Forum', '/forum'], ['Confidentialité', '/legal/privacy'], ['CGU', '/legal/terms']].map(([l, to]) => (
            <Link key={l} to={to} className="hover:text-muted-foreground/50 transition-colors">{l}</Link>
          ))}
        </div>
        <p className="text-[10px] font-mono text-muted-foreground/15 mt-1.5">© 2026 EZA by EZA Group</p>
      </div>
    </div>
  );
}