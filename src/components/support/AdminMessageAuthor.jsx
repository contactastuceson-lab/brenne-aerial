import React from 'react';
import VerificationIcons from '@/components/ui/VerificationIcon';
import usePublicUser from '@/hooks/usePublicUser';

/**
 * Affiche le nom d'affichage + badges de vérification/affiliation de l'admin
 * qui a répondu à un ticket de support.
 */
export default function AdminMessageAuthor({ adminId, fallbackName }) {
  const profile = usePublicUser(adminId);
  const displayName = profile?.display_name || profile?.full_name || fallbackName || 'Administrateur';
  const verifications = profile?.verifications || [];

  return (
    <div className="flex items-center gap-1.5 mb-1 px-1">
      <span className="text-xs font-semibold text-foreground/90 truncate">{displayName}</span>
      {adminId && (
        <VerificationIcons verifications={verifications} size="sm" user={profile ? { id: adminId, email: profile.email } : null} />
      )}
    </div>
  );
}