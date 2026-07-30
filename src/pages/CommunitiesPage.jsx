import { useState, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import CommunityDialog from '@/components/community/CommunityDialog';
import { COMMUNITY_CATEGORIES, getCategoryMeta } from '@/lib/communityCategories';
import { Plus, Users, Lock, Globe, Loader2, Pin, Crown, Search, MessageCircle } from 'lucide-react';

export default function CommunitiesPage() {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [activeCat, setActiveCat] = useState('all');
  const [tab, setTab] = useState('discover');

  const { data: user } = useQuery({ queryKey: ['current-user'], queryFn: () => base44.auth.me(), staleTime: 60000, retry: false });

  const { data: communities = [], isLoading } = useQuery({
    queryKey: ['communities'],
    queryFn: async () => {
      const list = await base44.entities.Community.list('-created_date', 200);
      return (list || []).sort((a, b) => {
        const aPinned = a.is_pinned && a.pinned_until && new Date(a.pinned_until).getTime() > Date.now();
        const bPinned = b.is_pinned && b.pinned_until && new Date(b.pinned_until).getTime() > Date.now();
        if (aPinned && !bPinned) return -1;
        if (!aPinned && bPinned) return 1;
        return (b.members_count || 0) - (a.members_count || 0);
      });
    },
    enabled: !!user?.id,
  });

  const myCommunities = useMemo(() =>
    (communities || []).filter(c => c.owner_id === user?.id || (c.member_ids || []).includes(user?.id)),
    [communities, user]
  );

  const filtered = useMemo(() => {
    let pool = tab === 'mine' ? myCommunities : communities;
    if (search.trim()) {
      const q = search.toLowerCase();
      pool = pool.filter(c =>
        (c.name || '').toLowerCase().includes(q) ||
        (c.description || '').toLowerCase().includes(q) ||
        (c.tags || []).some(t => t.toLowerCase().includes(q))
      );
    }
    if (activeCat !== 'all') {
      pool = pool.filter(c => (c.category || 'other') === activeCat);
    }
    return pool;
  }, [communities, myCommunities, search, activeCat, tab]);

  if (!user) return <div className="flex justify-center py-24"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;

  return (
    <div className="w-full max-w-[680px] min-w-0 mx-auto pb-20">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border/60">
        <div className="px-4 py-3 flex items-center gap-2">
          <Users className="w-5 h-5 text-primary" />
          <h1 className="font-grotesk font-bold text-lg flex-1">Communautés</h1>
          <button onClick={() => setDialogOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90">
            <Plus className="w-3.5 h-3.5" /> Créer
          </button>
        </div>

        {/* Search */}
        <div className="px-4 pb-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher une communauté…"
              className="w-full bg-secondary/50 border border-border rounded-full pl-9 pr-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50" />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 px-4 pb-1">
          {[
            { key: 'discover', label: 'Découvrir', icon: Globe },
            { key: 'mine', label: `Mes communautés (${myCommunities.length})`, icon: Users },
          ].map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${tab === t.key ? 'bg-primary/10 text-primary border border-primary/30' : 'text-muted-foreground hover:bg-white/5'}`}>
              <t.icon className="w-3.5 h-3.5" /> {t.label}
            </button>
          ))}
        </div>

        {/* Categories */}
        {tab === 'discover' && (
          <div className="flex gap-1.5 px-4 pb-2 overflow-x-auto no-scrollbar">
            <button onClick={() => setActiveCat('all')}
              className={`flex-shrink-0 px-2.5 py-1 rounded-full text-xs font-semibold border transition-all ${activeCat === 'all' ? 'bg-foreground/10 text-foreground border-border' : 'text-muted-foreground border-border/50 hover:bg-white/5'}`}>
              Toutes
            </button>
            {COMMUNITY_CATEGORIES.map(c => (
              <button key={c.key} onClick={() => setActiveCat(c.key)}
                className={`flex-shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border transition-all ${activeCat === c.key ? `${c.bg} ${c.border} ${c.color}` : 'text-muted-foreground border-border/50 hover:bg-white/5'}`}>
                <span>{c.emoji}</span> {c.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* List */}
      {isLoading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-5 h-5 animate-spin text-primary" /></div>
      ) : filtered.length === 0 ? (
        <div className="py-16 text-center px-4">
          <Users className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
          <p className="font-grotesk font-bold text-base mb-1">{tab === 'mine' ? 'Aucune communauté' : 'Aucun résultat'}</p>
          <p className="font-inter text-sm text-muted-foreground">
            {tab === 'mine'
              ? 'Rejoignez ou créez un groupe thématique.'
              : search || activeCat !== 'all'
                ? 'Essayez d\'autres critères de recherche.'
                : 'Créez le premier groupe thématique — ouvert ou fermé.'}
          </p>
        </div>
      ) : (
        <div className="px-4 py-3 grid gap-3 sm:grid-cols-1">
          {filtered.map(c => {
            const cat = getCategoryMeta(c.category);
            const isMember = (c.member_ids || []).includes(user.id) || c.owner_id === user.id;
            const isPinned = c.is_pinned && c.pinned_until && new Date(c.pinned_until).getTime() > Date.now();
            const pct = Math.min(100, Math.round(((c.members_count || 0) / (c.capacity_limit || 100)) * 100));
            return (
              <button key={c.id} onClick={() => navigate(`/community/${c.id}`)}
                className="text-left rounded-2xl border border-border/60 overflow-hidden hover:border-primary/40 transition-all hover-lift group">
                <div className={`h-20 relative ${c.is_premium ? 'bg-gradient-to-r from-yellow-400/15 via-amber-400/10 to-orange-400/15' : 'bg-gradient-to-br from-primary/10 to-accent/10'}`}>
                  {c.cover_url && <img src={c.cover_url} className="w-full h-full object-cover" alt="" />}
                  {isPinned && (
                    <span className="absolute top-2 left-2 inline-flex items-center gap-0.5 text-[10px] font-bold text-amber-400 bg-background/80 backdrop-blur border border-amber-400/30 px-1.5 py-0.5 rounded-full">
                      <Pin className="w-2.5 h-2.5" /> Épinglée
                    </span>
                  )}
                  {c.is_premium && (
                    <span className="absolute top-2 right-2 inline-flex items-center gap-0.5 text-[10px] font-bold text-yellow-400 bg-background/80 backdrop-blur border border-yellow-400/30 px-1.5 py-0.5 rounded-full">
                      <Crown className="w-2.5 h-2.5" /> Premium
                    </span>
                  )}
                </div>
                <div className="p-3">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${cat.bg} ${cat.color} ${cat.border} border`}>{cat.emoji} {cat.label}</span>
                    {c.type === 'closed' ? <Lock className="w-3 h-3 text-amber-400" /> : <Globe className="w-3 h-3 text-emerald-400" />}
                    {isMember && <span className="text-[9px] font-semibold text-primary bg-primary/10 px-1.5 py-0.5 rounded-full">Membre</span>}
                  </div>
                  <h3 className="font-grotesk font-bold text-[15px] truncate group-hover:text-primary transition-colors">{c.name}</h3>
                  {c.description && <p className="font-inter text-xs text-muted-foreground line-clamp-2 mt-0.5">{c.description}</p>}
                  {c.tags?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {c.tags.slice(0, 3).map(t => <span key={t} className="text-[10px] font-mono text-muted-foreground/70">#{t}</span>)}
                    </div>
                  )}
                  <div className="flex items-center gap-2 mt-2 text-[10px] font-mono text-muted-foreground/60">
                    <span className="flex items-center gap-0.5"><Users className="w-3 h-3" /> {c.members_count || 0}/{c.capacity_limit || 100}</span>
                    <span className="flex items-center gap-0.5"><MessageCircle className="w-3 h-3" /> {c.posts_count || 0}</span>
                    <span className="ml-auto truncate">par @{c.owner_username || 'eza'}</span>
                  </div>
                  {/* capacity bar */}
                  {pct > 60 && (
                    <div className="mt-1.5 h-0.5 bg-secondary rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${pct >= 95 ? 'bg-red-400' : 'bg-amber-400'}`} style={{ width: `${pct}%` }} />
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}

      <CommunityDialog open={dialogOpen} onClose={() => setDialogOpen(false)} user={user}
        onSaved={() => qc.invalidateQueries({ queryKey: ['communities'] })} />
    </div>
  );
}