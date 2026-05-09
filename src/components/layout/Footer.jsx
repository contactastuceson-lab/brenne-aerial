import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Mail, Phone, Youtube, Instagram } from 'lucide-react';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-card border-t border-border mt-24">
      <div className="max-w-7xl mx-auto px-5 lg:px-10 pt-16 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 bg-primary/20 rounded-lg flex items-center justify-center">
                <svg viewBox="0 0 32 32" className="w-5 h-5" fill="none">
                  <path d="M16 4 L28 10 L28 22 L16 28 L4 22 L4 10 Z" stroke="hsl(205 90% 58%)" strokeWidth="2" fill="none" />
                  <circle cx="16" cy="16" r="3" fill="hsl(205 90% 58%)" />
                </svg>
              </div>
              <span className="font-grotesk font-bold text-base">Brenne <span className="text-primary">Aerial</span></span>
            </div>
            <p className="font-inter text-xs text-muted-foreground leading-relaxed mb-4">
              Spécialiste de la vidéo et l'inspection par drone. Solutions professionnelles, précision technique, résultats premium.
            </p>
            <div className="flex gap-3">
              <a href="https://youtube.com" target="_blank" rel="noopener noreferrer"
                className="w-8 h-8 rounded-lg bg-secondary border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/30 transition-colors">
                <Youtube className="w-3.5 h-3.5" />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer"
                className="w-8 h-8 rounded-lg bg-secondary border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/30 transition-colors">
                <Instagram className="w-3.5 h-3.5" />
              </a>
              <a href="https://tiktok.com" target="_blank" rel="noopener noreferrer"
                className="w-8 h-8 rounded-lg bg-secondary border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/30 transition-colors">
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.32 6.32 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V9.05a8.17 8.17 0 0 0 4.78 1.52V7.12a4.85 4.85 0 0 1-1.01-.43z"/></svg>
              </a>
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="font-grotesk font-semibold text-sm mb-4">Navigation</h4>
            <div className="space-y-2">
              {[['/', 'Accueil'], ['/services', 'Services'], ['/portfolio', 'Portfolio'], ['/blog', 'Blog'], ['/quote', 'Demander un devis']].map(([to, label]) => (
                <Link key={to} to={to} className="block font-inter text-xs text-muted-foreground hover:text-primary transition-colors">{label}</Link>
              ))}
            </div>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-grotesk font-semibold text-sm mb-4">Services</h4>
            <div className="space-y-2">
              {['Vidéo événement', 'Inspection toiture', 'Suivi chantier', 'Captation entreprise', 'Retour temps réel'].map(s => (
                <Link key={s} to="/services" className="block font-inter text-xs text-muted-foreground hover:text-primary transition-colors">{s}</Link>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-grotesk font-semibold text-sm mb-4">Contact</h4>
            <div className="space-y-3">
              <div className="flex items-center gap-2.5">
                <Mail className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                <span className="font-mono text-xs text-muted-foreground">contact@brenne-aerial.fr</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                <span className="font-mono text-xs text-muted-foreground">+33 6 00 00 00 00</span>
              </div>
              <div className="flex items-start gap-2.5">
                <MapPin className="w-3.5 h-3.5 text-primary flex-shrink-0 mt-0.5" />
                <span className="font-inter text-xs text-muted-foreground">Brenne, Indre, France</span>
              </div>
            </div>
          </div>
        </div>

        {/* Newsletter */}
        <div className="py-8 border-t border-border mb-0">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div>
              <h4 className="font-grotesk font-semibold text-sm mb-1">Newsletter Brenne Aerial™</h4>
              <p className="font-inter text-xs text-muted-foreground">Actualités, projets et annonces directement dans votre boîte mail.</p>
            </div>
            <a
              href="https://a4835101.sibforms.com/serve/MUIFAC3C5UXdgrZ-CYR3iV27NCBuTTlUAVw80srFWWQ1uQqa9zEJu_QjFXyxzE_cjXKKN4npfoqMKMs9lLTQwXf3ox21FCxhlCz_wVgMTyX86xIWn29NjWLwDgvg5YGhFZ2acj3HZshol1zV0zwpXdvgB0dhKU6CE25yH20lCqS0cWOYOEXnQyfPG4HwSVpt7onwP66N9DD1OCspXQ=="
              target="_blank"
              rel="noopener noreferrer"
              className="flex-shrink-0 inline-flex items-center gap-2 bg-primary/10 border border-primary/30 text-primary hover:bg-primary/20 transition-colors rounded-lg px-5 py-2.5 font-inter text-sm font-medium"
            >
              <Mail className="w-4 h-4" />
              S'inscrire à la newsletter
            </a>
          </div>
        </div>

        {/* Bottom */}
        <div className="pt-6 border-t border-border flex flex-col items-center sm:flex-row sm:justify-between gap-4">
          <p className="font-mono text-xs text-muted-foreground">
            © {year} Brenne Aerial — Enor Lefoulon Meyer. Tous droits réservés.
          </p>
          <div className="flex flex-wrap items-center gap-4">
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
              <span className="w-2 h-2 rounded-full bg-green-400 inline-block" />
              Statut des services
            </Link>
            <Link to="/legal/privacy" className="font-inter text-xs text-muted-foreground hover:text-primary transition-colors">Politique de confidentialité</Link>
            <Link to="/legal/terms" className="font-inter text-xs text-muted-foreground hover:text-primary transition-colors">CGU</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}