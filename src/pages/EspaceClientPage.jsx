import React, { useState, useEffect } from 'react';
import { usePageEnabled } from '@/hooks/usePageEnabled';
import FeatureDisabled from '@/components/shared/FeatureDisabled';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FolderOpen, Download, FileVideo, FileImage, FileText, File,
  Lock, LogIn, ChevronDown, ChevronUp, Award,
  CheckCircle, Clock, XCircle, AlertCircle, Plus, ArrowRight,
  Rocket, MapPin, Calendar, Shield, Zap, User, Settings, Flag
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import BadgeChip from '@/components/ui/BadgeChip';
import CertificationTracking from '@/components/dashboard/CertificationTracking';
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

const NAV = [
  { id: 'overview', label: 'Vue d\'ensemble', icon: Zap },
  { id: 'files',    label: 'Mes fichiers',     icon: FolderOpen },
  { id: 'quotes',   label: 'Mes devis',         icon: FileText },
  { id: 'certs',    label: 'Certifications',    icon: Shield },
  { id: 'badges',   label: 'Badges',            icon: Award },
  { id: 'reports',  label: 'Mes signalements',  icon: Flag },
];

const REPORT_STATUS = {
  pending:   { label: 'En attente',  color: 'text-amber-400',  bg: 'bg-amber-400/10',  border: 'border-amber-400/20',  icon: Clock },
  reviewing: { label: 'En examen',   color: 'text-blue-400',   bg: 'bg-blue-400/10',   border: 'border-blue-400/20',   icon: AlertCircle },
  resolved:  { label: 'Résolu',      color: 'text-green-400',  bg: 'bg-green-400/10',  border: 'border-green-400/20',  icon: CheckCircle },
  dismissed: { label: 'Rejeté',      color: 'text-red-400',    bg: 'bg-red-400/10',    border: 'border-red-400/20',    icon: XCircle },
};

/* ─── sub-components ────────────────────────────────── */
function StatCard({ icon: Icon, label, value, color, bg }) {
  return (
    <motion.div whileHover={{ y: -2 }} className="p-4 rounded-2xl bg-card border border-border flex items-center gap-4">
      <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center flex-shrink-0`}>
        <Icon className={`w-5 h-5 ${color}`} />
      </div>
      <div>
        <p className="font-grotesk font-bold text-xl leading-none">{value}</p>
        <p className="font-inter text-xs text-muted-foreground mt-0.5">{label}</p>
      </div>
    </motion.div>
  );
}

function MissionFolder({ mission, files }) {
  const [open, setOpen] = useState(true);
  return (
    <motion.div layout className="rounded-2xl border border-border overflow-hidden bg-card">
      <button onClick={() => setOpen(v => !v)}
        className="w-full flex items-center gap-4 px-5 py-4 hover:bg-secondary/40 transition-colors group">
        <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
          <FolderOpen className="w-4 h-4 text-primary" />
        </div>
        <div className="flex-1 text-left min-w-0">
          <p className="font-grotesk font-semibold text-sm truncate">{mission}</p>
          <p className="font-inter text-xs text-muted-foreground">{files.length} fichier{files.length > 1 ? 's' : ''}</p>
        </div>
        {files[0]?.mission_date && (
          <span className="font-mono text-[11px] text-muted-foreground px-2 py-0.5 rounded-lg bg-secondary/50 flex-shrink-0">
            {format(new Date(files[0].mission_date), 'd MMM yyyy', { locale: fr })}
          </span>
        )}
        <div className="w-6 h-6 rounded-lg bg-secondary/50 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/10 transition-colors">
          {open ? <ChevronUp className="w-3 h-3 text-muted-foreground" /> : <ChevronDown className="w-3 h-3 text-muted-foreground" />}
        </div>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
            <div className="border-t border-border divide-y divide-border/60">
              {files.map(file => {
                const Icon = FILE_ICONS[file.file_type] || File;
                return (
                  <div key={file.id} className="flex items-center gap-3 px-5 py-3 bg-background/60 hover:bg-card/80 transition-colors">
                    <div className={`w-8 h-8 rounded-lg ${FILE_BG[file.file_type] || 'bg-muted/10'} flex items-center justify-center flex-shrink-0`}>
                      <Icon className={`w-4 h-4 ${FILE_COLORS[file.file_type] || 'text-muted-foreground'}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-inter text-sm font-medium truncate">{file.file_name}</p>
                      {file.description && <p className="font-inter text-xs text-muted-foreground truncate">{file.description}</p>}
                    </div>
                    {file.file_size_mb && (
                      <span className="font-mono text-[11px] text-muted-foreground flex-shrink-0">{file.file_size_mb} Mo</span>
                    )}
                    <a href={file.file_url} target="_blank" rel="noopener noreferrer">
                      <Button size="sm" variant="outline" className="h-7 gap-1.5 text-xs px-3 border-border hover:border-primary/40 hover:bg-primary/5 hover:text-primary transition-all flex-shrink-0">
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
    </motion.div>
  );
}

function QuoteCard({ q }) {
  const s = QUOTE_STATUS[q.status] || QUOTE_STATUS.pending;
  const StatusIcon = s.icon;
  return (
    <motion.div whileHover={{ y: -1 }} className={`p-5 rounded-2xl bg-card border ${s.border} relative overflow-hidden`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className={`inline-flex items-center gap-1.5 text-[11px] font-inter font-medium px-2 py-0.5 rounded-full ${s.bg} ${s.color} border ${s.border}`}>
              <StatusIcon className="w-3 h-3" />
              {s.label}
            </span>
            {q.prix_final && (
              <span className="text-[11px] font-mono text-primary font-semibold">{q.prix_final}€</span>
            )}
          </div>
          <p className="font-grotesk font-bold text-base leading-tight">
            {SERVICE_LABELS[q.service_type] || q.service_type?.replace(/_/g, ' ')}
          </p>
          {q.location && (
            <p className="font-inter text-xs text-muted-foreground mt-1 flex items-center gap-1">
              <MapPin className="w-3 h-3" /> {q.location}
            </p>
          )}
          {q.admin_notes && (
            <p className="font-inter text-xs text-muted-foreground mt-2 p-2 rounded-lg bg-secondary/50 border border-border italic">
              💬 {q.admin_notes}
            </p>
          )}
        </div>
        <div className="text-right flex-shrink-0">
          <p className="font-mono text-[11px] text-muted-foreground">
            {q.created_date ? format(new Date(q.created_date), 'd MMM yy', { locale: fr }) : ''}
          </p>
          {q.date_souhaitee && (
            <p className="font-mono text-[11px] text-primary mt-1 flex items-center gap-1 justify-end">
              <Calendar className="w-3 h-3" /> {q.date_souhaitee}
            </p>
          )}
          {q.prix_estime && !q.prix_final && (
            <p className="font-mono text-xs text-muted-foreground mt-1">~{q.prix_estime}€</p>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function EmptyState({ icon: Icon, title, desc, cta, to }) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-16 text-center space-y-4">
      <div className="w-16 h-16 rounded-2xl bg-primary/5 border border-primary/10 flex items-center justify-center">
        <Icon className="w-8 h-8 text-primary/30" />
      </div>
      <div>
        <p className="font-grotesk font-bold text-base">{title}</p>
        <p className="font-inter text-sm text-muted-foreground mt-1 max-w-xs">{desc}</p>
      </div>
      {cta && to && (
        <Link to={to}>
          <Button className="bg-primary text-primary-foreground gap-2 rounded-xl font-grotesk font-semibold">
            <Plus className="w-4 h-4" /> {cta}
          </Button>
        </Link>
      )}
    </motion.div>
  );
}

/* ─── main page ─────────────────────────────────────── */
export default function EspaceClientPage() {
  const { enabled, isLoading: checkingEnabled } = usePageEnabled('page_espace_client_enabled');
  const [user, setUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'overview';

  const setTab = (t) => setSearchParams({ tab: t }, { replace: true });

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
      <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!user) return (
    <div className="pt-16 min-h-screen grid-bg flex items-center justify-center px-5">
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        className="text-center space-y-8 max-w-sm">
        <div className="relative mx-auto w-24 h-24">
          <div className="w-24 h-24 rounded-3xl bg-primary/10 border border-primary/20 flex items-center justify-center">
            <Lock className="w-11 h-11 text-primary" />
          </div>
          <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-primary animate-pulse" />
        </div>
        <div className="space-y-2">
          <h2 className="font-grotesk font-bold text-3xl">Espace Client</h2>
          <p className="font-inter text-sm text-muted-foreground leading-relaxed">
            Connectez-vous pour accéder à vos missions, devis, certifications et bien plus.
          </p>
        </div>
        <Button onClick={() => base44.auth.redirectToLogin('/espace-client')}
          className="bg-primary text-primary-foreground gap-2 font-grotesk font-semibold w-full rounded-xl h-11 text-base sky-glow">
          <LogIn className="w-4 h-4" /> Se connecter
        </Button>
      </motion.div>
    </div>
  );

  return (
    <div className="pt-16 min-h-screen bg-background">
      {/* ── Hero banner ── */}
      <div className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 grid-bg opacity-40" />
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
        <div className="relative max-w-6xl mx-auto px-5 lg:px-10 py-8 lg:py-10">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            {/* Avatar */}
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-primary/20 border-2 border-primary/40 flex items-center justify-center overflow-hidden sky-glow">
                {user.avatar_url
                  ? <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
                  : <span className="font-grotesk font-black text-primary text-2xl">{user.full_name?.[0]?.toUpperCase() || 'U'}</span>
                }
              </div>
              <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-green-400 border-2 border-background" />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <p className="font-inter text-xs text-primary font-medium tracking-widest uppercase mb-0.5">Espace Client</p>
              <h1 className="font-grotesk font-black text-2xl lg:text-3xl gradient-text">
                Bonjour, {user.full_name?.split(' ')[0]} 👋
              </h1>
              <p className="font-mono text-xs text-muted-foreground mt-0.5">{user.email}</p>
              {user.badges?.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {user.badges.map(b => <BadgeChip key={b} badge={b} />)}
                </div>
              )}
            </div>

            {/* CTA */}
            <div className="flex gap-2 flex-shrink-0">
              <Link to="/profile">
                <Button size="sm" variant="outline" className="border-border gap-1.5 font-inter">
                  <User className="w-3.5 h-3.5" /> Mon profil
                </Button>
              </Link>
              <Link to="/quote">
                <Button size="sm" className="bg-primary text-primary-foreground gap-1.5 font-grotesk font-semibold">
                  <Plus className="w-3.5 h-3.5" /> Nouveau devis
                </Button>
              </Link>
            </div>
          </div>

          {/* Quick stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
            <StatCard icon={FolderOpen}  label="Missions"     value={Object.keys(missions).length}  color="text-primary"    bg="bg-primary/10" />
            <StatCard icon={FileText}    label="Devis actifs" value={activeQuotes.length}            color="text-amber-400"  bg="bg-amber-400/10" />
            <StatCard icon={CheckCircle} label="Terminés"     value={completedQuotes.length}         color="text-green-400"  bg="bg-green-400/10" />
            <StatCard icon={Award}       label="Badges"       value={user.badges?.length || 0}       color="text-purple-400" bg="bg-purple-400/10" />
          </div>
        </div>
      </div>

      {/* ── Layout ── */}
      <div className="max-w-6xl mx-auto px-5 lg:px-10 py-8 flex flex-col lg:flex-row gap-6">

        {/* Sidebar nav — desktop */}
        <aside className="hidden lg:flex flex-col gap-1 w-52 flex-shrink-0">
          {NAV.map(n => (
            <button key={n.id} onClick={() => setTab(n.id)}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-inter transition-all text-left ${
                activeTab === n.id
                  ? 'bg-primary/10 text-primary border border-primary/20 font-medium'
                  : 'text-muted-foreground hover:bg-card hover:text-foreground'
              }`}>
              <n.icon className="w-4 h-4 flex-shrink-0" />
              {n.label}
            </button>
          ))}

          <div className="mt-4 pt-4 border-t border-border">
            <Link to="/quote">
              <button className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-inter text-muted-foreground hover:bg-card hover:text-foreground transition-all w-full text-left">
                <Plus className="w-4 h-4 flex-shrink-0" />
                Nouveau devis
              </button>
            </Link>
            <Link to="/profile">
              <button className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-inter text-muted-foreground hover:bg-card hover:text-foreground transition-all w-full text-left">
                <Settings className="w-4 h-4 flex-shrink-0" />
                Mon compte
              </button>
            </Link>
          </div>
        </aside>

        {/* Mobile nav */}
        <div className="lg:hidden flex gap-1 overflow-x-auto pb-1 -mx-1 px-1">
          {NAV.map(n => (
            <button key={n.id} onClick={() => setTab(n.id)}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-inter whitespace-nowrap flex-shrink-0 transition-all ${
                activeTab === n.id
                  ? 'bg-primary/10 text-primary border border-primary/20 font-medium'
                  : 'text-muted-foreground hover:bg-card border border-transparent'
              }`}>
              <n.icon className="w-3.5 h-3.5" />
              {n.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <main className="flex-1 min-w-0">
          <AnimatePresence mode="wait">
            <motion.div key={activeTab} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.18 }}>

              {/* OVERVIEW */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  <h2 className="font-grotesk font-bold text-lg">Vue d'ensemble</h2>

                  {activeQuotes.length > 0 && (
                    <div>
                      <p className="font-inter text-xs text-muted-foreground uppercase tracking-wider font-medium mb-3">Devis en cours</p>
                      <div className="space-y-3">
                        {activeQuotes.slice(0, 3).map(q => <QuoteCard key={q.id} q={q} />)}
                        {activeQuotes.length > 3 && (
                          <button onClick={() => setTab('quotes')} className="text-xs text-primary font-inter hover:underline flex items-center gap-1">
                            Voir tous les devis <ArrowRight className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  {Object.keys(missions).length > 0 && (
                    <div>
                      <p className="font-inter text-xs text-muted-foreground uppercase tracking-wider font-medium mb-3">Dernières missions</p>
                      <div className="space-y-2">
                        {Object.entries(missions).slice(0, 2).map(([mission, mFiles]) => (
                          <MissionFolder key={mission} mission={mission} files={mFiles} />
                        ))}
                        {Object.keys(missions).length > 2 && (
                          <button onClick={() => setTab('files')} className="text-xs text-primary font-inter hover:underline flex items-center gap-1 mt-1">
                            Voir tous les fichiers <ArrowRight className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  {activeQuotes.length === 0 && Object.keys(missions).length === 0 && (
                    <div className="p-8 rounded-2xl bg-card border border-dashed border-border text-center space-y-4">
                      <div className="w-12 h-12 rounded-2xl bg-primary/5 flex items-center justify-center mx-auto">
                        <Rocket className="w-6 h-6 text-primary/40" />
                      </div>
                      <div>
                        <p className="font-grotesk font-bold">Démarrez votre première mission</p>
                        <p className="font-inter text-sm text-muted-foreground mt-1">Demandez un devis et votre pilote prendra contact avec vous.</p>
                      </div>
                      <Link to="/quote">
                        <Button className="bg-primary text-primary-foreground gap-2 rounded-xl font-grotesk">
                          <Plus className="w-4 h-4" /> Demander un devis
                        </Button>
                      </Link>
                    </div>
                  )}

                  {myCertifications.length > 0 && (
                    <div>
                      <p className="font-inter text-xs text-muted-foreground uppercase tracking-wider font-medium mb-3">Certification</p>
                      <div className="bg-card border border-border rounded-2xl p-5">
                        <CertificationTracking request={myCertifications[0]} />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* FILES */}
              {activeTab === 'files' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="font-grotesk font-bold text-lg">Mes fichiers</h2>
                    <span className="font-mono text-xs text-muted-foreground">{files.length} fichier{files.length > 1 ? 's' : ''}</span>
                  </div>
                  {filesLoading ? (
                    <div className="flex justify-center py-16">
                      <div className="w-7 h-7 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    </div>
                  ) : Object.keys(missions).length === 0 ? (
                    <EmptyState icon={FolderOpen} title="Aucun fichier disponible"
                      desc="Vos fichiers de missions apparaîtront ici dès que votre pilote les aura déposés."
                      cta="Commander une mission" to="/quote" />
                  ) : (
                    Object.entries(missions).map(([mission, mFiles]) => (
                      <MissionFolder key={mission} mission={mission} files={mFiles} />
                    ))
                  )}
                </div>
              )}

              {/* QUOTES */}
              {activeTab === 'quotes' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="font-grotesk font-bold text-lg">Mes devis</h2>
                    <Link to="/quote">
                      <Button size="sm" className="bg-primary text-primary-foreground gap-1.5 rounded-xl">
                        <Plus className="w-3.5 h-3.5" /> Nouveau
                      </Button>
                    </Link>
                  </div>
                  {myQuotes.length === 0 ? (
                    <EmptyState icon={FileText} title="Aucun devis pour le moment"
                      desc="Faites votre première demande et recevez un devis personnalisé sous 24h."
                      cta="Demander un devis" to="/quote" />
                  ) : (
                    <div className="space-y-3">
                      {myQuotes.map(q => <QuoteCard key={q.id} q={q} />)}
                    </div>
                  )}
                </div>
              )}

              {/* CERTIFICATIONS */}
              {activeTab === 'certs' && (
                <div className="space-y-4">
                  <h2 className="font-grotesk font-bold text-lg">Certifications</h2>
                  {myCertifications.length === 0 ? (
                    <EmptyState icon={Shield} title="Aucune certification"
                      desc="Obtenez une certification officielle pour mettre en valeur vos compétences drone."
                      cta="Demander une certification" to="/profile" />
                  ) : (
                    <div className="bg-card border border-border rounded-2xl p-6">
                      <CertificationTracking request={myCertifications[0]} />
                    </div>
                  )}
                </div>
              )}

              {/* BADGES */}
              {activeTab === 'badges' && (
               <div className="space-y-4">
                 <h2 className="font-grotesk font-bold text-lg">Mes badges</h2>
                 {!user.badges?.length ? (
                   <EmptyState icon={Award} title="Aucun badge pour l'instant"
                     desc="Les badges s'obtiennent en participant à la communauté et en réalisant des missions." />
                 ) : (
                   <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                     {user.badges.map(b => (
                       <div key={b} className="p-4 rounded-2xl bg-card border border-border flex flex-col items-center gap-3 hover:border-primary/30 hover:bg-primary/5 transition-all">
                         <BadgeChip badge={b} size="lg" />
                       </div>
                     ))}
                   </div>
                 )}
               </div>
              )}

              {/* REPORTS */}
              {activeTab === 'reports' && (
               <div className="space-y-4">
                 <div className="flex items-center justify-between">
                   <h2 className="font-grotesk font-bold text-lg">Mes signalements</h2>
                   <span className="font-mono text-xs text-muted-foreground">{myReports.length} signalement{myReports.length > 1 ? 's' : ''}</span>
                 </div>
                 {myReports.length === 0 ? (
                   <EmptyState icon={Flag} title="Aucun signalement"
                     desc="Vous pouvez signaler un utilisateur ou du contenu inapproprié pour aider notre modération." />
                 ) : (
                   <div className="space-y-3">
                     {myReports.map(r => {
                       const s = REPORT_STATUS[r.status] || REPORT_STATUS.pending;
                       const StatusIcon = s.icon;
                       return (
                         <motion.div key={r.id} whileHover={{ y: -1 }} className={`p-5 rounded-2xl bg-card border ${s.border} relative overflow-hidden`}>
                           <div className="flex items-start justify-between gap-3">
                             <div className="flex-1 min-w-0">
                               <div className="flex items-center gap-2 mb-2 flex-wrap">
                                 <span className={`inline-flex items-center gap-1.5 text-[11px] font-inter font-medium px-2 py-0.5 rounded-full ${s.bg} ${s.color} border ${s.border}`}>
                                   <StatusIcon className="w-3 h-3" />
                                   {s.label}
                                 </span>
                               </div>
                               <p className="font-grotesk font-bold text-base leading-tight">
                                 {r.target_type === 'user' ? `Signalement d'utilisateur` : 'Signalement de contenu'}
                               </p>
                               <p className="font-inter text-xs text-muted-foreground mt-1">
                                 <span className="font-medium">{r.target_name || r.target_email}</span>
                               </p>
                               {r.reason && (
                                 <p className="font-inter text-xs text-muted-foreground mt-2 px-2 py-1.5 rounded-lg bg-secondary/50 border border-border inline-block">
                                   {r.reason.replace(/_/g, ' ')}
                                 </p>
                               )}
                               {r.admin_notes && (
                                 <p className="font-inter text-xs text-muted-foreground mt-2 p-2 rounded-lg bg-secondary/50 border border-border italic">
                                   💬 {r.admin_notes}
                                 </p>
                               )}
                             </div>
                             <div className="text-right flex-shrink-0">
                               <p className="font-mono text-[11px] text-muted-foreground">
                                 {r.created_date ? format(new Date(r.created_date), 'd MMM yy', { locale: fr }) : ''}
                               </p>
                             </div>
                           </div>
                         </motion.div>
                       );
                     })}
                   </div>
                 )}
               </div>
              )}

              </motion.div>
              </AnimatePresence>
              </main>
      </div>
    </div>
  );
}