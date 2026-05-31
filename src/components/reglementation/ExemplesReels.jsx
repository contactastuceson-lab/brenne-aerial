import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Home, Building2, Zap, Film, MapPin } from 'lucide-react';

export default function ExemplesReels() {
  const exemples = [
    {
      titre: '🏠 Photographie immobilière',
      desc: 'Captation aérienne d\'une propriété pour vente ou location.',
      reglementation: 'Catégorie Ouverte (A1) — pas d\'autorisation préalable si propriété dégagée.',
      brenne: 'Nous vérifions les zones d\'approche, obtenons l\'accord du propriétaire, et volons en respectant les distances de sécurité.',
      duree: '2-3 jours',
      cout: 'Budget accessible',
    },
    {
      titre: '🏛️ Collectivités / Communes',
      desc: 'Documentation aérienne d\'un événement public, aménagement urbain, ou patrimoine.',
      reglementation: 'Catégorie Spécifique (STS-01) — autorisation mairie + DSAC requise.',
      brenne: 'Nous contactons votre mairie, demandons les autorisations, et gérons toute l\'administration pour vous.',
      duree: '3-4 semaines (délai autorisation)',
      cout: 'Coût total prévisible',
    },
    {
      titre: '🏭 Inspection de bâtiments',
      desc: 'Inspection de façade, toiture, gouttières ou structures hautes (cheminées, pylônes).',
      reglementation: 'Catégorie Spécifique (STS-01) — autorisation si zone habitée, dérogation aéroportuaire si proche aérodrome.',
      brenne: 'Analyse complète des risques, coordination avec l\'aérodrome si besoin, images haute résolution + rapport détaillé.',
      duree: '1 semaine',
      cout: 'Standard',
    },
    {
      titre: '🎥 Communication d\'entreprise',
      desc: 'Vidéo aérienne pour site web, réseaux sociaux, ou présentations internes.',
      reglementation: 'Dépend du lieu : Ouverte si zone dégagée, Spécifique (STS-01) si zone urbaine/peuplée.',
      brenne: 'Storyboarding, repérage, captation multiangles, montage, droit à l\'image gérés — livraison fichiers 4K.',
      duree: '2-3 semaines',
      cout: 'Premium — qualité cinéma',
    },
    {
      titre: '⚡ Surveillance de chantier',
      desc: 'Documentation progressive du chantier (suivi d\'avancement, sécurité, documentation d\'assurance).',
      reglementation: 'Catégorie Spécifique (STS-01) — survols réguliers nécessitent contrat et autorisation globale.',
      brenne: 'Scénarisation des prises, orthomosaïques, rapports hebdo, archivage sécurisé.',
      duree: 'Continu (semaines/mois)',
      cout: 'Tarification mensuelle préférentielle',
    },
  ];

  const [selected, setSelected] = useState(0);
  const example = exemples[selected];

  return (
    <div className="max-w-4xl mx-auto px-5 lg:px-10 mb-14">
      <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-6">
        <h2 className="font-grotesk font-bold text-2xl mb-2">Exemples réels de missions</h2>
        <p className="font-inter text-sm text-muted-foreground">Cliquez pour découvrir la réglementation et notre approche pour chaque cas</p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2 mb-6">
        {exemples.map((ex, i) => (
          <button
            key={i}
            onClick={() => setSelected(i)}
            className={`p-3 rounded-lg font-inter text-sm font-medium transition-all ${
              selected === i
                ? 'bg-primary border-primary text-primary-foreground shadow-lg'
                : 'bg-card border border-border text-muted-foreground hover:border-primary/30'
            }`}
          >
            {ex.titre.split(' ')[0]} {ex.titre.split(' ')[1]}
          </button>
        ))}
      </div>

      <motion.div
        key={selected}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="bg-card border border-border rounded-2xl p-6 space-y-5"
      >
        <div>
          <h3 className="font-grotesk font-bold text-xl mb-2">{example.titre}</h3>
          <p className="font-inter text-muted-foreground">{example.desc}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20">
            <p className="font-mono text-[10px] uppercase text-amber-400 tracking-wider mb-2">📋 Réglementation</p>
            <p className="font-inter text-sm text-muted-foreground">{example.reglementation}</p>
          </div>

          <div className="p-4 rounded-xl bg-green-500/5 border border-green-500/20">
            <p className="font-mono text-[10px] uppercase text-green-400 tracking-wider mb-2">✅ Notre approche</p>
            <p className="font-inter text-sm text-muted-foreground">{example.brenne}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-2 border-t border-border">
          <div>
            <p className="font-mono text-[9px] uppercase text-muted-foreground tracking-wider mb-1">⏱️ Délai</p>
            <p className="font-inter font-semibold text-sm">{example.duree}</p>
          </div>
          <div>
            <p className="font-mono text-[9px] uppercase text-muted-foreground tracking-wider mb-1">💰 Budget</p>
            <p className="font-inter font-semibold text-sm">{example.cout}</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}