import { useNavigate } from 'react-router-dom';
import { Radio, Calendar, Play, BadgeCheck } from 'lucide-react';
import VerificationIcons from '@/components/ui/VerificationIcon';
import { hasAdminAccess } from '@/lib/roles';
import { base44 } from '@/api/base44Client';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export default function SpaceCard({ space, user, onStart }) {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const isHost = space.host_id === user?.id;
  const isAdmin = hasAdminAccess(user);
  const live = space.status === 'live';

  const toggleOfficial = async (e) => {
    e.stopPropagation();
    try {
      await base44.entities.Space.update(space.id, { is_official: !space.is_official });
      qc.invalidateQueries({ queryKey: ['spaces-live'] });
      qc.invalidateQueries({ queryKey: ['spaces-scheduled'] });
      toast.success(space.is_official ? 'Officiel retiré' : 'Space marqué officiel');
    } catch { toast.error('Action impossible'); }
  };

  return (
    <div
      onClick={() => live && navigate(`/space/${space.id}`)}
      className={`relative rounded-2xl p-3 border transition-colors ${live ? 'border-red-500/30 bg-red-500/[0.06] cursor-pointer hover:bg-red-500/10' : 'border-border bg-card'}`}
    >
      {space.is_official && (
        <span className="absolute top-2 right-2 inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-primary/15 border border-primary/30 text-primary text-[9px] font-bold">
          <BadgeCheck className="w-2.5 h-2.5" /> OFFICIEL
        </span>
      )}
      <div className="flex items-center gap-2.5">
        <div className="w-10 h-10 rounded-full overflow-hidden bg-primary/10 flex items-center justify-center flex-shrink-0">
          {space.host_avatar ? <img src={space.host_avatar} className="w-full h-full object-cover" alt="" /> : <span className="font-grotesk font-bold text-primary">{(space.host_name || 'U')[0]}</span>}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1 mb-0.5">
            {live
              ? <span className="flex items-center gap-1 text-[10px] font-bold text-red-400"><Radio className="w-3 h-3 animate-pulse" /> EN DIRECT</span>
              : <span className="flex items-center gap-1 text-[10px] font-bold text-amber-400"><Calendar className="w-3 h-3" /> Programmé</span>}
          </div>
          <p className="font-grotesk font-bold text-sm truncate leading-tight pr-16">{space.title}</p>
          <div className="flex items-center gap-1">
            <span className="font-mono text-[10px] text-muted-foreground truncate">@{space.host_username || 'eza'}</span>
            <VerificationIcons verifications={space.host_verifications || []} size="sm" />
          </div>
        </div>
        {!live && isHost && (
          <button
            onClick={(e) => { e.stopPropagation(); onStart(space); }}
            className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary text-primary-foreground text-[11px] font-semibold hover:opacity-90"
          >
            <Play className="w-3 h-3" /> Démarrer
          </button>
        )}
      </div>
      {isAdmin && (
        <button
          onClick={toggleOfficial}
          className={`mt-2 w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-[11px] font-semibold border transition-colors ${space.is_official ? 'border-primary/30 bg-primary/10 text-primary hover:bg-primary/20' : 'border-border text-muted-foreground hover:bg-white/5 hover:text-foreground'}`}
        >
          <BadgeCheck className="w-3 h-3" /> {space.is_official ? 'Retirer le statut officiel' : 'Marquer comme officiel'}
        </button>
      )}
    </div>
  );
}