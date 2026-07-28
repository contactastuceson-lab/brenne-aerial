import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { MapPin, Globe, Calendar, Twitter, Instagram, Youtube, Music2 } from 'lucide-react';
import VerificationIcons from '@/components/ui/VerificationIcon';
import BadgeChip from '@/components/ui/BadgeChip';
import { getHighestVerificationBadge } from '@/lib/affiliationUtils';
import { VERIFICATION_CONFIG } from '@/components/ui/VerificationChip';
import ProfileNotFound from '@/components/profile/ProfileNotFound';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

const BADGE_CONFIG = {
  'Fondateur': { color: 'text-yellow-400', bg: 'bg-yellow-400/10', border: 'border-yellow-400/30' },
  'Collaborateur': { color: 'text-blue-400', bg: 'bg-blue-400/10', border: 'border-blue-400/30' },
  'VIP': { color: 'text-purple-400', bg: 'bg-purple-400/10', border: 'border-purple-400/30' },
  'Pilote': { color: 'text-primary', bg: 'bg-primary/10', border: 'border-primary/30' },
  'Officiel': { color: 'text-accent', bg: 'bg-accent/10', border: 'border-accent/30' },
  'Partenaire': { color: 'text-orange-400', bg: 'bg-orange-400/10', border: 'border-orange-400/30' },
};

function getAvatarGradient(name = '') {
  const G = [['#1a237e','#0d47a1','#01579b'],['#1b5e20','#2e7d32','#00695c'],['#4a148c','#6a1b9a','#880e4f'],['#bf360c','#e65100','#f57f17'],['#006064','#00838f','#0277bd'],['#311b92','#4527a0','#1565c0']];
  let h = 0; for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  const [c1, c2, c3] = G[Math.abs(h) % G.length];
  return `linear-gradient(135deg, ${c1} 0%, ${c2} 55%, ${c3} 100%)`;
}

function getCoverGradient(name = '') {
  const C = ['linear-gradient(135deg,#0d47a1,#1565c0,#0288d1)','linear-gradient(135deg,#1b5e20,#2e7d32,#43a047)','linear-gradient(135deg,#4a148c,#7b1fa2,#ab47bc)','linear-gradient(135deg,#bf360c,#e64a19,#ff7043)','linear-gradient(135deg,#006064,#0097a7,#00bcd4)','linear-gradient(135deg,#311b92,#512da8,#7e57c2)'];
  let h = 0; for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return C[(Math.abs(h) + 3) % C.length];
}

function formatCount(n) {
  if (!n) return '0';
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
  if (n >= 1000) return (n / 1000).toFixed(1) + 'k';
  return String(n);
}

export default function SampleProfilePage() {
  const { username } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => { window.scrollTo({ top: 0 }); }, [username]);

  useEffect(() => {
    const load = async () => {
      setLoading(true); setNotFound(false); setProfile(null);
      try {
        const list = await base44.entities.SampleProfile.list('-created_date', 500);
        const found = (list || []).find(p => (p.username || '').toLowerCase() === (username || '').toLowerCase());
        if (!found) { setNotFound(true); return; }
        setProfile(found);
        const name = found.display_name || found.full_name || found.username;
        document.title = `${name} (@${found.username}) · eza`;
        let desc = document.querySelector('meta[name="description"]');
        if (!desc) { desc = document.createElement('meta'); desc.name = 'description'; document.head.appendChild(desc); }
        desc.content = `${name} (@${found.username}) sur eza. ${found.bio || ''}`.slice(0, 200);
      } catch {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [username]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  if (notFound || !profile) return <ProfileNotFound username={username} />;

  const isSupreme = profile.verifications?.includes('supreme');
  const memberSince = profile.created_date
    ? formatDistanceToNow(new Date(profile.created_date), { addSuffix: true, locale: fr })
    : null;

  return (
    <div className="flex min-h-screen">
      <div className="flex-1 min-w-0 pb-20 overflow-x-hidden">
        {/* Cover */}
        <div
          className="relative w-full h-44 sm:h-56 md:h-64 lg:h-72 xl:h-80 overflow-hidden"
          style={profile.cover_url ? {} : { background: getCoverGradient(profile.full_name) }}
        >
          {profile.cover_url ? (
            <img src={profile.cover_url} alt="cover" className="absolute inset-0 w-full h-full object-cover object-center" />
          ) : (
            <>
              <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.15) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255,255,255,0.1) 0%, transparent 40%)' }} />
              <div className="absolute inset-0 grid-bg opacity-30" />
              <div className="absolute inset-0 flex items-center justify-center opacity-10">
                <span className="font-grotesk font-black text-[10rem] text-white select-none leading-none">
                  {(profile.full_name?.[0] || '?').toUpperCase()}
                </span>
              </div>
            </>
          )}
          <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-background to-transparent" />
        </div>

        <div className="w-full max-w-2xl mx-auto">
          <div className="relative px-4 -mt-16">
            <div className="flex items-end justify-between gap-4 mb-4">
              <div
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl flex items-center justify-center overflow-hidden flex-shrink-0 relative z-10"
                style={{ border: '4px solid hsl(var(--background))', background: profile.avatar_url ? 'hsl(var(--secondary))' : getAvatarGradient(profile.full_name) }}
              >
                {profile.avatar_url ? (
                  <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span className="font-grotesk font-bold text-4xl text-white drop-shadow-sm">
                    {(profile.full_name?.[0] || '?').toUpperCase()}
                  </span>
                )}
              </div>
            </div>

            <h1 className="mb-1 flex flex-wrap items-center gap-1 font-grotesk text-2xl font-bold sm:text-3xl">
              <span>{profile.display_name || profile.full_name}</span>
              <span className="inline-flex text-base">
                <VerificationIcons verifications={profile.verifications} size="sm" user={profile} />
              </span>
            </h1>

            {profile.username && (
              <p className="font-mono text-sm text-muted-foreground mb-3">@{profile.username}</p>
            )}

            {profile.niche && (
              <span className="inline-block mb-4 font-inter text-xs px-2.5 py-1 rounded-full border border-primary/30 bg-primary/10 text-primary">
                {profile.niche}
              </span>
            )}

            {profile.bio && (
              <p className="font-inter text-sm text-foreground/80 leading-relaxed mb-4 whitespace-pre-line">
                {profile.bio}
              </p>
            )}

            <div className="flex flex-wrap gap-x-4 gap-y-1.5 mb-4">
              {profile.location && (
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <MapPin className="w-3.5 h-3.5" /> {profile.location}
                </div>
              )}
              {profile.website && (
                <div className="flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-primary" />
                  <a href={profile.website} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline truncate max-w-[200px]">
                    {profile.website.replace(/^https?:\/\//, '')}
                  </a>
                </div>
              )}
              {memberSince && (
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Calendar className="w-3.5 h-3.5" /> Membre {memberSince}
                </div>
              )}
            </div>

            {/* Vérification principale */}
            {getHighestVerificationBadge(profile.verifications) && (
              <div className="flex flex-wrap gap-2 mb-4">
                {(() => {
                  const badge = getHighestVerificationBadge(profile.verifications);
                  const cfg = VERIFICATION_CONFIG[badge];
                  if (!cfg) return null;
                  return (
                    <span className={`flex items-center gap-1.5 font-inter text-xs px-2.5 py-1 rounded-full border ${cfg.border} ${cfg.bg}`}>
                      <span className={cfg.color}>•</span>
                      <span className={cfg.color}>{cfg.label}</span>
                    </span>
                  );
                })()}
              </div>
            )}

            {/* Badges */}
            {profile.badges?.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {profile.badges.map(b => {
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

            {/* Réseaux sociaux */}
            <div className="flex flex-wrap gap-2 mb-6">
              {profile.social_instagram && (
                <a href={profile.social_instagram} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border border-pink-400/30 bg-pink-400/10 text-pink-400 hover:bg-pink-400/20 transition-colors">
                  <Instagram className="w-3.5 h-3.5" /> Instagram
                </a>
              )}
              {profile.social_tiktok && (
                <a href={profile.social_tiktok} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border border-border bg-secondary text-foreground hover:bg-secondary/70 transition-colors">
                  <Music2 className="w-3.5 h-3.5" /> TikTok
                </a>
              )}
              {profile.social_twitter && (
                <a href={profile.social_twitter} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border border-border bg-secondary text-foreground hover:bg-secondary/70 transition-colors">
                  <Twitter className="w-3.5 h-3.5" /> X
                </a>
              )}
              {profile.social_youtube && (
                <a href={profile.social_youtube} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border border-red-400/30 bg-red-400/10 text-red-400 hover:bg-red-400/20 transition-colors">
                  <Youtube className="w-3.5 h-3.5" /> YouTube
                </a>
              )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              <div className="bg-secondary/50 border border-border rounded-xl p-3 text-center">
                <p className="font-grotesk font-bold text-xl text-foreground">{formatCount(profile.followers_count)}</p>
                <p className="font-inter text-xs text-muted-foreground mt-0.5">Abonnés</p>
              </div>
              <div className="bg-secondary/50 border border-border rounded-xl p-3 text-center">
                <p className="font-grotesk font-bold text-xl text-foreground">{formatCount(profile.following_count)}</p>
                <p className="font-inter text-xs text-muted-foreground mt-0.5">Abonnements</p>
              </div>
              <div className="bg-secondary/50 border border-border rounded-xl p-3 text-center">
                <p className="font-grotesk font-bold text-xl text-foreground">{formatCount(profile.posts_count)}</p>
                <p className="font-inter text-xs text-muted-foreground mt-0.5">Publications</p>
              </div>
            </div>

            <div className="mb-2 rounded-2xl border border-border bg-secondary/30 p-3 text-center">
              <p className="font-inter text-xs text-muted-foreground">Profil suggéré · membre de la communauté eza</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}