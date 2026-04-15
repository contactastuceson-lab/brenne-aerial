import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import BeforeAfterSlider from '@/components/shared/BeforeAfterSlider';

const CATEGORIES = [
  { key: 'all', label: 'Tout' },
  { key: 'inspection', label: 'Inspection' },
  { key: 'immobilier', label: 'Immobilier' },
  { key: 'evenement', label: 'Événement' },
  { key: 'retouche', label: 'Retouche' },
  { key: 'chantier', label: 'Chantier' },
];

export default function BeforeAfterPage() {
  const [activeCategory, setActiveCategory] = useState('all');

  const { data: items = [] } = useQuery({
    queryKey: ['before-after-gallery'],
    queryFn: () => base44.entities.BeforeAfterGallery.filter({ is_published: true }, 'order', 50),
  });

  const filtered = activeCategory === 'all' ? items : items.filter(i => i.category === activeCategory);

  return (
    <div className="pt-16">
      <section className="py-24 px-5 lg:px-10 text-center relative overflow-hidden">
        <div className="absolute inset-0 grid-bg" />
        <div className="relative max-w-3xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
            <p className="font-mono text-xs text-primary mb-4 tracking-widest uppercase">— Galerie comparative</p>
            <h1 className="font-grotesk font-bold text-5xl sm:text-6xl mb-4">
              Avant <span className="gradient-text">/</span> Après
            </h1>
            <p className="font-inter text-muted-foreground">
              Glissez le curseur pour comparer les résultats de nos interventions.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Filters */}
      <div className="sticky top-16 z-40 glass border-b border-border">
        <div className="max-w-7xl mx-auto px-5 lg:px-10 py-3 flex gap-2 overflow-x-auto">
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

      <div className="max-w-7xl mx-auto px-5 lg:px-10 py-12">
        {filtered.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground font-inter text-sm">
            Aucune comparaison disponible pour le moment.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((item, i) => (
              <motion.div key={item.id}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.07 }}>
                <div className="bg-card border border-border rounded-xl overflow-hidden">
                  <BeforeAfterSlider
                    beforeUrl={item.before_url}
                    afterUrl={item.after_url}
                    beforeLabel={item.before_label || 'Avant'}
                    afterLabel={item.after_label || 'Après'}
                  />
                  <div className="p-4">
                    {item.category && (
                      <span className="font-mono text-[10px] text-primary">{item.category}</span>
                    )}
                    <h3 className="font-grotesk font-semibold text-sm mt-0.5">{item.title}</h3>
                    {item.description && (
                      <p className="font-inter text-xs text-muted-foreground mt-1">{item.description}</p>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}