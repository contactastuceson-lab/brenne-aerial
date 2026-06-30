import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Home, Compass, MessageCircle, Users, Bookmark, Building2,
  Calendar, Settings, FileText, ChevronRight, BarChart3,
  Star, Shield, UserCheck, Briefcase, Flame
} from 'lucide-react';
import VerificationIcons from '@/components/ui/VerificationIcon';
import { hasAdminAccess } from '@/lib/roles';
import { canManageAffiliations } from '@/lib/affiliationUtils';

const NAV_SECTIONS = [
  {
    title: null,
    items: [
      { icon: Home,          label: 'Accueil',         to: '/' },
      { icon: Compass,       label: 'Explorer',         to: '/discover' },
      { icon: MessageCircle, label: 'Messages',         to: '/messages' },
      { icon: FileText,      label: 'Forum',            to: '/forum' },
      { icon: Calendar,      label: 'Planning',         to: '/planning' },
    ]
  },
  {
    title: 'Mes espaces',
    items: [
      { icon: Bookmark,   label: 'Enregistrements', to: '/espace-client?tab=files' },
      { icon: UserCheck,  label: 'Espace Client',   to: '/espace-client' },
      { icon: Star,       label: 'Badges',          to: '/espace-client?tab=badges' },
      { icon: Users,      label: 'Affiliations',    to: '/espace-client?tab=my-affils' },
    ]
  },
  {
    title: 'Communauté',
    items: [
      { icon: Building2,  label: 'Partenaires',    to: '/partenaires' },
      { icon: Flame,      label: 'Parrainage',     to: '/parrainage' },
    ]
  },
];

function NavItem({ icon: Icon, label, to, active }) {
  return (
    <Link
      to={to}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-inter transition-all group ${
        active
          ? 'bg-primary/12 text-primary font-semibold'
          : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
      }`}
    >
      <Icon className={`w-4 h-4 flex-shrink-0 ${active ? 'text-primary' : 'group-hover:text-primary transition-colors'}`} />
      <span className="flex-1 truncate">{label}</span>
      {active && <div className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />}
    </Link>
  );
}

function GuestCard() {
  return (
    <div className="rounded-2xl border border-border/60 bg-card/70 backdrop-blur-md p-5 text-center"
      style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.12)' }}
    >
      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/10 border border-primary/20 flex items-center justify-center mx-auto mb-4">
        <Users className="w-7 h-7 text-primary/60" />
      </div>
      <p className="font-grotesk font-bold text-sm mb-1">Rejoindre la communauté</p>
      <p className="font-inter text-xs text-muted-foreground mb-5 leading-relaxed">
        Connectez-vous pour publier, interagir et découvrir la communauté.
      </p>
      <Link to="/login" className="block w-full bg-primary text-primary-foreground text-sm font-inter font-semibold px-4 py-2.5 rounded-xl text-center hover:bg-primary/90 transition-colors mb-2"
        style={{ boxShadow: '0 0 16px rgba(var(--primary),0.25)' }}
      >
        Se connecter
      </Link>
      <Link to="/register" className="block w-full text-sm font-inter text-muted-foreground hover:text-foreground transition-colors py-2 rounded-xl hover:bg-secondary/50">
        Créer un compte
      </Link>
    </div>
  );
}

export default function LeftSidebar({ user }) {
  const location = useLocation();
  const isActive = (to) => to === '/' ? location.pathname === '/' : location.pathname.startsWith(to.split('?')[0]);

  if (!user) {
    return (
      <aside className="hidden lg:block w-60 xl:w-64 flex-shrink-0">
        <div className="sticky top-20">
          <GuestCard />
        </div>
      </aside>
    );
  }

  const displayName = user.display_name || user.full_name;
  const username = user.username;
  const avatarInitial = (displayName?.[0] || 'U').toUpperCase();
  const isAdmin = hasAdminAccess(user);
  const isBusiness = canManageAffiliations(user);

  return (
    <aside className="hidden lg:block w-60 xl:w-64 flex-shrink-0">
      <div className="sticky top-20 space-y-3">

        {/* Profile card */}
        <motion.div
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          className="rounded-2xl border border-border/60 bg-card/70 backdrop-blur-md overflow-hidden"
          style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.12)' }}
        >
          {/* Cover */}
          <div className="h-14 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/40 via-accent/20 to-primary/10" />
            <div className="absolute inset-0" style={{
              backgroundImage: 'radial-gradient(circle at 30% 50%, rgba(255,255,255,0.05) 0%, transparent 50%)',
            }} />
          </div>

          <div className="px-4 pb-4 -mt-6">
            <div className="w-12 h-12 rounded-full border-2 border-card bg-primary/15 flex items-center justify-center overflow-hidden mb-2.5 shadow-lg">
              {user.avatar_url
                ? <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
                : <span className="font-grotesk font-bold text-primary">{avatarInitial}</span>
              }
            </div>

            <div className="flex items-start justify-between gap-1 mb-1">
              <div className="min-w-0">
                <p className="font-grotesk font-bold text-sm text-foreground leading-tight truncate">{displayName}</p>
                {username && <p className="font-mono text-xs text-muted-foreground">@{username}</p>}
              </div>
              <div className="flex-shrink-0 mt-0.5">
                <VerificationIcons verifications={user.verifications} size="sm" user={user} />
              </div>
            </div>

            {user.bio && (
              <p className="font-inter text-xs text-muted-foreground line-clamp-2 leading-relaxed mb-3">{user.bio}</p>
            )}

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-1 mb-3 pt-2 border-t border-border/40">
              {[
                { label: 'Badges', value: user.badges?.length || 0 },
                { label: 'Certifs', value: user.verifications?.length || 0 },
                { label: 'Rôle', value: user.role === 'admin' ? 'Admin' : 'Mbr' },
              ].map(s => (
                <div key={s.label} className="text-center">
                  <p className="font-grotesk font-bold text-sm text-primary">{s.value}</p>
                  <p className="font-mono text-[10px] text-muted-foreground">{s.label}</p>
                </div>
              ))}
            </div>

            <Link
              to="/profile"
              className="block w-full text-center text-xs font-inter font-medium bg-secondary hover:bg-secondary/70 text-foreground px-3 py-2 rounded-xl transition-colors"
            >
              Voir mon profil
            </Link>
          </div>
        </motion.div>

        {/* Navigation */}
        <motion.div
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.05 }}
          className="rounded-2xl border border-border/60 bg-card/70 backdrop-blur-md p-2"
          style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}
        >
          {NAV_SECTIONS.map((section, si) => (
            <div key={si} className={si > 0 ? 'mt-2 pt-2 border-t border-border/40' : ''}>
              {section.title && (
                <p className="px-3 py-1.5 text-[10px] font-mono uppercase tracking-widest text-muted-foreground/60">{section.title}</p>
              )}
              {section.items.map(item => (
                <NavItem key={item.to} {...item} active={isActive(item.to)} />
              ))}
            </div>
          ))}

          {/* Admin / Business */}
          {(isAdmin || isBusiness) && (
            <div className="mt-2 pt-2 border-t border-border/40">
              <p className="px-3 py-1.5 text-[10px] font-mono uppercase tracking-widest text-muted-foreground/60">Accès spéciaux</p>
              {isBusiness && (
                <NavItem icon={Briefcase} label="Business Space" to="/business" active={isActive('/business')} />
              )}
              {isAdmin && (
                <NavItem icon={BarChart3} label="Administration" to="/admin" active={isActive('/admin')} />
              )}
            </div>
          )}
        </motion.div>

        {/* Settings shortcut */}
        <motion.div
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Link
            to="/profile"
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-inter text-muted-foreground hover:text-foreground hover:bg-card/60 transition-all"
          >
            <Settings className="w-3.5 h-3.5" /> Paramètres du compte
          </Link>
        </motion.div>

      </div>
    </aside>
  );
}