import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, Link, useLocation } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import {
  BarChart3, FileText, Calendar, Users, MessageSquare, Image, BookOpen, Plane,
  Flag, MessageCircle, Shield, Megaphone, LayoutDashboard, BadgeCheck, Mail,
  Award, Heart, Crown, Settings, Briefcase, MoreHorizontal, X, ChevronRight, Map,
  FolderOpen, Building2, Gift, Trash2
} from 'lucide-react';
import { ROLE_CONFIG, hasAdminAccess, PDG_ADJOINT_EMAILS, PDG_EMAILS } from '@/lib/roles';

const NAV = [
  { path: '/admin', icon: BarChart3, label: 'Dashboard' },
  { path: '/admin/quotes', icon: FileText, label: 'Devis' },
  { path: '/admin/appointments', icon: Calendar, label: 'Planning' },
  { path: '/admin/users', icon: Users, label: 'Comptes' },
  { path: '/admin/badges', icon: BadgeCheck, label: 'Badges' },
  { path: '/admin/certifications', icon: Award, label: 'Certifications' },
  { path: '/admin/donations', icon: Heart, label: 'Donations' },
  { path: '/admin/reports', icon: Flag, label: 'Signalements' },
  { path: '/admin/conversations', icon: MessageCircle, label: 'Conversations' },
  { path: '/admin/announcements', icon: Megaphone, label: 'Annonces' },
  { path: '/admin/pages', icon: LayoutDashboard, label: 'Pages' },
  { path: '/admin/portfolio', icon: Image, label: 'Portfolio' },
  { path: '/admin/map', icon: Map, label: 'Carte Interactive' },
  { path: '/admin/client-files', icon: FolderOpen, label: 'Fichiers Clients' },
  { path: '/admin/partners', icon: Building2, label: 'Partenaires' },
  { path: '/admin/blog', icon: BookOpen, label: 'Blog' },
  { path: '/admin/messaging', icon: MessageSquare, label: 'Messagerie' },
  { path: '/admin/maintenance', icon: Shield, label: 'Maintenance' },
  { path: '/admin/emailing', icon: Mail, label: 'Emailing' },
  { path: '/admin/status', icon: Settings, label: 'Statut Site' },
  { path: '/admin/governance', icon: Crown, label: 'Gouvernance', topOnly: true },
  { path: '/admin/employees', icon: Briefcase, label: 'Équipe', topOnly: true },
  { path: '/admin/site-config', icon: Settings, label: 'Gestion du Site' },
  { path: '/admin/data-manager', icon: Trash2, label: 'Historique & Données' },
  { path: '/admin/pdg', icon: Crown, label: 'Espace PDG', topOnly: true },
];

// Items shown in bottom nav (most used)
const BOTTOM_NAV_PATHS = ['/admin', '/admin/quotes', '/admin/users', '/admin/conversations'];

export default function AdminLayout() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    (async () => {
      const auth = await base44.auth.isAuthenticated();
      if (!auth) { base44.auth.redirectToLogin('/admin'); return; }
      const me = await base44.auth.me();
      if (!hasAdminAccess(me)) { navigate('/'); return; }
      setUser(me);
      setLoading(false);
    })();
  }, [navigate]);

  // Close mobile menu on route change
  useEffect(() => { setMobileMenuOpen(false); }, [location.pathname]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const isTopMgmt = user?.role === 'owner' || user?.role === 'pdg_adjoint' ||
    PDG_ADJOINT_EMAILS.includes(user?.email) || PDG_EMAILS.includes(user?.email);
  const roleCfg = ROLE_CONFIG[user?.role] || ROLE_CONFIG.admin;
  const visibleNav = NAV.filter(item => !item.topOnly || isTopMgmt);
  const bottomNavItems = visibleNav.filter(i => BOTTOM_NAV_PATHS.includes(i.path));
  const isActive = (path) => location.pathname === path || (path !== '/admin' && location.pathname.startsWith(path));

  return (
    <div className="flex min-h-screen bg-background">

      {/* ── DESKTOP SIDEBAR (lg+) ── */}
      <aside className="hidden lg:flex fixed left-0 top-0 h-screen w-56 bg-sidebar border-r border-sidebar-border z-40 flex-col py-4">
        <div className="px-3 mb-6">
          <Link to="/" className="flex items-center gap-2 text-sidebar-foreground hover:text-foreground transition-colors group">
            <div className="w-6 h-6 rounded bg-primary/10 group-hover:bg-primary/20 flex items-center justify-center transition-colors">
              <Plane className="w-3.5 h-3.5 text-primary" />
            </div>
            <div className="min-w-0">
              <p className="font-grotesk font-bold text-xs">Brenne <span className="text-primary">Aerial</span></p>
              <p className="font-mono text-[10px] text-muted-foreground">Administration</p>
            </div>
          </Link>
        </div>

        <nav className="flex-1 px-2 space-y-0.5 overflow-y-auto">
          {visibleNav.map(item => {
            const active = isActive(item.path);
            const Icon = item.icon;
            return (
              <Link key={item.path} to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                  active ? 'bg-primary/10 text-primary' : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                }`}>
                <Icon className={`w-4 h-4 flex-shrink-0 ${active ? 'text-primary' : ''}`} />
                <span className="font-inter text-xs">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="px-3 pt-4 border-t border-sidebar-border">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden"
              style={isTopMgmt ? { background: 'linear-gradient(135deg,#92400e,#d97706)', border: '1px solid #d97706' } : { background: 'hsl(var(--primary)/0.2)' }}>
              {user?.avatar_url
                ? <img src={user.avatar_url} className="w-full h-full object-cover" alt="" />
                : <span className="font-grotesk font-bold text-xs" style={{ color: isTopMgmt ? '#fde68a' : 'hsl(var(--primary))' }}>{user?.full_name?.[0]}</span>
              }
            </div>
            <div className="min-w-0">
              <p className="font-inter text-xs truncate">{user?.full_name}</p>
              <p className="font-mono text-[10px] truncate" style={{ color: roleCfg.color?.replace('text-', '') }}>
                {roleCfg.emoji} {roleCfg.label}
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* ── MAIN CONTENT ── */}
      <main className="flex-1 lg:ml-56 min-h-screen overflow-x-hidden pb-24 lg:pb-0">
        {/* PDG banners */}
        {isTopMgmt && !PDG_EMAILS.includes(user?.email) && user?.role !== 'owner' && (
          <div className="sticky top-0 z-30 px-4 py-1.5 text-center font-mono text-[10px] font-semibold"
            style={{ background: 'linear-gradient(90deg,#92400e,#d97706,#92400e)', color: '#fde68a', letterSpacing: '0.1em' }}>
            🥈 SESSION PDG-ADJOINT — Accès complet direction activé
          </div>
        )}
        {isTopMgmt && (user?.role === 'owner' || PDG_EMAILS.includes(user?.email)) && (
          <div className="sticky top-0 z-30 px-4 py-1.5 text-center font-mono text-[10px] font-semibold"
            style={{ background: 'linear-gradient(90deg,#78350f,#f59e0b,#78350f)', color: '#fde68a', letterSpacing: '0.1em' }}>
            👑 SESSION PDG — Contrôle total plateforme
          </div>
        )}
        <div className="p-3 sm:p-5 lg:p-8 max-w-full">
          <Outlet context={{ user }} />
        </div>
      </main>

      {/* ── MOBILE BOTTOM NAV ── */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-sidebar border-t border-sidebar-border flex items-stretch h-16" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
        {bottomNavItems.map(item => {
          const active = isActive(item.path);
          const Icon = item.icon;
          return (
            <Link key={item.path} to={item.path}
              className={`flex-1 flex flex-col items-center justify-center gap-0.5 transition-all relative ${
                active ? 'text-primary' : 'text-muted-foreground'
              }`}>
              <Icon className="w-5 h-5" />
              <span className="font-inter text-[9px]">{item.label}</span>
              {active && <span className="absolute bottom-0 w-8 h-0.5 bg-primary rounded-t-full" />}
            </Link>
          );
        })}
        {/* More button */}
        <button
          onClick={() => setMobileMenuOpen(true)}
          className={`flex-1 flex flex-col items-center justify-center gap-0.5 transition-all ${
            mobileMenuOpen ? 'text-primary' : 'text-muted-foreground'
          }`}>
          <MoreHorizontal className="w-5 h-5" />
          <span className="font-inter text-[9px]">Plus</span>
        </button>
      </nav>

      {/* ── MOBILE FULL MENU SHEET ── */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-[60] flex flex-col">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />

          {/* Sheet from bottom */}
          <div className="absolute bottom-0 left-0 right-0 bg-sidebar border-t border-sidebar-border rounded-t-2xl max-h-[85vh] flex flex-col">
            {/* Handle + header */}
            <div className="flex items-center justify-between px-4 pt-3 pb-2 border-b border-sidebar-border flex-shrink-0">
              <div className="flex items-center gap-2">
                <Plane className="w-4 h-4 text-primary" />
                <span className="font-grotesk font-bold text-sm">Navigation Admin</span>
              </div>
              <button onClick={() => setMobileMenuOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-sidebar-accent">
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>

            {/* User info */}
            <div className="px-4 py-3 border-b border-sidebar-border flex-shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden"
                  style={isTopMgmt ? { background: 'linear-gradient(135deg,#92400e,#d97706)', border: '1px solid #d97706' } : { background: 'hsl(var(--primary)/0.2)' }}>
                  {user?.avatar_url
                    ? <img src={user.avatar_url} className="w-full h-full object-cover" alt="" />
                    : <span className="font-grotesk font-bold text-sm" style={{ color: isTopMgmt ? '#fde68a' : 'hsl(var(--primary))' }}>{user?.full_name?.[0]}</span>
                  }
                </div>
                <div>
                  <p className="font-inter text-sm font-semibold">{user?.full_name}</p>
                  <p className="font-mono text-[10px] text-muted-foreground">{roleCfg.emoji} {roleCfg.label}</p>
                </div>
              </div>
            </div>

            {/* All nav items */}
            <div className="overflow-y-auto flex-1 p-3">
              <div className="grid grid-cols-2 gap-1.5">
                {visibleNav.map(item => {
                  const active = isActive(item.path);
                  const Icon = item.icon;
                  return (
                    <Link key={item.path} to={item.path}
                      className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-all ${
                        active
                          ? 'bg-primary/10 text-primary border border-primary/20'
                          : 'text-sidebar-foreground hover:bg-sidebar-accent border border-transparent'
                      }`}>
                      <Icon className={`w-4 h-4 flex-shrink-0 ${active ? 'text-primary' : 'text-muted-foreground'}`} />
                      <span className="font-inter text-xs">{item.label}</span>
                    </Link>
                  );
                })}
              </div>

              {/* Go back to site */}
              <div className="mt-3 pt-3 border-t border-sidebar-border">
                <Link to="/" className="flex items-center gap-2 px-3 py-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-sidebar-accent transition-all">
                  <Plane className="w-4 h-4 text-primary" />
                  <span className="font-inter text-xs">Retour au site</span>
                  <ChevronRight className="w-3 h-3 ml-auto" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}