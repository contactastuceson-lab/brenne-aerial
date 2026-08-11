import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import {
  FileText, Search, Trash2, Pin, Star, Megaphone, Eye, EyeOff,
  Loader2, X, Users, Heart, MessageCircle, Repeat2,
  ExternalLink, Image as ImageIcon, ArrowUpDown, CheckSquare, Square,
  XCircle, Copy, Link2, TrendingUp, Clock, Layers,
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import PostDetailPanel from '@/components/admin/posts/PostDetailPanel';

const VISIBILITY_META = {
  public: { label: 'Public', cls: 'text-green-400 bg-green-400/10 border-green-400/20', dot: 'bg-green-400' },
  followers: { label: 'Abonnés', cls: 'text-blue-400 bg-blue-400/10 border-blue-400/20', dot: 'bg-blue-400' },
  certified: { label: 'Certifiés', cls: 'text-purple-400 bg-purple-400/10 border-purple-400/20', dot: 'bg-purple-400' },
  eza_circle: { label: 'Cercle EZA', cls: 'text-amber-400 bg-amber-400/10 border-amber-400/20', dot: 'bg-amber-400' },
};

function timeAgo(iso) {
  if (!iso) return '';
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "à l'instant";
  if (mins < 60) return `il y a ${mins} min`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `il y a ${hrs}h`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `il y a ${days}j`;
  return format(new Date(iso), 'd MMM yyyy', { locale: fr });
}

const SORT_OPTIONS = [
  { key: 'recent', label: 'Plus récents', icon: Clock },
  { key: 'old', label: 'Plus anciens', icon: Clock },
  { key: 'likes', label: 'Plus aimés', icon: Heart },
  { key: 'views', label: 'Plus vus', icon: Eye },
  { key: 'replies', label: 'Plus discutés', icon: MessageCircle },
];

export default function AdminPosts() {
  const qc = useQueryClient();
  const [selected, setSelected] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterVis, setFilterVis] = useState('all');
  const [filterFlag, setFilterFlag] = useState('all');
  const [showMediaOnly, setShowMediaOnly] = useState(false);
  const [sortBy, setSortBy] = useState('recent');
  const [bulkMode, setBulkMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState(new Set());

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ['admin-posts'],
    queryFn: () => base44.entities.Post.list('-created_date', 200),
  });

  const bulkDelete = useMutation({
    mutationFn: async (ids) => {
      for (const id of ids) {
        await base44.entities.Post.delete(id);
      }
    },
    onSuccess: (_, ids) => {
      qc.invalidateQueries({ queryKey: ['admin-posts'] });
      qc.invalidateQueries({ queryKey: ['home-feed-posts'] });
      toast.success(`✓ ${ids.length} post(s) supprimé(s)`);
      setSelectedIds(new Set());
      setBulkMode(false);
    },
  });

  const filtered = useMemo(() => {
    let result = posts;
    if (filterVis !== 'all') result = result.filter(p => p.visibility === filterVis);
    if (filterFlag === 'pinned') result = result.filter(p => p.is_pinned);
    else if (filterFlag === 'highlight') result = result.filter(p => p.is_highlight);
    else if (filterFlag === 'sponsored') result = result.filter(p => p.is_sponsored);
    else if (filterFlag === 'draft') result = result.filter(p => p.is_draft);
    if (showMediaOnly) result = result.filter(p => p.media_urls?.length > 0);
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p =>
        p.content?.toLowerCase().includes(q) ||
        p.author_name?.toLowerCase().includes(q) ||
        p.author_username?.toLowerCase().includes(q) ||
        p.hashtags?.some(h => h.toLowerCase().includes(q))
      );
    }
    // Sort
    const sorted = [...result];
    if (sortBy === 'recent') sorted.sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
    else if (sortBy === 'old') sorted.sort((a, b) => new Date(a.created_date) - new Date(b.created_date));
    else if (sortBy === 'likes') sorted.sort((a, b) => (b.likes_count || 0) - (a.likes_count || 0));
    else if (sortBy === 'views') sorted.sort((a, b) => (b.views_count || 0) - (a.views_count || 0));
    else if (sortBy === 'replies') sorted.sort((a, b) => (b.replies_count || 0) - (a.replies_count || 0));
    return sorted;
  }, [posts, filterVis, filterFlag, showMediaOnly, searchQuery, sortBy]);

  const stats = {
    total: posts.length,
    pinned: posts.filter(p => p.is_pinned).length,
    highlighted: posts.filter(p => p.is_highlight).length,
    sponsored: posts.filter(p => p.is_sponsored).length,
    drafts: posts.filter(p => p.is_draft).length,
    withMedia: posts.filter(p => p.media_urls?.length > 0).length,
    totalLikes: posts.reduce((s, p) => s + (p.likes_count || 0), 0),
    totalViews: posts.reduce((s, p) => s + (p.views_count || 0), 0),
  };

  const toggleSelect = (id) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const selectAll = () => setSelectedIds(new Set(filtered.map(p => p.id)));
  const deselectAll = () => setSelectedIds(new Set());

  const handleBulkDelete = () => {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return;
    if (confirm(`Supprimer ${ids.length} post(s) définitivement ?`)) {
      bulkDelete.mutate(ids);
    }
  };

  const copyAllLinks = () => {
    const links = filtered.map(p => `${window.location.origin}/post/${p.id}`).join('\n');
    navigator.clipboard.writeText(links).then(() => toast.success(`${filtered.length} lien(s) copié(s)`));
  };

  return (
    <div className="flex h-[calc(100vh-3.5rem)] md:h-[calc(100vh-4rem)] overflow-hidden">
      {/* Liste */}
      <div className={`${selected ? 'hidden md:flex' : 'flex'} flex-col w-full md:w-1/2 min-w-0 border-r border-border bg-background`}>
        {/* Header */}
        <div className="px-4 py-3.5 border-b border-border flex-shrink-0" style={{ background: 'linear-gradient(135deg, hsl(var(--card)), hsl(var(--background)))' }}>
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-primary/15 border border-primary/25 flex items-center justify-center">
                <FileText className="w-4.5 h-4.5 text-primary" />
              </div>
              <div>
                <h1 className="text-base font-grotesk font-bold leading-tight">Gestion du Feed</h1>
                <p className="text-[10px] text-muted-foreground font-mono">{stats.total} posts · {stats.totalLikes} likes · {stats.totalViews} vues</p>
              </div>
            </div>
            <button onClick={() => { setBulkMode(!bulkMode); setSelectedIds(new Set()); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all flex items-center gap-1.5 ${bulkMode ? 'bg-primary/15 border-primary/30 text-primary' : 'bg-secondary/50 border-border text-muted-foreground hover:text-foreground'}`}>
              {bulkMode ? <CheckSquare className="w-3.5 h-3.5" /> : <Layers className="w-3.5 h-3.5" />}
              {bulkMode ? 'Sélection' : 'Multi'}
            </button>
          </div>

          {/* KPI pills */}
          <div className="grid grid-cols-4 gap-1.5">
            {[
              { label: 'Total', value: stats.total, icon: FileText, color: 'text-primary', bg: 'bg-primary/10' },
              { label: 'Épinglés', value: stats.pinned, icon: Pin, color: 'text-amber-400', bg: 'bg-amber-400/10' },
              { label: 'À la une', value: stats.highlighted, icon: Star, color: 'text-cyan-400', bg: 'bg-cyan-400/10' },
              { label: 'Brouillons', value: stats.drafts, icon: EyeOff, color: 'text-muted-foreground', bg: 'bg-muted/30' },
            ].map((k, i) => {
              const KIcon = k.icon;
              return (
                <div key={i} className="rounded-lg bg-secondary/30 border border-border p-2 flex items-center gap-1.5">
                  <div className={`w-6 h-6 rounded-md ${k.bg} flex items-center justify-center flex-shrink-0`}>
                    <KIcon className={`w-3 h-3 ${k.color}`} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold leading-none">{k.value}</p>
                    <p className="text-[8px] text-muted-foreground truncate">{k.label}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Filter tabs */}
        <div className="flex items-center gap-1.5 px-3 py-2 border-b border-border flex-shrink-0 flex-wrap">
          {[
            { key: 'all', label: 'Tous', count: stats.total, cls: '' },
            { key: 'pinned', label: 'Épinglés', count: stats.pinned, cls: 'text-amber-400' },
            { key: 'highlight', label: 'À la une', count: stats.highlighted, cls: 'text-cyan-400' },
            { key: 'sponsored', label: 'Sponsorisés', count: stats.sponsored, cls: 'text-orange-400' },
            { key: 'draft', label: 'Brouillons', count: stats.drafts, cls: 'text-muted-foreground' },
          ].map(s => (
            <button key={s.key} onClick={() => setFilterFlag(s.key)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${filterFlag === s.key ? 'bg-primary text-primary-foreground shadow-sm' : 'bg-secondary text-muted-foreground hover:text-foreground'}`}>
              {s.label} <span className={filterFlag === s.key ? 'opacity-70' : s.cls}>{s.count}</span>
            </button>
          ))}
        </div>

        {/* Search + filters */}
        <div className="flex items-center gap-2 px-3 py-2 border-b border-border flex-shrink-0 flex-wrap">
          <div className="relative flex-1 min-w-[120px]">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Auteur, contenu, hashtag…"
              className="w-full bg-secondary/50 border border-border rounded-lg pl-8 pr-3 py-1.5 text-xs outline-none focus:ring-1 focus:ring-primary/40 placeholder:text-muted-foreground/50"
            />
          </div>
          <select value={filterVis} onChange={e => setFilterVis(e.target.value)}
            className="bg-secondary/50 border border-border rounded-lg px-2.5 py-1.5 text-xs outline-none cursor-pointer focus:ring-1 focus:ring-primary/40">
            <option value="all">Toutes visibilités</option>
            {Object.entries(VISIBILITY_META).map(([k, m]) => <option key={k} value={k}>{m.label}</option>)}
          </select>
          <select value={sortBy} onChange={e => setSortBy(e.target.value)}
            className="bg-secondary/50 border border-border rounded-lg px-2.5 py-1.5 text-xs outline-none cursor-pointer focus:ring-1 focus:ring-primary/40">
            {SORT_OPTIONS.map(o => <option key={o.key} value={o.key}>{o.label}</option>)}
          </select>
          <button onClick={() => setShowMediaOnly(v => !v)}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors flex items-center gap-1 ${showMediaOnly ? 'bg-primary/15 border-primary/30 text-primary' : 'bg-secondary/50 border-border text-muted-foreground hover:text-foreground'}`}>
            <ImageIcon className="w-3.5 h-3.5" /> Média
          </button>
        </div>

        {/* Bulk action bar */}
        {bulkMode && (
          <div className="flex items-center gap-2 px-3 py-2 border-b border-primary/20 bg-primary/5 flex-shrink-0">
            <span className="text-xs font-medium text-primary">{selectedIds.size} sélectionné(s)</span>
            <button onClick={selectAll} className="text-[10px] text-muted-foreground hover:text-foreground px-2 py-1 rounded hover:bg-secondary transition-colors">Tout</button>
            <button onClick={deselectAll} className="text-[10px] text-muted-foreground hover:text-foreground px-2 py-1 rounded hover:bg-secondary transition-colors">Aucun</button>
            <div className="flex-1" />
            <button onClick={copyAllLinks}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-medium bg-secondary border border-border text-muted-foreground hover:text-foreground transition-colors">
              <Link2 className="w-3 h-3" /> Copier liens
            </button>
            <button onClick={handleBulkDelete} disabled={selectedIds.size === 0 || bulkDelete.isPending}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-medium bg-destructive/10 border border-destructive/20 text-destructive hover:bg-destructive/20 transition-colors disabled:opacity-40">
              {bulkDelete.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
              Supprimer
            </button>
          </div>
        )}

        {/* List */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="text-center py-12 text-muted-foreground">
              <Loader2 className="w-5 h-5 mx-auto mb-2 animate-spin" /> Chargement…
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 px-4">
              <FileText className="w-8 h-8 mx-auto mb-2 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">Aucun post trouvé</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {filtered.map(p => {
                const vMeta = VISIBILITY_META[p.visibility] || VISIBILITY_META.public;
                const isActive = selected?.id === p.id;
                const isSelected = selectedIds.has(p.id);
                const preview = p.content || '';
                return (
                  <div key={p.id}
                    className={`w-full text-left px-3 py-3 flex items-start gap-2.5 transition-colors cursor-pointer ${isActive ? 'bg-primary/5 border-l-2 border-l-primary' : 'hover:bg-secondary/40 border-l-2 border-l-transparent'}`}
                    onClick={() => bulkMode ? toggleSelect(p.id) : setSelected(p)}>
                    {bulkMode && (
                      <div className="mt-0.5 flex-shrink-0">
                        {isSelected ? <CheckSquare className="w-4 h-4 text-primary" /> : <Square className="w-4 h-4 text-muted-foreground/50" />}
                      </div>
                    )}
                    <div className="w-8 h-8 rounded-lg bg-secondary border border-border flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {p.author_avatar ? (
                        <img src={p.author_avatar} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-[10px] font-bold text-muted-foreground">
                          {(p.author_name || 'U').charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-xs font-semibold truncate">{p.author_name || 'Anonyme'}</span>
                        {p.author_username && <span className="text-[10px] text-muted-foreground truncate">@{p.author_username}</span>}
                        <span className={`text-[9px] font-medium px-1.5 py-0.5 rounded-full border ${vMeta.cls}`}>{vMeta.label}</span>
                        {p.is_pinned && <Pin className="w-3 h-3 text-amber-400" />}
                        {p.is_highlight && <Star className="w-3 h-3 text-cyan-400" />}
                        {p.is_sponsored && <Megaphone className="w-3 h-3 text-orange-400" />}
                        {p.is_draft && <span className="text-[9px] text-muted-foreground italic">brouillon</span>}
                      </div>
                      {preview ? (
                        <p className="text-xs text-foreground/80 mt-1 line-clamp-2">{preview}</p>
                      ) : (
                        <p className="text-xs text-muted-foreground/60 mt-1 italic">Aucun texte</p>
                      )}
                      <div className="flex items-center gap-2 mt-1 flex-wrap text-[10px] text-muted-foreground">
                        {p.media_urls?.length > 0 && <span className="flex items-center gap-0.5"><ImageIcon className="w-2.5 h-2.5" /> {p.media_urls.length}</span>}
                        <span className="flex items-center gap-0.5"><Heart className="w-2.5 h-2.5" /> {p.likes_count || 0}</span>
                        <span className="flex items-center gap-0.5"><MessageCircle className="w-2.5 h-2.5" /> {p.replies_count || 0}</span>
                        <span className="flex items-center gap-0.5"><Repeat2 className="w-2.5 h-2.5" /> {(p.reposts_count || 0) + (p.quotes_count || 0)}</span>
                        <span className="flex items-center gap-0.5"><Eye className="w-2.5 h-2.5" /> {p.views_count || 0}</span>
                        <span className="text-muted-foreground/40">·</span>
                        <span>{timeAgo(p.created_date)}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Detail */}
      {!selected ? (
        <div className="hidden md:flex flex-col w-1/2 items-center justify-center bg-background">
          <div className="w-16 h-16 rounded-2xl bg-secondary/50 border border-border flex items-center justify-center mb-3">
            <FileText className="w-7 h-7 text-muted-foreground/40" />
          </div>
          <p className="text-sm text-muted-foreground font-medium">Sélectionnez un post</p>
          <p className="text-xs text-muted-foreground/60 mt-0.5 text-center max-w-[200px]">
            Gérez, modérez et éditez les publications du feed. Mode multi-sélection disponible.
          </p>
        </div>
      ) : (
        <PostDetailPanel post={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}