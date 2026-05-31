import React, { useState, useEffect } from 'react';
import { usePageEnabled } from '@/hooks/usePageEnabled';
import FeatureDisabled from '@/components/shared/FeatureDisabled';
import { motion } from 'framer-motion';
import { FolderOpen, Download, FileVideo, FileImage, FileText, File, Lock, LogIn, ChevronDown, ChevronUp, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import BadgeChip from '@/components/ui/BadgeChip';
import StatusBadge from '@/components/ui/StatusBadge';
import CertificationTracking from '@/components/dashboard/CertificationTracking';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Link, useSearchParams } from 'react-router-dom';

const FILE_ICONS = {
  photo: FileImage,
  video: FileVideo,
  rapport: FileText,
  attestation: FileText,
  autre: File,
};

const FILE_COLORS = {
  photo: 'text-blue-400',
  video: 'text-purple-400',
  rapport: 'text-green-400',
  attestation: 'text-amber-400',
  autre: 'text-muted-foreground',
};

function MissionFolder({ mission, files }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="border border-border rounded-xl overflow-hidden">
      <button onClick={() => setOpen(v => !v)}
        className="w-full flex items-center gap-3 px-5 py-4 bg-card hover:bg-secondary/50 transition-colors">
        <FolderOpen className="w-5 h-5 text-primary flex-shrink-0" />
        <div className="flex-1 text-left">
          <p className="font-grotesk font-semibold text-sm">{mission}</p>
          <p className="font-inter text-xs text-muted-foreground">{files.length} fichier{files.length > 1 ? 's' : ''}</p>
        </div>
        {files[0]?.mission_date && (
          <span className="font-mono text-xs text-muted-foreground mr-2">
            {format(new Date(files[0].mission_date), 'd MMM yyyy', { locale: fr })}
          </span>
        )}
        {open ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
      </button>

      {open && (
        <div className="divide-y divide-border">
          {files.map(file => {
            const Icon = FILE_ICONS[file.file_type] || File;
            return (
              <div key={file.id} className="flex items-center gap-3 px-5 py-3 bg-background hover:bg-card/50 transition-colors">
                <Icon className={`w-4 h-4 flex-shrink-0 ${FILE_COLORS[file.file_type] || 'text-muted-foreground'}`} />
                <div className="flex-1 min-w-0">
                  <p className="font-inter text-sm truncate">{file.file_name}</p>
                  {file.description && <p className="font-inter text-xs text-muted-foreground truncate">{file.description}</p>}
                </div>
                {file.file_size_mb && (
                  <span className="font-mono text-xs text-muted-foreground flex-shrink-0">{file.file_size_mb} Mo</span>
                )}
                <a href={file.file_url} target="_blank" rel="noopener noreferrer">
                  <Button size="sm" variant="outline" className="border-border gap-1.5 text-xs flex-shrink-0">
                    <Download className="w-3 h-3" /> Télécharger
                  </Button>
                </a>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function EspaceClientPage() {
  const { enabled, isLoading: checkingEnabled } = usePageEnabled('page_espace_client_enabled');
  const [user, setUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [searchParams] = useSearchParams();
  const defaultTab = searchParams.get('tab') || 'files';

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
    queryFn: () => base44.entities.Quote.filter({ client_email: user.email }, '-created_date', 10),
    enabled: !!user?.email,
  });

  const { data: myCertifications = [] } = useQuery({
    queryKey: ['my-certifications', user?.email],
    queryFn: () => base44.entities.CertificationRequest.filter({ user_email: user.email }, '-created_date', 5),
    enabled: !!user?.email,
  });

  const missions = files.reduce((acc, f) => {
    if (!acc[f.mission_name]) acc[f.mission_name] = [];
    acc[f.mission_name].push(f);
    return acc;
  }, {});

  if (checkingEnabled) return null;
  if (!enabled) return <FeatureDisabled title="Espace Client indisponible" message="L'espace client est temporairement désactivé." />;

  if (!authChecked) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!user) return (
    <div className="pt-16 min-h-screen flex items-center justify-center px-5">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-6 max-w-sm">
        <div className="w-20 h-20 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto">
          <Lock className="w-10 h-10 text-primary" />
        </div>
        <h2 className="font-grotesk font-bold text-2xl">Connexion requise</h2>
        <p className="font-inter text-sm text-muted-foreground">
          Connectez-vous pour accéder à votre espace personnel.
        </p>
        <Button onClick={() => base44.auth.redirectToLogin('/espace-client')}
          className="bg-primary text-primary-foreground gap-2 font-grotesk font-semibold">
          <LogIn className="w-4 h-4" /> Se connecter
        </Button>
      </motion.div>
    </div>
  );

  return (
    <div className="pt-20 min-h-screen px-5 lg:px-10 py-10">
      <div className="max-w-5xl mx-auto">

        {/* Profile header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8 p-5 rounded-2xl bg-card border border-border">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center flex-shrink-0">
              {user.avatar_url ? (
                <img src={user.avatar_url} alt="" className="w-full h-full object-cover rounded-xl" />
              ) : (
                <span className="font-grotesk font-bold text-primary text-lg">
                  {user.full_name?.[0]?.toUpperCase() || 'U'}
                </span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="font-grotesk font-bold text-lg">Bonjour, {user.full_name?.split(' ')[0]} 👋</h1>
              <p className="font-mono text-xs text-muted-foreground">{user.email}</p>
              {user.badges?.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {user.badges.map(b => <BadgeChip key={b} badge={b} />)}
                </div>
              )}
            </div>
            <Link to="/quote">
              <Button size="sm" className="bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 font-grotesk">
                Nouveau devis
              </Button>
            </Link>
          </div>
        </motion.div>

        <Tabs defaultValue={defaultTab}>
          <TabsList className="bg-card border border-border mb-6">
            <TabsTrigger value="files" className="gap-1.5 font-inter text-sm">
              <FolderOpen className="w-4 h-4" /> Mes fichiers
            </TabsTrigger>
            <TabsTrigger value="quotes" className="gap-1.5 font-inter text-sm">
              <FileText className="w-4 h-4" /> Mes devis
            </TabsTrigger>
            <TabsTrigger value="certifications" className="gap-1.5 font-inter text-sm">
              <Award className="w-4 h-4" /> Certifications
            </TabsTrigger>
            <TabsTrigger value="badges" className="gap-1.5 font-inter text-sm">
              <Award className="w-4 h-4" /> Badges
            </TabsTrigger>
          </TabsList>

          {/* Fichiers missions */}
          <TabsContent value="files" className="space-y-3">
            {filesLoading ? (
              <div className="flex justify-center py-12">
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : Object.keys(missions).length === 0 ? (
              <div className="text-center py-14 space-y-4">
                <FolderOpen className="w-14 h-14 text-muted-foreground/20 mx-auto" />
                <p className="font-grotesk font-bold text-lg">Aucun fichier disponible</p>
                <p className="font-inter text-sm text-muted-foreground max-w-xs mx-auto">
                  Vos fichiers de missions apparaîtront ici dès que votre pilote les aura déposés.
                </p>
                <Link to="/quote">
                  <Button className="bg-primary text-primary-foreground gap-2 mt-2">Commander une mission</Button>
                </Link>
              </div>
            ) : (
              Object.entries(missions).map(([mission, mFiles]) => (
                <MissionFolder key={mission} mission={mission} files={mFiles} />
              ))
            )}
          </TabsContent>

          {/* Devis */}
          <TabsContent value="quotes" className="space-y-3">
            {myQuotes.length === 0 ? (
              <div className="text-center py-10">
                <p className="font-inter text-sm text-muted-foreground mb-4">Aucun devis pour le moment</p>
                <Link to="/quote"><Button size="sm" className="bg-primary text-primary-foreground">Demander un devis</Button></Link>
              </div>
            ) : myQuotes.map(q => (
              <div key={q.id} className="p-4 rounded-xl bg-card border border-border">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <StatusBadge status={q.status} />
                      <span className="font-mono text-xs text-muted-foreground">{q.date_souhaitee || '—'}</span>
                    </div>
                    <p className="font-grotesk font-semibold text-sm">{q.service_type?.replace(/_/g, ' ')}</p>
                    {q.prix_estime && <p className="font-mono text-xs text-primary mt-1">{q.prix_estime}€ estimé</p>}
                  </div>
                  <span className="font-mono text-[10px] text-muted-foreground">
                    {q.created_date ? format(new Date(q.created_date), 'd MMM yy', { locale: fr }) : ''}
                  </span>
                </div>
              </div>
            ))}
          </TabsContent>

          {/* Certifications */}
          <TabsContent value="certifications" className="space-y-3">
            <div className="bg-card border border-border rounded-xl p-6">
              {myCertifications.length === 0 ? (
                <div className="text-center py-10">
                  <p className="font-inter text-sm text-muted-foreground mb-4">Aucune demande de certification</p>
                  <Link to="/profile"><Button size="sm" className="bg-primary text-primary-foreground">Demander une certification</Button></Link>
                </div>
              ) : (
                <CertificationTracking request={myCertifications[0]} />
              )}
            </div>
          </TabsContent>

          {/* Badges */}
          <TabsContent value="badges">
            <div className="p-6 rounded-xl bg-card border border-border">
              <h3 className="font-grotesk font-bold text-base mb-4">Vos badges</h3>
              {user.badges?.length > 0 ? (
                <div className="flex flex-wrap gap-3">
                  {user.badges.map(b => <BadgeChip key={b} badge={b} size="lg" />)}
                </div>
              ) : (
                <p className="font-inter text-sm text-muted-foreground">Aucun badge attribué pour l'instant.</p>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}