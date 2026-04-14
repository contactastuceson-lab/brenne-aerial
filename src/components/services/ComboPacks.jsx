import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Check, Star, ArrowRight, Building2, HardHat } from 'lucide-react';
import { Button } from '@/components/ui/button';

const PACKS = [
  {
    key: 'immo',
    icon: Building2,
    badge: 'Le plus populaire',
    badgeColor: 'text-primary bg-primary/10 border-primary/30',
    title: 'Pack Immo Premium',
    sub: 'Pour agents immobiliers & promoteurs',
    desc: 'La solution complète pour valoriser vos biens et multiplier les visites qualifiées. Photos HD aériennes, vidéo cinématographique 4K et visite virtuelle 360° interactive.',
    features: [
      'Photos aériennes HD (20+ clichés retouchés)',
      'Vidéo cinématographique 4K · Montage inclus',
      'Visite virtuelle 360° navigable',
      'Intégration portails immobiliers (SeLoger, Leboncoin…)',
      'Livraison en 72h',
    ],
    price: 'À partir de 490€',
    saving: 'Économisez 20% vs séparé',
    color: 'text-primary',
    bg: 'from-primary/10 to-accent/5',
    border: 'border-primary/30',
    glow: 'shadow-primary/10',
    image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&auto=format&fit=crop&q=70',
  },
  {
    key: 'chantier',
    icon: HardHat,
    badge: 'Idéal BTP',
    badgeColor: 'text-chart-5 bg-chart-5/10 border-chart-5/30',
    title: 'Pack Chantier A à Z',
    sub: 'Pour maîtres d\'ouvrage & entreprises BTP',
    desc: 'Documentez l\'intégralité de votre chantier du premier coup de pelle à la livraison. Suivi mensuel régulier + timelapse final spectaculaire pour vos communications.',
    features: [
      'Passage mensuel (photos + vidéo HD)',
      'Cartographie de progression géoréférencée',
      'Rapport comparatif d\'avancement',
      'Timelapse final de la construction',
      'Livrables pour DOE & communication',
    ],
    price: 'À partir de 290€/mois',
    saving: 'Abonnement flexible · Sans engagement',
    color: 'text-chart-5',
    bg: 'from-chart-5/10 to-primary/5',
    border: 'border-chart-5/30',
    glow: 'shadow-chart-5/10',
    image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&auto=format&fit=crop&q=70',
  },
];

export default function ComboPacks() {
  return (
    <section className="py-20 px-5 lg:px-10 max-w-7xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
        <p className="font-mono text-xs text-primary mb-2 tracking-widest uppercase">— Offres groupées</p>
        <h2 className="font-grotesk font-bold text-3xl sm:text-4xl mb-3">
          Packs <span className="gradient-text">Combo</span>
        </h2>
        <p className="font-inter text-muted-foreground max-w-xl mx-auto text-sm">
          Des offres pensées pour maximiser la valeur de chaque mission. Moins cher qu'à la carte, plus efficace.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {PACKS.map((pack, i) => {
          const Icon = pack.icon;
          return (
            <motion.div
              key={pack.key}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className={`relative rounded-2xl border ${pack.border} overflow-hidden shadow-xl ${pack.glow} hover-lift`}
            >
              {/* Image header */}
              <div className="relative h-48 overflow-hidden">
                <img src={pack.image} alt={pack.title} className="w-full h-full object-cover" style={{ filter: 'brightness(0.65) saturate(0.8)' }} />
                <div className={`absolute inset-0 bg-gradient-to-t ${pack.bg} via-transparent to-transparent`} />
                <div className="absolute top-4 left-4">
                  <span className={`font-mono text-[10px] px-2.5 py-1 rounded-full border font-semibold ${pack.badgeColor}`}>
                    ⭐ {pack.badge}
                  </span>
                </div>
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-lg bg-background/20 backdrop-blur-sm flex items-center justify-center`}>
                      <Icon className={`w-4 h-4 ${pack.color}`} />
                    </div>
                    <div>
                      <h3 className="font-grotesk font-bold text-white text-lg leading-tight">{pack.title}</h3>
                      <p className="font-mono text-[10px] text-white/60">{pack.sub}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 bg-card">
                <p className="font-inter text-sm text-muted-foreground leading-relaxed mb-5">{pack.desc}</p>

                <ul className="space-y-2.5 mb-6">
                  {pack.features.map(f => (
                    <li key={f} className="flex items-start gap-2.5">
                      <Check className={`w-4 h-4 ${pack.color} flex-shrink-0 mt-0.5`} />
                      <span className="font-inter text-xs text-muted-foreground">{f}</span>
                    </li>
                  ))}
                </ul>

                <div className="flex items-center justify-between">
                  <div>
                    <p className={`font-grotesk font-bold text-lg ${pack.color}`}>{pack.price}</p>
                    <p className="font-mono text-[10px] text-muted-foreground">{pack.saving}</p>
                  </div>
                  <Link to="/quote">
                    <Button className={`bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 font-grotesk font-semibold gap-1.5`}>
                      Devis <ArrowRight className="w-3.5 h-3.5" />
                    </Button>
                  </Link>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}