import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Youtube, Instagram, ArrowUpRight, Heart, Circle } from 'lucide-react';

const PLATFORM = [
  { to: '/',          label: 'Accueil' },
  { to: '/discover',  label: 'Explorer' },
  { to: '/forum',     label: 'Forum' },
  { to: '/messages',  label: 'Messages' },
  { to: '/blog',      label: 'Blog' },
];

const COMMUNITY = [
  { to: '/partenaires',  label: 'Partenaires' },
  { to: '/parrainage',   label: 'Parrainage' },
  { to: '/ecosysteme',   label: 'Écosystème' },
  { to: '/donation',     label: 'Soutenir le projet' },
  { to: '/contact',      label: 'Contact' },
];

const LEGAL = [
  { to: '/legal/privacy', label: 'Confidentialité' },
  { to: '/legal/terms',   label: 'CGU' },
  { to: '/legal/cookies', label: 'Cookies' },
  { to: '/uptime',        label: 'Statut des services' },
];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative mt-16 border-t border-white/6">
      <div className="max-w-7xl mx-auto px-5 lg:px-10 pt-12 pb-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-12">

          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="flex items-center gap-2.5 mb-4">
              <img
                src="https://media.base44.com/images/public/69c5c081406b9e20deaed582/80278201e_1782606023373-Photoroom.png"
                alt="EZA"
                className="w-9 h-9 object-contain"
              />
              <span className="font-grotesk font-bold text-base">
                EZA <span className="text-primary text-xs font-normal">by EZA Group</span>
              </span>
            </Link>
            <p className="font-inter text-sm text-muted-foreground leading-relaxed mb-5 max-w-[220px]">
              Le réseau social dédié aux créateurs, organisations et communautés.
            </p>
            <div className="flex gap-2">
              <a href="https://youtube.com" target="_blank" rel="noopener noreferrer"
                className="w-8 h-8 rounded-xl border border-white/8 flex items-center justify-center text-muted-foreground hover:text-red-400 hover:border-red-400/30 hover:bg-red-400/8 transition-all">
                <Youtube className="w-3.5 h-3.5" />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer"
                className="w-8 h-8 rounded-xl border border-white/8 flex items-center justify-center text-muted-foreground hover:text-pink-400 hover:border-pink-400/30 hover:bg-pink-400/8 transition-all">
                <Instagram className="w-3.5 h-3.5" />
              </a>
              <a href="mailto:contact@brenneaerial.fr"
                className="w-8 h-8 rounded-xl border border-white/8 flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/30 hover:bg-primary/8 transition-all">
                <Mail className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Platform */}
          <div>
            <h4 className="font-grotesk font-semibold text-xs uppercase tracking-widest text-muted-foreground/60 mb-4">Plateforme</h4>
            <div className="space-y-2.5">
              {PLATFORM.map(({ to, label }) => (
                <Link key={to} to={to} className="flex items-center gap-1 font-inter text-sm text-muted-foreground hover:text-foreground transition-colors group">
                  <span>{label}</span>
                  <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-50 transition-opacity" />
                </Link>
              ))}
            </div>
          </div>

          {/* Community */}
          <div>
            <h4 className="font-grotesk font-semibold text-xs uppercase tracking-widest text-muted-foreground/60 mb-4">Communauté</h4>
            <div className="space-y-2.5">
              {COMMUNITY.map(({ to, label }) => (
                <Link key={to} to={to} className="flex items-center gap-1 font-inter text-sm text-muted-foreground hover:text-foreground transition-colors group">
                  <span>{label}</span>
                  <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-50 transition-opacity" />
                </Link>
              ))}
            </div>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-grotesk font-semibold text-xs uppercase tracking-widest text-muted-foreground/60 mb-4">Légal</h4>
            <div className="space-y-2.5">
              {LEGAL.map(({ to, label }) => (
                <Link key={to} to={to} className="flex items-center gap-1 font-inter text-sm text-muted-foreground hover:text-foreground transition-colors group">
                  <span>{label}</span>
                  <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-50 transition-opacity" />
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 border-t border-white/6">
          <p className="font-mono text-xs text-muted-foreground/40">
            © {year} EZA by EZA Group · Fait en France
          </p>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-mono text-xs text-muted-foreground/40">Tous les services opérationnels</span>
          </div>
        </div>
      </div>
    </footer>
  );
}