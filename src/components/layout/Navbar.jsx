import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, FileText, Compass, MessageCircle, Bell, User, LogOut, LayoutDashboard, Menu, X, ChevronDown } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { hasAdminAccess } from '@/lib/roles';
import { motion, AnimatePresence } from 'framer-motion';
import NotificationsPanel from '@/components/notifications/NotificationsPanel';

const NAV_LINKS = [
  { to: '/',         label: 'Accueil' },
  { to: '/discover', label: 'Explorer' },
  { to: '/portfolio', label: 'Portfolio' },
  { to: '/planning',  label: 'Planning' },
  { to: '/blog',      label: 'Blog' },
  { to: '/forum',     label: 'Forum' },
  { to: '/espace-client', label: 'Espace Client' },
];

const TOOLS = [
  { to: '/garage',           label: 'Garage Drones' },
  { to: '/partenaires',      label: 'Partenaires' },
  { to: '/parrainage',       label: 'Parrainage' },
  { to: '/reglementation',   label: 'Réglementation' },
  { to: '/comparateur',      label: 'Comparateur résolution' },
  { to: '/espace-client',    label: 'Espace Client' },
];

export default function Navbar() {
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [toolsOpen, setToolsOpen] = useState(false);
  const [notifsOpen, setNotifsOpen] = useState(false);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: notifs = [] } = useQuery({
    queryKey: ['unread-notifs', user?.email],
    queryFn: () => base44.entities.Notification.filter({ user_email: user.email, is_read: false }),
    enabled: !!user?.email,
    refetchInterval: 60000,
    staleTime: 30000,
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

            {/* Tools Dropdown */}
            <div className="relative">
              <button
                onClick={() => setToolsOpen(!toolsOpen)}
                className={`px-3 py-2 rounded-lg text-sm font-inter flex items-center gap-1.5 transition-colors ${
                  toolsOpen
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Outils
                <ChevronDown className={`w-4 h-4 transition-transform ${toolsOpen ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {toolsOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute top-full left-0 mt-1 w-48 bg-card border border-border rounded-lg shadow-lg overflow-hidden z-50"
                  >
                    {TOOLS.map(tool => (
                      <Link
                        key={tool.to}
                        to={tool.to}
                        onClick={() => setToolsOpen(false)}
                        className={`block px-4 py-2.5 text-sm font-inter border-b border-border/50 last:border-b-0 transition-colors ${
                          isActive(tool.to)
                            ? 'bg-primary/10 text-primary'
                            : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                        }`}
                      >
                        {tool.label}
                      </Link>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Right side: Notifs, Profile, Auth */}
          <div className="flex items-center gap-3">
            {user ? (
              <>
                {/* Notifications */}
                <button
                  onClick={() => setNotifsOpen(v => !v)}
                  className="relative p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                >
                  <Bell className="w-5 h-5" />
                  {notifs.length > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-primary text-primary-foreground text-[10px] font-mono flex items-center justify-center">
                      {notifs.length > 9 ? '9+' : notifs.length}
                    </span>
                  )}
                </button>
                <NotificationsPanel user={user} open={notifsOpen} onClose={() => setNotifsOpen(false)} />

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
            
            {/* Mobile Tools Submenu */}
            <button
              onClick={() => setToolsOpen(!toolsOpen)}
              className={`block w-full text-left px-3 py-2 rounded-lg text-sm font-inter transition-colors ${
                toolsOpen
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <div className="flex items-center justify-between">
                <span>Outils</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${toolsOpen ? 'rotate-180' : ''}`} />
              </div>
            </button>
            <AnimatePresence>
              {toolsOpen && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-1 px-3"
                >
                  {TOOLS.map(tool => (
                    <Link
                      key={tool.to}
                      to={tool.to}
                      onClick={() => { setMobileMenuOpen(false); setToolsOpen(false); }}
                      className={`block px-3 py-2 rounded-lg text-sm font-inter transition-colors ${
                        isActive(tool.to)
                          ? 'bg-primary/10 text-primary'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {tool.label}
                    </Link>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
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