import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useMutation } from '@tanstack/react-query';
import {
  Camera, Save, Loader2, MapPin, Globe, Phone,
  CheckCircle, Shield, Star, Zap, Award, UserCheck
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import BadgeChip from '@/components/ui/BadgeChip';

const BADGE_CONFIG = {
  'Fondateur':      { icon: Star,      color: 'text-yellow-400', bg: 'bg-yellow-400/10', border: 'border-yellow-400/30' },
  'Collaborateur':  { icon: UserCheck, color: 'text-blue-400',   bg: 'bg-blue-400/10',   border: 'border-blue-400/30' },
  'VIP':            { icon: Award,     color: 'text-purple-400', bg: 'bg-purple-400/10', border: 'border-purple-400/30' },
  'Admin':          { icon: Shield,    color: 'text-red-400',    bg: 'bg-red-400/10',    border: 'border-red-400/30' },
  'Pilote':         { icon: Zap,       color: 'text-primary',    bg: 'bg-primary/10',    border: 'border-primary/30' },
  'Officiel':       { icon: CheckCircle, color: 'text-accent',   bg: 'bg-accent/10',     border: 'border-accent/30' },
  'Vérfifié':       { icon: CheckCircle, color: 'text-green-400',bg: 'bg-green-400/10',  border: 'border-green-400/30' },
};

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [form, setForm] = useState({});
  const [uploading, setUploading] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);

  useEffect(() => {
    base44.auth.me().then(u => {
      setUser(u);
      setForm({
        bio: u.bio || '',
        phone: u.phone || '',
        location: u.location || '',
        website: u.website || '',
      });
    }).catch(() => base44.auth.redirectToLogin('/profile'));
  }, []);

  const saveMutation = useMutation({
    mutationFn: () => base44.auth.updateMe(form),
    onSuccess: (updated) => {
      setUser(updated);
      toast.success('Profil mis à jour !');
    },
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

  const statusColors = {
    active: 'text-green-400 bg-green-400/10 border-green-400/30',
    suspended: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30',
    banned: 'text-red-400 bg-red-400/10 border-red-400/30',
    restricted: 'text-orange-400 bg-orange-400/10 border-orange-400/30',
  };

  return (
    <div className="pt-20 min-h-screen pb-20">
      <div className="max-w-2xl mx-auto px-5">

        {/* Cover */}
        <div className="relative h-40 rounded-2xl overflow-hidden mb-0 bg-gradient-to-br from-primary/20 via-accent/10 to-secondary">
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

        {/* Avatar + infos */}
        <div className="relative px-6 -mt-10 mb-6">
          <div className="flex items-end justify-between">
            <div className="relative">
              <div className="w-20 h-20 rounded-2xl border-4 border-background bg-secondary flex items-center justify-center overflow-hidden sky-glow">
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
              {user.is_verified && (
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
            <h1 className="font-grotesk font-bold text-xl">{user.full_name}</h1>
            <p className="font-mono text-xs text-muted-foreground">{user.email}</p>
            {user.role && (
              <span className="inline-block mt-1 font-mono text-[10px] text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-full capitalize">
                {user.role}
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
        </div>

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card border border-border rounded-2xl p-6 space-y-5"
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

          <Button
            onClick={() => saveMutation.mutate()}
            disabled={saveMutation.isPending}
            className="w-full bg-primary text-primary-foreground gap-2"
          >
            {saveMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Sauvegarder
          </Button>
        </motion.div>
      </div>
    </div>
  );
}