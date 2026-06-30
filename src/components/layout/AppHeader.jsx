import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, Bell } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

// Titres par route
const ROUTE_TITLES = {
  '/': null, // logo centré sur l'accueil
  '/discover': 'Explorer',
  '/messages': 'Messages',
  '/forum': 'Forum',
  '/planning': 'Événements',
  '/profile': 'Profil',
  '/dashboard': 'Tableau de bord',
  '/espace-client': 'Espace client',
  '/parrainage': 'Parrainage',
  '/partenaires': 'Partenaires',
  '/blog': 'Blog',
  '/about': 'À propos',
  '/contact': 'Contact',
  '/business': 'Business',
};

export default function AppHeader() {
  const location = useLocation();

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
    staleTime: 30000,
  });

  const unreadCount = notifs.length;

  // Trouve le titre de la route courante
  const routeTitle = Object.entries(ROUTE_TITLES).find(([path]) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path)
  )?.[1];

  const isHome = location.pathname === '/';
  const avatarInitial = (user?.display_name || user?.full_name || 'U')[0].toUpperCase();

  return (
    <header className="sticky top-0 left-0 right-0 z-20 border-b border-white/8"
      style={{ background: 'rgba(4,10,20,0.92)', backdropFilter: 'blur(20px)' }}>
      <div className="flex items-center justify-between px-4 h-14 gap-3">

        {/* Gauche : avatar utilisateur ou back */}
        <div className="flex-shrink-0">
          {user ? (
            <Link to="/profile">
              <div className="w-9 h-9 rounded-full overflow-hidden border border-white/15 flex items-center justify-center"
                style={{ background: 'hsl(var(--primary)/0.15)' }}>
                {user.avatar_url
                  ? <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
                  : <span className="font-grotesk font-bold text-primary text-sm">{avatarInitial}</span>
                }
              </div>
            </Link>
          ) : (
            <Link to="/login">
              <div className="w-9 h-9 rounded-full border border-white/15 flex items-center justify-center"
                style={{ background: 'hsl(var(--primary)/0.10)' }}>
                <span className="font-grotesk font-bold text-primary text-sm">?</span>
              </div>
            </Link>
          )}
        </div>

        {/* Centre : logo sur l'accueil, titre sinon */}
        <div className="flex-1 flex items-center justify-center">
          {isHome || !routeTitle ? (
            <Link to="/" className="flex items-center gap-2">
              <img
                src="https://media.base44.com/images/public/69c5c081406b9e20deaed582/80278201e_1782606023373-Photoroom.png"
                alt="Logo"
                className="h-8 w-8 object-contain"
              />
            </Link>
          ) : (
            <h1 className="font-grotesk font-bold text-base text-foreground">{routeTitle}</h1>
          )}
        </div>

        {/* Droite : icônes actions */}
        <div className="flex-shrink-0 flex items-center justify-end gap-0.5">
          <Link to="/discover" className="relative p-2 rounded-full hover:bg-white/8 transition-colors">
            <Search className="w-5 h-5 text-muted-foreground" />
          </Link>
          <Link to="/dashboard?tab=notifications" className="relative p-2 rounded-full hover:bg-white/8 transition-colors">
            <Bell className="w-5 h-5 text-muted-foreground" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-primary text-primary-foreground text-[9px] font-bold flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </Link>
        </div>

      </div>
    </header>
  );
}