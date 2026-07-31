import { useState, useEffect, useMemo } from 'react';
import ProfileNotFound from '@/components/profile/ProfileNotFound';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { MapPin, Globe, CheckCircle, MessageCircle, UserPlus, UserMinus, Loader2, MessageSquare, Calendar, Hash, Settings, Image, Reply, Ban, ShieldOff, ShieldAlert, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import VerificationIcons from '@/components/ui/VerificationIcon';
import AffiliationModal from '@/components/ui/AffiliationModal';
import { VERIFICATION_CONFIG } from '@/components/ui/VerificationChip';
import BadgeChip from '@/components/ui/BadgeChip';
import { getHighestVerificationBadge } from '@/lib/affiliationUtils';
import { useOrganizationAffiliations, prefillUserCache, resolveAffiliatedProfiles } from '@/hooks/useOrganizationAffiliations';
import { ROLE_CONFIG } from '@/lib/roles';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import HomeRightSidebar from '@/components/home/HomeRightSidebar';
import PostCard from '@/components/post/PostCard';
import { notify } from '@/lib/notificationHelper';
import PerkBadges, { getPerkEffects, getActivePerks, PerkParticles } from '@/components/profile/ActivePerks';
import AdSlot from '@/components/feed/AdSlot';

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
  const { pathUsername, userId } = useParams();
  const navigate = useNavigate();
  
  const username = pathUsername?.startsWith('@') ? pathUsername.slice(1) : pathUsername;
  const requestedUser = username || userId;
  const [user, setUser] = useState(null);
  const [followers, setFollowers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followingLoading, setFollowingLoading] = useState(false);
  const [recentDiscussions, setRecentDiscussions] = useState([]);
  const [userPosts, setUserPosts] = useState([]);
  const [userReplies, setUserReplies] = useState([]);
  const [userMediaPosts, setUserMediaPosts] = useState([]);
  const [profileTab, setProfileTab] = useState('posts');
  const [followingCount, setFollowingCount] = useState(0);
  const [badgeCounts, setBadgeCounts] = useState({});
  const [allUsers, setAllUsers] = useState([]);
  const [affiliationOpen, setAffiliationOpen] = useState(false);

  const userAffiliationDescriptor = useMemo(() => user?.id ? { userId: user.id } : null, [user?.id]);
  const { affiliations: userAffiliations } = useOrganizationAffiliations(userAffiliationDescriptor);
  const hasPublicAffiliation = userAffiliations.some((item) => item.status === 'accepted' && item.visibility === 'public');
  const removedAffiliations = useMemo(
    () => userAffiliations.filter((item) => item.status === 'removed'),
    [userAffiliations]
  );
  const orgDescriptor = useMemo(() => user?.id ? { organizationId: user.id } : null, [user?.id]);
  const { affiliations: orgAffiliations } = useOrganizationAffiliations(orgDescriptor);
  const affiliatedAccounts = useMemo(
    () => resolveAffiliatedProfiles(
      orgAffiliations.filter(r => r.status === 'accepted' && r.visibility === 'public'),
      allUsers
    ),
    [orgAffiliations, allUsers]
  );

  useEffect(() => {
    if (!user) return;
    const displayName = user.display_name || user.full_name || user.username;
    const handle = user.username ? `@${user.username}` : '';
    const followerCount = followers.length;
    const bio = user.bio ? user.bio.slice(0, 120) : '';
    const displayedVerification = getHighestVerificationBadge(user.verifications);
    const badges = displayedVerification ? [displayedVerification].map(v => v.charAt(0).toUpperCase() + v.slice(1)).join(', ') : '';

    const title = `${displayName} (${handle}) · EZA`;
    const desc = [
      `${displayName} ${handle} sur EZA.`,
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
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'auto' });
    }
  }, [username]);

  useEffect(() => {
    const loadUser = async () => {
      try {
        let me = null;
        try {
          me = await base44.auth.me();
          setCurrentUser(me);
        } catch {
          // Non authentifié
        }

        const userIdentifier = requestedUser;
        const response = await base44.functions.invoke('getPublicUsers', {});
        const fetchedUsers = response.data || response;
        const foundUser = fetchedUsers.find(u => {
          if (!userIdentifier) return false;
          const identifier = userIdentifier.toLowerCase();
          return u.username?.toLowerCase() === identifier
            || u.id === userIdentifier
            || u.email?.toLowerCase() === identifier;
        });

        if (!foundUser) {
          setNotFound(true);
          setLoading(false);
          return;
        }

        setUser(foundUser);
        prefillUserCache(fetchedUsers);
        setAllUsers(fetchedUsers);

        const [followersList, followingList, discussions, allPosts] = await Promise.all([
          base44.entities.Follow.filter({ following_email: foundUser.email }),
          base44.entities.Follow.filter({ follower_email: foundUser.email }),
          base44.entities.Discussion.filter({ author_id: foundUser.id }, '-created_date', 5).catch(() => []),
          base44.entities.Post.filter({ author_id: foundUser.id }, '-created_date', 50).catch(() => []),
        ]);
        setFollowers(followersList);
        setFollowingCount(followingList.length);
        setRecentDiscussions(discussions);
        setUserPosts(allPosts.filter(p => !p.reply_to_id));
        setUserReplies(allPosts.filter(p => !!p.reply_to_id));
        setUserMediaPosts(allPosts.filter(p => p.media_urls?.length > 0));

        if (me) {
          const isFollowingCheck = followersList.some(f => f.follower_email === me.email);
          setIsFollowing(isFollowingCheck);
        }

        const counts = { verified: 0, pro: 0, certified: 0, official: 0, supreme: 0 };
        fetchedUsers.forEach(u => {
          if (u.verifications?.includes('verified')) counts.verified++;
          if (u.verifications?.includes('pro')) counts.pro++;
          if (u.verifications?.includes('certified')) counts.certified++;
          if (u.verifications?.includes('official')) counts.official++;
          if (u.verifications?.includes('supreme')) counts.supreme++;
        });
        setBadgeCounts(counts);

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
    return <ProfileNotFound username={username} />;
  }

  const isClosed = user?.account_status === 'closed';
  const isSupreme = user?.verifications?.includes('supreme');
  const isPremiumProfile = isSupreme || user?.verifications?.includes('pro') || user?.verifications?.includes('certified');
  const roleCfg = ROLE_CONFIG[user?.role];
  const perkFx = getPerkEffects(user?.perks || {});

  const statusColors = {
    active: 'text-green-400 bg-green-400/10 border-green-400/30',
    suspended: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30',
    banned: 'text-red-400 bg-red-400/10 border-red-400/30',
    restricted: 'text-orange-400 bg-orange-400/10 border-orange-400/30',
  };

  const handleFollow = async () => {
    if (!currentUser) { navigate('/profile'); return; }
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
      notify({
        type: 'FOLLOW',
        sender: currentUser,
        receiverEmail: user.email,
        receiverId: user.id,
        link: `/@${currentUser.username || currentUser.email}`,
      });
    } catch {
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
    } catch {
      toast.error('Erreur lors de la suppression');
    } finally {
      setFollowingLoading(false);
    }
  };

  const handleMessage = () => {
    if (!currentUser) { navigate('/profile'); return; }
    navigate(`/messages?to=${encodeURIComponent(user.email)}&name=${encodeURIComponent(user.display_name || user.full_name)}`);
  };

  const memberSince = user?.created_date
    ? formatDistanceToNow(new Date(user.created_date), { addSuffix: true, locale: fr })
    : null;

  if (isClosed) {
    const closedByDirection = user.closed_by === 'direction';
    return (
      <div className="pt-16 min-h-screen pb-20 flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-sm w-full text-center space-y-6"
        >
          <div className="rounded-2xl overflow-hidden shadow-2xl">
            <div className="bg-red-600 py-10 px-8 flex flex-col items-center gap-2">
              <p className="font-grotesk font-black text-white text-3xl tracking-widest uppercase">Compte Fermé</p>
              <p className="font-inter text-red-100 text-base tracking-wider italic">Closed</p>
            </div>
          </div>
          <div className="rounded-2xl border border-border bg-card p-6 space-y-3">
            <div className="w-12 h-12 rounded-full bg-gray-400/10 border border-gray-400/20 flex items-center justify-center mx-auto">
              <span className="text-2xl">⛔</span>
            </div>
            <h2 className="font-grotesk font-bold text-xl">Ce compte a été fermé</h2>
            <p className="font-inter text-sm text-muted-foreground leading-relaxed">
              {closedByDirection
                ? 'Ce compte a été fermé par la Direction de Brenne Aerial.'
                : 'Ce compte a été fermé par un administrateur de Brenne Aerial.'}
            </p>
            {user.suspension_reason && (
              <p className="font-mono text-xs text-muted-foreground/60 italic">"{user.suspension_reason}"</p>
            )}
            <div className="pt-2 border-t border-border">
              <Link to="/" className="font-inter text-sm text-primary hover:underline">← Retour à l'accueil</Link>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      {/* Main profile content */}
      <div className="flex-1 min-w-0 pb-20 overflow-x-hidden" style={isSupreme ? { background: 'linear-gradient(180deg, #0d0800 0%, hsl(214 50% 4%) 25%)' } : {}}>
        {/* Fullscreen Cover Banner */}
        <div
          className="relative w-full h-44 sm:h-56 md:h-64 lg:h-72 xl:h-80 overflow-hidden"
          style={isSupreme
            ? { background: 'linear-gradient(135deg, #1a0c00, #2d1500, #1a0c00)', borderBottom: '2px solid #d97706', boxShadow: '0 0 30px rgba(245,158,11,0.2)' }
            : user.cover_url
            ? {}
            : { background: getCoverGradient(user.full_name) }
          }
        >
          {user.cover_url ? (
            <img src={user.cover_url} alt="cover" className="absolute inset-0 w-full h-full object-cover object-center" />
          ) : (
            <>
              <div className="absolute inset-0 opacity-20" style={{
                backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.15) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255,255,255,0.1) 0%, transparent 40%)',
              }} />
              <div className="absolute inset-0 grid-bg opacity-30" />
              <div className="absolute inset-0 flex items-center justify-center opacity-10">
                <span className="font-grotesk font-black text-[10rem] text-white select-none leading-none">
                  {user.full_name?.[0]?.toUpperCase() || '?'}
                </span>
              </div>
            </>
          )}
          <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-background to-transparent" />
        </div>

        <div className="w-full max-w-2xl mx-auto">
          <div className="relative px-4 -mt-16">
            <div className="flex items-end justify-between gap-4 mb-4">
              {/* Avatar */}
              <div
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl flex items-center justify-center overflow-hidden flex-shrink-0 relative z-10"
                style={isSupreme
                  ? { border: '3px solid #d97706', boxShadow: '0 0 0 2px rgba(245,158,11,0.2), 0 0 20px rgba(245,158,11,0.4)', background: '#1a0c00' }
                  : perkFx.accentRing
                    ? { border: `3px solid ${perkFx.accentRing}`, boxShadow: `0 0 0 2px ${perkFx.accentRing}33, 0 0 24px ${perkFx.accentRing}55`, background: user.avatar_url ? 'hsl(var(--secondary))' : getAvatarGradient(user.full_name) }
                    : { border: '4px solid hsl(var(--background))', background: user.avatar_url ? 'hsl(var(--secondary))' : getAvatarGradient(user.full_name) }
                }
              >
                {perkFx.hasParticles && <PerkParticles color={perkFx.particleColor || perkFx.accentRing || '#22d3ee'} />}
                {user.avatar_url ? (
                  <img src={user.avatar_url} alt="" className="w-full h-full object-cover relative z-[1]" />
                ) : (
                  <span className="font-grotesk font-bold text-4xl text-white drop-shadow-sm relative z-[1]">
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
            <h1 className="mb-1 flex flex-wrap items-center gap-1 font-grotesk text-2xl font-bold sm:text-3xl" style={isSupreme ? { background: 'linear-gradient(90deg,#f59e0b,#fde68a,#b45309)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' } : perkFx.hasAnimatedBadge ? { background: 'linear-gradient(110deg, hsl(var(--foreground)) 0%, #22d3ee 30%, hsl(var(--foreground)) 60%)', backgroundSize: '200% 100%', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', animation: 'shimmer 3s linear infinite' } : {}}>
              <button
                type="button"
                onClick={() => setAffiliationOpen(true)}
                className="cursor-pointer hover:underline focus-visible:outline-none"
              >
                {user.display_name || user.full_name}
              </button>
              <span className="inline-flex text-base">
                <VerificationIcons verifications={user.verifications} size="sm" user={user} onAffiliationOpen={() => setAffiliationOpen(true)} />
              </span>
            </h1>

            <div className="flex items-center gap-2 mb-3">
              {user.username && (
                <p className="font-mono text-sm text-muted-foreground">@{user.username}</p>
              )}
            </div>

            {/* Role chip */}
            {user.role && roleCfg && (
              <span className={`inline-flex items-center gap-1 mb-4 font-mono text-[10px] px-2.5 py-1 rounded-full border ${roleCfg.bg} ${roleCfg.color} ${roleCfg.border}`}>
                {roleCfg.emoji} {roleCfg.label}
              </span>
            )}

            {/* Badge animé personnalisé (perk custom_animated_badge) */}
            {perkFx.hasAnimatedBadge && perkFx.badgeText && (
              <div className="mb-3">
                <span
                  className="inline-flex items-center gap-1 font-grotesk font-bold text-xs px-3 py-1 rounded-full border"
                  style={{
                    borderColor: `${perkFx.accentRing || '#22d3ee'}40`,
                    background: `${perkFx.accentRing || '#22d3ee'}12`,
                    color: perkFx.accentRing || '#22d3ee',
                    backgroundImage: `linear-gradient(110deg, ${perkFx.accentRing || '#22d3ee'} 0%, #f0f0f0 50%, ${perkFx.accentRing || '#22d3ee'} 100%)`,
                    backgroundSize: '200% 100%',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    animation: 'shimmer 3s linear infinite',
                  }}
                >
                  <Sparkles className="w-3 h-3" style={{ WebkitTextFillColor: perkFx.accentRing || '#22d3ee' }} />
                  {perkFx.badgeText}
                </span>
              </div>
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

            {/* Verification principale */}
            {getHighestVerificationBadge(user.verifications) && (
              <div className="flex flex-wrap gap-2 mb-4">
                {(() => {
                  const badge = getHighestVerificationBadge(user.verifications);
                  const cfg = VERIFICATION_CONFIG[badge];
                  if (!cfg) return null;
                  const count = badgeCounts[badge] || 0;
                  return (
                    <span key={badge} className={`flex items-center gap-1.5 font-inter text-xs px-2.5 py-1 rounded-full border ${cfg.border} ${cfg.bg}`}>
                      <span className={cfg.color}>•</span>
                      <span className={cfg.color}>{cfg.label}</span>
                      <span className="text-muted-foreground">·</span>
                      <span className="text-muted-foreground font-mono text-[10px]">{count} {count <= 1 ? 'profil' : 'profils'}</span>
                    </span>
                  );
                })()}
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

            {/* Avantages boutique (perks actifs) */}
            <div className="mb-4 rounded-2xl border border-cyan-400/20 bg-cyan-400/[0.04] p-3.5">
              <div className="flex items-center gap-1.5 mb-3">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <h3 className="font-grotesk font-bold text-[11px] text-cyan-400 uppercase tracking-wider">Avantages boutique</h3>
                <span className="ml-auto font-mono text-[9px] text-muted-foreground/50">{getActivePerks(user?.perks || {}).length} actif{getActivePerks(user?.perks || {}).length > 1 ? 's' : ''}</span>
              </div>
              <PerkBadges perks={user?.perks || {}} size="md" />
            </div>

            {/* Mention : non-éligibilité aux badges */}
            {user.badges_eligible === false && (
              <div className="mb-4 rounded-2xl border border-red-500/30 bg-red-500/5 p-4 space-y-1.5">
                <div className="flex items-center gap-2">
                  <ShieldOff className="w-4 h-4 text-red-400" />
                  <p className="font-grotesk font-semibold text-sm text-red-400">Non-éligibilité aux badges</p>
                </div>
                <p className="font-inter text-xs text-muted-foreground leading-relaxed">
                  Ce profil a été marqué comme non-éligible à l'attribution de badges et vérifications par l'administration de eza.group.
                </p>
                {user.badge_ineligibility_reason && (
                  <p className="font-mono text-xs text-muted-foreground/70 italic">« {user.badge_ineligibility_reason} »</p>
                )}
              </div>
            )}

            {/* Mention : compte restreint */}
            {user.account_status === 'restricted' && (
              <div className="mb-4 rounded-2xl border border-amber-400/30 bg-amber-400/5 p-4 space-y-1.5">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-amber-400" />
                  <p className="font-grotesk font-semibold text-sm text-amber-400">Compte restreint</p>
                </div>
                <p className="font-inter text-xs text-muted-foreground leading-relaxed">
                  Ce compte fait l'objet d'une restriction administrative de eza.group. Certaines actions (publications, échanges, interactions) peuvent être temporairement limitées.
                </p>
              </div>
            )}

            {/* Suppressions (mention pénalisante) */}
            {removedAffiliations.length > 0 && (
              <div className="mb-4 rounded-2xl border border-red-500/30 bg-red-500/5 p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <Ban className="w-4 h-4 text-red-400" />
                  <p className="font-grotesk font-semibold text-sm text-red-400">
                    Suppression{removedAffiliations.length > 1 ? 's' : ''} d'affiliation
                  </p>
                </div>
                <p className="text-xs text-muted-foreground">
                  Ce compte présente {removedAffiliations.length} affiliation{removedAffiliations.length > 1 ? 's' : ''} supprimée{removedAffiliations.length > 1 ? 's' : ''} par les administrateurs.
                </p>
                <div className="space-y-2">
                  {removedAffiliations.map((r) => (
                    <div key={r.id} className="flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/5 p-2.5">
                      <div className="w-8 h-8 rounded-lg bg-red-500/10 overflow-hidden flex items-center justify-center flex-shrink-0">
                        {r.organizationAvatarUrl
                          ? <img src={r.organizationAvatarUrl} alt="" className="h-full w-full object-cover" />
                          : <span className="font-grotesk font-bold text-xs text-red-400">{(r.organizationName || 'O')[0]}</span>}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-inter text-sm font-medium truncate">{r.organizationName || 'Organisation'}</p>
                        {r.removalReason && (
                          <p className="font-inter text-xs text-muted-foreground italic mt-0.5">« {r.removalReason} »</p>
                        )}
                        <p className="font-mono text-[10px] text-muted-foreground mt-1">
                          Supprimée par les administrateurs{r.removedAt ? ` · ${formatDistanceToNow(new Date(r.removedAt), { addSuffix: true, locale: fr })}` : ''}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              <div className="rounded-2xl border border-border bg-card px-3 py-3.5 text-center hover-lift">
                <p className="font-grotesk font-black text-2xl text-foreground leading-none">{followers.length}</p>
                <p className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground/60 mt-2">Abonné{followers.length > 1 ? 's' : ''}</p>
              </div>
              <div className="rounded-2xl border border-border bg-card px-3 py-3.5 text-center hover-lift">
                <p className="font-grotesk font-black text-2xl text-foreground leading-none">{followingCount}</p>
                <p className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground/60 mt-2">Abonnements</p>
              </div>
              <div className="rounded-2xl border border-border bg-card px-3 py-3.5 text-center hover-lift">
                <p className="font-grotesk font-black text-2xl text-foreground leading-none">{userPosts.length}</p>
                <p className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground/60 mt-2">Post{userPosts.length > 1 ? 's' : ''}</p>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-2 mb-6 flex-wrap">
              {currentUser && currentUser.email === user.email ? (
                <Link to="/profile">
                  <Button variant="outline" className="gap-2 h-9 text-sm font-semibold rounded-full px-5">
                    <Settings className="w-4 h-4" /> Modifier le profil
                  </Button>
                </Link>
              ) : currentUser ? (
                <>
                  <Button onClick={handleMessage} variant="outline" className="gap-2 h-9 text-sm font-semibold rounded-full px-4">
                    <MessageCircle className="w-4 h-4" /> Message
                  </Button>
                  {!isFollowing ? (
                    <Button onClick={handleFollow} disabled={followingLoading} className="gap-2 h-9 text-sm font-semibold rounded-full px-5 bg-foreground text-background hover:bg-foreground/90">
                      {followingLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                      S'abonner
                    </Button>
                  ) : (
                    <Button onClick={handleUnfollow} disabled={followingLoading} className="gap-2 h-9 text-sm font-semibold rounded-full px-5 bg-destructive/10 hover:bg-destructive/20 text-destructive border border-destructive/30">
                      {followingLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserMinus className="w-4 h-4" />}
                      Abonné
                    </Button>
                  )}
                </>
              ) : (
                <Link to="/login">
                  <Button className="gap-2 h-9 text-sm font-semibold rounded-full px-5 bg-foreground text-background hover:bg-foreground/90">
                    <UserPlus className="w-4 h-4" /> S'abonner
                  </Button>
                </Link>
              )}
            </div>
          </div>

          {/* Pub intrusive */}
          <div className="px-4 py-3 border-b border-border/40"><AdSlot placement="feed_banner" /></div>

          {/* Profile Tabs — style X */}
          <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border/40 flex">
            {[
              { id: 'posts', label: 'Posts', count: userPosts.length },
              { id: 'highlights', label: 'À la une', count: userPosts.filter(p => p.is_highlight).length, premiumOnly: true },
              { id: 'replies', label: 'Réponses', count: userReplies.length },
              { id: 'medias', label: 'Médias', count: userMediaPosts.length },
            ].filter(t => !t.premiumOnly || isPremiumProfile).map(tab => (
              <button
                key={tab.id}
                onClick={() => setProfileTab(tab.id)}
                className={`flex-1 py-4 text-sm font-inter font-medium transition-all border-b-2 -mb-px ${
                  profileTab === tab.id
                    ? 'border-primary text-foreground font-bold'
                    : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-white/3'
                }`}
              >
                {tab.label}
                {tab.count > 0 && <span className="ml-1.5 font-mono text-xs opacity-60">{tab.count}</span>}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="min-h-[300px]">
            {(() => {
              let tabPosts = profileTab === 'posts' ? userPosts
                : profileTab === 'highlights' ? userPosts.filter(p => p.is_highlight)
                : profileTab === 'replies' ? userReplies : userMediaPosts;
              if (profileTab === 'posts' && tabPosts.length) {
                tabPosts = [...tabPosts].sort((a, b) => (b.is_pinned ? 1 : 0) - (a.is_pinned ? 1 : 0));
              }
              if (tabPosts.length === 0) {
                return (
                  <div className="py-16 text-center px-4">
                    <p className="font-grotesk font-bold text-lg text-muted-foreground">Aucun contenu</p>
                    <p className="font-inter text-sm text-muted-foreground/60 mt-1">
                      {profileTab === 'posts' ? 'Aucun post publié.' : profileTab === 'highlights' ? 'Aucun contenu à la une.' : profileTab === 'replies' ? 'Aucune réponse.' : 'Aucun média partagé.'}
                    </p>
                  </div>
                );
              }
              return tabPosts.map(post => (
                <PostCard key={post.id} post={post} currentUser={currentUser} />
              ));
            })()}
          </div>
        </div>
      </div>

      <AffiliationModal user={user} open={affiliationOpen} onOpenChange={setAffiliationOpen} />

      {/* Right sidebar — sticky, same as HomePage */}
      <div className="hidden xl:flex flex-col w-[300px] flex-shrink-0 sticky top-0 h-screen overflow-y-auto py-4 px-3" style={{ scrollbarWidth: 'none' }}>
        <HomeRightSidebar />
      </div>
    </div>
  );
}