import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useMutation, useQuery } from '@tanstack/react-query';
import {
  Camera, Save, Loader2, MapPin, Globe, Phone,
  CheckCircle, Shield, Star, Zap, Award, UserCheck, Heart, Crown, Sparkles, Users,
  User, Settings, Bell, Lock, ChevronRight
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
import UsernameChanger from '@/components/profile/UsernameChanger';
import AccountSettings from '@/components/settings/AccountSettings';
import PreferencesSettings from '@/components/settings/PreferencesSettings';
import NotificationSettings from '@/components/settings/NotificationSettings';
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

const NAV_TABS = [
  { id: 'profil',        label: 'Mon profil',     icon: User },
  { id: 'compte',        label: 'Compte',         icon: Settings },
  { id: 'preferences',  label: 'Préférences',    icon: Bell },
  { id: 'notifications', label: 'Notifications',  icon: Bell },
  { id: 'securite',      label: 'Sécurité',       icon: Lock },
];

const statusColors = {
  active:     'text-green-400 bg-green-400/10 border-green-400/30',
  suspended:  'text-yellow-400 bg-yellow-400/10 border-yellow-400/30',
  banned:     'text-red-400 bg-red-400/10 border-red-400/30',
  restricted: 'text-orange-400 bg-orange-400/10 border-orange-400/30',
};

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [form, setForm] = useState({});
  const [uploading, setUploading] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [showCertification, setShowCertification] = useState(false);
  const [activeTab, setActiveTab] = useState('profil');

  useEffect(() => {
    let unsubscribe = () => {};
    const loadUser = async () => {
      const u = await base44.auth.me();
      setUser(u);
      setForm({
        display_name: u.display_name || u.full_name || '',
        username: u.username || '',
        bio: u.bio || '',
        phone: u.phone || '',
        location: u.location || '',
        website: u.website || '',
      });
      unsubscribe = base44.entities.User.subscribe((event) => {
        if (event.type === 'update' && event.data?.email === u.email) {
          setUser(event.data);
          setForm({
            display_name: event.data.display_name || event.data.full_name || '',
            username: event.data.username || '',
            bio: event.data.bio || '',
            phone: event.data.phone || '',
            location: event.data.location || '',
            website: event.data.website || '',
          });
        }
      });
    };
    loadUser().catch(() => base44.auth.redirectToLogin('/profile'));
    return () => unsubscribe();
  }, []);

  const saveMutation = useMutation({
    mutationFn: async () => {
      await base44.auth.updateMe({
        display_name: form.display_name,
        full_name: form.display_name,
        bio: form.bio,
        phone: form.phone,
        location: form.location,
        website: form.website,
      });
      return await base44.auth.me();
    },
    onSuccess: (updated) => {
      setUser(updated);
      toast.success('Profil mis à jour !');
    },
    onError: () => toast.error('Erreur lors de la sauvegarde'),
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
  const roleCfg = ROLE_CONFIG[user.role];

  return (
    <div
      className="pt-20 min-h-screen pb-20"
      style={isSupreme ? { background: 'linear-gradient(180deg, #0d0800 0%, hsl(214 50% 4%) 25%)' } : {}}
    >
      {/* Supreme particles */}
      {isSupreme && (
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
          {[...Array(18)].map((_, idx) => (
            <motion.div
              key={idx}
              className="absolute rounded-full"
              style={{
                width: (idx % 3) + 2, height: (idx % 3) + 2,
                left: `${(idx * 17 + 7) % 100}%`,
                top: `${(idx * 23 + 11) % 100}%`,
                background: `rgba(245,158,11,${0.1 + (idx % 4) * 0.1})`,
                boxShadow: '0 0 6px rgba(245,158,11,0.6)',
              }}
              animate={{ y: [-20, 20, -20], opacity: [0.2, 0.8, 0.2] }}
              transition={{ duration: 3 + (idx % 4), repeat: Infinity, delay: idx % 3 }}
            />
          ))}
        </div>
      )}

      <div className="max-w-5xl mx-auto px-4 relative z-10">

        {/* Supreme banner */}
        {isSupreme && (
          <motion.div
            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            className="mb-4 rounded-2xl overflow-hidden relative"
            style={{ background: 'linear-gradient(135deg, #1a0c00, #2d1500)', border: '1px solid rgba(217,119,6,0.4)', boxShadow: '0 0 40px rgba(245,158,11,0.12)' }}
          >
            <div className="flex items-center justify-center gap-4 py-3 px-6">
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

        {/* Cover + Avatar */}
        <div
          className="relative h-44 rounded-2xl overflow-hidden"
          style={isSupreme
            ? { background: 'linear-gradient(135deg, #1a0c00, #2d1500)', border: '2px solid #d97706', boxShadow: '0 0 30px rgba(245,158,11,0.2)' }
            : { background: 'linear-gradient(to bottom right, hsl(var(--primary)/0.2), hsl(var(--accent)/0.1), hsl(var(--secondary)))' }
          }
        >
          {user.cover_url ? (
            <img src={user.cover_url} alt="cover" className="w-full h-full object-cover" />
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

        {/* Avatar — chevauchement cover avec bordure dorée */}
        <div className="relative px-4 -mt-10 mb-2">
          <div className="relative w-24 h-24">
            <div
              className="w-24 h-24 rounded-3xl flex items-center justify-center overflow-hidden border-4"
              style={{
                borderColor: '#fbbf24',
                boxShadow: '0 0 24px rgba(251, 191, 36, 0.4)',
                background: 'hsl(var(--secondary))'
              }}
            >
              {user.avatar_url
                ? <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
                : <span className="font-grotesk font-bold text-4xl text-primary">{user.display_name?.[0]?.toUpperCase() || user.full_name?.[0]?.toUpperCase() || '?'}</span>
              }
            </div>
            <label className="absolute -bottom-2 -right-2 cursor-pointer">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center border-2 border-background hover:bg-primary/80 transition-colors">
                {uploading ? <Loader2 className="w-4 h-4 animate-spin text-primary-foreground" /> : <Camera className="w-4 h-4 text-primary-foreground" />}
              </div>
              <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
            </label>
          </div>
        </div>

        {/* Infos profil + badges + statuts */}
        <div className="px-4 mt-4 mb-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className={`font-grotesk font-bold text-3xl ${isSupreme ? 'text-amber-300' : 'text-foreground'}`}>
                  {user.display_name || user.full_name}
                </h1>
                {user.badges?.includes('Officiel') && (
                  <span className="text-2xl">👑</span>
                )}
                <VerificationIcons verifications={user.verifications} size="md" />
              </div>
              <p className="font-mono text-xs text-muted-foreground mt-1">{user.email}</p>
              {roleCfg && (
                <span className={`inline-block mt-1.5 font-mono text-[10px] px-2 py-0.5 rounded-full border ${roleCfg.bg} ${roleCfg.color} ${roleCfg.border}`}>
                  {roleCfg.emoji} {roleCfg.label}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 mt-1 flex-shrink-0">
              {user.verified_status === 'yes' && (
                <span className="flex items-center gap-1 font-mono text-[10px] text-accent bg-accent/10 border border-accent/30 px-2 py-1 rounded-full">
                  <CheckCircle className="w-3 h-3" /> Vérifié
                </span>
              )}
              <span className={`font-mono text-[10px] border px-2 py-1 rounded-full ${statusColors[user.account_status || 'active']}`}>
                {user.account_status === 'active' ? 'Actif' : user.account_status === 'suspended' ? 'Suspendu' : user.account_status === 'banned' ? 'Banni' : 'Restreint'}
              </span>
            </div>
          </div>
        </div>

        {/* Badges + followers */}
        <div className="px-4 mb-6 flex flex-wrap items-center gap-3">
          {user.badges?.length > 0 && user.badges.map(b => {
            const cfg = BADGE_CONFIG[b];
            if (!cfg) return <BadgeChip key={b} badge={b} />;
            const Icon = cfg.icon;
            return (
              <span key={b} className={`flex items-center gap-1.5 font-inter text-xs px-2.5 py-1 rounded-full border ${cfg.color} ${cfg.bg} ${cfg.border}`}>
                <Icon className="w-3 h-3" /> {b}
              </span>
            );
          })}
          <div className="flex items-center gap-1.5 text-foreground ml-auto py-1.5 px-3 rounded-xl bg-secondary/50 border border-border">
            <Users className="w-4 h-4 text-primary" />
            <span className="font-grotesk font-semibold text-sm">{followers.length}</span>
            <span className="font-inter text-xs text-muted-foreground">abonné{followers.length > 1 ? 's' : ''}</span>
          </div>
        </div>

        {/* Main layout: sidebar + content */}
        <div className="md:flex md:gap-6">

          {/* Sidebar nav — desktop */}
          <aside className="hidden md:flex flex-col gap-1 w-52 flex-shrink-0">
            {NAV_TABS.map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-xl font-inter text-sm transition-all text-left ${
                    isActive
                      ? 'bg-primary/10 text-primary border border-primary/20 font-medium'
                      : 'text-muted-foreground hover:text-foreground hover:bg-secondary/60'
                  }`}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  {tab.label}
                  {isActive && <ChevronRight className="w-3 h-3 ml-auto" />}
                </button>
              );
            })}
          </aside>

          {/* Content */}
          <div className="w-full flex-1 min-w-0">
            {/* Mobile tabs — shown above content on small screens */}
            <div className="md:hidden w-full mb-4">
              <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-hide">
                {NAV_TABS.map(tab => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg font-inter text-xs whitespace-nowrap flex-shrink-0 transition-all ${
                        isActive
                          ? 'bg-primary/10 text-primary border border-primary/20 font-medium'
                          : 'text-muted-foreground bg-secondary/40 hover:text-foreground'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      {tab.label}
                    </button>
                  );
                })}
              </div>
            </div>
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.18 }}
              >
                {activeTab === 'profil' && (
                  <ProfileEditSection
                    form={form}
                    setForm={setForm}
                    user={user}
                    setUser={setUser}
                    saveMutation={saveMutation}
                    isSupreme={isSupreme}
                    showCertification={showCertification}
                    setShowCertification={setShowCertification}
                  />
                )}
                {activeTab === 'compte' && <AccountSettings user={user} />}
                {activeTab === 'preferences' && <PreferencesSettings user={user} />}
                {activeTab === 'notifications' && <NotificationSettings user={user} />}
                {activeTab === 'securite' && (
                  <div className="space-y-6">
                    <SecurityAndPrivacy user={user} />
                    <DangerZone user={user} />
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

        </div>
      </div>

      {showCertification && <CertificationRequest onClose={() => setShowCertification(false)} user={user} />}
    </div>
  );
}

function ProfileEditSection({ form, setForm, user, setUser, saveMutation, isSupreme, showCertification, setShowCertification }) {
  return (
    <div className="space-y-5">
      <div
        className="rounded-2xl p-6 space-y-5"
        style={isSupreme
          ? { background: 'linear-gradient(145deg, #1a0c00, #150a00)', border: '1px solid rgba(217,119,6,0.3)' }
          : { background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }
        }
      >
        <h2 className="font-grotesk font-semibold text-base">Modifier mon profil</h2>

        <div>
          <label className="font-inter text-xs text-muted-foreground mb-1.5 block">Nom d'affichage</label>
          <Input
            value={form.display_name}
            onChange={e => setForm(p => ({ ...p, display_name: e.target.value }))}
            placeholder="Ex: Jean Dupont"
            className="bg-secondary border-border font-inter"
          />
        </div>

        <UsernameChanger user={user} username={user.username || form.username} onUpdate={(newUsername) => {
          setForm(p => ({ ...p, username: newUsername }));
          setUser(u => ({ ...u, username: newUsername }));
        }} />

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
      </div>

      {/* Certification */}
      {!user.badges?.includes('Officiel') && !user.badges?.includes('Pilote') && !user.badges?.includes('Fondateur') && (
        <div className="bg-card border border-primary/20 rounded-2xl p-5">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Award className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-grotesk font-semibold text-sm">Demander une certification</h3>
                <p className="font-inter text-xs text-muted-foreground mt-0.5">Valorisez votre profil professionnel</p>
              </div>
            </div>
            <Button onClick={() => setShowCertification(true)} className="gap-2 whitespace-nowrap flex-shrink-0" size="sm">
              <Award className="w-4 h-4" /> Postuler
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}