import React, { useEffect, useState } from 'react';
import { Outlet, useNavigate, Link, useLocation } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { BarChart3, FileText, Calendar, Users, MessageSquare, Image, BookOpen, Plane, Flag, MessageCircle, Shield, Megaphone, LayoutDashboard, BadgeCheck, Mail, Award, Heart, ArrowLeft, Crown, Building2, Settings } from 'lucide-react';
import { ROLE_CONFIG, hasAdminAccess, canManageSupreme, PDG_ADJOINT_EMAILS } from '@/lib/roles';

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
  { path: '/admin/blog', icon: BookOpen, label: 'Blog' },
  { path: '/admin/messaging', icon: MessageSquare, label: 'Messagerie' },
  { path: '/admin/maintenance', icon: Shield, label: 'Maintenance' },
  { path: '/admin/emailing', icon: Mail, label: 'Emailing' },
  { path: '/admin/status', icon: Settings, label: 'Statut Site' },
  { path: '/admin/governance', icon: Building2, label: 'Gouvernance', topOnly: true },
];

export default function AdminLayout() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const isTopMgmt = user?.role === 'owner' || user?.role === 'pdg_adjoint' || PDG_ADJOINT_EMAILS.includes(user?.email);
  const roleCfg = ROLE_CONFIG[user?.role] || ROLE_CONFIG.admin;

  const visibleNav = NAV.filter(item => !item.topOnly || isTopMgmt);

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-screen w-14 lg:w-56 bg-sidebar border-r border-sidebar-border z-40 flex flex-col py-4">
        <div className="px-3 mb-6 hidden lg:block">
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

        <Link to="/" className="lg:hidden flex items-center justify-center px-3 py-2.5 mx-2 mb-2 rounded-lg text-sidebar-foreground hover:text-foreground bg-sidebar-accent hover:bg-primary/20 transition-colors group">
          <Plane className="w-5 h-5 text-primary" />
        </Link>

        <nav className="flex-1 px-2 space-y-0.5 overflow-y-auto">
          {visibleNav.map(item => {
            const active = location.pathname === item.path || (item.path !== '/admin' && location.pathname.startsWith(item.path));
            const Icon = item.icon;
            return (
              <Link key={item.path} to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                  active ? 'bg-primary/10 text-primary' : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                }`}>
                <Icon className={`w-4 h-4 flex-shrink-0 ${active ? 'text-primary' : ''}`} />
                <span className="hidden lg:inline font-inter text-xs">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User info */}
        <div className="px-3 pt-4 border-t border-sidebar-border">
          <div className="hidden lg:flex items-center gap-2">
            <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden"
              style={isTopMgmt ? { background: 'linear-gradient(135deg,#92400e,#d97706)', border: '1px solid #d97706' } : { background: 'hsl(var(--primary)/0.2)' }}>
              {user?.avatar_url
                ? <img src={user.avatar_url} className="w-full h-full object-cover" alt="" />
                : <span className="font-grotesk font-bold text-xs" style={isTopMgmt ? { color: '#fde68a' } : { color: 'hsl(var(--primary))' }}>{user?.full_name?.[0]}</span>
              }
            </div>
            <div className="min-w-0">
              <p className="font-inter text-xs truncate">{user?.full_name}</p>
              <p className="font-mono text-[10px] flex items-center gap-1" style={{ color: roleCfg.color.replace('text-', '') }}>
                <span>{roleCfg.emoji}</span>
                <span className="truncate">{roleCfg.label}</span>
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 ml-14 lg:ml-56 min-h-screen overflow-x-hidden">
        {/* Top banner pour PDG-Adjoint */}
        {isTopMgmt && user?.role !== 'owner' && (
          <div className="sticky top-0 z-30 px-4 py-1.5 text-center font-mono text-[10px] font-semibold" style={{ background: 'linear-gradient(90deg,#92400e,#d97706,#92400e)', color: '#fde68a', letterSpacing: '0.1em' }}>
            🥈 SESSION PDG-ADJOINT — Accès complet direction activé
          </div>
        )}
        {isTopMgmt && user?.role === 'owner' && (
          <div className="sticky top-0 z-30 px-4 py-1.5 text-center font-mono text-[10px] font-semibold" style={{ background: 'linear-gradient(90deg,#78350f,#f59e0b,#78350f)', color: '#fde68a', letterSpacing: '0.1em' }}>
            👑 SESSION PDG — Contrôle total plateforme
          </div>
        )}
        <div className="p-3 sm:p-5 lg:p-8 max-w-full">
          <Outlet context={{ user }} />
        </div>
      </main>
    </div>
  );
}