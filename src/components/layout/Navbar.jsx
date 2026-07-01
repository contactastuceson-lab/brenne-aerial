import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Bell, User, LogOut, LayoutDashboard, Menu, X,
  Search, Home, Compass, MessageCircle, FileText,
  PenSquare, Settings, ChevronDown, Users,
  Calendar, Building2, Briefcase, BarChart3, Heart
} from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { hasAdminAccess } from '@/lib/roles';
import { canManageAffiliations } from '@/lib/affiliationUtils';
import { motion, AnimatePresence } from 'framer-motion';
import NotificationsPanel from '@/components/notifications/NotificationsPanel';

const NAV_LINKS = [
  { to: '/',         label: 'Accueil',  icon: Home },
  { to: '/discover', label: 'Explorer', icon: Compass },
  { to: '/messages', label: 'Messages', icon: MessageCircle },
  { to: '/forum',    label: 'Forum',    icon: FileText },
];

const MORE_LINKS = [
  { to: '/planning',    label: 'Événements' },
  { to: '/partenaires', label: 'Partenaires' },
  { to: '/parrainage',  label: 'Parrainage' },
  { to: '/ecosysteme',  label: 'Écosystème' },
  { to: '/blog',        label: 'Blog' },
  { to: '/contact',     label: 'Contact' },
  { to: '/donation',    label: 'Soutenir' },
];

export default function Navbar() {
  const location  = useLocation();
  const navigate  = useNavigate();
  const [mobileOpen, setMobileOpen]   = useState(false);
  const [moreOpen, setMoreOpen]       = useState(false);
  const [notifsOpen, setNotifsOpen]   = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const moreRef = useRef(null);

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

  useEffect(() => { setMoreOpen(false); setMobileOpen(false); setNotifsOpen(false); }, [location.pathname]);

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
  const isAdmin = hasAdminAccess(user);
  const isBusiness = canManageAffiliations(user);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/7"
      style={{ background: 'rgba(4,10,20,0.92)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}
    >
      <div className="max-w-[1400px] mx-auto px-4 sm:px-5 lg:px-6">
        <div className="flex items-center h-[68px] gap-3">

          {/* Logo */}
          <Link to="/" className="flex-shrink-0 flex items-center gap-2.5 mr-2">
            <img
              src="https://media.base44.com/images/public/69c5c081406b9e20deaed582/80278201e_1782606023373-Photoroom.png"
              alt="EZA"
              className="h-9 w-9 object-contain"
            />
          </Link>

          {/* Search */}
          <form onSubmit={handleSearch} className="flex-1 max-w-xs xl:max-w-sm hidden md:block">
            <div className={`relative rounded-xl transition-all duration-200 ${searchFocused ? 'ring-1 ring-primary/40' : ''}`}>
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50 pointer-events-none" />
              <input
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                placeholder="Rechercher des profils, publications…"
                className="w-full h-9 pl-9 pr-4 rounded-xl text-sm font-inter text-foreground placeholder:text-muted-foreground/40 focus:outline-none transition-colors"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.09)' }}
              />
            </div>
          </form>

          {/* Desktop nav */}
          <div className="hidden lg:flex items-center gap-0.5 ml-1">
            {NAV_LINKS.map(({ to, label, icon: Icon }) => (
              <Link key={to} to={to}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-inter transition-all ${
                  isActive(to)
                    ? 'text-primary font-medium'
                    : 'text-muted-foreground hover:text-foreground hover:bg-white/6'
                }`}
                style={isActive(to) ? { background: 'hsl(var(--primary)/0.12)' } : {}}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden xl:inline">{label}</span>
              </Link>
            ))}

            {/* More */}
            <div className="relative" ref={moreRef}>
              <button onClick={() => setMoreOpen(v => !v)}
                className={`flex items-center gap-1 px-3 py-2 rounded-xl text-sm font-inter transition-all ${
                  moreOpen ? 'bg-white/8 text-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-white/6'
                }`}
              >
                Plus
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${moreOpen ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence>
                {moreOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.97 }}
                    transition={{ duration: 0.15 }}
                    className="absolute top-full left-0 mt-2 w-48 rounded-2xl overflow-hidden z-50 py-1.5"
                    style={{
                      background: 'rgba(8,16,32,0.97)',
                      border: '1px solid rgba(255,255,255,0.12)',
                      boxShadow: '0 16px 48px rgba(0,0,0,0.5)',
                      backdropFilter: 'blur(20px)',
                    }}
                  >
                    {MORE_LINKS.map(({ to, label }) => (
                      <Link key={to} to={to} onClick={() => setMoreOpen(false)}
                        className={`flex items-center px-4 py-2.5 text-sm font-inter transition-colors ${
                          isActive(to) ? 'text-primary bg-primary/10' : 'text-muted-foreground hover:text-foreground hover:bg-white/7'
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

          <div className="flex-1 lg:flex-none" />

          {/* Right actions */}
          <div className="flex items-center gap-1">
            {user ? (
              <>
                {/* Publier */}
                <Link to="/" className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-inter font-medium transition-all hover:scale-105 border border-primary/25 hover:border-primary/40 hover:bg-primary/10"
                  style={{ color: 'hsl(var(--primary))' }}
                >
                  <PenSquare className="w-3.5 h-3.5" />
                  <span className="hidden lg:inline">Publier</span>
                </Link>

                {/* Notifications */}
                <div className="relative">
                  <button onClick={() => setNotifsOpen(v => !v)}
                    className="relative w-9 h-9 rounded-xl flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-white/8 transition-colors"
                  >
                    <Bell className="w-4.5 h-4.5" style={{ width: 18, height: 18 }} />
                    {notifs.length > 0 && (
                      <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-primary text-primary-foreground text-[9px] font-mono flex items-center justify-center border-2 border-background" style={{ lineHeight: 1 }}>
                        {notifs.length > 9 ? '9+' : notifs.length}
                      </span>
                    )}
                  </button>
                  <NotificationsPanel user={user} open={notifsOpen} onClose={() => setNotifsOpen(false)} />
                </div>

                {/* Business */}
                {isBusiness && (
                  <Link to="/business" className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-inter font-medium border border-amber-400/20 hover:bg-amber-400/12 transition-colors text-amber-400">
                    <Briefcase className="w-3.5 h-3.5" />
                    <span className="hidden lg:inline">Business</span>
                  </Link>
                )}

                {/* Admin */}
                {isAdmin && (
                  <Link to="/admin" className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-inter border border-white/8 hover:bg-white/8 transition-colors text-muted-foreground hover:text-foreground">
                    <LayoutDashboard className="w-3.5 h-3.5" />
                    <span className="hidden lg:inline">Admin</span>
                  </Link>
                )}

                {/* Avatar */}
                <Link to="/profile"
                  className="hidden md:flex items-center gap-2 p-1 pr-2.5 rounded-xl border border-white/8 hover:bg-white/8 transition-colors"
                >
                  <div className="w-7 h-7 rounded-full overflow-hidden border border-primary/20 flex items-center justify-center flex-shrink-0"
                    style={{ background: 'hsl(var(--primary)/0.15)' }}
                  >
                    {user.avatar_url
                      ? <img src={user.avatar_url} className="w-full h-full object-cover" alt="" />
                      : <span className="font-grotesk font-bold text-primary text-xs">{avatarInitial}</span>
                    }
                  </div>
                  <span className="hidden xl:block font-inter text-xs font-medium text-foreground/80 truncate max-w-[90px]">{displayName}</span>
                </Link>

                {/* Logout */}
                <button onClick={() => base44.auth.logout('/')}
                  className="hidden md:flex w-9 h-9 rounded-xl items-center justify-center text-muted-foreground/50 hover:text-rose-400 hover:bg-rose-400/10 transition-colors"
                  title="Déconnexion"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </>
            ) : (
              <>
                <button onClick={() => base44.auth.redirectToLogin()}
                  className="hidden md:inline-flex px-4 py-2 rounded-xl text-sm font-inter font-semibold text-primary-foreground transition-all hover:scale-105"
                  style={{ background: 'linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--accent)) 100%)', boxShadow: '0 0 20px hsl(var(--primary)/0.3)' }}
                >
                  Connexion
                </button>
                <Link to="/register" className="hidden md:inline-flex px-4 py-2 rounded-xl text-sm font-inter text-muted-foreground border border-white/10 hover:bg-white/8 hover:text-foreground transition-colors">
                  S'inscrire
                </Link>
              </>
            )}

            {/* Mobile hamburger */}
            <button onClick={() => setMobileOpen(v => !v)}
              className="lg:hidden w-9 h-9 rounded-xl flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-white/8 transition-colors"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden overflow-hidden border-t border-white/7"
            >
              <div className="py-3 space-y-0.5">
                <form onSubmit={handleSearch} className="px-2 pb-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/40 pointer-events-none" />
                    <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Rechercher…"
                      className="w-full h-9 pl-9 pr-4 rounded-xl text-sm font-inter placeholder:text-muted-foreground/40 focus:outline-none"
                      style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.09)' }}
                    />
                  </div>
                </form>

                {[...NAV_LINKS, ...MORE_LINKS].map(({ to, label }) => (
                  <Link key={to} to={to} onClick={() => setMobileOpen(false)}
                    className={`block px-4 py-2.5 rounded-xl text-sm font-inter transition-colors ${
                      isActive(to) ? 'text-primary bg-primary/10 font-medium' : 'text-muted-foreground hover:text-foreground hover:bg-white/6'
                    }`}
                  >
                    {label}
                  </Link>
                ))}

                <div className="pt-3 px-2 flex gap-2">
                  {!user ? (
                    <>
                      <button onClick={() => { base44.auth.redirectToLogin(); setMobileOpen(false); }}
                        className="flex-1 py-2.5 rounded-xl text-sm font-inter font-semibold text-primary-foreground"
                        style={{ background: 'linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--accent)) 100%)' }}
                      >
                        Se connecter
                      </button>
                      <Link to="/register" onClick={() => setMobileOpen(false)}
                        className="flex-1 py-2.5 rounded-xl text-sm font-inter text-center text-muted-foreground border border-white/10 hover:bg-white/6 transition-all"
                      >
                        S'inscrire
                      </Link>
                    </>
                  ) : (
                    <button onClick={() => { base44.auth.logout('/'); setMobileOpen(false); }}
                      className="flex items-center gap-2 w-full px-4 py-2.5 rounded-xl text-sm font-inter text-rose-400 hover:bg-rose-400/10 transition-colors"
                    >
                      <LogOut className="w-4 h-4" /> Déconnexion
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
}