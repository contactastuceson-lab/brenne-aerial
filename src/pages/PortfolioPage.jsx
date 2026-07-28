import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import { Plane, Camera, Building2, Film, Play, X, MapPin, Calendar, ExternalLink, Star } from 'lucide-react';
import ReviewsSection from '@/components/portfolio/ReviewsSection';
import BeforeAfterSlider from '@/components/shared/BeforeAfterSlider';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const CATS = [
  { key: 'all', label: 'Tous', icon: Plane },
  { key: 'evenement', label: 'Événement', icon: Camera },
  { key: 'inspection', label: 'Inspection', icon: Building2 },
  { key: 'chantier', label: 'Chantier', icon: Building2 },
  { key: 'particulier', label: 'Particulier', icon: Camera },
  { key: 'entreprise', label: 'Entreprise', icon: Building2 },
  { key: 'formation', label: 'Formation', icon: Film },
];

const CAT_COLORS = {
  evenement: '#f59e0b', inspection: '#38aadc', chantier: '#1dd8b4',
  particulier: '#a78bfa', entreprise: '#38aadc', formation: '#fb7185',
};

function ytId(url) {
  if (!url) return null;
  const m = String(url).match(/(?:v=|youtu\.be\/|embed\/|shorts\/)([\w-]{11})/);
  return m ? m[1] : null;
}

function MediaPreview({ project, large = false }) {
  const thumb = project.thumbnail_url || (project.media_type === 'image' ? project.media_url : '');
  if (project.media_type === 'youtube' && large) {
    const id = ytId(project.media_url);
    if (id) {
      return (
        <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-black">
          <iframe src={`https://www.youtube.com/embed/${id}`} title={project.title} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen className="w-full h-full" />
        </div>
      );
    }
  }
  return (
    <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-secondary border border-border">
      {thumb ? (
        <img src={thumb} alt={project.title} className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-muted-foreground">
          <Film className="w-8 h-8" />
        </div>
      )}
      {project.media_type !== 'image' && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-black/50 border border-white/20 flex items-center justify-center backdrop-blur-sm">
            <Play className="w-5 h-5 text-white ml-0.5" />
          </div>
        </div>
      )}
    </div>
  );
}

function ProjectCard({ project, onOpen }) {
  const color = CAT_COLORS[project.category] || '#38aadc';
  return (
    <motion.button
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={() => onOpen(project)}
      className="text-left group bg-card border border-border rounded-2xl overflow-hidden hover-lift"
    >
      <div className="relative aspect-video overflow-hidden">
        <MediaPreview project={project} />
        <div className="absolute top-3 left-3">
          <span className="font-mono text-[9px] uppercase tracking-widest px-2 py-1 rounded-full border"
            style={{ color: color, background: `${color}15`, borderColor: `${color}40` }}>
            {project.category}
          </span>
        </div>
        {project.is_featured && (
          <div className="absolute top-3 right-3">
            <Star className="w-4 h-4 fill-chart-5 text-chart-5" />
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-grotesk font-bold text-sm text-foreground truncate">{project.title}</h3>
        {project.client_name && (
          <p className="font-inter text-xs text-muted-foreground mt-1 truncate">{project.client_name}</p>
        )}
        <div className="flex items-center gap-3 mt-2">
          {project.date_realisation && (
            <span className="font-mono text-[10px] text-muted-foreground/60 flex items-center gap-1">
              <Calendar className="w-3 h-3" /> {format(new Date(project.date_realisation), 'MMM yyyy', { locale: fr })}
            </span>
          )}
          {project.media_type !== 'image' && (
            <span className="font-mono text-[10px] text-primary/70 flex items-center gap-1">
              <Play className="w-3 h-3" /> Vidéo
            </span>
          )}
        </div>
      </div>
    </motion.button>
  );
}

function ProjectDetail({ project, onClose }) {
  const color = CAT_COLORS[project.category] || '#38aadc';
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-0 sm:p-6"
      style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 40, opacity: 0 }}
        onClick={e => e.stopPropagation()}
        className="bg-card border border-border rounded-t-3xl sm:rounded-2xl w-full max-w-2xl max-h-[92vh] overflow-y-auto"
      >
        <div className="sticky top-0 z-10 flex items-center justify-between px-5 py-3 bg-card/90 backdrop-blur border-b border-border">
          <span className="font-mono text-[10px] uppercase tracking-widest" style={{ color }}>{project.category}</span>
          <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-secondary">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-5">
          <MediaPreview project={project} large />
          <h2 className="font-grotesk font-bold text-xl mt-4">{project.title}</h2>
          <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-muted-foreground">
            {project.client_name && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {project.client_name}</span>}
            {project.date_realisation && <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {format(new Date(project.date_realisation), 'd MMM yyyy', { locale: fr })}</span>}
            {project.media_type !== 'image' && project.media_url && (
              <a href={project.media_url} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-primary hover:underline">
                <ExternalLink className="w-3 h-3" /> Ouvrir la vidéo
              </a>
            )}
          </div>
          {project.description && (
            <p className="font-inter text-sm text-muted-foreground leading-relaxed mt-3">{project.description}</p>
          )}
          {project.tags?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {project.tags.map(t => (
                <span key={t} className="font-mono text-[10px] px-2 py-0.5 rounded-full bg-secondary border border-border text-muted-foreground">#{t}</span>
              ))}
            </div>
          )}
          <ReviewsSection projectId={project.id} projectTitle={project.title} />
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function PortfolioPage() {
  const [filter, setFilter] = useState('all');
  const [selected, setSelected] = useState(null);

  const { data: projects = [] } = useQuery({
    queryKey: ['portfolio-projects'],
    queryFn: () => base44.entities.Project.filter({ is_published: true }, '-is_featured,-date_realisation', 100),
  });

  const { data: galleries = [] } = useQuery({
    queryKey: ['before-after-gallery'],
    queryFn: () => base44.entities.BeforeAfterGallery.filter({ is_published: true }, 'order', 50),
  });

  const filtered = useMemo(() => {
    const sorted = [...projects].sort((a, b) => (b.order || 0) - (a.order || 0));
    return filter === 'all' ? sorted : sorted.filter(p => p.category === filter);
  }, [projects, filter]);

  return (
    <div className="min-h-screen pb-20">
      {/* Hero */}
      <div className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 grid-bg opacity-40" />
        <div className="relative px-5 py-16 text-center max-w-3xl mx-auto">
          <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="font-mono text-[11px] tracking-[4px] uppercase text-primary/80 mb-3">
            — Nos réalisations aériennes
          </motion.p>
          <motion.h1 initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            className="font-grotesk font-black text-4xl sm:text-5xl leading-tight">
            Portfolio <span className="gradient-text">EZA</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="font-inter text-sm text-muted-foreground mt-4 max-w-xl mx-auto">
            Captations par drone pour l'immobilier, l'événementiel, l'inspection et le suivi de chantier. Découvrez nos projets à travers la France.
          </motion.p>
        </div>
      </div>

      {/* Galerie de projets */}
      <section className="px-4 lg:px-10 max-w-6xl mx-auto py-12">
        <div className="text-center mb-8">
          <h2 className="font-grotesk font-bold text-2xl sm:text-3xl">Galerie de projets</h2>
          <p className="font-inter text-sm text-muted-foreground mt-2">Cliquez sur un projet pour voir les détails et les avis clients.</p>
        </div>

        <div className="flex justify-center gap-2 flex-wrap mb-8">
          {CATS.map(cat => {
            const Icon = cat.icon;
            const active = filter === cat.key;
            return (
              <button key={cat.key} onClick={() => setFilter(cat.key)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold transition-all border"
                style={{
                  background: active ? 'hsl(var(--primary))' : 'transparent',
                  borderColor: active ? 'hsl(var(--primary))' : 'hsl(var(--border))',
                  color: active ? 'hsl(var(--primary-foreground))' : 'hsl(var(--muted-foreground))',
                }}>
                <Icon className="w-3.5 h-3.5" /> {cat.label}
              </button>
            );
          })}
        </div>

        {filtered.length === 0 ? (
          <p className="text-center font-inter text-sm text-muted-foreground py-12">Aucun projet publié dans cette catégorie pour le moment.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(p => <ProjectCard key={p.id} project={p} onOpen={setSelected} />)}
          </div>
        )}
      </section>

      {/* Avant / Après */}
      {galleries.length > 0 && (
        <section className="px-4 lg:px-10 max-w-5xl mx-auto py-12 border-t border-border">
          <div className="text-center mb-8">
            <h2 className="font-grotesk font-bold text-2xl sm:text-3xl">Avant / Après</h2>
            <p className="font-inter text-sm text-muted-foreground mt-2">Faites glisser pour comparer les rendus.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {galleries.map(g => (
              <div key={g.id} className="bg-card border border-border rounded-2xl overflow-hidden">
                <BeforeAfterSlider beforeUrl={g.before_url} afterUrl={g.after_url} beforeLabel={g.before_label || 'Avant'} afterLabel={g.after_label || 'Après'} />
                <div className="p-4">
                  <h3 className="font-grotesk font-semibold text-sm">{g.title}</h3>
                  {g.description && <p className="font-inter text-xs text-muted-foreground mt-1">{g.description}</p>}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <AnimatePresence>
        {selected && <ProjectDetail project={selected} onClose={() => setSelected(null)} />}
      </AnimatePresence>
    </div>
  );
}