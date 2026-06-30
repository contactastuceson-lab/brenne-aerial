import React, { useEffect, useMemo, useState } from 'react';
import { VERIFICATION_CONFIG } from './VerificationChip';
import BadgePopup from './BadgePopup';
import VerificationChip from './VerificationChip';
import { base44 } from '@/api/base44Client';
import { getVisibleAffiliation, getOrganizationBadge, getHighestVerificationBadge } from '@/lib/affiliationUtils';
import { Sheet, SheetContent, SheetTrigger, SheetClose } from '@/components/ui/sheet';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { ExternalLink } from 'lucide-react';

const bgColorMap = {
  'text-sky-400':     '#0ea5e9',
  'text-amber-400':   '#f59e0b',
  'text-purple-400':  '#a855f7',
  'text-emerald-400': '#10b981',
  'text-yellow-300':  '#f59e0b',
};

// Path exact du badge Twitter/X verified (seal shape officiel)
const TWITTER_SEAL = "M22.25 12c0-1.43-.88-2.67-2.19-3.34.46-1.39.2-2.9-.81-3.91s-2.52-1.27-3.91-.81c-.66-1.31-1.91-2.19-3.34-2.19s-2.67.88-3.33 2.19c-1.4-.46-2.91-.2-3.92.81s-1.26 2.52-.8 3.91C3.38 9.33 2.5 10.57 2.5 12s.88 2.67 2.19 3.34c-.46 1.39-.2 2.9.81 3.91s2.52 1.26 3.91.8c.66 1.31 1.9 2.19 3.33 2.19s2.68-.88 3.34-2.19c1.39.46 2.9.2 3.91-.81s1.27-2.52.81-3.91c1.31-.67 2.19-1.91 2.19-3.34z";

/**
 * @param {{ verifications?: Array<string>, size?: string, user?: any|null }} props
 */
export default function VerificationIcons({ verifications = [], size = 'sm', user = null }) {
  const [affiliations, setAffiliations] = useState(/** @type {Array<any>} */([]));
  const [loadingAffiliation, setLoadingAffiliation] = useState(false);

  useEffect(() => {
    let active = true;
    const load = async () => {
      const safeUser = /** @type {any} */ (user);
      if (!safeUser) return;
      setLoadingAffiliation(true);
      try {
        const [byId, byEmail] = await Promise.all([
          safeUser.id ? base44.entities.OrganizationAffiliation.filter({ userId: safeUser.id }, '-createdAt', 50) : [],
          safeUser.email ? base44.entities.OrganizationAffiliation.filter({ userId: safeUser.email }, '-createdAt', 50) : [],
        ]);
        const rows = [...(byId || []), ...(byEmail || [])];
        const uniqueAffiliations = Array.from(new Map(rows.map((row) => [row.id, row])).values());
        if (active) setAffiliations(uniqueAffiliations);
      } catch (error) {
        console.error(error);
      } finally {
        if (active) setLoadingAffiliation(false);
      }
    };
    load();
    return () => { active = false; };
  }, [user?.id, user?.email]);

  const visibleAffiliations = useMemo(
    () => affiliations.filter((affiliation) => affiliation?.status === 'accepted' && affiliation?.visibility === 'public'),
    [affiliations]
  );
  const visibleAffiliation = useMemo(() => getVisibleAffiliation(affiliations), [affiliations]);
  const affiliationCount = visibleAffiliations.length;
  const displayedVerification = useMemo(() => getHighestVerificationBadge(verifications), [verifications]);
  const displayedVerifications = displayedVerification ? [displayedVerification] : [];
  const [organizationUser, setOrganizationUser] = useState(/** @type {any|null} */(null));
  const [organizationBadge, setOrganizationBadge] = useState(/** @type {'supreme'|'official'|null} */(null));

  useEffect(() => {
    let active = true;
    const loadOrganization = async () => {
      if (!visibleAffiliation?.organizationId) {
        setOrganizationUser(null);
        setOrganizationBadge(null);
        return;
      }

      try {
        const org = await base44.entities.User.get(visibleAffiliation.organizationId);
        if (!active) return;
        setOrganizationUser(org);
        setOrganizationBadge(getOrganizationBadge(org));
      } catch (error) {
        console.error('Failed to load organization details', error);
        if (active) {
          setOrganizationUser(null);
          setOrganizationBadge(null);
        }
      }
    };

    loadOrganization();
    return () => { active = false; };
  }, [visibleAffiliation]);

  if (!verifications?.length && !visibleAffiliation && !loadingAffiliation) return null;

  const s = size === 'sm' ? 20 : 24;
  const iconSize = size === 'sm' ? 10 : 12;
  const organizationBadgeLabel = organizationBadge === 'supreme' ? 'Suprême' : 'Officiel';
  const organizationUsername = organizationUser && /** @type {any} */ (organizationUser).username ? `@${/** @type {any} */ (organizationUser).username}` : null;

  return (
    <div className="inline-flex items-center gap-1.5">
      {displayedVerifications.map(key => {
        const badgeKey = /** @type {keyof typeof VERIFICATION_CONFIG} */ (key);
        const cfg = VERIFICATION_CONFIG[badgeKey];
        if (!cfg) return null;
        const Icon = cfg.icon;
        const isSupreme = key === 'supreme';
        const isGold = 'gradient' in cfg && cfg.gradient;
        const fill = bgColorMap[/** @type {keyof typeof bgColorMap} */ (cfg.color)] || '#0ea5e9';

        // Detect a 'vérifié' style badge (handle French/English keys/labels)
        const labelNorm = (cfg.label || '').normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();
        const isVerifiedKey = ['verified', 'verifie', 'verif'].includes((key || '').toLowerCase()) || labelNorm.includes('verif');

        const isAffiliationCertified = key === 'certified' && visibleAffiliation && organizationBadge;
        const affiliationUsername = organizationUsername || visibleAffiliation?.organizationName || 'cette organisation';
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

        // For the main "verified" badge, use the small anchored popup (BadgePopup)
        if (isVerifiedKey) {
          return (
            <BadgePopup key={key} badgeKey={key} badgeInfo={customBadgeInfo}>
              <span
                className="inline-flex items-center justify-center flex-shrink-0 relative"
                style={{
                  width: s,
                  height: s,
                  filter: isSupreme ? 'drop-shadow(0 0 6px rgba(245,158,11,0.9)) drop-shadow(0 0 12px rgba(245,158,11,0.5))' : 'none',
                }}
              >
                <svg viewBox="0 0 24 24" width={s} height={s} style={{ position: 'absolute', inset: 0 }}>
                  <path fill={fill} d={TWITTER_SEAL} />
                </svg>
                <span style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon
                    style={{ width: iconSize, height: iconSize, color: isGold ? '#451a03' : '#050d1a', strokeWidth: 3, flexShrink: 0 }}
                  />
                </span>
              </span>
            </BadgePopup>
          );
        }

        return (
          <BadgePopup key={key} badgeKey={key} badgeInfo={customBadgeInfo}>
            <span
              className="inline-flex items-center justify-center flex-shrink-0 relative"
              style={{
                width: s,
                height: s,
                filter: isSupreme ? 'drop-shadow(0 0 6px rgba(245,158,11,0.9)) drop-shadow(0 0 12px rgba(245,158,11,0.5))' : 'none',
              }}
            >
              <svg
                viewBox="0 0 24 24"
                width={s}
                height={s}
                style={{ position: 'absolute', inset: 0 }}
              >
                <path fill={fill} d={TWITTER_SEAL} />
              </svg>
              <span style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon
                  style={{
                    width: iconSize,
                    height: iconSize,
                    color: isGold ? '#451a03' : '#050d1a',
                    strokeWidth: 3,
                    flexShrink: 0,
                  }}
                />
              </span>
            </span>
          </BadgePopup>
        );
      })}

      {visibleAffiliation && (
        <Sheet>
          <SheetTrigger asChild>
            <button
              title={`Affilié officiellement à ${visibleAffiliation.organizationName}`}
              className="inline-flex items-center justify-center rounded-md p-0.5 bg-gradient-to-br from-primary/40 via-primary/30 to-primary/20 shadow-sm transition duration-200 ease-out hover:scale-[1.08] hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <div className="relative flex items-center justify-center rounded-md bg-background border border-border overflow-hidden transition duration-200 ease-out hover:scale-[1.05] hover:brightness-105" style={{ width: s, height: s }}>
                {visibleAffiliation.organizationAvatarUrl ? (
                  <img src={visibleAffiliation.organizationAvatarUrl} alt={visibleAffiliation.organizationName || 'Organisation'} className="h-full w-full object-cover" />
                ) : (
                  <span className="font-semibold text-primary" style={{ fontSize: iconSize }}>{(visibleAffiliation.organizationName || 'ORG').slice(0, 1).toUpperCase()}</span>
                )}
              </div>
            </button>
          </SheetTrigger>
          <SheetContent
            side="bottom"
            hideClose
            className="fixed inset-x-0 bottom-0 w-full h-auto min-h-[22vh] max-h-[70vh] flex flex-col bg-card border-t border-border rounded-t-3xl shadow-2xl overflow-hidden p-0 pb-[calc(env(safe-area-inset-bottom)+0.75rem)]"
          >
            {/* Official header */}
            <div className="w-full bg-gradient-to-r from-primary/60 via-primary/40 to-amber-400/20 p-2">
              <div className="max-w-6xl mx-auto flex items-center gap-3 px-3">
                <div className="h-9 w-9 rounded-md bg-background/10 border border-background/20 overflow-hidden flex items-center justify-center shadow-sm">
                  {visibleAffiliation.organizationAvatarUrl ? (
                    <img src={visibleAffiliation.organizationAvatarUrl} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-sm font-extrabold text-white">{(visibleAffiliation.organizationName || 'ORG').slice(0, 1).toUpperCase()}</span>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] uppercase tracking-[0.22em] text-white/90 font-semibold">Affiliation officielle</p>
                  <h2 className="mt-0.5 text-sm font-extrabold text-white truncate">{visibleAffiliation.organizationName || 'Organisation officielle'}</h2>
                  <p className="mt-0.5 text-[11px] text-white/80">{visibleAffiliation.role ? `Rôle : ${visibleAffiliation.role}` : 'Membre affilié'}</p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="px-4 pb-2 flex-1">
              <div className="max-w-6xl mx-auto grid grid-cols-3 gap-4 items-center">
                <div className="col-span-2">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">Affiliation vérifiée</p>
                  <p className="mt-1 text-sm leading-6 text-foreground">
                    Ce compte est affilié à{' '}
                    <span className="font-semibold text-primary">{visibleAffiliation.organizationName || 'l’organisation'}</span>
                    . Cette affiliation est confirmée et visible publiquement.
                  </p>
                </div>
                <div className="col-span-1 flex justify-end">
                  <a
                    href={organizationUsername ? `/${organizationUsername}` : `/profile?org=${visibleAffiliation.organizationId}`}
                    className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-md hover:brightness-95"
                  >
                    <ExternalLink className="w-4 h-4" /> Voir l’organisation
                  </a>
                </div>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      )}
    </div>
  );
}