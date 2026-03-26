import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '@/context/LanguageContext';
import { Menu, X, Globe, User, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';

export default function Navbar({ user }) {
  const [isOpen, setIsOpen] = useState(false);
  const { t, lang, setLang } = useLanguage();
  const location = useLocation();

  const links = [
    { to: '/', label: t('nav.home') },
    { to: '/about', label: t('nav.about') },
    { to: '/services', label: t('nav.services') },
    { to: '/quote', label: t('nav.quote') },
    { to: '/hours', label: t('nav.hours') },
    { to: '/planning', label: t('nav.planning') },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass">
      <div className="max-w-7xl mx-auto px-6 lg:px-20">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <span className="font-syne font-extrabold text-xl tracking-tight text-foreground">
              ENOR<span className="text-primary">.</span>
            </span>
          </Link>

          {/* Desktop links */}
          <div className="hidden lg:flex items-center gap-1">
            {links.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`px-3 py-2 text-sm font-inter font-medium transition-colors rounded-md ${
                  isActive(link.to)
                    ? 'text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right side */}
          <div className="hidden lg:flex items-center gap-3">
            <button
              onClick={() => setLang(lang === 'fr' ? 'en' : 'fr')}
              className="flex items-center gap-1.5 px-2 py-1.5 text-xs font-mono text-muted-foreground hover:text-foreground transition-colors rounded-md"
            >
              <Globe className="w-3.5 h-3.5" />
              {lang.toUpperCase()}
            </button>
            {user ? (
              <div className="flex items-center gap-2">
                <Link to="/dashboard">
                  <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                    <Bell className="w-4 h-4" />
                  </Button>
                </Link>
                <Link to="/dashboard">
                  <Button variant="ghost" size="sm" className="font-inter text-sm text-muted-foreground hover:text-foreground">
                    <User className="w-4 h-4 mr-1.5" />
                    {user.full_name?.split(' ')[0]}
                  </Button>
                </Link>
                {user.role === 'admin' && (
                  <Link to="/admin">
                    <Button size="sm" className="font-inter text-xs bg-primary text-primary-foreground hover:bg-primary/90">
                      {t('nav.admin')}
                    </Button>
                  </Link>
                )}
              </div>
            ) : (
              <Button
                size="sm"
                onClick={() => base44.auth.redirectToLogin()}
                className="font-inter text-xs bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {t('nav.login')}
              </Button>
            )}
          </div>

          {/* Mobile burger */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden text-foreground"
          >
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden glass border-t border-border"
          >
            <div className="px-6 py-4 space-y-2">
              {links.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setIsOpen(false)}
                  className={`block px-3 py-2 text-sm font-inter rounded-md ${
                    isActive(link.to) ? 'text-primary' : 'text-muted-foreground'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <div className="pt-2 border-t border-border flex items-center gap-2">
                <button
                  onClick={() => setLang(lang === 'fr' ? 'en' : 'fr')}
                  className="text-xs font-mono text-muted-foreground"
                >
                  <Globe className="w-3.5 h-3.5 inline mr-1" />
                  {lang.toUpperCase()}
                </button>
                {user ? (
                  <Link to="/dashboard" onClick={() => setIsOpen(false)}>
                    <Button size="sm" variant="outline" className="text-xs">
                      {t('nav.dashboard')}
                    </Button>
                  </Link>
                ) : (
                  <Button size="sm" onClick={() => base44.auth.redirectToLogin()} className="text-xs bg-primary text-primary-foreground">
                    {t('nav.login')}
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}