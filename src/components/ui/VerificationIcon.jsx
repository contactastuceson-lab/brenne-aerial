import React, { useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { VERIFICATION_CONFIG } from './VerificationChip';
import { getHighestVerificationBadge } from '@/lib/affiliationUtils';
import VerificationMark from '@/components/ui/VerificationMark';
import AffiliationModal from '@/components/ui/AffiliationModal';
import { useOrganizationAffiliations } from '@/hooks/useOrganizationAffiliations';
import { handleIdentityClick } from '@/lib/identityClick';

function buildUserDescriptor(user) {
  if (!user) return null;
  if (user.id) return { userId: user.id };
  if (user.email) return { userEmail: user.email };
  return null;
}

function AffiliationChip({ affiliation, size, onOpen }) {
  const dimension = size === 'sm' ? 20 : 24;
  const initial = (affiliation.organizationName || 'ORG').slice(0, 1).toUpperCase();

  return (
    <button
      type="button"
      onClick={(event) => { event.stopPropagation(); onOpen(); }}
      title={`Affilié à ${affiliation.organizationName || 'une organisation'}`}
      className="inline-flex items-center justify-center overflow-hidden rounded-full transition hover:scale-105 focus-visible:outline-none"
      style={{ width: dimension, height: dimension }}
    >
      {affiliation.organizationAvatarUrl ? (
        <img src={affiliation.organizationAvatarUrl} alt={affiliation.organizationName || 'Organisation'} className="h-full w-full object-cover" />
      ) : (
        <span className="flex h-full w-full items-center justify-center bg-primary/20 text-[10px] font-bold text-primary">{initial}</span>
      )}
    </button>
  );
}

/**
 * @param {{ verifications?: Array<string>, size?: string, user?: any|null, onAffiliationOpen?: () => void }} props
 */
export default function VerificationIcons({ verifications = [], size = 'sm', user = null, onAffiliationOpen }) {
  const [internalOpen, setInternalOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const userDescriptor = buildUserDescriptor(user);
  const { affiliations, loading: loadingAffiliation } = useOrganizationAffiliations(userDescriptor);
  const visibleAffiliations = useMemo(
    () => affiliations.filter((affiliation) => affiliation?.status === 'accepted' && affiliation?.visibility === 'public'),
    [affiliations]
  );
  const displayedVerification = useMemo(() => getHighestVerificationBadge(verifications), [verifications]);
  const hasAffiliation = visibleAffiliations.length > 0;
  const openAffiliation = onAffiliationOpen || (() => setInternalOpen(true));
  const handleClick = (event) => handleIdentityClick({
    event,
    navigate,
    pathname: location.pathname,
    user,
    onProfileClick: openAffiliation,
  });

  if (!verifications?.length && !hasAffiliation && !loadingAffiliation) return null;

  return (
    <div className="inline-flex items-center gap-1.5">
      {displayedVerification && (() => {
        const config = VERIFICATION_CONFIG[displayedVerification];
        if (!config) return null;
        const icon = <span className="inline-flex items-center leading-none flex-shrink-0"><VerificationMark type={displayedVerification} /></span>;
        return (
          <button key={displayedVerification} type="button" onClick={handleClick} className="inline-flex cursor-pointer focus-visible:outline-none">{icon}</button>
        );
      })()}
      {hasAffiliation && <AffiliationChip affiliation={visibleAffiliations[0]} size={size} onOpen={() => handleClick()} />}
      {!onAffiliationOpen && <AffiliationModal user={user} open={internalOpen} onOpenChange={setInternalOpen} />}
    </div>
  );
}