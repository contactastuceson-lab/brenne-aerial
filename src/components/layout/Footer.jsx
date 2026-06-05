import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Mail, Phone, Youtube, Instagram, ArrowUpRight, Zap } from 'lucide-react';

const NEWSLETTER_URL = "https://a4835101.sibforms.com/serve/MUIFAC3C5UXdgrZ-CYR3iV27NCBuTTlUAVw80srFWWQ1uQqa9zEJu_QjFXyxzE_cjXKKN4npfoqMKMs9lLTQwXf3ox21FCxhlCz_wVgMTyX86xIWn29NjWLwDgvg5YGhFZ2acj3HZshol1zV0zwpXdvgB0dhKU6CE25yH20lCqS0cWOYOEXnQyfPG4HwSVpt7onwP66N9DD1OCspXQ==";

const NAV_LINKS = [
  { to: '/', label: 'Accueil' },
  { to: '/services', label: 'Services' },
  { to: '/portfolio', label: 'Portfolio' },
  { to: '/blog', label: 'Blog' },
  { to: '/planning', label: 'Planning' },
  { to: '/contact', label: 'Contact' },
  { to: '/quote', label: 'Demander un devis' },
];

const SERVICES = [
  { label: 'Vidéo événement', to: '/services' },
  { label: 'Inspection toiture', to: '/toiture-checkup' },
  { label: 'Suivi chantier', to: '/services' },
  { label: 'Captation entreprise', to: '/services' },
  { label: 'Retour temps réel', to: '/services' },
  { label: 'Calculateur de devis', to: '/calculateur' },
];

const COMMUNITY = [
  { to: '/forum', label: 'Forum communautaire' },
  { to: '/discover', label: 'Explorer les profils' },
  { to: '/parrainage', label: 'Programme parrainage' },
  { to: '/partenaires', label: 'Partenaires' },
  { to: '/garage', label: 'Garage drones' },
  { to: '/reglementation', label: 'Réglementation' },
];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative mt-24 overflow-hidden">
      {/* Top gradient border */}
      <div className="h-px w-full bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

      {/* Main content */}
      <div className="bg-card">
        {/* Newsletter band */}
        <div className="border-b border-border/60 bg-primary/5">
          <div className="max-w-7xl mx-auto px-5 lg:px-10 py-10">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary/15 border border-primary/20 flex items-center justify-center flex-shrink-0">
                  <Mail className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="font-grotesk font-semibold text-sm text-foreground">Newsletter Brenne Aerial™</p>
                  <p className="font-inter text-xs text-muted-foreground mt-0.5">Actualités, projets et annonces directement dans votre boîte mail.</p>
                </div>
              </div>
              <a
                href={NEWSLETTER_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-shrink-0 inline-flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-200 rounded-xl px-5 py-2.5 font-inter text-sm font-semibold shadow-lg shadow-primary/20 hover:shadow-primary/30 hover:-translate-y-0.5"
              >
                S'inscrire gratuitement
                <ArrowUpRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>

        {/* Grid */}
        <div className="max-w-7xl mx-auto px-5 lg:px-10 pt-16 pb-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-14">

            {/* Brand — 2 cols */}
            <div className="lg:col-span-2">
              {/* Logo */}
              <div className="flex items-center gap-2.5 mb-5">
                <div className="w-9 h-9 bg-primary/15 border border-primary/25 rounded-xl flex items-center justify-center">
                  <svg viewBox="0 0 32 32" className="w-5 h-5" fill="none">
                    <path d="M16 4 L28 10 L28 22 L16 28 L4 22 L4 10 Z" stroke="hsl(205 90% 58%)" strokeWidth="2" fill="none" />
                    <circle cx="16" cy="16" r="3" fill="hsl(205 90% 58%)" />
                  </svg>
                </div>
                <span className="font-grotesk font-bold text-lg tracking-tight">
                  Brenne <span className="text-primary">Aerial</span>
                </span>
              </div>

              <p className="font-inter text-sm text-muted-foreground leading-relaxed mb-6 max-w-xs">
                Spécialiste de la vidéo et l'inspection par drone en région Centre-Val de Loire. Solutions professionnelles, précision technique, résultats premium.
              </p>

              {/* Contact infos */}
              <div className="space-y-2.5 mb-6">
                <a href="mailto:contact@brenneaerial.fr" className="flex items-center gap-3 group">
                  <div className="w-7 h-7 rounded-lg bg-secondary border border-border flex items-center justify-center flex-shrink-0 group-hover:border-primary/40 group-hover:bg-primary/10 transition-colors">
                    <Mail className="w-3 h-3 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                  <span className="font-mono text-xs text-muted-foreground group-hover:text-primary transition-colors">contact@brenneaerial.fr</span>
                </a>
                <a href="tel:+33600000000" className="flex items-center gap-3 group">
                  <div className="w-7 h-7 rounded-lg bg-secondary border border-border flex items-center justify-center flex-shrink-0 group-hover:border-primary/40 group-hover:bg-primary/10 transition-colors">
                    <Phone className="w-3 h-3 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                  <span className="font-mono text-xs text-muted-foreground group-hover:text-primary transition-colors">+33 6 00 00 00 00</span>
                </a>
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-secondary border border-border flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-3 h-3 text-muted-foreground" />
                  </div>
                  <span className="font-inter text-xs text-muted-foreground">Brenne, Indre (36), France</span>
                </div>
              </div>

              {/* Socials */}
              <div className="flex gap-2">
                <a href="https://youtube.com" target="_blank" rel="noopener noreferrer"
                  className="w-8 h-8 rounded-lg bg-secondary border border-border flex items-center justify-center text-muted-foreground hover:text-red-400 hover:border-red-400/30 hover:bg-red-400/5 transition-all duration-200">
                  <Youtube className="w-3.5 h-3.5" />
                </a>
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer"
                  className="w-8 h-8 rounded-lg bg-secondary border border-border flex items-center justify-center text-muted-foreground hover:text-pink-400 hover:border-pink-400/30 hover:bg-pink-400/5 transition-all duration-200">
                  <Instagram className="w-3.5 h-3.5" />
                </a>
                <a href="https://tiktok.com" target="_blank" rel="noopener noreferrer"
                  className="w-8 h-8 rounded-lg bg-secondary border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-border/80 transition-all duration-200">
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.32 6.32 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V9.05a8.17 8.17 0 0 0 4.78 1.52V7.12a4.85 4.85 0 0 1-1.01-.43z"/></svg>
                </a>
              </div>
            </div>

            {/* Navigation */}
            <div>
              <h4 className="font-grotesk font-semibold text-xs uppercase tracking-widest text-muted-foreground mb-5">Navigation</h4>
              <div className="space-y-2.5">
                {NAV_LINKS.map(({ to, label }) => (
                  <Link key={to} to={to}
                    className="flex items-center gap-1 font-inter text-sm text-muted-foreground hover:text-foreground transition-colors group">
                    <span>{label}</span>
                    <ArrowUpRight className="w-3 h-3 opacity-0 -translate-x-1 group-hover:opacity-60 group-hover:translate-x-0 transition-all duration-150" />
                  </Link>
                ))}
              </div>
            </div>

            {/* Services */}
            <div>
              <h4 className="font-grotesk font-semibold text-xs uppercase tracking-widest text-muted-foreground mb-5">Services</h4>
              <div className="space-y-2.5">
                {SERVICES.map(({ label, to }) => (
                  <Link key={label} to={to}
                    className="flex items-center gap-1 font-inter text-sm text-muted-foreground hover:text-foreground transition-colors group">
                    <span>{label}</span>
                    <ArrowUpRight className="w-3 h-3 opacity-0 -translate-x-1 group-hover:opacity-60 group-hover:translate-x-0 transition-all duration-150" />
                  </Link>
                ))}
              </div>
            </div>

            {/* Community */}
            <div>
              <h4 className="font-grotesk font-semibold text-xs uppercase tracking-widest text-muted-foreground mb-5">Communauté</h4>
              <div className="space-y-2.5">
                {COMMUNITY.map(({ to, label }) => (
                  <Link key={to} to={to}
                    className="flex items-center gap-1 font-inter text-sm text-muted-foreground hover:text-foreground transition-colors group">
                    <span>{label}</span>
                    <ArrowUpRight className="w-3 h-3 opacity-0 -translate-x-1 group-hover:opacity-60 group-hover:translate-x-0 transition-all duration-150" />
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Certification / trust badges */}
          <div className="flex flex-wrap items-center gap-3 mb-10 pb-10 border-b border-border/60">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/20 bg-primary/5">
              <Zap className="w-3 h-3 text-primary" />
              <span className="font-mono text-[10px] text-primary font-medium">Télépilote certifié A1/A2/A3</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-border bg-secondary/50">
              <svg className="w-3 h-3 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              <span className="font-mono text-[10px] text-muted-foreground">Assuré RC Professionnelle</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-border bg-secondary/50">
              <svg className="w-3 h-3 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
              <span className="font-mono text-[10px] text-muted-foreground">Basé en Brenne, Indre (36)</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-border bg-secondary/50">
              <svg className="w-3 h-3 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              <span className="font-mono text-[10px] text-muted-foreground">Disponible 7j/7</span>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-5">
            <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4">
              <p className="font-mono text-xs text-muted-foreground">
                © {year} Brenne Aerial · Enor Lefoulon Meyer
              </p>
              <span className="hidden sm:block w-px h-3.5 bg-border" />
              <div className="flex items-center gap-3">
                <Link to="/legal/privacy" className="font-inter text-xs text-muted-foreground hover:text-foreground transition-colors">Confidentialité</Link>
                <span className="text-border">·</span>
                <Link to="/legal/terms" className="font-inter text-xs text-muted-foreground hover:text-foreground transition-colors">CGU</Link>
                <span className="text-border">·</span>
                <Link to="/legal/cookies" className="font-inter text-xs text-muted-foreground hover:text-foreground transition-colors">Cookies</Link>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Link to="/uptime" title="Statut des services" className="hidden sm:block">
                <iframe
                  src="https://status.brenneaerial.fr/badge?theme=dark"
                  width="250"
                  height="30"
                  frameBorder="0"
                  scrolling="no"
                  style={{ colorScheme: 'normal', display: 'block' }}
                  title="Statut Brenne Aerial"
                />
              </Link>
              <Link to="/uptime" className="sm:hidden inline-flex items-center gap-1.5 font-mono text-xs text-muted-foreground hover:text-primary transition-colors border border-border rounded-full px-3 py-1">
                <span className="w-2 h-2 rounded-full bg-green-400 inline-block animate-pulse" />
                Statut des services
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}