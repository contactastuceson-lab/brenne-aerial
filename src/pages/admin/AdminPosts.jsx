import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import {
  FileText, Search, Trash2, Pin, Star, Megaphone, Eye, EyeOff,
  Loader2, X, Filter, Users, Heart, MessageCircle, Repeat2,
  ExternalLink, AlertTriangle, Check, Image as ImageIcon,
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const VISIBILITY_META = {
  public: { label: 'Public', cls: 'text-green-400 bg-green-400/10 border-green-400/20' },
  followers: { label: 'Abonnés', cls: 'text-blue-400 bg-blue-400/10 border-blue-400/20' },
  certified: { label: 'Certifiés', cls: 'text-purple-400 bg-purple-400/10 border-purple-400/20' },
  eza_circle: { label: 'Cercle EZA', cls: 'text-amber-400 bg-amber-400/10 border-amber-400/20' },
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

export default function AdminPosts() {
  const qc = useQueryClient();
  const [selected, setSelected] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterVis, setFilterVis] = useState('all');
  const [filterFlag, setFilterFlag] = useState('all'); // pinned | highlight | sponsored | draft | all
  const [showMediaOnly, setShowMediaOnly] = useState(false);

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ['admin-posts'],
    queryFn: () => base44.entities.Post.list('-created_date', 200),
  });

  const logAction = async (action, entityId, changes) => {
    try {
      await base44.functions.invoke('logAuditAction', { action, entity_type: 'Post', entity_id: entityId, changes });
    } catch {}
  };

  const updatePost = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Post.update(id, data),
    onSuccess: (_, { id, data }) => {
      qc.invalidateQueries({ queryKey: ['admin-posts'] });
      qc.invalidateQueries({ queryKey: ['home-feed-posts'] });
      logAction('update', id, data);
      setSelected(prev => prev ? { ...prev, ...data } : prev);
      toast.success('✓ Post mis à jour');
    },
    onError: () => toast.error('Erreur lors de la mise à jour'),
  });

  const deletePost = useMutation({
    mutationFn: (id) => base44.entities.Post.delete(id),
    onSuccess: (_, id) => {
      qc.invalidateQueries({ queryKey: ['admin-posts'] });
      qc.invalidateQueries({ queryKey: ['home-feed-posts'] });
      logAction('delete', id, {});
      setSelected(null);
      toast.success('✓ Post supprimé');
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
    return result;
  }, [posts, filterVis, filterFlag, showMediaOnly, searchQuery]);

  const stats = {
    total: posts.length,
    pinned: posts.filter(p => p.is_pinned).length,
    highlighted: posts.filter(p => p.is_highlight).length,
    sponsored: posts.filter(p => p.is_sponsored).length,
    drafts: posts.filter(p => p.is_draft).length,
    withMedia: posts.filter(p => p.media_urls?.length > 0).length,
  };

  const toggleFlag = (post, field) => {
    updatePost.mutate({ id: post.id, data: { [field]: !post[field] } });
  };

  const changeVisibility = (post, vis) => {
    updatePost.mutate({ id: post.id, data: { visibility: vis } });
  };

  return (
    <div className="flex h-[calc(100vh-3.5rem)] md:h-[calc(100vh-4rem)] overflow-hidden">
      {/* Liste */}
      <div className={`${selected ? 'hidden md:flex' : 'flex'} flex-col w-full md:w-1/2 min-w-0 border-r border-border bg-background`}>
        {/* Header */}
        <div className="flex items-center justify-between gap-2 px-4 py-3 border-b border-border flex-shrink-0">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            <h1 className="text-base font-grotesk font-bold">Gestion du Feed</h1>
          </div>
          <span className="text-xs text-muted-foreground">{stats.total} posts</span>
        </div>

        {/* Stats bar */}
        <div className="flex items-center gap-1.5 px-3 py-2 border-b border-border flex-shrink-0 flex-wrap">
          {[
            { key: 'all', label: 'Tous', count: stats.total, cls: '' },
            { key: 'pinned', label: 'Épinglés', count: stats.pinned, cls: 'text-amber-400' },
            { key: 'highlight', label: 'À la une', count: stats.highlighted, cls: 'text-cyan-400' },
            { key: 'sponsored', label: 'Sponsorisés', count: stats.sponsored, cls: 'text-orange-400' },
            { key: 'draft', label: 'Brouillons', count: stats.drafts, cls: 'text-muted-foreground' },
          ].map(s => (
            <button key={s.key} onClick={() => setFilterFlag(s.key)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors ${filterFlag === s.key ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground hover:text-foreground'}`}>
              {s.label} <span className={filterFlag === s.key ? '' : s.cls}>{s.count}</span>
            </button>
          ))}
        </div>

        {/* Filters bar */}
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
          <button onClick={() => setShowMediaOnly(v => !v)}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors flex items-center gap-1 ${showMediaOnly ? 'bg-primary/15 border-primary/30 text-primary' : 'bg-secondary/50 border-border text-muted-foreground hover:text-foreground'}`}>
            <ImageIcon className="w-3.5 h-3.5" /> Média
          </button>
        </div>

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
                const preview = p.content || '';
                return (
                  <button key={p.id} onClick={() => setSelected(p)}
                    className={`w-full text-left px-3 py-3 flex items-start gap-2.5 transition-colors ${isActive ? 'bg-primary/5 border-l-2 border-l-primary' : 'hover:bg-secondary/40 border-l-2 border-l-transparent'}`}>
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
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Detail */}
      {!selected ? (
        <div className="hidden md:flex flex-col w-1/2 items-center justify-center bg-background">
          <div className="w-14 h-14 rounded-2xl bg-secondary/50 border border-border flex items-center justify-center mb-3">
            <FileText className="w-6 h-6 text-muted-foreground/50" />
          </div>
          <p className="text-sm text-muted-foreground font-medium">Sélectionnez un post</p>
          <p className="text-xs text-muted-foreground/60 mt-0.5">Gérez, modérez et éditez les publications du feed.</p>
        </div>
      ) : (
        <div className="fixed md:relative inset-0 z-50 md:z-auto flex flex-col w-full md:w-1/2 min-w-0 bg-background border-l border-border">
          <div className="md:hidden absolute inset-0 bg-black/40" onClick={() => setSelected(null)} />
          <div className="relative flex flex-col h-full min-w-0 bg-background">
            {/* Header */}
            <div className="border-b border-border bg-card flex-shrink-0">
              <div className="h-0.5 w-full" style={{ background: 'linear-gradient(90deg, #38aadc, #0ea5e9)' }} />
              <div className="p-3 md:p-4">
                <div className="flex items-center gap-2.5">
                  <button onClick={() => setSelected(null)}
                    className="md:hidden w-8 h-8 rounded-lg flex items-center justify-center bg-secondary border border-border flex-shrink-0">
                    <X className="w-4 h-4" />
                  </button>
                  <div className="w-9 h-9 rounded-lg bg-secondary border border-border flex items-center justify-center overflow-hidden flex-shrink-0">
                    {selected.author_avatar ? (
                      <img src={selected.author_avatar} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-xs font-bold text-muted-foreground">
                        {(selected.author_name || 'U').charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h1 className="text-sm font-grotesk font-bold truncate">{selected.author_name || 'Anonyme'}</h1>
                    <div className="flex items-center gap-1.5 mt-0.5 flex-wrap text-[10px] text-muted-foreground">
                      {selected.author_username && <span>@{selected.author_username}</span>}
                      <span>· {timeAgo(selected.created_date)}</span>
                      <span className="font-mono px-1.5 py-0.5 rounded border border-border bg-secondary">#{String(selected.id).slice(-6)}</span>
                    </div>
                  </div>
                  <button onClick={() => setSelected(null)}
                    className="hidden md:flex w-8 h-8 rounded-lg items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary flex-shrink-0">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden min-w-0 p-3 md:p-4 space-y-3">
              {/* Content */}
              {selected.content ? (
                <div className="rounded-xl bg-secondary/30 border border-border p-3 min-w-0">
                  <p className="text-[10px] font-mono text-muted-foreground/60 uppercase tracking-wider mb-1.5">Contenu</p>
                  <p className="text-sm text-foreground/90 whitespace-pre-wrap break-words">{selected.content}</p>
                </div>
              ) : (
                <div className="rounded-xl bg-secondary/30 border border-border p-3 text-center">
                  <p className="text-xs text-muted-foreground italic">Aucun contenu textuel</p>
                </div>
              )}

              {/* Media */}
              {selected.media_urls?.length > 0 && (
                <div className="rounded-xl bg-secondary/30 border border-border p-3 min-w-0">
                  <p className="text-[10px] font-mono text-muted-foreground/60 uppercase tracking-wider mb-2">Médias ({selected.media_urls.length})</p>
                  <div className="grid grid-cols-2 gap-2">
                    {selected.media_urls.map((url, i) => (
                      <a key={i} href={url} target="_blank" rel="noreferrer" className="block rounded-lg overflow-hidden border border-border hover:border-primary/40 transition-colors">
                        <img src={url} alt="" className="w-full h-24 object-cover" />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Hashtags & mentions */}
              {(selected.hashtags?.length > 0 || selected.mentions?.length > 0) && (
                <div className="rounded-xl bg-secondary/30 border border-border p-3 min-w-0 space-y-1.5">
                  {selected.hashtags?.length > 0 && (
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] font-mono text-muted-foreground/60 uppercase">Hashtags</span>
                      {selected.hashtags.map((h, i) => (
                        <span key={i} className="text-[10px] text-primary bg-primary/10 px-1.5 py-0.5 rounded">#{h}</span>
                      ))}
                    </div>
                  )}
                  {selected.mentions?.length > 0 && (
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] font-mono text-muted-foreground/60 uppercase">Mentions</span>
                      {selected.mentions.map((m, i) => (
                        <span key={i} className="text-[10px] text-accent bg-accent/10 px-1.5 py-0.5 rounded">@{m}</span>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Stats */}
              <div className="grid grid-cols-4 gap-2">
                {[
                  { icon: Heart, label: 'Likes', value: selected.likes_count || 0, color: 'text-rose-400' },
                  { icon: MessageCircle, label: 'Réponses', value: selected.replies_count || 0, color: 'text-blue-400' },
                  { icon: Repeat2, label: 'Reposts', value: (selected.reposts_count || 0) + (selected.quotes_count || 0), color: 'text-green-400' },
                  { icon: Eye, label: 'Vues', value: selected.views_count || 0, color: 'text-muted-foreground' },
                ].map((s, i) => {
                  const SIcon = s.icon;
                  return (
                    <div key={i} className="rounded-xl bg-secondary/30 border border-border p-2.5 text-center">
                      <SIcon className={`w-3.5 h-3.5 mx-auto mb-1 ${s.color}`} />
                      <p className="text-sm font-bold">{s.value}</p>
                      <p className="text-[9px] text-muted-foreground">{s.label}</p>
                    </div>
                  );
                })}
              </div>

              {/* Flags */}
              <div className="rounded-xl bg-secondary/30 border border-border p-3 min-w-0 space-y-2">
                <p className="text-[10px] font-mono text-muted-foreground/60 uppercase tracking-wider">État du post</p>
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={() => toggleFlag(selected, 'is_pinned')}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-medium transition-colors ${selected.is_pinned ? 'bg-amber-400/15 border-amber-400/30 text-amber-400' : 'bg-secondary border-border text-muted-foreground hover:text-foreground'}`}>
                    <Pin className="w-3.5 h-3.5" /> {selected.is_pinned ? 'Épinglé' : 'Épingler'}
                  </button>
                  <button onClick={() => toggleFlag(selected, 'is_highlight')}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-medium transition-colors ${selected.is_highlight ? 'bg-cyan-400/15 border-cyan-400/30 text-cyan-400' : 'bg-secondary border-border text-muted-foreground hover:text-foreground'}`}>
                    <Star className="w-3.5 h-3.5" /> {selected.is_highlight ? 'À la une' : 'Mettre à la une'}
                  </button>
                  <button onClick={() => toggleFlag(selected, 'is_sponsored')}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-medium transition-colors ${selected.is_sponsored ? 'bg-orange-400/15 border-orange-400/30 text-orange-400' : 'bg-secondary border-border text-muted-foreground hover:text-foreground'}`}>
                    <Megaphone className="w-3.5 h-3.5" /> {selected.is_sponsored ? 'Sponsorisé' : 'Sponsoriser'}
                  </button>
                  <button onClick={() => toggleFlag(selected, 'is_draft')}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-medium transition-colors ${selected.is_draft ? 'bg-muted/30 border-border text-muted-foreground' : 'bg-secondary border-border text-muted-foreground hover:text-foreground'}`}>
                    {selected.is_draft ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                    {selected.is_draft ? 'Brouillon' : 'Masquer (draft)'}
                  </button>
                </div>
              </div>

              {/* Visibility */}
              <div className="rounded-xl bg-secondary/30 border border-border p-3 min-w-0">
                <p className="text-[10px] font-mono text-muted-foreground/60 uppercase tracking-wider mb-2">Visibilité</p>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(VISIBILITY_META).map(([k, m]) => (
                    <button key={k} onClick={() => changeVisibility(selected, k)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-medium transition-colors ${selected.visibility === k ? `border ${m.cls}` : 'bg-secondary border-border text-muted-foreground hover:text-foreground'}`}>
                      {selected.visibility === k ? <Check className="w-3 h-3" /> : null}
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Link */}
              <a href={`/post/${selected.id}`} target="_blank" rel="noreferrer"
                className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-primary/10 border border-primary/20 text-primary hover:bg-primary/20 transition-colors text-xs font-semibold min-w-0 overflow-hidden">
                <ExternalLink className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="flex-shrink-0">Voir le post en ligne</span>
              </a>
            </div>

            {/* Actions bar */}
            <div className="border-t border-border bg-card p-2.5 flex items-center gap-1.5 flex-shrink-0">
              <button
                onClick={() => {
                  if (confirm('Supprimer ce post définitivement ?')) deletePost.mutate(selected.id);
                }}
                disabled={deletePost.isPending}
                className="h-8 px-3 rounded-lg text-xs font-medium text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-40 flex items-center gap-1.5 ml-auto">
                {deletePost.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                <span className="hidden sm:inline">Supprimer le post</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}