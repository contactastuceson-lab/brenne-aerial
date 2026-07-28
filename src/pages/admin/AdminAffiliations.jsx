import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Search, Plus, Network, RefreshCw, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { AFFILIATION_STATUSES, STATUS_ORDER } from '@/lib/affiliationStatus';
import AffiliationStats from '@/components/admin/affiliations/AffiliationStats';
import AffiliationRow from '@/components/admin/affiliations/AffiliationRow';
import AffiliationDialog from '@/components/admin/affiliations/AffiliationDialog';

export default function AdminAffiliations() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const { data: affiliations = [], isLoading } = useQuery({
    queryKey: ['admin-affiliations'],
    queryFn: async () => {
      const res = await base44.functions.invoke('adminManageAffiliations', { action: 'list' });
      return res.data.affiliations || [];
    },
  });

  const { data: users = [] } = useQuery({
    queryKey: ['adm-badges-users'],
    queryFn: async () => {
      const res = await base44.functions.invoke('adminGetUsers', {});
      return res.data.users || [];
    },
  });

  const mutate = useMutation({
    mutationFn: async (payload) => {
      const action = payload.action || (payload.affiliation ? 'create' : payload.affiliationId && payload.patch ? 'update' : payload.affiliationId ? 'delete' : 'list');
      return base44.functions.invoke('adminManageAffiliations', { action, ...payload });
    },
    onSuccess: (_res, payload) => {
      qc.invalidateQueries({ queryKey: ['admin-affiliations'] });
      if (payload.action === 'approveRemoval') toast.success('Suppression approuvée');
      else if (payload.action === 'rejectRemoval') toast.success('Demande refusée');
      else if (payload.action === 'removeDirect') toast.success('Affiliation marquée supprimée');
      else if (payload.affiliation) toast.success('Affiliation créée');
      else if (payload.patch?.status) toast.success(`Statut → ${AFFILIATION_STATUSES[payload.patch.status]?.label || ''}`);
      else if (payload.patch?.visibility !== undefined) toast.success('Visibilité modifiée');
      else if (!payload.patch) toast.success('Affiliation supprimée');
      else toast.success('Affiliation modifiée');
    },
    onError: (err) => toast.error(err?.message || 'Erreur'),
  });

  const handleAction = (type, payload) => {
    mutate.mutate({ action: type, ...payload });
  };

  const handleDialogSubmit = (payload) => {
    mutate.mutate(payload);
    setDialogOpen(false);
    setEditing(null);
  };

  const pendingRemovalCount = affiliations.filter(a => a.removalRequestStatus === 'pending').length;

  const filtered = affiliations
    .filter(a => {
      if (statusFilter === 'removal_pending') return a.removalRequestStatus === 'pending';
      if (statusFilter !== 'all') return a.status === statusFilter;
      return true;
    })
    .filter(a => {
      if (!search) return true;
      const q = search.toLowerCase();
      return [a.organizationNameResolved, a.affiliateName, a.affiliateEmail, a.organizationEmail, a.role]
        .some(v => (v || '').toLowerCase().includes(q));
    });

  return (
    <div>
      <div className="flex items-start justify-between mb-8 gap-3">
        <div>
          <h1 className="font-grotesk font-bold text-2xl flex items-center gap-2">
            <Network className="w-6 h-6 text-primary" /> Affiliations
          </h1>
          <p className="font-inter text-sm text-muted-foreground">Gérez toutes les affiliations d'organisation</p>
        </div>
        <Button onClick={() => { setEditing(null); setDialogOpen(true); }} className="flex items-center gap-2">
          <Plus className="w-4 h-4" /> Nouvelle
        </Button>
      </div>

      <AffiliationStats affiliations={affiliations} />

      {/* Filters */}
      <div className="space-y-3 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input placeholder="Rechercher (org, utilisateur, email, rôle)..." value={search}
            onChange={e => setSearch(e.target.value)} className="bg-card border-border pl-9 w-full" />
        </div>
        <div className="flex gap-1 flex-wrap">
          <button onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-full font-inter text-xs border transition-all ${statusFilter === 'all' ? 'bg-primary text-primary-foreground border-primary' : 'border-border text-muted-foreground hover:text-foreground'}`}>
            Tous ({affiliations.length})
          </button>
          {STATUS_ORDER.map(s => {
            const st = AFFILIATION_STATUSES[s];
            const count = affiliations.filter(a => a.status === s).length;
            return (
              <button key={s} onClick={() => setStatusFilter(s)}
                className={`px-3 py-1.5 rounded-full font-inter text-xs border transition-all flex items-center gap-1.5 ${statusFilter === s ? `${st.bg} ${st.color} ${st.border}` : 'border-border text-muted-foreground hover:text-foreground'}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} /> {st.label} ({count})
              </button>
            );
          })}
          {pendingRemovalCount > 0 && (
            <button onClick={() => setStatusFilter('removal_pending')}
              className={`px-3 py-1.5 rounded-full font-inter text-xs border transition-all flex items-center gap-1.5 ${statusFilter === 'removal_pending' ? 'bg-amber-500/20 text-amber-400 border-amber-500/40' : 'border-amber-500/30 text-amber-400/70 hover:text-amber-400'}`}>
              <AlertTriangle className="w-3 h-3" /> Demandes ({pendingRemovalCount})
            </button>
          )}
        </div>
      </div>

      {/* List */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <RefreshCw className="w-5 h-5 text-primary animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground font-inter text-sm">Aucune affiliation trouvée</div>
      ) : (
        <div className="space-y-2">
          {filtered.map(a => (
            <AffiliationRow key={a.id} a={a} onAction={handleAction} onEdit={(aff) => { setEditing(aff); setDialogOpen(true); }} />
          ))}
        </div>
      )}

      <AffiliationDialog open={dialogOpen} onOpenChange={setDialogOpen} users={users}
        onSubmit={handleDialogSubmit} editing={editing} />
    </div>
  );
}