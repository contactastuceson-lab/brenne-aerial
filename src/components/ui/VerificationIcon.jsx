import React, { useMemo, useState } from 'react';
import { VERIFICATION_CONFIG } from './VerificationChip';
import BadgePopup from './BadgePopup';
import { getVisibleAffiliation, getOrganizationBadge, getHighestVerificationBadge } from '@/lib/affiliationUtils';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Check, ExternalLink, Building2 } from 'lucide-react';
import { useOrganizationAffiliations, useCachedUser } from '@/hooks/useOrganizationAffiliations';

function buildUserDescriptor(user) {
  if (!user) return null;
  if (user.id) return { userId: user.id };
  if (user.email) return { userEmail: user.email };
  return null;
}

const bgColorMap = {
  'text-sky-400':     '#0ea5e9',
  'text-amber-400':   '#f59e0b',
  'text-purple-400':  '#a855f7',
  'text-emerald-400': '#10b981',
  'text-yellow-300':  '#f59e0b',
  'text-zinc-300':    '#71717a',
};

const TWITTER_SEAL = "M22.25 12c0-1.43-.88-2.67-2.19-3.34.46-1.39.2-2.9-.81-3.91s-2.52-1.27-3.91-.81c-.66-1.31-1.91-2.19-3.34-2.19s-2.67.88-3.33 2.19c-1.4-.46-2.91-.2-3.92.81s-1.26 2.52-.8 3.91C3.38 9.33 2.5 10.57 2.5 12s.88 2.67 2.19 3.34c-.46 1.39-.2 2.9.81 3.91s2.52 1.26 3.91.8c.66 1.31 1.9 2.19 3.33 2.19s2.68-.88 3.34-2.19c1.39.46 2.9.2 3.91-.81s1.27-2.52.81-3.91c1.31-.67 2.19-1.91 2.19-3.34z";

// ── Affiliation avatar chip (single org) ────────────────
function AffiliationChip({ affiliation, size, organizationUser }) {
  const [open, setOpen] = useState(false);
  const s = size === 'sm' ? 20 : 24;
  const iconSize = size === 'sm' ? 10 : 12;
  const orgUsername = organizationUser?.username ? `@${organizationUser.username}` : null;

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button
          title={`Affilié à ${affiliation.organizationName}`}
          className="inline-flex items-center justify-center rounded-[4px] overflow-hidden transition duration-150 hover:scale-110 focus-visible:outline-none"
          style={{ width: s, height: s }}
        >
          {affiliation.organizationAvatarUrl ? (
            <img src={affiliation.organizationAvatarUrl} alt={affiliation.organizationName || 'Organisation'} className="h-full w-full object-cover" />
          ) : (
            <span className="w-full h-full flex items-center justify-center bg-primary/20 font-bold text-primary" style={{ fontSize: iconSize }}>
              {(affiliation.organizationName || 'ORG').slice(0, 1).toUpperCase()}
            </span>
          )}
        </button>
      </SheetTrigger>
      <SheetContent
        side="bottom"
        hideClose
        onPointerDownOutside={() => setOpen(false)}
        className="fixed inset-x-0 bottom-0 w-full h-auto min-h-[22vh] max-h-[70vh] flex flex-col bg-card border-t border-border rounded-t-3xl shadow-2xl overflow-hidden p-0 pb-[calc(env(safe-area-inset-bottom)+0.75rem)]"
      >
        <div className="w-full bg-gradient-to-r from-primary/60 via-primary/40 to-amber-400/20 p-2">
          <div className="max-w-6xl mx-auto flex items-center gap-3 px-3">
            <div className="h-9 w-9 rounded-md bg-background/10 border border-background/20 overflow-hidden flex items-center justify-center shadow-sm">
              {affiliation.organizationAvatarUrl ? (
                <img src={affiliation.organizationAvatarUrl} alt="" className="h-full w-full object-cover" />
              ) : (
                <span className="text-sm font-extrabold text-white">{(affiliation.organizationName || 'ORG').slice(0, 1).toUpperCase()}</span>
              )}
            </div>
            <div className="min-w-0">
              <p className="text-[10px] uppercase tracking-[0.22em] text-white/90 font-semibold">Affiliation officielle</p>
              <h2 className="mt-0.5 text-sm font-extrabold text-white truncate">{affiliation.organizationName || 'Organisation officielle'}</h2>
              <p className="mt-0.5 text-[11px] text-white/80">{affiliation.role ? `Rôle : ${affiliation.role}` : 'Membre affilié'}</p>
            </div>
          </div>
        </div>
        <div className="px-4 pb-2 flex-1">
          <div className="max-w-6xl mx-auto grid grid-cols-3 gap-4 items-center">
            <div className="col-span-2">
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">Affiliation vérifiée</p>
              <p className="mt-1 text-sm leading-6 text-foreground">
                Ce compte est affilié à{' '}
                <span className="font-semibold text-primary">{affiliation.organizationName || 'l\'organisation'}</span>
                . Cette affiliation est confirmée et visible publiquement.
              </p>
            </div>
            <div className="col-span-1 flex justify-end">
              <a
                href={orgUsername ? `/${orgUsername}` : `/profile?org=${affiliation.organizationId}`}
                className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-md hover:brightness-95"
              >
                <ExternalLink className="w-4 h-4" /> Voir l'organisation
              </a>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

// ── Multi-affiliation counter chip (+N) ─────────────────
function MultiAffiliationChip({ affiliations, size }) {
  const s = size === 'sm' ? 20 : 24;
  const iconSize = size === 'sm' ? 10 : 12;
  const extra = affiliations.length - 1;
  const [selectedAff, setSelectedAff] = useState(null);
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={(nextOpen) => { setOpen(nextOpen); if (!nextOpen) setSelectedAff(null); }}>
      <SheetTrigger asChild>
        <button
          title={`${affiliations.length} affiliations officielles`}
          className="inline-flex items-center gap-0.5 transition duration-150 hover:scale-105 focus-visible:outline-none"
        >
          <div
            className="relative flex items-center justify-center rounded-[4px] overflow-hidden"
            style={{ width: s, height: s }}
          >
            {affiliations[0].organizationAvatarUrl ? (
              <img src={affiliations[0].organizationAvatarUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              <span className="w-full h-full flex items-center justify-center bg-primary/20 font-bold text-primary" style={{ fontSize: iconSize }}>
                {(affiliations[0].organizationName || 'ORG').slice(0, 1).toUpperCase()}
              </span>
            )}
          </div>
          <span
            className="font-mono font-bold text-primary rounded-[4px] bg-secondary flex items-center justify-center"
            style={{ fontSize: iconSize - 1, width: s, height: s }}
          >
            +{extra}
          </span>
        </button>
      </SheetTrigger>
      <SheetContent
        side="bottom"
        hideClose
        onPointerDownOutside={() => setOpen(false)}
        className="fixed inset-x-0 bottom-0 w-full h-auto max-h-[80vh] flex flex-col bg-card border-t border-border rounded-t-3xl shadow-2xl overflow-hidden p-0 pb-[calc(env(safe-area-inset-bottom)+0.75rem)]"
      >
        {/* Header */}
        <div className="w-full bg-gradient-to-r from-primary/60 via-primary/40 to-amber-400/20 p-3 px-5 flex items-center gap-3 flex-shrink-0">
          <div className="w-8 h-8 rounded-lg bg-background/10 flex items-center justify-center">
            <Building2 className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-[0.22em] text-white/80 font-semibold">Affiliations officielles</p>
            <p className="text-sm font-extrabold text-white">{affiliations.length} organisations</p>
          </div>
        </div>

        {/* Détail d'une org sélectionnée */}
        {selectedAff ? (
          <div className="flex flex-col flex-1 overflow-hidden">
            <div className="px-5 pt-4 pb-2 flex-shrink-0">
              <button
                onClick={() => setSelectedAff(null)}
                className="text-xs text-primary flex items-center gap-1 mb-4 hover:underline"
              >
                ← Toutes les affiliations
              </button>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-xl bg-secondary border border-border overflow-hidden flex items-center justify-center flex-shrink-0">
                  {selectedAff.organizationAvatarUrl ? (
                    <img src={selectedAff.organizationAvatarUrl} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <span className="font-bold text-primary text-lg">{(selectedAff.organizationName || 'ORG').slice(0, 1).toUpperCase()}</span>
                  )}
                </div>
                <div>
                  <p className="font-grotesk font-bold text-base">{selectedAff.organizationName || 'Organisation'}</p>
                  {selectedAff.role && <p className="text-xs text-muted-foreground">Rôle : {selectedAff.role}</p>}
                </div>
              </div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground mb-1">Affiliation vérifiée</p>
              <p className="text-sm leading-6 text-foreground mb-4">
                Ce compte est affilié à{' '}
                <span className="font-semibold text-primary">{selectedAff.organizationName || 'l\'organisation'}</span>
                . Cette affiliation est confirmée et visible publiquement.
              </p>
              <a
                href={selectedAff.organizationUsername ? `/@${selectedAff.organizationUsername}` : `/profile?org=${selectedAff.organizationId}`}
                className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-md hover:brightness-95"
              >
                <ExternalLink className="w-4 h-4" /> Voir l'organisation
              </a>
            </div>
          </div>
        ) : (
          /* Liste des orgs */
          <div className="overflow-y-auto flex-1 divide-y divide-border">
            {affiliations.map((aff) => (
              <button
                key={aff.id}
                onClick={() => setSelectedAff(aff)}
                className="w-full flex items-center gap-3 px-5 py-3.5 hover:bg-secondary/50 transition-colors text-left"
              >
                <div className="w-10 h-10 rounded-lg bg-secondary border border-border overflow-hidden flex items-center justify-center flex-shrink-0">
                  {aff.organizationAvatarUrl ? (
                    <img src={aff.organizationAvatarUrl} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <span className="font-bold text-primary text-sm">{(aff.organizationName || 'ORG').slice(0, 1).toUpperCase()}</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-foreground truncate">{aff.organizationName || 'Organisation'}</p>
                  {aff.role && <p className="text-xs text-muted-foreground truncate capitalize">{aff.role}</p>}
                  <p className="text-[10px] text-primary mt-0.5">Affiliation vérifiée · Voir les détails →</p>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
              </button>
            ))}
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

/**
 * @param {{ verifications?: Array<string>, size?: string, user?: any|null }} props
 */
export default function VerificationIcons({ verifications = [], size = 'sm', user = null }) {
  const userDescriptor = buildUserDescriptor(user);
  const { affiliations, loading: loadingAffiliation } = useOrganizationAffiliations(userDescriptor);

  const visibleAffiliations = useMemo(
    () => affiliations.filter((a) => a?.status === 'accepted' && a?.visibility === 'public'),
    [affiliations]
  );

  // Pour le badge "certified" lié à affiliation, on prend la principale
  const primaryAffiliation = useMemo(() => getVisibleAffiliation(affiliations), [affiliations]);
  const { user: organizationUser } = useCachedUser(primaryAffiliation?.organizationId);
  const organizationBadge = getOrganizationBadge(organizationUser);

  const displayedVerification = useMemo(() => getHighestVerificationBadge(verifications), [verifications]);
  const displayedVerifications = displayedVerification ? [displayedVerification] : [];

  if (!verifications?.length && !visibleAffiliations.length && !loadingAffiliation) return null;

  const s = size === 'sm' ? 20 : 24;
  const iconSize = size === 'sm' ? 10 : 12;
  const organizationUsername = organizationUser?.username ? `@${organizationUser.username}` : null;

  return (
    <div className="inline-flex items-center gap-1.5">
      {/* Badges de vérification */}
      {displayedVerifications.map(key => {
        const cfg = VERIFICATION_CONFIG[key];
        if (!cfg) return null;
        const fill = bgColorMap[cfg.color] || '#0ea5e9';
        const isInstitutional = key === 'government' || cfg.shape === 'institutional';

        const isAffiliationCertified = key === 'certified' && primaryAffiliation && organizationBadge;
        const affiliationUsername = organizationUsername || primaryAffiliation?.organizationName || 'cette organisation';
        const customBadgeInfo = isAffiliationCertified ? {
          ...cfg,
          description: `Ce compte est Certifié, car c'est un affilié de ${affiliationUsername} sur la plateforme.`,
          short: `Affilié officiel de ${affiliationUsername}.`,
          issuer: 'Affiliation officielle',
          hideAction: true,
          content: (
            <p className="text-sm leading-6 text-foreground">
              Ce compte est <strong>Certifié</strong>, car c'est un affilié de <span className="text-primary">{affiliationUsername}</span> sur la plateforme.
            </p>
          ),
        } : undefined;

        return (
          <BadgePopup key={key} badgeKey={key} badgeInfo={customBadgeInfo}>
            <span
              className="inline-flex items-center justify-center flex-shrink-0 relative"
              style={{ width: s, height: s }}
            >
              <svg viewBox="0 0 24 24" width={s} height={s} style={{ position: 'absolute', inset: 0 }}>
                {isInstitutional ? <rect x="3" y="3" width="18" height="18" rx="4" fill={fill} /> : <path fill={fill} d={TWITTER_SEAL} />}
              </svg>
              <Check style={{ position: 'relative', zIndex: 1, width: iconSize, height: iconSize, color: '#050d1a', strokeWidth: 3.5, flexShrink: 0 }} />
            </span>
          </BadgePopup>
        );
      })}

      {/* Affiliations : 1 → chip simple, 2+ → chip principale + compteur +N */}
      {visibleAffiliations.length === 1 && (
        <AffiliationChip
          affiliation={visibleAffiliations[0]}
          size={size}
          organizationUser={organizationUser}
        />
      )}
      {visibleAffiliations.length > 1 && (
        <MultiAffiliationChip affiliations={visibleAffiliations} size={size} />
      )}
    </div>
  );
}