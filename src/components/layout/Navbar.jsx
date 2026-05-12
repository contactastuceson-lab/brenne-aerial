import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, FileText, Compass, MessageCircle, Bell, User, LogOut, LayoutDashboard, Menu, X } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { hasAdminAccess } from '@/lib/roles';
import { motion } from 'framer-motion';

const NAV_LINKS = [
  { to: '/',         label: 'Accueil' },
  { to: '/quote',    label: 'Devis' },
  { to: '/discover', label: 'Explorer' },
  { to: '/portfolio', label: 'Portfolio' },
  { to: '/planning',  label: 'Planning' },
  { to: '/contact',   label: 'Contact' },
];

export default function Navbar() {
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    base44.auth.isAuthenticated().then(auth => {
      if (auth) base44.auth.me().then(setUser);
    });
  }, []);

  const { data: notifs = [] } = useQuery({
    queryKey: ['navbar-notifs', user?.email],
    queryFn: () => base44.entities.Notification.filter({ user_email: user.email, is_read: false }),
    enabled: !!user?.email,
    refetchInterval: 15000,
  });

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b border-border/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex-shrink-0">
            <div className="text-xl font-grotesk font-bold gradient-text">Brenne Aerial</div>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map(link => (
              <Link
                key={link.to}
                to={link.to}
                className={`px-3 py-2 rounded-lg text-sm font-inter transition-colors ${
                  isActive(link.to)
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right side: Notifs, Profile, Auth */}
          <div className="flex items-center gap-3">
            {user ? (
              <>
                {/* Notifications */}
                <Link
                  to="/dashboard"
                  className="relative p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                >
                  <Bell className="w-5 h-5" />
                  {notifs.length > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-primary text-primary-foreground text-[10px] font-mono flex items-center justify-center">
                      {notifs.length > 9 ? '9+' : notifs.length}
                    </span>
                  )}
                </Link>

                {/* Profile dropdown menu */}
                <div className="hidden sm:flex items-center gap-2">
                  <Link
                    to="/profile"
                    className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden hover:bg-primary/20 transition-colors"
                  >
                    {user.avatar_url
                      ? <img src={user.avatar_url} className="w-full h-full object-cover" alt="" />
                      : <User className="w-4 h-4 text-primary" />}
                  </Link>
                  <div className="hidden md:block">
                    <p className="text-sm font-inter font-medium">{user.full_name}</p>
                    <p className="text-xs text-muted-foreground">{user.role}</p>
                  </div>
                </div>

                {/* Admin link */}
                {hasAdminAccess(user) && (
                  <Link
                    to="/admin"
                    className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-inter bg-secondary hover:bg-secondary/80 transition-colors"
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    Admin
                  </Link>
                )}

                {/* Logout */}
                <button
                  onClick={() => base44.auth.logout('/')}
                  className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                  title="Déconnexion"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => base44.auth.redirectToLogin()}
                  className="hidden sm:inline-flex px-4 py-2 rounded-lg text-sm font-inter text-primary-foreground bg-primary hover:bg-primary/90 transition-colors"
                >
                  Connexion
                </button>
                <Link
                  to="/quote"
                  className="hidden sm:inline-flex px-4 py-2 rounded-lg text-sm font-inter text-foreground bg-secondary hover:bg-secondary/80 transition-colors"
                >
                  Devis gratuit
                </Link>
              </>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="md:hidden py-4 space-y-2 border-t border-border/60"
          >
            {NAV_LINKS.map(link => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-3 py-2 rounded-lg text-sm font-inter transition-colors ${
                  isActive(link.to)
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {link.label}
              </Link>
            ))}
            {!user && (
              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => { base44.auth.redirectToLogin(); setMobileMenuOpen(false); }}
                  className="flex-1 px-3 py-2 rounded-lg text-sm font-inter text-primary-foreground bg-primary hover:bg-primary/90 transition-colors"
                >
                  Connexion
                </button>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </nav>
  );
}