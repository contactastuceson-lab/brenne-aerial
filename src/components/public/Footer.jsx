import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/context/LanguageContext';
import { ArrowUpRight } from 'lucide-react';

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="max-w-7xl mx-auto px-6 lg:px-20 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div>
            <h3 className="font-syne font-extrabold text-2xl mb-4">ENOR<span className="opacity-60">.</span></h3>
            <p className="font-inter text-sm opacity-70 leading-relaxed">
              Enor Lefoulon Meyer — {t('about.role')}
            </p>
          </div>
          <div>
            <h4 className="font-syne font-bold text-sm uppercase tracking-wider mb-4">Navigation</h4>
            <div className="space-y-2">
              {[
                { to: '/', label: t('nav.home') },
                { to: '/about', label: t('nav.about') },
                { to: '/services', label: t('nav.services') },
                { to: '/quote', label: t('nav.quote') },
              ].map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="block font-inter text-sm opacity-70 hover:opacity-100 transition-opacity"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-syne font-bold text-sm uppercase tracking-wider mb-4">Contact</h4>
            <Link
              to="/quote"
              className="inline-flex items-center gap-2 font-syne font-bold text-lg hover:opacity-80 transition-opacity"
            >
              {t('hero.cta')} <ArrowUpRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
        <div className="mt-12 pt-6 border-t border-primary-foreground/20 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="font-mono text-xs opacity-50">
            © {new Date().getFullYear()} Enor Lefoulon Meyer. Tous droits réservés.
          </p>
          <p className="font-mono text-xs opacity-50">
            Conçu avec précision.
          </p>
        </div>
      </div>
    </footer>
  );
}