import React, { useState } from 'react';
import { usePageEnabled } from '@/hooks/usePageEnabled';
import FeatureDisabled from '@/components/shared/FeatureDisabled';
import { motion } from 'framer-motion';
import { Building2, ChevronUp, ChevronDown, Eye, ArrowRight, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const FLOORS = [
  {
    floor: 1,
    height: '~3m',
    // Vue de rue, niveau piéton — façades, trottoir, voitures au premier plan
    view: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=1400&auto=format&fit=crop&q=85',
    desc: 'Vue de rue au niveau du sol. Façades et obstacles au premier plan, horizon bouché par les immeubles voisins.',
  },
  {
    floor: 2,
    height: '~6m',
    // Vue légèrement surélevée — début de dégagement, toits bas visibles
    view: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=1400&auto=format&fit=crop&q=85',
    desc: 'Léger dégagement. Les toits des immeubles bas deviennent visibles. Rue encore visible au premier plan.',
  },
  {
    floor: 3,
    height: '~9m',
    // Vue mi-hauteur — panorama urbain qui commence à se dégager
    view: 'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=1400&auto=format&fit=crop&q=85',
    desc: 'Vue sur les toitures et la place centrale. La lumière du jour pénètre mieux. Horizon partiellement dégagé.',
  },
  {
    floor: 4,
    height: '~12m',
    // Vue aérienne intermédiaire — skyline urbaine bien visible
    view: 'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=1400&auto=format&fit=crop&q=85',
    desc: 'Panorama urbain dégagé. Les obstacles visuels disparaissent. Vue considérée comme "prime" en immobilier.',
  },
  {
    floor: 5,
    height: '~15m',
    // Vue haute sur toits — horizon très dégagé
    view: 'https://images.unsplash.com/photo-1444723121867-7a241cacace9?w=1400&auto=format&fit=crop&q=85',
    desc: 'Vue dominante sur les toits. Horizon très dégagé. Luminosité exceptionnelle toute la journée.',
  },
  {
    floor: 6,
    height: '~18m',
    // Vue aérienne drone — ville à vol d'oiseau, coucher de soleil
    view: 'https://images.unsplash.com/photo-1512100356356-de1b84283e18?w=1400&auto=format&fit=crop&q=85',
    desc: 'Vue imprenable à 18m. Les couchers de soleil sont spectaculaires. Dernier étage — valorisation maximale.',
  },
];

export default function SimulateurVuePage() {
  const { enabled, isLoading: checkingEnabled } = usePageEnabled('page_simulateur_enabled');
  const [floor, setFloor] = useState(3);
  if (checkingEnabled) return null;
  if (!enabled) return <FeatureDisabled title="Simulateur indisponible" message="Le simulateur de vue est temporairement désactivé." />;
  const current = FLOORS[floor - 1];

  return (
    <div className="pt-24 min-h-screen pb-20 px-5 lg:px-10">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <div className="inline-flex items-center gap-2 font-mono text-xs text-primary border border-primary/30 bg-primary/5 px-3 py-1.5 rounded-full mb-4">
            <Building2 className="w-3.5 h-3.5" /> Immobilier neuf
          </div>
          <h1 className="font-grotesk font-bold text-4xl sm:text-5xl mb-4">
            Simulateur de <span className="gradient-text">Vue</span>
          </h1>
          <p className="font-inter text-muted-foreground max-w-2xl leading-relaxed">
            Avant d'acheter, voyez exactement ce que vous verrez depuis votre futur appartement. 
            Notre drone capture la vue réelle à chaque hauteur d'étage — pour décider en toute clarté.
          </p>
        </motion.div>

        {/* Simulator */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-12">
          {/* Floor selector */}
          <div className="lg:col-span-1">
            <div className="bg-card border border-border rounded-2xl p-4">
              <p className="font-mono text-xs text-muted-foreground uppercase tracking-widest mb-4">Choisir l'étage</p>
              <div className="space-y-2">
                {FLOORS.slice().reverse().map((f) => (
                  <button
                    key={f.floor}
                    onClick={() => setFloor(f.floor)}
                    className={`w-full text-left px-4 py-3 rounded-xl border transition-all ${
                      floor === f.floor
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border hover:border-primary/30 text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <span className="font-grotesk font-bold">{f.floor}ème</span>
                    <span className="font-mono text-xs ml-2 opacity-70">{f.height}</span>
                  </button>
                ))}
              </div>

              {/* Up/Down controls */}
              <div className="flex gap-2 mt-4">
                <Button size="sm" variant="outline" className="flex-1" onClick={() => setFloor(f => Math.min(f + 1, 6))} disabled={floor === 6}>
                  <ChevronUp className="w-4 h-4" />
                </Button>
                <Button size="sm" variant="outline" className="flex-1" onClick={() => setFloor(f => Math.max(f - 1, 1))} disabled={floor === 1}>
                  <ChevronDown className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* View display */}
          <div className="lg:col-span-3">
            <motion.div
              key={floor}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="relative rounded-2xl overflow-hidden border border-border aspect-video"
            >
              <img src={current.view} alt={`Vue ${floor}ème étage`} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent" />

              {/* HUD overlay */}
              <div className="absolute top-4 left-4 font-mono text-xs bg-background/70 backdrop-blur-sm border border-border rounded-lg px-3 py-2">
                <div className="flex items-center gap-2">
                  <Eye className="w-3.5 h-3.5 text-primary" />
                  <span>{floor}ème étage — Altitude {current.height}</span>
                </div>
              </div>
              <div className="absolute top-4 right-4 font-mono text-[10px] bg-primary/10 backdrop-blur-sm border border-primary/30 text-primary rounded-lg px-2.5 py-1.5 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                Vue simulée drone
              </div>

              {/* Description */}
              <div className="absolute bottom-4 left-4 right-4">
                <div className="glass rounded-xl p-4">
                  <p className="font-grotesk font-semibold text-sm mb-1">Étage {floor} — {current.height}</p>
                  <p className="font-inter text-xs text-muted-foreground">{current.desc}</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* For promoters */}
        <div className="bg-card border border-border rounded-2xl p-8">
          <div className="flex items-start gap-4 flex-wrap">
            <div className="flex-1 min-w-64">
              <div className="flex items-center gap-2 mb-3">
                <Star className="w-5 h-5 text-yellow-400" />
                <h2 className="font-grotesk font-bold text-xl">Pour les promoteurs immobiliers</h2>
              </div>
              <p className="font-inter text-sm text-muted-foreground leading-relaxed mb-4">
                Offrez à vos acheteurs sur plan une expérience unique : voir exactement leur future vue 
                avant de signer. Nous capturons la vue réelle à chaque étage de votre futur immeuble, 
                dès la phase de construction ou même depuis le terrain vide.
              </p>
              <ul className="space-y-2 mb-6">
                {[
                  'Prises de vue à chaque niveau d\'étage',
                  'Livraison en 360° ou format standard',
                  'Intégration possible sur votre site de vente',
                  'Argument commercial différenciant',
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-2 font-inter text-sm">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link to="/quote">
                <Button className="bg-primary sky-glow gap-2 font-grotesk font-semibold">
                  Obtenir un devis <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}