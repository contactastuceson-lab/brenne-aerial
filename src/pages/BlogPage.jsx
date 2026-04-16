import React, { useState } from 'react';
import { usePageEnabled } from '@/hooks/usePageEnabled';
import FeatureDisabled from '@/components/shared/FeatureDisabled';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Clock, Eye, ArrowRight, Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const DEMO_POSTS = [
  { id: 'b1', title: 'Comment choisir votre prestataire drone : 5 critères essentiels', excerpt: 'Certifications DGAC, équipement, expérience, assurance... voici tout ce que vous devez vérifier avant de signer.', category: 'conseil', cover_url: 'https://images.unsplash.com/photo-1579829366248-204fe8413f31?w=800&q=60', author: 'Enor Lefoulon Meyer', reading_time: 5, views: 1247, created_date: '2024-11-15' },
  { id: 'b2', title: 'Inspection de toiture par drone : révolution dans le BTP', excerpt: 'Le drone transforme l\'inspection technique. Plus rapide, moins coûteux, zéro risque pour les techniciens.', category: 'technique', cover_url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=60', author: 'Enor Lefoulon Meyer', reading_time: 7, views: 892, created_date: '2024-10-28' },
  { id: 'b3', title: 'Réglementation drone 2024 : ce qui a changé', excerpt: 'La DGAC a mis à jour les règles. Zones interdites, formations obligatoires — faisons le point.', category: 'actualite', cover_url: 'https://images.unsplash.com/photo-1527977966376-1c8408f9f108?w=800&q=60', author: 'Enor Lefoulon Meyer', reading_time: 4, views: 2103, created_date: '2024-10-10' },
  { id: 'b4', title: 'Mariage 2024 : pourquoi la vidéo drone est incontournable', excerpt: 'Un angle unique, des souvenirs inoubliables. Découvrez comment le drone a révolutionné la vidéo mariage.', category: 'projet', cover_url: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=800&q=60', author: 'Enor Lefoulon Meyer', reading_time: 3, views: 3421, created_date: '2024-09-22' },
  { id: 'b5', title: 'Suivi de chantier aérien : ROI et bonnes pratiques', excerpt: 'Comment nos clients BTP ont réduit leurs coûts de 15% grâce au monitoring drone hebdomadaire.', category: 'technique', cover_url: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&q=60', author: 'Enor Lefoulon Meyer', reading_time: 6, views: 678, created_date: '2024-09-05' },
  { id: 'b6', title: 'Formation pilote drone : notre centre ouvre en 2025', excerpt: 'Grande annonce : Brenne Aerial lance son centre de formation certifié. Tout ce que vous devez savoir.', category: 'actualite', cover_url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=60', author: 'Enor Lefoulon Meyer', reading_time: 4, views: 4892, created_date: '2024-08-18' },
];

const CATEGORIES = [
  { key: 'all', label: 'Tous' },
  { key: 'actualite', label: 'Actualités' },
  { key: 'conseil', label: 'Conseils' },
  { key: 'technique', label: 'Technique' },
  { key: 'projet', label: 'Projets' },
  { key: 'formation', label: 'Formation' },
];

const CAT_COLORS = {
  actualite: 'text-primary bg-primary/10 border-primary/20',
  conseil: 'text-accent bg-accent/10 border-accent/20',
  technique: 'text-chart-5 bg-chart-5/10 border-chart-5/20',
  projet: 'text-green-400 bg-green-400/10 border-green-400/20',
  formation: 'text-purple-400 bg-purple-400/10 border-purple-400/20',
};

export default function BlogPage() {
  const { enabled, isLoading: checkingEnabled } = usePageEnabled('page_blog_enabled');
  const [activeCategory, setActiveCategory] = useState('all');
  const [search, setSearch] = useState('');

  const { data: dbPosts = [] } = useQuery({
    queryKey: ['blog-posts'],
    queryFn: () => base44.entities.BlogPost.filter({ is_published: true }, '-created_date', 20),
  });

  if (checkingEnabled) return null;
  if (!enabled) return <FeatureDisabled title="Blog indisponible" message="Le blog est temporairement désactivé." />;

  const posts = dbPosts.length > 0 ? dbPosts : DEMO_POSTS;
  const filtered = posts
    .filter(p => activeCategory === 'all' || p.category === activeCategory)
    .filter(p => !search || p.title?.toLowerCase().includes(search.toLowerCase()) || p.excerpt?.toLowerCase().includes(search.toLowerCase()));
  const [featured, ...rest] = filtered;

  return (
    <div className="pt-16">
      <section className="py-24 px-5 lg:px-10 relative overflow-hidden">
        <div className="absolute inset-0 grid-bg" />
        <div className="relative max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
            <p className="font-mono text-xs text-primary mb-3 tracking-widest uppercase">— Actualités & Conseils</p>
            <h1 className="font-grotesk font-bold text-4xl sm:text-5xl mb-3">
              Blog <span className="gradient-text">Brenne Aerial</span>
            </h1>
            <p className="font-inter text-muted-foreground max-w-lg">Conseils d'experts, actualités drone, projets et innovations.</p>
          </motion.div>

          {/* Search */}
          <div className="relative mb-5 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Rechercher un article..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-card border border-border font-inter text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Filters */}
          <div className="flex gap-2 overflow-x-auto pb-2 mb-10">
            {CATEGORIES.map(cat => (
              <button key={cat.key} onClick={() => setActiveCategory(cat.key)}
                className={`flex-shrink-0 px-4 py-1.5 rounded-full font-inter text-xs border transition-all ${
                  activeCategory === cat.key ? 'bg-primary text-primary-foreground border-primary' : 'border-border text-muted-foreground hover:text-foreground'
                }`}>
                {cat.label}
              </button>
            ))}
          </div>

          {featured && (
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
              <Link to={`/blog/${featured.id}`}
                className="group grid grid-cols-1 lg:grid-cols-2 rounded-2xl overflow-hidden border border-border bg-card hover:border-primary/30 transition-all duration-300 hover-lift">
                <div className="relative overflow-hidden aspect-video lg:aspect-auto">
                  <img src={featured.cover_url} alt={featured.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    style={{ filter: 'brightness(0.8) saturate(0.85)' }} />
                  <div className="absolute inset-0 bg-gradient-to-r from-card/50 to-transparent" />
                  <div className="absolute top-4 left-4">
                    <span className={`font-mono text-[10px] px-2 py-1 rounded-full border ${CAT_COLORS[featured.category] || 'text-muted-foreground bg-muted border-border'}`}>
                      {featured.category}
                    </span>
                  </div>
                </div>
                <div className="p-8 flex flex-col justify-center">
                  <span className="font-mono text-xs text-primary mb-2">Article à la une</span>
                  <h2 className="font-grotesk font-bold text-xl lg:text-2xl mb-3 group-hover:text-primary transition-colors">{featured.title}</h2>
                  <p className="font-inter text-sm text-muted-foreground leading-relaxed mb-4">{featured.excerpt}</p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground font-mono">
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{featured.reading_time} min</span>
                    <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{featured.views}</span>
                    <span>{featured.author}</span>
                  </div>
                </div>
              </Link>
            </motion.div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {rest.map((post, i) => (
              <motion.div key={post.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.07 }}>
                <Link to={`/blog/${post.id}`}
                  className="group block rounded-xl overflow-hidden border border-border bg-card hover:border-primary/30 transition-all duration-300 hover-lift">
                  <div className="relative overflow-hidden aspect-video">
                    <img src={post.cover_url} alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      style={{ filter: 'brightness(0.75) saturate(0.8)' }} />
                    <div className="absolute top-3 left-3">
                      <span className={`font-mono text-[10px] px-2 py-0.5 rounded-full border ${CAT_COLORS[post.category] || 'text-muted-foreground bg-muted border-border'}`}>
                        {post.category}
                      </span>
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="font-grotesk font-semibold text-sm mb-2 group-hover:text-primary transition-colors line-clamp-2">{post.title}</h3>
                    <p className="font-inter text-xs text-muted-foreground line-clamp-2 mb-3">{post.excerpt}</p>
                    <div className="flex items-center justify-between text-xs text-muted-foreground font-mono">
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{post.reading_time} min</span>
                      <span className="flex items-center gap-1 group-hover:text-primary transition-colors">
                        Lire <ArrowRight className="w-3 h-3 ml-1" />
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}