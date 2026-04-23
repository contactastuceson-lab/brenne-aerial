import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44Client } from '@/api/base44Client';
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
      const response = await base44Client.records.get({ table: 'User', id: userId });
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

  const getBadgeIcon = (badge) => {
    if (badge.includes('verificat')) return <Shield size={14} className="text-blue-600" />;
    if (badge.includes('expert')) return <Zap size={14} className="text-yellow-600" />;
    if (badge.includes('moderateur')) return <Shield size={14} className="text-purple-600" />;
    if (badge.includes('supremme')) return <Star size={14} className="text-amber-600" />;
    return <Award size={14} className="text-gray-600" />;
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
          <div className="flex flex-wrap gap-2">
            {user.badges.map((badge) => (
              <div
                key={badge}
                className="flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-900 rounded-full text-xs font-semibold border border-amber-300"
              >
                {getBadgeIcon(badge)}
                <span className="capitalize">{badge.replace(/_/g, ' ')}</span>
              </div>
            ))}
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
                {user.badges.slice(0, 1).map((badge) => (
                  <div
                    key={badge}
                    className="flex items-center justify-center w-4 h-4 bg-amber-400 rounded-full text-white text-xs"
                    title={badge}
                  >
                    ⭐
                  </div>
                ))}
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
