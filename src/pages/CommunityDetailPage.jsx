import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import PostCard from '@/components/post/PostCard';
import { ArrowLeft, Lock, Globe, Users, Loader2, Send, LogIn, LogOut, MessageCircle, Pin, Crown, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { applySeoMeta, getCommunitySeoData } from '@/lib/seo';

export default function CommunityDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [content, setContent] = useState('');
  const [posting, setPosting] = useState(false);
  const [joining, setJoining] = useState(false);

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
  const isMember = detail?.isMember || (community?.owner_id === user?.id);

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

  const handlePost = async () => {
    if (!content.trim()) return;
    setPosting(true);
    try {
      const res = await base44.functions.invoke('createCommunityPost', { communityId: id, content: content.trim() });
      if (res.data?.error) { toast.error(res.data.error); return; }
      setContent('');
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

  return (
    <div className="w-full max-w-[680px] min-w-0 mx-auto pb-20">
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border/60">
        <div className="px-4 py-2 flex items-center gap-2">
          <button onClick={() => navigate('/communities')} className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-white/8"><ArrowLeft className="w-4 h-4" /></button>
          <span className="font-grotesk font-bold text-sm flex-1 truncate">Communauté</span>
        </div>
      </div>

      <div className={`h-32 relative overflow-hidden ${community.is_premium ? 'bg-gradient-to-r from-yellow-400/20 via-amber-400/15 to-orange-400/20' : 'bg-gradient-to-br from-primary/20 to-accent/20'}`}>
        {community.cover_url && <img src={community.cover_url} className="w-full h-full object-cover" alt="" />}
        {community.is_premium && (
          <div className="absolute inset-0 bg-gradient-to-t from-yellow-400/10 to-transparent pointer-events-none" />
        )}
      </div>
      {community.is_premium && (
        <div className="h-1 bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-400" />
      )}
      <div className={`px-4 py-3 ${community.is_premium ? 'border-x border-yellow-400/20' : ''}`}>
        <div className="flex items-center gap-1.5 mb-1 flex-wrap">
          {community.is_pinned && community.pinned_until && new Date(community.pinned_until).getTime() > Date.now() && (
            <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-amber-400 bg-amber-400/10 border border-amber-400/30 px-2 py-0.5 rounded-full">
              <Pin className="w-2.5 h-2.5" /> Épinglée {Math.max(0, Math.ceil((new Date(community.pinned_until).getTime() - Date.now()) / 86400000))}j
            </span>
          )}
          {community.is_premium && (
            <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-yellow-400 bg-yellow-400/10 border border-yellow-400/30 px-2 py-0.5 rounded-full">
              <Crown className="w-2.5 h-2.5" /> Premium
            </span>
          )}
          <h1 className="font-grotesk font-bold text-xl">{community.name}</h1>
          {community.type === 'closed' ? <Lock className="w-4 h-4 text-amber-400" /> : <Globe className="w-4 h-4 text-emerald-400" />}
        </div>
        {community.description && <p className="font-inter text-sm text-muted-foreground mb-3">{community.description}</p>}
        <div className="flex items-center gap-3 mb-4">
          <span className="flex items-center gap-1 font-mono text-xs text-muted-foreground"><Users className="w-3 h-3" /> {community.members_count || 0}/{community.capacity_limit || 100} membres</span>
          <span className="font-mono text-xs text-muted-foreground">par @{community.owner_username || 'eza'}</span>
        </div>

        {isMember ? (
          <button onClick={() => community.owner_id === user.id ? null : handleJoin('leave')} disabled={joining || community.owner_id === user.id}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-full border border-border text-sm font-semibold text-muted-foreground hover:bg-white/5 disabled:opacity-50">
            {community.owner_id === user.id ? <><Users className="w-3.5 h-3.5" /> Créateur</> : <><LogOut className="w-3.5 h-3.5" /> Quitter</>}
          </button>
        ) : (
          <button onClick={() => handleJoin('join')} disabled={joining}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90">
            <LogIn className="w-3.5 h-3.5" /> Rejoindre
          </button>
        )}
      </div>

      {isMember && (
        <div className="px-4 py-2 border-y border-border/40 flex gap-2 items-start">
          <div className="w-9 h-9 rounded-lg overflow-hidden bg-primary/10 flex items-center justify-center flex-shrink-0">
            {user.avatar_url ? <img src={user.avatar_url} className="w-full h-full object-cover" alt="" /> : <span className="font-grotesk font-bold text-primary text-sm">{(user.display_name || user.full_name || 'U')[0]}</span>}
          </div>
          <div className="flex-1">
            <textarea value={content} onChange={e => setContent(e.target.value.slice(0, 280))} placeholder="Partager avec la communauté…"
              className="w-full bg-transparent text-[15px] text-foreground placeholder:text-muted-foreground/40 resize-none outline-none min-h-[40px]" />
            <div className="flex justify-end mt-1">
              <button onClick={handlePost} disabled={!content.trim() || posting}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 disabled:opacity-40">
                {posting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />} Publier
              </button>
            </div>
          </div>
        </div>
      )}

      <div>
        {posts.length === 0 ? (
          <div className="py-16 text-center px-4">
            <MessageCircle className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
            <p className="font-grotesk font-bold text-base mb-1">Aucun post</p>
            <p className="font-inter text-sm text-muted-foreground">{isMember ? 'Lancez la discussion dans cette communauté.' : 'Rejoignez la communauté pour voir et publier.'}</p>
          </div>
        ) : (
          posts.map(p => <PostCard key={p.id} post={p} currentUser={user} />)
        )}
      </div>
    </div>
  );
}