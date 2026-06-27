import React from 'react';
import { X, MapPin, MessageCircle, Star, UserCheck, Award, Shield, Zap, CheckCircle, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import VerificationIcons from '@/components/ui/VerificationIcon';
import BadgePopup from '@/components/ui/BadgePopup';
import { Link } from 'react-router-dom';

const BADGE_CONFIG = {
  'Fondateur':      { icon: Star,        color: 'text-yellow-400', bg: 'bg-yellow-400/10', border: 'border-yellow-400/30' },
  'Collaborateur':  { icon: UserCheck,   color: 'text-blue-400',   bg: 'bg-blue-400/10',   border: 'border-blue-400/30' },
  'VIP':            { icon: Award,       color: 'text-purple-400', bg: 'bg-purple-400/10', border: 'border-purple-400/30' },
  'Admin':          { icon: Shield,      color: 'text-red-400',    bg: 'bg-red-400/10',    border: 'border-red-400/30' },
  'Pilote':         { icon: Zap,         color: 'text-primary',    bg: 'bg-primary/10',    border: 'border-primary/30' },
  'Officiel':       { icon: CheckCircle, color: 'text-accent',     bg: 'bg-accent/10',     border: 'border-accent/30' },
  'Vérifié':        { icon: CheckCircle, color: 'text-green-400',  bg: 'bg-green-400/10',  border: 'border-green-400/30' },
  'Beta Testeur':   { icon: Zap,         color: 'text-pink-400',   bg: 'bg-pink-400/10',   border: 'border-pink-400/30' },
  'Partenaire':     { icon: Award,       color: 'text-orange-400', bg: 'bg-orange-400/10', border: 'border-orange-400/30' },
  'Donateur':       { icon: Star,        color: 'text-amber-400',  bg: 'bg-amber-400/10',  border: 'border-amber-400/30' },
};

export default function UserProfileModal({ profile, onClose }) {
  const { data: followers = [] } = useQuery({
    queryKey: ['followers', profile?.email],
    queryFn: () => base44.entities.Follow.filter({ following_email: profile.email }),
    enabled: !!profile?.email,
  });

  if (!profile) return null;
  const isSupreme = profile.verifications?.includes('supreme');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" onClick={onClose}>
      <div
        className="rounded-2xl max-w-sm w-full overflow-hidden shadow-2xl"
        style={isSupreme ? {
          background: 'linear-gradient(145deg,#0d0800,#1a0e00,#0d0800)',
          border: '2px solid #d97706',
          boxShadow: '0 0 30px rgba(245,158,11,0.25)',
        } : { background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Cover */}
        <div className="relative h-28 bg-gradient-to-br from-primary/20 via-accent/10 to-secondary">
          {profile.cover_url && <img src={profile.cover_url} alt="" className="w-full h-full object-cover" />}
          <div className="absolute inset-0 grid-bg opacity-40" />
          <button onClick={onClose} className="absolute top-3 right-3 w-7 h-7 rounded-full bg-background/70 backdrop-blur-sm flex items-center justify-center hover:bg-background transition-colors">
            <X className="w-4 h-4" />
          </button>
          {isSupreme && (
            <div className="absolute top-3 left-3 flex items-center gap-1 px-2 py-0.5 rounded-full" style={{ background: 'linear-gradient(135deg,#92400e,#d97706)' }}>
              <span style={{ fontSize: '10px' }}>👑</span>
              <span className="font-mono text-[9px] font-bold text-yellow-100 uppercase tracking-widest">Suprême</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="px-5 pt-0 pb-5">
          <div className="flex items-end gap-3 -mt-8 mb-3">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center overflow-hidden flex-shrink-0"
              style={isSupreme ? { border: '2px solid #d97706', background: '#1a0e00' } : { border: '2px solid hsl(var(--background))', background: 'hsl(var(--secondary))' }}
            >
              {profile.avatar_url
                ? <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
                : <span className="font-grotesk font-bold text-2xl text-primary">{profile.full_name?.[0]?.toUpperCase()}</span>
              }
            </div>
            <div className="flex-1 min-w-0 mb-1">
              <div className="flex items-center gap-1 flex-wrap">
                <h2
                  className="font-grotesk font-bold text-lg leading-tight"
                  style={isSupreme ? { background: 'linear-gradient(90deg,#f59e0b,#fde68a,#d97706)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' } : {}}
                >{profile.full_name}</h2>
                <VerificationIcons verifications={profile.verifications} user={profile} />
              </div>
              {profile.role && (
                <span className="inline-block font-mono text-[9px] text-primary/80 bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-full capitalize">{profile.role}</span>
              )}
            </div>
          </div>

          {profile.bio && (
            <p className="font-inter text-sm text-muted-foreground mb-3 leading-relaxed">{profile.bio}</p>
          )}

          {profile.location && (
            <div className="flex items-center gap-2 text-muted-foreground mb-3">
              <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="font-inter text-xs">{profile.location}</span>
            </div>
          )}

          {profile.badges?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-4">
              {profile.badges.map(b => {
                const cfg = BADGE_CONFIG[b];
                const Icon = cfg?.icon;
                return (
                  <BadgePopup key={b} badgeKey={b}>
                    <span className={`flex items-center gap-1 font-inter text-xs px-2.5 py-1 rounded-full border cursor-pointer transition-opacity hover:opacity-80 ${cfg ? `${cfg.color} ${cfg.bg} ${cfg.border}` : 'bg-secondary border-border text-muted-foreground'}`}>
                      {Icon && <Icon className="w-3 h-3" />}
                      {b}
                    </span>
                  </BadgePopup>
                );
              })}
            </div>
          )}

          <div className="flex items-center gap-2 py-2 px-2.5 rounded-lg bg-secondary/50 mb-4 border border-border/50">
            <Users className="w-3.5 h-3.5 text-primary flex-shrink-0" />
            <span className="font-grotesk font-semibold text-sm">{followers.length}</span>
            <span className="font-inter text-xs text-muted-foreground">
              abonné{followers.length > 1 ? 's' : ''}
            </span>
          </div>

          <Link to={`/messages?to=${profile.email}&name=${encodeURIComponent(profile.full_name)}`} onClick={onClose}>
            <Button className="w-full gap-2" size="sm"
              style={isSupreme ? { background: 'rgba(217,119,6,0.15)', color: '#f59e0b', border: '1px solid rgba(217,119,6,0.35)' } : {}}>
              <MessageCircle className="w-4 h-4" /> Contacter
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}