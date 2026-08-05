import React from 'react';
import VerificationIcons from '@/components/ui/VerificationIcon';
import usePublicUser from '@/hooks/usePublicUser';

/**
 * Affiche le nom d'affichage + badges (principal + affiliations)
 * de l'utilisateur qui a créé le ticket, au-dessus de ses messages.
 * Aligné à droite (messages utilisateur alignés à droite).
 */
export default function UserMessageAuthor({ userId, fallbackName }) {
  const profile = usePublicUser(userId);
  const displayName = profile?.display_name || profile?.full_name || fallbackName || 'Utilisateur';
  const verifications = profile?.verifications || [];
  const avatar = profile?.avatar_url;

  return (
    <div className="flex items-center gap-1.5 mb-1 px-1 flex-wrap justify-end">
      <span className="text-xs font-semibold text-foreground/90 truncate">{displayName}</span>
      <VerificationIcons verifications={verifications} user={profile} size="sm" />
      <div className="w-4 h-4 rounded-full overflow-hidden flex-shrink-0 bg-secondary border border-border">
        {avatar ? (
          <img src={avatar} className="w-full h-full object-cover" alt="" />
        ) : (
          <span className="w-full h-full flex items-center justify-center text-[8px] font-bold text-muted-foreground">
            {displayName.charAt(0).toUpperCase()}
          </span>
        )}
      </div>
    </div>
  );
}