import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Bell, User, MessageCircle, Compass } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';

const NAV_LINKS = [
  { to: '/', label: 'Accueil' },
  { to: '/about', label: 'À propos' },
  { to: '/services', label: 'Services' },
  { to: '/portfolio', label: 'Portfolio' },
  { to: '/planning', label: 'Planning' },
  { to: '/blog', label: 'Blog' },
  { to: '/contact', label: 'Contact' },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState(null);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    base44.auth.isAuthenticated().then(auth => {
      if (auth) base44.auth.me().then(setUser);
    });
  }, []);

  const { data: notifs = [] } = useQuery({
    queryKey: ['nav-notifs', user?.email],
    queryFn: () => base44.entities.Notification.filter({ user_email: user.email, is_read: false }),
    enabled: !!user?.email,
    refetchInterval: 30000,
  });

  const isActive = (path) => location.pathname === path;

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'glass shadow-lg' : 'bg-transparent'}`}>
      <div className="max-w-7xl mx-auto px-5 lg:px-10 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="relative w-8 h-8">
            <div className="absolute inset-0 bg-primary/20 rounded-lg group-hover:bg-primary/30 transition-colors" />
            <svg viewBox="0 0 32 32" className="w-8 h-8 relative z-10" fill="none">
              <path d="M16 4 L28 10 L28 22 L16 28 L4 22 L4 10 Z" stroke="hsl(205 90% 58%)" strokeWidth="1.5" fill="none" />
              <circle cx="16" cy="16" r="3" fill="hsl(205 90% 58%)" />
              <path d="M16 4 L16 13 M16 19 L16 28 M4 10 L13 13.5 M19 18.5 L28 22 M4 22 L13 18.5 M19 13.5 L28 10" stroke="hsl(205 90% 58%)" strokeWidth="1" opacity="0.5" />
            </svg>
          </div>
          <div>
            <span className="font-grotesk font-bold text-lg text-foreground tracking-tight">
              Brenne <span className="text-primary">Aerial</span>
            </span>
          </div>
        </Link>

        {/* Desktop links */}
        <div className="hidden lg:flex items-center gap-1">
          {NAV_LINKS.map(link => (
            <Link
              key={link.to}
              to={link.to}
              className={`px-3 py-1.5 rounded-lg font-inter text-sm transition-all duration-200 ${
                isActive(link.to)
                  ? 'text-primary bg-primary/10'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Right */}
        <div className="hidden lg:flex items-center gap-3">
          {user ? (
            <>
              <Link to="/discover">
                <Button variant="ghost" size="sm" className={`text-muted-foreground hover:text-foreground gap-1.5 ${isActive('/discover') ? 'text-primary' : ''}`}>
                  <Compass className="w-4 h-4" />
                  <span className="font-inter text-sm hidden xl:inline">Découvrir</span>
                </Button>
              </Link>
              <Link to="/messages" className="relative">
                <Button variant="ghost" size="sm" className={`text-muted-foreground hover:text-foreground ${isActive('/messages') ? 'text-primary' : ''}`}>
                  <MessageCircle className="w-4 h-4" />
                </Button>
              </Link>
              <Link to="/dashboard" className="relative">
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                  <Bell className="w-4 h-4" />
                  {notifs.length > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-primary text-primary-foreground text-[10px] font-mono flex items-center justify-center">
                      {notifs.length > 9 ? '9+' : notifs.length}
                    </span>
                  )}
                </Button>
              </Link>
              <Link to="/dashboard">
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground gap-1.5">
                  <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                    <User className="w-3.5 h-3.5 text-primary" />
                  </div>
                  <span className="font-inter text-sm">{user.full_name?.split(' ')[0]}</span>
                </Button>
              </Link>
              {user.role === 'admin' && (
                <Link to="/admin">
                  <Button size="sm" className="bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 font-inter text-xs">
                    Admin
                  </Button>
                </Link>
              )}
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" onClick={() => base44.auth.redirectToLogin()} className="font-inter text-sm text-muted-foreground hover:text-foreground">
                Connexion
              </Button>
              <Link to="/quote">
                <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90 font-grotesk font-semibold text-sm px-4 sky-glow">
                  Devis gratuit
                </Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile burger */}
        <button onClick={() => setOpen(!open)} className="lg:hidden text-foreground p-1">
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden glass border-t border-border"
          >
            <div className="px-5 py-4 space-y-1">
              {NAV_LINKS.map(link => (
                <Link key={link.to} to={link.to} onClick={() => setOpen(false)}
                  className={`block px-3 py-2.5 rounded-lg font-inter text-sm transition-colors ${
                    isActive(link.to) ? 'text-primary bg-primary/10' : 'text-muted-foreground hover:text-foreground'
                  }`}>
                  {link.label}
                </Link>
              ))}
              <div className="pt-3 border-t border-border flex flex-col gap-2">
                {user ? (
                  <>
                    <Link to="/discover" onClick={() => setOpen(false)}>
                      <Button size="sm" variant="outline" className="w-full font-inter text-sm border-border gap-2">
                        <Compass className="w-4 h-4" /> Découvrir
                      </Button>
                    </Link>
                    <Link to="/messages" onClick={() => setOpen(false)}>
                      <Button size="sm" variant="outline" className="w-full font-inter text-sm border-border gap-2">
                        <MessageCircle className="w-4 h-4" /> Messages
                      </Button>
                    </Link>
                    <Link to="/dashboard" onClick={() => setOpen(false)}>
                      <Button size="sm" variant="outline" className="w-full font-inter text-sm border-border">
                        Mon espace
                      </Button>
                    </Link>
                  </>
                ) : (
                  <>
                    <Button variant="ghost" size="sm" onClick={() => base44.auth.redirectToLogin()} className="w-full font-inter text-sm">Connexion</Button>
                    <Link to="/quote" onClick={() => setOpen(false)}>
                      <Button size="sm" className="w-full bg-primary text-primary-foreground font-grotesk font-semibold">Devis gratuit</Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}