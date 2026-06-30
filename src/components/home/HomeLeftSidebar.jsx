import { motion } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import {
  Home, Compass, MessageCircle, Bell, Bookmark, Calendar,
  Settings, Users, BarChart3, Briefcase, Star, Shield,
  FileText, Award, ChevronRight, LogOut, Sparkles, Building2
} from 'lucide-react';
import VerificationIcons from '@/components/ui/VerificationIcon';
import { hasAdminAccess } from '@/lib/roles';
import { canManageAffiliations } from '@/lib/affiliationUtils';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';

const NAV = [
  { icon: Home,          label: 'Accueil',       to: '/',          section: 'main' },
  { icon: Compass,       label: 'Explorer',       to: '/discover',  section: 'main' },
  { icon: MessageCircle, label: 'Messages',       to: '/messages',  section: 'main' },
  { icon: FileText,      label: 'Forum',          to: '/forum',     section: 'main' },
  { icon: Calendar,      label: 'Planning',       to: '/planning',  section: 'main' },
  { icon: Bookmark,      label: 'Enregistrés',   to: '/espace-client?tab=files', section: 'perso' },
  { icon: Award,         label: 'Mes badges',    to: '/espace-client?tab=badges', section: 'perso' },
  { icon: Users,         label: 'Affiliations',  to: '/espace-client?tab=my-affils', section: 'perso' },
  { icon: Shield,        label: 'Espace Client', to: '/espace-client', section: 'perso' },
];

function NavItem({ icon: Icon, label, to, active, badge }) {
  return (
    <Link to={to} className={`group flex items-center gap-3.5 px-4 py-3 rounded-2xl transition-all duration-200 relative ${
      active
        ? 'bg-gradient-to-r from-primary/20 to-primary/5 text-primary shadow-sm'
        : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
    }`}>
      {active && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full bg-primary" />
      )}
      <div className={`relative flex items-center justify-center w-9 h-9 rounded-xl transition-all duration-200 ${
        active
          ? 'bg-primary/20 shadow-[0_0_12px_rgba(var(--primary),0.4)]'
          : 'bg-white/5 group-hover:bg-white/10'
      }`}>
        <Icon className={`w-4.5 h-4.5 ${active ? 'text-primary' : ''}`} style={{ width: 18, height: 18 }} />
        {badge > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-primary text-primary-foreground text-[9px] font-bold flex items-center justify-center border border-background">
            {badge > 9 ? '9+' : badge}
          </span>
        )}
      </div>
      <span className="font-inter text-sm font-medium hidden xl:block">{label}</span>
      {active && <div className="ml-auto hidden xl:block w-1.5 h-1.5 rounded-full bg-primary" />}
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

  const mainNav = NAV.filter(n => n.section === 'main');
  const persoNav = NAV.filter(n => n.section === 'perso');

  return (
    <aside className="hidden lg:flex flex-col w-20 xl:w-72 flex-shrink-0 h-[calc(100vh-68px)] sticky top-[68px]">
      <div className="flex flex-col h-full overflow-y-auto py-4 px-2 xl:px-3 scrollbar-hide">

        {/* Profile card */}
        {user && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 xl:mb-6"
          >
            <Link to="/profile">
              <div className="rounded-2xl overflow-hidden border border-white/8 transition-all duration-300 hover:border-primary/30 hover:shadow-[0_8px_32px_rgba(0,0,0,0.3)]"
                style={{ background: 'linear-gradient(145deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)', backdropFilter: 'blur(12px)' }}
              >
                {/* Cover */}
                <div className="h-14 xl:h-16 relative overflow-hidden hidden xl:block">
                  <div className="absolute inset-0" style={{
                    background: 'linear-gradient(135deg, hsl(205 90% 20% / 0.8) 0%, hsl(195 80% 15% / 0.6) 50%, hsl(214 50% 8% / 0.9) 100%)',
                  }} />
                  {/* Subtle pattern */}
                  <div className="absolute inset-0 opacity-20 grid-bg" />
                </div>

                <div className="xl:px-4 xl:pb-4 xl:-mt-6 flex xl:flex-col items-center xl:items-start gap-3 xl:gap-0 px-2 py-2 xl:py-0">
                  {/* Avatar */}
                  <div className="w-10 h-10 xl:w-12 xl:h-12 rounded-full flex-shrink-0 overflow-hidden xl:border-2 xl:border-background shadow-lg"
                    style={{ background: 'hsl(var(--primary) / 0.2)' }}
                  >
                    {user.avatar_url
                      ? <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
                      : <div className="w-full h-full flex items-center justify-center">
                          <span className="font-grotesk font-bold text-primary text-base">{avatarInitial}</span>
                        </div>
                    }
                  </div>

                  <div className="flex-1 min-w-0 hidden xl:block xl:mt-2">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="font-grotesk font-bold text-sm text-foreground truncate">{displayName}</p>
                      <VerificationIcons verifications={user.verifications} size="sm" user={user} />
                    </div>
                    {user.username && (
                      <p className="font-mono text-xs text-muted-foreground/70">@{user.username}</p>
                    )}
                    {user.bio && (
                      <p className="font-inter text-xs text-muted-foreground mt-1.5 line-clamp-2 leading-relaxed">{user.bio}</p>
                    )}

                    {/* Mini stats */}
                    <div className="flex items-center gap-3 mt-3 pt-3 border-t border-white/8">
                      <div className="text-center">
                        <p className="font-grotesk font-bold text-xs text-primary">{user.badges?.length || 0}</p>
                        <p className="font-mono text-[10px] text-muted-foreground/60">badges</p>
                      </div>
                      <div className="text-center">
                        <p className="font-grotesk font-bold text-xs text-primary">{user.verifications?.length || 0}</p>
                        <p className="font-mono text-[10px] text-muted-foreground/60">certifs</p>
                      </div>
                      <div className="text-center">
                        <p className="font-grotesk font-bold text-xs text-foreground/70">{user.role === 'admin' ? 'Admin' : 'Mbr'}</p>
                        <p className="font-mono text-[10px] text-muted-foreground/60">rôle</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>
        )}

        {/* Guest mini profile */}
        {user === null && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-4 xl:mb-6">
            <div className="rounded-2xl border border-white/8 p-3 xl:p-4 text-center hidden xl:block"
              style={{ background: 'linear-gradient(145deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)' }}
            >
              <div className="w-12 h-12 rounded-2xl bg-primary/15 border border-primary/20 flex items-center justify-center mx-auto mb-3">
                <Sparkles className="w-6 h-6 text-primary/60" />
              </div>
              <p className="font-grotesk font-bold text-sm mb-1">Rejoignez-nous</p>
              <p className="font-inter text-xs text-muted-foreground mb-4">Créez un compte pour accéder à toutes les fonctionnalités</p>
              <Link to="/register" className="block w-full bg-primary text-primary-foreground text-xs font-inter font-semibold px-3 py-2.5 rounded-xl mb-2 hover:bg-primary/90 transition-colors text-center"
                style={{ boxShadow: '0 0 20px hsl(var(--primary) / 0.3)' }}
              >
                Créer un compte
              </Link>
              <Link to="/login" className="block w-full text-xs font-inter text-muted-foreground hover:text-foreground transition-colors py-2">
                Se connecter
              </Link>
            </div>
          </motion.div>
        )}

        {/* Nav — main */}
        <nav className="space-y-1 flex-1">
          {mainNav.map((item, i) => (
            <motion.div key={item.to}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }}
            >
              <NavItem {...item} active={isActive(item.to)} badge={item.to === '/messages' ? notifs.length : 0} />
            </motion.div>
          ))}

          {/* Separator */}
          <div className="my-3 mx-4 h-px bg-white/6" />

          {/* Nav — personal */}
          {user && persoNav.map((item, i) => (
            <motion.div key={item.to}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: (mainNav.length + i) * 0.04 }}
            >
              <NavItem {...item} active={isActive(item.to)} />
            </motion.div>
          ))}

          {/* Admin / Business */}
          {(isAdmin || isBusiness) && (
            <>
              <div className="my-3 mx-4 h-px bg-white/6" />
              {isBusiness && (
                <NavItem icon={Building2} label="Business Space" to="/business" active={isActive('/business')} />
              )}
              {isAdmin && (
                <NavItem icon={BarChart3} label="Administration" to="/admin" active={isActive('/admin')} />
              )}
            </>
          )}
        </nav>

        {/* Bottom: logout */}
        {user && (
          <div className="mt-4 pt-4 border-t border-white/6">
            <button
              onClick={() => base44.auth.logout('/')}
              className="w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl text-muted-foreground hover:text-rose-400 hover:bg-rose-400/8 transition-all duration-200 group"
            >
              <div className="w-9 h-9 rounded-xl bg-white/5 group-hover:bg-rose-400/12 flex items-center justify-center transition-all">
                <LogOut style={{ width: 18, height: 18 }} />
              </div>
              <span className="font-inter text-sm font-medium hidden xl:block">Déconnexion</span>
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}