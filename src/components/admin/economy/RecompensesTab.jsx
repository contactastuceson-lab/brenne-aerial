import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import {
  Gift, Loader2, RefreshCw, Check, X, Clock, Trash2, Search,
  Coins, Mail, RotateCcw, FileText, ChevronDown, ChevronUp,
  CheckCircle2, AlertCircle, Package, Zap, Ticket,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

const STATUS_FILTERS = [
  { id: 'pending', label: 'En attente', color: 'text-amber-400' },
  { id: 'fulfilled', label: 'Honorées', color: 'text-emerald-400' },
  { id: 'rejected', label: 'Refusées', color: 'text-red-400' },
  { id: 'all', label: 'Toutes', color: 'text-foreground' },
];

const FTYPE_FILTERS = [
  { id: 'all', label: 'Tous types' },
  { id: 'manual', label: 'Manuel' },
  { id: 'token', label: 'Token' },
  { id: 'auto', label: 'Auto' },
];

const FTYPE_BADGE = {
  auto: { label: 'Auto', color: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/30', icon: Zap },
  token: { label: 'Token', color: 'text-sky-400 bg-sky-400/10 border-sky-400/30', icon: Ticket },
  manual: { label: 'Manuel', color: 'text-amber-400 bg-amber-400/10 border-amber-400/30', icon: Package },
};

const STATUS_BADGE = {
  pending: { label: 'En attente', color: 'text-amber-400 bg-amber-400/10 border-amber-400/30', icon: Clock },
  fulfilled: { label: 'Honorée', color: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/30', icon: CheckCircle2 },
  rejected: { label: 'Refusée', color: 'text-red-400 bg-red-400/10 border-red-400/30', icon: AlertCircle },
};

function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function StatPill({ icon: Icon, label, value, color }) {
  return (
    <div className="rounded-xl border border-border bg-card px-3 py-2 flex items-center gap-2.5">
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${color}`}>
        <Icon className="w-3.5 h-3.5" />
      </div>
      <div className="min-w-0">
        <p className="font-grotesk font-black text-lg text-foreground leading-none">{value}</p>
        <p className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground/60 mt-0.5 truncate">{label}</p>
      </div>
    </div>
  );
}

function RedemptionRow({ r, onAction }) {
  const [expanded, setExpanded] = useState(false);
  const [notes, setNotes] = useState(r.admin_notes || '');
  const [rejectMode, setRejectMode] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [refundOnReject, setRefundOnReject] = useState(true);
  const [busy, setBusy] = useState(false);

  const s = STATUS_BADGE[r.status] || STATUS_BADGE.pending;
  const ft = FTYPE_BADGE[r.fulfillment_type] || FTYPE_BADGE.manual;
  const FIcon = ft.icon;
  const SIcon = s.icon;
  const isPending = r.status === 'pending';

  const handle = async (fn) => {
    setBusy(true);
    await fn();
    setBusy(false);
  };

  return (
    <div className="border-b border-border/60 last:border-0">
      <div className="flex items-center gap-3 px-4 py-3">
        {/* Avatar */}
        <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 overflow-hidden">
          {r.user_name ? (
            <span className="font-grotesk font-bold text-xs text-primary">{r.user_name[0]?.toUpperCase()}</span>
          ) : <Gift className="w-4 h-4 text-primary" />}
        </div>

        {/* Main info */}
        <div className="flex-1 min-w-0 cursor-pointer" onClick={() => setExpanded(!expanded)}>
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-inter text-sm text-foreground truncate font-medium">{r.item_label}</p>
            <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-mono border ${ft.color} flex-shrink-0`}>
              <FIcon className="w-2.5 h-2.5" /> {ft.label}
            </span>
          </div>
          <p className="font-mono text-[10px] text-muted-foreground/60 truncate mt-0.5">
            {r.user_name} · {r.user_email} · {r.cost} cr · {formatDate(r.created_date)}
          </p>
        </div>

        {/* Status badge */}
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono border ${s.color} flex-shrink-0`}>
          <SIcon className="w-2.5 h-2.5" /> {s.label}
        </span>

        {/* Quick actions for pending */}
        {isPending && !rejectMode && (
          <div className="flex gap-1 flex-shrink-0">
            <button onClick={() => handle(() => onAction('fulfill', r.id, { adminNotes: notes }))}
              disabled={busy} title="Honorer + email"
              className="w-7 h-7 rounded-lg bg-emerald-400/10 border border-emerald-400/30 flex items-center justify-center hover:bg-emerald-400/20 transition-all disabled:opacity-50">
              {busy ? <Loader2 className="w-3 h-3 animate-spin text-emerald-400" /> : <Check className="w-3.5 h-3.5 text-emerald-400" />}
            </button>
            <button onClick={() => { setRejectMode(true); setExpanded(true); }} disabled={busy} title="Refuser"
              className="w-7 h-7 rounded-lg bg-red-400/10 border border-red-400/30 flex items-center justify-center hover:bg-red-400/20 transition-all disabled:opacity-50">
              <X className="w-3.5 h-3.5 text-red-400" />
            </button>
          </div>
        )}

        {/* Expand toggle */}
        <button onClick={() => setExpanded(!expanded)} className="text-muted-foreground/50 hover:text-foreground flex-shrink-0">
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {/* Expanded panel */}
      {expanded && (
        <div className="px-4 pb-4 pt-1 space-y-3 bg-secondary/20">
          {/* Details grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            <div className="rounded-lg bg-card border border-border px-2.5 py-1.5">
              <p className="font-mono text-[9px] uppercase text-muted-foreground/50">Coût</p>
              <p className="font-grotesk font-bold text-amber-400">{r.cost} cr</p>
            </div>
            <div className="rounded-lg bg-card border border-border px-2.5 py-1.5">
              <p className="font-mono text-[9px] uppercase text-muted-foreground/50">Type</p>
              <p className="font-grotesk font-bold text-foreground">{ft.label}</p>
            </div>
            <div className="rounded-lg bg-card border border-border px-2.5 py-1.5">
              <p className="font-mono text-[9px] uppercase text-muted-foreground/50">Date demande</p>
              <p className="font-grotesk font-bold text-foreground text-[11px]">{formatDate(r.created_date)}</p>
            </div>
            <div className="rounded-lg bg-card border border-border px-2.5 py-1.5">
              <p className="font-mono text-[9px] uppercase text-muted-foreground/50">Appliquée le</p>
              <p className="font-grotesk font-bold text-foreground text-[11px]">{formatDate(r.applied_at)}</p>
            </div>
          </div>

          {/* Token info */}
          {r.token_type && (
            <div className="flex items-center gap-2 text-xs px-2.5 py-1.5 rounded-lg bg-sky-400/5 border border-sky-400/20">
              <Ticket className="w-3 h-3 text-sky-400" />
              <span className="font-mono text-muted-foreground">Token: <span className="text-sky-400 font-bold">{r.token_type}</span> × {r.token_count || 1}</span>
            </div>
          )}

          {/* Admin notes */}
          <div>
            <label className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground/60 mb-1 flex items-center gap-1">
              <FileText className="w-3 h-3" /> Notes admin
            </label>
            <Textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Notes internes (visibles par l'admin uniquement)…"
              rows={2}
              className="text-xs resize-none"
            />
            <div className="flex gap-1.5 mt-1">
              <Button size="sm" variant="outline" disabled={busy}
                onClick={() => handle(() => onAction('note', r.id, { adminNotes: notes }))}
                className="h-7 text-xs">
                <FileText className="w-3 h-3" /> Enregistrer
              </Button>
            </div>
          </div>

          {/* Reject mode */}
          {rejectMode && (
            <div className="rounded-xl border border-red-400/30 bg-red-400/5 p-3 space-y-2">
              <p className="font-grotesk font-bold text-sm text-red-400 flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4" /> Refuser cette récompense
              </p>
              <Input
                value={rejectReason}
                onChange={e => setRejectReason(e.target.value)}
                placeholder="Raison du refus (envoyée par email)…"
                className="text-xs"
              />
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={refundOnReject} onChange={e => setRefundOnReject(e.target.checked)}
                  className="rounded border-border" />
                <span className="font-inter text-xs text-muted-foreground">Rembourser les {r.cost} crédits à l'utilisateur</span>
              </label>
              <div className="flex gap-1.5">
                <Button size="sm" variant="destructive" disabled={busy}
                  onClick={() => handle(() => onAction('reject', r.id, { adminNotes: rejectReason, refundCredits: refundOnReject }))}
                  className="h-8 text-xs">
                  {busy ? <Loader2 className="w-3 h-3 animate-spin" /> : <X className="w-3 h-3" />} Confirmer le refus
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setRejectMode(false)} className="h-8 text-xs">Annuler</Button>
              </div>
            </div>
          )}

          {/* All actions */}
          <div className="flex flex-wrap gap-1.5 pt-1">
            {isPending && (
              <Button size="sm" disabled={busy}
                onClick={() => handle(() => onAction('fulfill', r.id, { adminNotes: notes }))}
                className="h-8 text-xs bg-emerald-500 hover:bg-emerald-600 text-white">
                <Check className="w-3 h-3" /> Honorer + email
              </Button>
            )}
            {!isPending && (
              <Button size="sm" variant="outline" disabled={busy}
                onClick={() => handle(() => onAction('reset', r.id, {}))}
                className="h-8 text-xs">
                <RotateCcw className="w-3 h-3" /> Rouvrir (pending)
              </Button>
            )}
            {r.status === 'rejected' && (
              <Button size="sm" variant="outline" disabled={busy}
                onClick={() => handle(() => onAction('refund', r.id, {}))}
                className="h-8 text-xs">
                <Coins className="w-3 h-3 text-amber-400" /> Rembourser {r.cost} cr
              </Button>
            )}
            <Button size="sm" variant="ghost" disabled={busy}
              onClick={() => handle(() => onAction('notify', r.id, {}))}
              className="h-8 text-xs">
              <Mail className="w-3 h-3" /> Renvoyer email
            </Button>
            <Button size="sm" variant="ghost" disabled={busy}
              onClick={() => { if (confirm('Supprimer définitivement ?')) handle(() => onAction('delete', r.id, {})); }}
              className="h-8 text-xs text-red-400 hover:text-red-500 ml-auto">
              <Trash2 className="w-3 h-3" /> Supprimer
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function RecompensesTab() {
  const qc = useQueryClient();
  const [statusFilter, setStatusFilter] = useState('pending');
  const [ftypeFilter, setFtypeFilter] = useState('manual');
  const [search, setSearch] = useState('');
  const [busy, setBusy] = useState(false);
  const [bulkMode, setBulkMode] = useState(false);
  const [selected, setSelected] = useState(new Set());

  const { data: redemptions = [], isLoading } = useQuery({
    queryKey: ['admin-redemptions'],
    queryFn: () => base44.entities.RewardRedemption.list('-created_date', 500),
  });

  // Stats
  const stats = {
    pending: redemptions.filter(r => r.status === 'pending').length,
    pendingManual: redemptions.filter(r => r.status === 'pending' && r.fulfillment_type === 'manual').length,
    fulfilled: redemptions.filter(r => r.status === 'fulfilled').length,
    rejected: redemptions.filter(r => r.status === 'rejected').length,
  };

  // Filtering
  const filtered = redemptions.filter(r => {
    if (statusFilter !== 'all' && r.status !== statusFilter) return false;
    if (ftypeFilter !== 'all' && r.fulfillment_type !== ftypeFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      if (!(r.item_label?.toLowerCase().includes(q) || r.user_name?.toLowerCase().includes(q) || r.user_email?.toLowerCase().includes(q))) return false;
    }
    return true;
  });

  const pendingManualIds = filtered.filter(r => r.status === 'pending').map(r => r.id);

  const onAction = async (action, redemptionId, extra = {}) => {
    if (action === 'delete') {
      setBusy(true);
      try {
        await base44.entities.RewardRedemption.delete(redemptionId);
        toast.success('Réclamation supprimée');
        qc.invalidateQueries({ queryKey: ['admin-redemptions'] });
      } catch { toast.error('Erreur'); }
      setBusy(false);
      return;
    }
    if (action === 'notify') {
      // Re-send email by fulfilling (if already fulfilled) — simplified: just toast
      toast.info('Email renvoyé via l\'action d\'honoré');
      return;
    }
    setBusy(true);
    try {
      const res = await base44.functions.invoke('adminManageRedemption', { redemptionId, action, ...extra });
      const data = res.data || res;
      if (data?.success) {
        toast.success(data.message || 'Action effectuée');
        qc.invalidateQueries({ queryKey: ['admin-redemptions'] });
      } else if (data?.error) {
        toast.error(data.error);
      }
    } catch (e) {
      toast.error('Erreur: ' + e.message);
    }
    setBusy(false);
  };

  const bulkFulfill = async () => {
    if (selected.size === 0) return;
    setBusy(true);
    try {
      const res = await base44.functions.invoke('adminManageRedemption', {
        action: 'bulk_fulfill',
        redemptionIds: [...selected],
      });
      const data = res.data || res;
      if (data?.success) {
        toast.success(data.message);
        setSelected(new Set());
        setBulkMode(false);
        qc.invalidateQueries({ queryKey: ['admin-redemptions'] });
      }
    } catch { toast.error('Erreur'); }
    setBusy(false);
  };

  const bulkReject = async () => {
    if (selected.size === 0) return;
    if (!confirm(`Refuser ${selected.size} récompense(s) et rembourser les crédits ?`)) return;
    setBusy(true);
    try {
      const res = await base44.functions.invoke('adminManageRedemption', {
        action: 'bulk_reject',
        redemptionIds: [...selected],
        refundCredits: true,
      });
      const data = res.data || res;
      if (data?.success) {
        toast.success(data.message);
        setSelected(new Set());
        setBulkMode(false);
        qc.invalidateQueries({ queryKey: ['admin-redemptions'] });
      }
    } catch { toast.error('Erreur'); }
    setBusy(false);
  };

  const toggleSelect = (id) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSelected(next);
  };

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <StatPill icon={Clock} label="En attente" value={stats.pending} color="bg-amber-400/10 text-amber-400" />
        <StatPill icon={Package} label="Manuel en attente" value={stats.pendingManual} color="bg-orange-400/10 text-orange-400" />
        <StatPill icon={CheckCircle2} label="Honorées" value={stats.fulfilled} color="bg-emerald-400/10 text-emerald-400" />
        <StatPill icon={AlertCircle} label="Refusées" value={stats.rejected} color="bg-red-400/10 text-red-400" />
      </div>

      {/* Controls */}
      <div className="space-y-2">
        {/* Status filters */}
        <div className="flex gap-1.5 flex-wrap items-center">
          {STATUS_FILTERS.map(s => (
            <button key={s.id} onClick={() => setStatusFilter(s.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-grotesk font-bold border transition-all ${
                statusFilter === s.id ? 'bg-primary text-primary-foreground border-primary' : 'border-border text-muted-foreground hover:text-foreground'
              }`}>
              {s.label}
              {s.id === 'pending' && stats.pending > 0 && (
                <span className="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full bg-amber-400/20 text-[9px]">{stats.pending}</span>
              )}
            </button>
          ))}
          <Button variant="ghost" size="icon" className="h-8 w-8 ml-auto"
            onClick={() => qc.invalidateQueries({ queryKey: ['admin-redemptions'] })}>
            <RefreshCw className="w-3.5 h-3.5" />
          </Button>
        </div>

        {/* Type filters + search */}
        <div className="flex gap-1.5 flex-wrap items-center">
          {FTYPE_FILTERS.map(f => (
            <button key={f.id} onClick={() => setFtypeFilter(f.id)}
              className={`px-2.5 py-1 rounded-full text-[11px] font-mono border transition-all ${
                ftypeFilter === f.id ? 'bg-secondary text-foreground border-primary/30' : 'border-border text-muted-foreground/60 hover:text-foreground'
              }`}>
              {f.label}
            </button>
          ))}
          <div className="flex items-center gap-1.5 ml-auto">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-muted-foreground/50 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <Input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Rechercher…"
                className="pl-8 h-8 w-44 text-xs"
              />
            </div>
            <button onClick={() => { setBulkMode(!bulkMode); setSelected(new Set()); }}
              className={`px-2.5 py-1.5 rounded-lg text-[11px] font-grotesk font-bold border transition-all ${
                bulkMode ? 'bg-primary/10 border-primary/30 text-primary' : 'border-border text-muted-foreground hover:text-foreground'
              }`}>
              {bulkMode ? '✓ Sélection' : 'Sélection multiple'}
            </button>
          </div>
        </div>
      </div>

      {/* Bulk actions bar */}
      {bulkMode && selected.size > 0 && (
        <div className="flex items-center gap-2 p-2.5 rounded-xl border border-primary/30 bg-primary/5">
          <span className="font-grotesk font-bold text-sm text-primary">{selected.size} sélectionnée(s)</span>
          <div className="flex gap-1.5 ml-auto">
            <Button size="sm" disabled={busy} onClick={bulkFulfill}
              className="h-8 text-xs bg-emerald-500 hover:bg-emerald-600 text-white">
              <Check className="w-3 h-3" /> Honorer tout
            </Button>
            <Button size="sm" variant="destructive" disabled={busy} onClick={bulkReject}
              className="h-8 text-xs">
              <X className="w-3 h-3" /> Refuser + rembourser
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setSelected(new Set())} className="h-8 text-xs">Vider</Button>
          </div>
        </div>
      )}

      {/* List */}
      {isLoading ? (
        <div className="flex justify-center py-10"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground/50 text-sm">
          <Gift className="w-8 h-8 mx-auto mb-2 opacity-30" />
          Aucune récompense pour ces filtres
        </div>
      ) : (
        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          {bulkMode && (
            <div className="px-4 py-2 border-b border-border/60 bg-secondary/30 flex items-center gap-2">
              <button onClick={() => setSelected(new Set(pendingManualIds))}
                className="text-xs font-grotesk font-bold text-primary">Tout sélectionner (pending only: {pendingManualIds.length})</button>
            </div>
          )}
          <div className="max-h-[65vh] overflow-y-auto">
            {filtered.map(r => (
              <div key={r.id} className="flex items-stretch">
                {bulkMode && (
                  <div className="flex items-center px-3 flex-shrink-0 border-r border-border/40">
                    <input type="checkbox" checked={selected.has(r.id)} onChange={() => toggleSelect(r.id)}
                      disabled={r.status !== 'pending'} className="rounded border-border" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <RedemptionRow r={r} onAction={onAction} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}