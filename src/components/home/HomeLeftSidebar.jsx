import { Link, useLocation } from 'react-router-dom';
import {
  Home, Compass, MessageCircle, Bell, Bookmark, Calendar,
  Users, BarChart3, Briefcase, FileText, Award,
  Heart, Star, MoreHorizontal
} from 'lucide-react';
import VerificationIcons from '@/components/ui/VerificationIcon';
import { hasAdminAccess } from '@/lib/roles';
import { canManageAffiliations } from '@/lib/affiliationUtils';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';

const NAV = [
  { icon: Home,          label: 'Accueil',       to: '/' },
  { icon: Compass,       label: 'Explorer',       to: '/discover' },
  { icon: Bell,          label: 'Notifications',  to: '/dashboard?tab=notifications' },
  { icon: MessageCircle, label: 'Messages',       to: '/messages', badge: true },
  { icon: FileText,      label: 'Forum',          to: '/forum' },
  { icon: Calendar,      label: 'Événements',     to: '/planning' },
  { icon: Bookmark,      label: 'Enregistrés',   to: '/espace-client?tab=files' },
  { icon: Award,         label: 'Badges',         to: '/espace-client?tab=badges' },
  { icon: Users,         label: 'Affiliations',   to: '/espace-client?tab=my-affils' },
  { icon: Heart,         label: 'Parrainage',     to: '/parrainage' },
  { icon: Star,          label: 'Partenaires',    to: '/partenaires' },
  { icon: Briefcase,     label: 'Business',       to: '/business', businessOnly: true },
];

function NavItem({ icon: Icon, label, to, active, badge }) {
  return (
    <Link to={to}
      className={`group flex items-center gap-4 px-3 py-3 rounded-full transition-all duration-150 relative w-full ${
        active ? 'text-foreground font-bold' : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
      }`}
    >
      <div className="relative flex-shrink-0">
        <Icon style={{ width: 22, height: 22, strokeWidth: active ? 2.5 : 1.75 }} />
        {badge > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-primary text-primary-foreground text-[9px] font-bold flex items-center justify-center">
            {badge > 9 ? '9+' : badge}
          </span>
        )}
      </div>
      <span className="font-inter text-[17px] hidden xl:block">{label}</span>
    </Link>
  );
}

export default function HomeLeftSidebar({ user }) {
  const location = useLocation();
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
    <aside className="hidden lg:flex flex-col w-16 xl:w-64 flex-shrink-0 h-screen sticky top-0 border-r border-zinc-800/60">
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
          <div className="mb-2 flex-shrink-0">
            <Link to="/profile"
              className="flex items-center gap-3 px-3 py-3 rounded-full hover:bg-white/5 transition-all group"
            >
              <div className="w-10 h-10 rounded-full flex-shrink-0 overflow-hidden border border-border/40"
                style={{ background: 'hsl(var(--primary)/0.15)' }}
              >
                {user.avatar_url
                  ? <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
                  : <div className="w-full h-full flex items-center justify-center">
                      <span className="font-grotesk font-bold text-primary text-sm">{avatarInitial}</span>
                    </div>
                }
              </div>
              <div className="flex-1 min-w-0 hidden xl:block">
                <div className="flex items-center gap-1.5">
                  <p className="font-grotesk font-bold text-sm text-foreground truncate">{displayName}</p>
                  <VerificationIcons verifications={user.verifications} size="sm" user={user} />
                </div>
                {user.username && <p className="font-mono text-xs text-muted-foreground/60 truncate">@{user.username}</p>}
              </div>
              <MoreHorizontal className="w-4 h-4 text-muted-foreground hidden xl:block flex-shrink-0" />
            </Link>
          </div>
        )}
      </div>
    </aside>
  );
}