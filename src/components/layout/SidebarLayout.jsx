import React, { useEffect, useState } from 'react';
import PageTransition from '@/components/layout/PageTransition';
import MainSkeleton from '@/components/layout/MainSkeleton';
import HomeLeftSidebar from '@/components/home/HomeLeftSidebar';
import StickyAdBanner from '@/components/feed/StickyAdBanner';
import { base44 } from '@/api/base44Client';
import { ShieldAlert, X } from 'lucide-react';
import { isRestricted, isSuspended, RESTRICTION_LABELS } from '@/lib/accountStatus';

function RestrictedBanner({ user }) {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;

  const restrictions = user?.restrictions;
  const hasSpecific = restrictions && restrictions.length > 0;

  const isS = isSuspended(user);
  const isR = isRestricted(user);
  if (!isR && !isS) return null;

  const color = isS ? 'amber' : 'orange';
  const title = isS ? 'Compte suspendu' : 'Compte restreint';
  const icon = isS ? '🔶' : '⚠️';

  return (
    <div
      className="sticky top-0 z-50 border-b"
      style={{
        background: isS
          ? 'linear-gradient(135deg, rgba(245,158,11,0.12) 0%, rgba(217,119,6,0.08) 100%)'
          : 'linear-gradient(135deg, rgba(249,115,22,0.12) 0%, rgba(239,68,68,0.08) 100%)',
        borderColor: isS ? 'rgba(245,158,11,0.3)' : 'rgba(249,115,22,0.3)',
        backdropFilter: 'blur(12px)',
      }}
    >
      {/* Top accent line */}
      <div
        className="h-0.5 w-full"
        style={{
          background: isS
            ? 'linear-gradient(90deg, transparent, rgba(245,158,11,0.8), transparent)'
            : 'linear-gradient(90deg, transparent, rgba(249,115,22,0.8), transparent)',
        }}
      />

      <div className="px-4 py-3 flex items-start gap-3">
        {/* Icon */}
        <div
          className="flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center text-base"
          style={{
            background: isS ? 'rgba(245,158,11,0.15)' : 'rgba(249,115,22,0.15)',
            border: isS ? '1px solid rgba(245,158,11,0.3)' : '1px solid rgba(249,115,22,0.3)',
          }}
        >
          {icon}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <ShieldAlert className="w-3.5 h-3.5 flex-shrink-0" style={{ color: isS ? '#f59e0b' : '#f97316' }} />
            <span
              className="font-grotesk font-bold text-sm"
              style={{ color: isS ? '#fcd34d' : '#fdba74' }}
            >
              {title}
            </span>
            {user?.suspension_until && (
              <span
                className="text-[10px] font-mono px-1.5 py-0.5 rounded-full"
                style={{ background: isS ? 'rgba(245,158,11,0.15)' : 'rgba(249,115,22,0.15)', color: isS ? '#fcd34d' : '#fdba74' }}
              >
                jusqu'au {new Date(user.suspension_until).toLocaleDateString('fr-FR')}
              </span>
            )}
          </div>

          {user?.suspension_reason && (
            <p className="text-xs text-muted-foreground mb-1.5 italic">
              « {user.suspension_reason} »
            </p>
          )}

          {/* Restricted actions chips */}
          {isR && hasSpecific && (
            <div className="flex flex-wrap gap-1 mt-1">
              {restrictions.map(r => {
                const cfg = RESTRICTION_LABELS[r];
                if (!cfg) return null;
                return (
                  <span
                    key={r}
                    className="inline-flex items-center gap-1 text-[10px] font-inter px-2 py-0.5 rounded-full"
                    style={{ background: 'rgba(249,115,22,0.12)', border: '1px solid rgba(249,115,22,0.25)', color: '#fdba74' }}
                  >
                    {cfg.emoji} {cfg.label}
                  </span>
                );
              })}
            </div>
          )}
          {isR && !hasSpecific && (
            <p className="text-xs" style={{ color: '#fdba74' }}>
              Publications, réponses, messagerie, likes et forum désactivés.
            </p>
          )}
        </div>

        {/* Dismiss */}
        <button
          onClick={() => setDismissed(true)}
          className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-white/10 transition-all"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

export default function SidebarLayout() {
  const [user, setUser] = useState(undefined);

  useEffect(() => {
    base44.auth.isAuthenticated().then(async authed => {
      if (authed) {
        try { setUser(await base44.auth.me()); } catch { setUser(null); }
      } else {
        setUser(null);
      }
    });
  }, []);

  return (
    <div className="flex min-h-screen" style={{ background: 'hsl(var(--background))' }}>
      <HomeLeftSidebar user={user} />
      <main className="relative flex-1 min-w-0 overflow-x-hidden">
        <RestrictedBanner user={user} />
        <React.Suspense fallback={<MainSkeleton />}>
          <PageTransition />
        </React.Suspense>
        {user && <StickyAdBanner />}
      </main>
    </div>
  );
}