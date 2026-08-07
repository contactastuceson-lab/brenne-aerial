import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { UserPlus, X } from 'lucide-react';
import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import VerificationIcons from '@/components/ui/VerificationIcon';
import { toast } from 'sonner';

export default function PeopleYouMayKnow({ user }) {
  const queryClient = useQueryClient();
  const [dismissed, setDismissed] = useState(new Set());

  const { data: suggestions = [], isLoading } = useQuery({
    queryKey: ['people-you-may-know', user?.id],
    queryFn: async () => {
      const res = await base44.functions.invoke('getPeopleYouMayKnow', { limit: 5 });
      return res?.data?.suggestions || res?.suggestions || [];
    },
    enabled: !!user?.id,
    staleTime: 10 * 60 * 1000,
  });

  const visible = suggestions.filter(s => !dismissed.has(s.id));

  const handleFollow = async (suggestion) => {
    try {
      await base44.entities.Follow.create({
        follower_email: user.email,
        follower_name: user.display_name || user.full_name || user.username,
        follower_avatar: user.avatar_url || null,
        following_email: suggestion.email || suggestion.id,
        following_name: suggestion.display_name,
      });
      toast.success(`Vous suivez maintenant ${suggestion.display_name}`);
      setDismissed(prev => new Set([...prev, suggestion.id]));
      queryClient.invalidateQueries({ queryKey: ['people-you-may-know', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['my-following-feed', user?.email] });
    } catch {
      toast.error('Impossible de suivre cet utilisateur');
    }
  };

  const handleDismiss = (id) => {
    setDismissed(prev => new Set([...prev, id]));
  };

  if (isLoading || visible.length === 0) return null;

  return (
    <div className="mb-4 rounded-2xl bg-white/3 border border-white/8 overflow-hidden">
      <div className="px-4 pt-3.5 pb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-emerald-500/15 border border-emerald-500/20 flex items-center justify-center">
            <UserPlus className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <span className="font-grotesk font-semibold text-[13px] text-foreground">Vous pourriez connaître</span>
        </div>
        <Link to="/discover" className="text-[11px] text-primary/70 hover:text-primary transition-colors font-medium">Voir plus</Link>
      </div>
      <div className="px-3 pb-2 space-y-0.5">
        {visible.map(suggestion => {
          const name = suggestion.display_name || suggestion.username;
          const initial = (name?.[0] || 'U').toUpperCase();
          const profileLink = suggestion.username ? `/@${suggestion.username}` : null;
          const mutualCount = suggestion.mutual_count || 0;
          const mutualNames = suggestion.mutual_names || [];

          return (
            <div key={suggestion.id} className="flex items-center gap-2.5 px-2 py-2 rounded-xl hover:bg-white/5 transition-colors">
              <div className="w-9 h-9 rounded-full overflow-hidden border border-white/10 flex-shrink-0 bg-primary/10">
                {suggestion.avatar_url
                  ? <img src={suggestion.avatar_url} alt={name} className="w-full h-full object-cover" />
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
                  {suggestion.verifications?.length > 0 && (
                    <span className="scale-[0.82] origin-left">
                      <VerificationIcons verifications={suggestion.verifications} size="sm" user={suggestion} />
                    </span>
                  )}
                </div>
                {suggestion.username && <p className="font-mono text-[10px] text-muted-foreground/40">@{suggestion.username}</p>}
                {mutualCount > 0 && (
                  <p className="text-[10px] text-muted-foreground/50 truncate">
                    {mutualCount} ami{mutualCount > 1 ? 's' : ''} en commun
                    {mutualNames.length > 0 && ` · ${mutualNames.join(', ')}`}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <button
                  onClick={() => handleFollow(suggestion)}
                  className="px-3 py-1 rounded-full bg-primary text-primary-foreground text-[11px] font-grotesk font-bold hover:bg-primary/90 transition-colors"
                >
                  Suivre
                </button>
                <button
                  onClick={() => handleDismiss(suggestion.id)}
                  className="p-1 rounded-full text-muted-foreground/30 hover:text-foreground hover:bg-white/5 transition-colors"
                  title="Pas intéressé"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}