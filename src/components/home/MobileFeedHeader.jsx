import { Bell } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function MobileFeedHeader({ user }) {
  const name = user?.display_name || user?.full_name || 'EZA';

  return (
    <header className="md:hidden sticky top-0 z-20 flex h-14 items-center justify-between border-b border-border/60 bg-background/95 px-4 backdrop-blur-xl">
      <Link to={user ? '/profile' : '/'} aria-label="Profil" className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-border/70 bg-secondary active:scale-95">
        {user?.avatar_url ? (
          <img src={user.avatar_url} alt={name} className="h-full w-full object-cover" />
        ) : (
          <span className="font-grotesk text-sm font-bold text-primary">{name.charAt(0).toUpperCase()}</span>
        )}
      </Link>
      <Link to="/" aria-label="Accueil" className="flex h-10 items-center justify-center active:scale-95">
        <img src="https://media.base44.com/images/public/69c5c081406b9e20deaed582/80278201e_1782606023373-Photoroom.png" alt="EZA" className="h-8 w-8 object-contain" />
      </Link>
      <Link to="/notifications" aria-label="Notifications" className="flex h-10 w-10 items-center justify-center rounded-full text-foreground active:scale-95">
        <Bell className="h-5 w-5" strokeWidth={2} />
      </Link>
    </header>
  );
}