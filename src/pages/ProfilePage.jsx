import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useMutation, useQuery } from '@tanstack/react-query';
import {
  Camera, Save, Loader2, MapPin, Globe, Phone,
  CheckCircle, Shield, Star, Zap, Award, UserCheck, Heart, Crown, Sparkles, Users
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import BadgeChip from '@/components/ui/BadgeChip';
import VerificationIcons from '@/components/ui/VerificationIcon';
import DangerZone from '@/components/profile/DangerZone';
import CertificationRequest from '@/components/profile/CertificationRequest';
import ThemeSelector from '@/components/profile/ThemeSelector';
import SecurityAndPrivacy from '@/components/security/SecurityAndPrivacy';
import UserSettings from '@/components/settings/UserSettings';
import { ROLE_CONFIG, PDG_ADJOINT_EMAILS } from '@/lib/roles';

const BADGE_CONFIG = {
  'Fondateur':      { icon: Star,      color: 'text-yellow-400', bg: 'bg-yellow-400/10', border: 'border-yellow-400/30' },
  'Collaborateur':  { icon: UserCheck, color: 'text-blue-400',   bg: 'bg-blue-400/10',   border: 'border-blue-400/30' },
  'VIP':            { icon: Award,     color: 'text-purple-400', bg: 'bg-purple-400/10', border: 'border-purple-400/30' },
  'Admin':          { icon: Shield,    color: 'text-red-400',    bg: 'bg-red-400/10',    border: 'border-red-400/30' },
  'Pilote':         { icon: Zap,       color: 'text-primary',    bg: 'bg-primary/10',    border: 'border-primary/30' },
  'Officiel':       { icon: CheckCircle, color: 'text-accent',   bg: 'bg-accent/10',     border: 'border-accent/30' },
  'Vérfifié':       { icon: CheckCircle, color: 'text-green-400',bg: 'bg-green-400/10',  border: 'border-green-400/30' },
  'Donateur':       { icon: Heart,     color: 'text-red-400',    bg: 'bg-red-400/10',    border: 'border-red-400/30' },
};

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [form, setForm] = useState({});
  const [uploading, setUploading] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [showCertification, setShowCertification] = useState(false);
  const [certificationsEnabled, setCertificationsEnabled] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      const u = await base44.auth.me();
      setUser(u);
      setForm({
        bio: u.bio || '',
        phone: u.phone || '',
        location: u.location || '',
        website: u.website || '',
      });
    };
    
    loadUser().catch(() => base44.auth.redirectToLogin('/profile'));

    // Surveiller les changements de l'entité User en temps réel
    const unsubscribe = base44.entities.User.subscribe((event) => {
      if (event.type === 'update' && event.data?.email === user?.email) {
        setUser(event.data);
      }
    });

    base44.entities.AppSettings.filter({ key: 'certifications_enabled' }).then(settings => {
      if (settings.length > 0) {
        setCertificationsEnabled(settings[0].value === 'true');
      }
    });
  }, []);

  const saveMutation = useMutation({
    mutationFn: () => base44.auth.updateMe(form),
    onSuccess: (updated) => {
      setUser(updated);
      toast.success('Profil mis à jour !');
    },
  });

  const { data: followers = [] } = useQuery({
    queryKey: ['my-followers', user?.email],
    queryFn: () => base44.entities.Follow.filter({ following_email: user.email }),
    enabled: !!user?.email,
  });

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    await base44.auth.updateMe({ avatar_url: file_url });
    setUser(u => ({ ...u, avatar_url: file_url }));
    setUploading(false);
    toast.success('Photo de profil mise à jour');
  };

  const handleCoverUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingCover(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    await base44.auth.updateMe({ cover_url: file_url });
    setUser(u => ({ ...u, cover_url: file_url }));
    setUploadingCover(false);
    toast.success('Photo de couverture mise à jour');
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const isSupreme = user.verifications?.includes('supreme');
  const isPdgAdjoint = user.role === 'pdg_adjoint' || PDG_ADJOINT_EMAILS.includes(user.email);
  const roleCfg = ROLE_CONFIG[user.role];

  const statusColors = {
    active: 'text-green-400 bg-green-400/10 border-green-400/30',
    suspended: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30',
    banned: 'text-red-400 bg-red-400/10 border-red-400/30',
    restricted: 'text-orange-400 bg-orange-400/10 border-orange-400/30',
  };

  return (
    <div className="pt-20 min-h-screen pb-20" style={isSupreme ? { background: 'linear-gradient(180deg, #0d0800 0%, hsl(214 50% 4%) 25%)' } : {}}>
      {/* Supreme ambient particles */}
      {isSupreme && (
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
          {[...Array(18)].map((_, idx) => (
            <motion.div
              key={idx}
              className="absolute rounded-full"
              style={{
                width: (idx % 3) + 1 + 1,
                height: (idx % 3) + 1 + 1,
                left: `${(idx * 17 + 7) % 100}%`,
                top: `${(idx * 23 + 11) % 100}%`,
                background: `rgba(245,158,11,${0.1 + (idx % 4) * 0.1})`,
                boxShadow: '0 0 6px rgba(245,158,11,0.6)',
              }}
              animate={{ y: [-20, 20, -20], opacity: [0.2, 0.8, 0.2] }}
              transition={{ duration: 3 + (idx % 4), repeat: Infinity, delay: (idx % 3) }}
            />
          ))}
        </div>
      )}

      <div className="max-w-2xl mx-auto px-5 relative z-10">

        {/* Supreme crown banner */}
        {isSupreme && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 rounded-2xl overflow-hidden relative"
            style={{
              background: 'linear-gradient(135deg, #1a0c00, #2d1500, #1a0c00)',
              border: '1px solid rgba(217,119,6,0.4)',
              boxShadow: '0 0 40px rgba(245,158,11,0.12), inset 0 1px 0 rgba(245,158,11,0.15)',
            }}
          >
            <div className="absolute inset-0" style={{ background: 'linear-gradient(90deg, transparent, rgba(245,158,11,0.04), transparent)' }} />
            <div className="relative flex items-center justify-center gap-4 py-3 px-6">
              <motion.div animate={{ rotate: [-5, 5, -5] }} transition={{ duration: 3, repeat: Infinity }}>
                <Crown className="w-5 h-5" style={{ color: '#f59e0b', filter: 'drop-shadow(0 0 8px rgba(245,158,11,0.8))' }} />
              </motion.div>
              <div className="text-center">
                <p className="font-mono text-[10px] uppercase tracking-[0.3em]" style={{ color: '#d97706' }}>Rang Exclusif</p>
                <p className="font-grotesk font-bold text-sm" style={{ background: 'linear-gradient(90deg,#f59e0b,#fde68a,#d97706)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>SUPRÊME</p>
              </div>
              <motion.div animate={{ rotate: [5, -5, 5] }} transition={{ duration: 3, repeat: Infinity }}>
                <Crown className="w-5 h-5" style={{ color: '#f59e0b', filter: 'drop-shadow(0 0 8px rgba(245,158,11,0.8))' }} />
              </motion.div>
            </div>
          </motion.div>
        )}

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
            <>
              <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(245,158,11,0.12) 0%, transparent 50%, rgba(217,119,6,0.08) 100%)' }} />
              <div className="absolute inset-0 grid-bg opacity-20" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Sparkles className="w-16 h-16 opacity-10" style={{ color: '#f59e0b' }} />
              </div>
            </>
          ) : (
            <div className="absolute inset-0 grid-bg" />
          )}
          <label className="absolute bottom-3 right-3 cursor-pointer">
            <div className="flex items-center gap-1.5 bg-background/80 backdrop-blur-sm border border-border rounded-lg px-3 py-1.5 font-inter text-xs text-foreground hover:bg-background transition-colors">
              {uploadingCover ? <Loader2 className="w-3 h-3 animate-spin" /> : <Camera className="w-3 h-3" />}
              Modifier la couverture
            </div>
            <input type="file" accept="image/*" className="hidden" onChange={handleCoverUpload} />
          </label>
        </div>

        {/* Avatar + infos */}
        <div className="relative px-6 -mt-10 mb-6">
          <div className="flex items-end justify-between">
            <div className="relative">
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
              <label className="absolute -bottom-2 -right-2 cursor-pointer">
                <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center border-2 border-background hover:bg-primary/80 transition-colors">
                  {uploading ? <Loader2 className="w-3 h-3 animate-spin text-primary-foreground" /> : <Camera className="w-3 h-3 text-primary-foreground" />}
                </div>
                <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
              </label>
            </div>

            <div className="flex items-center gap-2 pb-1">
              {user.verified_status === 'yes' && (
                <span className="flex items-center gap-1 font-mono text-[10px] text-accent bg-accent/10 border border-accent/30 px-2 py-1 rounded-full">
                  <CheckCircle className="w-3 h-3" /> Vérifié
                </span>
              )}
              <span className={`font-mono text-[10px] border px-2 py-1 rounded-full ${statusColors[user.account_status || 'active']}`}>
                {user.account_status === 'active' ? 'Actif' :
                 user.account_status === 'suspended' ? 'Suspendu' :
                 user.account_status === 'banned' ? 'Banni' : 'Restreint'}
              </span>
            </div>
          </div>

          <div className="mt-4">
            <div className="flex items-center gap-1.5">
              <h1
                className="font-grotesk font-bold text-xl"
                style={isSupreme ? { background: 'linear-gradient(90deg,#f59e0b,#fde68a,#b45309)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', filter: 'drop-shadow(0 0 8px rgba(245,158,11,0.3))' } : {}}
              >{user.full_name}</h1>
              <VerificationIcons verifications={user.verifications} size="md" />
            </div>
            <p className="font-mono text-xs text-muted-foreground">{user.email}</p>
            {user.role && roleCfg && (
              <span className={`inline-block mt-1 font-mono text-[10px] px-2 py-0.5 rounded-full border ${roleCfg.bg} ${roleCfg.color} ${roleCfg.border}`}>
                {roleCfg.emoji} {roleCfg.label}
              </span>
            )}
          </div>

          {/* Badges */}
          {user.badges?.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {user.badges.map(b => {
                const cfg = BADGE_CONFIG[b];
                if (!cfg) return <BadgeChip key={b} badge={b} />;
                const Icon = cfg.icon;
                return (
                  <span key={b} className={`flex items-center gap-1.5 font-inter text-xs px-2.5 py-1 rounded-full border ${cfg.color} ${cfg.bg} ${cfg.border}`}>
                    <Icon className="w-3 h-3" /> {b}
                  </span>
                );
              })}
            </div>
          )}

          {/* Followers stats */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 flex items-center gap-3 py-3 px-3 rounded-xl bg-secondary/50 border border-border"
          >
            <div className="flex items-center gap-1.5 text-foreground">
              <Users className="w-4 h-4 text-primary" />
              <span className="font-grotesk font-semibold">{followers.length}</span>
              <span className="font-inter text-sm text-muted-foreground">
                abonné{followers.length > 1 ? 's' : ''}
              </span>
            </div>
          </motion.div>
        </div>

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl p-6 space-y-5"
          style={isSupreme
            ? { background: 'linear-gradient(145deg, #1a0c00, #150a00)', border: '1px solid rgba(217,119,6,0.3)', boxShadow: '0 0 30px rgba(245,158,11,0.07)' }
            : { background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }
          }
        >
          <h2 className="font-grotesk font-semibold text-base">Modifier mon profil</h2>

          <div>
            <label className="font-inter text-xs text-muted-foreground mb-1.5 block">Bio</label>
            <Textarea
              value={form.bio}
              onChange={e => setForm(p => ({ ...p, bio: e.target.value }))}
              placeholder="Parlez de vous en quelques mots..."
              className="bg-secondary border-border font-inter text-sm resize-none h-24"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-inter text-xs text-muted-foreground mb-1.5 flex items-center gap-1.5">
                <Phone className="w-3 h-3" /> Téléphone
              </label>
              <Input
                value={form.phone}
                onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                placeholder="+33 6 00 00 00 00"
                className="bg-secondary border-border font-inter"
              />
            </div>
            <div>
              <label className="font-inter text-xs text-muted-foreground mb-1.5 flex items-center gap-1.5">
                <MapPin className="w-3 h-3" /> Localisation
              </label>
              <Input
                value={form.location}
                onChange={e => setForm(p => ({ ...p, location: e.target.value }))}
                placeholder="Paris, France"
                className="bg-secondary border-border font-inter"
              />
            </div>
          </div>

          <div>
            <label className="font-inter text-xs text-muted-foreground mb-1.5 flex items-center gap-1.5">
              <Globe className="w-3 h-3" /> Site web
            </label>
            <Input
              value={form.website}
              onChange={e => setForm(p => ({ ...p, website: e.target.value }))}
              placeholder="https://mon-site.com"
              className="bg-secondary border-border font-inter"
            />
          </div>

          <ThemeSelector />

          <Button
            onClick={() => saveMutation.mutate()}
            disabled={saveMutation.isPending}
            className="w-full gap-2 font-grotesk font-semibold"
            style={isSupreme
              ? { background: 'linear-gradient(135deg, #92400e, #d97706, #92400e)', color: '#fff', border: 'none', boxShadow: '0 4px 20px rgba(245,158,11,0.3)' }
              : {}
            }
          >
            {saveMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Sauvegarder
          </Button>
        </motion.div>

        {/* Certification request */}
        {!user.badges?.includes('Officiel') && !user.badges?.includes('Pilote') && !user.badges?.includes('Fondateur') && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card border border-primary/20 rounded-2xl p-6 mb-6 mt-6"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Award className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-grotesk font-semibold text-sm">Demander une certification</h3>
                  <p className="font-inter text-xs text-muted-foreground mt-1">Valorisez votre profil professionnel</p>
                </div>
              </div>
              <Button
                onClick={() => setShowCertification(true)}
                className="bg-primary text-primary-foreground gap-2 whitespace-nowrap"
              >
                <Award className="w-4 h-4" />
                Postuler
              </Button>
            </div>
          </motion.div>
        )}

        {/* User Settings */}
        <div className="mt-8">
          <UserSettings user={user} />
        </div>

        {/* Security & Privacy */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mt-8"
        >
          <SecurityAndPrivacy user={user} />
        </motion.div>

        {/* Danger zone */}
        <DangerZone user={user} />
      </div>

      {/* Certification modal */}
      {showCertification && <CertificationRequest onClose={() => setShowCertification(false)} user={user} />}
    </div>
  );
}