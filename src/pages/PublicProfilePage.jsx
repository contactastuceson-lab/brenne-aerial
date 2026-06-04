import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Users, MapPin, Globe, CheckCircle, MessageCircle, UserPlus, UserMinus, Loader2, MessageSquare, Calendar, Hash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import VerificationIcons from '@/components/ui/VerificationIcon';
import { VERIFICATION_CONFIG } from '@/components/ui/VerificationChip';
import BadgeChip from '@/components/ui/BadgeChip';
import { ROLE_CONFIG } from '@/lib/roles';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

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
  const [recentDiscussions, setRecentDiscussions] = useState([]);
  const [followingCount, setFollowingCount] = useState(0);
  const [badgeCounts, setBadgeCounts] = useState({});

  // ── SEO meta tags dynamiques ──
  useEffect(() => {
    if (!user) return;
    const displayName = user.display_name || user.full_name || user.username;
    const handle = user.username ? `@${user.username}` : '';
    const followerCount = followers.length;
    const bio = user.bio ? user.bio.slice(0, 120) : '';
    const badges = user.verifications?.length
      ? user.verifications.map(v => v.charAt(0).toUpperCase() + v.slice(1)).join(', ')
      : '';

    const title = `${displayName} (${handle}) · Brenne Aerial`;
    const desc = [
      `${displayName} ${handle} sur Brenne Aerial.`,
      followerCount ? `${followerCount} abonné${followerCount > 1 ? 's' : ''}.` : '',
      badges ? `${badges}.` : '',
      bio,
    ].filter(Boolean).join(' ').slice(0, 200);

    const prevTitle = document.title;
    document.title = title;

    const setMeta = (sel, attr, val) => {
      let el = document.querySelector(sel);
      if (!el) { el = document.createElement('meta'); document.head.appendChild(el); }
      el.setAttribute(attr, val);
    };

    setMeta('meta[name="description"]', 'content', desc);
    setMeta('meta[property="og:title"]', 'content', title);
    setMeta('meta[property="og:description"]', 'content', desc);
    setMeta('meta[property="og:type"]', 'content', 'profile');
    if (user.avatar_url) setMeta('meta[property="og:image"]', 'content', user.avatar_url);
    setMeta('meta[name="twitter:card"]', 'content', 'summary');
    setMeta('meta[name="twitter:title"]', 'content', title);
    setMeta('meta[name="twitter:description"]', 'content', desc);
    if (user.avatar_url) setMeta('meta[name="twitter:image"]', 'content', user.avatar_url);

    return () => { document.title = prevTitle; };
  }, [user, followers]);

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

        // Charger les followers & following en parallèle + discussions récentes
        const [followersList, followingList, discussions] = await Promise.all([
          base44.entities.Follow.filter({ following_email: foundUser.email }),
          base44.entities.Follow.filter({ follower_email: foundUser.email }),
          base44.entities.Discussion.filter({ author_id: foundUser.id }, '-created_date', 5).catch(() => []),
        ]);
        setFollowers(followersList);
        setFollowingCount(followingList.length);
        setRecentDiscussions(discussions);

        // Vérifier si l'utilisateur actuel suit ce profil
        if (me) {
          const isFollowingCheck = followersList.some(f => f.follower_email === me.email);
          setIsFollowing(isFollowingCheck);
        }

        // Count profiles per verification level
        const counts = { verified: 0, pro: 0, certified: 0, official: 0, supreme: 0 };
        allUsers.forEach(u => {
          if (u.verifications?.includes('verified')) counts.verified++;
          if (u.verifications?.includes('pro')) counts.pro++;
          if (u.verifications?.includes('certified')) counts.certified++;
          if (u.verifications?.includes('official')) counts.official++;
          if (u.verifications?.includes('supreme')) counts.supreme++;
        });
        setBadgeCounts(counts);

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

  const isSupreme = user?.verifications?.includes('supreme');
  const roleCfg = ROLE_CONFIG[user?.role];

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

  const memberSince = user?.created_date
    ? formatDistanceToNow(new Date(user.created_date), { addSuffix: true, locale: fr })
    : null;

  return (
    <div className="pt-16 min-h-screen pb-20" style={isSupreme ? { background: 'linear-gradient(180deg, #0d0800 0%, hsl(214 50% 4%) 25%)' } : {}}>
      <div className="max-w-2xl mx-auto">

        {/* Cover */}
        <div
          className="relative h-52 overflow-hidden"
          style={isSupreme
            ? { background: 'linear-gradient(135deg, #1a0c00, #2d1500, #1a0c00)', borderBottom: '2px solid #d97706', boxShadow: '0 0 30px rgba(245,158,11,0.2)' }
            : user.cover_url
            ? {}
            : { background: getCoverGradient(user.full_name) }
          }
        >
          {user.cover_url ? (
            <img src={user.cover_url} alt="cover" className="w-full h-full object-cover" />
          ) : (
            <>
              <div className="absolute inset-0 opacity-20" style={{
                backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.15) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255,255,255,0.1) 0%, transparent 40%)',
              }} />
              <div className="absolute inset-0 grid-bg opacity-30" />
              <div className="absolute inset-0 flex items-center justify-end pr-10 opacity-10">
                <span className="font-grotesk font-black text-[10rem] text-white select-none leading-none">
                  {user.full_name?.[0]?.toUpperCase() || '?'}
                </span>
              </div>
            </>
          )}
          {/* Gradient bottom fade */}
          <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-background to-transparent" />
        </div>

        {/* Avatar + header */}
        <div className="relative px-5 -mt-12">
          <div className="flex items-end justify-between gap-4 mb-4">
            {/* Avatar */}
            <div
              className="w-24 h-24 rounded-2xl flex items-center justify-center overflow-hidden flex-shrink-0 relative z-10"
              style={isSupreme
                ? { border: '3px solid #d97706', boxShadow: '0 0 0 2px rgba(245,158,11,0.2), 0 0 20px rgba(245,158,11,0.4)', background: '#1a0c00' }
                : { border: '4px solid hsl(var(--background))', background: user.avatar_url ? 'hsl(var(--secondary))' : getAvatarGradient(user.full_name) }
              }
            >
              {user.avatar_url ? (
                <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
              ) : (
                <span className="font-grotesk font-bold text-4xl text-white drop-shadow-sm">
                  {user.full_name?.[0]?.toUpperCase() || '?'}
                </span>
              )}
            </div>

            {/* Status badges top right */}
            <div className="flex items-center gap-2 flex-wrap pb-1">
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

          {/* Name + username */}
          <h1
            className="font-grotesk font-bold text-3xl mb-1"
            style={isSupreme ? { background: 'linear-gradient(90deg,#f59e0b,#fde68a,#b45309)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' } : {}}
          >
            {user.display_name || user.full_name}
          </h1>

          <div className="flex items-center gap-2 mb-3">
            {user.username && (
              <p className="font-mono text-sm text-muted-foreground">@{user.username}</p>
            )}
            <VerificationIcons verifications={user.verifications} size="md" />
          </div>

          {/* Role chip */}
          {user.role && roleCfg && (
            <span className={`inline-flex items-center gap-1 mb-4 font-mono text-[10px] px-2.5 py-1 rounded-full border ${roleCfg.bg} ${roleCfg.color} ${roleCfg.border}`}>
              {roleCfg.emoji} {roleCfg.label}
            </span>
          )}

          {/* Bio */}
          {user.bio && (
            <p className="font-inter text-sm text-foreground/80 leading-relaxed mb-4 whitespace-pre-line">
              {user.bio}
            </p>
          )}

          {/* Info row */}
          <div className="flex flex-wrap gap-x-4 gap-y-1.5 mb-4">
            {user.location && (
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <MapPin className="w-3.5 h-3.5" /> {user.location}
              </div>
            )}
            {user.website && (
              <div className="flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-primary" />
                <a href={user.website} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline truncate max-w-[200px]">
                  {user.website.replace(/^https?:\/\//, '')}
                </a>
              </div>
            )}
            {memberSince && (
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Calendar className="w-3.5 h-3.5" /> Membre {memberSince}
              </div>
            )}
          </div>

          {/* Verifications with counts */}
          {user.verifications?.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {user.verifications.map(v => {
                const cfg = VERIFICATION_CONFIG[v];
                if (!cfg) return null;
                const count = badgeCounts[v] || 0;
                return (
                  <span key={v} className={`flex items-center gap-1.5 font-inter text-xs px-2.5 py-1 rounded-full border ${cfg.border} ${cfg.bg}`}>
                    <span className={cfg.color}>•</span>
                    <span className={cfg.color}>{cfg.label}</span>
                    <span className="text-muted-foreground">·</span>
                    <span className="text-muted-foreground font-mono text-[10px]">{count} {count <= 1 ? 'profil' : 'profils'}</span>
                  </span>
                );
              })}
            </div>
          )}

          {/* Badges */}
          {user.badges?.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
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

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="bg-secondary/50 border border-border rounded-xl p-3 text-center">
              <p className="font-grotesk font-bold text-xl text-foreground">{followers.length}</p>
              <p className="font-inter text-xs text-muted-foreground mt-0.5">Abonné{followers.length > 1 ? 's' : ''}</p>
            </div>
            <div className="bg-secondary/50 border border-border rounded-xl p-3 text-center">
              <p className="font-grotesk font-bold text-xl text-foreground">{followingCount}</p>
              <p className="font-inter text-xs text-muted-foreground mt-0.5">Abonnements</p>
            </div>
            <div className="bg-secondary/50 border border-border rounded-xl p-3 text-center">
              <p className="font-grotesk font-bold text-xl text-foreground">{recentDiscussions.length}</p>
              <p className="font-inter text-xs text-muted-foreground mt-0.5">Discussion{recentDiscussions.length > 1 ? 's' : ''}</p>
            </div>
          </div>

          {/* Action buttons */}
          {currentUser && currentUser.email !== user.email && (
            <div className="flex gap-2 mb-6">
              <Button
                onClick={handleMessage}
                variant="outline"
                className="flex-1 gap-2 h-10 text-sm font-medium rounded-xl"
              >
                <MessageCircle className="w-4 h-4" />
                Message
              </Button>
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
                <Button
                  onClick={handleUnfollow}
                  disabled={followingLoading}
                  className="flex-1 h-10 text-sm font-medium bg-destructive/10 hover:bg-destructive/20 text-destructive border border-destructive/30 rounded-xl gap-2"
                >
                  {followingLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserMinus className="w-4 h-4" />}
                  Se désabonner
                </Button>
              )}
            </div>
          )}

          {/* Discussions récentes */}
          {recentDiscussions.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
              <h2 className="font-grotesk font-semibold text-base mb-3 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-primary" />
                Discussions récentes
              </h2>
              <div className="space-y-2">
                {recentDiscussions.map(d => (
                  <Link
                    key={d.id}
                    to={`/forum/${d.id}`}
                    className="block p-3 bg-secondary/40 hover:bg-secondary/70 border border-border rounded-xl transition-colors group"
                  >
                    <p className="font-inter text-sm font-medium text-foreground group-hover:text-primary transition-colors line-clamp-1">{d.title}</p>
                    <div className="flex items-center gap-3 mt-1.5">
                      {d.category && (
                        <span className="flex items-center gap-1 text-[10px] font-mono text-muted-foreground">
                          <Hash className="w-2.5 h-2.5" />{d.category}
                        </span>
                      )}
                      <span className="text-[10px] text-muted-foreground">
                        {formatDistanceToNow(new Date(d.created_date), { addSuffix: true, locale: fr })}
                      </span>
                      {d.replies_count > 0 && (
                        <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                          <MessageSquare className="w-2.5 h-2.5" />{d.replies_count}
                        </span>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </motion.div>
          )}

        </div>
      </div>
    </div>
  );
}