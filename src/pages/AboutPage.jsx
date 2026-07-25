import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Crown, Target, Shield, Users, Award, ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import BadgeChip from '@/components/ui/BadgeChip';

const VALUES = [
  { icon: Shield, title: 'Sécurité & confiance', desc: "Un espace sécurisé, modéré et transparent où chaque membre peut s'exprimer librement." },
  { icon: Target, title: 'Créativité', desc: "Des outils pensés pour les créateurs : publications, médias, sondages, badges et plus." },
  { icon: Award, title: 'Qualité premium', desc: "Une expérience soignée, rapide et élégante, digne des meilleures plateformes communautaires." },
  { icon: Users, title: 'Communauté', desc: "Un interlocuteur unique et à l'écoute, au plus près des besoins de chaque membre." },
];

const TIMELINE = [
  { year: '2024', title: "Naissance d'EZA", desc: "Fondation de la plateforme par Enor Lefoulon Meyer avec une vision : réunir créateurs et organisations." },
  { year: '2025', title: 'Réseau social', desc: "Lancement du fil d'actualité, des publications, des badges de vérification et du forum." },
  { year: '2026', title: 'Communautés & organisations', desc: "Affiliations, espaces business et vérifications pour structurer la communauté." },
  { year: '2026+', title: 'Encore plus loin', desc: "De nouvelles fonctionnalités pour créer, échanger et grandir ensemble.", future: true },
];

export default function AboutPage() {
  return (
    <div className="pt-16">
      {/* Hero */}
      <section className="relative py-32 px-5 lg:px-10 overflow-hidden">
        <div className="absolute inset-0 grid-bg" />
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/80 to-background" />
        </div>
        <div className="relative max-w-7xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
            <p className="font-mono text-xs text-primary mb-4 tracking-widest uppercase">— Notre histoire</p>
            <h1 className="font-grotesk font-bold text-5xl sm:text-7xl mb-4">
              <span className="gradient-text">EZA</span>
            </h1>
            <p className="font-inter text-lg text-muted-foreground max-w-2xl mx-auto">
              Le réseau social dédié aux créateurs, organisations et communautés. Publiez, échangez,
              obtenez vos badges de vérification et construisez votre communauté.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Founder section */}
      <section className="py-24 px-5 lg:px-10 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div initial={{ opacity: 0, x: -40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            <div className="relative">
              <div className="absolute -inset-6 bg-gradient-to-br from-primary/10 to-transparent rounded-3xl" />
              <img
                src="https://media.base44.com/images/public/69c5c081406b9e20deaed583/69e824fda_IMG_20260108_192238_6241-converti-depuis-webp.png"
                alt="Enor Lefoulon Meyer"
                className="relative w-full rounded-2xl object-cover"
                style={{ filter: 'contrast(1.05) saturate(0.85)', aspectRatio: '4/5', objectFit: 'cover' }}
              />
              <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 glass border border-primary/20 rounded-2xl px-6 py-4 text-center sky-glow min-w-[220px]">
                <div className="flex justify-center mb-2">
                  <Crown className="w-5 h-5 text-primary" />
                </div>
                <p className="font-grotesk font-bold text-sm">Enor Lefoulon Meyer</p>
                <p className="font-mono text-xs text-muted-foreground mb-2">Fondateur & PDG</p>
                <BadgeChip badge="Fondateur" size="sm" />
              </div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            <p className="font-mono text-xs text-primary mb-4 tracking-widest uppercase">— Le fondateur</p>
            <h2 className="font-grotesk font-bold text-4xl mb-6">
              Une vision,<br /><span className="gradient-text">une communauté.</span>
            </h2>
            <div className="space-y-4 font-inter text-muted-foreground leading-relaxed">
              <p>
                Enor Lefoulon Meyer a fondé EZA avec une conviction : réunir créateurs, organisations
                et communautés autour d'un espace d'expression libre, sécurisé et valorisant.
              </p>
              <p>
                Passionné par le numérique et l'innovation, il a conçu une plateforme où chacun peut
                publier, échanger, obtenir des badges de vérification et développer sa communauté.
              </p>
              <p>
                Aujourd'hui, à la tête d'une équipe engagée, il porte une vision d'avenir : faire d'EZA
                la référence des réseaux communautaires modernes.
              </p>
            </div>
            <div className="mt-8 p-4 rounded-xl bg-primary/5 border border-primary/20">
              <div className="flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-grotesk font-semibold text-sm">Vision 2026+</p>
                  <p className="font-inter text-xs text-muted-foreground mt-1">
                    Une plateforme toujours plus ouverte, créative et proche de sa communauté.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Values */}
      <section className="py-24 px-5 lg:px-10 bg-card border-y border-border">
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
            <p className="font-mono text-xs text-primary mb-2 tracking-widest uppercase">— Notre ADN</p>
            <h2 className="font-grotesk font-bold text-3xl sm:text-4xl">Nos <span className="gradient-text">valeurs</span></h2>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {VALUES.map((v, i) => (
              <motion.div key={v.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="p-6 rounded-xl bg-background border border-border hover:border-primary/30 transition-colors">
                <v.icon className="w-7 h-7 text-primary mb-4" />
                <h3 className="font-grotesk font-semibold text-sm mb-2">{v.title}</h3>
                <p className="font-inter text-xs text-muted-foreground leading-relaxed">{v.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-24 px-5 lg:px-10 max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-12">
          <p className="font-mono text-xs text-primary mb-2 tracking-widest uppercase">— Notre parcours</p>
          <h2 className="font-grotesk font-bold text-3xl sm:text-4xl">Notre <span className="gradient-text">histoire</span></h2>
        </motion.div>
        <div className="relative">
          <div className="absolute left-8 sm:left-1/2 top-0 bottom-0 w-px bg-border" />
          <div className="space-y-10">
            {TIMELINE.map((item, i) => (
              <motion.div key={item.year} initial={{ opacity: 0, x: i % 2 === 0 ? -30 : 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
                className={`relative flex flex-col sm:flex-row gap-6 ${i % 2 !== 0 ? 'sm:flex-row-reverse' : ''}`}>
                <div className="hidden sm:block flex-1" />
                <div className="flex-shrink-0 w-16 flex flex-col items-center">
                  <div className={`w-4 h-4 rounded-full border-2 ${item.future ? 'border-dashed border-primary bg-background' : 'border-primary bg-primary/20'} flex items-center justify-center`}>
                    {!item.future && <div className="w-1.5 h-1.5 rounded-full bg-primary" />}
                  </div>
                </div>
                <div className="flex-1">
                  <div className={`p-5 rounded-xl border transition-colors ${item.future ? 'bg-primary/5 border-primary/20' : 'bg-card border-border'}`}>
                    <span className="font-mono text-xs text-primary">{item.year}</span>
                    {item.future && <span className="ml-2 font-mono text-[10px] text-primary/60 border border-primary/30 rounded-full px-2">À venir</span>}
                    <h3 className="font-grotesk font-semibold text-sm mt-1 mb-1">{item.title}</h3>
                    <p className="font-inter text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-5 lg:px-10 max-w-7xl mx-auto">
        <div className="text-center">
          <Link to="/register">
            <Button size="lg" className="bg-primary text-primary-foreground font-grotesk font-semibold px-8 sky-glow">
              Rejoindre la communauté <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}