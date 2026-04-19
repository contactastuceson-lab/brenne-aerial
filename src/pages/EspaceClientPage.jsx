import React, { useState, useEffect } from 'react';
import { usePageEnabled } from '@/hooks/usePageEnabled';
import FeatureDisabled from '@/components/shared/FeatureDisabled';
import { motion } from 'framer-motion';
import { FolderOpen, Download, FileVideo, FileImage, FileText, File, Lock, LogIn, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

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

  useEffect(() => {
    base44.auth.isAuthenticated().then(async (authed) => {
      if (authed) setUser(await base44.auth.me());
      setAuthChecked(true);
    });
  }, []);

  const { data: files = [], isLoading } = useQuery({

    queryKey: ['client-files', user?.email],
    queryFn: () => base44.entities.ClientFile.filter({ client_email: user.email }, '-mission_date'),
    enabled: !!user?.email,
  });

  // Group by mission
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

  return (
    <div className="pt-16 min-h-screen">
      {/* Hero */}
      <section className="relative py-20 px-5 text-center overflow-hidden">
        <div className="absolute inset-0 grid-bg" />
        <div className="relative max-w-3xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}>
            <p className="font-mono text-xs text-primary mb-4 tracking-widest uppercase">— Espace Client</p>
            <h1 className="font-grotesk font-bold text-4xl sm:text-6xl mb-4">
              Vos <span className="gradient-text">relevés aériens</span>
            </h1>
            <p className="font-inter text-lg text-muted-foreground max-w-xl mx-auto">
              Accédez à tous vos fichiers de missions — photos 4K, vidéos, rapports et attestations — en permanence.
            </p>
          </motion.div>
        </div>
      </section>

      <div className="max-w-3xl mx-auto px-5 pb-24">
        {!user ? (
          /* Not logged in */
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="text-center py-16 space-y-6">
            <div className="w-20 h-20 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto">
              <Lock className="w-10 h-10 text-primary" />
            </div>
            <h2 className="font-grotesk font-bold text-2xl">Connexion requise</h2>
            <p className="font-inter text-sm text-muted-foreground max-w-sm mx-auto">
              Connectez-vous pour accéder à votre espace personnel et retrouver tous vos fichiers de missions.
            </p>
            <Button onClick={() => base44.auth.redirectToLogin('/espace-client')}
              className="bg-primary text-primary-foreground gap-2 font-grotesk font-semibold">
              <LogIn className="w-4 h-4" /> Se connecter
            </Button>
            <p className="font-inter text-xs text-muted-foreground">
              Pas encore de compte ? Contactez-nous après votre mission — nous créons votre accès.
            </p>
          </motion.div>
        ) : isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : Object.keys(missions).length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="text-center py-16 space-y-4">
            <FolderOpen className="w-16 h-16 text-muted-foreground/30 mx-auto" />
            <h2 className="font-grotesk font-bold text-xl">Aucun fichier disponible</h2>
            <p className="font-inter text-sm text-muted-foreground max-w-sm mx-auto">
              Vos fichiers de missions apparaîtront ici dès que votre pilote les aura déposés.
            </p>
            <a href="/quote">
              <Button className="bg-primary text-primary-foreground gap-2 mt-4">
                Commander une mission
              </Button>
            </a>
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            {/* Welcome */}
            <div className="p-5 rounded-2xl bg-card border border-primary/20 flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <span className="font-grotesk font-bold text-lg text-primary">{user.full_name?.[0]}</span>
              </div>
              <div>
                <p className="font-grotesk font-semibold">Bonjour, {user.full_name?.split(' ')[0]} 👋</p>
                <p className="font-inter text-xs text-muted-foreground">
                  {Object.keys(missions).length} mission{Object.keys(missions).length > 1 ? 's' : ''} · {files.length} fichier{files.length > 1 ? 's' : ''}
                </p>
              </div>
            </div>

            {/* Missions */}
            {Object.entries(missions).map(([mission, mFiles]) => (
              <MissionFolder key={mission} mission={mission} files={mFiles} />
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}