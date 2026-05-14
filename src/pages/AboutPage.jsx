import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Crown, Target, Rocket, Shield, Users, Award, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import BadgeChip from '@/components/ui/BadgeChip';

const VALUES = [
  { icon: Shield, title: 'Sécurité absolue', desc: "Chaque mission respecte scrupuleusement les réglementations DGAC et s'effectue avec le plus haut niveau de sécurité." },
  { icon: Target, title: 'Précision technique', desc: "Nos équipements de pointe et notre expertise garantissent des résultats d'une précision millimétrique." },
  { icon: Award, title: 'Qualité premium', desc: "Vidéo 4K, stabilisation avancée, post-production professionnelle — chaque livrable est digne des meilleurs standards." },
  { icon: Users, title: 'Proximité client', desc: "Un interlocuteur unique, réactif et à l'écoute de vos besoins tout au long de votre projet." },
];

const TIMELINE = [
  { year: '2020', title: 'Naissance de Brenne Aerial', desc: "Fondation de l'entreprise par Enor Lefoulon Meyer avec une vision claire : démocratiser la vidéo professionnelle par drone." },
  { year: '2021', title: 'Premières grandes missions', desc: "Décrochage de contrats d'inspection industrielle et de captation événementielle de grande envergure." },
  { year: '2022', title: 'Certification et expansion', desc: "Obtention des certifications DGAC avancées et développement de nouvelles offres de services." },
  { year: '2023', title: '100+ missions réalisées', desc: "Franchissement du cap symbolique des 100 missions avec un taux de satisfaction client de 99%." },
  { year: '2024', title: 'Retour en temps réel', desc: "Lancement du service de diffusion live et de retour vidéo temps réel pour les opérations critiques." },
  { year: '2025+', title: 'Formation pilote drone', desc: "Ouverture d'un centre de formation certifié pour pilotes de drones professionnels et amateurs.", future: true },
];

export default function AboutPage() {
  return (
    <div className="pt-16">
      {/* Hero */}
      <section className="relative py-32 px-5 lg:px-10 overflow-hidden">
        <div className="absolute inset-0 grid-bg" />
        <div className="absolute inset-0">
          <img src="https://images.unsplash.com/photo-1527977966376-1c8408f9f108?w=1600&auto=format&fit=crop&q=70" alt=""
            className="w-full h-full object-cover opacity-15" />
          <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/80 to-background" />
        </div>
        <div className="relative max-w-7xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
            <p className="font-mono text-xs text-primary mb-4 tracking-widest uppercase">— Notre histoire</p>
            <h1 className="font-grotesk font-bold text-5xl sm:text-7xl mb-4">
              Brenne <span className="gradient-text">Aerial</span>
            </h1>
            <p className="font-inter text-lg text-muted-foreground max-w-2xl mx-auto">
              Née d'une passion pour les hauteurs et l'excellence technique, Brenne Aerial s'est imposée 
              comme la référence drone en France pour les professionnels les plus exigeants.
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
                src="https://media.base44.com/images/public/69c5c081406b9e20deaed582/69e824fda_IMG_20260108_192238_6241-converti-depuis-webp.png"
                alt="Enor Lefoulon Meyer"
                className="relative w-full rounded-2xl object-cover"
                style={{ filter: 'contrast(1.05) saturate(0.85)', aspectRatio: '4/5', objectFit: 'cover' }}
              />
              {/* Official founder badge overlay */}
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
              Une vision,<br /><span className="gradient-text">une mission.</span>
            </h2>
            <div className="space-y-4 font-inter text-muted-foreground leading-relaxed">
              <p>
                Enor Lefoulon Meyer a fondé Brenne Aerial avec une conviction profonde : la technologie drone 
                allait révolutionner la façon dont nous captons, inspectons et comprenons le monde qui nous entoure.
              </p>
              <p>
                Passionné d'aéronautique depuis l'enfance et ingénieur de formation, il a consacré des années 
                à maîtriser les techniques de pilotage avancé, la réglementation DGAC et les standards 
                cinématographiques les plus exigeants.
              </p>
              <p>
                Aujourd'hui, à la tête d'une équipe de pilotes certifiés, il porte une vision d'avenir : 
                développer un centre de formation drone de référence pour transmettre cette passion 
                et professionnaliser le secteur.
              </p>
            </div>
            <div className="mt-8 p-4 rounded-xl bg-primary/5 border border-primary/20">
              <div className="flex items-start gap-3">
                <Rocket className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-grotesk font-semibold text-sm">Vision 2025+</p>
                  <p className="font-inter text-xs text-muted-foreground mt-1">
                    Ouverture d'un centre de formation pilote drone certifié, accessible aux professionnels 
                    comme aux passionnés souhaitant se reconvertir dans ce secteur d'avenir.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* PDG-Adjoint section */}
      <section className="py-16 px-5 lg:px-10 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div initial={{ opacity: 0, x: 40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="order-2 lg:order-1">
            <p className="font-mono text-xs text-primary mb-4 tracking-widest uppercase">— PDG-Adjoint</p>
            <h2 className="font-grotesk font-bold text-4xl mb-6">
              Stratégie &<br /><span className="gradient-text">développement.</span>
            </h2>
            <div className="space-y-4 font-inter text-muted-foreground leading-relaxed">
              <p>
                Borys Sentenac occupe le poste de PDG-Adjoint au sein de Brenne Aerial, 
                aux côtés du fondateur Enor Lefoulon Meyer.
              </p>
              <p>
                Ses responsabilités couvrent la stratégie opérationnelle, le développement commercial 
                et la coordination des équipes pour garantir l'excellence de chaque mission.
              </p>
              <p>
                Ensemble, ils portent la vision ambitieuse de Brenne Aerial vers de nouveaux horizons, 
                avec une exigence constante pour la qualité et l'innovation.
              </p>
            </div>
            <div className="mt-8 p-4 rounded-xl bg-primary/5 border border-primary/20">
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-grotesk font-semibold text-sm">Direction bicéphale</p>
                  <p className="font-inter text-xs text-muted-foreground mt-1">
                    Un binôme complémentaire au service d'une vision commune : faire de Brenne Aerial 
                    la référence nationale en matière de drone professionnel.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: -40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="order-1 lg:order-2">
            <div className="relative">
              <div className="absolute -inset-6 bg-gradient-to-br from-primary/10 to-transparent rounded-3xl" />
              {/* Placeholder avatar */}
              <div className="relative w-full rounded-2xl bg-card border border-border flex items-center justify-center"
                style={{ aspectRatio: '4/5' }}>
                <div className="text-center">
                  <div className="w-24 h-24 rounded-full bg-primary/10 border-2 border-primary/20 flex items-center justify-center mx-auto mb-4">
                    <span className="font-grotesk font-bold text-4xl text-primary">B</span>
                  </div>
                  <p className="font-inter text-sm text-muted-foreground">Photo à venir</p>
                </div>
              </div>
              {/* Badge overlay */}
              <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 glass border border-primary/20 rounded-2xl px-6 py-4 text-center sky-glow min-w-[220px]">
                <div className="flex justify-center mb-2">
                  <Crown className="w-5 h-5 text-primary" />
                </div>
                <p className="font-grotesk font-bold text-sm">Borys Sentenac</p>
                <p className="font-mono text-xs text-muted-foreground mb-2">PDG-Adjoint</p>
                <BadgeChip badge="Officiel" size="sm" />
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
          <Link to="/quote">
            <Button size="lg" className="bg-primary text-primary-foreground font-grotesk font-semibold px-8 sky-glow">
              Démarrer un projet <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}