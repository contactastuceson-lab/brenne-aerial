import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Lightbulb } from 'lucide-react';

export default function GlossaireTermes() {
  const termes = [
    {
      technique: 'STS-01',
      simple: 'Vol professionnel en ville avec un drone certifié, contrôlé étape par étape.',
      exemple: 'Idéal pour les mariages, événements ou inspections de bâtiments en zone urbaine.',
    },
    {
      technique: 'STS-02',
      simple: 'Vol professionnel sans vue directe sur longue distance, en zone dégagée.',
      exemple: 'Utilisé pour inspecter des lignes électriques, pipelines ou terres agricoles étendues.',
    },
    {
      technique: 'Catégorie Spécifique',
      simple: 'Toute opération professionnelle qui nécessite une autorisation (contrairement aux loisirs simples).',
      exemple: 'C\'est la catégorie où se situent 95 % des missions professionnelles.',
    },
    {
      technique: 'C5 / C6 (Classes)',
      simple: 'Les "modèles de drones" homologués pour les opérations professionnelles en France et Europe.',
      exemple: 'C5 = drone urbain certifié · C6 = drone pour longue distance certifié.',
    },
    {
      technique: 'EASA',
      simple: 'L\'agence européenne de l\'aviation qui définit les règles communes à tous les pays UE.',
      exemple: 'Un certificat EASA en France est valable en Belgique, Allemagne, Espagne, etc.',
    },
    {
      technique: 'Catégorie Ouverte',
      simple: 'Vol simple (loisirs ou petit pro) sans autorisation préalable, pour les petits drones.',
      exemple: 'Photo/vidéo légère, démonstration, aéromodélisme — tant qu\'on respecte les règles basiques.',
    },
    {
      technique: 'SORA',
      simple: 'Un dossier qui analyse les risques d\'une opération complexe et propose comment les réduire.',
      exemple: 'Pour un vol très spécifique (nuit, zone difficile, charges sensibles) : il faut convaincre l\'autorité que c\'est safe.',
    },
    {
      technique: 'Signalement électronique (Remote ID)',
      simple: 'Un dispositif qui transmet automatiquement l\'identité du drone aux autorités en vol.',
      exemple: 'Comme une "plaque d\'immatriculation invisible" du drone — détectable à distance.',
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-5 lg:px-10 mb-14">
      <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
            <Lightbulb className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="font-grotesk font-bold text-2xl">Glossaire — Termes expliqués simplement</h2>
            <p className="font-inter text-sm text-muted-foreground">Pas besoin d'être expert en drones pour comprendre la réglementation</p>
          </div>
        </div>
      </motion.div>

      <div className="space-y-3">
        {termes.map((t, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.03 }}
            className="bg-card border border-border rounded-xl p-5 hover:border-primary/20 transition-colors"
          >
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="font-mono text-xs font-bold text-primary">{i + 1}</span>
              </div>
              <div className="flex-1">
                <p className="font-grotesk font-bold text-sm text-primary mb-1">{t.technique}</p>
                <p className="font-inter text-sm text-foreground mb-2 leading-relaxed">{t.simple}</p>
                <p className="font-inter text-xs text-muted-foreground italic border-l-2 border-primary/20 pl-3">
                  💡 {t.exemple}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}