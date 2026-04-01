import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, ExternalLink, Filter, Star } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { getYoutubeThumbnail } from '@/lib/droneUtils';
import ReviewsSection from '@/components/portfolio/ReviewsSection';

const CATEGORIES = [
  { key: 'all', label: 'Tout' },
  { key: 'evenement', label: 'Événement' },
  { key: 'inspection', label: 'Inspection' },
  { key: 'chantier', label: 'Chantier' },
  { key: 'particulier', label: 'Particulier' },
  { key: 'entreprise', label: 'Entreprise' },
  { key: 'formation', label: 'Formation' },
];

// Demo projects for when DB is empty
const DEMO_PROJECTS = [
  { id: 'd1', title: 'Festival Estival 2024', category: 'evenement', media_type: 'youtube', media_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', thumbnail_url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&auto=format&fit=crop&q=60', description: 'Captation aérienne du plus grand festival de la région.' },
  { id: 'd2', title: 'Inspection Cathédrale de Blois', category: 'inspection', media_type: 'image', thumbnail_url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&auto=format&fit=crop&q=60', description: 'Diagnostic complet façades et toitures.' },
  { id: 'd3', title: 'Chantier Grand Parc Nord', category: 'chantier', media_type: 'image', thumbnail_url: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&auto=format&fit=crop&q=60', description: 'Suivi hebdomadaire d\'un programme de 200 logements.' },
  { id: 'd4', title: 'Mariage Château de la Loire', category: 'evenement', media_type: 'youtube', media_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', thumbnail_url: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=600&auto=format&fit=crop&q=60', description: 'Immortaliser un jour magique depuis les airs.' },
  { id: 'd5', title: 'Complexe industriel ABT', category: 'entreprise', media_type: 'image', thumbnail_url: 'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=600&auto=format&fit=crop&q=60', description: 'Clip institutionnel et cartographie site.' },
  { id: 'd6', title: 'Propriété Prestige Sologne', category: 'particulier', media_type: 'image', thumbnail_url: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600&auto=format&fit=crop&q=60', description: 'Valorisation immobilière haut de gamme.' },
  { id: 'd7', title: 'Concert Rock au Lac', category: 'evenement', media_type: 'image', thumbnail_url: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=600&auto=format&fit=crop&q=60', description: '10 000 spectateurs vus du ciel.' },
  { id: 'd8', title: 'Opération Sécurité BPCE', category: 'entreprise', media_type: 'image', thumbnail_url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&auto=format&fit=crop&q=60', description: 'Retour temps réel pour sécurité événementielle.' },
];

export default function PortfolioPage() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [lightbox, setLightbox] = useState(null);

  const { data: dbProjects = [] } = useQuery({
    queryKey: ['portfolio-projects'],
    queryFn: () => base44.entities.Project.filter({ is_published: true }, '-order', 50),
  });

  const projects = dbProjects.length > 0 ? dbProjects : DEMO_PROJECTS;

  const filtered = activeCategory === 'all' ? projects : projects.filter(p => p.category === activeCategory);

  const getThumbnail = (p) => {
    if (p.thumbnail_url) return p.thumbnail_url;
    if (p.media_type === 'youtube' && p.media_url) return getYoutubeThumbnail(p.media_url) || 'https://images.unsplash.com/photo-1617129514963-a4d80e74f8af?w=600&q=60';
    return 'https://images.unsplash.com/photo-1617129514963-a4d80e74f8af?w=600&q=60';
  };

  return (
    <div className="pt-16">
      {/* Hero */}
      <section className="py-24 px-5 lg:px-10 text-center relative overflow-hidden">
        <div className="absolute inset-0 grid-bg" />
        <div className="relative max-w-3xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
            <p className="font-mono text-xs text-primary mb-4 tracking-widest uppercase">— Nos réalisations</p>
            <h1 className="font-grotesk font-bold text-5xl sm:text-6xl mb-4">
              Portfolio <span className="gradient-text">&</span> Galerie
            </h1>
            <p className="font-inter text-muted-foreground">
              {projects.length}+ projets réalisés pour des clients privés et professionnels à travers la France.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Filters */}
      <div className="sticky top-16 z-40 glass border-b border-border">
        <div className="max-w-7xl mx-auto px-5 lg:px-10 py-3 flex gap-2 overflow-x-auto scrollbar-hide">
          <Filter className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5 self-center" />
          {CATEGORIES.map(cat => (
            <button key={cat.key} onClick={() => setActiveCategory(cat.key)}
              className={`flex-shrink-0 px-4 py-1.5 rounded-full font-inter text-xs border transition-all ${
                activeCategory === cat.key
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'border-border text-muted-foreground hover:text-foreground hover:border-muted-foreground/50'
              }`}>
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="px-5 lg:px-10 max-w-7xl mx-auto py-12">
        <motion.div layout className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
          <AnimatePresence>
            {filtered.map((p, i) => (
              <motion.div key={p.id}
                layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }} transition={{ delay: i * 0.05 }}
                className="break-inside-avoid"
              >
                <div
                  onClick={() => setLightbox(p)}
                  className="relative rounded-xl overflow-hidden bg-card border border-border hover:border-primary/40 cursor-pointer group transition-all duration-300 hover-lift"
                >
                  <img src={getThumbnail(p)} alt={p.title}
                    className="w-full object-cover group-hover:scale-105 transition-transform duration-500"
                    style={{ aspectRatio: i % 3 === 1 ? '16/10' : '4/3' }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  {p.media_type === 'youtube' && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-12 h-12 rounded-full bg-primary/20 backdrop-blur-sm border border-primary/40 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Play className="w-5 h-5 text-primary ml-0.5" />
                      </div>
                    </div>
                  )}
                  <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform">
                    <span className="font-mono text-[10px] text-primary">{p.category}</span>
                    <h3 className="font-grotesk font-semibold text-sm mt-0.5 text-white">{p.title}</h3>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
        {filtered.length === 0 && (
          <div className="text-center py-20 text-muted-foreground font-inter text-sm">
            Aucun projet dans cette catégorie pour le moment.
          </div>
        )}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-background/95 backdrop-blur-xl flex items-center justify-center p-4"
            onClick={() => setLightbox(null)}
          >
            <motion.div
              initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
              className="max-w-4xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}
            >
              {lightbox.media_type === 'youtube' && lightbox.media_url ? (
                <div className="aspect-video w-full rounded-xl overflow-hidden">
                  <iframe
                    src={`https://www.youtube.com/embed/${lightbox.media_url.split('v=')[1]?.split('&')[0] || ''}`}
                    className="w-full h-full" allowFullScreen title={lightbox.title}
                  />
                </div>
              ) : (
                <img src={getThumbnail(lightbox)} alt={lightbox.title} className="w-full rounded-xl" />
              )}
              <div className="mt-4 flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <span className="font-mono text-xs text-primary">{lightbox.category}</span>
                  <h3 className="font-grotesk font-bold text-xl mt-1">{lightbox.title}</h3>
                  {lightbox.description && <p className="font-inter text-sm text-muted-foreground mt-1">{lightbox.description}</p>}
                </div>
                <button onClick={() => setLightbox(null)} className="text-muted-foreground hover:text-foreground ml-4 flex-shrink-0">✕</button>
              </div>
              {!lightbox.id?.startsWith('d') && (
                <ReviewsSection projectId={lightbox.id} projectTitle={lightbox.title} />
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}