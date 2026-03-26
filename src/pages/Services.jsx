import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/context/LanguageContext';
import { motion } from 'framer-motion';
import { Briefcase, Code, Palette, Wrench, GraduationCap, Sparkles, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const serviceDetails = [
  {
    key: 'consulting',
    icon: Briefcase,
    descFr: "Analyse approfondie de vos besoins et recommandations stratégiques pour optimiser votre activité. Accompagnement personnalisé à chaque étape.",
    descEn: "In-depth analysis of your needs and strategic recommendations to optimize your business. Personalized support at every step."
  },
  {
    key: 'development',
    icon: Code,
    descFr: "Conception et développement de solutions digitales sur mesure. Applications web, mobiles et systèmes d'information modernes.",
    descEn: "Design and development of custom digital solutions. Web and mobile applications, modern information systems."
  },
  {
    key: 'design',
    icon: Palette,
    descFr: "Création d'identités visuelles fortes et interfaces utilisateur élégantes. UX/UI design centré sur l'expérience utilisateur.",
    descEn: "Creating strong visual identities and elegant user interfaces. UX/UI design centered on user experience."
  },
  {
    key: 'maintenance',
    icon: Wrench,
    descFr: "Support technique continu, mises à jour régulières et monitoring. Garantie de performance et de disponibilité.",
    descEn: "Continuous technical support, regular updates and monitoring. Guaranteed performance and availability."
  },
  {
    key: 'formation',
    icon: GraduationCap,
    descFr: "Programmes de formation adaptés à vos équipes. Transfer de compétences et montée en expertise.",
    descEn: "Training programs adapted to your teams. Skills transfer and expertise development."
  },
  {
    key: 'autre',
    icon: Sparkles,
    descFr: "Solutions sur mesure pour des besoins spécifiques. Contactez-nous pour discuter de votre projet unique.",
    descEn: "Custom solutions for specific needs. Contact us to discuss your unique project."
  },
];

export default function Services() {
  const { t, lang } = useLanguage();

  return (
    <div>
      {/* Hero */}
      <section className="relative py-32 px-6 lg:px-20 overflow-hidden">
        <div className="absolute inset-0">
          <img src="https://media.base44.com/images/public/69c5b5d191713cd7fb96d543/28718c038_generated_e959ab6e.png" alt="" className="w-full h-full object-cover opacity-20" />
          <div className="absolute inset-0 bg-gradient-to-b from-background via-background/95 to-background" />
        </div>
        <div className="relative max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <p className="font-mono text-xs text-primary mb-4 tracking-widest uppercase">Services</p>
            <h1 className="font-syne font-extrabold text-4xl sm:text-6xl lg:text-7xl mb-4">
              {t('services.title')}<span className="text-primary">.</span>
            </h1>
            <p className="font-inter text-lg text-muted-foreground max-w-lg">
              {t('services.subtitle')}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Services grid */}
      <section className="py-16 px-6 lg:px-20 max-w-7xl mx-auto">
        <div className="space-y-6">
          {serviceDetails.map((service, i) => {
            const Icon = service.icon;
            return (
              <motion.div
                key={service.key}
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.5 }}
                className="group"
              >
                <div className="flex flex-col md:flex-row gap-6 p-8 rounded-xl bg-card border border-border hover:border-primary/30 transition-all duration-300">
                  <div className="flex-shrink-0">
                    <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <Icon className="w-7 h-7 text-primary" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="font-syne font-bold text-xl">{t(`services.${service.key}`)}</h3>
                      <span className="font-mono text-xs text-muted-foreground">0{i + 1}</span>
                    </div>
                    <p className="font-inter text-muted-foreground leading-relaxed">
                      {lang === 'fr' ? service.descFr : service.descEn}
                    </p>
                  </div>
                  <div className="flex-shrink-0 self-center">
                    <Link to="/quote">
                      <Button variant="outline" className="font-inter text-sm border-border hover:border-primary hover:text-primary">
                        {t('hero.cta')} <ArrowRight className="w-3 h-3 ml-2" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>
    </div>
  );
}