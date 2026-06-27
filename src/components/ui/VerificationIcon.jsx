import React, { useEffect, useMemo, useState } from 'react';
import { VERIFICATION_CONFIG } from './VerificationChip';
import BadgePopup from './BadgePopup';
import { base44 } from '@/api/base44Client';
import { getVisibleAffiliation } from '@/lib/affiliationUtils';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
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

export default function VerificationIcons({ verifications = [], size = 'sm', user = null }) {
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
        <Popover>
          <PopoverTrigger asChild>
            <button className="inline-flex items-center justify-center rounded-full border border-primary/20 bg-background/70 p-1 shadow-sm transition-opacity hover:opacity-80">
              {visibleAffiliation.organizationAvatarUrl ? (
                <img src={visibleAffiliation.organizationAvatarUrl} alt={visibleAffiliation.organizationName || 'Organisation'} className="h-4 w-4 rounded-full object-cover" />
              ) : (
                <span className="text-[10px] font-semibold text-primary">{(visibleAffiliation.organizationName || 'ORG').slice(0, 1).toUpperCase()}</span>
              )}
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-72 p-0 overflow-hidden">
            <div className="p-4 border-b border-border bg-secondary/40">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 border border-primary/20 overflow-hidden">
                  {visibleAffiliation.organizationAvatarUrl ? (
                    <img src={visibleAffiliation.organizationAvatarUrl} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-sm font-semibold text-primary">{(visibleAffiliation.organizationName || 'ORG').slice(0, 1).toUpperCase()}</span>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="font-grotesk font-semibold text-sm truncate">{visibleAffiliation.organizationName || 'Organisation'}</p>
                  <p className="font-inter text-[11px] text-muted-foreground">Rôle : {visibleAffiliation.role || 'member'}</p>
                </div>
              </div>
            </div>
            <div className="p-4 space-y-3 text-sm">
              <div className="flex items-center justify-between text-muted-foreground">
                <span>Badge</span>
                <span className="text-foreground">Officiel / Suprême</span>
              </div>
              <div className="flex items-center justify-between text-muted-foreground">
                <span>Rôle</span>
                <span className="text-foreground">{visibleAffiliation.role || 'member'}</span>
              </div>
              <div className="flex items-center justify-between text-muted-foreground">
                <span>Affilié depuis</span>
                <span className="text-foreground">{visibleAffiliation.acceptedAt ? format(new Date(visibleAffiliation.acceptedAt), 'd MMM yyyy', { locale: fr }) : '—'}</span>
              </div>
              <button className="flex items-center gap-2 text-sm text-primary hover:underline">
                <ExternalLink className="w-3.5 h-3.5" /> Voir l’organisation
              </button>
            </div>
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
}