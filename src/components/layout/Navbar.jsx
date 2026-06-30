import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Bell, User, LogOut, LayoutDashboard, Menu, X, ChevronDown,
  Briefcase, Search, Home, Compass, MessageCircle, FileText,
  PenSquare, Settings, Sparkles
} from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { hasAdminAccess } from '@/lib/roles';
import { canManageAffiliations } from '@/lib/affiliationUtils';
import { motion, AnimatePresence } from 'framer-motion';
import NotificationsPanel from '@/components/notifications/NotificationsPanel';

const NAV_LINKS = [
  { to: '/',          label: 'Accueil',     icon: Home },
  { to: '/discover',  label: 'Explorer',    icon: Compass },
  { to: '/messages',  label: 'Messages',    icon: MessageCircle },
  { to: '/forum',     label: 'Forum',       icon: FileText },
];

const MORE_LINKS = [
  { to: '/portfolio',     label: 'Portfolio' },
  { to: '/planning',      label: 'Planning' },
  { to: '/blog',          label: 'Blog' },
  { to: '/partenaires',   label: 'Partenaires' },
  { to: '/parrainage',    label: 'Parrainage' },
  { to: '/reglementation',label: 'Réglementation' },
  { to: '/espace-client', label: 'Espace Client' },
  { to: '/ecosysteme',    label: 'Écosystème' },
  { to: '/garage',        label: 'Garage Drones' },
];

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen]   = useState(false);
  const [moreOpen, setMoreOpen]       = useState(false);
  const [notifsOpen, setNotifsOpen]   = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const moreRef = useRef(null);
  const searchRef = useRef(null);

  const { data: user = null } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me(),
    staleTime: 60000,
    retry: false,
  });

  const { data: notifs = [] } = useQuery({
    queryKey: ['unread-notifs', user?.email],
    queryFn: () => base44.entities.Notification.filter({ user_email: user.email, is_read: false }),
    enabled: !!user?.email,
    refetchInterval: 60000,
    staleTime: 30000,
  });

  useEffect(() => {
    setMoreOpen(false);
    setMobileOpen(false);
    setNotifsOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!moreOpen) return;
    const h = (e) => { if (moreRef.current && !moreRef.current.contains(e.target)) setMoreOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [moreOpen]);

  const isActive = (path) => path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/discover?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setSearchFocused(false);
    }
  };

  const displayName = user?.display_name || user?.full_name;
  const avatarInitial = (displayName?.[0] || 'U').toUpperCase();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/50"
      style={{ background: 'hsl(var(--background) / 0.92)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-5 lg:px-6">
        <div className="flex items-center h-[68px] gap-3">

          {/* ── Logo ── */}
          <Link to="/" className="flex-shrink-0 flex items-center gap-2.5 mr-2">
            <div className="w-8 h-8 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-primary" />
            </div>
            <span className="font-grotesk font-bold text-base gradient-text hidden sm:block">Brenne Aerial</span>
          </Link>

          {/* ── Search bar ── */}
          <form onSubmit={handleSearch} className="flex-1 max-w-xs xl:max-w-sm hidden md:block">
            <div className={`relative transition-all duration-200 ${searchFocused ? 'ring-1 ring-primary/40' : ''} rounded-xl`}>
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              <input
                ref={searchRef}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                placeholder="Rechercher…"
                className="w-full h-9 pl-9 pr-4 rounded-xl bg-secondary/50 border border-border/50 text-sm font-inter text-foreground placeholder:text-muted-foreground focus:outline-none focus:bg-secondary/70 transition-colors"
              />
            </div>
          </form>

          {/* ── Desktop nav links ── */}
          <div className="hidden lg:flex items-center gap-0.5 ml-1">
            {NAV_LINKS.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-inter transition-all ${
                  isActive(to)
                    ? 'bg-primary/12 text-primary font-medium'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden xl:inline">{label}</span>
              </Link>
            ))}

            {/* More dropdown */}
            <div className="relative" ref={moreRef}>
              <button
                onClick={() => setMoreOpen(v => !v)}
                className={`flex items-center gap-1 px-3 py-2 rounded-xl text-sm font-inter transition-all ${
                  moreOpen ? 'bg-secondary/60 text-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                }`}
              >
                Plus
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${moreOpen ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence>
                {moreOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.97 }}
                    transition={{ duration: 0.15 }}
                    className="absolute top-full left-0 mt-2 w-52 rounded-2xl border border-border bg-card shadow-2xl overflow-hidden z-50 py-1"
                    style={{ boxShadow: '0 8px 40px rgba(0,0,0,0.3)' }}
                  >
                    {MORE_LINKS.map(({ to, label }) => (
                      <Link
                        key={to}
                        to={to}
                        onClick={() => setMoreOpen(false)}
                        className={`flex items-center px-4 py-2.5 text-sm font-inter transition-colors ${
                          isActive(to)
                            ? 'bg-primary/10 text-primary'
                            : 'text-muted-foreground hover:text-foreground hover:bg-secondary/60'
                        }`}
                      >
                        {label}
                      </Link>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* ── Spacer ── */}
          <div className="flex-1 lg:flex-none" />

          {/* ── Right actions ── */}
          <div className="flex items-center gap-1.5">
            {user ? (
              <>
                {/* Create post shortcut */}
                <Link
                  to="/"
                  className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-inter font-medium bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-colors"
                >
                  <PenSquare className="w-3.5 h-3.5" />
                  <span className="hidden lg:inline">Publier</span>
                </Link>

                {/* Notifications */}
                <div className="relative">
                  <button
                    onClick={() => setNotifsOpen(v => !v)}
                    className="relative w-9 h-9 rounded-xl flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors"
                  >
                    <Bell className="w-4.5 h-4.5" />
                    {notifs.length > 0 && (
                      <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-primary text-primary-foreground text-[9px] font-mono flex items-center justify-center leading-none border border-card">
                        {notifs.length > 9 ? '9+' : notifs.length}
                      </span>
                    )}
                  </button>
                  <NotificationsPanel user={user} open={notifsOpen} onClose={() => setNotifsOpen(false)} />
                </div>

                {/* Business badge */}
                {canManageAffiliations(user) && (
                  <Link
                    to="/business"
                    className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-inter font-medium bg-amber-400/10 text-amber-400 border border-amber-400/20 hover:bg-amber-400/20 transition-colors"
                  >
                    <Briefcase className="w-3.5 h-3.5" />
                    <span className="hidden lg:inline">Business</span>
                  </Link>
                )}

                {/* Admin */}
                {hasAdminAccess(user) && (
                  <Link
                    to="/admin"
                    className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-inter bg-secondary hover:bg-secondary/70 transition-colors text-muted-foreground hover:text-foreground"
                  >
                    <LayoutDashboard className="w-3.5 h-3.5" />
                    <span className="hidden lg:inline">Admin</span>
                  </Link>
                )}

                {/* Avatar */}
                <div className="relative hidden md:block">
                  <Link
                    to="/profile"
                    className="flex items-center gap-2 p-1 pr-2 rounded-xl hover:bg-secondary/60 transition-colors"
                  >
                    <div className="w-7 h-7 rounded-full bg-primary/15 border border-primary/25 flex items-center justify-center overflow-hidden flex-shrink-0">
                      {user.avatar_url
                        ? <img src={user.avatar_url} className="w-full h-full object-cover" alt="" />
                        : <span className="font-grotesk font-bold text-primary text-xs">{avatarInitial}</span>
                      }
                    </div>
                    <div className="hidden xl:block leading-none">
                      <p className="text-xs font-inter font-medium text-foreground truncate max-w-[100px]">{displayName}</p>
                    </div>
                  </Link>
                </div>

                {/* Logout */}
                <button
                  onClick={() => base44.auth.logout('/')}
                  className="hidden md:flex w-9 h-9 rounded-xl items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors"
                  title="Déconnexion"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => base44.auth.redirectToLogin()}
                  className="hidden md:inline-flex px-3.5 py-2 rounded-xl text-sm font-inter font-medium text-primary-foreground bg-primary hover:bg-primary/90 transition-colors"
                  style={{ boxShadow: '0 0 16px rgba(var(--primary),0.25)' }}
                >
                  Connexion
                </button>
                <Link
                  to="/register"
                  className="hidden md:inline-flex px-3.5 py-2 rounded-xl text-sm font-inter font-medium text-muted-foreground bg-secondary hover:bg-secondary/70 transition-colors"
                >
                  S'inscrire
                </Link>
              </>
            )}

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen(v => !v)}
              className="lg:hidden w-9 h-9 rounded-xl flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* ── Mobile menu ── */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="lg:hidden overflow-hidden border-t border-border/50"
            >
              <div className="py-3 space-y-1">
                {/* Mobile search */}
                <form onSubmit={handleSearch} className="px-2 pb-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                    <input
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      placeholder="Rechercher…"
                      className="w-full h-9 pl-9 pr-4 rounded-xl bg-secondary/50 border border-border/50 text-sm font-inter text-foreground placeholder:text-muted-foreground focus:outline-none"
                    />
                  </div>
                </form>

                {[...NAV_LINKS, ...MORE_LINKS].map(({ to, label }) => (
                  <Link
                    key={to}
                    to={to}
                    onClick={() => setMobileOpen(false)}
                    className={`block px-3 py-2.5 rounded-xl text-sm font-inter transition-colors ${
                      isActive(to)
                        ? 'bg-primary/10 text-primary font-medium'
                        : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                    }`}
                  >
                    {label}
                  </Link>
                ))}

                {!user ? (
                  <div className="flex gap-2 pt-2 px-2">
                    <button
                      onClick={() => { base44.auth.redirectToLogin(); setMobileOpen(false); }}
                      className="flex-1 py-2.5 rounded-xl text-sm font-inter font-semibold text-primary-foreground bg-primary hover:bg-primary/90 transition-colors"
                    >
                      Se connecter
                    </button>
                    <Link to="/register" onClick={() => setMobileOpen(false)}
                      className="flex-1 py-2.5 rounded-xl text-sm font-inter text-center text-muted-foreground bg-secondary hover:bg-secondary/70 transition-colors"
                    >
                      S'inscrire
                    </Link>
                  </div>
                ) : (
                  <button
                    onClick={() => { base44.auth.logout('/'); setMobileOpen(false); }}
                    className="flex items-center gap-2 w-full px-3 py-2.5 rounded-xl text-sm font-inter text-rose-400 hover:bg-rose-400/10 transition-colors mt-2 border-t border-border/40 pt-3"
                  >
                    <LogOut className="w-4 h-4" /> Déconnexion
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
}