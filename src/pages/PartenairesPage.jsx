import React, { useState } from 'react';
import { usePageEnabled } from '@/hooks/usePageEnabled';
import FeatureDisabled from '@/components/shared/FeatureDisabled';
import { motion } from 'framer-motion';
import { ExternalLink, Phone, Mail, MapPin, Star, Users, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

const CATEGORY_LABELS = {
  couvreur: '🏠 Couvreur',
  architecte: '📐 Architecte',
  geometre: '📏 Géomètre',
  btp: '🏗️ BTP / Chantier',
  immobilier: '🏢 Immobilier',
  autre: '🔧 Autre',
};

const CATEGORY_COLORS = {
  couvreur: 'bg-orange-400/10 text-orange-400 border-orange-400/30',
  architecte: 'bg-blue-400/10 text-blue-400 border-blue-400/30',
  geometre: 'bg-green-400/10 text-green-400 border-green-400/30',
  btp: 'bg-amber-400/10 text-amber-400 border-amber-400/30',
  immobilier: 'bg-purple-400/10 text-purple-400 border-purple-400/30',
  autre: 'bg-muted text-muted-foreground border-border',
};

// Demo partners if DB is empty
const DEMO_PARTNERS = [
  { id: 1, name: 'Couverture Bretagne Loire', category: 'couvreur', description: 'Expert en rénovation et entretien de toitures depuis 20 ans. Partenaire privilégié pour inspections drone.', location: 'Nantes (44)', website: '#', is_featured: true },
  { id: 2, name: 'Cabinet Moreau Architecture', category: 'architecte', description: 'Architecture résidentielle et commerciale. Utilise nos vues aériennes pour les dossiers permis de construire.', location: 'La Baule (44)', website: '#', is_featured: true },
  { id: 3, name: 'Géomètres Associés de Brenne', category: 'geometre', description: 'Levés topographiques et bornage. Nos drones complètent leurs relevés terrain pour les grands projets.', location: 'Châteauroux (36)', website: '#', is_featured: false },
  { id: 4, name: 'BTP Constructions Loire', category: 'btp', description: 'Entreprise générale de construction. Suivi de chantier par drone pour chaque phase de leurs projets.', location: 'Saint-Nazaire (44)', website: '#', is_featured: false },
  { id: 5, name: 'Laforêt Immobilier Nantes', category: 'immobilier', description: 'Agence immobilière partenaire. Utilise nos captations aériennes pour valoriser les biens d\'exception.', location: 'Nantes (44)', website: '#', is_featured: true },
];

export default function PartenairesPage() {
  const { enabled, isLoading: checkingEnabled } = usePageEnabled('page_partenaires_enabled');
  const [filter, setFilter] = useState('all');
  if (checkingEnabled) return null;
  if (!enabled) return <FeatureDisabled title="Partenaires indisponible" message="L'annuaire des partenaires est temporairement désactivé." />;

  const { data: dbPartners = [] } = useQuery({
    queryKey: ['partners-public'],
    queryFn: () => base44.entities.Partner.filter({ is_active: true }),
  });

  const partners = dbPartners.length > 0 ? dbPartners : DEMO_PARTNERS;
  const filtered = filter === 'all' ? partners : partners.filter(p => p.category === filter);
  const featured = partners.filter(p => p.is_featured);

  const categories = ['all', ...new Set(partners.map(p => p.category))];

  return (
    <div className="pt-16 min-h-screen">
      {/* Hero */}
      <section className="relative py-24 px-5 overflow-hidden">
        <div className="absolute inset-0 grid-bg" />
        <div className="relative max-w-7xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
            <p className="font-mono text-xs text-primary mb-4 tracking-widest uppercase">— Notre réseau</p>
            <h1 className="font-grotesk font-bold text-5xl sm:text-7xl mb-4">
              Annuaire des <span className="gradient-text">Partenaires</span>
            </h1>
            <p className="font-inter text-lg text-muted-foreground max-w-2xl mx-auto">
              Couvreurs, architectes, géomètres, agents immobiliers — les professionnels de confiance avec lesquels nous collaborons au quotidien.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Featured */}
      {featured.length > 0 && (
        <section className="py-12 px-5 lg:px-10 max-w-7xl mx-auto">
          <h2 className="font-grotesk font-bold text-xl mb-6 flex items-center gap-2">
            <Star className="w-5 h-5 text-amber-400" /> Partenaires à la une
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {featured.slice(0, 3).map((p, i) => (
              <motion.div key={p.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="p-5 rounded-2xl bg-card border border-primary/20 hover:border-primary/40 sky-glow transition-all hover-lift">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                    {p.logo_url
                      ? <img src={p.logo_url} alt="" className="w-full h-full object-cover rounded-xl" />
                      : <span className="font-grotesk font-bold text-lg text-primary">{p.name[0]}</span>
                    }
                  </div>
                  <span className={`font-mono text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded-full border ${CATEGORY_COLORS[p.category]}`}>
                    {CATEGORY_LABELS[p.category]}
                  </span>
                </div>
                <h3 className="font-grotesk font-bold text-sm mb-1">{p.name}</h3>
                {p.location && (
                  <p className="font-inter text-xs text-muted-foreground flex items-center gap-1 mb-2">
                    <MapPin className="w-3 h-3" /> {p.location}
                  </p>
                )}
                {p.description && <p className="font-inter text-xs text-muted-foreground leading-relaxed mb-4">{p.description}</p>}
                <div className="flex gap-2">
                  {p.website && p.website !== '#' && (
                    <a href={p.website} target="_blank" rel="noopener noreferrer">
                      <Button size="sm" variant="outline" className="border-border gap-1.5 text-xs">
                        <ExternalLink className="w-3 h-3" /> Site web
                      </Button>
                    </a>
                  )}
                  {p.phone && (
                    <a href={`tel:${p.phone}`}>
                      <Button size="sm" variant="outline" className="border-border gap-1.5 text-xs">
                        <Phone className="w-3 h-3" /> Appeler
                      </Button>
                    </a>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* All partners */}
      <section className="py-12 px-5 lg:px-10 max-w-7xl mx-auto pb-24">
        {/* Filters */}
        <div className="flex gap-2 flex-wrap mb-8">
          {categories.map(cat => (
            <button key={cat} onClick={() => setFilter(cat)}
              className={`px-4 py-2 rounded-full font-inter text-xs font-semibold border transition-all ${
                filter === cat ? 'bg-primary text-primary-foreground border-primary' : 'border-border text-muted-foreground hover:border-primary/50'
              }`}>
              {cat === 'all' ? `Tous (${partners.length})` : CATEGORY_LABELS[cat]}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((p, i) => (
            <motion.div key={p.id} initial={{ opacity: 0, scale: 0.96 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}
              className="p-4 rounded-xl bg-card border border-border hover:border-primary/30 transition-all">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  {p.logo_url
                    ? <img src={p.logo_url} alt="" className="w-full h-full object-cover rounded-lg" />
                    : <span className="font-grotesk font-bold text-sm text-primary">{p.name[0]}</span>
                  }
                </div>
                <div className="min-w-0">
                  <p className="font-grotesk font-semibold text-sm truncate">{p.name}</p>
                  <span className={`font-mono text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${CATEGORY_COLORS[p.category]}`}>
                    {CATEGORY_LABELS[p.category]}
                  </span>
                </div>
              </div>
              {p.location && <p className="font-inter text-xs text-muted-foreground flex items-center gap-1 mb-2"><MapPin className="w-3 h-3" />{p.location}</p>}
              {p.description && <p className="font-inter text-xs text-muted-foreground line-clamp-2 mb-3">{p.description}</p>}
              <div className="flex gap-1.5">
                {p.website && p.website !== '#' && (
                  <a href={p.website} target="_blank" rel="noopener noreferrer">
                    <Button size="sm" variant="outline" className="border-border p-2 h-7"><ExternalLink className="w-3 h-3" /></Button>
                  </a>
                )}
                {p.phone && <a href={`tel:${p.phone}`}><Button size="sm" variant="outline" className="border-border p-2 h-7"><Phone className="w-3 h-3" /></Button></a>}
                {p.email && <a href={`mailto:${p.email}`}><Button size="sm" variant="outline" className="border-border p-2 h-7"><Mail className="w-3 h-3" /></Button></a>}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Become partner CTA */}
        <div className="mt-16 p-8 rounded-2xl bg-primary/5 border border-primary/20 text-center">
          <Users className="w-10 h-10 text-primary mx-auto mb-4" />
          <h2 className="font-grotesk font-bold text-2xl mb-2">Rejoindre le réseau</h2>
          <p className="font-inter text-sm text-muted-foreground max-w-lg mx-auto mb-6">
            Vous êtes couvreur, architecte, géomètre ou agent immobilier ? Collaborons ensemble et apparaissez dans notre annuaire.
          </p>
          <a href="/contact">
            <Button className="bg-primary text-primary-foreground gap-2 font-grotesk font-semibold">
              Nous contacter <ArrowRight className="w-4 h-4" />
            </Button>
          </a>
        </div>
      </section>
    </div>
  );
}