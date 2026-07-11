import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Loader2, Save, Upload, X, CheckCircle, RefreshCw } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { ROLE_CONFIG, getUserLevel, getAssignableRoles, PDG_EMAILS, PDG_ADJOINT_EMAILS } from '@/lib/roles';

const STATUS_OPTIONS = [
  { value: 'active', label: '✅ Actif', color: 'text-green-400' },
  { value: 'restricted', label: '⚠️ Restreint', color: 'text-orange-400' },
  { value: 'suspended', label: '🔶 Suspendu', color: 'text-yellow-400' },
  { value: 'banned', label: '🔴 Banni', color: 'text-red-400' },
  { value: 'closed', label: '⛔ Compte fermé', color: 'text-gray-400' },
];

const VERIFICATION_OPTIONS = [
  { value: 'no', label: 'Non vérifié' },
  { value: 'yes', label: 'Vérifié' },
  { value: 'supreme', label: 'Suprême (👑)' },
];

export default function UserEditModal({ user, open, onClose, onSave, isLoading, currentUser }) {
  const [form, setForm] = useState({
    full_name: '',
    display_name: '',
    email: '',
    role: 'user',
    account_status: 'active',
    verified_status: 'no',
    suspension_reason: '',
    suspension_until: '',
    closed_by: '',
    bio: '',
    location: '',
    phone: '',
    avatar_url: '',
    cover_url: '',
    username: '',
    subscription_tier: 'free',
    is_premium: false,
    website: '',
    twitter: '',
    linkedin: '',
    instagram: '',
  });
  const [generatingUsername, setGeneratingUsername] = useState(false);

  // Sync form with user data when modal opens
  React.useEffect(() => {
    if (user) {
      setForm({
        full_name: user.full_name || '',
        display_name: user.display_name || '',
        email: user.email || '',
        role: user.role || 'user',
        account_status: user.account_status || 'active',
        verified_status: user.verified_status || 'no',
        suspension_reason: user.suspension_reason || '',
        suspension_until: user.suspension_until || '',
        closed_by: user.closed_by || '',
        bio: user.bio || '',
        location: user.location || '',
        phone: user.phone || '',
        avatar_url: user.avatar_url || '',
        cover_url: user.cover_url || '',
        username: user.username || '',
        subscription_tier: user.subscription_tier || 'free',
        is_premium: user.is_premium || false,
        website: user.website || '',
        twitter: user.twitter || '',
        linkedin: user.linkedin || '',
        instagram: user.instagram || '',
      });
    }
  }, [user]);

  const myLevel = getUserLevel(currentUser);
  const assignableRoles = getAssignableRoles(currentUser);
  const isTargetSupreme = (user?.verifications || []).includes('supreme');
  const blocked = isTargetSupreme && myLevel < 100;

  const handleUploadAvatar = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const uploaded = await base44.integrations.Core.UploadFile({ file });
      setForm(p => ({ ...p, avatar_url: uploaded.file_url }));
      toast.success('Avatar uploadé');
    } catch (err) {
      toast.error('Erreur upload avatar');
    }
  };

  const handleUploadCover = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const uploaded = await base44.integrations.Core.UploadFile({ file });
      setForm(p => ({ ...p, cover_url: uploaded.file_url }));
      toast.success('Cover uploadée');
    } catch (err) {
      toast.error('Erreur upload cover');
    }
  };

  const generateUsername = async () => {
    setGeneratingUsername(true);
    try {
      const emailPrefix = user.email.split('@')[0];
      const random = Math.random().toString(36).substring(2, 8);
      const newUsername = `${emailPrefix}${random}`;
      setForm(p => ({ ...p, username: newUsername }));
      toast.success(`Username généré: ${newUsername}`);
    } catch (err) {
      toast.error('Erreur lors de la génération du username');
    } finally {
      setGeneratingUsername(false);
    }
  };

  const handleSave = () => {
    if (!form.full_name.trim()) {
      toast.error('Le nom complet est requis');
      return;
    }
    // Fermeture de compte : auto-set bio NPS + vérification closed_by
    if (form.account_status === 'closed') {
      if (!form.closed_by) {
        toast.error('Veuillez préciser qui ferme ce compte (Direction ou Admin)');
        return;
      }
      // Auto-injecte NPS dans la bio
      const npsMark = '⛔ NPS — Ne Pas Supprimer';
      const bioWithNps = form.bio?.includes('NPS') ? form.bio : `${npsMark}${form.bio ? '\n' + form.bio : ''}`;
      onSave({ ...form, bio: bioWithNps });
      return;
    }
    onSave(form);
  };

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-card border-border max-w-2xl w-[95vw] max-h-[85vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="font-grotesk font-bold">Modifier le profil — {user.full_name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Media Section */}
          <div className="space-y-3">
            <p className="font-inter text-sm font-medium">Médias</p>
            
            {/* Cover */}
            <div>
              <label className="font-inter text-xs text-muted-foreground mb-2 block">Photo de couverture</label>
              <div className="relative h-32 bg-secondary rounded-xl overflow-hidden border-2 border-dashed border-border">
                {form.cover_url && (
                  <>
                    <img src={form.cover_url} alt="" className="w-full h-full object-cover" />
                    <button
                      onClick={() => setForm(p => ({ ...p, cover_url: '' }))}
                      className="absolute top-2 right-2 w-6 h-6 bg-red-400/20 hover:bg-red-400/30 border border-red-400/40 rounded-full flex items-center justify-center"
                    >
                      <X className="w-3 h-3 text-red-400" />
                    </button>
                  </>
                )}
                <label className="absolute inset-0 flex items-center justify-center cursor-pointer hover:bg-black/20 transition-colors">
                  <input type="file" accept="image/*" onChange={handleUploadCover} className="hidden" />
                  <Upload className="w-5 h-5 text-muted-foreground" />
                </label>
              </div>
            </div>

            {/* Avatar */}
            <div>
              <label className="font-inter text-xs text-muted-foreground mb-2 block">Avatar</label>
              <div className="relative w-24 h-24 bg-secondary rounded-xl overflow-hidden border-2 border-border group">
                {form.avatar_url ? (
                  <img src={form.avatar_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                    <span className="text-lg">👤</span>
                  </div>
                )}
                <label className="absolute inset-0 flex items-center justify-center cursor-pointer bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                  <input type="file" accept="image/*" onChange={handleUploadAvatar} className="hidden" />
                  <Upload className="w-5 h-5 text-white" />
                </label>
                {form.avatar_url && (
                  <button
                    onClick={() => setForm(p => ({ ...p, avatar_url: '' }))}
                    className="absolute top-1 right-1 w-5 h-5 bg-red-400 hover:bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3 text-white" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Names Section */}
          <div className="grid grid-cols-2 gap-3 bg-secondary rounded-xl p-4">
            <div>
              <label className="font-inter text-xs text-muted-foreground mb-1 block">Nom complet</label>
              <Input value={form.full_name} onChange={e => setForm(p => ({ ...p, full_name: e.target.value }))} className="bg-card border-border" />
            </div>
            <div>
              <label className="font-inter text-xs text-muted-foreground mb-1 block">Nom d'affichage</label>
              <Input value={form.display_name} onChange={e => setForm(p => ({ ...p, display_name: e.target.value }))} placeholder="Optionnel" className="bg-card border-border" />
            </div>
            <div className="col-span-2">
              <label className="font-inter text-xs text-muted-foreground mb-1 block">Username</label>
              <div className="flex gap-2">
                <Input value={form.username} onChange={e => setForm(p => ({ ...p, username: e.target.value }))} placeholder="Entrez un username..." className="bg-card border-border" />
                <Button size="sm" variant="outline" className="border-primary/30 text-primary hover:bg-primary/10 gap-1.5 flex-shrink-0" onClick={generateUsername} disabled={generatingUsername}>
                  {generatingUsername ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
                  <span className="hidden sm:inline">Générer</span>
                </Button>
              </div>
            </div>
          </div>

          {/* Contact Section */}
          <div className="space-y-3 bg-secondary rounded-xl p-4">
            <p className="font-inter text-sm font-medium">Contact & Localisation</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-inter text-xs text-muted-foreground mb-1 block">Téléphone</label>
                <Input value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} placeholder="06 12 34 56 78" className="bg-card border-border" />
              </div>
              <div>
                <label className="font-inter text-xs text-muted-foreground mb-1 block">Localisation</label>
                <Input value={form.location} onChange={e => setForm(p => ({ ...p, location: e.target.value }))} placeholder="Ville, Pays" className="bg-card border-border" />
              </div>
            </div>
            <div>
              <label className="font-inter text-xs text-muted-foreground mb-1 block">Bio</label>
              <Textarea value={form.bio} onChange={e => setForm(p => ({ ...p, bio: e.target.value }))} placeholder="Courte présentation..." className="bg-card border-border resize-none h-16" />
            </div>
            <div>
              <label className="font-inter text-xs text-muted-foreground mb-1 block">Site web</label>
              <Input value={form.website} onChange={e => setForm(p => ({ ...p, website: e.target.value }))} placeholder="https://..." className="bg-card border-border" />
            </div>
          </div>

          {/* Social Section */}
          <div className="space-y-3 bg-secondary rounded-xl p-4">
            <p className="font-inter text-sm font-medium">Réseaux sociaux</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-inter text-xs text-muted-foreground mb-1 block">Twitter/X</label>
                <Input value={form.twitter} onChange={e => setForm(p => ({ ...p, twitter: e.target.value }))} placeholder="@username" className="bg-card border-border" />
              </div>
              <div>
                <label className="font-inter text-xs text-muted-foreground mb-1 block">Instagram</label>
                <Input value={form.instagram} onChange={e => setForm(p => ({ ...p, instagram: e.target.value }))} placeholder="@username" className="bg-card border-border" />
              </div>
              <div>
                <label className="font-inter text-xs text-muted-foreground mb-1 block">LinkedIn</label>
                <Input value={form.linkedin} onChange={e => setForm(p => ({ ...p, linkedin: e.target.value }))} placeholder="username" className="bg-card border-border" />
              </div>
            </div>
          </div>

          {/* Role & Status Section */}
          <div className="space-y-3 bg-secondary rounded-xl p-4">
            <p className="font-inter text-sm font-medium">Rôle & Statut</p>
            
            <div>
              <label className="font-inter text-xs text-muted-foreground mb-1 block">Rôle</label>
              {getUserLevel({ role: user?.role, email: user?.email }) >= myLevel && getUserLevel(user) > 0 ? (
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-500/10 border border-amber-500/30">
                  <span className="font-mono text-xs text-amber-400">{ROLE_CONFIG[user?.role]?.emoji} {ROLE_CONFIG[user?.role]?.label} — non modifiable</span>
                </div>
              ) : (
                <Select value={form.role} onValueChange={v => setForm(p => ({ ...p, role: v }))}>
                  <SelectTrigger className="bg-card border-border"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {assignableRoles.map(r => (
                      <SelectItem key={r.role} value={r.role}>{r.emoji} {r.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            <div>
              <label className="font-inter text-xs text-muted-foreground mb-1 block">Statut du compte</label>
              <Select value={form.account_status} onValueChange={v => setForm(p => ({ ...p, account_status: v }))}>
                <SelectTrigger className="bg-card border-border"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map(s => (
                    <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {form.account_status !== 'active' && form.account_status !== 'closed' && (
              <>
                <div>
                  <label className="font-inter text-xs text-muted-foreground mb-1 block">Raison</label>
                  <Input value={form.suspension_reason} onChange={e => setForm(p => ({ ...p, suspension_reason: e.target.value }))} placeholder="Raison de la restriction..." className="bg-card border-border" />
                </div>
                <div>
                  <label className="font-inter text-xs text-muted-foreground mb-1 block">Jusqu'au (optionnel)</label>
                  <Input type="date" value={form.suspension_until} onChange={e => setForm(p => ({ ...p, suspension_until: e.target.value }))} className="bg-card border-border" />
                </div>
              </>
            )}
            {form.account_status === 'closed' && (
              <div className="space-y-3">
                {/* Red "COMPTE FERMÉ" banner */}
                <div className="rounded-xl overflow-hidden border border-red-600/40">
                  <div className="bg-red-600 flex flex-col items-center justify-center py-4 px-6">
                    <p className="font-grotesk font-black text-white text-xl tracking-widest uppercase">Compte Fermé</p>
                    <p className="font-inter text-red-100 text-xs tracking-wider mt-0.5 italic">Closed</p>
                  </div>
                </div>
                <div className="bg-red-500/5 border border-red-500/20 rounded-lg px-3 py-2">
                  <p className="font-mono text-[10px] text-red-400 uppercase tracking-wider font-bold">⛔ NPS — NE PAS SUPPRIMER</p>
                  <p className="font-inter text-xs text-muted-foreground mt-1">Le compte reste en base pour bloquer le nom d'utilisateur. Il ne peut pas être réutilisé.</p>
                </div>
                <div>
                  <label className="font-inter text-xs text-muted-foreground mb-1 block">
                    Fermé par <span className="text-destructive">*</span>
                  </label>
                  <Select
                    value={form.closed_by || ''}
                    onValueChange={v => {
                      // Seuls les hauts gradés (niveau >= 100) peuvent mettre "La Direction"
                      if (v === 'direction' && myLevel < 100) return;
                      setForm(p => ({ ...p, closed_by: v }));
                    }}
                  >
                    <SelectTrigger className="bg-card border-border"><SelectValue placeholder="Sélectionner..." /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">🛡️ Un administrateur</SelectItem>
                      {myLevel >= 100 && (
                        <SelectItem value="direction">👑 La Direction de Brenne Aerial</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  {myLevel < 100 && (
                    <p className="font-mono text-[10px] text-muted-foreground mt-1">⚠️ Seuls les hauts gradés (PDG / PDG-Adjoint) peuvent fermer au nom de La Direction.</p>
                  )}
                </div>
                <div>
                  <label className="font-inter text-xs text-muted-foreground mb-1 block">Raison de la fermeture (optionnel)</label>
                  <Input value={form.suspension_reason} onChange={e => setForm(p => ({ ...p, suspension_reason: e.target.value }))} placeholder="Ex: Compte inactif, demande volontaire..." className="bg-card border-border" />
                </div>
              </div>
            )}
          </div>

          {/* Verification & Premium Section */}
          <div className="space-y-3 bg-secondary rounded-xl p-4">
            <p className="font-inter text-sm font-medium">Vérification & Premium</p>
            
            <div>
              <label className="font-inter text-xs text-muted-foreground mb-1 block">Statut de vérification</label>
              <Select value={form.verified_status} onValueChange={v => setForm(p => ({ ...p, verified_status: v }))}>
                <SelectTrigger className="bg-card border-border"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {VERIFICATION_OPTIONS.map(v => (
                    <SelectItem key={v.value} value={v.value}>{v.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-inter text-xs text-muted-foreground mb-1 block">Plan d'abonnement</label>
                <Select value={form.subscription_tier} onValueChange={v => setForm(p => ({ ...p, subscription_tier: v }))}>
                  <SelectTrigger className="bg-card border-border"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="free">Gratuit</SelectItem>
                    <SelectItem value="pro">Pro</SelectItem>
                    <SelectItem value="premium">Premium</SelectItem>
                    <SelectItem value="enterprise">Entreprise</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end pb-2">
                <label className="flex items-center gap-2 cursor-pointer w-full">
                  <Switch checked={form.is_premium} onCheckedChange={v => setForm(p => ({ ...p, is_premium: v }))} />
                  <span className="font-inter text-xs text-muted-foreground">Accès premium</span>
                </label>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 justify-end pt-4 border-t border-border">
            <Button size="sm" variant="outline" className="border-border" onClick={onClose}>Annuler</Button>
            <Button size="sm" className="bg-primary text-primary-foreground gap-2" onClick={handleSave} disabled={isLoading}>
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Sauvegarder
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}