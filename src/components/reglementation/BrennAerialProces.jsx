import React from 'react';
import { motion } from 'framer-motion';
import { Shield, MapPin, FileText, CheckCircle } from 'lucide-react';

export default function BrennAerialProces() {
  const etapes = [
    {
      num: '1',
      titre: 'Analyse de votre projet',
      desc: 'Vous décrivez votre mission : zone, type de drone, objectifs. Nous déterminons quelle catégorie s\'applique (Ouverte ou Spécifique).',
      icon: FileText,
      color: '#3b82f6',
    },
    {
      num: '2',
      titre: 'Vérification réglementaire complète',
      desc: 'Nous consultons Géoportail Drones, vérifions les zones sensibles (aérodromes, militaires, parcs), et contactons les autorités locales si besoin.',
      icon: MapPin,
      color: '#38aadc',
    },
    {
      num: '3',
      titre: 'Demande des autorisations',
      desc: 'Si nécessaire (catégorie Spécifique), nous préparons et déposons la déclaration DSAC, les protocoles municipaux, et les demandes de dérogation.',
      icon: FileText,
      color: '#8b5cf6',
    },
    {
      num: '4',
      titre: 'Validation avant mission',
      desc: 'Vérification météo, tests des équipements, briefing de sécurité, check de l\'assurance RC Pro — tout est contrôlé avant le décollage.',
      icon: CheckCircle,
      color: '#22c55e',
    },
  ];

  return (
    <div className="max-w-5xl mx-auto px-5 lg:px-10 mb-14">
      <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
            <Shield className="w-5 h-5 text-primary" />
          </div>
          <h2 className="font-grotesk font-bold text-2xl">Processus de préparation Brenne Aerial</h2>
        </div>
        <p className="font-inter text-sm text-muted-foreground">Comment nous transformons votre demande en mission conforme et sécurisée</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {etapes.map((e, i) => {
          const Icon = e.icon;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="relative bg-card border border-border rounded-xl p-6 hover:border-primary/20 transition-all"
            >
              {/* Numéro */}
              <div className="absolute -top-4 -left-4 w-8 h-8 rounded-full border-2 border-border bg-background flex items-center justify-center">
                <span className="font-grotesk font-bold text-xs text-primary">{e.num}</span>
              </div>

              <div className="flex items-start gap-4">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: `${e.color}15`, border: `1px solid ${e.color}30` }}
                >
                  <Icon className="w-5 h-5" style={{ color: e.color }} />
                </div>
                <div>
                  <p className="font-grotesk font-bold text-base mb-1">{e.titre}</p>
                  <p className="font-inter text-sm text-muted-foreground leading-relaxed">{e.desc}</p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mt-6 p-5 rounded-xl border border-primary/20 bg-primary/5"
      >
        <p className="font-inter text-sm text-muted-foreground">
          <strong className="text-primary">Résultat :</strong> Vous n'avez à vous préoccuper de rien. Nous gérons les dossiers, les contacts avec l'administration, et la conformité. Vous recevez vos images et une documentation complète de mission.
        </p>
      </motion.div>
    </div>
  );
}