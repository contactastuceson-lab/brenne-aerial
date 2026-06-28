import { useState, useEffect } from 'react';
import ProfileNotFound from '@/components/profile/ProfileNotFound';
import { useParams, Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { MapPin, Globe, CheckCircle, MessageCircle, UserPlus, MessageSquare, Calendar, Hash } from 'lucide-react';
import VerificationIcons from '@/components/ui/VerificationIcon';
import BadgeChip from '@/components/ui/BadgeChip';
import { ROLE_CONFIG } from '@/lib/roles';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

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
  
  // Extraire le username (enlever le @ s'il existe)
  const username = pathUsername?.startsWith('@') ? pathUsername.slice(1) : pathUsername;
  const [user, setUser] = useState(null);
  const [followers, setFollowers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [_isFollowing, _setIsFollowing] = useState(false);
  const [_followingLoading, _setFollowingLoading] = useState(false);
  const [recentDiscussions, setRecentDiscussions] = useState([]);
  const [followingCount, setFollowingCount] = useState(0);
  const [_badgeCounts, _setBadgeCounts] = useState({});

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

        const isFollowingCheck = followersList.some(f => f.follower_email === foundUser.email);
        setIsFollowing(isFollowingCheck);

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
    return <ProfileNotFound username={username} />;
  }

  const isClosed = user?.account_status === 'closed';
  const isSupreme = user?.verifications?.includes('supreme');
  const roleCfg = ROLE_CONFIG[user?.role];

  const statusColors = {
    active: 'text-green-400 bg-green-400/10 border-green-400/30',
    suspended: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30',
    banned: 'text-red-400 bg-red-400/10 border-red-400/30',
    restricted: 'text-orange-400 bg-orange-400/10 border-orange-400/30',
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
          {/* Red closed banner */}
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

  const publicWebsites = [user.website, user.website_2, user.website_3, user.website_4].filter(Boolean);

  const publicActions = [
    {
      label: 'Suivre ce profil',
      icon: UserPlus,
      description: 'Recevez ses actualités directement dans votre fil.',
    },
    {
      label: 'Envoyer un message',
      icon: MessageCircle,
      description: 'Contactez-le pour une demande, une collaboration ou une question.',
    },
    ...publicWebsites[0] ? [{
      label: 'Voir le site',
      icon: Globe,
      description: 'Accédez à son site web ou portfolio externe.',
      href: publicWebsites[0],
    }] : [],
  ];

  const followReasons = [
    'Découvrir ses projets et réalisations.',
    'Suivre son actualité et ses publications.',
    'Voir ses badges de confiance et sa légitimité.',
  ];

  return (
    <div className="pt-16 min-h-screen pb-20" style={isSupreme ? { background: 'linear-gradient(180deg, #0d0800 0%, hsl(214 50% 4%) 25%)' } : {}}>
      <div className="max-w-7xl mx-auto px-5 grid gap-8 xl:grid-cols-[minmax(0,1.55fr)_minmax(0,0.95fr)]">
        <div className="space-y-6">
          <div className="rounded-3xl border border-border bg-secondary/30 p-5 shadow-sm">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.26em] text-muted-foreground">Profil public</p>
                <h2 className="mt-2 text-2xl font-grotesk font-bold text-foreground">Un espace social et professionnel visible par tous</h2>
                <p className="mt-3 text-sm text-muted-foreground max-w-2xl">
                  Ce profil sert à découvrir qui vous êtes, vérifier votre légitimité et lancer une interaction : follow, message, visite de site ou discussion.
                </p>
              </div>
              <span className="inline-flex items-center justify-center rounded-full border border-primary/30 bg-primary/10 px-3 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-primary">
                Réseau social
              </span>
            </div>
          </div>

          <div className="rounded-3xl border border-border bg-background shadow-sm overflow-hidden">
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
              <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-background to-transparent" />
            </div>

            <div className="relative px-5 -mt-12 pb-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between mb-4">
                <div className="flex items-center gap-4">
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
                  <div>
                    <p className="text-sm uppercase tracking-[0.24em] text-muted-foreground">{user.role ? roleCfg?.label || 'Membre' : 'Membre'}</p>
                    <h1 className="mt-2 text-3xl font-grotesk font-bold text-foreground">{user.display_name || user.full_name}</h1>
                    {user.username && (
                      <div className="flex flex-wrap items-center gap-2 mt-2">
                        <span className="font-mono text-sm text-muted-foreground whitespace-nowrap">@{user.username}</span>
                        <VerificationIcons verifications={user.verifications} size="md" user={user} />
                        <span className="flex flex-wrap items-center gap-2">
                          {user.badges?.slice(0, 3).map(badge => (
                            <BadgeChip key={badge} badge={badge} size="sm" />
                          ))}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
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

              {user.bio && (
                <p className="font-inter text-sm text-foreground/80 leading-relaxed mb-4 whitespace-pre-line">
                  {user.bio}
                </p>
              )}

              <div className="flex flex-wrap gap-3 mb-5">
                {user.location && (
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <MapPin className="w-3.5 h-3.5" /> {user.location}
                  </div>
                )}
                {publicWebsites.length > 0 && (
                  <div className="space-y-2">
                    {publicWebsites.map((site, _index) => (
                      <div key={site} className="flex items-center gap-1.5">
                        <Globe className="w-3.5 h-3.5 text-primary" />
                        <a href={site} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline truncate max-w-[200px]">
                          {site.replace(/^https?:\/\//, '')}
                        </a>
                      </div>
                    ))}
                  </div>
                )}
                {memberSince && (
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Calendar className="w-3.5 h-3.5" /> Membre {memberSince}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                <div className="rounded-3xl border border-border bg-secondary/20 p-4">
                  <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Ce profil permet</p>
                  <p className="mt-2 text-sm text-foreground leading-relaxed">Voir qui est cette personne, vérifier sa crédibilité, suivre ses actualités et la contacter facilement.</p>
                </div>
                <div className="rounded-3xl border border-border bg-secondary/20 p-4">
                  <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Utilité directe</p>
                  <ul className="mt-2 space-y-2 text-sm text-foreground">
                    <li className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-primary" /> Découvrir un profil professionnel</li>
                    <li className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-primary" /> Évaluer sa notoriété et ses badges</li>
                    <li className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-primary" /> Contacter ou suivre en un clic</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-border bg-background shadow-sm p-5">
            <h2 className="font-grotesk font-semibold text-base mb-4">Ce que vous pouvez faire ici</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {publicActions.map(action => (
                <div key={action.label} className="rounded-3xl border border-border bg-secondary/30 p-4">
                  <div className="flex items-center gap-3 mb-2 text-sm font-semibold text-foreground">
                    <action.icon className="w-4 h-4 text-primary" />
                    {action.label}
                  </div>
                  <p className="text-sm text-muted-foreground">{action.description}</p>
                  {action.href && (
                    <a href={action.href} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex text-sm font-semibold text-primary hover:underline">
                      Voir le site
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>

          {recentDiscussions.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-3xl border border-border bg-background shadow-sm p-5">
              <h2 className="font-grotesk font-semibold text-base mb-4 flex items-center gap-2"><MessageSquare className="w-4 h-4 text-primary" /> Discussions récentes</h2>
              <div className="space-y-2">
                {recentDiscussions.map(d => (
                  <Link
                    key={d.id}
                    to={`/forum/${d.id}`}
                    className="block p-3 bg-secondary/40 hover:bg-secondary/70 border border-border rounded-xl transition-colors group"
                  >
                    <p className="font-inter text-sm font-medium text-foreground group-hover:text-primary transition-colors line-clamp-1">{d.title}</p>
                    <div className="flex flex-wrap items-center gap-3 mt-1.5">
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

        <aside className="space-y-6">
          <div className="sticky top-24 space-y-4">
            <div className="rounded-3xl border border-border bg-secondary/30 p-5">
              <h3 className="text-sm font-semibold text-foreground mb-3">Résumé rapide</h3>
              <div className="grid gap-3">
                <div className="rounded-3xl border border-border bg-background p-4">
                  <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Audience</p>
                  <p className="mt-2 text-2xl font-grotesk font-bold text-foreground">{followers.length}</p>
                  <p className="text-xs text-muted-foreground">Abonné{followers.length > 1 ? 's' : ''}</p>
                </div>
                <div className="rounded-3xl border border-border bg-background p-4">
                  <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Contacts</p>
                  <p className="mt-2 text-2xl font-grotesk font-bold text-foreground">{followingCount}</p>
                  <p className="text-xs text-muted-foreground">Abonnements</p>
                </div>
                <div className="rounded-3xl border border-border bg-background p-4">
                  <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Échanges</p>
                  <p className="mt-2 text-2xl font-grotesk font-bold text-foreground">{recentDiscussions.length}</p>
                  <p className="text-xs text-muted-foreground">Discussions récentes</p>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-border bg-background p-5">
              <h3 className="text-sm font-semibold text-foreground mb-3">Pourquoi suivre</h3>
              <ul className="space-y-3 text-sm text-muted-foreground">
                {followReasons.map(reason => (
                  <li key={reason} className="flex items-start gap-2">
                    <span className="mt-1 h-2.5 w-2.5 rounded-full bg-primary" />
                    <span>{reason}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-3xl border border-border bg-secondary/30 p-5">
              <h3 className="text-sm font-semibold text-foreground mb-3">Aide rapide</h3>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>Ce profil public sert à :</p>
                <ul className="list-disc pl-4 space-y-1">
                  <li>Voir son identité et son activité</li>
                  <li>Suivre ses publications</li>
                  <li>Entamer un contact direct</li>
                  <li>Vérifier sa crédibilité et ses badges</li>
                </ul>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}