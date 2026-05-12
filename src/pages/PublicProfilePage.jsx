import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Users, MapPin, Globe, CheckCircle, Award } from 'lucide-react';
import VerificationIcons from '@/components/ui/VerificationIcon';
import BadgeChip from '@/components/ui/BadgeChip';
import { ROLE_CONFIG } from '@/lib/roles';

const BADGE_CONFIG = {
  'Fondateur': { color: 'text-yellow-400', bg: 'bg-yellow-400/10', border: 'border-yellow-400/30' },
  'Collaborateur': { color: 'text-blue-400', bg: 'bg-blue-400/10', border: 'border-blue-400/30' },
  'VIP': { color: 'text-purple-400', bg: 'bg-purple-400/10', border: 'border-purple-400/30' },
  'Admin': { color: 'text-red-400', bg: 'bg-red-400/10', border: 'border-red-400/30' },
  'Pilote': { color: 'text-primary', bg: 'bg-primary/10', border: 'border-primary/30' },
  'Officiel': { color: 'text-accent', bg: 'bg-accent/10', border: 'border-accent/30' },
  'Donateur': { color: 'text-red-400', bg: 'bg-red-400/10', border: 'border-red-400/30' },
};

export default function PublicProfilePage() {
  const { username } = useParams();
  const [user, setUser] = useState(null);
  const [followers, setFollowers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const loadUser = async () => {
      try {
         // Chercher l'utilisateur par username (case-insensitive)
         const searchUsername = username.toLowerCase().replace(/@/g, '');
         const users = await base44.entities.User.filter({ username: searchUsername });
        if (users.length === 0) {
          setNotFound(true);
          setLoading(false);
          return;
        }

        const foundUser = users[0];
        setUser(foundUser);

        // Charger les followers
        const followersList = await base44.entities.Follow.filter({ following_email: foundUser.email });
        setFollowers(followersList);
      } catch (err) {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [username]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (notFound || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">Profil non trouvé</h1>
          <p className="text-muted-foreground">L'utilisateur @{username?.toLowerCase()} n'existe pas</p>
        </div>
      </div>
    );
  }

  const isSupreme = user.verifications?.includes('supreme');
  const roleCfg = ROLE_CONFIG[user.role];

  const statusColors = {
    active: 'text-green-400 bg-green-400/10 border-green-400/30',
    suspended: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30',
    banned: 'text-red-400 bg-red-400/10 border-red-400/30',
    restricted: 'text-orange-400 bg-orange-400/10 border-orange-400/30',
  };

  return (
    <div className="pt-20 min-h-screen pb-20" style={isSupreme ? { background: 'linear-gradient(180deg, #0d0800 0%, hsl(214 50% 4%) 25%)' } : {}}>
      <div className="max-w-2xl mx-auto px-5">

        {/* Cover */}
        <div
          className="relative h-40 rounded-2xl overflow-hidden mb-0"
          style={isSupreme
            ? { background: 'linear-gradient(135deg, #1a0c00, #2d1500, #1a0c00)', border: '2px solid #d97706', boxShadow: '0 0 30px rgba(245,158,11,0.2)' }
            : { background: 'linear-gradient(to bottom right, hsl(var(--primary)/0.2), hsl(var(--accent)/0.1), hsl(var(--secondary)))' }
          }
        >
          {user.cover_url ? (
            <img src={user.cover_url} alt="cover" className="w-full h-full object-cover" />
          ) : isSupreme ? (
            <div className="absolute inset-0 grid-bg opacity-20" />
          ) : (
            <div className="absolute inset-0 grid-bg" />
          )}
        </div>

        {/* Avatar + infos */}
        <div className="relative px-6 -mt-10 mb-6">
          <div className="flex items-end justify-between">
            <div>
              <div
                className="w-20 h-20 rounded-2xl flex items-center justify-center overflow-hidden"
                style={isSupreme
                  ? { border: '3px solid #d97706', boxShadow: '0 0 0 2px rgba(245,158,11,0.2), 0 0 20px rgba(245,158,11,0.4)', background: '#1a0c00' }
                  : { border: '4px solid hsl(var(--background))', background: 'hsl(var(--secondary))' }
                }
              >
                {user.avatar_url ? (
                  <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span className="font-grotesk font-bold text-3xl text-primary">
                    {user.full_name?.[0]?.toUpperCase() || '?'}
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 pb-1">
              {user.verified_status === 'yes' && (
                <span className="flex items-center gap-1 font-mono text-[10px] text-accent bg-accent/10 border border-accent/30 px-2 py-1 rounded-full">
                  <CheckCircle className="w-3 h-3" /> Vérifié
                </span>
              )}
              <span className={`font-mono text-[10px] border px-2 py-1 rounded-full ${statusColors[user.account_status || 'active']}`}>
                {user.account_status === 'active' ? 'Actif' : 'Inactif'}
              </span>
            </div>
          </div>

          <div className="mt-4">
            <div className="flex items-center gap-1.5">
              <h1
                className="font-grotesk font-bold text-2xl"
                style={isSupreme ? { background: 'linear-gradient(90deg,#f59e0b,#fde68a,#b45309)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' } : {}}
              >
                {user.display_name || user.full_name}
              </h1>
              <VerificationIcons verifications={user.verifications} size="md" />
            </div>
            <p className="font-mono text-sm text-muted-foreground mt-1">@{user.username}</p>
            <p className="font-inter text-xs text-muted-foreground">{user.email}</p>
            {user.role && roleCfg && (
              <span className={`inline-block mt-2 font-mono text-[10px] px-2 py-0.5 rounded-full border ${roleCfg.bg} ${roleCfg.color} ${roleCfg.border}`}>
                {roleCfg.emoji} {roleCfg.label}
              </span>
            )}
          </div>

          {/* Bio */}
          {user.bio && (
            <div className="mt-4 p-3 bg-secondary/50 rounded-lg border border-border">
              <p className="font-inter text-sm text-foreground">{user.bio}</p>
            </div>
          )}

          {/* Badges */}
          {user.badges?.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {user.badges.map(b => {
                const cfg = BADGE_CONFIG[b];
                if (!cfg) return <BadgeChip key={b} badge={b} />;
                return (
                  <span key={b} className={`flex items-center gap-1.5 font-inter text-xs px-2.5 py-1 rounded-full border ${cfg.color} ${cfg.bg} ${cfg.border}`}>
                    {b}
                  </span>
                );
              })}
            </div>
          )}

          {/* Contact info */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 space-y-2"
          >
            {user.location && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="w-4 h-4" /> {user.location}
              </div>
            )}
            {user.website && (
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-primary" />
                <a href={user.website} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline truncate">
                  {user.website}
                </a>
              </div>
            )}
            {user.phone && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="text-xs">{user.phone}</span>
              </div>
            )}
          </motion.div>

          {/* Followers */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 flex items-center gap-3 py-3 px-3 rounded-xl bg-secondary/50 border border-border"
          >
            <Users className="w-4 h-4 text-primary" />
            <span className="font-grotesk font-semibold">{followers.length}</span>
            <span className="font-inter text-sm text-muted-foreground">
              abonné{followers.length > 1 ? 's' : ''}
            </span>
          </motion.div>
        </div>
      </div>
    </div>
  );
}