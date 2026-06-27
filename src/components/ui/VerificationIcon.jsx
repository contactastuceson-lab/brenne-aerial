import React, { useEffect, useMemo, useState } from 'react';
import { VERIFICATION_CONFIG } from './VerificationChip';
import BadgePopup from './BadgePopup';
import { base44 } from '@/api/base44Client';
import { getVisibleAffiliation } from '@/lib/affiliationUtils';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetTrigger, SheetClose } from '@/components/ui/sheet';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const bgColorMap = {
  'text-sky-400':     '#0ea5e9',
  'text-amber-400':   '#f59e0b',
  'text-purple-400':  '#a855f7',
  'text-emerald-400': '#10b981',
  'text-yellow-300':  '#f59e0b',
};

// Path exact du badge Twitter/X verified (seal shape officiel)
const TWITTER_SEAL = "M22.25 12c0-1.43-.88-2.67-2.19-3.34.46-1.39.2-2.9-.81-3.91s-2.52-1.27-3.91-.81c-.66-1.31-1.91-2.19-3.34-2.19s-2.67.88-3.33 2.19c-1.4-.46-2.91-.2-3.92.81s-1.26 2.52-.8 3.91C3.38 9.33 2.5 10.57 2.5 12s.88 2.67 2.19 3.34c-.46 1.39-.2 2.9.81 3.91s2.52 1.26 3.91.8c.66 1.31 1.9 2.19 3.33 2.19s2.68-.88 3.34-2.19c1.39.46 2.9.2 3.91-.81s1.27-2.52.81-3.91c1.31-.67 2.19-1.91 2.19-3.34z";

export default function VerificationIcons({ verifications = [], size = 'sm', user = null }) {
  const navigate = useNavigate();
  const [affiliations, setAffiliations] = useState([]);
  const [loadingAffiliation, setLoadingAffiliation] = useState(false);

  useEffect(() => {
    let active = true;
    const load = async () => {
      if (!user) return;
      setLoadingAffiliation(true);
      try {
        const [byId, byEmail] = await Promise.all([
          user.id ? base44.entities.OrganizationAffiliation.filter({ userId: user.id }, '-createdAt', 50) : [],
          user.email ? base44.entities.OrganizationAffiliation.filter({ userId: user.email }, '-createdAt', 50) : [],
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

  const visibleAffiliation = useMemo(() => getVisibleAffiliation(affiliations), [affiliations]);

  if (!verifications?.length && !visibleAffiliation && !loadingAffiliation) return null;

  const s = size === 'sm' ? 20 : 24;
  const iconSize = size === 'sm' ? 10 : 12;

  return (
    <div className="inline-flex items-center gap-1.5">
      {verifications.map(key => {
        const cfg = VERIFICATION_CONFIG[key];
        if (!cfg) return null;
        const Icon = cfg.icon;
        const isSupreme = key === 'supreme';
        const isGold = cfg.gradient;
        const fill = bgColorMap[cfg.color] || '#0ea5e9';

        // Detect a 'vérifié' style badge (handle French/English keys/labels)
        const labelNorm = (cfg.label || '').normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();
        const isVerifiedKey = ['verified', 'verifie', 'verif'].includes((key || '').toLowerCase()) || labelNorm.includes('verif');

        // For the main "verified" badge, open a full-sheet modal that slides from bottom
        if (isVerifiedKey) {
          return (
            <Sheet key={key}>
              <SheetTrigger asChild>
                <button
                  className="inline-flex items-center justify-center flex-shrink-0 relative"
                  style={{ width: s, height: s }}
                >
                  <svg viewBox="0 0 24 24" width={s} height={s} style={{ position: 'absolute', inset: 0 }}>
                    <path fill={fill} d={TWITTER_SEAL} />
                  </svg>
                  <span style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon
                      style={{ width: iconSize, height: iconSize, color: isGold ? '#451a03' : '#050d1a', strokeWidth: 3, flexShrink: 0 }}
                    />
                  </span>
                </button>
              </SheetTrigger>

              <SheetContent side="bottom" className="min-h-screen md:min-h-[60vh] rounded-t-3xl border-t border-border p-4 overflow-auto">
                <div className="mx-auto max-w-2xl">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-full flex items-center justify-center"
                           style={cfg.gradient ? { background: 'linear-gradient(135deg, #f59e0b, #fde68a, #b45309)' } : { background: fill }}>
                        <Icon className="w-8 h-8 text-white" />
                      </div>
                      <div>
                        <h3 className="font-grotesk font-bold text-xl">{cfg.label}</h3>
                        <p className="text-sm text-muted-foreground">{cfg.description}</p>
                      </div>
                    </div>
                    <SheetClose asChild>
                      <button className="rounded-full border border-border bg-background/90 p-2 text-muted-foreground">✕</button>
                    </SheetClose>
                  </div>

                  <div className="mt-6 bg-card border border-border rounded-2xl p-4">
                    <p className="font-inter text-base text-muted-foreground leading-relaxed">
                      {cfg.description}
                    </p>
                    <div className="mt-6">
                      <a href="#" className="inline-flex w-full items-center justify-center gap-2 rounded-3xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground">Plus d'infos</a>
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
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
            <button className="inline-flex items-center justify-center rounded-md p-0.5 bg-gradient-to-br from-primary/40 via-primary/30 to-primary/20 shadow-sm transition-transform hover:scale-[1.02]">
              <div className="relative flex items-center justify-center rounded-md bg-background border border-border overflow-hidden" style={{ width: s, height: s }}>
                {visibleAffiliation.organizationAvatarUrl ? (
                  <img src={visibleAffiliation.organizationAvatarUrl} alt={visibleAffiliation.organizationName || 'Organisation'} className="h-full w-full object-cover" />
                ) : (
                  <span className="font-semibold text-primary" style={{ fontSize: iconSize }}>{(visibleAffiliation.organizationName || 'ORG').slice(0, 1).toUpperCase()}</span>
                )}
              </div>
            </button>
          </SheetTrigger>
          <SheetContent side="bottom" className="w-full max-w-3xl mx-auto h-[80vh] sm:h-[60vh] lg:h-[55vh] sm:max-h-[85vh] flex flex-col bg-card border border-border rounded-2xl shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="px-6 pt-6 pb-2 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-primary/10 border border-primary/20 overflow-hidden">
                  {visibleAffiliation.organizationAvatarUrl ? (
                    <img src={visibleAffiliation.organizationAvatarUrl} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-lg font-semibold text-primary">{(visibleAffiliation.organizationName || 'ORG').slice(0, 1).toUpperCase()}</span>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="font-grotesk font-bold text-lg leading-tight">Affiliation organisationnelle</p>
                  <p className="font-inter text-sm text-muted-foreground mt-1">{visibleAffiliation.organizationName || 'Organisation officielle'}</p>
                </div>
              </div>
              <SheetClose asChild>
                <button className="rounded-full border border-border bg-background/90 p-2 text-muted-foreground transition hover:bg-muted hover:text-foreground">✕</button>
              </SheetClose>
            </div>

            {/* Body (scrollable) */}
            <div className="px-6 pb-4 overflow-auto flex-1 space-y-4 bg-background">
              <div className="rounded-3xl bg-primary/10 border border-primary/20 p-4">
                <p className="font-grotesk font-semibold text-base">Ce compte est affilié à l’organisation</p>
                <p className="font-inter text-sm text-foreground mt-2">{visibleAffiliation.organizationName || 'Brenne Aerial France'}</p>
                <p className="font-inter text-sm text-muted-foreground mt-1">Organisation officielle{visibleAffiliation.role ? ` · ${visibleAffiliation.role}` : ''}</p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-3xl border border-border bg-card p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Rôle</p>
                  <p className="mt-2 font-grotesk font-semibold text-lg text-foreground">{visibleAffiliation.role || 'member'}</p>
                </div>
                <div className="rounded-3xl border border-border bg-card p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Visibilité</p>
                  <p className="mt-2 font-grotesk font-semibold text-lg text-foreground">{visibleAffiliation.visibility === 'public' ? 'Publique' : 'Privée'}</p>
                </div>
              </div>
              <div className="rounded-3xl border border-border bg-card p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Affilié depuis</p>
                <p className="mt-2 font-grotesk font-semibold text-lg text-foreground">
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
            </div>

            {/* Footer (sticky) */}
            <div className="sticky bottom-0 bg-card border-t border-border p-4">
              <div className="grid grid-cols-1 gap-2">
                <button
                  onClick={async (e) => {
                    e.stopPropagation();
                    try {
                      const orgId = visibleAffiliation.organizationId;
                      if (!orgId) return;
                      const org = await base44.entities.User.get(orgId);
                      const username = org?.username;
                      if (username) window.location.href = `/@${username}`;
                      else window.location.href = `/profile?org=${orgId}`;
                    } catch (err) {
                      console.error('Failed to open organization profile', err);
                    }
                  }}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-3xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
                >
                  <ExternalLink className="w-4 h-4" /> Voir l’organisation
                </button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      )}
    </div>
  );
}