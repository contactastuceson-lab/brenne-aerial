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
import { Shield, Award, Zap, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

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

  if (!user) {
    return null;
  }

  const getBadgeConfig = (badge) => {
    const badgeLower = badge.toLowerCase();
    if (badgeLower.includes('fondateur')) return {
      bg: 'bg-gradient-to-br from-amber-400 to-yellow-500',
      icon: '👑',
      color: 'text-white',
    };
    if (badgeLower.includes('supremme')) return {
      bg: 'bg-gradient-to-br from-purple-500 to-pink-500',
      icon: '✨',
      color: 'text-white',
    };
    if (badgeLower.includes('expert')) return {
      bg: 'bg-gradient-to-br from-blue-500 to-cyan-500',
      icon: '⚡',
      color: 'text-white',
    };
    if (badgeLower.includes('moderateur')) return {
      bg: 'bg-gradient-to-br from-green-500 to-emerald-500',
      icon: '🛡️',
      color: 'text-white',
    };
    if (badgeLower.includes('verificat')) return {
      bg: 'bg-gradient-to-br from-blue-400 to-blue-600',
      icon: '✓',
      color: 'text-white',
    };
    return {
      bg: 'bg-gradient-to-br from-slate-500 to-slate-600',
      icon: '🏅',
      color: 'text-white',
    };
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
            {user.name?.charAt(0).toUpperCase() || 'U'}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <h4 className={cn('font-bold text-gray-900', small ? 'text-sm' : 'text-base')}>
            {user.name}
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
          <div className="flex flex-wrap gap-3">
            {user.badges.map((badge) => {
              const config = getBadgeConfig(badge);
              return (
                <div key={badge} className="group relative">
                  <div
                    className={cn(
                      'w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110',
                      config.bg
                    )}
                    title={badge}
                  >
                    {config.icon}
                  </div>
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-10">
                    {badge.replace(/_/g, ' ')}
                  </div>
                </div>
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
    return (
      <HoverCard>
        <HoverCardTrigger asChild>
          <button className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <Avatar className="w-6 h-6">
              <AvatarImage src={user.avatar_url} />
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white text-xs font-bold">
                {user.name?.charAt(0).toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm font-semibold text-gray-900">{user.name}</span>
            {user.badges && user.badges.length > 0 && (
              <div className="flex gap-1">
                {user.badges.slice(0, 2).map((badge) => {
                  const config = getBadgeConfig(badge);
                  return (
                    <div
                      key={badge}
                      className={cn(
                        'flex items-center justify-center w-5 h-5 rounded-full text-xs font-bold shadow-md hover:scale-110 transition-transform',
                        config.bg
                      )}
                      title={badge}
                    >
                      {config.icon}
                    </div>
                  );
                })}
              </div>
            )}
          </button>
        </HoverCardTrigger>
        <HoverCardContent className="w-80" align="start">
          {profileContent}
        </HoverCardContent>
      </HoverCard>
    );
  }

  return <>{profileContent}</>;
};

export default UserBadgeProfile;