import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import PostCard from '@/components/post/PostCard';
import CommunityDialog from '@/components/community/CommunityDialog';
import { getCategoryMeta } from '@/lib/communityCategories';
import { ArrowLeft, Lock, Globe, Users, Loader2, Send, LogIn, LogOut, MessageCircle, Pin, Crown, ImagePlus, Settings, Shield, Hash } from 'lucide-react';
import { toast } from 'sonner';
import { applySeoMeta, getCommunitySeoData } from '@/lib/seo';
import AdSlot from '@/components/feed/AdSlot';

export default function CommunityDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [content, setContent] = useState('');
  const [mediaUrls, setMediaUrls] = useState([]);
  const [posting, setPosting] = useState(false);
  const [joining, setJoining] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [tab, setTab] = useState('posts');
  const fileRef = useRef();

  const { data: user } = useQuery({ queryKey: ['current-user'], queryFn: () => base44.auth.me(), staleTime: 60000, retry: false });

  const { data: detail, isLoading } = useQuery({
    queryKey: ['community-detail', id],
    queryFn: async () => {
      const res = await base44.functions.invoke('getCommunityPosts', { communityId: id });
      if (res.data?.error) throw new Error(res.data.error);
      return res.data;
    },
    enabled: !!id && !!user?.id,
    retry: false,
  });

  const community = detail?.community;
  const posts = detail?.posts || [];
  const members = detail?.members || [];
  const isMember = detail?.isMember || (community?.owner_id === user?.id);
  const isOwner = community?.owner_id === user?.id;
  const cat = getCategoryMeta(community?.category);

  useEffect(() => {
    if (community) applySeoMeta(getCommunitySeoData(community));
  }, [community]);

  const handleJoin = async (action) => {
    setJoining(true);
    try {
      const res = await base44.functions.invoke('joinCommunity', { communityId: id, action });
      if (res.data?.error) { toast.error(res.data.error); return; }
      toast.success(action === 'join' ? 'Bienvenue dans la communauté !' : 'Vous avez quitté');
      qc.invalidateQueries({ queryKey: ['community-detail', id] });
      qc.invalidateQueries({ queryKey: ['communities'] });
    } catch {
      toast.error('Erreur');
    } finally {
      setJoining(false);
    }
  };

  const handleMediaUpload = async (files) => {
    if (!files?.length) return;
    const remaining = 4 - mediaUrls.length;
    const toUpload = Array.from(files).slice(0, remaining);
    for (const f of toUpload) {
      try {
        const { file_url } = await base44.integrations.Core.UploadFile({ file: f });
        setMediaUrls(prev => [...prev, file_url]);
      } catch { toast.error('Erreur upload'); }
    }
  };

  const handlePost = async () => {
    if (!content.trim() && mediaUrls.length === 0) return;
    setPosting(true);
    try {
      const res = await base44.functions.invoke('createCommunityPost', {
        communityId: id,
        content: content.trim(),
        mediaUrls,
      });
      if (res.data?.error) { toast.error(res.data.error); return; }
      setContent('');
      setMediaUrls([]);
      toast.success('Publié dans la communauté');
      qc.invalidateQueries({ queryKey: ['community-detail', id] });
    } catch {
      toast.error('Erreur');
    } finally {
      setPosting(false);
    }
  };

  if (isLoading || !user) {
    return <div className="flex justify-center py-24"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;
  }

  if (!community) {
    return (
      <div className="py-24 text-center px-4">
        <p className="font-grotesk font-bold text-lg mb-2">Communauté introuvable</p>
        <p className="font-inter text-sm text-muted-foreground mb-4">Elle est fermée et vous n'en êtes pas membre, ou elle n'existe pas.</p>
        <button onClick={() => navigate('/communities')} className="text-primary text-sm hover:underline">← Retour aux communautés</button>
      </div>
    );
  }

  const isPinned = community.is_pinned && community.pinned_until && new Date(community.pinned_until).getTime() > Date.now();
  const pinnedDaysLeft = isPinned ? Math.max(0, Math.ceil((new Date(community.pinned_until).getTime() - Date.now()) / 86400000)) : 0;
  const capacityPct = Math.min(100, Math.round(((community.members_count || 0) / (community.capacity_limit || 100)) * 100));

  return (
    <div className="w-full max-w-[680px] min-w-0 mx-auto pb-20">
      {/* Top bar */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border/60">
        <div className="px-4 py-2 flex items-center gap-2">
          <button onClick={() => navigate('/communities')} className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-white/8"><ArrowLeft className="w-4 h-4" /></button>
          <span className="font-grotesk font-bold text-sm flex-1 truncate">{community.name}</span>
          {isOwner && (
            <button onClick={() => setEditOpen(true)} className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-white/8">
              <Settings className="w-4 h-4 text-muted-foreground" />
            </button>
          )}
        </div>
        {/* Tabs */}
        <div className="flex gap-1 px-4 pb-1">
          {[
            { key: 'posts', label: 'Posts', icon: MessageCircle, count: posts.length },
            { key: 'members', label: 'Membres', icon: Users, count: community.members_count || 0 },
            { key: 'about', label: 'À propos', icon: Shield },
          ].map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${tab === t.key ? 'bg-primary/10 text-primary border border-primary/30' : 'text-muted-foreground hover:bg-white/5'}`}>
              <t.icon className="w-3.5 h-3.5" /> {t.label}
              {t.count !== undefined && <span className="font-mono text-[10px] opacity-70">{t.count}</span>}
            </button>
          ))}
        </div>
      </div>

      {/* Cover */}
      <div className={`h-36 relative overflow-hidden ${community.is_premium ? 'bg-gradient-to-r from-yellow-400/20 via-amber-400/15 to-orange-400/20' : 'bg-gradient-to-br from-primary/20 to-accent/20'}`}>
        {community.cover_url && <img src={community.cover_url} className="w-full h-full object-cover" alt="" />}
        {community.is_premium && <div className="absolute inset-0 bg-gradient-to-t from-yellow-400/10 to-transparent pointer-events-none" />}
      </div>
      {community.is_premium && <div className="h-1 bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-400" />}

      {/* Info */}
      <div className={`px-4 py-3 ${community.is_premium ? 'border-x border-yellow-400/20' : ''}`}>
        <div className="flex items-center gap-1.5 mb-1 flex-wrap">
          {isPinned && (
            <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-amber-400 bg-amber-400/10 border border-amber-400/30 px-2 py-0.5 rounded-full">
              <Pin className="w-2.5 h-2.5" /> Épinglée {pinnedDaysLeft}j
            </span>
          )}
          {community.is_premium && (
            <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-yellow-400 bg-yellow-400/10 border border-yellow-400/30 px-2 py-0.5 rounded-full">
              <Crown className="w-2.5 h-2.5" /> Premium
            </span>
          )}
          <span className={`inline-flex items-center gap-0.5 text-[10px] font-semibold px-2 py-0.5 rounded-full ${cat.bg} ${cat.color} ${cat.border} border`}>{cat.emoji} {cat.label}</span>
        </div>
        <h1 className="font-grotesk font-bold text-xl mb-1 flex items-center gap-1.5">
          {community.name}
          {community.type === 'closed' ? <Lock className="w-4 h-4 text-amber-400" /> : <Globe className="w-4 h-4 text-emerald-400" />}
        </h1>
        {community.description && <p className="font-inter text-sm text-muted-foreground mb-3">{community.description}</p>}
        {community.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {community.tags.map(t => <span key={t} className="inline-flex items-center gap-0.5 text-[11px] font-mono text-muted-foreground bg-secondary/50 border border-border/50 px-2 py-0.5 rounded-full"><Hash className="w-2.5 h-2.5" />{t}</span>)}
          </div>
        )}

        {/* Stats */}
        <div className="flex items-center gap-3 mb-3">
          <span className="flex items-center gap-1 font-mono text-xs text-muted-foreground"><Users className="w-3 h-3" /> {community.members_count || 0}/{community.capacity_limit || 100}</span>
          <span className="flex items-center gap-1 font-mono text-xs text-muted-foreground"><MessageCircle className="w-3 h-3" /> {community.posts_count || 0}</span>
          <span className="font-mono text-xs text-muted-foreground/60 ml-auto">par @{community.owner_username || 'eza'}</span>
        </div>

        {/* capacity bar */}
        {capacityPct > 50 && (
          <div className="mb-3">
            <div className="h-1 bg-secondary rounded-full overflow-hidden">
              <div className={`h-full rounded-full ${capacityPct >= 95 ? 'bg-red-400' : capacityPct >= 80 ? 'bg-amber-400' : 'bg-primary'}`} style={{ width: `${capacityPct}%` }} />
            </div>
            <p className="font-mono text-[10px] text-muted-foreground/60 mt-1">{capacityPct}% de la capacité</p>
          </div>
        )}

        {/* Join / Leave */}
        {isMember ? (
          <button onClick={() => isOwner ? null : handleJoin('leave')} disabled={joining || isOwner}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-full border border-border text-sm font-semibold text-muted-foreground hover:bg-white/5 disabled:opacity-50 w-full justify-center">
            {isOwner ? <><Users className="w-3.5 h-3.5" /> Créateur</> : <><LogOut className="w-3.5 h-3.5" /> Quitter</>}
          </button>
        ) : (
          <button onClick={() => handleJoin('join')} disabled={joining}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 w-full justify-center">
            <LogIn className="w-3.5 h-3.5" /> Rejoindre
          </button>
        )}
      </div>

      {/* Post composer */}
      {isMember && tab === 'posts' && (
        <div className="px-4 py-3 border-y border-border/40">
          <div className="flex gap-2 items-start">
            <div className="w-9 h-9 rounded-lg overflow-hidden bg-primary/10 flex items-center justify-center flex-shrink-0">
              {user.avatar_url ? <img src={user.avatar_url} className="w-full h-full object-cover" alt="" /> : <span className="font-grotesk font-bold text-primary text-sm">{(user.display_name || user.full_name || 'U')[0]}</span>}
            </div>
            <div className="flex-1 min-w-0">
              <textarea value={content} onChange={e => setContent(e.target.value.slice(0, 500))} placeholder="Partager avec la communauté…"
                className="w-full bg-transparent text-[15px] text-foreground placeholder:text-muted-foreground/40 resize-none outline-none min-h-[40px]" />
              {mediaUrls.length > 0 && (
                <div className="grid grid-cols-2 gap-1.5 mt-2">
                  {mediaUrls.map((u, i) => (
                    <div key={i} className="relative rounded-lg overflow-hidden aspect-square bg-secondary/30">
                      <img src={u} className="w-full h-full object-cover" alt="" />
                      <button onClick={() => setMediaUrls(mediaUrls.filter((_, idx) => idx !== i))}
                        className="absolute top-1 right-1 w-5 h-5 rounded-full bg-background/80 backdrop-blur flex items-center justify-center text-destructive text-xs">×</button>
                    </div>
                  ))}
                </div>
              )}
              <div className="flex justify-between items-center mt-2">
                <div className="flex items-center gap-1">
                  <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={e => handleMediaUpload(e.target.files)} />
                  <button onClick={() => fileRef.current?.click()} disabled={mediaUrls.length >= 4}
                    className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/5 text-muted-foreground disabled:opacity-30">
                    <ImagePlus className="w-4 h-4" />
                  </button>
                  <span className="font-mono text-[10px] text-muted-foreground/50">{content.length}/500</span>
                </div>
                <button onClick={handlePost} disabled={(!content.trim() && mediaUrls.length === 0) || posting}
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 disabled:opacity-40">
                  {posting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />} Publier
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Pub intrusive */}
      <div className="px-4 py-3"><AdSlot placement="feed_banner" /></div>

      {/* Content by tab */}
      {tab === 'posts' && (
        <div>
          {posts.length === 0 ? (
            <div className="py-16 text-center px-4">
              <MessageCircle className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="font-grotesk font-bold text-base mb-1">Aucun post</p>
              <p className="font-inter text-sm text-muted-foreground">{isMember ? 'Lancez la discussion dans cette communauté.' : 'Rejoignez pour voir et publier.'}</p>
            </div>
          ) : (
            posts.map(p => <PostCard key={p.id} post={p} currentUser={user} />)
          )}
        </div>
      )}

      {tab === 'members' && (
        <div className="divide-y divide-border/40">
          {members.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground/50 text-sm font-inter">Aucun membre à afficher.</div>
          ) : (
            members.map(m => (
              <div key={m.id} className="flex items-center gap-3 px-4 py-2.5">
                <div className="w-10 h-10 rounded-full overflow-hidden bg-primary/10 flex items-center justify-center flex-shrink-0">
                  {m.avatar_url ? <img src={m.avatar_url} className="w-full h-full object-cover" alt="" /> : <span className="font-grotesk font-bold text-primary text-sm">{(m.display_name || 'U')[0]}</span>}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-grotesk font-bold text-sm truncate">{m.display_name || m.username}</span>
                    {m.is_owner && <span className="text-[9px] font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded-full">Créateur</span>}
                  </div>
                  <span className="font-mono text-[11px] text-muted-foreground/60">@{m.username}</span>
                </div>
                <button onClick={() => navigate(`/@${m.username}`)} className="text-xs font-semibold text-primary hover:underline">Voir</button>
              </div>
            ))
          )}
          {community.members_count > members.length && (
            <div className="px-4 py-3 text-center font-mono text-[11px] text-muted-foreground/50">
              + {community.members_count - members.length} autre(s) membre(s)
            </div>
          )}
        </div>
      )}

      {tab === 'about' && (
        <div className="px-4 py-4 space-y-5">
          <div>
            <h3 className="font-grotesk font-bold text-sm mb-2 flex items-center gap-1.5"><Shield className="w-4 h-4 text-primary" /> Description</h3>
            <p className="font-inter text-sm text-muted-foreground">{community.description || 'Aucune description.'}</p>
          </div>
          {community.rules?.length > 0 && (
            <div>
              <h3 className="font-grotesk font-bold text-sm mb-2">Règles de la communauté</h3>
              <ol className="space-y-2">
                {community.rules.map((r, i) => (
                  <li key={i} className="flex gap-2.5">
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/10 text-primary text-[11px] font-bold flex items-center justify-center">{i + 1}</span>
                    <span className="font-inter text-sm text-muted-foreground/90">{r}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}
          {community.tags?.length > 0 && (
            <div>
              <h3 className="font-grotesk font-bold text-sm mb-2">Tags</h3>
              <div className="flex flex-wrap gap-1.5">
                {community.tags.map(t => <span key={t} className="inline-flex items-center gap-0.5 text-[11px] font-mono text-muted-foreground bg-secondary/50 border border-border/50 px-2 py-0.5 rounded-full"><Hash className="w-2.5 h-2.5" />{t}</span>)}
              </div>
            </div>
          )}
          <div>
            <h3 className="font-grotesk font-bold text-sm mb-2">Informations</h3>
            <div className="space-y-1.5 font-mono text-xs text-muted-foreground">
              <div className="flex justify-between"><span>Type</span><span className="text-foreground">{community.type === 'closed' ? 'Fermée' : 'Publique'}</span></div>
              <div className="flex justify-between"><span>Capacité</span><span className="text-foreground">{community.members_count || 0}/{community.capacity_limit || 100}</span></div>
              <div className="flex justify-between"><span>Posts</span><span className="text-foreground">{community.posts_count || 0}</span></div>
              <div className="flex justify-between"><span>Créateur</span><span className="text-foreground">@{community.owner_username || 'eza'}</span></div>
            </div>
          </div>
        </div>
      )}

      <CommunityDialog open={editOpen} onClose={() => setEditOpen(false)} user={user} editing={community}
        onSaved={() => { qc.invalidateQueries({ queryKey: ['community-detail', id] }); qc.invalidateQueries({ queryKey: ['communities'] }); }} />
    </div>
  );
}