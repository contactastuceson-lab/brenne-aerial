import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card';
import { Badge } from '@/components/ui/badge';
import { Shield, Award, Zap, Star, CheckCircle, Heart, Crown, Building2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import VerificationIcons from '@/components/ui/VerificationIcon';
import BadgeChip from '@/components/ui/BadgeChip';

const UserBadgeProfile = ({ userId, small = false }) => {
  const { data: user, isLoading } = useQuery({
    queryKey: ['user', userId],
    queryFn: async () => {
      const response = await base44.entities.User.get(userId);
      return response;
    },
    enabled: !!userId,
  });

  if (isLoading) {
    return (
      <div className={cn('animate-pulse bg-gray-200 rounded-full', small ? 'w-6 h-6' : 'w-10 h-10')} />
    );
  }

  // Fallback display if user data not found - used when user ID doesn't resolve
  const displayAsUnknown = !user;

  const BADGE_CONFIG = {
    'Fondateur': { icon: Star, color: 'text-yellow-400', bg: 'bg-yellow-400/10', border: 'border-yellow-400/30' },
    'Collaborateur': { icon: Award, color: 'text-blue-400', bg: 'bg-blue-400/10', border: 'border-blue-400/30' },
    'VIP': { icon: Award, color: 'text-purple-400', bg: 'bg-purple-400/10', border: 'border-purple-400/30' },
    'Admin': { icon: Shield, color: 'text-red-400', bg: 'bg-red-400/10', border: 'border-red-400/30' },
    'Pilote': { icon: Zap, color: 'text-cyan-400', bg: 'bg-cyan-400/10', border: 'border-cyan-400/30' },
    'Officiel': { icon: CheckCircle, color: 'text-accent', bg: 'bg-accent/10', border: 'border-accent/30' },
    'Vérfifié': { icon: CheckCircle, color: 'text-green-400', bg: 'bg-green-400/10', border: 'border-green-400/30' },
    'Donateur': { icon: Heart, color: 'text-red-400', bg: 'bg-red-400/10', border: 'border-red-400/30' },
  };

  const roleColors = {
    owner: 'bg-red-100 text-red-900',
    pdg_adjoint: 'bg-orange-100 text-orange-900',
    admin: 'bg-purple-100 text-purple-900',
    conseil_admin: 'bg-blue-100 text-blue-900',
    directeur: 'bg-indigo-100 text-indigo-900',
    responsable: 'bg-green-100 text-green-900',
    collaborateur_interne: 'bg-cyan-100 text-cyan-900',
    vip: 'bg-amber-100 text-amber-900',
    collaborateur: 'bg-gray-100 text-gray-900',
    pilote: 'bg-teal-100 text-teal-900',
    user: 'bg-gray-50 text-gray-900',
  };

  const profileContent = (
    <div className={cn('space-y-3', small && 'space-y-2')}>
      <div className="flex items-start gap-3">
         <Avatar className={cn(small ? 'w-12 h-12' : 'w-16 h-16')}>
           <AvatarImage src={user.avatar_url} />
           <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white text-lg font-bold">
             {(user.full_name || user.name)?.charAt(0).toUpperCase() || 'U'}
           </AvatarFallback>
         </Avatar>
         <div className="flex-1">
           <h4 className={cn('font-bold text-gray-900', small ? 'text-sm' : 'text-base')}>
             {user.full_name || user.name}
           </h4>
           <p className={cn('text-gray-600', small ? 'text-xs' : 'text-sm')}>
             {user.title || user.role}
           </p>
         </div>
       </div>

      {/* Rôle */}
      {user.role && user.role !== 'user' && (
        <div>
          <Badge className={cn('capitalize text-xs', roleColors[user.role] || roleColors.user)}>
            {user.role.replace(/_/g, ' ')}
          </Badge>
        </div>
      )}

      {/* Bio */}
      {user.bio && (
        <p className={cn('text-gray-700', small ? 'text-xs' : 'text-sm')}>{user.bio}</p>
      )}

      {/* Badges */}
      {user.badges && user.badges.length > 0 && (
        <div>
          <p className={cn('font-semibold text-gray-900 mb-2', small ? 'text-xs' : 'text-sm')}>
            Badges ({user.badges.length})
          </p>
          <div className="flex flex-wrap gap-2">
            {user.badges.map((badge) => {
              const cfg = BADGE_CONFIG[badge];
              if (!cfg) return <span key={badge} className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-900">{badge}</span>;
              const Icon = cfg.icon;
              return (
                <span key={badge} className={`flex items-center gap-1.5 font-inter text-xs px-2.5 py-1 rounded-full border ${cfg.color} ${cfg.bg} ${cfg.border}`}>
                  <Icon className="w-3 h-3" /> {badge}
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* Location */}
      {user.location && (
        <p className={cn('text-gray-600', small ? 'text-xs' : 'text-sm')}>📍 {user.location}</p>
      )}

      {/* Lien vers le profil */}
      <Link
        to={`/profile/${userId}`}
        className="inline-block mt-2 px-3 py-1 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 transition-colors"
      >
        Voir le profil
      </Link>
    </div>
  );

  if (small) {
    // If no user data, return minimal display
    if (displayAsUnknown) {
      return (
        <div className="flex items-start gap-3">
          <Avatar className="w-8 h-8 border border-cyan-500/20">
            <AvatarFallback className="bg-gradient-to-br from-slate-600 to-slate-700 text-white text-xs font-bold">
              U
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col gap-1 min-w-0 flex-1">
            <span className="font-grotesk font-bold text-sm text-slate-400 leading-tight">
              Auteur inconnu
            </span>
          </div>
        </div>
      );
    }

    return (
      <HoverCard>
        <HoverCardTrigger asChild>
          <button className="flex items-start gap-3 hover:opacity-85 transition-opacity group">
            <Avatar className="w-8 h-8 border border-cyan-500/20">
              <AvatarImage src={user.avatar_url} />
              <AvatarFallback className="bg-gradient-to-br from-cyan-500 to-blue-500 text-white text-xs font-bold">
                {(user.full_name || user.name)?.charAt(0).toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col gap-1 min-w-0 flex-1">
              <span className="font-grotesk font-bold text-sm text-white group-hover:text-cyan-300 transition-colors leading-tight">
                {user.full_name || user.name}
              </span>
              {user.role && user.role !== 'user' && (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-700/50 text-slate-300 whitespace-nowrap w-fit">
                  {user.role === 'pdg_adjoint' ? 'Deputy' : user.role === 'conseil_admin' ? 'Council' : user.role.split('_')[0]}
                </span>
              )}
            </div>
            <div className="flex gap-1.5 items-center flex-shrink-0">
              <VerificationIcons verifications={user.verifications} size="sm" />
              {user.badges && user.badges.length > 0 && user.badges.slice(0, 3).map((badge) => {
                const cfg = BADGE_CONFIG[badge];
                if (!cfg) return null;
                const Icon = cfg.icon;
                return (
                  <div
                    key={badge}
                    className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 border ${cfg.color} ${cfg.bg} ${cfg.border}`}
                    title={badge}
                  >
                    <Icon className="w-2.5 h-2.5" strokeWidth={2.5} />
                  </div>
                );
              })}
            </div>
          </button>
        </HoverCardTrigger>
        <HoverCardContent className="w-80" align="start">
          {profileContent}
        </HoverCardContent>
      </HoverCard>
    );
  }

  if (displayAsUnknown) {
    return (
      <div className={cn('space-y-3', small && 'space-y-2')}>
        <div className="flex items-start gap-3">
          <Avatar className={cn(small ? 'w-12 h-12' : 'w-16 h-16')}>
            <AvatarFallback className="bg-gradient-to-br from-slate-600 to-slate-700 text-white text-lg font-bold">
              U
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h4 className={cn('font-bold text-gray-900', small ? 'text-sm' : 'text-base')}>
              Auteur inconnu
            </h4>
          </div>
        </div>
      </div>
    );
  }

  return <>{profileContent}</>;
};

export default UserBadgeProfile;