import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import CommunityDialog from '@/components/community/CommunityDialog';
import { Plus, Users, Lock, Globe, Loader2, Pin, Crown } from 'lucide-react';

export default function CommunitiesPage() {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data: user } = useQuery({ queryKey: ['current-user'], queryFn: () => base44.auth.me(), staleTime: 60000, retry: false });

  const { data: communities = [], isLoading } = useQuery({
    queryKey: ['communities'],
    queryFn: async () => {
      const list = await base44.entities.Community.list('-members_count', 50);
      // Tri : épinglées et non expirées en premier, puis par membres
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

  if (!user) return <div className="flex justify-center py-24"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;

  return (
    <div className="w-full max-w-[680px] min-w-0 mx-auto pb-20">
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border/60 px-4 py-3 flex items-center gap-2">
        <Users className="w-5 h-5 text-primary" />
        <h1 className="font-grotesk font-bold text-lg flex-1">Communautés</h1>
        <button onClick={() => setDialogOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90">
          <Plus className="w-3.5 h-3.5" /> Créer
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-5 h-5 animate-spin text-primary" /></div>
      ) : communities.length === 0 ? (
        <div className="py-16 text-center px-4">
          <Users className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
          <p className="font-grotesk font-bold text-base mb-1">Aucune communauté</p>
          <p className="font-inter text-sm text-muted-foreground">Créez un groupe thématique — ouvert ou fermé — où les posts ne sont visibles que par les membres.</p>
        </div>
      ) : (
        <div className="divide-y divide-border/40">
          {communities.map(c => {
            const isMember = (c.member_ids || []).includes(user.id) || c.owner_id === user.id;
            return (
              <button key={c.id} onClick={() => navigate(`/community/${c.id}`)}
                className="w-full flex items-start gap-3 px-4 py-3.5 hover:bg-white/[0.015] transition-colors text-left">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: c.cover_url ? `center/cover url(${c.cover_url})` : 'linear-gradient(135deg, hsl(var(--primary)/0.2), hsl(var(--accent)/0.2))' }}>
                  {!c.cover_url && <span className="font-grotesk font-bold text-primary">{(c.name || 'C')[0]}</span>}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {c.is_pinned && c.pinned_until && new Date(c.pinned_until).getTime() > Date.now() && (
                      <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-amber-400 bg-amber-400/10 border border-amber-400/30 px-1.5 py-0.5 rounded-full"><Pin className="w-2.5 h-2.5" /> Épinglée</span>
                    )}
                    {c.is_premium && (
                      <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-yellow-400 bg-yellow-400/10 border border-yellow-400/30 px-1.5 py-0.5 rounded-full"><Crown className="w-2.5 h-2.5" /> Premium</span>
                    )}
                    <span className="font-grotesk font-bold text-[15px] truncate">{c.name}</span>
                    {c.type === 'closed' ? <Lock className="w-3 h-3 text-amber-400 flex-shrink-0" /> : <Globe className="w-3 h-3 text-emerald-400 flex-shrink-0" />}
                    {isMember && <span className="text-[10px] font-semibold text-primary bg-primary/10 border border-primary/30 px-1.5 py-0.5 rounded-full">Membre</span>}
                  </div>
                  {c.description && <p className="font-inter text-xs text-muted-foreground line-clamp-1 mt-0.5">{c.description}</p>}
                  <p className="font-mono text-[10px] text-muted-foreground/60 mt-0.5">{c.members_count || 0}/{c.capacity_limit || 100} membres · par @{c.owner_username || 'eza'}</p>
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