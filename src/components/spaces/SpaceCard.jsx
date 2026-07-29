import { useNavigate } from 'react-router-dom';
import { Radio, Calendar, Play } from 'lucide-react';
import VerificationIcons from '@/components/ui/VerificationIcon';

export default function SpaceCard({ space, user, onStart }) {
  const navigate = useNavigate();
  const isHost = space.host_id === user?.id;
  const live = space.status === 'live';
  return (
    <div
      onClick={() => live && navigate(`/space/${space.id}`)}
      className={`relative rounded-2xl p-3 border transition-colors ${live ? 'border-red-500/30 bg-red-500/[0.06] cursor-pointer hover:bg-red-500/10' : 'border-border bg-card'}`}
    >
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
          <p className="font-grotesk font-bold text-sm truncate leading-tight">{space.title}</p>
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
    </div>
  );
}