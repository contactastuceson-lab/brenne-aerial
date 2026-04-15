import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, Link, useLocation } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import {
  BarChart3, FileText, Calendar, Users, MessageSquare, Image, BookOpen, Plane,
  Flag, MessageCircle, Shield, Megaphone, LayoutDashboard, BadgeCheck, Mail,
  Award, Heart, Crown, Settings, Briefcase, MoreHorizontal, X, Map,
  FolderOpen, Building2, Trash2, ArrowLeft
} from 'lucide-react';
import { ROLE_CONFIG, hasAdminAccess, getUserLevel, PDG_ADJOINT_EMAILS, PDG_EMAILS } from '@/lib/roles';

// ─── Permission levels ─────────────────────────────────────────────────────
// 100 = PDG (owner) + PDG-Adjoint (pdg_adjoint)
// 80  = Conseil d'Administration
// 70  = Admin
// 60  = Directeur

// minLevel: minimum level required to see the item
const NAV_GROUPS = [
  {
    label: 'Vue générale',
    minLevel: 60,
    items: [
      { path: '/admin', icon: BarChart3, label: 'Dashboard', minLevel: 60 },
    ]
  },
  {
    label: 'Commercial',
    minLevel: 60,
    items: [
      { path: '/admin/quotes', icon: FileText, label: 'Devis', minLevel: 60 },
      { path: '/admin/appointments', icon: Calendar, label: 'Planning', minLevel: 60 },
      { path: '/admin/client-files', icon: FolderOpen, label: 'Fichiers Clients', minLevel: 60 },
    ]
  },
  {
    label: 'Communauté',
    minLevel: 60,
    items: [
      { path: '/admin/users', icon: Users, label: 'Utilisateurs', minLevel: 70 },
      { path: '/admin/badges', icon: BadgeCheck, label: 'Badges', minLevel: 70 },
      { path: '/admin/certifications', icon: Award, label: 'Certifications', minLevel: 70 },
      { path: '/admin/conversations', icon: MessageCircle, label: 'Conversations', minLevel: 70 },
      { path: '/admin/messaging', icon: MessageSquare, label: 'Messagerie', minLevel: 70 },
      { path: '/admin/reports', icon: Flag, label: 'Signalements', minLevel: 70 },
      { path: '/admin/donations', icon: Heart, label: 'Donations', minLevel: 70 },
    ]
  },
  {
    label: 'Contenu du site',
    minLevel: 60,
    items: [
      { path: '/admin/portfolio', icon: Image, label: 'Portfolio', minLevel: 60 },
      { path: '/admin/map', icon: Map, label: 'Carte Interactive', minLevel: 60 },
      { path: '/admin/blog', icon: BookOpen, label: 'Blog', minLevel: 60 },
      { path: '/admin/partners', icon: Building2, label: 'Partenaires', minLevel: 60 },
      { path: '/admin/pages', icon: LayoutDashboard, label: 'Pages', minLevel: 80 },
    ]
  },
  {
    label: 'Communication',
    minLevel: 70,
    items: [
      { path: '/admin/announcements', icon: Megaphone, label: 'Annonces', minLevel: 70 },
      { path: '/admin/emailing', icon: Mail, label: 'Emailing', minLevel: 80 },
    ]
  },
  {
    label: 'Système',
    minLevel: 80,
    items: [
      { path: '/admin/maintenance', icon: Shield, label: 'Maintenance', minLevel: 80 },
      { path: '/admin/status', icon: Settings, label: 'Statut Site', minLevel: 70 },
      { path: '/admin/site-config', icon: Settings, label: 'Config. Site', minLevel: 90 },
      { path: '/admin/data-manager', icon: Trash2, label: 'Données', minLevel: 90 },
    ]
  },
  {
    label: 'Direction',
    minLevel: 80,
    items: [
      { path: '/admin/accounts', icon: Users, label: 'Comptes & Rôles', minLevel: 80 },
      { path: '/admin/governance', icon: Crown, label: 'Gouvernance', minLevel: 80 },
      { path: '/admin/employees', icon: Briefcase, label: 'Équipe', minLevel: 80 },
      { path: '/admin/pdg', icon: Crown, label: 'Espace PDG', minLevel: 100 },
    ]
  },
];

const BOTTOM_NAV_PATHS = ['/admin', '/admin/quotes', '/admin/users', '/admin/conversations'];

// getUserLevel is now imported from lib/roles

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

  useEffect(() => { setMobileMenuOpen(false); }, [location.pathname]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const userLevel = getUserLevel(user);
  const isTopMgmt = userLevel >= 100;
  const roleCfg = ROLE_CONFIG[user?.role] || ROLE_CONFIG.admin;

  // Filter groups and items by user level
  const visibleGroups = NAV_GROUPS
    .filter(g => userLevel >= g.minLevel)
    .map(g => ({ ...g, items: g.items.filter(i => userLevel >= i.minLevel) }))
    .filter(g => g.items.length > 0);

  const visibleNav = visibleGroups.flatMap(g => g.items);
  const bottomNavItems = visibleNav.filter(i => BOTTOM_NAV_PATHS.includes(i.path));
  const isActive = (path) => location.pathname === path || (path !== '/admin' && location.pathname.startsWith(path));

  // Role session banners
  const isOwner = user?.role === 'owner' || PDG_EMAILS.includes(user?.email);
  const isPdgAdjoint = user?.role === 'pdg_adjoint' || PDG_ADJOINT_EMAILS.includes(user?.email);

  const levelBadge = isOwner
    ? { bg: 'linear-gradient(90deg,#78350f,#f59e0b,#78350f)', color: '#fde68a', text: '👑 SESSION PDG — Contrôle total plateforme' }
    : isPdgAdjoint
    ? { bg: 'linear-gradient(90deg,#78350f,#d97706,#78350f)', color: '#fde68a', text: '🥈 SESSION PDG-ADJOINT — Accès direction suprême' }
    : userLevel === 80
    ? { bg: 'linear-gradient(90deg,#3b0764,#7c3aed,#3b0764)', color: '#e9d5ff', text: "🏛️ SESSION CONSEIL D'ADMINISTRATION" }
    : userLevel === 70
    ? { bg: 'linear-gradient(90deg,#7f1d1d,#dc2626,#7f1d1d)', color: '#fecaca', text: '🛡️ SESSION ADMINISTRATEUR' }
    : userLevel === 60
    ? { bg: 'linear-gradient(90deg,#1e3a5f,#2563eb,#1e3a5f)', color: '#bfdbfe', text: '📊 SESSION DIRECTEUR' }
    : null;

  const SidebarNavGroup = ({ group }) => (
    <div className="mb-4">
      <p className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground/40 px-3 mb-1.5">
        {group.label}
      </p>
      {group.items.map(item => {
        const active = isActive(item.path);
        const Icon = item.icon;
        return (
          <Link key={item.path} to={item.path}
            className={`flex items-center gap-2.5 px-3 py-2 rounded-lg transition-all mb-0.5 ${
              active
                ? 'bg-primary/10 text-primary'
                : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
            }`}>
            <Icon className={`w-3.5 h-3.5 flex-shrink-0 ${active ? 'text-primary' : 'text-muted-foreground'}`} />
            <span className="font-inter text-xs">{item.label}</span>
            {active && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />}
          </Link>
        );
      })}
    </div>
  );

  return (
    <div className="flex min-h-screen bg-background">

      {/* ── DESKTOP SIDEBAR ── */}
      <aside className="hidden lg:flex fixed left-0 top-0 h-screen w-52 bg-sidebar border-r border-sidebar-border z-40 flex-col">

        {/* Logo */}
        <div className="px-4 py-4 border-b border-sidebar-border flex-shrink-0">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-7 h-7 rounded-lg bg-primary/15 group-hover:bg-primary/25 flex items-center justify-center transition-colors">
              <Plane className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="font-grotesk font-bold text-sm leading-tight">Brenne <span className="text-primary">Aerial</span></p>
              <p className="font-mono text-[9px] text-muted-foreground leading-tight">Admin Panel</p>
            </div>
          </Link>
        </div>

        {/* Role badge in sidebar */}
        {levelBadge && (
          <div className="mx-3 mt-3 px-2.5 py-1.5 rounded-lg text-center flex-shrink-0"
            style={{ background: levelBadge.bg.replace('linear-gradient(90deg,', 'linear-gradient(135deg,') }}>
            <p className="font-mono text-[9px] font-bold" style={{ color: levelBadge.color }}>
              {ROLE_CONFIG[user?.role]?.emoji} {ROLE_CONFIG[user?.role]?.label}
            </p>
          </div>
        )}

        {/* Nav groups */}
        <nav className="flex-1 overflow-y-auto px-2 py-3">
          {visibleGroups.map(group => (
            <SidebarNavGroup key={group.label} group={group} />
          ))}

          {/* Back to site */}
          <div className="mt-1 pt-2 border-t border-sidebar-border">
            <Link to="/" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-muted-foreground hover:bg-sidebar-accent hover:text-foreground transition-all">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="font-inter text-xs">Retour au site</span>
            </Link>
          </div>
        </nav>

        {/* User card */}
        <div className="px-3 py-3 border-t border-sidebar-border flex-shrink-0">
          <div className="flex items-center gap-2.5 p-2 rounded-lg bg-sidebar-accent/50">
            <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden"
              style={isTopMgmt ? { background: 'linear-gradient(135deg,#92400e,#d97706)', border: '1px solid #d97706' } : { background: 'hsl(var(--primary)/0.2)' }}>
              {user?.avatar_url
                ? <img src={user.avatar_url} className="w-full h-full object-cover" alt="" />
                : <span className="font-grotesk font-bold text-xs" style={{ color: isTopMgmt ? '#fde68a' : 'hsl(var(--primary))' }}>{user?.full_name?.[0]}</span>
              }
            </div>
            <div className="min-w-0">
              <p className="font-inter text-xs font-medium truncate">{user?.full_name}</p>
              <p className="font-mono text-[9px] text-muted-foreground truncate">{roleCfg.emoji} {roleCfg.label}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* ── MAIN CONTENT ── */}
      <main className="flex-1 lg:ml-52 min-h-screen overflow-x-hidden pb-24 lg:pb-0">
        {/* Role session banner */}
        {levelBadge && (
          <div className="sticky top-0 z-30 px-4 py-1.5 text-center font-mono text-[10px] font-semibold"
            style={{ background: levelBadge.bg, color: levelBadge.color, letterSpacing: '0.08em' }}>
            {levelBadge.text}
          </div>
        )}
        <div className="p-3 sm:p-5 lg:p-8 max-w-full">
          <Outlet context={{ user, userLevel }} />
        </div>
      </main>

      {/* ── MOBILE BOTTOM NAV ── */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-sidebar border-t border-sidebar-border flex items-stretch h-16"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
        {bottomNavItems.map(item => {
          const active = isActive(item.path);
          const Icon = item.icon;
          return (
            <Link key={item.path} to={item.path}
              className={`flex-1 flex flex-col items-center justify-center gap-0.5 transition-all relative ${active ? 'text-primary' : 'text-muted-foreground'}`}>
              <Icon className="w-5 h-5" />
              <span className="font-inter text-[9px]">{item.label}</span>
              {active && <span className="absolute bottom-0 w-8 h-0.5 bg-primary rounded-t-full" />}
            </Link>
          );
        })}
        <button onClick={() => setMobileMenuOpen(true)}
          className={`flex-1 flex flex-col items-center justify-center gap-0.5 transition-all ${mobileMenuOpen ? 'text-primary' : 'text-muted-foreground'}`}>
          <MoreHorizontal className="w-5 h-5" />
          <span className="font-inter text-[9px]">Plus</span>
        </button>
      </nav>

      {/* ── MOBILE MENU SHEET ── */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-[60] flex flex-col">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
          <div className="absolute bottom-0 left-0 right-0 bg-sidebar border-t border-sidebar-border rounded-t-2xl max-h-[85vh] flex flex-col">

            <div className="flex items-center justify-between px-4 pt-3 pb-2 border-b border-sidebar-border flex-shrink-0">
              <div className="flex items-center gap-2">
                <Plane className="w-4 h-4 text-primary" />
                <span className="font-grotesk font-bold text-sm">Navigation</span>
              </div>
              <button onClick={() => setMobileMenuOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-sidebar-accent">
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>

            {/* User + role */}
            <div className="px-4 py-2.5 border-b border-sidebar-border flex-shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden"
                  style={isTopMgmt ? { background: 'linear-gradient(135deg,#92400e,#d97706)' } : { background: 'hsl(var(--primary)/0.2)' }}>
                  {user?.avatar_url
                    ? <img src={user.avatar_url} className="w-full h-full object-cover" alt="" />
                    : <span className="font-grotesk font-bold text-xs" style={{ color: isTopMgmt ? '#fde68a' : 'hsl(var(--primary))' }}>{user?.full_name?.[0]}</span>
                  }
                </div>
                <div>
                  <p className="font-inter text-sm font-semibold">{user?.full_name}</p>
                  <p className="font-mono text-[10px] text-muted-foreground">{roleCfg.emoji} {roleCfg.label} — niveau {userLevel}</p>
                </div>
              </div>
            </div>

            <div className="overflow-y-auto flex-1 p-3 space-y-3">
              {visibleGroups.map(group => (
                <div key={group.label}>
                  <p className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground/40 px-2 mb-1.5">{group.label}</p>
                  <div className="grid grid-cols-2 gap-1">
                    {group.items.map(item => {
                      const active = isActive(item.path);
                      const Icon = item.icon;
                      return (
                        <Link key={item.path} to={item.path}
                          className={`flex items-center gap-2 px-3 py-2.5 rounded-xl transition-all ${
                            active
                              ? 'bg-primary/10 text-primary border border-primary/20'
                              : 'text-sidebar-foreground hover:bg-sidebar-accent border border-transparent'
                          }`}>
                          <Icon className={`w-3.5 h-3.5 flex-shrink-0 ${active ? 'text-primary' : 'text-muted-foreground'}`} />
                          <span className="font-inter text-xs truncate">{item.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}

              <div className="pt-2 border-t border-sidebar-border">
                <Link to="/" className="flex items-center gap-2 px-3 py-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-sidebar-accent transition-all">
                  <ArrowLeft className="w-4 h-4 text-primary" />
                  <span className="font-inter text-xs">Retour au site</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}