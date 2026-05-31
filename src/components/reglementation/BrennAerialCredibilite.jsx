import React from 'react';
import { motion } from 'framer-motion';
import { Award, CheckCircle, Clock, Shield } from 'lucide-react';

export default function BrennAerialCredibilite() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="max-w-4xl mx-auto px-5 lg:px-10 mb-14"
    >
      <div className="relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 via-accent/5 to-primary/5 p-8">
        <div className="absolute inset-0 grid-bg opacity-20" />

        <div className="relative">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center">
              <Award className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="font-grotesk font-bold text-xl">Pourquoi nous faire confiance</h2>
              <p className="font-inter text-sm text-muted-foreground">Brenne Aerial, opérateur sérieux et certifié</p>
            </div>
          </div>

          <p className="font-inter text-sm text-muted-foreground mb-6 leading-relaxed">
            Brenne Aerial applique strictement les réglementations <strong className="text-foreground">françaises et européennes en vigueur</strong>.
            Nous maintenons une <strong className="text-foreground">veille réglementaire continue</strong> pour adapter nos procédures aux changements (notamment la suppression des scénarios S1/S2/S3 en 2026).
            Chaque mission est documentée, assurée, et pilotée par des télépilotes certifiés DGAC/EASA.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { icon: Shield, title: 'Certifications DGAC/EASA', desc: 'Formations A1/A3, CATS A/B à jour — renouvelées régulièrement' },
              { icon: Award, title: 'Assurance RC Pro', desc: 'Responsabilité civile professionnelle couvrant chaque mission — attestation fournie' },
              { icon: Clock, title: 'Veille réglementaire', desc: 'Suivi des textes officiels et ajustement immédiat des processus — aucun décalage' },
              { icon: CheckCircle, title: 'Documentation complète', desc: 'Journal de vol, zones survolées, permissions — tout conservé et fourni au client' },
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-card/60 border border-border">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Icon className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-inter font-semibold text-sm text-foreground">{item.title}</p>
                    <p className="font-inter text-xs text-muted-foreground mt-0.5">{item.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </motion.div>
  );
}