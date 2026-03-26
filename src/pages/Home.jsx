import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/context/LanguageContext';
import { motion } from 'framer-motion';
import { ArrowRight, ArrowUpRight, Briefcase, Code, Palette, Wrench, GraduationCap, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

const serviceIcons = {
  consulting: Briefcase,
  development: Code,
  design: Palette,
  maintenance: Wrench,
  formation: GraduationCap,
  autre: Sparkles,
};

export default function Home() {
  const { t } = useLanguage();

  const services = ['consulting', 'development', 'design', 'maintenance', 'formation', 'autre'];

  return (
    <div className="relative">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://media.base44.com/images/public/69c5b5d191713cd7fb96d543/188baa8c5_generated_14eedde5.png"
            alt="Precision engineering"
            className="w-full h-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/90 to-background/50" />
        </div>

        {/* Background text */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden">
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.03 }}
            transition={{ duration: 2 }}
            className="font-syne font-extrabold text-[20vw] text-foreground whitespace-nowrap"
          >
            ENOR
          </motion.span>
        </div>

        <div className="relative max-w-7xl mx-auto px-6 lg:px-20 w-full">
          <motion.div
            initial={{ opacity: 0, x: -60 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="max-w-2xl"
          >
            <div className="font-mono text-xs text-primary mb-6 tracking-widest uppercase">
              Enor Lefoulon Meyer
            </div>
            <h1 className="font-syne font-extrabold text-5xl sm:text-7xl lg:text-8xl leading-none tracking-tight">
              {t('hero.title')}
              <br />
              <span className="text-primary">{t('hero.subtitle')}</span>
            </h1>
            <p className="mt-6 font-inter text-lg text-muted-foreground max-w-lg leading-relaxed">
              {t('hero.tagline')}
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link to="/quote">
                <Button size="lg" className="font-syne font-bold bg-primary text-primary-foreground hover:bg-primary/90 px-8">
                  {t('hero.cta')} <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Link to="/services">
                <Button size="lg" variant="outline" className="font-syne font-bold border-border text-foreground hover:bg-secondary px-8">
                  {t('hero.discover')}
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Services preview */}
      <section className="py-24 px-6 lg:px-20 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-end justify-between mb-12">
            <div>
              <p className="font-mono text-xs text-primary mb-2 tracking-widest uppercase">Services</p>
              <h2 className="font-syne font-extrabold text-3xl sm:text-4xl">{t('services.title')}</h2>
            </div>
            <Link to="/services" className="hidden sm:flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
              Voir tout <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {services.map((service, i) => {
              const Icon = serviceIcons[service];
              return (
                <motion.div
                  key={service}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Link
                    to="/services"
                    className="block p-6 rounded-xl bg-card border border-border hover:border-primary/30 transition-all duration-300 group"
                  >
                    <Icon className="w-8 h-8 text-primary mb-4 group-hover:scale-110 transition-transform" />
                    <h3 className="font-syne font-bold text-lg mb-2">{t(`services.${service}`)}</h3>
                    <p className="font-inter text-sm text-muted-foreground">
                      {t('services.subtitle')}
                    </p>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 lg:px-20">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative rounded-2xl overflow-hidden bg-card border border-border p-12 lg:p-20 text-center"
          >
            <div className="absolute inset-0 opacity-5">
              <img src="https://media.base44.com/images/public/69c5b5d191713cd7fb96d543/81a3a11c3_generated_f5d1995c.png" alt="" className="w-full h-full object-cover" />
            </div>
            <div className="relative">
              <h2 className="font-syne font-extrabold text-3xl sm:text-5xl mb-4">
                Prêt à commencer<span className="text-primary">?</span>
              </h2>
              <p className="font-inter text-muted-foreground text-lg mb-8 max-w-md mx-auto">
                {t('hero.tagline')}
              </p>
              <Link to="/quote">
                <Button size="lg" className="font-syne font-bold bg-primary text-primary-foreground hover:bg-primary/90 px-10">
                  {t('hero.cta')} <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}