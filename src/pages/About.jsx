import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { motion } from 'framer-motion';
import { Shield, Lightbulb, Heart, Users } from 'lucide-react';

export default function About() {
  const { t } = useLanguage();

  const values = [
    { icon: Shield, label: t('about.excellence'), desc: 'Chaque détail compte dans notre approche.' },
    { icon: Lightbulb, label: t('about.innovation'), desc: 'Des solutions créatives et modernes.' },
    { icon: Heart, label: t('about.integrity'), desc: 'Transparence et honnêteté en toute circonstance.' },
    { icon: Users, label: t('about.proximity'), desc: 'Un accompagnement humain et personnalisé.' },
  ];

  return (
    <div>
      {/* Hero split section */}
      <section className="min-h-screen flex flex-col lg:flex-row">
        {/* Left - Portrait */}
        <div className="lg:w-1/2 relative min-h-[50vh] lg:min-h-screen lg:sticky lg:top-0">
          <img
            src="/__generating__/img_e811dd66ffb2.png"
            alt="Enor Lefoulon Meyer — Fondateur"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent lg:bg-gradient-to-r lg:from-transparent lg:to-background/80" />
          <div className="absolute bottom-8 left-8 lg:bottom-12 lg:left-12">
            <span className="badge-shimmer font-mono text-xs font-bold px-3 py-1.5 rounded-full border border-accent/30 bg-accent/10 inline-flex items-center gap-1.5">
              <Shield className="w-3 h-3" /> Fondateur
            </span>
          </div>
        </div>

        {/* Right - Content */}
        <div className="lg:w-1/2 px-6 lg:px-20 py-16 lg:py-24 flex flex-col justify-center">
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <p className="font-mono text-xs text-primary mb-4 tracking-widest uppercase">{t('about.title')}</p>
            <h1 className="font-syne font-extrabold text-4xl sm:text-5xl lg:text-6xl mb-2">
              Enor Lefoulon<br />Meyer<span className="text-primary">.</span>
            </h1>
            <p className="font-inter text-lg text-accent mb-8">{t('about.role')}</p>

            <div className="space-y-6">
              <p className="font-inter text-muted-foreground leading-relaxed text-base">
                {t('about.history')}
              </p>
              <p className="font-inter text-muted-foreground leading-relaxed text-base">
                Fort d'une expérience riche et diversifiée, il a développé une expertise unique qui lui permet de comprendre 
                les défis de ses clients et de proposer des solutions innovantes et adaptées à chaque situation.
              </p>
              <p className="font-inter text-muted-foreground leading-relaxed text-base">
                Sa philosophie : allier rigueur professionnelle et relation de confiance pour construire des partenariats durables.
              </p>
            </div>

            {/* Signature SVG */}
            <motion.div
              initial={{ pathLength: 0, opacity: 0 }}
              whileInView={{ pathLength: 1, opacity: 0.15 }}
              viewport={{ once: true }}
              transition={{ duration: 2 }}
              className="mt-12"
            >
              <svg viewBox="0 0 300 80" className="w-64 h-auto opacity-15">
                <text x="10" y="50" className="font-syne" style={{ fontSize: '32px', fill: 'hsl(68 100% 50%)', fontStyle: 'italic', fontWeight: 700 }}>
                  E. Lefoulon Meyer
                </text>
              </svg>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Values */}
      <section className="py-24 px-6 lg:px-20 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <p className="font-mono text-xs text-primary mb-2 tracking-widest uppercase">{t('about.values')}</p>
          <h2 className="font-syne font-extrabold text-3xl sm:text-4xl mb-12">{t('about.values')}</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {values.map((val, i) => (
              <motion.div
                key={val.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-8 rounded-xl bg-card border border-border hover:border-primary/20 transition-colors"
              >
                <val.icon className="w-8 h-8 text-primary mb-4" />
                <h3 className="font-syne font-bold text-xl mb-2">{val.label}</h3>
                <p className="font-inter text-sm text-muted-foreground">{val.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>
    </div>
  );
}