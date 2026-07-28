import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Search, Check, Shield } from 'lucide-react';
import VerificationChip from '@/components/ui/VerificationChip';
import VerificationMark from '@/components/ui/VerificationMark';
import { Input } from '@/components/ui/input';
import BadgeChip from '@/components/ui/BadgeChip';
import BadgeEligibilityBlock from '@/components/admin/badges/BadgeEligibilityBlock';
import { toast } from 'sonner';

const ALL_BADGES = ['Fondateur', 'Collaborateur', 'VIP', 'Admin', 'Pilote', 'Officiel', 'Vérifié', 'Beta Testeur', 'Partenaire'];
const BADGE_ICONS = { Fondateur: Check, Collaborateur: Check, VIP: Check, Admin: Check, Pilote: Check, Officiel: Check, Vérifié: Check, 'Beta Testeur': Check, Partenaire: Check };

const VERIFICATION_TYPES = [
  { key: 'verified', label: 'Vérifié', color: 'text-sky-400', bg: 'bg-sky-400/15', border: 'border-sky-400/40', desc: 'Compte vérifié (bleu)' },
  { key: 'certified', label: 'Certifié', color: 'text-amber-400', bg: 'bg-amber-400/15', border: 'border-amber-400/40', desc: 'Certification officielle (jaune)' },
  { key: 'official', label: 'Officiel', color: 'text-purple-400', bg: 'bg-purple-400/15', border: 'border-purple-400/40', desc: 'Entité officielle (violet)' },
  { key: 'pro', label: 'Pro', color: 'text-emerald-400', bg: 'bg-emerald-400/15', border: 'border-emerald-400/40', desc: 'Professionnel validé (vert)' },
  { key: 'government', label: 'Gouvernement', color: 'text-zinc-300', bg: 'bg-zinc-500/15', border: 'border-zinc-400/40', desc: 'Institution gouvernementale ou multilatérale vérifiée (gris)' },
  { key: 'supreme', label: 'Suprême', color: 'text-chart-5', bg: 'bg-chart-5/15', border: 'border-chart-5/40', desc: 'Compte Suprême eza (or)' },
];

export default function AdminBadges() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [expandedUserId, setExpandedUserId] = useState(null);

  React.useEffect(() => { base44.auth.me().then(setCurrentUser).catch(() => {}); }, []);
  const [selectedBadge, setSelectedBadge] = useState('all');

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['adm-badges-users'],
    queryFn: async () => {
      const res = await base44.functions.invoke('adminGetUsers', {});
      return res.data.users || [];
    },
  });

  const updateUser = useMutation({
    mutationFn: ({ id, data }) => base44.functions.invoke('adminUpdateUser', { id, data }),
    onMutate: async ({ id, data }) => {
      await qc.cancelQueries({ queryKey: ['adm-badges-users'] });
      const prev = qc.getQueryData(['adm-badges-users']);
      qc.setQueryData(['adm-badges-users'], old =>
        (old || []).map(u => u.id === id ? { ...u, ...data } : u)
      );
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(['adm-badges-users'], ctx.prev);
      toast.error('Erreur : vérifiez vos droits admin');
    },
    onSuccess: (res, { id, data }) => {
      qc.setQueryData(['adm-badges-users'], old =>
        (old || []).map(u => u.id === id ? { ...u, ...data } : u)
      );
    },
  });

  const toggleVerified = (user) => {
    const newVal = user.verified_status === 'yes' ? 'no' : 'yes';
    updateUser.mutate({ id: user.id, data: { verified_status: newVal } });
    toast.success(newVal === 'no' ? 'Vérification retirée' : 'Compte vérifié !');
  };

  const PDG_EMAILS_LIST = ['contact.astuceson@gmail.com'];
  const PDG_ADJOINT_EMAILS_LIST = ['sentenacborys@gmail.com'];
  const isOwner = currentUser?.role === 'owner' || PDG_EMAILS_LIST.includes(currentUser?.email);
  const isPdgAdjoint = currentUser?.role === 'pdg_adjoint' || PDG_ADJOINT_EMAILS_LIST.includes(currentUser?.email);
  const canManageSupremeAndBadges = isOwner || isPdgAdjoint;

  const toggleVerification = (user, key) => {
    if (key === 'supreme' && !canManageSupremeAndBadges) {
      toast.error('Seul le PDG ou PDG-Adjoint peut attribuer ou retirer le rang Suprême.');
      return;
    }
    const current = user.verifications || [];
    const adding = !current.includes(key);
    const next = adding ? [...current, key] : current.filter(v => v !== key);
    const data = {
      verifications: next,
      ...(key === 'supreme' ? { supreme_assigned_at: adding ? new Date().toISOString() : null } : {}),
    };
    updateUser.mutate({ id: user.id, data });
    const vt = VERIFICATION_TYPES.find(v => v.key === key);
    toast.success(adding ? `${vt?.label} activé` : `${vt?.label} retiré`);
    if (adding) {
      base44.functions.invoke('sendBadgeAssignedEmail', {
          userEmail: user.email,
          userName: user.display_name || user.full_name,
          badgeKey: key,
          type: 'verification',
        }).catch(() => {});
    }
  };

  const toggleBadge = (user, badge) => {
    const badges = user.badges || [];
    const adding = !badges.includes(badge);
    const newBadges = adding ? [...badges, badge] : badges.filter(b => b !== badge);
    updateUser.mutate({ id: user.id, data: { badges: newBadges } });
    toast.success(adding ? `Badge "${badge}" ajouté` : `Badge "${badge}" retiré`);
    if (adding) {
      base44.functions.invoke('sendBadgeAssignedEmail', {
        userEmail: user.email,
        userName: user.display_name || user.full_name,
        badgeLabel: badge,
        type: 'badge',
      }).catch(() => {});
    }
  };

  const toggleIneligible = async (user, reason) => {
    const ineligible = user.badges_eligible === false;
    const data = ineligible
      ? { badges_eligible: true }
      : { badges_eligible: false, badge_ineligibility_reason: reason };
    updateUser.mutate({ id: user.id, data });
    toast.success(ineligible ? 'Éligibilité rétablie' : 'Profil marqué non-éligible aux badges');
  };

  const filtered = users
    .filter(u => !search || (u.display_name || u.full_name)?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase()))
    .filter(u => selectedBadge === 'all' || (selectedBadge === 'verified' ? u.verified_status === 'yes' : u.badges?.includes(selectedBadge)));

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-grotesk font-bold text-2xl">Badges & Certifications</h1>
        <p className="font-inter text-sm text-muted-foreground">Gérez les badges et la vérification des comptes</p>
      </div>

      {/* Filters */}
      <div className="space-y-3 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input placeholder="Rechercher un utilisateur..." value={search} onChange={e => setSearch(e.target.value)} className="bg-card border-border pl-9 w-full" />
        </div>
        <div className="hidden sm:flex gap-1 flex-wrap">
          <button
            onClick={() => setSelectedBadge('all')}
            className={`px-3 py-1.5 rounded-full font-inter text-xs border transition-all ${selectedBadge === 'all' ? 'bg-primary text-primary-foreground border-primary' : 'border-border text-muted-foreground hover:text-foreground'}`}
          >Tous</button>
          <button
            onClick={() => setSelectedBadge('verified')}
            className={`px-3 py-1.5 rounded-full font-inter text-xs border transition-all flex items-center gap-1 ${selectedBadge === 'verified' ? 'bg-accent text-accent-foreground border-accent' : 'border-border text-muted-foreground hover:text-foreground'}`}
          ><VerificationMark type="verified" />Vérifiés</button>
          {ALL_BADGES.map(b => {
            const Icon = BADGE_ICONS[b] || Shield;
            return (
              <button key={b}
                onClick={() => setSelectedBadge(b)}
                className={`px-3 py-1.5 rounded-full font-inter text-xs border transition-all flex items-center gap-1 ${selectedBadge === b ? 'bg-primary text-primary-foreground border-primary' : 'border-border text-muted-foreground hover:text-foreground'}`}
              ><Icon className="w-3 h-3" />{b}</button>
            );
          })}
        </div>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
      <div className="bg-card border border-border rounded-xl p-3">
        <p className="font-mono text-xs text-muted-foreground">Total utilisateurs</p>
        <p className="font-grotesk font-bold text-xl">{users.length}</p>
      </div>
      <div className="bg-card border border-accent/20 rounded-xl p-3">
        <p className="font-mono text-xs text-accent">Comptes vérifiés</p>
        <p className="font-grotesk font-bold text-xl text-accent">{users.filter(u => u.verified_status === 'yes').length}</p>
        </div>
        <div className="bg-card border border-primary/20 rounded-xl p-3">
          <p className="font-mono text-xs text-primary">Avec badges</p>
          <p className="font-grotesk font-bold text-xl text-primary">{users.filter(u => u.badges?.length > 0).length}</p>
          </div>
          <div className="bg-card border border-chart-5/20 rounded-xl p-3">
            <p className="font-mono text-xs text-chart-5">Sans badge</p>
            <p className="font-grotesk font-bold text-xl text-chart-5">{users.filter(u => !u.badges?.length && u.verified_status !== 'yes').length}</p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-10"><div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>
      ) : (
        <div className="space-y-2">
          {filtered.map(u => (
            <div key={u.id} className="bg-card border border-border rounded-xl overflow-hidden hover:border-primary/20 transition-colors">
              {/* Header - Always visible */}
              <div className="p-3 sm:p-4">
                <button
                  onClick={() => setExpandedUserId(expandedUserId === u.id ? null : u.id)}
                  className="w-full text-left flex items-start gap-3"
                >
                  {/* Avatar */}
                   <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 overflow-hidden">
                     {u.avatar_url ? <img src={u.avatar_url} className="w-full h-full object-cover" alt="" /> : <span className="font-grotesk font-bold text-primary text-sm">{(u.display_name || u.full_name)?.[0] || 'U'}</span>}
                   </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-inter text-sm font-medium truncate">{u.display_name || u.full_name || '—'}</p>
                      {u.verified_status === 'yes' && <VerificationMark type="verified" className="flex-shrink-0" />}
                    </div>
                    <p className="font-mono text-xs text-muted-foreground truncate">{u.email}</p>
                    {/* Badges preview */}
                    <div className="flex flex-wrap gap-1 mt-1.5 line-clamp-2">
                      {u.badges?.slice(0, 2).map(b => <BadgeChip key={b} badge={b} size="sm" />)}
                      {u.verifications?.slice(0, 2).map(v => <VerificationChip key={v} type={v} size="sm" />)}
                      {(u.badges?.length || 0) + (u.verifications?.length || 0) > 4 && (
                        <span className="text-[10px] text-muted-foreground font-mono">+{(u.badges?.length || 0) + (u.verifications?.length || 0) - 4}</span>
                      )}
                    </div>
                  </div>
                </button>
              </div>

              {/* Expandable content - Mobile friendly */}
              {expandedUserId === u.id && (
                <div className="border-t border-border bg-secondary/40 p-3 sm:p-4 space-y-4">
                  {/* Éligibilité aux badges */}
                  <BadgeEligibilityBlock user={u} onToggle={(reason) => toggleIneligible(u, reason)} />

                  {/* Verifications grid - 2 cols on mobile */}
                  <div>
                    <p className="font-inter text-xs font-semibold text-muted-foreground mb-2.5 uppercase tracking-wide">Vérifications — cliquez pour attribuer</p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {VERIFICATION_TYPES.map(vt => {
                        const active = (u.verifications || []).includes(vt.key);
                        const locked = u.badges_eligible === false;
                        return (
                          <button
                            key={vt.key}
                            onClick={() => toggleVerification(u, vt.key)}
                            disabled={(vt.key === 'supreme' && !canManageSupremeAndBadges) || locked}
                            title={locked ? 'Profil non-éligible aux badges' : vt.desc}
                            className={`flex flex-col items-center justify-center gap-1.5 rounded-lg px-2 py-2.5 border transition-all ${active ? `${vt.bg} ${vt.border}` : 'bg-background border-border hover:border-primary/30'} ${locked ? 'opacity-40 cursor-not-allowed' : ''}`}
                          >
                            <span style={{ fontSize: '1rem' }}><VerificationMark type={vt.key} /></span>
                            <span className={`font-inter text-[9px] font-semibold text-center leading-tight ${active ? vt.color : 'text-muted-foreground'}`}>{vt.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Badges grid - 2 cols */}
                  <div>
                    <p className="font-inter text-xs font-semibold text-muted-foreground mb-2.5 uppercase tracking-wide">Badges ({u.badges?.length || 0})</p>
                    <div className="grid grid-cols-2 gap-2">
                      {ALL_BADGES.map(badge => {
                        const hasBadge = u.badges?.includes(badge);
                        const Icon = BADGE_ICONS[badge] || Shield;
                        const locked = u.badges_eligible === false;
                        return (
                          <button
                            key={badge}
                            onClick={() => toggleBadge(u, badge)}
                            disabled={locked}
                            className={`flex flex-col items-center justify-center gap-1.5 rounded-lg px-2 py-2.5 border transition-all ${
                              hasBadge
                                ? 'bg-primary/20 text-primary border-primary/40'
                                : 'bg-background border-border text-muted-foreground hover:border-primary/30 hover:text-foreground'
                            } ${locked ? 'opacity-40 cursor-not-allowed' : ''}`}
                          >
                            <Icon className="w-4 h-4" />
                            <span className="font-inter text-[9px] font-semibold text-center leading-tight truncate w-full">{badge}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="text-center py-16 text-muted-foreground font-inter text-sm">Aucun utilisateur trouvé</div>
          )}
        </div>
      )}
    </div>
  );
}