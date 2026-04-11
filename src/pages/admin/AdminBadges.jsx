import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Search, CheckCircle, ShieldCheck, Award, Star, Zap, Shield, Users, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import BadgeChip from '@/components/ui/BadgeChip';
import { toast } from 'sonner';

const ALL_BADGES = ['Fondateur', 'Collaborateur', 'VIP', 'Admin', 'Pilote', 'Officiel', 'Vérifié', 'Beta Testeur', 'Partenaire'];

const BADGE_ICONS = { Fondateur: Crown, Collaborateur: Users, VIP: Star, Admin: Shield, Pilote: Zap, Officiel: CheckCircle, Vérifié: CheckCircle, 'Beta Testeur': Zap, Partenaire: Award };

export default function AdminBadges() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
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
    onSuccess: () => {
      setTimeout(() => qc.invalidateQueries({ queryKey: ['adm-badges-users'] }), 1000);
    },
  });

  const toggleVerified = (user) => {
    updateUser.mutate({ id: user.id, data: { is_verified: !user.is_verified } });
    toast.success(user.is_verified ? 'Vérification retirée' : 'Compte vérifié !');
  };

  const toggleBadge = (user, badge) => {
    const badges = user.badges || [];
    const newBadges = badges.includes(badge) ? badges.filter(b => b !== badge) : [...badges, badge];
    updateUser.mutate({ id: user.id, data: { badges: newBadges } });
    toast.success(badges.includes(badge) ? `Badge "${badge}" retiré` : `Badge "${badge}" ajouté`);
  };

  const filtered = users
    .filter(u => !search || u.full_name?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase()))
    .filter(u => selectedBadge === 'all' || (selectedBadge === 'verified' ? u.is_verified : u.badges?.includes(selectedBadge)));

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-grotesk font-bold text-2xl">Badges & Certifications</h1>
        <p className="font-inter text-sm text-muted-foreground">Gérez les badges et la vérification des comptes</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input placeholder="Rechercher un utilisateur..." value={search} onChange={e => setSearch(e.target.value)} className="bg-card border-border pl-9" />
        </div>
        <div className="flex gap-1 flex-wrap">
          <button
            onClick={() => setSelectedBadge('all')}
            className={`px-3 py-1.5 rounded-full font-inter text-xs border transition-all ${selectedBadge === 'all' ? 'bg-primary text-primary-foreground border-primary' : 'border-border text-muted-foreground hover:text-foreground'}`}
          >Tous</button>
          <button
            onClick={() => setSelectedBadge('verified')}
            className={`px-3 py-1.5 rounded-full font-inter text-xs border transition-all flex items-center gap-1 ${selectedBadge === 'verified' ? 'bg-accent text-accent-foreground border-accent' : 'border-border text-muted-foreground hover:text-foreground'}`}
          ><CheckCircle className="w-3 h-3" />Vérifiés</button>
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
          <p className="font-grotesk font-bold text-xl text-accent">{users.filter(u => u.is_verified).length}</p>
        </div>
        <div className="bg-card border border-primary/20 rounded-xl p-3">
          <p className="font-mono text-xs text-primary">Avec badges</p>
          <p className="font-grotesk font-bold text-xl text-primary">{users.filter(u => u.badges?.length > 0).length}</p>
        </div>
        <div className="bg-card border border-chart-5/20 rounded-xl p-3">
          <p className="font-mono text-xs text-chart-5">Sans badge</p>
          <p className="font-grotesk font-bold text-xl text-chart-5">{users.filter(u => !u.badges?.length && !u.is_verified).length}</p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-10"><div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>
      ) : (
        <div className="space-y-2">
          {filtered.map(u => (
            <div key={u.id} className="bg-card border border-border rounded-xl p-4 hover:border-primary/20 transition-colors">
              <div className="flex items-start gap-4 flex-wrap">
                {/* Avatar */}
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 overflow-hidden">
                  {u.avatar_url ? <img src={u.avatar_url} className="w-full h-full object-cover" alt="" /> : <span className="font-grotesk font-bold text-primary">{u.full_name?.[0] || 'U'}</span>}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-inter text-sm font-medium">{u.full_name || '—'}</p>
                    {u.is_verified && <CheckCircle className="w-3.5 h-3.5 text-accent" />}
                  </div>
                  <p className="font-mono text-xs text-muted-foreground">{u.email}</p>
                  {u.badges?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {u.badges.map(b => <BadgeChip key={b} badge={b} size="sm" />)}
                    </div>
                  )}
                </div>

                {/* Verified toggle */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <div className="flex items-center gap-2 bg-secondary rounded-lg px-3 py-2">
                    <CheckCircle className={`w-3.5 h-3.5 ${u.is_verified ? 'text-accent' : 'text-muted-foreground'}`} />
                    <span className="font-inter text-xs">Vérifié</span>
                    <Switch
                      checked={u.is_verified || false}
                      onCheckedChange={() => toggleVerified(u)}
                    />
                  </div>
                </div>
              </div>

              {/* Badge grid */}
              <div className="mt-3 pt-3 border-t border-border">
                <p className="font-inter text-[11px] text-muted-foreground mb-2">Badges attribués :</p>
                <div className="flex flex-wrap gap-2">
                  {ALL_BADGES.map(badge => {
                    const hasBadge = u.badges?.includes(badge);
                    const Icon = BADGE_ICONS[badge] || Shield;
                    return (
                      <button
                        key={badge}
                        onClick={() => toggleBadge(u, badge)}
                        className={`flex items-center gap-1 font-inter text-[10px] px-2.5 py-1 rounded-full border transition-all ${
                          hasBadge
                            ? 'bg-primary/15 text-primary border-primary/30'
                            : 'bg-secondary border-border text-muted-foreground hover:border-primary/30 hover:text-foreground'
                        }`}
                      >
                        <Icon className="w-2.5 h-2.5" />
                        {badge}
                      </button>
                    );
                  })}
                </div>
              </div>
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