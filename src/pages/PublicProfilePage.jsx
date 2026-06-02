import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Users, MapPin, Globe, CheckCircle, Award, MessageCircle, UserPlus, UserMinus, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
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

function getAvatarGradient(name = '') {
  const GRADIENTS = [
    ['#1a237e', '#0d47a1', '#01579b'],
    ['#1b5e20', '#2e7d32', '#00695c'],
    ['#4a148c', '#6a1b9a', '#880e4f'],
    ['#bf360c', '#e65100', '#f57f17'],
    ['#006064', '#00838f', '#0277bd'],
    ['#311b92', '#4527a0', '#1565c0'],
    ['#1a237e', '#283593', '#37474f'],
    ['#004d40', '#00695c', '#006064'],
    ['#37474f', '#455a64', '#263238'],
    ['#b71c1c', '#c62828', '#6a1b9a'],
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  const idx = Math.abs(hash) % GRADIENTS.length;
  const [c1, c2, c3] = GRADIENTS[idx];
  return `linear-gradient(135deg, ${c1} 0%, ${c2} 55%, ${c3} 100%)`;
}

function getCoverGradient(name = '') {
  const COVERS = [
    'linear-gradient(135deg, #0d47a1 0%, #1565c0 40%, #0288d1 100%)',
    'linear-gradient(135deg, #1b5e20 0%, #2e7d32 50%, #43a047 100%)',
    'linear-gradient(135deg, #4a148c 0%, #7b1fa2 50%, #ab47bc 100%)',
    'linear-gradient(135deg, #bf360c 0%, #e64a19 50%, #ff7043 100%)',
    'linear-gradient(135deg, #006064 0%, #0097a7 50%, #00bcd4 100%)',
    'linear-gradient(135deg, #311b92 0%, #512da8 50%, #7e57c2 100%)',
    'linear-gradient(135deg, #1a237e 0%, #283593 50%, #5c6bc0 100%)',
    'linear-gradient(135deg, #004d40 0%, #00796b 50%, #26a69a 100%)',
    'linear-gradient(135deg, #263238 0%, #37474f 50%, #546e7a 100%)',
    'linear-gradient(135deg, #b71c1c 0%, #c62828 50%, #ef5350 100%)',
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  const idx = (Math.abs(hash) + 3) % COVERS.length;
  return COVERS[idx];
}

export default function PublicProfilePage() {
  const { pathUsername } = useParams();
  const navigate = useNavigate();
  
  // Extraire le username (enlever le @ s'il existe)
  const username = pathUsername?.startsWith('@') ? pathUsername.slice(1) : pathUsername;
  const [user, setUser] = useState(null);
  const [followers, setFollowers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followingLoading, setFollowingLoading] = useState(false);

  useEffect(() => {
    const loadUser = async () => {
      try {
        // Chercher l'utilisateur actuel
        let me = null;
        try {
          me = await base44.auth.me();
          setCurrentUser(me);
        } catch {
          // Non authentifié
        }

        // Chercher l'utilisateur par username
        const searchUsername = username.toLowerCase();
        const response = await base44.functions.invoke('getPublicUsers', {});
        const allUsers = response.data || response;
        const foundUser = allUsers.find(u => 
          u.username?.toLowerCase() === searchUsername
        );

        if (!foundUser) {
          setNotFound(true);
          setLoading(false);
          return;
        }

        setUser(foundUser);

        // Charger les followers
        const followersList = await base44.entities.Follow.filter({ following_email: foundUser.email });
        setFollowers(followersList);

        // Vérifier si l'utilisateur actuel suit ce profil
        if (me) {
          const isFollowingCheck = followersList.some(f => f.follower_email === me.email);
          setIsFollowing(isFollowingCheck);
        }

        // Subscribe aux changements en temps réel
        const unsubscribe = base44.entities.Follow.subscribe((event) => {
          if (event.data?.following_email === foundUser.email) {
            if (event.type === 'create') {
              setFollowers(prev => [...prev, event.data]);
              if (me && event.data?.follower_email === me.email) setIsFollowing(true);
            } else if (event.type === 'delete') {
              setFollowers(prev => prev.filter(f => f.id !== event.id));
              if (me && event.data?.follower_email === me.email) setIsFollowing(false);
            }
          }
        });

        return unsubscribe;
      } catch (err) {
        console.error('Profile load error:', err);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };

    const unsub = loadUser();
    return () => unsub?.then(fn => fn?.());
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
          <p className="text-muted-foreground">L'utilisateur {username?.toLowerCase()} n'existe pas</p>
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

  const handleFollow = async () => {
    if (!currentUser) {
      navigate('/profile');
      return;
    }
    
    setFollowingLoading(true);
    try {
      await base44.entities.Follow.create({
        follower_email: currentUser.email,
        follower_name: currentUser.full_name,
        follower_avatar: currentUser.avatar_url,
        following_email: user.email,
        following_name: user.full_name,
      });
      setIsFollowing(true);
      toast.success('Abonnement effectué !');
    } catch (err) {
      toast.error('Erreur lors de l\'abonnement');
    } finally {
      setFollowingLoading(false);
    }
  };

  const handleUnfollow = async () => {
    setFollowingLoading(true);
    try {
      const follows = await base44.entities.Follow.filter({
        follower_email: currentUser.email,
        following_email: user.email,
      });
      if (follows.length > 0) {
        await base44.entities.Follow.delete(follows[0].id);
        setIsFollowing(false);
        toast.success('Abonnement annulé');
      }
    } catch (err) {
      toast.error('Erreur lors de la suppression');
    } finally {
      setFollowingLoading(false);
    }
  };

  const handleMessage = () => {
    if (!currentUser) {
      navigate('/profile');
      return;
    }
    navigate(`/messages?to=${encodeURIComponent(user.email)}&name=${encodeURIComponent(user.display_name || user.full_name)}`);
  };

  return (
    <div className="pt-20 min-h-screen pb-20" style={isSupreme ? { background: 'linear-gradient(180deg, #0d0800 0%, hsl(214 50% 4%) 25%)' } : {}}>
      <div className="max-w-2xl mx-auto px-5">

        {/* Cover */}
        <div
          className="relative h-40 rounded-2xl overflow-hidden mb-0"
          style={isSupreme
            ? { background: 'linear-gradient(135deg, #1a0c00, #2d1500, #1a0c00)', border: '2px solid #d97706', boxShadow: '0 0 30px rgba(245,158,11,0.2)' }
            : user.cover_url
            ? {}
            : { background: getCoverGradient(user.full_name) }
          }
        >
          {user.cover_url ? (
            <img src={user.cover_url} alt="cover" className="w-full h-full object-cover" />
          ) : (
            <>
              {/* Pattern overlay */}
              <div className="absolute inset-0 opacity-20" style={{
                backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.15) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255,255,255,0.1) 0%, transparent 40%)',
              }} />
              <div className="absolute inset-0 grid-bg opacity-30" />
              {/* Initials watermark */}
              <div className="absolute inset-0 flex items-center justify-end pr-6 opacity-10">
                <span className="font-grotesk font-black text-7xl text-white select-none">
                  {user.full_name?.[0]?.toUpperCase() || '?'}
                </span>
              </div>
            </>
          )}
        </div>

        {/* Avatar + infos */}
        <div className="relative px-6 -mt-10 mb-6">
          <div className="flex items-end justify-between gap-4">
            <div
              className="w-20 h-20 rounded-2xl flex items-center justify-center overflow-hidden flex-shrink-0"
              style={isSupreme
                ? { border: '3px solid #d97706', boxShadow: '0 0 0 2px rgba(245,158,11,0.2), 0 0 20px rgba(245,158,11,0.4)', background: '#1a0c00' }
                : { border: '4px solid hsl(var(--background))', background: user.avatar_url ? 'hsl(var(--secondary))' : getAvatarGradient(user.full_name) }
              }
            >
              {user.avatar_url ? (
                <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
              ) : (
                <span className="font-grotesk font-bold text-3xl text-white drop-shadow-sm">
                  {user.full_name?.[0]?.toUpperCase() || '?'}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 flex-wrap">
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
            <h1
              className="font-grotesk font-bold text-3xl mb-1"
              style={isSupreme ? { background: 'linear-gradient(90deg,#f59e0b,#fde68a,#b45309)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' } : {}}
            >
              {user.display_name || user.full_name}
            </h1>

            <div className="flex items-center gap-2 mb-3">
              {user.username && (
                <p className="font-mono text-sm text-muted-foreground">{user.username}</p>
              )}
              <VerificationIcons verifications={user.verifications} size="md" />
            </div>

            {user.role && roleCfg && (
              <span className={`inline-block mb-4 font-mono text-[10px] px-2.5 py-1 rounded-full border ${roleCfg.bg} ${roleCfg.color} ${roleCfg.border}`}>
                {roleCfg.emoji} {roleCfg.label}
              </span>
            )}

            {/* Action buttons */}
            {currentUser && currentUser.email !== user.email && (
              <div className="flex gap-2 mb-4">
                {!isFollowing ? (
                  <Button
                    onClick={handleFollow}
                    disabled={followingLoading}
                    className="flex-1 gap-2 h-10 text-sm font-medium bg-primary hover:bg-primary/90 rounded-xl"
                  >
                    {followingLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                    S'abonner
                  </Button>
                ) : (
                  <>
                    <Button
                      onClick={handleMessage}
                      className="flex-1 gap-2 h-10 text-sm font-medium bg-secondary hover:bg-secondary/80 text-foreground rounded-xl"
                    >
                      <MessageCircle className="w-4 h-4" />
                      Message
                    </Button>
                    <Button
                      onClick={handleUnfollow}
                      disabled={followingLoading}
                      className="h-10 px-4 text-sm font-medium bg-destructive/10 hover:bg-destructive/20 text-destructive border border-destructive/30 rounded-xl"
                    >
                      {followingLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserMinus className="w-4 h-4" />}
                    </Button>
                  </>
                )}
              </div>
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