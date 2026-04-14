import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Award, FileCheck, BadgeCheck, Plane } from 'lucide-react';

const ITEMS = [
  {
    icon: Plane,
    title: 'Télépilote certifié DGAC',
    desc: "Brevet de télépilote professionnel délivré par la Direction Générale de l'Aviation Civile. Formation théorique et pratique aux standards européens (UE 2019/947).",
    badge: 'Catégorie A2 & A3',
    color: 'text-primary',
    bg: 'bg-primary/10',
    border: 'border-primary/20',
  },
  {
    icon: ShieldCheck,
    title: 'Assurance RC Pro drone',
    desc: "Couverture RC professionnelle spécifique aéronef télépiloté, incluant dommages aux tiers, pertes matérielles et opérations commerciales. Attestation disponible sur demande.",
    badge: 'RC Pro certifiée',
    color: 'text-green-500',
    bg: 'bg-green-500/10',
    border: 'border-green-500/20',
  },
  {
    icon: FileCheck,
    title: 'Démarches administratives',
    desc: "Nous gérons l'intégralité des autorisations de vol : déclarations DGAC, plans de vol S1/S2/S3, coordination avec les aérodromes et préfectures pour les vols en zone réglementée.",
    badge: 'S1 · S2 · S3',
    color: 'text-chart-5',
    bg: 'bg-chart-5/10',
    border: 'border-chart-5/20',
  },
  {
    icon: BadgeCheck,
    title: 'Équipements homologués',
    desc: "Drones de classe C1/C2 conformes aux réglementations européennes. Équipement de secours, batteries certifiées, kits de balisage et protocoles de sécurité stricts sur chaque mission.",
    badge: 'Classe C1 / C2',
    color: 'text-accent',
    bg: 'bg-accent/10',
    border: 'border-accent/20',
  },
];

export default function SecuritySection() {
  return (
    <section className="py-20 px-5 lg:px-10 bg-card border-y border-border">
      <div className="max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
          <p className="font-mono text-xs text-primary mb-2 tracking-widest uppercase">— Ce qui nous différencie</p>
          <h2 className="font-grotesk font-bold text-3xl sm:text-4xl mb-3">
            Sécurité & <span className="gradient-text">Légalité</span>
          </h2>
          <p className="font-inter text-muted-foreground max-w-xl mx-auto text-sm">
            Chaque mission Brenne Aerial est réalisée dans le strict respect de la réglementation en vigueur. 
            La tranquillité d'esprit de nos clients est notre priorité absolue.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {ITEMS.map((item, i) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`bg-background rounded-2xl border ${item.border} p-6 flex gap-5`}
              >
                <div className={`w-12 h-12 rounded-xl ${item.bg} flex items-center justify-center flex-shrink-0`}>
                  <Icon className={`w-6 h-6 ${item.color}`} />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-grotesk font-semibold text-sm">{item.title}</h3>
                    <span className={`font-mono text-[9px] px-2 py-0.5 rounded-full ${item.bg} ${item.color} border ${item.border}`}>
                      {item.badge}
                    </span>
                  </div>
                  <p className="font-inter text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Bottom trust bar */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-8 rounded-2xl border border-primary/20 bg-primary/5 p-5 flex flex-wrap items-center justify-center gap-6 text-center"
        >
          <div>
            <p className="font-mono text-xs text-primary font-semibold">100%</p>
            <p className="font-inter text-xs text-muted-foreground">Missions légales</p>
          </div>
          <div className="w-px h-8 bg-border hidden sm:block" />
          <div>
            <p className="font-mono text-xs text-primary font-semibold">RC Pro</p>
            <p className="font-inter text-xs text-muted-foreground">Assurance pro</p>
          </div>
          <div className="w-px h-8 bg-border hidden sm:block" />
          <div>
            <p className="font-mono text-xs text-primary font-semibold">0 incident</p>
            <p className="font-inter text-xs text-muted-foreground">Depuis 2020</p>
          </div>
          <div className="w-px h-8 bg-border hidden sm:block" />
          <div>
            <p className="font-mono text-xs text-primary font-semibold">DGAC</p>
            <p className="font-inter text-xs text-muted-foreground">Certifié officiel</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}