import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  UserPlus, UserCheck, Search, MessageCircle, Users,
  CheckCircle, Star, Award, Zap, Shield, Flag, MapPin, Briefcase, Grid3x3, List
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import VerificationIcons from '@/components/ui/VerificationIcon';
import BadgePopup from '@/components/ui/BadgePopup';
import { Link, useNavigate } from 'react-router-dom';
import ReportModal from '@/components/shared/ReportModal';
import FeatureDisabled from '@/components/shared/FeatureDisabled';
import EmployeeProfileModal from '@/components/admin/EmployeeProfileModal';
import UserProfileModal from '@/components/shared/UserProfileModal';
import { POLES } from '@/lib/employeeRoles';

function getConversationId(emailA, emailB) {
  return [emailA, emailB].sort().join('_');
}

// Génère un dégradé unique et cohérent basé sur le nom
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

const BADGE_CONFIG = {
  'Fondateur':      { icon: Star,         color: 'text-yellow-400', bg: 'bg-yellow-400/10', border: 'border-yellow-400/30' },
  'Collaborateur':  { icon: UserCheck,    color: 'text-blue-400',   bg: 'bg-blue-400/10',   border: 'border-blue-400/30' },
  'VIP':            { icon: Award,        color: 'text-purple-400', bg: 'bg-purple-400/10', border: 'border-purple-400/30' },
  'Admin':          { icon: Shield,       color: 'text-red-400',    bg: 'bg-red-400/10',    border: 'border-red-400/30' },
  'Pilote':         { icon: Zap,          color: 'text-primary',    bg: 'bg-primary/10',    border: 'border-primary/30' },
  'Officiel':       { icon: CheckCircle,  color: 'text-accent',     bg: 'bg-accent/10',     border: 'border-accent/30' },
  'Vérifié':        { icon: CheckCircle,  color: 'text-green-400',  bg: 'bg-green-400/10',  border: 'border-green-400/30' },
  'Beta Testeur':   { icon: Zap,          color: 'text-pink-400',   bg: 'bg-pink-400/10',   border: 'border-pink-400/30' },
  'Partenaire':     { icon: Award,        color: 'text-orange-400', bg: 'bg-orange-400/10', border: 'border-orange-400/30' },
};

function formatFollowers(count) {
  if (count === 1) return '1 abonné';
  if (count < 1000) return `${count} abonnés`;
  return `${(count / 1000).toFixed(1)}k abonnés`;
}

export default function DiscoverPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [search, setSearch] = useState('');
  const [reportTarget, setReportTarget] = useState(null);
  const [activeTab, setActiveTab] = useState('members');
  const [filterPole, setFilterPole] = useState('all');
  const [viewEmployee, setViewEmployee] = useState(null);
  const [membersViewMode, setMembersViewMode] = useState('list');
  const [sortBy, setSortBy] = useState('recent');
  const queryClient = useQueryClient();

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => base44.auth.redirectToLogin('/discover'));
  }, []);


  const { data: settings = [] } = useQuery({
    queryKey: ['app-settings'],
    queryFn: () => base44.entities.AppSettings.list(),
    enabled: !!user,
  });

  const settingsMap = Object.fromEntries(settings.map(s => [s.key, s.value]));
  const discoverEnabled = settingsMap['page_discover_enabled'] !== 'false' && settingsMap['discover_enabled'] !== 'false';

  const { data: allUsers = [] } = useQuery({
    queryKey: ['all-users'],
    queryFn: async () => {
      const res = await base44.functions.invoke('getPublicUsers', {});
      return Array.isArray(res.data) ? res.data : res.data.users || [];
    },
    enabled: !!user,
  });

  // Single subscription: refresh all-users list + update own user if it changed
  useEffect(() => {
    const unsub = base44.entities.User.subscribe(evt => {
      if (evt.type === 'update') {
        queryClient.invalidateQueries({ queryKey: ['all-users'] });
        if (user?.email && evt.data?.email === user.email) {
          setUser(evt.data);
        }
      }
    });
    return () => unsub();
  }, [queryClient, user?.email]);

  const { data: follows = [] } = useQuery({
    queryKey: ['my-follows', user?.email],
    queryFn: () => base44.entities.Follow.filter({ follower_email: user.email }),
    enabled: !!user?.email,
  });

  const { data: myRequests = [] } = useQuery({
    queryKey: ['my-chat-requests', user?.email],
    queryFn: () => base44.entities.ChatMessage.filter({ sender_email: user.email, is_request: true }),
    enabled: !!user?.email,
  });

  const { data: allFollows = [] } = useQuery({
    queryKey: ['all-follows'],
    queryFn: () => base44.entities.Follow.list(),
    enabled: !!user,
  });

  const { data: employees = [] } = useQuery({
    queryKey: ['public-employees'],
    queryFn: () => base44.entities.Employee.filter({ is_public: true }),
    enabled: !!user,
  });

  const followMutation = useMutation({
    mutationFn: async (targetUser) => {
      await base44.entities.Follow.create({
        follower_email: user.email,
        follower_name: user.full_name,
        follower_avatar: user.avatar_url || '',
        following_email: targetUser.email,
        following_name: targetUser.full_name,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-follows'] });
      toast.success('Vous suivez maintenant cette personne');
    },
  });

  const unfollowMutation = useMutation({
    mutationFn: async (followId) => {
      await base44.entities.Follow.delete(followId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-follows'] });
      toast.success('Abonnement annulé');
    },
  });

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!discoverEnabled) {
    return <FeatureDisabled title="Découverte désactivée" message="La page de découverte des membres est temporairement désactivée." />;
  }

  const followingEmails = new Set(follows.map(f => f.following_email));
  const requestedEmails = new Set(myRequests.map(r => r.recipient_email));
  
  // Helper function to count followers for a user
  const getFollowersCount = (email) => {
    return allFollows.filter(f => f.following_email === email).length;
  };

  const filtered = allUsers
    .filter(u => u.email !== user.email)
    .filter(u =>
      !search ||
      u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'popular') {
        return getFollowersCount(b.email) - getFollowersCount(a.email);
      } else if (sortBy === 'verified') {
        const aVerified = a.verifications?.includes('supreme') ? 0 : 1;
        const bVerified = b.verifications?.includes('supreme') ? 0 : 1;
        return aVerified - bVerified;
      } else if (sortBy === 'premium') {
        const aSupreme = a.verifications?.includes('supreme') ? 0 : 1;
        const bSupreme = b.verifications?.includes('supreme') ? 0 : 1;
        return aSupreme - bSupreme;
      }
      return 0;
    });

  const filteredEmployees = employees
    .filter(e => filterPole === 'all' || e.pole === filterPole)
    .filter(e => !search || e.full_name?.toLowerCase().includes(search.toLowerCase()) || e.job_title?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="pt-24 min-h-screen px-5 lg:px-10 pb-20">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center">
              <Users className="w-4 h-4 text-primary" />
            </div>
            <h1 className="font-grotesk font-bold text-2xl gradient-text">Découvrir</h1>
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-secondary/50 rounded-xl p-1 w-fit">
          <button
            onClick={() => setActiveTab('members')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-inter text-sm font-medium transition-all ${activeTab === 'members' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
          >
            <Users className="w-4 h-4" /> Membres <span className="font-mono text-xs text-muted-foreground">({filtered.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('team')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-inter text-sm font-medium transition-all ${activeTab === 'team' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
          >
            <Briefcase className="w-4 h-4" /> Équipe <span className="font-mono text-xs text-muted-foreground">({employees.length})</span>
          </button>
        </div>

        {/* Search & View Mode */}
         <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-6">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder={activeTab === 'team' ? 'Rechercher dans l\'équipe...' : 'Rechercher un profil...'}
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-10 bg-card border-border font-inter"
              />
            </div>
            {activeTab === 'members' && (
              <div className="flex gap-2">
                <select
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value)}
                  className="px-3 py-2 rounded-lg bg-card border border-border text-sm font-inter text-foreground"
                >
                  <option value="recent">Plus récents</option>
                  <option value="popular">Plus populaires</option>
                  <option value="verified">Vérifiés</option>
                  <option value="premium">Premium</option>
                </select>
                <div className="flex gap-1 bg-secondary/50 rounded-lg p-1">
                  <button
                    onClick={() => setMembersViewMode('grid')}
                    className={`p-2 rounded transition-colors ${membersViewMode === 'grid' ? 'bg-card text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                    title="Mode Grille"
                  >
                    <Grid3x3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setMembersViewMode('list')}
                    className={`p-2 rounded transition-colors ${membersViewMode === 'list' ? 'bg-card text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                    title="Mode Liste"
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* Team tab - pole filters (scroll horizontal) */}
        {activeTab === 'team' && (
          <div className="flex gap-2 mb-4 overflow-x-auto pb-1 scrollbar-none" style={{ scrollbarWidth: 'none' }}>
            <button onClick={() => setFilterPole('all')} className={`flex-shrink-0 px-3 py-1 rounded-full font-inter text-xs border transition-all ${filterPole === 'all' ? 'bg-primary text-primary-foreground border-primary' : 'border-border text-muted-foreground hover:text-foreground'}`}>
              Tous
            </button>
            {Object.entries(POLES).map(([k, v]) => (
              <button key={k} onClick={() => setFilterPole(filterPole === k ? 'all' : k)}
                className={`flex-shrink-0 px-3 py-1 rounded-full font-inter text-xs border transition-all flex items-center gap-1 ${filterPole === k ? `${v.bg} ${v.color} ${v.border}` : 'border-border text-muted-foreground hover:text-foreground'}`}>
                {v.emoji} <span className="hidden sm:inline">{v.label}</span>
              </button>
            ))}
          </div>
        )}

        {/* Grid */}
        {activeTab === 'team' ? (
          <div className="space-y-2">
            <AnimatePresence>
              {filteredEmployees.map((emp, i) => {
                const pole = POLES[emp.pole];
                return (
                  <motion.div
                    key={emp.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    transition={{ delay: i * 0.03 }}
                    className="flex items-center gap-3 bg-card border border-border rounded-xl px-3 py-3 cursor-pointer hover:border-primary/30 transition-colors"
                    onClick={() => setViewEmployee(emp)}
                  >
                    {/* Avatar */}
                    <div className="w-11 h-11 rounded-xl border border-border bg-secondary flex items-center justify-center overflow-hidden flex-shrink-0">
                      {emp.avatar_url
                        ? <img src={emp.avatar_url} alt="" className="w-full h-full object-cover" />
                        : <span className="font-grotesk font-bold text-base text-primary">{emp.full_name?.[0]}</span>
                      }
                    </div>
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="font-grotesk font-semibold text-sm truncate">{emp.full_name}</p>
                      <p className="font-inter text-xs text-primary truncate">{emp.job_title}</p>
                      <div className="flex items-center gap-3 mt-0.5">
                        {emp.location && (
                          <p className="font-inter text-[10px] text-muted-foreground flex items-center gap-1">
                            <MapPin className="w-2.5 h-2.5 flex-shrink-0" /> {emp.location}
                          </p>
                        )}
                        <p className="font-inter text-[10px] text-muted-foreground flex items-center gap-1">
                          <Users className="w-2.5 h-2.5 flex-shrink-0" /> {getFollowersCount(emp.email || emp.user_email)} abonné{getFollowersCount(emp.email || emp.user_email) > 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                    {/* Pole badge */}
                    {pole && (
                      <div className={`flex-shrink-0 flex items-center gap-1 px-2 py-1 rounded-full font-mono text-[9px] border ${pole.bg} ${pole.color} ${pole.border}`}>
                        <span>{pole.emoji}</span>
                        <span className="hidden sm:inline">{pole.label}</span>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>
            {filteredEmployees.length === 0 && (
              <div className="text-center py-12 text-muted-foreground font-inter text-sm">Aucun membre d'équipe trouvé</div>
            )}
          </div>
        ) : membersViewMode === 'list' ? (
        <div className="overflow-hidden rounded-3xl border border-border bg-secondary/40">
          <AnimatePresence>
            {filtered.map((profile, i) => {
              const isFollowing = followingEmails.has(profile.email);
              const followRecord = follows.find(f => f.following_email === profile.email);
              const alreadyRequested = requestedEmails.has(profile.email);
              const isSupreme = profile.verifications?.includes('supreme');

              return (
                <motion.div
                  key={profile.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ delay: i * 0.02 }}
                  className="flex flex-col sm:flex-row items-start sm:items-center gap-3 px-4 py-4 border-b border-border last:border-b-0 transition-colors cursor-pointer group hover:bg-secondary/60"
                  onClick={() => navigate(`/@${profile.username}`)}
                >
                  {/* Avatar */}
                  <div
                    className="w-12 h-12 flex-shrink-0 rounded-lg flex items-center justify-center overflow-hidden border-2"
                    style={isSupreme
                      ? { border: '2px solid #d97706', boxShadow: '0 0 12px rgba(245,158,11,0.5)', background: '#1a0e00' }
                      : { borderColor: 'var(--border)', background: profile.avatar_url ? 'var(--secondary)' : getAvatarGradient(profile.full_name) }
                    }
                  >
                    {profile.avatar_url ? (
                      <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span className="font-grotesk font-bold text-base text-white drop-shadow-sm">
                        {(profile.display_name || profile.full_name)?.[0]?.toUpperCase() || '?'}
                      </span>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <h3
                        className="font-grotesk font-semibold text-sm truncate"
                        style={isSupreme ? { background: 'linear-gradient(90deg,#f59e0b,#fde68a,#d97706)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' } : {}}
                      >
                        {profile.display_name || profile.full_name}
                      </h3>
                      {isSupreme && (
                        <span style={{ fontSize: '11px' }}>👑</span>
                      )}
                      <VerificationIcons verifications={profile.verifications} size="sm" user={profile} />
                    </div>
                    <div className="flex flex-wrap items-center gap-1 text-xs text-muted-foreground">
                      {profile.username && (
                        <p className="font-mono truncate">@{profile.username}</p>
                      )}
                      {profile.location && (
                        <>
                          <span>•</span>
                          <p className="flex items-center gap-0.5 truncate">
                            <MapPin className="w-2.5 h-2.5" /> {profile.location}
                          </p>
                        </>
                      )}
                    </div>
                    {profile.bio && (
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{profile.bio}</p>
                    )}
                    <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                      <Users className="w-2.5 h-2.5" />
                      {formatFollowers(getFollowersCount(profile.email))}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap justify-end items-center gap-2 w-full sm:w-auto" onClick={e => e.stopPropagation()}>
                    {isFollowing ? (
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs font-inter gap-1 h-8 px-3"
                        style={isSupreme ? { borderColor: 'rgba(217,119,6,0.4)', color: '#d97706' } : {}}
                        onClick={() => unfollowMutation.mutate(followRecord.id)}
                        disabled={unfollowMutation.isPending}
                      >
                        <UserCheck className="w-3 h-3" />
                        Suivi
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        className="text-xs font-inter gap-1 h-8 px-3"
                        style={isSupreme
                          ? { background: 'rgba(217,119,6,0.15)', color: '#f59e0b', border: '1px solid rgba(217,119,6,0.35)' }
                          : { background: 'rgba(56,170,220,0.1)', color: 'hsl(var(--primary))', border: '1px solid rgba(56,170,220,0.2)' }
                        }
                        onClick={() => followMutation.mutate(profile)}
                        disabled={followMutation.isPending}
                      >
                        <UserPlus className="w-3 h-3" />
                        Suivre
                      </Button>
                    )}

                    {alreadyRequested ? (
                      <Button size="sm" variant="outline" className="text-xs border-border font-inter gap-1 h-8 px-3 opacity-70" disabled>
                        <MessageCircle className="w-3 h-3" />
                        Envoyé
                      </Button>
                    ) : (
                      <Link to={`/messages?to=${profile.email}&name=${encodeURIComponent(profile.full_name)}`} className="w-full sm:w-auto">
                        <Button
                          size="sm"
                          className="w-full sm:w-auto text-xs font-inter gap-1 h-8 px-3"
                          style={isSupreme
                            ? { background: 'rgba(217,119,6,0.15)', color: '#f59e0b', border: '1px solid rgba(217,119,6,0.35)' }
                            : { background: 'rgba(56,200,180,0.1)', color: 'hsl(var(--accent))', border: '1px solid rgba(56,200,180,0.2)' }
                          }
                        >
                          <MessageCircle className="w-3 h-3" />
                          Contacter
                        </Button>
                      </Link>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
          {filtered.length === 0 && (
            <div className="text-center py-20 text-muted-foreground font-inter text-sm">
              Aucun profil trouvé
            </div>
          )}
        </div>
        ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {filtered.map((profile, i) => {
              const isFollowing = followingEmails.has(profile.email);
              const followRecord = follows.find(f => f.following_email === profile.email);
              const alreadyRequested = requestedEmails.has(profile.email);

              const isSupreme = profile.verifications?.includes('supreme');

              return (
                <motion.div
                  key={profile.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: i * 0.04 }}
                  onClick={() => navigate(`/@${profile.username}`)}
                  className={`group relative rounded-2xl overflow-hidden hover-lift cursor-pointer ${isSupreme ? 'border-2' : 'border border-border bg-card'}`}
                  style={isSupreme ? {
                    background: 'linear-gradient(145deg, #0d0800, #1a0e00, #0d0800)',
                    borderColor: '#d97706',
                    boxShadow: '0 0 0 1px rgba(245,158,11,0.15), 0 0 30px rgba(245,158,11,0.2), 0 0 80px rgba(245,158,11,0.07)',
                  } : {}}
                >
                  {isSupreme && (
                    <div className="absolute inset-0 rounded-2xl pointer-events-none z-0" style={{ background: 'linear-gradient(145deg, rgba(245,158,11,0.06) 0%, transparent 40%, rgba(245,158,11,0.04) 100%)' }} />
                  )}
                  {isSupreme && (
                    <div className="absolute top-2 left-2 z-10 flex items-center gap-1 px-2 py-0.5 rounded-full" style={{ background: 'linear-gradient(135deg, #92400e, #d97706)', boxShadow: '0 2px 8px rgba(245,158,11,0.4)' }}>
                      <span style={{ fontSize: '10px' }}>👑</span>
                      <span className="font-mono text-[9px] font-bold text-yellow-100 uppercase tracking-widest">Suprême</span>
                    </div>
                  )}

                  {/* Cover */}
                  <div className="h-24 relative overflow-hidden">
                    {profile.cover_url
                      ? <img src={profile.cover_url} alt="" className="w-full h-full object-cover" />
                      : (
                        <div className="w-full h-full relative" style={{ background: getCoverGradient(profile.full_name) }}>
                          {/* Pattern overlay */}
                          <div className="absolute inset-0 opacity-20" style={{
                            backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.15) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255,255,255,0.1) 0%, transparent 40%)',
                          }} />
                          <div className="absolute inset-0 grid-bg opacity-30" />
                          {/* Initials watermark */}
                          <div className="absolute inset-0 flex items-center justify-end pr-4 opacity-10">
                            <span className="font-grotesk font-black text-6xl text-white select-none">
                              {(profile.display_name || profile.full_name)?.[0]?.toUpperCase() || '?'}
                            </span>
                          </div>
                        </div>
                      )
                    }
                    {/* Report button */}
                    <button
                      onClick={e => { e.stopPropagation(); setReportTarget(profile); }}
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity w-6 h-6 rounded-full bg-background/70 backdrop-blur-sm flex items-center justify-center hover:bg-background"
                    >
                      <Flag className="w-3 h-3 text-muted-foreground" />
                    </button>
                  </div>

                  {/* Avatar */}
                  <div className="px-4 -mt-8 pb-4">
                    <div className="relative w-14 h-14 mb-3">
                      <div
                        className="w-14 h-14 rounded-2xl flex items-center justify-center overflow-hidden"
                        style={isSupreme
                          ? { border: '2px solid #d97706', boxShadow: '0 0 12px rgba(245,158,11,0.5)', background: '#1a0e00' }
                          : { border: '2px solid var(--background)', background: profile.avatar_url ? 'var(--secondary)' : getAvatarGradient(profile.full_name) }
                        }
                      >
                        {profile.avatar_url ? (
                          <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <span className="font-grotesk font-bold text-xl text-white drop-shadow-sm">
                            {(profile.display_name || profile.full_name)?.[0]?.toUpperCase() || '?'}
                          </span>
                        )}
                      </div>
                      {profile.last_seen && (Date.now() - new Date(profile.last_seen).getTime()) < 2 * 60 * 1000 && (
                        <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-background" />
                      )}
                    </div>

                    <div className="flex items-center gap-1 mb-0.5">
                       <h3
                         className="font-grotesk font-semibold text-sm truncate"
                         style={isSupreme ? { background: 'linear-gradient(90deg,#f59e0b,#fde68a,#d97706)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' } : {}}
                       >{profile.display_name || profile.full_name}</h3>
                       <VerificationIcons verifications={profile.verifications} user={profile} />
                     </div>
                     {profile.username && (
                       <p className="font-mono text-xs text-muted-foreground mb-2">@{profile.username}</p>
                     )}
                    <div className="flex flex-col gap-1 mb-2">
                      {profile.location && (
                        <p className="font-inter text-[10px] text-muted-foreground flex items-center gap-1">
                          <MapPin className="w-2.5 h-2.5" /> {profile.location}
                        </p>
                      )}
                      <p className="font-inter text-[10px] text-muted-foreground flex items-center gap-1">
                        <Users className="w-2.5 h-2.5" /> {getFollowersCount(profile.email)} abonné{getFollowersCount(profile.email) > 1 ? 's' : ''}
                      </p>
                    </div>

                    {profile.role && (
                      <span className="inline-block font-mono text-[9px] text-primary/80 bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-full mb-2 capitalize">
                        {profile.role}
                      </span>
                    )}

                    {/* Bio */}
                    {profile.bio && (
                      <p className="font-inter text-[11px] text-muted-foreground mb-2 line-clamp-2">{profile.bio}</p>
                    )}

                    {/* Badges */}
                    {profile.badges?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {profile.badges.slice(0, 3).map(b => {
                          const cfg = BADGE_CONFIG[b];
                          if (!cfg) return (
                            <BadgePopup key={b} badgeKey={b}>
                              <span className="font-mono text-[9px] bg-secondary border border-border px-2 py-0.5 rounded-full cursor-pointer">{b}</span>
                            </BadgePopup>
                          );
                          const Icon = cfg.icon;
                          return (
                            <BadgePopup key={b} badgeKey={b}>
                              <span className={`flex items-center gap-1 font-inter text-[9px] px-2 py-0.5 rounded-full border cursor-pointer ${cfg.color} ${cfg.bg} ${cfg.border}`}>
                                <Icon className="w-2.5 h-2.5" /> {b}
                              </span>
                            </BadgePopup>
                          );
                        })}
                        {profile.badges.length > 3 && (
                          <span className="font-mono text-[9px] text-muted-foreground bg-secondary border border-border px-2 py-0.5 rounded-full">+{profile.badges.length - 3}</span>
                        )}
                      </div>
                    )}

                    <div className="flex gap-2 mt-1">
                      {isFollowing ? (
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1 text-xs font-inter gap-1.5 h-8"
                          style={isSupreme ? { borderColor: 'rgba(217,119,6,0.4)', color: '#d97706' } : {}}
                          onClick={() => unfollowMutation.mutate(followRecord.id)}
                          disabled={unfollowMutation.isPending}
                        >
                          <UserCheck className="w-3 h-3" />
                          Suivi
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          className="flex-1 text-xs font-inter gap-1.5 h-8"
                          style={isSupreme
                            ? { background: 'rgba(217,119,6,0.15)', color: '#f59e0b', border: '1px solid rgba(217,119,6,0.35)' }
                            : { background: 'rgba(56,170,220,0.1)', color: 'hsl(var(--primary))', border: '1px solid rgba(56,170,220,0.2)' }
                          }
                          onClick={() => followMutation.mutate(profile)}
                          disabled={followMutation.isPending}
                        >
                          <UserPlus className="w-3 h-3" />
                          Suivre
                        </Button>
                      )}

                      {alreadyRequested ? (
                        <Button size="sm" variant="outline" className="flex-1 text-xs border-border font-inter gap-1.5 h-8 opacity-60" disabled>
                          <MessageCircle className="w-3 h-3" />
                          Envoyé
                        </Button>
                      ) : (
                        <Link to={`/messages?to=${profile.email}&name=${encodeURIComponent(profile.full_name)}`} className="flex-1">
                          <Button
                            size="sm"
                            className="w-full text-xs font-inter gap-1.5 h-8"
                            style={isSupreme
                              ? { background: 'rgba(217,119,6,0.15)', color: '#f59e0b', border: '1px solid rgba(217,119,6,0.35)' }
                              : { background: 'rgba(56,200,180,0.1)', color: 'hsl(var(--accent))', border: '1px solid rgba(56,200,180,0.2)' }
                            }
                          >
                            <MessageCircle className="w-3 h-3" />
                            Contacter
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
          {filtered.length === 0 && (
            <div className="text-center py-20 text-muted-foreground font-inter text-sm">
              Aucun profil trouvé
            </div>
          )}
        </div>
        )}
      </div>

      {/* Report Modal */}
      {reportTarget && (
        <ReportModal
          open={!!reportTarget}
          onClose={() => setReportTarget(null)}
          user={user}
          targetType="user"
          targetId={reportTarget.id}
          targetEmail={reportTarget.email}
          targetName={reportTarget.full_name}
        />
      )}

      {viewEmployee && (
        <EmployeeProfileModal employee={viewEmployee} onClose={() => setViewEmployee(null)} />
      )}
    </div>
  );
}