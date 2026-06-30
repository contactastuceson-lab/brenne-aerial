import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Users, Bookmark, Building2, Calendar, Star, Settings,
  FileText, TrendingUp, MessageCircle, UserCheck, ChevronRight,
  BarChart3
} from 'lucide-react';
import VerificationIcons from '@/components/ui/VerificationIcon';

const NAV_ITEMS = [
  { icon: Users,          label: 'Communauté',      to: '/discover' },
  { icon: MessageCircle,  label: 'Messages',         to: '/messages' },
  { icon: FileText,       label: 'Forum',            to: '/forum' },
  { icon: Building2,      label: 'Partenaires',      to: '/partenaires' },
  { icon: Calendar,       label: 'Planning',         to: '/planning' },
  { icon: Bookmark,       label: 'Mes favoris',      to: '/espace-client' },
  { icon: UserCheck,      label: 'Espace client',    to: '/espace-client' },
  { icon: Settings,       label: 'Paramètres',       to: '/profile' },
];

function StatPill({ label, value, color }) {
  return (
    <div className="flex items-center justify-between py-2">
      <span className="font-inter text-xs text-muted-foreground">{label}</span>
      <span className={`font-grotesk font-bold text-sm ${color}`}>{value}</span>
    </div>
  );
}

export default function LeftSidebar({ user }) {
  if (!user) {
    return (
      <aside className="hidden lg:block w-64 xl:w-72 flex-shrink-0">
        <div className="sticky top-24 space-y-3">
          <div className="rounded-2xl border border-border bg-card/60 backdrop-blur-sm p-5 text-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-3">
              <Users className="w-7 h-7 text-primary/50" />
            </div>
            <p className="font-grotesk font-semibold text-sm mb-1">Rejoindre la communauté</p>
            <p className="font-inter text-xs text-muted-foreground mb-4">Connectez-vous pour profiter pleinement de la plateforme</p>
            <Link to="/login" className="block w-full bg-primary text-primary-foreground text-sm font-inter font-medium px-4 py-2.5 rounded-xl text-center hover:bg-primary/90 transition-colors">
              Se connecter
            </Link>
            <Link to="/register" className="block w-full mt-2 text-sm font-inter text-muted-foreground hover:text-foreground transition-colors py-2">
              Créer un compte
            </Link>
          </div>
        </div>
      </aside>
    );
  }

  const displayName = user.display_name || user.full_name;
  const username = user.username;
  const avatarInitial = (displayName?.[0] || 'U').toUpperCase();

  return (
    <aside className="hidden lg:block w-64 xl:w-72 flex-shrink-0">
      <div className="sticky top-24 space-y-3">

        {/* Profile card */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="rounded-2xl border border-border bg-card/60 backdrop-blur-sm overflow-hidden"
        >
          {/* Cover gradient */}
          <div className="h-16 bg-gradient-to-br from-primary/30 via-accent/20 to-transparent relative">
            <div className="absolute inset-0 grid-bg opacity-30" />
          </div>
          <div className="px-4 pb-4 -mt-7">
            <div className="w-14 h-14 rounded-full border-2 border-card bg-primary/20 flex items-center justify-center overflow-hidden mb-3">
              {user.avatar_url
                ? <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
                : <span className="font-grotesk font-bold text-primary text-lg">{avatarInitial}</span>
              }
            </div>
            <div className="flex items-start gap-2">
              <div className="min-w-0 flex-1">
                <p className="font-grotesk font-bold text-sm text-foreground truncate">{displayName}</p>
                {username && <p className="font-mono text-xs text-muted-foreground">@{username}</p>}
              </div>
              <div className="flex-shrink-0 mt-0.5">
                <VerificationIcons verifications={user.verifications} size="sm" user={user} />
              </div>
            </div>
            {user.bio && (
              <p className="font-inter text-xs text-muted-foreground mt-2 line-clamp-2 leading-relaxed">{user.bio}</p>
            )}
            <div className="mt-3 pt-3 border-t border-border/50 space-y-0.5">
              <StatPill label="Profil" value="Mon espace" color="text-primary" />
            </div>
            <Link
              to="/profile"
              className="mt-3 block w-full text-center text-xs font-inter font-medium bg-secondary hover:bg-secondary/80 text-foreground px-3 py-2 rounded-xl transition-colors"
            >
              Voir mon profil
            </Link>
          </div>
        </motion.div>

        {/* Navigation */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.05 }}
          className="rounded-2xl border border-border bg-card/60 backdrop-blur-sm p-2"
        >
          {NAV_ITEMS.map(({ icon: Icon, label, to }) => (
            <Link
              key={to + label}
              to={to}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-inter text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-all group"
            >
              <Icon className="w-4 h-4 flex-shrink-0 group-hover:text-primary transition-colors" />
              <span className="flex-1">{label}</span>
              <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>
          ))}
        </motion.div>

        {/* Quick stats */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl border border-border bg-card/60 backdrop-blur-sm p-4"
        >
          <div className="flex items-center gap-2 mb-3">
            <BarChart3 className="w-4 h-4 text-primary" />
            <p className="font-inter text-xs font-semibold text-foreground uppercase tracking-wide">Mes stats</p>
          </div>
          <div className="divide-y divide-border/50">
            <StatPill label="Badges" value={user.badges?.length || 0} color="text-purple-400" />
            <StatPill label="Certifications" value={user.verifications?.length || 0} color="text-primary" />
            <StatPill label="Rôle" value={user.role === 'admin' ? 'Admin' : 'Membre'} color="text-amber-400" />
          </div>
        </motion.div>

      </div>
    </aside>
  );
}