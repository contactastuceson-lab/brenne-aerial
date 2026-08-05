import React from 'react';
import VerificationIcons from '@/components/ui/VerificationIcon';
import usePublicUser from '@/hooks/usePublicUser';
import { Shield } from 'lucide-react';

/**
 * Affiche l'avatar + nom d'affichage + badges de vérification
 * de l'admin qui a répondu à un ticket, + un pill "Admin".
 */
export default function AdminMessageAuthor({ adminId, fallbackName }) {
  const profile = usePublicUser(adminId);
  const displayName = profile?.display_name || profile?.full_name || fallbackName || 'Administrateur';
  const verifications = profile?.verifications || [];
  const avatar = profile?.avatar_url;

  return (
    <div className="flex items-center gap-1.5 mb-1 px-1 flex-wrap">
      <div className="w-4 h-4 rounded-full overflow-hidden flex-shrink-0 bg-secondary border border-border">
        {avatar ? (
          <img src={avatar} className="w-full h-full object-cover" alt="" />
        ) : (
          <span className="w-full h-full flex items-center justify-center text-[8px] font-bold text-muted-foreground">
            {displayName.charAt(0).toUpperCase()}
          </span>
        )}
      </div>
      <span className="text-xs font-semibold text-foreground/90 truncate">{displayName}</span>
      <VerificationIcons verifications={verifications} user={profile} size="sm" />
      <span className="inline-flex items-center gap-0.5 text-[9px] font-bold px-1 py-0.5 rounded-full bg-primary/15 text-primary border border-primary/20 flex-shrink-0">
        <Shield className="w-2 h-2" /> Admin
      </span>
    </div>
  );
}