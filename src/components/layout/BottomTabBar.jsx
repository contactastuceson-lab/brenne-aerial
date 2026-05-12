import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, FileText, Compass, MessageCircle, MoreHorizontal, X, Bell, User, LogOut, LayoutDashboard, FolderOpen, Warehouse, Building2, Users, Shield, Building, ZoomIn, ArrowLeftRight, Calculator, Phone, Camera, BookOpen, MessageSquare, Scale, Lock, Heart, Zap } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { hasAdminAccess } from '@/lib/roles';
import { motion, AnimatePresence } from 'framer-motion';

const MAIN_TABS = [
  { to: '/',          icon: Home,          label: 'Accueil' },
  { to: '/quote',     icon: FileText,       label: 'Devis' },
  { to: '/discover',  icon: Compass,        label: 'Explorer' },
  { to: '/messages',  icon: MessageCircle,  label: 'Messages' },
  { to: '/forum',     icon: MessageSquare,  label: 'Forum' },
  { to: null,         icon: MoreHorizontal, label: 'Plus',   isMore: true },
];

const MORE_ITEMS = [
  { to: '/dashboard',        icon: Bell,          label: 'Tableau de bord',        color: 'text-primary' },
  { to: '/profile',          icon: User,          label: 'Mon profil',             color: 'text-accent' },
  { to: '/portfolio',        icon: Camera,        label: 'Portfolio',              color: 'text-purple-400' },
  { to: '/planning',         icon: BookOpen,      label: 'Planning',               color: 'text-green-400' },
  { to: '/calculateur',      icon: Calculator,    label: 'Calculateur de prix',    color: 'text-yellow-400' },
  { to: '/contact',          icon: Phone,         label: 'Contact',                color: 'text-cyan-400' },
  { to: '/espace-client',    icon: FolderOpen,    label: 'Espace Client',          color: 'text-orange-400' },
  { to: '/garage',           icon: Warehouse,     label: 'Garage Drones',          color: 'text-blue-400' },
  { to: '/partenaires',      icon: Building2,     label: 'Partenaires',            color: 'text-pink-400' },
  { to: '/parrainage',       icon: Users,         label: 'Parrainage',             color: 'text-teal-400' },
  { to: '/avant-apres',      icon: ArrowLeftRight,label: 'Avant / Après',          color: 'text-indigo-400' },
  { to: '/reglementation',   icon: Shield,        label: 'Réglementation',         color: 'text-red-400' },
  { to: '/simulateur-vue',   icon: Building,      label: 'Simulateur de vue',      color: 'text-violet-400' },
  { to: '/comparateur',      icon: ZoomIn,        label: 'Comparateur résolution', color: 'text-amber-400' },
  { to: '/donation',         icon: Heart,         label: 'Donation',               color: 'text-red-400' },
  { to: '/toiture-checkup',  icon: Zap,           label: 'Inspection Toiture',     color: 'text-yellow-400' },
  { to: '/flash-delivery',   icon: Zap,           label: 'Flash Delivery',         color: 'text-blue-400' },
  { to: '/legal/privacy',    icon: Lock,          label: 'Confidentialité',        color: 'text-slate-400' },
  { to: '/legal/terms',      icon: Scale,         label: 'Conditions',             color: 'text-slate-400' },
];

export default function BottomTabBar() {
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [showMore, setShowMore] = useState(false);

  useEffect(() => {
    base44.auth.isAuthenticated().then(auth => {
      if (auth) base44.auth.me().then(setUser);
    });
  }, []);

  const { data: notifs = [] } = useQuery({
    queryKey: ['bottom-notifs', user?.email],
    queryFn: () => base44.entities.Notification.filter({ user_email: user.email, is_read: false }),
    enabled: !!user?.email,
    refetchInterval: 15000,
  });

  const isActive = (path) => {
    if (!path) return false;
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const unreadCount = notifs.length;

  return (
    <>
      {/* More panel overlay */}
      <AnimatePresence>
        {showMore && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
              onClick={() => setShowMore(false)}
            />
            <motion.div
              initial={{ y: '100%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed bottom-20 left-0 right-0 z-50 mx-3 rounded-2xl border border-border bg-card/95 backdrop-blur-xl shadow-2xl overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                <div>
                  <p className="font-grotesk font-bold text-base">Menu</p>
                  {user && <p className="font-inter text-xs text-muted-foreground">{user.full_name}</p>}
                </div>
                <button onClick={() => setShowMore(false)} className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>

              {/* User quick actions */}
              {user && (
                <div className="flex gap-2 px-4 py-3 border-b border-border">
                  <Link to="/profile" onClick={() => setShowMore(false)}
                    className="flex-1 flex flex-col items-center gap-1.5 py-3 rounded-xl bg-primary/10 border border-primary/20">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden">
                      {user.avatar_url
                        ? <img src={user.avatar_url} className="w-full h-full object-cover" alt="" />
                        : <User className="w-4 h-4 text-primary" />}
                    </div>
                    <span className="font-inter text-[11px] text-primary font-medium">Profil</span>
                  </Link>
                  <Link to="/dashboard" onClick={() => setShowMore(false)}
                    className="flex-1 flex flex-col items-center gap-1.5 py-3 rounded-xl bg-secondary border border-border relative">
                    <Bell className="w-5 h-5 text-muted-foreground" />
                    {unreadCount > 0 && (
                      <span className="absolute top-2 right-4 w-4 h-4 rounded-full bg-primary text-primary-foreground text-[10px] font-mono flex items-center justify-center">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                    <span className="font-inter text-[11px] text-muted-foreground">Notifs</span>
                  </Link>
                  {hasAdminAccess(user) && (
                    <Link to="/admin" onClick={() => setShowMore(false)}
                      className="flex-1 flex flex-col items-center gap-1.5 py-3 rounded-xl bg-secondary border border-border">
                      <LayoutDashboard className="w-5 h-5 text-primary" />
                      <span className="font-inter text-[11px] text-muted-foreground">Admin</span>
                    </Link>
                  )}
                  <button onClick={() => { base44.auth.logout('/'); setShowMore(false); }}
                    className="flex-1 flex flex-col items-center gap-1.5 py-3 rounded-xl bg-secondary border border-border">
                    <LogOut className="w-5 h-5 text-muted-foreground" />
                    <span className="font-inter text-[11px] text-muted-foreground">Quitter</span>
                  </button>
                </div>
              )}

              {!user && (
                <div className="flex gap-2 px-4 py-3 border-b border-border">
                  <button onClick={() => { base44.auth.redirectToLogin(); setShowMore(false); }}
                    className="flex-1 py-3 rounded-xl bg-primary text-primary-foreground font-grotesk font-semibold text-sm">
                    Connexion
                  </button>
                  <Link to="/quote" onClick={() => setShowMore(false)}
                    className="flex-1 py-3 rounded-xl bg-secondary border border-border font-inter text-sm text-center text-foreground">
                    Devis gratuit
                  </Link>
                </div>
              )}

              {/* Grid of more links */}
              <div className="grid grid-cols-4 gap-1 p-3 max-h-[40vh] overflow-y-auto">
                {MORE_ITEMS.filter(item => {
                  // Hide profile/dashboard here since they're in quick actions
                  if (!user && (item.to === '/dashboard' || item.to === '/profile')) return false;
                  return true;
                }).map(item => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.to}
                      to={item.to}
                      onClick={() => setShowMore(false)}
                      className={`flex flex-col items-center gap-1.5 p-3 rounded-xl transition-all ${
                        isActive(item.to) ? 'bg-primary/10 border border-primary/20' : 'bg-secondary/50 hover:bg-secondary border border-transparent'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-xl bg-background flex items-center justify-center ${item.color}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="font-inter text-[10px] text-muted-foreground text-center leading-tight">{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Bottom Tab Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-30 glass border-t border-border/60 pb-safe">
        <div className="flex items-center justify-around px-2 h-16">
          {MAIN_TABS.map((tab) => {
            const Icon = tab.icon;
            const active = tab.isMore ? showMore : isActive(tab.to);

            if (tab.isMore) {
              return (
                <button
                  key="more"
                  onClick={() => setShowMore(v => !v)}
                  className="flex flex-col items-center gap-1 px-4 py-2 rounded-2xl transition-all"
                >
                  <div className={`w-7 h-7 flex items-center justify-center rounded-xl transition-all ${
                    active ? 'bg-primary/20' : ''
                  }`}>
                    <Icon className={`w-5 h-5 transition-colors ${active ? 'text-primary' : 'text-muted-foreground'}`} />
                  </div>
                  <span className={`font-inter text-[10px] transition-colors ${active ? 'text-primary font-semibold' : 'text-muted-foreground'}`}>
                    {tab.label}
                  </span>
                </button>
              );
            }

            return (
              <Link
                key={tab.to}
                to={tab.to}
                onClick={() => setShowMore(false)}
                className="flex flex-col items-center gap-1 px-4 py-2 rounded-2xl transition-all relative"
              >
                {/* Notification badge on Messages */}
                {tab.to === '/messages' && unreadCount > 0 && user && (
                  <span className="absolute top-1 right-2 w-4 h-4 rounded-full bg-primary text-primary-foreground text-[9px] font-mono flex items-center justify-center z-10">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
                <div className={`w-7 h-7 flex items-center justify-center rounded-xl transition-all ${
                  active ? 'bg-primary/20' : ''
                }`}>
                  <Icon className={`w-5 h-5 transition-colors ${active ? 'text-primary' : 'text-muted-foreground'}`} />
                </div>
                {active && (
                  <motion.div
                    layoutId="activeTabIndicator"
                    className="absolute -bottom-0.5 w-1 h-1 rounded-full bg-primary"
                  />
                )}
                <span className={`font-inter text-[10px] transition-colors ${active ? 'text-primary font-semibold' : 'text-muted-foreground'}`}>
                  {tab.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Spacer to push content above the tab bar */}
      <div className="h-16" />
    </>
  );
}