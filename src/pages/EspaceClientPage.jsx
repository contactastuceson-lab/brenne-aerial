import React, { useState, useEffect } from 'react';
import { usePageEnabled } from '@/hooks/usePageEnabled';
import FeatureDisabled from '@/components/shared/FeatureDisabled';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Lock, LogIn, Award, Shield, Users, Settings, Flag,
  CreditCard, ExternalLink, Loader2, Plus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import BadgeChip from '@/components/ui/BadgeChip';
import CertificationTracking from '@/components/dashboard/CertificationTracking';
import ReportTracking from '@/components/dashboard/ReportTracking';
import OrganizationAffiliationsTab from '@/components/client/OrganizationAffiliationsTab';
import MyAffiliationsTab from '@/components/client/MyAffiliationsTab';
import { canManageAffiliations as canManageUserAffiliations } from '@/lib/affiliationUtils';
import { Link, useSearchParams } from 'react-router-dom';



/* ─── Sub-tabs ──────────────────────────────────────── */
const SOCIAL_SUB = [
  { id: 'badges',     label: 'Badges',           icon: Award },
  { id: 'certs',      label: 'Certifications',   icon: Shield },
  { id: 'my-affils',  label: 'Mes affiliations', icon: Users },
  { id: 'reports',    label: 'Signalements',     icon: Flag },
  { id: 'billing',    label: 'Facturation',      icon: CreditCard },
];

/* ─── sub-components ────────────────────────────────── */
function Section({ title, children, action }) {
  return (
    <div className="py-5 border-b border-zinc-800/50 last:border-0">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-grotesk font-semibold text-sm text-foreground">{title}</h3>
        {action}
      </div>
      {children}
    </div>
  );
}

function EmptyState({ icon: Icon, title, desc, cta, to }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center space-y-3">
      <Icon className="w-7 h-7 text-muted-foreground/30" />
      <div>
        <p className="font-inter font-medium text-sm">{title}</p>
        <p className="font-inter text-xs text-muted-foreground mt-1 max-w-xs">{desc}</p>
      </div>
      {cta && to && (
        <Link to={to}>
          <Button size="sm" variant="outline" className="border-zinc-700 text-cyan-400 hover:border-cyan-400/40 hover:bg-cyan-400/5 gap-1.5 mt-1">
            <Plus className="w-3.5 h-3.5" /> {cta}
          </Button>
        </Link>
      )}
    </div>
  );
}

/* ─── main page ─────────────────────────────────────── */
export default function EspaceClientPage() {
  const { enabled, isLoading: checkingEnabled } = usePageEnabled('page_espace_client_enabled');
  const [user, setUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const [billingLoading, setBillingLoading] = useState(false);

  const subTab = searchParams.get('tab') || 'badges';
  const canManageAffiliations = canManageUserAffiliations(user);

  const setSubTab = (t) => setSearchParams({ tab: t }, { replace: true });

  const openBillingPortal = async () => {
    setBillingLoading(true);
    try {
      const res = await base44.functions.invoke('getStripePortalUrl', {});
      if (res.data?.url) window.open(res.data.url, '_blank');
      else alert(res.data?.error || 'Impossible d\'accéder au portail.');
    } catch (e) {
      alert('Erreur : ' + e.message);
    } finally {
      setBillingLoading(false);
    }
  };

  useEffect(() => {
    base44.auth.isAuthenticated().then(async (authed) => {
      if (authed) setUser(await base44.auth.me());
      setAuthChecked(true);
    });
  }, []);

  const { data: myCertifications = [] } = useQuery({
    queryKey: ['my-certifications', user?.email],
    queryFn: () => base44.entities.CertificationRequest.filter({ user_email: user.email }, '-created_date', 5),
    enabled: !!user?.email,
  });
  const { data: myReports = [] } = useQuery({
    queryKey: ['my-reports', user?.email],
    queryFn: () => base44.entities.Report.filter({ reporter_email: user.email }, '-created_date', 30),
    enabled: !!user?.email,
  });

  if (checkingEnabled) return null;
  if (!enabled) return <FeatureDisabled title="Espace Client indisponible" message="L'espace client est temporairement désactivé." />;

  if (!authChecked) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!user) return (
    <div className="min-h-screen flex items-center justify-center px-5">
      <div className="text-center space-y-6 max-w-sm">
        <div className="w-16 h-16 rounded-2xl bg-white/4 border border-zinc-800 flex items-center justify-center mx-auto">
          <Lock className="w-7 h-7 text-primary" />
        </div>
        <div className="space-y-2">
          <h2 className="font-grotesk font-bold text-2xl">Espace Client</h2>
          <p className="font-inter text-sm text-muted-foreground leading-relaxed">
            Connectez-vous pour accéder à vos certifications, badges, affiliations et missions.
          </p>
        </div>
        <Button onClick={() => base44.auth.redirectToLogin('/espace-client')}
          className="bg-primary text-primary-foreground gap-2 font-grotesk font-semibold w-full rounded-xl h-11">
          <LogIn className="w-4 h-4" /> Se connecter
        </Button>
      </div>
    </div>
  );

  const socialSubs = canManageAffiliations
    ? [...SOCIAL_SUB, { id: 'affiliations', label: 'Gérer affiliations', icon: Users }]
    : SOCIAL_SUB;

  return (
    <div className="min-h-screen bg-black">
      {/* ── Header compact ── */}
      <div className="border-b border-zinc-800/60 px-4 lg:px-8 py-5">
        <div className="max-w-3xl mx-auto flex items-center gap-4">
          <div className="w-11 h-11 rounded-full overflow-hidden border border-zinc-700 flex-shrink-0 bg-primary/10 flex items-center justify-center">
            {user.avatar_url
              ? <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
              : <span className="font-grotesk font-bold text-primary">{user.full_name?.[0]?.toUpperCase() || 'U'}</span>
            }
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-grotesk font-semibold text-base leading-tight">{user.full_name}</p>
            <p className="font-mono text-xs text-muted-foreground">{user.email}</p>
          </div>
          <Link to="/profile">
            <Button size="sm" variant="outline" className="border-zinc-700 text-xs gap-1.5 hover:border-zinc-600">
              <Settings className="w-3.5 h-3.5" /> Profil
            </Button>
          </Link>
        </div>
      </div>

      {/* ── Layout ── */}
      <div className="max-w-3xl mx-auto px-4 lg:px-8 py-6 flex flex-col lg:flex-row gap-6">

        {/* Sub-nav — desktop */}
        <aside className="hidden lg:flex flex-col gap-0.5 w-44 flex-shrink-0">
          {socialSubs.map(n => (
            <button key={n.id} onClick={() => setSubTab(n.id)}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-inter transition-all text-left ${
                subTab === n.id
                  ? 'bg-white/6 text-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-white/3'
              }`}>
              <n.icon className="w-3.5 h-3.5 flex-shrink-0" />
              {n.label}
            </button>
          ))}
        </aside>

        {/* Mobile sub-nav */}
        <div className="lg:hidden flex gap-1 overflow-x-auto pb-1 -mx-1 px-1">
          {socialSubs.map(n => (
            <button key={n.id} onClick={() => setSubTab(n.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-inter whitespace-nowrap flex-shrink-0 transition-all border ${
                subTab === n.id
                  ? 'bg-white/6 text-foreground border-zinc-700'
                  : 'text-muted-foreground border-transparent hover:border-zinc-800'
              }`}>
              <n.icon className="w-3 h-3" />
              {n.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <main className="flex-1 min-w-0">
          <AnimatePresence mode="wait">
            <motion.div key={subTab} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>

              {/* ── BADGES ── */}
              {subTab === 'badges' && (
                <Section title="Mes badges">
                  {!user.badges?.length ? (
                    <EmptyState icon={Award} title="Aucun badge pour l'instant"
                      desc="Les badges s'obtiennent en participant à la communauté." />
                  ) : (
                    <div className="flex flex-wrap gap-3">
                      {user.badges.map(b => <BadgeChip key={b} badge={b} size="lg" />)}
                    </div>
                  )}
                </Section>
              )}

              {/* ── CERTIFICATIONS ── */}
              {subTab === 'certs' && (
                <Section title="Certifications" action={
                  <Link to="/profile">
                    <Button size="sm" variant="outline" className="border-zinc-700 text-cyan-400 hover:border-cyan-400/40 hover:bg-cyan-400/5 gap-1.5 text-xs">
                      <Plus className="w-3 h-3" /> Demander
                    </Button>
                  </Link>
                }>
                  {myCertifications.length === 0 ? (
                    <EmptyState icon={Shield} title="Aucune certification"
                      desc="Obtenez une certification officielle pour valoriser vos compétences." />
                  ) : (
                    <CertificationTracking request={myCertifications[0]} />
                  )}
                </Section>
              )}

              {/* ── MES AFFILIATIONS ── */}
              {subTab === 'my-affils' && (
                <Section title="Mes affiliations">
                  <MyAffiliationsTab user={user} />
                </Section>
              )}

              {/* ── GÉRER AFFILIATIONS ── */}
              {subTab === 'affiliations' && (
                <Section title="Gérer les affiliations">
                  <OrganizationAffiliationsTab user={user} />
                </Section>
              )}

              {/* ── SIGNALEMENTS ── */}
              {subTab === 'reports' && (
                <Section title="Mes signalements">
                  {myReports.length === 0 ? (
                    <EmptyState icon={Flag} title="Aucun signalement"
                      desc="Vos signalements envoyés à la modération apparaîtront ici." />
                  ) : (
                    <div className="space-y-4">
                      {myReports.map(r => (
                        <div key={r.id} className="border border-zinc-800/50 rounded-xl p-4">
                          <ReportTracking report={r} />
                        </div>
                      ))}
                    </div>
                  )}
                </Section>
              )}

              {/* ── FACTURATION ── */}
              {subTab === 'billing' && (
                <div>
                  <Section title="Abonnements">
                    {myCertifications.filter(c => c.payment_status === 'completed').length === 0 ? (
                      <EmptyState icon={CreditCard} title="Aucun abonnement actif"
                        desc="Vos abonnements de certification apparaîtront ici." />
                    ) : (
                      <div className="space-y-2">
                        {myCertifications.filter(c => c.payment_status === 'completed').map(cert => (
                          <div key={cert.id} className="flex items-center gap-3 py-3 border-b border-zinc-800/40 last:border-0">
                            <Shield className="w-4 h-4 text-primary flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="font-inter text-sm font-medium">
                                Certification — {cert.responses?.badge_requested || 'Badge'}
                              </p>
                              <p className="font-mono text-[11px] text-muted-foreground mt-0.5">
                                {cert.status === 'approved' ? '✓ Approuvé' : cert.status === 'pending' ? '⏳ En attente' : '✕ Refusé'}
                              </p>
                            </div>
                            <span className={`text-[11px] font-mono px-2 py-0.5 rounded-full border ${
                              cert.status === 'approved' ? 'bg-green-400/10 text-green-400 border-green-400/20' :
                              'bg-amber-400/10 text-amber-400 border-amber-400/20'
                            }`}>
                              {cert.status === 'approved' ? 'Actif' : 'En cours'}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </Section>

                  <Section title="Portail Stripe">
                    <p className="font-inter text-sm text-muted-foreground mb-4 leading-relaxed">
                      Gérez vos abonnements, consultez vos factures et mettez à jour votre moyen de paiement.
                    </p>
                    <Button onClick={openBillingPortal} disabled={billingLoading}
                      variant="outline" className="border-zinc-700 text-cyan-400 hover:border-cyan-400/40 hover:bg-cyan-400/5 gap-2">
                      {billingLoading
                        ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Chargement…</>
                        : <><ExternalLink className="w-3.5 h-3.5" /> Gérer mes abonnements</>
                      }
                    </Button>
                  </Section>
                </div>
              )}

            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}