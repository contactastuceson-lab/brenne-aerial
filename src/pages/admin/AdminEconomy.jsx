import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import {
  TrendingUp, Users, Gift, Coins, Loader2, RefreshCw,
  Check, Clock, Award, Zap, Trash2, Plus, Minus, Search,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import RecompensesTab from '@/components/admin/economy/RecompensesTab';

const TABS = [
  { id: 'economie', label: 'Économie', icon: TrendingUp },
  { id: 'parrainage', label: 'Parrainage', icon: Users },
  { id: 'recompenses', label: 'Récompenses', icon: Gift },
];

const REFERRAL_STATUS = {
  pending: { label: 'En attente', color: 'text-amber-400 bg-amber-400/10 border-amber-400/30' },
  validated: { label: 'Validé', color: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/30' },
  rewarded: { label: 'Récompensé', color: 'text-sky-400 bg-sky-400/10 border-sky-400/30' },
};

const EARNING_RULES = [
  { label: "Filleul s'inscrit", credits: 50 },
  { label: 'Filleul complète son profil', credits: 10 },
  { label: 'Filleul publie son 1er post', credits: 20 },
  { label: 'Filleul reçoit 100 likes', credits: 30 },
  { label: 'Filleul obtient un badge', credits: 30 },
  { label: 'Filleul devient vérifié', credits: 40 },
  { label: 'Filleul rejoint une communauté', credits: 15 },
  { label: 'Filleul crée son 1er Space', credits: 25 },
  { label: 'Filleul participe au forum', credits: 15 },
  { label: 'Filleul souscrit Premium', credits: 100 },
  { label: 'Filleul souscrit Business', credits: 150 },
  { label: 'Filleul souscrit Enterprise', credits: 200 },
  { label: 'Filleul parraine un autre membre', credits: 20 },
  { label: 'Filleul reste actif 30 jours', credits: 50 },
  { label: 'Filleul est mentionné dans un post', credits: 10 },
];

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-2 ${color}`}>
        <Icon className="w-4 h-4" />
      </div>
      <p className="font-grotesk font-black text-2xl text-foreground">{value}</p>
      <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
    </div>
  );
}

function CreditAdjuster() {
  const qc = useQueryClient();
  const [query, setQuery] = useState('');
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  const [found, setFound] = useState(null);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [applying, setApplying] = useState(false);

  // Charge la liste des utilisateurs une fois au focus
  const loadUsers = async () => {
    if (allUsers.length > 0 || loading) return;
    setLoading(true);
    try {
      const res = await base44.functions.invoke('adminGetUsers', {});
      setAllUsers(res.data?.users || []);
    } catch { toast.error('Erreur de chargement'); }
    setLoading(false);
  };

  const suggestions = query.trim().length >= 1
    ? allUsers.filter(u => {
        const q = query.toLowerCase();
        return (u.email || '').toLowerCase().includes(q)
          || (u.full_name || '').toLowerCase().includes(q)
          || (u.display_name || '').toLowerCase().includes(q);
      }).slice(0, 8)
    : [];

  const apply = async (delta) => {
    if (!found) return;
    setApplying(true);
    try {
      const newCredits = Math.max(0, (found.referral_credits || 0) + delta);
      await base44.functions.invoke('adminUpdateUser', { id: found.id, data: { referral_credits: newCredits, credit_reason: reason.trim() || null } });
      setFound({ ...found, referral_credits: newCredits });
      toast.success(delta >= 0 ? `+${delta} crédits ajoutés (email envoyé)` : `${delta} crédits retirés (email envoyé)`);
      setReason('');
      setAmount('');
      qc.invalidateQueries({ queryKey: ['admin-referrals'] });
    } catch { toast.error('Erreur'); }
    setApplying(false);
  };

  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden">
      <div className="px-4 py-3 border-b border-border flex items-center gap-2">
        <Coins className="w-4 h-4 text-amber-400" />
        <p className="font-grotesk font-semibold text-sm">Ajuster les crédits d'un utilisateur</p>
      </div>
      <div className="p-4 space-y-3">
        {/* Recherche utilisateur (auto-complète) */}
        <div className="relative">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-muted-foreground/50 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <Input
              value={found ? `${found.display_name || found.full_name || ''} · ${found.email}` : query}
              onChange={e => { setFound(null); setQuery(e.target.value); }}
              onFocus={loadUsers}
              placeholder="Rechercher par nom ou email…"
              className="pl-8 text-xs"
            />
          </div>
          {loading && (
            <div className="absolute right-2.5 top-1/2 -translate-y-1/2"><Loader2 className="w-3.5 h-3.5 animate-spin text-muted-foreground/50" /></div>
          )}
          {!found && query.trim().length >= 1 && (
            <div className="absolute z-20 left-0 right-0 mt-1 rounded-xl border border-border bg-popover shadow-lg overflow-hidden max-h-60 overflow-y-auto">
              {suggestions.length === 0 ? (
                <p className="px-3 py-2.5 text-xs text-muted-foreground/60">Aucun utilisateur</p>
              ) : suggestions.map(u => (
                <button key={u.id} onClick={() => { setFound(u); setQuery(''); }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-secondary/60 text-left border-b border-border/40 last:border-0">
                  <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {u.avatar_url ? <img src={u.avatar_url} className="w-full h-full object-cover" alt="" />
                      : <span className="font-grotesk font-bold text-[10px] text-primary">{u.full_name?.[0] || '?'}</span>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-inter text-xs text-foreground truncate">{u.display_name || u.full_name || '—'}</p>
                    <p className="font-mono text-[10px] text-muted-foreground/60 truncate">{u.email}</p>
                  </div>
                  <span className="font-mono text-[10px] text-amber-400 flex-shrink-0">{u.referral_credits || 0} cr</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Utilisateur sélectionné */}
        {found && (
          <div className="flex items-center gap-3 p-3 rounded-xl bg-secondary/40 border border-border">
            <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 overflow-hidden">
              {found.avatar_url ? <img src={found.avatar_url} className="w-full h-full object-cover" alt="" /> :
                <span className="font-grotesk font-bold text-xs text-primary">{found.full_name?.[0] || '?'}</span>}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-inter text-sm text-foreground truncate">{found.display_name || found.full_name}</p>
              <p className="font-mono text-[10px] text-muted-foreground/60 truncate">{found.email}</p>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="font-mono text-[10px] text-muted-foreground/60">Solde</p>
              <p className="font-grotesk font-black text-lg text-amber-400">{found.referral_credits || 0}</p>
            </div>
            <button onClick={() => setFound(null)} className="text-muted-foreground/50 hover:text-foreground text-lg leading-none ml-1">×</button>
          </div>
        )}

        {found && (
          <Input value={reason} onChange={e => setReason(e.target.value)} placeholder="Motif (envoyé par email à l'utilisateur)…"
            className="text-xs" />
        )}
        {found && (
          <div className="flex flex-wrap items-center gap-2">
            <Input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="Montant"
              className="w-32" />
            <Button onClick={() => apply(parseInt(amount) || 0)} disabled={applying || !amount || parseInt(amount) <= 0}
              size="sm" className="bg-emerald-500 hover:bg-emerald-600 text-white flex items-center gap-1.5">
              <Plus className="w-3.5 h-3.5" /> Créditer
            </Button>
            <Button onClick={() => apply(-(parseInt(amount) || 0))} disabled={applying || !amount || parseInt(amount) <= 0}
              size="sm" className="bg-red-500 hover:bg-red-600 text-white flex items-center gap-1.5">
              <Minus className="w-3.5 h-3.5" /> Débiter
            </Button>
            <div className="flex gap-1 ml-auto">
              {[10, 50, 100].map(v => (
                <button key={v} onClick={() => setAmount(String(v))}
                  className="px-2.5 py-1 rounded-lg text-xs font-mono border border-border text-muted-foreground hover:text-foreground hover:border-primary/30 transition-all">
                  {v}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function EconomieTab() {
  const qc = useQueryClient();
  const [resetting, setResetting] = useState(false);
  const { data: referrals = [] } = useQuery({
    queryKey: ['admin-referrals'],
    queryFn: () => base44.entities.Referral.list('-created_date', 500),
  });
  const { data: redemptions = [] } = useQuery({
    queryKey: ['admin-redemptions'],
    queryFn: () => base44.entities.RewardRedemption.list('-created_date', 500),
  });

  const handleResetAll = async () => {
    if (!confirm('⚠️ RESET GLOBAL\n\nCette action va :\n• Vider les perks/tokens de TOUS les utilisateurs\n• Réinitialiser TOUTES les communautés (unpin, capacité 100, premium retiré)\n• Rejeter TOUTES les réclamations en cours\n\nIRREVERSIBLE. Continuer ?')) return;
    if (!confirm('Dernière confirmation — êtes-vous absolument sûr ?')) return;
    setResetting(true);
    try {
      const res = await base44.functions.invoke('adminManageRedemption', { action: 'reset_all' });
      if (res.data?.error) { toast.error(res.data.error); return; }
      toast.success(res.data?.message || 'Reset global effectué');
      qc.invalidateQueries({ queryKey: ['admin-referrals'] });
      qc.invalidateQueries({ queryKey: ['admin-redemptions'] });
    } catch { toast.error('Erreur lors du reset'); }
    setResetting(false);
  };

  const totalCreditsAwarded = referrals.reduce((s, r) => s + (r.credits_earned || 0), 0);
  const totalCreditsRedeemed = redemptions.reduce((s, r) => s + (r.cost || 0), 0);
  const pendingRedemptions = redemptions.filter(r => r.status === 'pending');
  const uniqueReferrers = new Set(referrals.map(r => r.referrer_email)).size;

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard icon={Users} label="Parrains actifs" value={uniqueReferrers} color="bg-sky-400/10 text-sky-400" />
        <StatCard icon={Coins} label="Crédits distribués" value={totalCreditsAwarded} color="bg-amber-400/10 text-amber-400" />
        <StatCard icon={Gift} label="Crédits échangés" value={totalCreditsRedeemed} color="bg-emerald-400/10 text-emerald-400" />
        <StatCard icon={Clock} label="Réclamations en attente" value={pendingRedemptions.length} color="bg-orange-400/10 text-orange-400" />
      </div>

      {/* Manual credit adjustment */}
      <CreditAdjuster />

      {/* Earning rules */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="px-4 py-3 border-b border-border flex items-center gap-2">
          <Zap className="w-4 h-4 text-amber-400" />
          <p className="font-grotesk font-semibold text-sm">Règles de gain (crédits par action de filleul)</p>
        </div>
        <div className="divide-y divide-border/60">
         {EARNING_RULES.map((rule, i) => (
           <div key={i} className="flex items-center justify-between px-4 py-2.5">
             <p className="font-inter text-sm text-foreground/80">{rule.label}</p>
             <span className="font-mono text-sm font-bold text-amber-400">+{rule.credits} cr</span>
           </div>
         ))}
        </div>
        </div>

        {/* Danger zone — Reset global */}
        <div className="rounded-2xl border border-red-500/30 bg-red-500/5 overflow-hidden">
        <div className="px-4 py-3 border-b border-red-500/20 flex items-center gap-2">
        <Trash2 className="w-4 h-4 text-red-400" />
        <p className="font-grotesk font-semibold text-sm text-red-400">Zone de danger — Reset global</p>
        </div>
        <div className="p-4">
        <p className="font-inter text-xs text-muted-foreground mb-3">
          Réinitialise tout le système de récompenses : vide les perks/tokens de tous les utilisateurs,
          réinitialise toutes les communautés (unpin, capacité 100, premium retiré) et rejette toutes
          les réclamations en cours. <strong className="text-red-400">Irréversible.</strong>
        </p>
        <Button onClick={handleResetAll} disabled={resetting}
          className="bg-red-500 hover:bg-red-600 text-white flex items-center gap-2">
          {resetting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
          {resetting ? 'Reset en cours…' : 'Reset global'}
        </Button>
        </div>
        </div>
        </div>
        );
        }

function ParrainageTab() {
  const qc = useQueryClient();
  const [statusFilter, setStatusFilter] = useState('all');
  const [busy, setBusy] = useState(null);

  const { data: referrals = [], isLoading } = useQuery({
    queryKey: ['admin-referrals'],
    queryFn: () => base44.entities.Referral.list('-created_date', 500),
  });

  const filtered = statusFilter === 'all' ? referrals : referrals.filter(r => r.status === statusFilter);

  const updateStatus = async (id, status) => {
    setBusy(id);
    try {
      await base44.entities.Referral.update(id, { status });
      toast.success(status === 'validated' ? 'Parrainage validé' : status === 'rewarded' ? 'Parrainage récompensé' : 'Statut mis à jour');
      qc.invalidateQueries({ queryKey: ['admin-referrals'] });
    } catch { toast.error('Erreur'); }
    setBusy(null);
  };

  const remove = async (id) => {
    if (!confirm('Supprimer ce parrainage ?')) return;
    setBusy(id);
    try {
      await base44.entities.Referral.delete(id);
      toast.success('Parrainage supprimé');
      qc.invalidateQueries({ queryKey: ['admin-referrals'] });
    } catch { toast.error('Erreur'); }
    setBusy(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-1.5 flex-wrap">
        {['all', 'pending', 'validated', 'rewarded'].map(s => (
          <button key={s} onClick={() => setStatusFilter(s)}
            className={`px-3 py-1.5 rounded-full text-xs font-grotesk font-bold border transition-all ${
              statusFilter === s ? 'bg-primary text-primary-foreground border-primary' : 'border-border text-muted-foreground hover:text-foreground'
            }`}>
            {s === 'all' ? 'Tous' : REFERRAL_STATUS[s]?.label}
          </button>
        ))}
        <Button variant="ghost" size="icon" className="h-8 w-8 ml-auto"
          onClick={() => qc.invalidateQueries({ queryKey: ['admin-referrals'] })}>
          <RefreshCw className="w-3.5 h-3.5" />
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-10"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground/50 text-sm">Aucun parrainage trouvé</div>
      ) : (
        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          <div className="max-h-[60vh] overflow-y-auto divide-y divide-border/60">
            {filtered.map(r => {
              const s = REFERRAL_STATUS[r.status] || REFERRAL_STATUS.pending;
              const isBusy = busy === r.id;
              return (
                <div key={r.id} className="flex items-center gap-3 px-4 py-3">
                  <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="font-grotesk font-bold text-xs text-primary">
                      {(r.referred_name || r.referred_email || '?')[0]?.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-inter text-sm text-foreground truncate">
                      <span className="text-muted-foreground">Parrain:</span> {r.referrer_name}
                    </p>
                    <p className="font-inter text-xs text-muted-foreground/70 truncate">
                      Filleul: {r.referred_name || r.referred_email}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono border ${s.color}`}>{s.label}</span>
                    {r.credits_earned > 0 && <span className="font-mono text-xs font-bold text-amber-400">+{r.credits_earned}</span>}
                    {r.status === 'pending' && (
                      <button onClick={() => updateStatus(r.id, 'validated')} disabled={isBusy} title="Valider"
                        className="w-7 h-7 rounded-lg bg-emerald-400/10 border border-emerald-400/30 flex items-center justify-center hover:bg-emerald-400/20 transition-all disabled:opacity-50">
                        {isBusy ? <Loader2 className="w-3 h-3 animate-spin text-emerald-400" /> : <Check className="w-3.5 h-3.5 text-emerald-400" />}
                      </button>
                    )}
                    {r.status === 'validated' && (
                      <button onClick={() => updateStatus(r.id, 'rewarded')} disabled={isBusy} title="Marquer récompensé"
                        className="w-7 h-7 rounded-lg bg-sky-400/10 border border-sky-400/30 flex items-center justify-center hover:bg-sky-400/20 transition-all disabled:opacity-50">
                        <Award className="w-3.5 h-3.5 text-sky-400" />
                      </button>
                    )}
                    <button onClick={() => remove(r.id)} disabled={isBusy} title="Supprimer"
                      className="w-7 h-7 rounded-lg bg-red-400/10 border border-red-400/30 flex items-center justify-center hover:bg-red-400/20 transition-all disabled:opacity-50">
                      <Trash2 className="w-3.5 h-3.5 text-red-400" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminEconomy() {
  const [tab, setTab] = useState('economie');

  return (
    <div className="pt-16 md:pt-20 min-h-screen pb-20">
      <div className="max-w-5xl mx-auto px-4 lg:px-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 mb-6">
          <div className="w-11 h-11 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
            <TrendingUp className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="font-grotesk font-bold text-xl md:text-2xl">Économie</h1>
            <p className="font-inter text-xs text-muted-foreground mt-0.5">
              Gérez le système de crédits, parrainages et récompenses.
            </p>
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-1 overflow-x-auto scrollbar-hide pb-2 mb-5 -mx-4 px-4 md:mx-0 md:px-0">
          {TABS.map(t => {
            const Icon = t.icon;
            const active = tab === t.id;
            return (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-full font-inter text-sm whitespace-nowrap flex-shrink-0 border transition-all ${
                  active ? 'bg-primary text-primary-foreground border-primary font-medium' : 'border-border text-muted-foreground hover:text-foreground hover:bg-secondary/40'
                }`}>
                <Icon className="w-3.5 h-3.5" /> {t.label}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          <motion.div key={tab}
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}>
            {tab === 'economie' && <EconomieTab />}
            {tab === 'parrainage' && <ParrainageTab />}
            {tab === 'recompenses' && <RecompensesTab />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}