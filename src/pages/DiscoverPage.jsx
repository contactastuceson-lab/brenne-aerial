import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  UserPlus, UserCheck, Search, MessageCircle, Users,
  CheckCircle, Star, Award, Zap, Shield, Flag, MapPin
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import VerificationIcons from '@/components/ui/VerificationIcon';
import BadgePopup from '@/components/ui/BadgePopup';
import { Link } from 'react-router-dom';
import ReportModal from '@/components/shared/ReportModal';
import FeatureDisabled from '@/components/shared/FeatureDisabled';

function getConversationId(emailA, emailB) {
  return [emailA, emailB].sort().join('_');
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

export default function DiscoverPage() {
  const [user, setUser] = useState(null);
  const [search, setSearch] = useState('');
  const [reportTarget, setReportTarget] = useState(null);
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
      return res.data.users || [];
    },
    enabled: !!user,
  });

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

  const filtered = allUsers
    .filter(u => u.email !== user.email)
    .filter(u =>
      !search ||
      u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase())
    );

  return (
    <div className="pt-24 min-h-screen px-5 lg:px-10 pb-20">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center">
              <Users className="w-4 h-4 text-primary" />
            </div>
            <h1 className="font-grotesk font-bold text-2xl gradient-text">Découvrir</h1>
          </div>
          <p className="font-inter text-sm text-muted-foreground ml-11">
            {filtered.length} membre{filtered.length !== 1 ? 's' : ''} dans la communauté
          </p>
        </motion.div>

        {/* Search */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher un profil..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-10 bg-card border-border font-inter"
            />
          </div>
        </motion.div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {filtered.map((profile, i) => {
              const isFollowing = followingEmails.has(profile.email);
              const followRecord = follows.find(f => f.following_email === profile.email);
              const alreadyRequested = requestedEmails.has(profile.email);

              return (
                <motion.div
                  key={profile.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: i * 0.04 }}
                  className="group relative bg-card border border-border rounded-2xl overflow-hidden hover-lift"
                >
                  {/* Cover */}
                  <div className="h-20 relative overflow-hidden">
                    {profile.cover_url
                      ? <img src={profile.cover_url} alt="" className="w-full h-full object-cover" />
                      : <div className="w-full h-full bg-gradient-to-br from-primary/20 via-accent/10 to-secondary"><div className="absolute inset-0 grid-bg opacity-50" /></div>
                    }
                    {/* Report button */}
                    <button
                      onClick={() => setReportTarget(profile)}
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity w-6 h-6 rounded-full bg-background/70 backdrop-blur-sm flex items-center justify-center hover:bg-background"
                    >
                      <Flag className="w-3 h-3 text-muted-foreground" />
                    </button>
                  </div>

                  {/* Avatar */}
                  <div className="px-4 -mt-8 pb-4">
                    <div className="relative w-14 h-14 mb-3">
                      <div className="w-14 h-14 rounded-2xl border-2 border-background bg-secondary flex items-center justify-center overflow-hidden sky-glow">
                        {profile.avatar_url ? (
                          <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <span className="font-grotesk font-bold text-xl text-primary">
                            {profile.full_name?.[0]?.toUpperCase() || '?'}
                          </span>
                        )}
                      </div>
                      {profile.last_seen && (Date.now() - new Date(profile.last_seen).getTime()) < 2 * 60 * 1000 && (
                        <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-background" />
                      )}
                    </div>

                    <div className="flex items-center gap-1 mb-0.5">
                      <h3 className="font-grotesk font-semibold text-sm truncate">{profile.full_name}</h3>
                      <VerificationIcons verifications={profile.verifications} />
                    </div>
                    {profile.location && (
                      <p className="font-inter text-[10px] text-muted-foreground flex items-center gap-1 mb-1">
                        <MapPin className="w-2.5 h-2.5" /> {profile.location}
                      </p>
                    )}

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
                          className="flex-1 text-xs border-border font-inter gap-1.5 h-8"
                          onClick={() => unfollowMutation.mutate(followRecord.id)}
                          disabled={unfollowMutation.isPending}
                        >
                          <UserCheck className="w-3 h-3 text-primary" />
                          Suivi
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          className="flex-1 text-xs bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 font-inter gap-1.5 h-8"
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
                          <Button size="sm" className="w-full text-xs bg-accent/10 text-accent border border-accent/20 hover:bg-accent/20 font-inter gap-1.5 h-8">
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
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-20 text-muted-foreground font-inter text-sm">
            Aucun profil trouvé
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
    </div>
  );
}