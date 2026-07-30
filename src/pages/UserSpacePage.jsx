import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import {
  UserCircle, Flag, Award, CreditCard, Network, Loader2, Gift,
  ChevronRight, RefreshCw, Inbox, Sparkles, TrendingUp, Eye, Heart, MessageCircle,
} from 'lucide-react';
import ReportTracking from '@/components/dashboard/ReportTracking';
import CertificationTracking from '@/components/dashboard/CertificationTracking';
import BillingTab from '@/components/client/BillingTab';
import MyAffiliationsTab from '@/components/client/MyAffiliationsTab';
import PerkBadges, { getActivePerks } from '@/components/profile/ActivePerks';
import PerkCustomizationPanel from '@/components/profile/PerkCustomizationPanel';
import CreditPill from '@/components/boutique/CreditPill';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { hasAdvancedAnalytics } from '@/lib/subscriptionGating';
import SubscriptionTierBanner from '@/components/boutique/SubscriptionTierBanner';

const TABS = [
  { id: 'reports',     label: 'Signalements',  icon: Flag },
  { id: 'certifs',      label: 'Certifications', icon: Award },
  { id: 'perks',       label: 'Avantages',    icon: Sparkles },
  { id: 'billing',     label: 'Facturation',   icon: CreditCard },
  { id: 'affiliations', label: 'Affiliations', icon: Network },
  { id: 'referral',     label: 'Parrainage',  icon: Gift },
];

const REPORT_STATUS = {
  pending:   { label: 'En attente',  color: 'text-amber-400 bg-amber-400/10 border-amber-400/30' },
  reviewing: { label: 'En examen',   color: 'text-blue-400 bg-blue-400/10 border-blue-400/30' },
  reviewed:  { label: 'Examiné',     color: 'text-blue-400 bg-blue-400/10 border-blue-400/30' },
  resolved:  { label: 'Résolu',      color: 'text-green-400 bg-green-400/10 border-green-400/30' },
  dismissed: { label: 'Rejeté',      color: 'text-red-400 bg-red-400/10 border-red-400/30' },
};

const CERTIF_STATUS = {
  pending:  { label: 'En attente', color: 'text-amber-400 bg-amber-400/10 border-amber-400/30' },
  approved: { label: 'Approuvée',  color: 'text-green-400 bg-green-400/10 border-green-400/30' },
  rejected: { label: 'Refusée',    color: 'text-red-400 bg-red-400/10 border-red-400/30' },
};

const PAYMENT_STATUS = {
  completed: { label: 'Payé',      color: 'text-green-400 bg-green-400/10 border-green-400/30' },
  pending:   { label: 'En attente', color: 'text-amber-400 bg-amber-400/10 border-amber-400/30' },
  failed:    { label: 'Échoué',    color: 'text-red-400 bg-red-400/10 border-red-400/30' },
  refunded:  { label: 'Remboursé', color: 'text-blue-400 bg-blue-400/10 border-blue-400/30' },
};

function EmptyState({ icon: Icon, title, subtitle }) {
  return (
    <div className="text-center py-12 px-4">
      <div className="w-14 h-14 rounded-2xl bg-muted/20 flex items-center justify-center mx-auto mb-3 border border-border">
        <Icon className="w-7 h-7 text-muted-foreground/50" />
      </div>
      <p className="font-grotesk font-semibold text-sm">{title}</p>
      {subtitle && <p className="font-inter text-xs text-muted-foreground mt-1 max-w-xs mx-auto">{subtitle}</p>}
    </div>
  );
}

function ReportsTab({ user, selectedId, onSelect }) {
  const qc = useQueryClient();
  const { data: reports = [], isLoading } = useQuery({
    queryKey: ['my-reports', user.email],
    queryFn: () => base44.entities.Report.filter({ reporter_email: user.email }, '-created_date', 100),
    enabled: !!user?.email,
    staleTime: 0,
    refetchOnMount: true,
  });
  const selected = useMemo(() => reports.find(r => r.id === selectedId) || reports[0] || null, [reports, selectedId]);

  return (
    <div className="grid md:grid-cols-[minmax(0,320px),1fr] gap-4">
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <p className="font-grotesk font-semibold text-sm">Mes signalements ({reports.length})</p>
          <Button variant="ghost" size="icon" className="h-7 w-7"
            onClick={() => qc.invalidateQueries({ queryKey: ['my-reports', user.email] })}>
            <RefreshCw className="w-3.5 h-3.5" />
          </Button>
        </div>
        {isLoading ? (
          <div className="flex justify-center py-10"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>
        ) : reports.length === 0 ? (
          <EmptyState icon={Flag} title="Aucun signalement" subtitle="Vos signalements apparaîtront ici." />
        ) : (
          <div className="max-h-[60vh] overflow-y-auto divide-y divide-border/60">
            {reports.map(r => {
              const s = REPORT_STATUS[r.status] || REPORT_STATUS.pending;
              const active = selected?.id === r.id;
              return (
                <button key={r.id} onClick={() => onSelect(r.id)}
                  className={`w-full text-left px-4 py-3 transition-colors ${active ? 'bg-primary/10' : 'hover:bg-secondary/40'}`}>
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-inter text-sm font-medium truncate">{r.target_name || r.target_email || 'Signalement'}</p>
                    <ChevronRight className={`w-3.5 h-3.5 flex-shrink-0 ${active ? 'text-primary' : 'text-muted-foreground'}`} />
                  </div>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono border ${s.color}`}>{s.label}</span>
                    <span className="font-mono text-[10px] text-muted-foreground capitalize">{r.reason?.replace(/_/g, ' ')}</span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
      <div className="rounded-2xl border border-border bg-card p-4">
        {selected ? <ReportTracking report={selected} /> : <EmptyState icon={Flag} title="Aucun signalement sélectionné" />}
      </div>
    </div>
  );
}

function CertifsTab({ user, selectedId, onSelect }) {
  const qc = useQueryClient();
  const { data: requests = [], isLoading } = useQuery({
    queryKey: ['my-certifs', user.email],
    queryFn: () => base44.entities.CertificationRequest.filter({ user_email: user.email }, '-created_date', 100),
    enabled: !!user?.email,
  });
  const selected = useMemo(() => requests.find(r => r.id === selectedId) || requests[0] || null, [requests, selectedId]);

  return (
    <div className="grid md:grid-cols-[minmax(0,320px),1fr] gap-4">
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <p className="font-grotesk font-semibold text-sm">Mes demandes ({requests.length})</p>
          <Button variant="ghost" size="icon" className="h-7 w-7"
            onClick={() => qc.invalidateQueries({ queryKey: ['my-certifs', user.email] })}>
            <RefreshCw className="w-3.5 h-3.5" />
          </Button>
        </div>
        {isLoading ? (
          <div className="flex justify-center py-10"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>
        ) : requests.length === 0 ? (
          <EmptyState icon={Award} title="Aucune demande de certification" subtitle="Vos demandes apparaîtront ici." />
        ) : (
          <div className="max-h-[60vh] overflow-y-auto divide-y divide-border/60">
            {requests.map(r => {
              const s = CERTIF_STATUS[r.status] || CERTIF_STATUS.pending;
              const p = PAYMENT_STATUS[r.payment_status] || PAYMENT_STATUS.pending;
              const active = selected?.id === r.id;
              return (
                <button key={r.id} onClick={() => onSelect(r.id)}
                  className={`w-full text-left px-4 py-3 transition-colors ${active ? 'bg-primary/10' : 'hover:bg-secondary/40'}`}>
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-inter text-sm font-medium truncate">{r.user_name || 'Demande'}</p>
                    <ChevronRight className={`w-3.5 h-3.5 flex-shrink-0 ${active ? 'text-primary' : 'text-muted-foreground'}`} />
                  </div>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono border ${s.color}`}>{s.label}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono border ${p.color}`}>{p.label}</span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
      <div className="rounded-2xl border border-border bg-card p-4">
        {selected ? <CertificationTracking request={selected} /> : <EmptyState icon={Award} title="Aucune demande sélectionnée" />}
      </div>
    </div>
  );
}

function PerksTab({ user, onRefresh }) {
  const perks = user?.perks || {};
  const active = getActivePerks(perks);
  const hasAnalytics = hasAdvancedAnalytics(perks);

  const [stats, setStats] = useState(null);
  useEffect(() => {
    if (!hasAnalytics || !user?.id) return;
    (async () => {
      try {
        const posts = await base44.entities.Post.filter({ author_id: user.id }, '-created_date', 100);
        const totalViews = posts.reduce((s, p) => s + (p.views_count || 0), 0);
        const totalLikes = posts.reduce((s, p) => s + (p.likes_count || 0), 0);
        const totalReplies = posts.reduce((s, p) => s + (p.replies_count || 0), 0);
        setStats({ posts: posts.length, totalViews, totalLikes, totalReplies });
      } catch {}
    })();
  }, [hasAnalytics, user?.id]);

  return (
    <div className="space-y-4">
      {/* Statut d'abonnement Premium / Business / Enterprise */}
      <SubscriptionTierBanner perks={perks} />

      {/* Active perks badges */}
      <div className="rounded-2xl border border-border bg-card p-5">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-4 h-4 text-primary" />
          <h3 className="font-grotesk font-bold text-sm">Mes avantages actifs</h3>
        </div>
        {active.length === 0 ? (
          <div className="text-center py-8">
            <p className="font-inter text-sm text-muted-foreground">Aucun avantage actif pour le moment.</p>
            <Link to="/boutique" className="inline-flex items-center gap-2 mt-4 px-5 py-2.5 rounded-full bg-primary text-primary-foreground font-grotesk font-bold text-sm hover:bg-primary/90 transition-all">
              Découvrir la boutique
            </Link>
          </div>
        ) : (
          <PerkBadges perks={perks} size="md" />
        )}
      </div>

      {/* Analytics panel (only if analytics_adv perk active) */}
      {hasAnalytics && (
        <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/5 p-5">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-4 h-4 text-cyan-400" />
            <h3 className="font-grotesk font-bold text-sm text-cyan-400">Analytics avancées</h3>
            <span className="ml-auto font-mono text-[10px] text-muted-foreground/60">
              {Math.max(0, Math.ceil((new Date(perks.analytics_until).getTime() - Date.now()) / 86400000))}j restants
            </span>
          </div>
          {stats ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'Publications', value: stats.posts, icon: Sparkles, color: 'text-primary' },
                { label: 'Vues totales', value: stats.totalViews, icon: Eye, color: 'text-cyan-400' },
                { label: "J'aimes", value: stats.totalLikes, icon: Heart, color: 'text-rose-400' },
                { label: 'Réponses', value: stats.totalReplies, icon: MessageCircle, color: 'text-blue-400' },
              ].map(s => {
                const Icon = s.icon;
                return (
                  <div key={s.label} className="rounded-xl border border-border bg-card/60 p-3 text-center">
                    <Icon className={`w-4 h-4 mx-auto mb-1.5 ${s.color}`} />
                    <p className="font-grotesk font-black text-2xl text-foreground">{s.value.toLocaleString('fr-FR')}</p>
                    <p className="font-inter text-[10px] text-muted-foreground mt-0.5">{s.label}</p>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex justify-center py-6"><Loader2 className="w-5 h-5 animate-spin text-cyan-400" /></div>
          )}
        </div>
      )}

      {/* Personnalisation des perks (couleurs, badge, son, watermark…) */}
      <PerkCustomizationPanel user={user} onSaved={onRefresh} />

      {/* Link to boutique */}
      <div className="rounded-2xl border border-primary/30 bg-primary/5 p-5 text-center">
        <p className="font-grotesk font-bold text-sm mb-1">Gagnez plus d'avantages</p>
        <p className="font-inter text-xs text-muted-foreground mb-4">
          Vous avez <span className="font-bold text-primary">{user?.referral_credits || 0} crédits</span> à dépenser.
        </p>
        <Link to="/boutique" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary text-primary-foreground font-grotesk font-bold text-sm hover:bg-primary/90 transition-all">
          Ouvrir la boutique
        </Link>
      </div>
    </div>
  );
}

export default function UserSpacePage() {
  const [user, setUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [tab, setTab] = useState('reports');
  const [selReport, setSelReport] = useState(null);
  const [selCertif, setSelCertif] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const t = params.get('tab');
    if (t && TABS.some(x => x.id === t)) setTab(t);
    base44.auth.isAuthenticated().then(async authed => {
      if (authed) setUser(await base44.auth.me());
      setAuthChecked(true);
    });
  }, []);

  const refreshUser = async () => {
    try { setUser(await base44.auth.me()); } catch {}
  };

  if (!authChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center px-5">
        <div className="text-center space-y-4 max-w-sm">
          <div className="w-16 h-16 rounded-2xl bg-muted/20 flex items-center justify-center mx-auto border border-border">
            <UserCircle className="w-8 h-8 text-muted-foreground/60" />
          </div>
          <div>
            <h2 className="font-grotesk font-bold text-xl">Espace Utilisateur</h2>
            <p className="text-sm text-muted-foreground mt-2">Connectez-vous pour accéder à votre espace personnel.</p>
          </div>
          <Button onClick={() => base44.auth.redirectToLogin('/espace')} className="w-full gap-2">Se connecter</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-16 md:pt-20 min-h-screen pb-20">
      <div className="max-w-5xl mx-auto px-4 lg:px-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 mb-6">
          <div className="w-11 h-11 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
            <UserCircle className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="font-grotesk font-bold text-xl md:text-2xl">Espace Utilisateur</h1>
            <p className="font-inter text-xs text-muted-foreground mt-0.5">
              Suivez vos signalements, certifications et facturations.
            </p>
          </div>
          <div className="ml-auto"><CreditPill credits={user?.referral_credits} /></div>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-1 overflow-x-auto scrollbar-hide pb-2 mb-5 -mx-4 px-4 md:mx-0 md:px-0">
          {TABS.map(t => {
            const Icon = t.icon;
            const active = tab === t.id;
            return (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-full font-inter text-sm whitespace-nowrap flex-shrink-0 border transition-all ${
                  active
                    ? 'bg-primary text-primary-foreground border-primary font-medium'
                    : 'border-border text-muted-foreground hover:text-foreground hover:bg-secondary/40'
                }`}>
                <Icon className="w-3.5 h-3.5" /> {t.label}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          <motion.div key={tab}
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}>
            {tab === 'reports' && <ReportsTab user={user} selectedId={selReport} onSelect={setSelReport} />}
            {tab === 'certifs' && <CertifsTab user={user} selectedId={selCertif} onSelect={setSelCertif} />}
            {tab === 'perks' && <PerksTab user={user} onRefresh={refreshUser} />}
            {tab === 'billing' && (
              <div className="rounded-2xl border border-border bg-card p-4">
                <BillingTab />
              </div>
            )}
            {tab === 'referral' && (
              <div className="rounded-2xl border border-border bg-card p-6 text-center">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-4 sky-glow">
                  <Gift className="w-7 h-7 text-primary" />
                </div>
                <h3 className="font-grotesk font-bold text-lg mb-1">Programme de parrainage Eza</h3>
                <p className="font-inter text-sm text-muted-foreground mb-1">Vous avez <span className="font-bold text-primary">{user.referral_credits || 0} crédits</span> de parrainage.</p>
                <p className="font-inter text-xs text-muted-foreground mb-5">Invitez vos amis et échangez vos crédits contre des récompenses exclusives.</p>
                <Link to="/parrainage" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary text-primary-foreground font-grotesk font-bold text-sm hover:bg-primary/90 transition-all">
                  Gérer mon parrainage
                </Link>
              </div>
            )}
            {tab === 'affiliations' && (
              <div className="rounded-2xl border border-border bg-card p-4">
                <MyAffiliationsTab user={user} />
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}