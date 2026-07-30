import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import {
  Search, Sparkles, Crown, Building2, Rocket, Plus, Minus, X,
  Loader2, RefreshCw, ChevronRight, CalendarClock, Users,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

const DAY = 86400000;
const TIERS = [
  { key: 'premium_until', label: 'Premium', icon: Sparkles, color: 'text-primary', bg: 'bg-primary/10', border: 'border-primary/30' },
  { key: 'business_until', label: 'Business', icon: Building2, color: 'text-amber-400', bg: 'bg-amber-400/10', border: 'border-amber-400/30' },
  { key: 'enterprise_until', label: 'Enterprise', icon: Rocket, color: 'text-violet-400', bg: 'bg-violet-400/10', border: 'border-violet-400/30' },
  { key: 'vip_until', label: 'VIP', icon: Crown, color: 'text-pink-400', bg: 'bg-pink-400/10', border: 'border-pink-400/30' },
];

const DURATIONS = [
  { days: 30, label: '1 mois' },
  { days: 90, label: '3 mois' },
  { days: 365, label: '1 an' },
];

function isPerkActive(v) {
  if (!v) return false;
  if (v === true || v === null) return true;
  return new Date(v).getTime() > Date.now();
}

function daysLeft(v) {
  if (!v || v === true) return null;
  const ms = new Date(v).getTime() - Date.now();
  if (ms <= 0) return 0;
  return Math.ceil(ms / DAY);
}

function getActiveTier(perks) {
  for (const t of TIERS) if (isPerkActive(perks[t.key])) return t;
  return null;
}

function formatDate(v) {
  if (!v) return '—';
  return new Date(v).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function PerkSubscriptionsTab() {
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const qc = useQueryClient();

  const { data: users = [], isLoading, refetch } = useQuery({
    queryKey: ['admin-perk-subs-users'],
    queryFn: async () => {
      const res = await base44.functions.invoke('adminGetUsers', {});
      return res.data?.users || [];
    },
  });

  const filtered = useMemo(() => {
    if (!search) return users;
    const q = search.toLowerCase();
    return users.filter(u =>
      u.email?.toLowerCase().includes(q) ||
      u.username?.toLowerCase().includes(q) ||
      u.full_name?.toLowerCase().includes(q)
    );
  }, [users, search]);

  // Sort: active subscriptions first, then by name
  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      const ta = getActiveTier(a.perks);
      const tb = getActiveTier(b.perks);
      if (ta && !tb) return -1;
      if (!ta && tb) return 1;
      return (a.full_name || a.email || '').localeCompare(b.full_name || b.email || '');
    });
  }, [filtered]);

  const updateMutation = useMutation({
    mutationFn: async ({ userId, perks }) => {
      const res = await base44.functions.invoke('adminUpdateUser', { id: userId, data: { perks } });
      if (res.data?.error) throw new Error(res.data.error);
      return res.data;
    },
    onSuccess: () => {
      toast.success('Abonnement mis à jour');
      qc.invalidateQueries({ queryKey: ['admin-perk-subs-users'] });
      setSelected(null);
    },
    onError: (e) => toast.error(e?.message || 'Erreur'),
  });

  const activeCount = users.filter(u => getActiveTier(u.perks)).length;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h2 className="font-grotesk font-bold text-lg flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            Abonnements Eza
          </h2>
          <p className="font-inter text-xs text-muted-foreground mt-0.5">
            Gérez les abonnements Premium / Business / Enterprise / VIP attribués via la boutique ou manuellement.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/30">
            <Users className="w-3.5 h-3.5 text-primary" />
            <span className="font-mono text-xs text-primary font-bold">{activeCount}</span>
            <span className="font-mono text-[10px] text-muted-foreground">actifs</span>
          </div>
          <Button variant="outline" size="sm" className="border-border gap-1.5 text-xs h-8" onClick={() => refetch()}>
            <RefreshCw className="w-3.5 h-3.5" /> Actualiser
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
        <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher un utilisateur…"
          className="pl-9 h-9 text-sm bg-secondary border-border" />
      </div>

      {/* List */}
      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 text-primary animate-spin" /></div>
      ) : sorted.length === 0 ? (
        <div className="text-center py-12 bg-card border border-border rounded-2xl">
          <Users className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
          <p className="text-xs text-muted-foreground">Aucun utilisateur trouvé</p>
        </div>
      ) : (
        <div className="space-y-1.5 max-h-[60vh] overflow-y-auto pr-1">
          {sorted.map(u => {
            const tier = getActiveTier(u.perks);
            const TierIcon = tier?.icon;
            return (
              <button key={u.id} onClick={() => setSelected(u)}
                className="w-full flex items-center gap-3 p-3 bg-card border border-border rounded-xl hover:border-primary/30 transition-colors text-left">
                <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <span className="font-grotesk font-bold text-xs text-primary">
                    {(u.full_name || u.email || '?')[0]?.toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-inter text-sm font-medium truncate">{u.full_name || u.username || '—'}</p>
                  <p className="font-mono text-[10px] text-muted-foreground truncate">{u.email}</p>
                </div>
                {tier ? (
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${tier.bg} ${tier.border} ${tier.color}`}>
                      <TierIcon className="w-3 h-3" /> {tier.label}
                    </span>
                    <span className="font-mono text-[10px] text-muted-foreground hidden sm:inline">
                      {daysLeft(u.perks[tier.key])}j
                    </span>
                  </div>
                ) : (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-muted/30 text-muted-foreground border border-border flex-shrink-0">
                    Gratuit
                  </span>
                )}
                <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              </button>
            );
          })}
        </div>
      )}

      {/* Management dialog */}
      {selected && (
        <ManageDialog
          user={selected}
          onClose={() => setSelected(null)}
          onAction={(perks) => updateMutation.mutate({ userId: selected.id, perks })}
          saving={updateMutation.isPending}
        />
      )}
    </div>
  );
}

function ManageDialog({ user, onClose, onAction, saving }) {
  const perks = user.perks || {};
  const [tierKey, setTierKey] = useState('premium_until');
  const [duration, setDuration] = useState(30);

  const grant = () => {
    const newPerks = { ...perks };
    const current = perks[tierKey];
    const base = current && new Date(current).getTime() > Date.now() ? new Date(current).getTime() : Date.now();
    newPerks[tierKey] = new Date(base + duration * DAY).toISOString();
    onAction(newPerks);
  };

  const extend = (key, days) => {
    const newPerks = { ...perks };
    const current = perks[key];
    const base = current && new Date(current).getTime() > Date.now() ? new Date(current).getTime() : Date.now();
    newPerks[key] = new Date(base + days * DAY).toISOString();
    onAction(newPerks);
  };

  const revoke = (key) => {
    const newPerks = { ...perks };
    delete newPerks[key];
    onAction(newPerks);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}>
      <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-card border border-border rounded-2xl w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-border sticky top-0 bg-card z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="font-grotesk font-bold text-sm text-primary">
                {(user.full_name || user.email || '?')[0]?.toUpperCase()}
              </span>
            </div>
            <div>
              <h2 className="font-grotesk font-bold text-sm">{user.full_name || user.username || 'Utilisateur'}</h2>
              <p className="font-mono text-[10px] text-muted-foreground">{user.email}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* Current subscriptions */}
          <div>
            <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider mb-2">Abonnements actuels</p>
            <div className="space-y-1.5">
              {TIERS.map(t => {
                const Icon = t.icon;
                const active = isPerkActive(perks[t.key]);
                return (
                  <div key={t.key} className={`flex items-center gap-2 p-2.5 rounded-xl border ${active ? t.border + ' ' + t.bg : 'border-border bg-secondary/30'}`}>
                    <Icon className={`w-4 h-4 ${active ? t.color : 'text-muted-foreground/50'}`} />
                    <span className={`font-grotesk font-bold text-xs ${active ? t.color : 'text-muted-foreground'}`}>{t.label}</span>
                    {active ? (
                      <span className="font-mono text-[10px] text-muted-foreground ml-1 flex items-center gap-1">
                        <CalendarClock className="w-3 h-3" /> {formatDate(perks[t.key])} · {daysLeft(perks[t.key])}j
                      </span>
                    ) : (
                      <span className="font-mono text-[10px] text-muted-foreground/40">inactif</span>
                    )}
                    <div className="ml-auto flex items-center gap-1">
                      {active && (
                        <>
                          <button onClick={() => extend(t.key, 30)} disabled={saving}
                            className="p-1.5 rounded-lg hover:bg-primary/10 text-primary transition-colors" title="Prolonger +30j">
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => revoke(t.key)} disabled={saving}
                            className="p-1.5 rounded-lg hover:bg-destructive/10 text-destructive transition-colors" title="Révoquer">
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Grant new */}
          <div className="border-t border-border pt-4">
            <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider mb-3">Attribuer un abonnement</p>
            <div className="space-y-3">
              <div>
                <label className="font-inter text-xs text-muted-foreground mb-1.5 block">Palier</label>
                <div className="grid grid-cols-2 gap-2">
                  {TIERS.map(t => {
                    const Icon = t.icon;
                    const active = tierKey === t.key;
                    return (
                      <button key={t.key} onClick={() => setTierKey(t.key)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-grotesk font-bold transition-all ${active ? t.border + ' ' + t.bg + ' ' + t.color : 'border-border text-muted-foreground hover:border-primary/20'}`}>
                        <Icon className="w-3.5 h-3.5" /> {t.label}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div>
                <label className="font-inter text-xs text-muted-foreground mb-1.5 block">Durée</label>
                <div className="grid grid-cols-3 gap-2">
                  {DURATIONS.map(d => (
                    <button key={d.days} onClick={() => setDuration(d.days)}
                      className={`px-2 py-2 rounded-xl border text-xs font-mono font-bold transition-all ${duration === d.days ? 'bg-primary text-primary-foreground border-primary' : 'border-border text-muted-foreground hover:border-primary/20'}`}>
                      {d.label}
                    </button>
                  ))}
                </div>
              </div>
              <Button onClick={grant} disabled={saving} className="w-full gap-1.5 text-xs h-9">
                {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                {isPerkActive(perks[tierKey]) ? 'Prolonger' : 'Activer'} l'abonnement
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}