import React, { useState, useEffect } from 'react';
import { usePageEnabled } from '@/hooks/usePageEnabled';
import FeatureDisabled from '@/components/shared/FeatureDisabled';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FolderOpen, Download, FileVideo, FileImage, FileText, File,
  Lock, LogIn, ChevronDown, ChevronUp, Award,
  CheckCircle, Clock, XCircle, AlertCircle, Plus, ArrowRight,
  Rocket, MapPin, Calendar, Shield, Zap, User, Users, Settings, Flag,
  CreditCard, ExternalLink, Loader2, UserCircle, Briefcase
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import BadgeChip from '@/components/ui/BadgeChip';
import CertificationTracking from '@/components/dashboard/CertificationTracking';
import ReportTracking from '@/components/dashboard/ReportTracking';
import QuoteTracking from '@/components/dashboard/QuoteTracking';
import OrganizationAffiliationsTab from '@/components/client/OrganizationAffiliationsTab';
import MyAffiliationsTab from '@/components/client/MyAffiliationsTab';
import { canManageAffiliations as canManageUserAffiliations } from '@/lib/affiliationUtils';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Link, useSearchParams } from 'react-router-dom';

/* ─── constants ─────────────────────────────────────── */
const FILE_ICONS = { photo: FileImage, video: FileVideo, rapport: FileText, attestation: FileText, autre: File };
const FILE_COLORS = { photo: 'text-blue-400', video: 'text-purple-400', rapport: 'text-green-400', attestation: 'text-amber-400', autre: 'text-muted-foreground' };
const FILE_BG = { photo: 'bg-blue-400/10', video: 'bg-purple-400/10', rapport: 'bg-green-400/10', attestation: 'bg-amber-400/10', autre: 'bg-muted/10' };

const QUOTE_STATUS = {
  pending:   { label: 'En attente',  color: 'text-amber-400',  bg: 'bg-amber-400/10',  border: 'border-amber-400/20',  icon: Clock },
  reviewing: { label: 'En examen',   color: 'text-blue-400',   bg: 'bg-blue-400/10',   border: 'border-blue-400/20',   icon: AlertCircle },
  accepted:  { label: 'Accepté',     color: 'text-green-400',  bg: 'bg-green-400/10',  border: 'border-green-400/20',  icon: CheckCircle },
  refused:   { label: 'Refusé',      color: 'text-red-400',    bg: 'bg-red-400/10',    border: 'border-red-400/20',    icon: XCircle },
  completed: { label: 'Terminé',     color: 'text-primary',    bg: 'bg-primary/10',    border: 'border-primary/20',    icon: CheckCircle },
};

const SERVICE_LABELS = {
  video_evenement: 'Vidéo événement', inspection_toiture: 'Inspection toiture',
  suivi_chantier: 'Suivi chantier', captation_particulier: 'Captation particulier',
  captation_entreprise: 'Captation entreprise', retour_temps_reel: 'Retour temps réel', autre: 'Autre',
};

/* ─── Main tabs ─────────────────────────────────────── */
const MAIN_TABS = [
  { id: 'social', label: 'Mon Compte', icon: UserCircle },
  { id: 'business', label: 'Business', icon: Briefcase },
];

/* ─── Sub-tabs ──────────────────────────────────────── */
const SOCIAL_SUB = [
  { id: 'badges',     label: 'Badges',           icon: Award },
  { id: 'certs',      label: 'Certifications',   icon: Shield },
  { id: 'my-affils',  label: 'Mes affiliations', icon: Users },
  { id: 'reports',    label: 'Signalements',     icon: Flag },
  { id: 'billing',    label: 'Facturation',      icon: CreditCard },
];

const BUSINESS_SUB = [
  { id: 'overview',  label: 'Vue d\'ensemble', icon: Zap },
  { id: 'quotes',    label: 'Mes devis',        icon: FileText },
  { id: 'files',     label: 'Mes fichiers',     icon: FolderOpen },
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

function MissionFolder({ mission, files }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="rounded-xl border border-zinc-800/50 overflow-hidden">
      <button onClick={() => setOpen(v => !v)}
        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/3 transition-colors group">
        <FolderOpen className="w-4 h-4 text-primary flex-shrink-0" />
        <div className="flex-1 text-left min-w-0">
          <p className="font-inter font-medium text-sm truncate">{mission}</p>
          <p className="font-inter text-xs text-muted-foreground">{files.length} fichier{files.length > 1 ? 's' : ''}</p>
        </div>
        {files[0]?.mission_date && (
          <span className="font-mono text-[11px] text-muted-foreground flex-shrink-0">
            {format(new Date(files[0].mission_date), 'd MMM yyyy', { locale: fr })}
          </span>
        )}
        {open ? <ChevronUp className="w-3.5 h-3.5 text-muted-foreground" /> : <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
            <div className="border-t border-zinc-800/50 divide-y divide-zinc-800/30">
              {files.map(file => {
                const Icon = FILE_ICONS[file.file_type] || File;
                return (
                  <div key={file.id} className="flex items-center gap-3 px-4 py-2.5 hover:bg-white/2 transition-colors">
                    <Icon className={`w-4 h-4 flex-shrink-0 ${FILE_COLORS[file.file_type] || 'text-muted-foreground'}`} />
                    <div className="flex-1 min-w-0">
                      <p className="font-inter text-sm truncate">{file.file_name}</p>
                      {file.description && <p className="font-inter text-xs text-muted-foreground truncate">{file.description}</p>}
                    </div>
                    {file.file_size_mb && (
                      <span className="font-mono text-[11px] text-muted-foreground flex-shrink-0">{file.file_size_mb} Mo</span>
                    )}
                    <a href={file.file_url} target="_blank" rel="noopener noreferrer">
                      <Button size="sm" variant="outline" className="h-7 gap-1.5 text-xs px-3 border-zinc-700 hover:border-cyan-400/40 hover:text-cyan-400 transition-all flex-shrink-0">
                        <Download className="w-3 h-3" /> Télécharger
                      </Button>
                    </a>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function QuoteCard({ q, onExpand, expanded }) {
  const s = QUOTE_STATUS[q.status] || QUOTE_STATUS.pending;
  const StatusIcon = s.icon;
  return (
    <div className="border-b border-zinc-800/40 last:border-0">
      <button onClick={onExpand} className="w-full flex items-start gap-4 py-4 hover:bg-white/2 transition-colors px-1 text-left">
        <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${s.color.replace('text-', 'bg-')}`} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className={`inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full ${s.bg} ${s.color} border ${s.border}`}>
              <StatusIcon className="w-2.5 h-2.5" />
              {s.label}
            </span>
            {q.prix_final && <span className="text-[11px] font-mono text-cyan-400 font-semibold">{q.prix_final}€</span>}
          </div>
          <p className="font-inter font-medium text-sm">{SERVICE_LABELS[q.service_type] || q.service_type?.replace(/_/g, ' ')}</p>
          {q.location && (
            <p className="font-inter text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
              <MapPin className="w-3 h-3" /> {q.location}
            </p>
          )}
        </div>
        <div className="text-right flex-shrink-0">
          <p className="font-mono text-[11px] text-muted-foreground">
            {q.created_date ? format(new Date(q.created_date), 'd MMM yy', { locale: fr }) : ''}
          </p>
          {q.prix_estime && !q.prix_final && (
            <p className="font-mono text-xs text-muted-foreground mt-0.5">~{q.prix_estime}€</p>
          )}
        </div>
      </button>
      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="px-4 pb-4">
            <QuoteTracking quote={q} />
          </motion.div>
        )}
      </AnimatePresence>
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
  const [expandedQuote, setExpandedQuote] = useState(null);
  const [billingLoading, setBillingLoading] = useState(false);

  const mainTab = searchParams.get('main') || 'social';
  const subTab = searchParams.get('tab') || (mainTab === 'social' ? 'badges' : 'overview');
  const canManageAffiliations = canManageUserAffiliations(user);

  const setMainTab = (t) => {
    const defaultSub = t === 'social' ? 'badges' : 'overview';
    setSearchParams({ main: t, tab: defaultSub }, { replace: true });
  };
  const setSubTab = (t) => setSearchParams({ main: mainTab, tab: t }, { replace: true });

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

  const { data: files = [], isLoading: filesLoading } = useQuery({
    queryKey: ['client-files', user?.email],
    queryFn: () => base44.entities.ClientFile.filter({ client_email: user.email }, '-mission_date'),
    enabled: !!user?.email,
  });
  const { data: myQuotes = [] } = useQuery({
    queryKey: ['my-quotes', user?.email],
    queryFn: () => base44.entities.Quote.filter({ client_email: user.email }, '-created_date', 20),
    enabled: !!user?.email,
  });
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

  const missions = files.reduce((acc, f) => {
    if (!acc[f.mission_name]) acc[f.mission_name] = [];
    acc[f.mission_name].push(f);
    return acc;
  }, {});

  const activeQuotes = myQuotes.filter(q => ['pending', 'reviewing', 'accepted'].includes(q.status));
  const completedQuotes = myQuotes.filter(q => q.status === 'completed');

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

      {/* ── Main tabs ── */}
      <div className="border-b border-zinc-800/60 px-4 lg:px-8">
        <div className="max-w-3xl mx-auto flex gap-0">
          {MAIN_TABS.map(t => (
            <button key={t.id} onClick={() => setMainTab(t.id)}
              className={`flex items-center gap-2 px-5 py-3.5 text-sm font-inter font-medium border-b-2 transition-all ${
                mainTab === t.id
                  ? 'border-primary text-foreground'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}>
              <t.icon className="w-4 h-4" />
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Layout ── */}
      <div className="max-w-3xl mx-auto px-4 lg:px-8 py-6 flex flex-col lg:flex-row gap-6">

        {/* Sub-nav — desktop */}
        <aside className="hidden lg:flex flex-col gap-0.5 w-44 flex-shrink-0">
          {(mainTab === 'social' ? socialSubs : BUSINESS_SUB).map(n => (
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
          {(mainTab === 'social' ? socialSubs : BUSINESS_SUB).map(n => (
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

              {/* ── OVERVIEW (Business) ── */}
              {subTab === 'overview' && (
                <div>
                  {/* Stats mini */}
                  <div className="grid grid-cols-3 gap-3 mb-6">
                    {[
                      { label: 'Missions', value: Object.keys(missions).length, color: 'text-primary' },
                      { label: 'Devis actifs', value: activeQuotes.length, color: 'text-amber-400' },
                      { label: 'Terminés', value: completedQuotes.length, color: 'text-green-400' },
                    ].map(s => (
                      <div key={s.label} className="rounded-xl border border-zinc-800/50 p-3 text-center">
                        <p className={`font-grotesk font-bold text-2xl ${s.color}`}>{s.value}</p>
                        <p className="font-inter text-xs text-muted-foreground mt-0.5">{s.label}</p>
                      </div>
                    ))}
                  </div>

                  {activeQuotes.length > 0 && (
                    <Section title="Devis en cours" action={
                      <button onClick={() => setSubTab('quotes')} className="text-xs text-cyan-400 hover:underline flex items-center gap-1">
                        Voir tout <ArrowRight className="w-3 h-3" />
                      </button>
                    }>
                      {activeQuotes.slice(0, 3).map(q => (
                        <QuoteCard key={q.id} q={q}
                          expanded={expandedQuote === q.id}
                          onExpand={() => setExpandedQuote(expandedQuote === q.id ? null : q.id)} />
                      ))}
                    </Section>
                  )}

                  {Object.keys(missions).length > 0 && (
                    <Section title="Dernières missions" action={
                      <button onClick={() => setSubTab('files')} className="text-xs text-cyan-400 hover:underline flex items-center gap-1">
                        Voir tout <ArrowRight className="w-3 h-3" />
                      </button>
                    }>
                      <div className="space-y-2">
                        {Object.entries(missions).slice(0, 2).map(([mission, mFiles]) => (
                          <MissionFolder key={mission} mission={mission} files={mFiles} />
                        ))}
                      </div>
                    </Section>
                  )}

                  {activeQuotes.length === 0 && Object.keys(missions).length === 0 && (
                    <EmptyState icon={Rocket} title="Aucune mission pour l'instant"
                      desc="Demandez un devis pour démarrer votre première mission."
                      cta="Demander un devis" to="/quote" />
                  )}
                </div>
              )}

              {/* ── DEVIS (Business) ── */}
              {subTab === 'quotes' && (
                <Section title="Mes devis" action={
                  <Link to="/quote">
                    <Button size="sm" variant="outline" className="border-zinc-700 text-cyan-400 hover:border-cyan-400/40 hover:bg-cyan-400/5 gap-1.5 text-xs">
                      <Plus className="w-3 h-3" /> Nouveau
                    </Button>
                  </Link>
                }>
                  {myQuotes.length === 0 ? (
                    <EmptyState icon={FileText} title="Aucun devis"
                      desc="Faites votre première demande et recevez un devis sous 24h."
                      cta="Demander un devis" to="/quote" />
                  ) : (
                    myQuotes.map(q => (
                      <QuoteCard key={q.id} q={q}
                        expanded={expandedQuote === q.id}
                        onExpand={() => setExpandedQuote(expandedQuote === q.id ? null : q.id)} />
                    ))
                  )}
                </Section>
              )}

              {/* ── FICHIERS (Business) ── */}
              {subTab === 'files' && (
                <Section title="Mes fichiers" action={
                  <span className="font-mono text-xs text-muted-foreground">{files.length} fichier{files.length !== 1 ? 's' : ''}</span>
                }>
                  {filesLoading ? (
                    <div className="flex justify-center py-10">
                      <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    </div>
                  ) : Object.keys(missions).length === 0 ? (
                    <EmptyState icon={FolderOpen} title="Aucun fichier"
                      desc="Vos fichiers de missions apparaîtront ici dès que votre pilote les aura déposés."
                      cta="Commander une mission" to="/quote" />
                  ) : (
                    <div className="space-y-2">
                      {Object.entries(missions).map(([mission, mFiles]) => (
                        <MissionFolder key={mission} mission={mission} files={mFiles} />
                      ))}
                    </div>
                  )}
                </Section>
              )}

            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}