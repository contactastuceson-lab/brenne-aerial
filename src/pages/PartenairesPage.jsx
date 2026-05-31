import React, { useState } from 'react';
import { usePageEnabled } from '@/hooks/usePageEnabled';
import FeatureDisabled from '@/components/shared/FeatureDisabled';
import { motion } from 'framer-motion';
import { ExternalLink, Phone, Mail, MapPin, Star, Users, ArrowRight, Handshake, ChevronRight } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';

const CATEGORY_CONFIG = {
  couvreur:    { label: 'Couvreur',    emoji: '🏠', color: 'text-orange-400', bg: 'bg-orange-400/10', border: 'border-orange-400/25' },
  architecte:  { label: 'Architecte', emoji: '📐', color: 'text-blue-400',   bg: 'bg-blue-400/10',   border: 'border-blue-400/25'   },
  geometre:    { label: 'Géomètre',   emoji: '📏', color: 'text-green-400',  bg: 'bg-green-400/10',  border: 'border-green-400/25'  },
  btp:         { label: 'BTP',        emoji: '🏗️', color: 'text-amber-400',  bg: 'bg-amber-400/10',  border: 'border-amber-400/25'  },
  immobilier:  { label: 'Immobilier', emoji: '🏢', color: 'text-purple-400', bg: 'bg-purple-400/10', border: 'border-purple-400/25' },
  autre:       { label: 'Autre',      emoji: '🔧', color: 'text-muted-foreground', bg: 'bg-muted', border: 'border-border' },
};

const DEMO_PARTNERS = [
  { id: 1, name: 'Couverture Bretagne Loire', category: 'couvreur', description: 'Expert en rénovation et entretien de toitures depuis 20 ans. Partenaire privilégié pour nos inspections drone.', location: 'Nantes (44)', website: '#', is_featured: true },
  { id: 2, name: 'Cabinet Moreau Architecture', category: 'architecte', description: 'Architecture résidentielle et commerciale. Utilise nos vues aériennes pour les dossiers permis de construire.', location: 'La Baule (44)', website: '#', is_featured: true },
  { id: 3, name: 'Géomètres Associés de Brenne', category: 'geometre', description: 'Levés topographiques et bornage. Nos drones complètent leurs relevés terrain sur les grands projets.', location: 'Châteauroux (36)', website: '#', is_featured: false },
  { id: 4, name: 'BTP Constructions Loire', category: 'btp', description: 'Entreprise générale de construction. Suivi de chantier par drone pour chaque phase de leurs projets.', location: 'Saint-Nazaire (44)', website: '#', is_featured: false },
  { id: 5, name: 'Laforêt Immobilier Nantes', category: 'immobilier', description: 'Agence immobilière partenaire. Captations aériennes pour valoriser leurs biens d\'exception.', location: 'Nantes (44)', website: '#', is_featured: true },
];

const PERKS = [
  { icon: Star, title: 'Visibilité accrue', desc: 'Apparaissez dans notre annuaire consulté par des centaines de prospects chaque mois.' },
  { icon: Handshake, title: 'Tarifs préférentiels', desc: 'Accédez à nos prestations drone à des tarifs négociés réservés aux partenaires.' },
  { icon: ArrowRight, title: 'Recommandations croisées', desc: 'Nous nous recommandons mutuellement à nos clients respectifs.' },
];

export default function PartenairesPage() {
  const { enabled, isLoading: checkingEnabled } = usePageEnabled('page_partenaires_enabled');
  const [filter, setFilter] = useState('all');

  const { data: dbPartners = [] } = useQuery({
    queryKey: ['partners-public'],
    queryFn: () => base44.entities.Partner.filter({ is_active: true }),
  });

  if (checkingEnabled) return null;
  if (!enabled) return <FeatureDisabled title="Partenaires indisponible" message="L'annuaire des partenaires est temporairement désactivé." />;

  const partners = dbPartners.length > 0 ? dbPartners : DEMO_PARTNERS;
  const filtered = filter === 'all' ? partners : partners.filter(p => p.category === filter);
  const featured = partners.filter(p => p.is_featured);
  const categories = ['all', ...new Set(partners.map(p => p.category))];

  return (
    <div className="min-h-screen">

      {/* ── Hero ── */}
      <section className="relative pt-32 pb-20 px-5 overflow-hidden">
        <div className="absolute inset-0 grid-bg opacity-50" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background" />
        <div className="relative max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="inline-flex items-center gap-2 font-mono text-xs text-primary border border-primary/30 bg-primary/5 px-3 py-1.5 rounded-full mb-5">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              Notre réseau de confiance
            </div>
            <h1 className="font-grotesk font-bold text-5xl sm:text-6xl mb-5 leading-[1.05]">
              Les partenaires<br />
              <span className="gradient-text">qui nous font confiance</span>
            </h1>
            <p className="font-inter text-lg text-muted-foreground max-w-xl leading-relaxed">
              Couvreurs, architectes, géomètres, agents immobiliers — des professionnels rigoureusement sélectionnés avec qui nous collaborons au quotidien.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── Featured spotlight ── */}
      {featured.length > 0 && (
        <section className="px-5 lg:px-10 max-w-7xl mx-auto mb-16">
          <div className="flex items-center gap-2 mb-6">
            <Star className="w-4 h-4 text-amber-400" />
            <span className="font-grotesk font-semibold text-sm">Partenaires à la une</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {featured.slice(0, 3).map((p, i) => {
              const cat = CATEGORY_CONFIG[p.category] || CATEGORY_CONFIG.autre;
              return (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className="group relative bg-card border border-border hover:border-primary/40 rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/5 overflow-hidden"
                >
                  {/* Top glow accent */}
                  <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  <div className="flex items-start justify-between mb-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-secondary to-secondary/50 border border-border flex items-center justify-center flex-shrink-0">
                      {p.logo_url
                        ? <img src={p.logo_url} alt="" className="w-full h-full object-cover rounded-2xl" />
                        : <span className="font-grotesk font-bold text-xl text-foreground/60">{p.name[0]}</span>
                      }
                    </div>
                    <span className={`font-mono text-[10px] font-semibold px-2.5 py-1 rounded-full border ${cat.color} ${cat.bg} ${cat.border}`}>
                      {cat.emoji} {cat.label}
                    </span>
                  </div>

                  <h3 className="font-grotesk font-bold text-base mb-1 leading-tight">{p.name}</h3>
                  {p.location && (
                    <p className="font-inter text-xs text-muted-foreground flex items-center gap-1.5 mb-3">
                      <MapPin className="w-3 h-3" /> {p.location}
                    </p>
                  )}
                  {p.description && (
                    <p className="font-inter text-sm text-foreground/60 leading-relaxed mb-5 line-clamp-2">{p.description}</p>
                  )}

                  <div className="flex gap-2">
                    {p.website && p.website !== '#' && (
                      <a href={p.website} target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 font-inter text-xs font-medium text-primary hover:text-primary/80 transition-colors cursor-pointer">
                        <ExternalLink className="w-3 h-3" /> Site web
                      </a>
                    )}
                    {p.phone && (
                      <a href={`tel:${p.phone}`}
                        className="inline-flex items-center gap-1.5 font-inter text-xs font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                        <Phone className="w-3 h-3" /> Appeler
                      </a>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </section>
      )}

      {/* ── All partners ── */}
      <section className="px-5 lg:px-10 max-w-7xl mx-auto pb-8">
        {/* Filter pills */}
        <div className="flex gap-2 flex-wrap mb-8">
          {categories.map(cat => {
            const cfg = CATEGORY_CONFIG[cat];
            const isActive = filter === cat;
            return (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`px-4 py-2 rounded-full font-inter text-xs font-semibold border transition-all duration-150 cursor-pointer ${
                  isActive
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'border-border text-muted-foreground hover:border-primary/40 hover:text-foreground'
                }`}
              >
                {cat === 'all' ? `Tous les partenaires (${partners.length})` : `${cfg?.emoji} ${cfg?.label}`}
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((p, i) => {
            const cat = CATEGORY_CONFIG[p.category] || CATEGORY_CONFIG.autre;
            return (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, scale: 0.97 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.04 }}
                className="group bg-card border border-border hover:border-primary/30 rounded-xl p-4 transition-all duration-200 hover:-translate-y-0.5"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center flex-shrink-0 border border-border">
                    {p.logo_url
                      ? <img src={p.logo_url} alt="" className="w-full h-full object-cover rounded-xl" />
                      : <span className="font-grotesk font-bold text-sm text-foreground/50">{p.name[0]}</span>
                    }
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-grotesk font-semibold text-sm truncate leading-tight">{p.name}</p>
                    <span className={`inline-block font-mono text-[9px] mt-0.5 px-1.5 py-0.5 rounded-full border ${cat.color} ${cat.bg} ${cat.border}`}>
                      {cat.emoji} {cat.label}
                    </span>
                  </div>
                </div>

                {p.location && (
                  <p className="font-inter text-xs text-muted-foreground flex items-center gap-1 mb-2">
                    <MapPin className="w-3 h-3 flex-shrink-0" />{p.location}
                  </p>
                )}
                {p.description && (
                  <p className="font-inter text-xs text-foreground/55 line-clamp-2 mb-3 leading-relaxed">{p.description}</p>
                )}

                <div className="flex gap-2 pt-1 border-t border-border/50">
                  {p.website && p.website !== '#' && (
                    <a href={p.website} target="_blank" rel="noopener noreferrer"
                      className="flex items-center justify-center w-7 h-7 rounded-lg bg-secondary hover:bg-primary/10 transition-colors cursor-pointer" title="Site web">
                      <ExternalLink className="w-3 h-3 text-muted-foreground" />
                    </a>
                  )}
                  {p.phone && (
                    <a href={`tel:${p.phone}`}
                      className="flex items-center justify-center w-7 h-7 rounded-lg bg-secondary hover:bg-primary/10 transition-colors cursor-pointer" title="Téléphone">
                      <Phone className="w-3 h-3 text-muted-foreground" />
                    </a>
                  )}
                  {p.email && (
                    <a href={`mailto:${p.email}`}
                      className="flex items-center justify-center w-7 h-7 rounded-lg bg-secondary hover:bg-primary/10 transition-colors cursor-pointer" title="E-mail">
                      <Mail className="w-3 h-3 text-muted-foreground" />
                    </a>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* ── Why partner ── */}
      <section className="px-5 lg:px-10 max-w-7xl mx-auto py-16">
        <div className="rounded-3xl border border-border bg-card overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            {/* Left: CTA */}
            <div className="p-10 lg:p-14 flex flex-col justify-center">
              <div className="inline-flex items-center gap-2 font-mono text-xs text-primary border border-primary/30 bg-primary/5 px-3 py-1.5 rounded-full mb-6 self-start">
                <Users className="w-3.5 h-3.5" /> Devenez partenaire
              </div>
              <h2 className="font-grotesk font-bold text-3xl sm:text-4xl mb-4 leading-tight">
                Rejoignez<br />notre réseau
              </h2>
              <p className="font-inter text-muted-foreground leading-relaxed mb-8">
                Vous êtes couvreur, architecte, géomètre ou agent immobilier ? Intégrez notre réseau et bénéficiez d'une visibilité qualifiée auprès de nos clients.
              </p>
              <Link to="/contact">
                <button className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-grotesk font-semibold text-sm hover:bg-primary/90 transition-colors duration-150 cursor-pointer self-start">
                  Nous contacter <ChevronRight className="w-4 h-4" />
                </button>
              </Link>
            </div>

            {/* Right: perks */}
            <div className="border-t lg:border-t-0 lg:border-l border-border p-10 lg:p-14 flex flex-col justify-center gap-6">
              {PERKS.map((perk, i) => {
                const Icon = perk.icon;
                return (
                  <div key={i} className="flex items-start gap-4">
                    <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Icon className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-grotesk font-semibold text-sm mb-0.5">{perk.title}</p>
                      <p className="font-inter text-sm text-muted-foreground leading-relaxed">{perk.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}