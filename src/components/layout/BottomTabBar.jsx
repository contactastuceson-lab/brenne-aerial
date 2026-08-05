import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Home, Compass, MessageCircle, MoreHorizontal, X, Search,
  Bell, User, LogOut, LayoutDashboard, Bookmark,
  Users, FileText, Calendar, Settings, Heart, Shield,
  Building2, Star, Award, Plus, Camera, List, Radio,
  ShoppingBag, Wallet, Gift, BookOpen, Newspaper, Info, ShoppingCart, LifeBuoy
} from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { hasAdminAccess } from '@/lib/roles';
import { motion, AnimatePresence } from 'framer-motion';

const MAIN_TABS = [
  { to: '/',         icon: Home,          label: 'Accueil' },
  { to: '/discover', icon: Compass,       label: 'Explorer' },
  { to: '/messages', icon: MessageCircle, label: 'Messages' },
  { to: '/search',   icon: Search,        label: 'Rechercher' },
  { to: null,        icon: MoreHorizontal,label: 'Plus',   isMore: true },
];

const NAV_SECTIONS = [
  {
    title: 'Compte',
    items: [
      { to: '/profile',        icon: User,            label: 'Mon profil',        color: 'text-primary' },
      { to: '/espace',         icon: LayoutDashboard,  label: 'Espace utilisateur', color: 'text-cyan-400' },
      { to: '/notifications',  icon: Bell,            label: 'Notifications',      color: 'text-amber-400' },
      { to: '/bookmarks',     icon: Bookmark,        label: 'Signets',           color: 'text-amber-300' },
      { to: '/lists',         icon: List,            label: 'Listes',           color: 'text-sky-400' },
    ],
  },
  {
    title: 'Communauté',
    items: [
      { to: '/communities',   icon: Users,           label: 'Communautés',   color: 'text-emerald-400' },
      { to: '/spaces',        icon: Radio,           label: 'Spaces',         color: 'text-red-400' },
      { to: '/events',        icon: Calendar,        label: 'Événements',     color: 'text-violet-400' },
      { to: '/forum',         icon: FileText,        label: 'Forum',          color: 'text-blue-400' },
      { to: '/discover',      icon: Compass,         label: 'Explorer',       color: 'text-cyan-400' },
      { to: '/search',        icon: Search,          label: 'Rechercher',     color: 'text-slate-300' },
    ],
  },
  {
    title: 'EZA',
    items: [
      { to: '/ecosysteme',    icon: Star,            label: 'Écosystème',     color: 'text-orange-400' },
      { to: '/enor',          icon: Award,           label: 'Enor',           color: 'text-amber-300' },
      { to: '/portfolio',     icon: Camera,          label: 'Portfolio',      color: 'text-purple-400' },
      { to: '/business',      icon: Building2,       label: 'Business',       color: 'text-cyan-400' },
      { to: '/boutique',      icon: ShoppingBag,      label: 'Boutique',       color: 'text-pink-400' },
      { to: '/panier',        icon: ShoppingCart,     label: 'Panier',         color: 'text-amber-400', cartBadge: true },
      { to: '/banque',        icon: Wallet,           label: 'Banque',         color: 'text-emerald-300' },
      { to: '/parrainage',    icon: Gift,            label: 'Parrainage',     color: 'text-rose-400' },
    ],
  },
  {
    title: 'Ressources',
    items: [
      { to: '/support',        icon: LifeBuoy,         label: 'Support',        color: 'text-cyan-400' },
      { href: 'https://docs.ezagroup.org/', icon: BookOpen, label: 'Documentation', color: 'text-blue-300' },
      { to: '/blog',          icon: Newspaper,        label: 'Blog',           color: 'text-indigo-400' },
      { to: '/about',         icon: Info,             label: 'À propos',       color: 'text-slate-300' },
      { to: '/donation',      icon: Heart,            label: 'Soutenir',       color: 'text-red-400' },
      { to: '/legal/privacy', icon: Shield,           label: 'Confidentialité',color: 'text-slate-400' },
    ],
  },
];

export default function BottomTabBar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [showMore, setShowMore] = useState(false);

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

  const { data: cartData = null } = useQuery({
    queryKey: ['cart-active', user?.id],
    queryFn: () => base44.entities.Cart.filter({ owner_id: user.id, status: 'active' }),
    enabled: !!user?.id,
    staleTime: 30000,
  });
  const cartCount = (cartData?.[0]?.items || []).reduce((s, it) => s + (Number(it.qty) || 1), 0);

  const isActive = (path) => {
    if (!path) return false;
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path.split('?')[0]);
  };

  const unreadCount = notifs.length;
  const activeTabIndex = MAIN_TABS.findIndex((tab) => !tab.isMore && isActive(tab.to));

  return (
    <>
      {/* Fullscreen drawer */}
      <AnimatePresence>
        {showMore && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-40" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
              onClick={() => setShowMore(false)}
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 380 }}
              className="fixed bottom-0 left-0 right-0 z-50 rounded-t-3xl max-h-[88vh] flex flex-col overflow-hidden"
              style={{
                background: 'linear-gradient(180deg, rgba(14,22,40,0.98) 0%, rgba(4,10,20,0.99) 100%)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderBottom: 'none',
                boxShadow: '0 -16px 64px rgba(0,0,0,0.5)',
              }}
            >
              {/* Handle */}
              <div className="flex items-center justify-between px-5 pt-3 pb-1 flex-shrink-0">
                <div className="w-10 h-1 rounded-full bg-white/15 mx-auto" />
                <button onClick={() => setShowMore(false)}
                  className="absolute right-4 top-3 w-9 h-9 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-white/8 transition-all">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="overflow-y-auto flex-1 px-4 pb-6">
                {/* User card */}
                {user && (
                  <div className="mb-5 mt-2">
                    <Link to="/profile" onClick={() => setShowMore(false)}
                      className="flex items-center gap-3 p-3.5 rounded-2xl border border-white/8 hover:bg-white/5 transition-colors"
                      style={{ background: 'rgba(255,255,255,0.04)' }}
                    >
                      <div className="w-11 h-11 rounded-xl overflow-hidden border border-primary/25 flex-shrink-0"
                        style={{ background: 'hsl(var(--primary)/0.15)' }}
                      >
                        {user.avatar_url
                          ? <img src={user.avatar_url} className="w-full h-full object-cover" alt="" />
                          : <div className="w-full h-full flex items-center justify-center">
                              <span className="font-grotesk font-bold text-primary">{(user.display_name || user.full_name || 'U')[0].toUpperCase()}</span>
                            </div>
                        }
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-grotesk font-bold text-sm truncate">{user.display_name || user.full_name}</p>
                        {user.username && <p className="font-mono text-xs text-muted-foreground">@{user.username}</p>}
                      </div>
                      <Settings className="w-4 h-4 text-muted-foreground/40" />
                    </Link>
                  </div>
                )}

                {!user && (
                  <div className="mb-5 mt-2 flex gap-2">
                    <button onClick={() => { base44.auth.redirectToLogin(); setShowMore(false); }}
                      className="flex-1 py-3 rounded-2xl font-grotesk font-semibold text-sm text-primary-foreground transition-all"
                      style={{ background: 'linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--accent)) 100%)', boxShadow: '0 0 20px hsl(var(--primary)/0.3)' }}>
                      Se connecter
                    </button>
                    <Link to="/register" onClick={() => setShowMore(false)}
                      className="flex-1 py-3 rounded-2xl font-inter text-sm text-center text-muted-foreground border border-white/10 hover:bg-white/5 transition-all">
                      S'inscrire
                    </Link>
                  </div>
                )}

                {/* Quick actions */}
                {user && (
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    {[
                      { to: '/profile', icon: User, label: 'Profil', color: 'text-primary' },
                      ...((hasAdminAccess(user) || user?.role === 'event_manager') ? [{ to: '/admin', icon: LayoutDashboard, label: 'Admin', color: 'text-purple-400' }] : []),
                    ].map(item => {
                      const Icon = item.icon;
                      return (
                        <Link key={item.to} to={item.to} onClick={() => setShowMore(false)}
                          className="relative flex flex-col items-center gap-2 p-3.5 rounded-2xl border border-white/8 hover:bg-white/6 transition-all"
                          style={{ background: 'rgba(255,255,255,0.035)' }}
                        >
                          <Icon className={`w-5 h-5 ${item.color}`} />
                          {item.badge > 0 && (
                            <span className="absolute top-2 right-2 w-4 h-4 rounded-full bg-primary text-primary-foreground text-[9px] font-bold flex items-center justify-center">
                              {item.badge > 9 ? '9+' : item.badge}
                            </span>
                          )}
                          <span className="font-inter text-[11px] text-muted-foreground text-center">{item.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                )}

                {/* All links — sections thématiques */}
                {NAV_SECTIONS.map((section) => (
                  <div key={section.title} className="mb-5">
                    <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground/45 mb-2 px-1">{section.title}</p>
                    <div className="grid grid-cols-3 gap-2">
                      {section.items.map((item) => {
                        const Icon = item.icon;
                        const cls = `relative flex flex-col items-center gap-2 p-3 rounded-2xl transition-all border ${
                          isActive(item.to) ? 'border-primary/30 bg-primary/10' : 'border-white/6 bg-white/3 hover:bg-white/6'
                        }`;
                        const inner = (
                          <>
                            <Icon className={item.color} style={{ width: 18, height: 18 }} />
                            {item.cartBadge && cartCount > 0 && (
                              <span className="absolute top-1.5 right-2 w-4 h-4 rounded-full bg-primary text-primary-foreground text-[9px] font-mono flex items-center justify-center">{cartCount > 9 ? '9+' : cartCount}</span>
                            )}
                            <span className="font-inter text-[10px] text-muted-foreground text-center leading-tight">{item.label}</span>
                          </>
                        );
                        if (item.href) {
                          return (
                            <a key={item.href} href={item.href} target="_blank" rel="noopener noreferrer" onClick={() => setShowMore(false)} className={cls}>
                              {inner}
                            </a>
                          );
                        }
                        return (
                          <Link key={item.to} to={item.to} onClick={() => setShowMore(false)} className={cls}>
                            {inner}
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                ))}

                {user && (
                  <button onClick={() => { base44.auth.logout('/'); setShowMore(false); }}
                    className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl border border-rose-400/20 text-rose-400 hover:bg-rose-400/10 transition-all font-inter text-sm font-medium">
                    <LogOut className="w-4 h-4" /> Déconnexion
                  </button>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Tab bar */}
      <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-white/8 pb-[env(safe-area-inset-bottom)] shadow-[0_-12px_36px_rgba(0,0,0,0.28)]"
        style={{ background: 'rgba(4,10,20,0.96)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)' }}
      >
        <div className="flex items-center px-1 h-16 gap-0.5">
          {/* Create post button — centered, visible only when logged in */}
          {user && (
            <button
              onClick={() => { setShowMore(false); navigate('/create-post'); }}
              className="flex flex-col items-center gap-1 flex-1 py-2"
            >
              <div className="w-9 h-9 flex items-center justify-center rounded-2xl bg-primary active:scale-90" style={{ transition: 'transform 0.1s ease' }}>
                <Plus className="w-5 h-5 text-primary-foreground" strokeWidth={2.5} />
              </div>
              <span className="font-inter text-[10px] text-muted-foreground">Publier</span>
            </button>
          )}
          {MAIN_TABS.map((tab, tabIndex) => {
            const Icon = tab.icon;
            const active = tab.isMore ? showMore : isActive(tab.to);

            if (tab.isMore) {
              return (
                <button key="more" onClick={() => setShowMore(v => !v)}
                  className="native-press flex flex-col items-center gap-1 flex-1 py-2 rounded-2xl transition-all"
                >
                  <div className={`w-8 h-8 flex items-center justify-center rounded-xl transition-colors duration-150 ${active ? 'bg-primary/20' : ''}`}>
                      {active ? <X className={`w-5 h-5 text-primary`} /> : <Icon className={`w-5 h-5 text-muted-foreground`} />}
                    </div>
                    <span className={`font-inter text-[10px] ${active ? 'text-primary font-semibold' : 'text-muted-foreground'}`}>
                      {active ? 'Fermer' : tab.label}
                    </span>
                </button>
              );
            }

            return (
              <Link key={tab.to} to={tab.to}
                state={{ transitionDirection: tabIndex > activeTabIndex ? 1 : -1 }}
                onClick={() => setShowMore(false)}
                className="native-press flex flex-col items-center gap-1 flex-1 py-2 rounded-2xl relative active:opacity-60 transition-opacity duration-100"
              >

                <div className={`w-8 h-8 flex items-center justify-center rounded-xl transition-colors duration-150 ${active ? 'bg-primary/20' : ''}`}>
                  <Icon className={`w-5 h-5 ${active ? 'text-primary' : 'text-muted-foreground'}`} />
                </div>
                {active && (
                  <div className="absolute -bottom-0.5 w-4 h-0.5 rounded-full bg-primary" />
                )}
                <span className={`font-inter text-[10px] ${active ? 'text-primary font-semibold' : 'text-muted-foreground'}`}>
                  {tab.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
      <div className="h-[calc(4rem+env(safe-area-inset-bottom))]" />
    </>
  );
}