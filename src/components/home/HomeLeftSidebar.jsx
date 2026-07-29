import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
    Home, Compass, MessageCircle, Bell, Bookmark, Calendar,
    Users, BarChart3, Briefcase, FileText, Award, Camera,
    Heart, Star, MoreHorizontal, LogOut, Sparkles, UserCircle, List
    } from 'lucide-react';
import VerificationIcons from '@/components/ui/VerificationIcon';
import { hasAdminAccess } from '@/lib/roles';
import { canManageAffiliations } from '@/lib/affiliationUtils';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';

const NAV = [
  { icon: Home,          label: 'Accueil',       to: '/' },
  { icon: Compass,       label: 'Explorer',       to: '/discover' },
  { icon: Bell,          label: 'Notifications',  to: '/notifications' },
  { icon: UserCircle,    label: 'Mon espace',     to: '/espace' },
  { icon: MessageCircle, label: 'Messages',       to: '/messages', badge: true },
  { icon: Bookmark,      label: 'Signets',        to: '/bookmarks' },
  { icon: FileText,      label: 'Forum',          to: '/forum' },
  { icon: Users,         label: 'Communautés',    to: '/communities' },
  { icon: List,          label: 'Listes',         to: '/lists' },
  { icon: Camera,        label: 'Portfolio',      to: '/portfolio' },
  { icon: Briefcase,     label: 'Business',       to: '/business', businessOnly: true },
  { icon: Sparkles,      label: 'Premium',        to: '/premium', premium: true },
];

function NavItem({ icon: Icon, label, to, active, badge, premium }) {
  if (premium) {
    return (
      <Link to={to}
        className="group flex items-center gap-3 px-1 xl:px-2 py-1.5 rounded-2xl transition-all duration-150 relative w-full"
      >
        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all border ${
            active
              ? 'bg-cyan-400/20 border-cyan-400/40 text-cyan-300'
              : 'bg-white/5 border-white/8 text-cyan-400 group-hover:bg-cyan-400/10 group-hover:border-cyan-400/25'
          }`}
          style={{ boxShadow: active ? '0 0 12px rgba(34,211,238,0.2)' : undefined }}
        >
          <Icon style={{ width: 19, height: 19, strokeWidth: active ? 2.25 : 1.75 }} />
        </div>
        <span className="font-grotesk font-bold text-[16px] text-cyan-400 hidden xl:block">{label}</span>
      </Link>
    );
  }
  return (
    <Link to={to}
      className="group flex items-center gap-3 px-1 xl:px-2 py-1.5 rounded-2xl transition-all duration-150 relative w-full"
    >
      <div
        className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all border relative ${
          active
            ? 'bg-white/10 border-white/20 text-foreground'
            : 'bg-white/5 border-white/8 text-muted-foreground group-hover:bg-white/8 group-hover:border-white/14 group-hover:text-foreground'
        }`}
      >
        <Icon style={{ width: 19, height: 19, strokeWidth: active ? 2.25 : 1.75 }} />
        {badge > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-primary text-primary-foreground text-[9px] font-bold flex items-center justify-center">
            {badge > 9 ? '9+' : badge}
          </span>
        )}
      </div>
      <span className={`font-inter text-[16px] hidden xl:block ${active ? 'font-bold text-foreground' : 'text-muted-foreground group-hover:text-foreground'}`}>{label}</span>
    </Link>
  );
}

export default function HomeLeftSidebar({ user }) {
  const location = useLocation();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const isActive = (to) => to === '/' ? location.pathname === '/' : location.pathname.startsWith(to.split('?')[0]);

  const { data: notifs = [] } = useQuery({
    queryKey: ['unread-notifs-sidebar', user?.email],
    queryFn: () => base44.entities.Notification.filter({ user_email: user.email, is_read: false }),
    enabled: !!user?.email,
    staleTime: 30000,
  });

  const isAdmin = hasAdminAccess(user);
  const isBusiness = canManageAffiliations(user);
  const displayName = user?.display_name || user?.full_name;
  const avatarInitial = (displayName?.[0] || 'U').toUpperCase();

  return (
    <aside className="hidden md:flex flex-col w-16 xl:w-64 flex-shrink-0 h-screen sticky top-0 border-r border-zinc-800/60">
      {/* Scrollable inner — logo et nav scrollent, user reste épinglé en bas */}
      <div className="flex flex-col h-full py-2 px-2 xl:px-4 overflow-hidden">

        {/* Logo — fixe */}
        <Link to="/" className="flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-white/5 transition mb-2 flex-shrink-0">
          <img src="https://media.base44.com/images/public/69c5c081406b9e20deaed582/80278201e_1782606023373-Photoroom.png" alt="EZA" className="w-11 h-11 object-contain flex-shrink-0" />
          <div className="hidden xl:flex flex-col leading-tight gap-1">
            <span className="text-[12px] font-inter font-semibold text-muted-foreground/70 tracking-[0.25em] uppercase">by</span>
            <img src="https://media.base44.com/images/public/69c5c081406b9e20deaed582/3913412b6_1782605365815-Photoroom.png" alt="EZA GROUP" className="h-9 w-auto object-contain object-left" style={{ filter: 'brightness(1.2)' }} />
          </div>
        </Link>

        {/* Nav items — scrollable */}
        <nav className="flex-1 flex flex-col gap-0.5 mt-1 overflow-y-auto scrollbar-hide">
          {NAV.filter(item => !item.businessOnly || isBusiness).map(item => (
            <NavItem key={item.to} {...item}
              active={isActive(item.to)}
              badge={item.badge && notifs.length > 0 ? notifs.length : 0}
              premium={item.premium}
            />
          ))}

          {isAdmin && (
            <>
              <div className="my-2 h-px bg-border/40" />
              <NavItem icon={BarChart3} label="Admin" to="/admin" active={isActive('/admin')} />
            </>
          )}
        </nav>

        {/* Guest CTA — épinglé en bas */}
        {user === null && (
          <div className="mb-4 hidden xl:block flex-shrink-0">
            <Link to="/register"
              className="block w-full text-center text-sm font-inter font-bold px-4 py-3 rounded-full text-primary-foreground transition-all hover:opacity-90"
              style={{ background: 'hsl(var(--primary))' }}
            >
              Créer un compte
            </Link>
          </div>
        )}

        {/* User profile bottom — épinglé, style X */}
        {user && (
          <div className="relative mb-2 flex-shrink-0">
            <div className="flex items-center gap-1 px-3 py-3 rounded-full hover:bg-white/5 transition-all group">
              <Link to="/profile" className="flex min-w-0 flex-1 items-center gap-3">
                <div className="w-10 h-10 rounded-lg flex-shrink-0 overflow-hidden border border-border/40" style={{ background: 'hsl(var(--primary)/0.15)' }}>
                  {user.avatar_url ? <img src={user.avatar_url} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><span className="font-grotesk font-bold text-primary text-sm">{avatarInitial}</span></div>}
                </div>
                <div className="flex-1 min-w-0 hidden xl:block">
                  <div className="flex items-center gap-1.5"><p className="font-grotesk font-bold text-sm text-foreground truncate">{displayName}</p><VerificationIcons verifications={user.verifications} size="sm" user={user} /></div>
                  {user.username && <p className="font-mono text-xs text-muted-foreground/60 truncate">@{user.username}</p>}
                </div>
              </Link>
              <button type="button" onClick={() => setShowProfileMenu(value => !value)} className="hidden xl:flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground hover:bg-secondary hover:text-foreground" aria-label="Options du compte">
                <MoreHorizontal className="w-4 h-4" />
              </button>
            </div>
            {showProfileMenu && (
              <div className="absolute bottom-full right-0 z-30 mb-2 w-44 rounded-xl border border-border bg-popover p-1 shadow-xl">
                <button type="button" onClick={() => base44.auth.logout('/')} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left font-inter text-sm text-destructive hover:bg-destructive/10">
                  <LogOut className="h-4 w-4" /> Se déconnecter
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </aside>
  );
}