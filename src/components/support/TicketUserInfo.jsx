import React from 'react';
import VerificationMark from '@/components/ui/VerificationMark';
import usePublicUser from '@/hooks/usePublicUser';

/**
 * Affiche l'avatar + nom + TOUS les badges de vérification
 * de l'utilisateur qui a créé le ticket.
 */
export default function TicketUserInfo({ userId, fallbackName, fallbackEmail }) {
  const profile = usePublicUser(userId);
  const displayName = profile?.display_name || profile?.full_name || fallbackName || 'Utilisateur';
  const verifications = profile?.verifications || [];
  const avatar = profile?.avatar_url;

  return (
    <div className="flex items-center gap-2 text-[11px]">
      <div className="w-5 h-5 rounded-full overflow-hidden flex-shrink-0 bg-secondary border border-border">
        {avatar ? (
          <img src={avatar} className="w-full h-full object-cover" alt="" />
        ) : (
          <span className="w-full h-full flex items-center justify-center text-[9px] font-bold text-muted-foreground">
            {displayName.charAt(0).toUpperCase()}
          </span>
        )}
      </div>
      <span className="text-muted-foreground truncate">{displayName}</span>
      {verifications.length > 0 && (
        <span className="inline-flex items-center gap-0.5">
          {verifications.map((v) => (
            <span key={v} className="inline-flex items-center leading-none">
              <VerificationMark type={v} size="0.85em" />
            </span>
          ))}
        </span>
      )}
      {fallbackEmail && (
        <>
          <span className="text-muted-foreground/50">·</span>
          <span className="text-muted-foreground truncate">{fallbackEmail}</span>
        </>
      )}
    </div>
  );
}