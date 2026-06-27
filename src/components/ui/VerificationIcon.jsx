import React, { useEffect, useMemo, useState } from 'react';
import { VERIFICATION_CONFIG } from './VerificationChip';
import BadgePopup from './BadgePopup';
import VerificationChip from './VerificationChip';
import { base44 } from '@/api/base44Client';
import { getVisibleAffiliation, getOrganizationBadge } from '@/lib/affiliationUtils';
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
      {verifications.map(key => {
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

        // For the main "verified" badge, use the small anchored popup (BadgePopup)
        if (isVerifiedKey) {
          return (
            <BadgePopup key={key} badgeKey={key}>
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
          <BadgePopup key={key} badgeKey={key}>
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
          <SheetContent side="bottom" className="w-full mx-auto h-[92vh] sm:h-[90vh] lg:h-[86vh] flex flex-col bg-card border border-border rounded-t-[2rem] shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="grid gap-4 px-6 pt-6 pb-4 md:grid-cols-[1fr_auto] md:items-start">
              <div className="flex items-center gap-4">
                <div className="relative flex h-16 w-16 items-center justify-center rounded-3xl bg-primary/10 border border-primary/20 overflow-hidden shadow-sm">
                  {visibleAffiliation.organizationAvatarUrl ? (
                    <img src={visibleAffiliation.organizationAvatarUrl} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-xl font-semibold text-primary">{(visibleAffiliation.organizationName || 'ORG').slice(0, 1).toUpperCase()}</span>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="font-inter text-xs uppercase tracking-[0.28em] text-primary/80">Affiliation organisationnelle</p>
                  <h2 className="mt-2 text-2xl font-bold text-foreground sm:text-3xl">{visibleAffiliation.organizationName || 'Organisation officielle'}</h2>
                  <p className="mt-2 text-sm text-muted-foreground">{visibleAffiliation.role ? `Rôle : ${visibleAffiliation.role}` : 'Membre affilié'}</p>
                  {organizationBadge && (
                    <div className="mt-4 flex flex-wrap items-center gap-2">
                      <VerificationChip type={organizationBadge} size="sm" />
                      <span className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-primary">
                        {organizationBadgeLabel}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              <SheetClose asChild>
                <button className="ml-auto inline-flex h-12 w-12 items-center justify-center rounded-3xl border border-border bg-background text-muted-foreground transition hover:bg-muted hover:text-foreground">
                  ✕
                </button>
              </SheetClose>
            </div>

            {/* Body (scrollable) */}
            <div className="flex-1 overflow-auto px-6 pb-4">
              <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
                <section className="space-y-4 rounded-[2rem] border border-border bg-card p-6 shadow-sm">
                  <div className="space-y-3">
                    <p className="text-sm font-semibold uppercase tracking-[0.22em] text-primary/80">Pourquoi cette affiliation compte</p>
                    <p className="text-base leading-7 text-foreground">
                      Ce compte est officiellement rattaché à l’organisation {visibleAffiliation.organizationName || 'l’organisation officielle'}. Cela renforce la confiance des visiteurs et montre qu’un compte de l’entreprise vérifiée gère cette identité.
                    </p>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-3xl border border-border bg-background p-4">
                      <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Rôle</p>
                      <p className="mt-2 font-semibold text-lg text-foreground">{visibleAffiliation.role || 'Membre'}</p>
                    </div>
                    <div className="rounded-3xl border border-border bg-background p-4">
                      <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Visibilité</p>
                      <p className="mt-2 font-semibold text-lg text-foreground">{visibleAffiliation.visibility === 'public' ? 'Publique' : 'Privée'}</p>
                    </div>
                  </div>

                  <div className="rounded-3xl border border-border bg-background p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Affilié depuis</p>
                    <p className="mt-2 font-semibold text-lg text-foreground">
                      {(() => {
                        const raw = visibleAffiliation.acceptedAt || visibleAffiliation.createdAt || visibleAffiliation.accepted_at || visibleAffiliation.created_at;
                        if (!raw) return 'Date non disponible';
                        try {
                          const d = new Date(raw);
                          return format(d, "d MMM yyyy 'à' HH:mm", { locale: fr });
                        } catch (e) {
                          return 'Date non disponible';
                        }
                      })()}
                    </p>
                  </div>
                </section>

                <aside className="space-y-4 rounded-[2rem] border border-border bg-[#faf9ff] p-6 shadow-sm">
                  <div className="rounded-3xl bg-primary/5 p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Organisation</p>
                    <div className="mt-4 flex flex-col gap-3">
                      <div>
                        <p className="text-sm font-semibold text-foreground">{visibleAffiliation.organizationName || 'Organisation officielle'}</p>
                        {organizationUsername && <p className="text-sm text-muted-foreground">{organizationUsername}</p>}
                      </div>
                      {organizationBadge && (
                        <div className="inline-flex items-center gap-2 rounded-3xl border border-primary/20 bg-primary/10 px-3 py-2 text-sm font-semibold text-primary">
                          <VerificationChip type={organizationBadge} size="sm" />
                          <span>{organizationBadgeLabel}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2 rounded-3xl border border-border bg-background p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">En résumé</p>
                    <ul className="space-y-2 text-sm text-foreground">
                      <li>Compte connecté à une organisation officielle.</li>
                      <li>Vérification basée sur le statut de l’organisation.</li>
                      <li>Visibilité publique pour renforcer la confiance.</li>
                    </ul>
                  </div>
                </aside>
              </div>
            </div>

            {/* Footer (sticky) */}
            <div className="sticky bottom-0 z-10 bg-card border-t border-border p-4 backdrop-blur-xl">
              <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
                <button
                  title={`Affilié officiellement à ${visibleAffiliation.organizationName}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    const profilePath = organizationUsername ? `/${organizationUsername}` : `/profile?org=${visibleAffiliation.organizationId}`;
                    window.location.href = profilePath;
                  }}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-3xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
                >
                  <ExternalLink className="w-4 h-4" /> Voir l’organisation
                </button>
                <SheetClose asChild>
                  <button className="inline-flex w-full items-center justify-center rounded-3xl border border-border bg-background px-4 py-3 text-sm font-semibold text-foreground transition hover:bg-muted">
                    Fermer
                  </button>
                </SheetClose>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      )}
    </div>
  );
}