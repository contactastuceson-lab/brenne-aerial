import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import {
  User, Save, Loader2, Search, ShieldCheck, ShieldOff,
  Ban, Clock, CheckCircle, Flag, Eye, Download, Trash2, UserX, Filter, AlertTriangle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import BadgeChip from '@/components/ui/BadgeChip';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

const BADGES = ['Fondateur', 'Collaborateur', 'VIP', 'Admin', 'Pilote', 'Officiel', 'Vérifié', 'Beta Testeur', 'Partenaire'];

function formatPhone(raw) {
  if (!raw) return '';
  const digits = raw.replace(/\D/g, '');
  if (digits.length === 10 && digits.startsWith('0')) {
    return digits.replace(/(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/, '$1 $2 $3 $4 $5');
  }
  if (digits.length === 11 && digits.startsWith('33')) {
    return '+33 ' + digits.slice(2).replace(/(\d{1})(\d{2})(\d{2})(\d{2})(\d{2})/, '$1 $2 $3 $4 $5');
  }
  return raw;
}

const STATUS_COLORS = {
  active:     'text-green-400 bg-green-400/10 border-green-400/30',
  suspended:  'text-yellow-400 bg-yellow-400/10 border-yellow-400/30',
  banned:     'text-red-400 bg-red-400/10 border-red-400/30',
  restricted: 'text-orange-400 bg-orange-400/10 border-orange-400/30',
};

const STATUS_LABELS = {
  active: 'Actif',
  suspended: 'Suspendu',
  banned: 'Banni',
  restricted: 'Restreint',
};

export default function AdminUsers() {
  const qc = useQueryClient();
  const [editUser, setEditUser] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterRole, setFilterRole] = useState('all');
  const [filterBadge, setFilterBadge] = useState('all');
  const [selectedIds, setSelectedIds] = useState([]);

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['adm-users-list'],
    queryFn: async () => {
      const res = await base44.functions.invoke('adminGetUsers', {});
      return res.data.users || [];
    },
  });

  const { data: reports = [] } = useQuery({
    queryKey: ['adm-user-reports'],
    queryFn: () => base44.entities.Report.filter({ target_type: 'user', status: 'pending' }),
  });

  const { data: deletionRequests = [] } = useQuery({
    queryKey: ['adm-deletion-requests'],
    queryFn: () => base44.entities.DeletionRequest.filter({ status: 'pending' }),
  });

  const deleteUser = useMutation({
    mutationFn: ({ userId, userEmail }) => base44.functions.invoke('adminDeleteUser', { userId, userEmail }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['adm-users-list'] });
      qc.invalidateQueries({ queryKey: ['adm-deletion-requests'] });
      setDeleteConfirm(null);
      toast.success('Compte supprimé');
    },
    onError: (err) => {
      const msg = err?.response?.data?.error || err?.message || 'Impossible de supprimer';
      toast.error(msg);
    },
  });

  const refuseDeletion = useMutation({
    mutationFn: ({ requestId, userEmail, userName }) => base44.functions.invoke('refuseDeletionRequest', { requestId, userEmail, userName }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['adm-deletion-requests'] });
      setDeleteConfirm(null);
      toast.success('Demande refusée — email envoyé à l\'utilisateur');
    },
    onError: () => toast.error('Erreur lors du refus'),
  });

  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [deleteReason, setDeleteReason] = useState('');

  const updateUser = useMutation({
    mutationFn: ({ id, data }) => base44.functions.invoke('adminUpdateUser', { id, data }),
    onSuccess: () => {
      setTimeout(() => qc.invalidateQueries({ queryKey: ['adm-users-list'] }), 1000);
      setEditUser(null);
      toast.success('Utilisateur mis à jour');
    },
    onError: (err) => toast.error('Erreur : ' + (err?.message || 'Impossible de modifier cet utilisateur')),
  });

  const quickAction = useMutation({
    mutationFn: ({ id, data }) => base44.functions.invoke('adminUpdateUser', { id, data }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['adm-users-list'] }),
    onError: (err) => toast.error('Erreur : ' + (err?.message || 'Impossible de modifier cet utilisateur')),
  });

  const toggleBadge = (badge) => setEditForm(p => ({
    ...p, badges: p.badges?.includes(badge) ? p.badges.filter(b => b !== badge) : [...(p.badges || []), badge]
  }));

  const openEdit = (u) => {
    setEditUser(u);
    setEditForm({
      role: u.role || 'user',
      badges: u.badges || [],
      phone: u.phone || '',
      bio: u.bio || '',
      location: u.location || '',
      verified_status: u.verified_status || 'no',
      account_status: u.account_status || 'active',
      suspension_reason: u.suspension_reason || '',
      suspension_until: u.suspension_until || '',
    });
  };

  const bulkSuspend = useMutation({
    mutationFn: async (ids) => {
      await Promise.all(ids.map(id => base44.functions.invoke('adminUpdateUser', { id, data: { account_status: 'suspended', suspension_reason: 'Suspension groupée' } })));
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['adm-users-list'] }); setSelectedIds([]); toast.success('Comptes suspendus'); },
  });

  const bulkBan = useMutation({
    mutationFn: async (ids) => {
      await Promise.all(ids.map(id => base44.functions.invoke('adminUpdateUser', { id, data: { account_status: 'banned', suspension_reason: 'Bannissement groupé' } })));
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['adm-users-list'] }); setSelectedIds([]); toast.success('Comptes bannis'); },
  });

  const exportCSV = () => {
    const rows = [['Nom', 'Email', 'Rôle', 'Statut', 'Badges', 'Téléphone', 'Localisation']];
    filtered.forEach(u => rows.push([u.full_name || '', u.email || '', u.role || 'user', u.account_status || 'active', (u.badges || []).join(', '), u.phone || '', u.location || '']));
    const csv = rows.map(r => r.map(v => `"${v}"`).join(',')).join('\n');
    const a = document.createElement('a'); a.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv);
    a.download = 'utilisateurs.csv'; a.click();
  };

  const toggleSelect = (id) => setSelectedIds(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);
  const toggleAll = () => setSelectedIds(selectedIds.length === filtered.length ? [] : filtered.map(u => u.id));

  const filtered = users
    .filter(u => filterStatus === 'all' || (u.account_status || 'active') === filterStatus)
    .filter(u => filterRole === 'all' || (u.role || 'user') === filterRole)
    .filter(u => filterBadge === 'all' || (u.badges || []).includes(filterBadge))
    .filter(u => !search || u.full_name?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase()));

  const reportCountForUser = (email) => reports.filter(r => r.target_email === email).length;
  const hasDeletionRequest = (email) => deletionRequests.some(r => r.user_email === email);

  return (
    <div>
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div>
          <h1 className="font-grotesk font-bold text-2xl">Gestion des comptes</h1>
          <p className="font-inter text-sm text-muted-foreground">{users.length} comptes · {filtered.length} affiché{filtered.length > 1 ? 's' : ''}</p>
          {deletionRequests.length > 0 && (
            <p className="font-inter text-xs text-destructive mt-0.5 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" /> {deletionRequests.length} demande{deletionRequests.length > 1 ? 's' : ''} de suppression en attente
            </p>
          )}
        </div>
        <Button size="sm" variant="outline" onClick={exportCSV} className="border-border text-xs gap-1.5">
          <Download className="w-3.5 h-3.5" /> Exporter CSV
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input placeholder="Rechercher..." value={search} onChange={e => setSearch(e.target.value)} className="bg-card border-border pl-9 w-44" />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="bg-card border-border w-36"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous statuts</SelectItem>
            <SelectItem value="active">Actifs</SelectItem>
            <SelectItem value="suspended">Suspendus</SelectItem>
            <SelectItem value="banned">Bannis</SelectItem>
            <SelectItem value="restricted">Restreints</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterRole} onValueChange={setFilterRole}>
          <SelectTrigger className="bg-card border-border w-36"><SelectValue placeholder="Rôle" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous rôles</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="user">Utilisateur</SelectItem>
            <SelectItem value="vip">VIP</SelectItem>
            <SelectItem value="collaborateur">Collaborateur</SelectItem>
            <SelectItem value="pilote">Pilote</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterBadge} onValueChange={setFilterBadge}>
          <SelectTrigger className="bg-card border-border w-36"><SelectValue placeholder="Badge" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous badges</SelectItem>
            {BADGES.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Bulk action bar */}
      {selectedIds.length > 0 && (
        <div className="flex items-center gap-3 mb-3 p-3 rounded-xl bg-primary/10 border border-primary/30">
          <span className="font-inter text-sm font-medium">{selectedIds.length} sélectionné{selectedIds.length > 1 ? 's' : ''}</span>
          <Button size="sm" variant="outline" className="border-yellow-400/30 text-yellow-400 hover:bg-yellow-400/10 text-xs gap-1" onClick={() => bulkSuspend.mutate(selectedIds)}>
            <ShieldOff className="w-3 h-3" /> Suspendre
          </Button>
          <Button size="sm" variant="outline" className="border-red-400/30 text-red-400 hover:bg-red-400/10 text-xs gap-1" onClick={() => bulkBan.mutate(selectedIds)}>
            <UserX className="w-3 h-3" /> Bannir
          </Button>
          <button className="ml-auto font-inter text-xs text-muted-foreground hover:text-foreground" onClick={() => setSelectedIds([])}>Désélectionner tout</button>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-10"><div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>
      ) : (
        <div className="space-y-2">
          {/* Select all */}
          {filtered.length > 0 && (
            <div className="flex items-center gap-2 px-1 mb-1">
              <input type="checkbox" checked={selectedIds.length === filtered.length && filtered.length > 0}
                onChange={toggleAll} className="w-3.5 h-3.5 accent-primary cursor-pointer" />
              <span className="font-inter text-xs text-muted-foreground">Tout sélectionner</span>
            </div>
          )}
          {filtered.map(u => {
            const status = u.account_status || 'active';
            const reportCount = reportCountForUser(u.email);
            return (
              <div key={u.id} className={`flex items-center gap-4 p-4 rounded-xl bg-card border transition-colors ${selectedIds.includes(u.id) ? 'border-primary/40 bg-primary/5' : 'border-border hover:border-primary/20'}`}>
                <input type="checkbox" checked={selectedIds.includes(u.id)} onChange={() => toggleSelect(u.id)}
                  className="w-3.5 h-3.5 accent-primary cursor-pointer flex-shrink-0" />
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 overflow-hidden">
                  {u.avatar_url
                    ? <img src={u.avatar_url} className="w-full h-full object-cover" alt="" />
                    : <span className="font-grotesk font-bold text-primary">{u.full_name?.[0] || 'U'}</span>
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-inter text-sm font-medium">{u.full_name || '—'}</p>
                    {u.verified_status === 'yes' && <CheckCircle className="w-3.5 h-3.5 text-accent" />}
                    <span className={`font-mono text-[9px] px-2 py-0.5 rounded-full border ${STATUS_COLORS[status]}`}>
                      {STATUS_LABELS[status]}
                    </span>
                    {reportCount > 0 && (
                      <Link to="/admin/reports">
                        <span className="flex items-center gap-1 font-mono text-[9px] text-destructive bg-destructive/10 border border-destructive/30 px-2 py-0.5 rounded-full cursor-pointer hover:bg-destructive/20">
                          <Flag className="w-2.5 h-2.5" /> {reportCount} signalement{reportCount > 1 ? 's' : ''}
                        </span>
                      </Link>
                    )}
                  </div>
                  <p className="font-mono text-xs text-muted-foreground">{u.email}</p>
                  {u.phone && <p className="font-mono text-xs text-muted-foreground/60">{formatPhone(u.phone)}</p>}
                  {u.badges?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {u.badges.map(b => <BadgeChip key={b} badge={b} size="sm" />)}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="font-mono text-xs text-muted-foreground hidden sm:block">{u.role || 'user'}</span>
                  {status === 'active' ? (
                    <Button size="sm" variant="outline" className="border-yellow-400/30 text-yellow-400 hover:bg-yellow-400/10 text-xs gap-1"
                      onClick={() => quickAction.mutate({ id: u.id, data: { account_status: 'suspended', suspension_reason: 'Suspension admin' } })}>
                      <ShieldOff className="w-3 h-3" /> Suspendre
                    </Button>
                  ) : status !== 'active' && (
                    <Button size="sm" variant="outline" className="border-green-400/30 text-green-400 hover:bg-green-400/10 text-xs gap-1"
                      onClick={() => quickAction.mutate({ id: u.id, data: { account_status: 'active', suspension_reason: '' } })}>
                      <ShieldCheck className="w-3 h-3" /> Réactiver
                    </Button>
                  )}
                  <Button size="sm" variant="outline" onClick={() => openEdit(u)} className="border-border text-xs">
                    Modifier
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => { setDeleteConfirm(u); setDeleteReason(''); }}
                    className={`border-destructive/40 text-destructive hover:bg-destructive/10 text-xs gap-1 ${hasDeletionRequest(u.email) ? 'animate-pulse border-destructive' : ''}`}>
                    <Trash2 className="w-3 h-3" /> {hasDeletionRequest(u.email) ? 'Demande!' : 'Suppr.'}
                  </Button>
                </div>
              </div>
            );
          })}
          {filtered.length === 0 && (
            <div className="text-center py-16 text-muted-foreground font-inter text-sm">Aucun utilisateur trouvé</div>
          )}
        </div>
      )}

      {/* Delete confirmation dialog */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-destructive/30 rounded-2xl p-6 max-w-sm w-full space-y-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-destructive" />
              <h3 className="font-grotesk font-bold text-base">Supprimer le compte</h3>
            </div>
            {hasDeletionRequest(deleteConfirm.email) && (
              <div className="bg-destructive/10 border border-destructive/30 rounded-lg px-3 py-2 font-inter text-xs text-destructive">
                ⚠️ Cet utilisateur a demandé la suppression de son compte.
              </div>
            )}
            <p className="font-inter text-sm text-muted-foreground">
              Supprimer définitivement <strong className="text-foreground">{deleteConfirm.full_name}</strong> ({deleteConfirm.email}) ? Cette action est irréversible.
            </p>
            {!hasDeletionRequest(deleteConfirm.email) && (
              <div>
                <label className="font-inter text-xs text-muted-foreground mb-1 block">Raison de la suppression <span className="text-destructive">*</span></label>
                <Textarea
                  value={deleteReason}
                  onChange={e => setDeleteReason(e.target.value)}
                  placeholder="Ex: Compte inactif, violation des CGU..."
                  className="bg-secondary border-border resize-none h-20 text-sm"
                />
              </div>
            )}
            <div className="flex flex-col gap-2">
              {hasDeletionRequest(deleteConfirm.email) && (
                <Button size="sm" variant="outline"
                  className="border-yellow-400/30 text-yellow-400 hover:bg-yellow-400/10 text-xs gap-1.5 w-full"
                  onClick={() => {
                    const req = deletionRequests.find(r => r.user_email === deleteConfirm.email);
                    if (req) refuseDeletion.mutate({ requestId: req.id, userEmail: deleteConfirm.email, userName: deleteConfirm.full_name });
                  }}
                  disabled={refuseDeletion.isPending}>
                  {refuseDeletion.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : '❌'} Refuser la demande (et notifier l'utilisateur)
                </Button>
              )}
              <div className="flex gap-2 justify-end">
                <Button size="sm" variant="outline" className="border-border text-xs" onClick={() => setDeleteConfirm(null)}>Annuler</Button>
                <Button size="sm" className="bg-destructive text-white hover:bg-destructive/90 text-xs gap-1.5"
                  onClick={() => deleteUser.mutate({ userId: deleteConfirm.id, userEmail: deleteConfirm.email, userName: deleteConfirm.full_name, reason: deleteReason })}
                  disabled={deleteUser.isPending || (!hasDeletionRequest(deleteConfirm.email) && !deleteReason.trim())}>
                  {deleteUser.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
                  Supprimer définitivement
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Dialog open={!!editUser} onOpenChange={() => setEditUser(null)}>
        <DialogContent className="bg-card border-border max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-grotesk font-bold">Modifier — {editUser?.full_name}</DialogTitle>
          </DialogHeader>
          {editUser && (
            <div className="space-y-5">
              {/* Status du compte */}
              <div className="bg-secondary rounded-xl p-4 space-y-3">
                <p className="font-inter font-medium text-sm">Statut du compte</p>
                <Select value={editForm.account_status} onValueChange={v => setEditForm(p => ({ ...p, account_status: v }))}>
                  <SelectTrigger className="bg-card border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">✅ Actif</SelectItem>
                    <SelectItem value="restricted">⚠️ Restreint</SelectItem>
                    <SelectItem value="suspended">🔶 Suspendu</SelectItem>
                    <SelectItem value="banned">🔴 Banni</SelectItem>
                  </SelectContent>
                </Select>
                {editForm.account_status !== 'active' && (
                  <>
                    <Input
                      value={editForm.suspension_reason}
                      onChange={e => setEditForm(p => ({ ...p, suspension_reason: e.target.value }))}
                      placeholder="Raison de la restriction / suspension..."
                      className="bg-card border-border font-inter"
                    />
                    <div>
                      <label className="font-inter text-xs text-muted-foreground mb-1 block">Jusqu'au (optionnel)</label>
                      <Input
                        type="date"
                        value={editForm.suspension_until}
                        onChange={e => setEditForm(p => ({ ...p, suspension_until: e.target.value }))}
                        className="bg-card border-border font-inter"
                      />
                    </div>
                  </>
                )}
              </div>

              {/* Vérification */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-inter text-sm font-medium flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-accent" /> Compte vérifié
                  </p>
                  <p className="font-inter text-xs text-muted-foreground">Affiche un badge de vérification officiel</p>
                </div>
                <Switch
                  checked={editForm.verified_status === 'yes'}
                  onCheckedChange={v => setEditForm(p => ({ ...p, verified_status: v ? 'yes' : 'no' }))}
                />
              </div>

              {/* Rôle */}
              <div>
                <label className="font-inter text-xs text-muted-foreground mb-2 block">Rôle</label>
                <Select value={editForm.role} onValueChange={v => setEditForm(p => ({ ...p, role: v }))}>
                  <SelectTrigger className="bg-secondary border-border"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="user">Utilisateur</SelectItem>
                    <SelectItem value="vip">VIP</SelectItem>
                    <SelectItem value="collaborateur">Collaborateur</SelectItem>
                    <SelectItem value="pilote">Pilote</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Badges */}
              <div>
                <label className="font-inter text-xs text-muted-foreground mb-2 block">Badges</label>
                <div className="grid grid-cols-2 gap-2">
                  {BADGES.map(b => (
                    <label key={b} className="flex items-center gap-2 cursor-pointer bg-secondary rounded-lg px-3 py-2">
                      <Checkbox checked={editForm.badges?.includes(b)} onCheckedChange={() => toggleBadge(b)} />
                      <span className="font-inter text-sm">{b}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Bio */}
              <div>
                <label className="font-inter text-xs text-muted-foreground mb-1 block">Bio</label>
                <Textarea value={editForm.bio} onChange={e => setEditForm(p => ({ ...p, bio: e.target.value }))} className="bg-secondary border-border resize-none h-20" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-inter text-xs text-muted-foreground mb-1 block">Téléphone</label>
                  <Input
                    value={editForm.phone}
                    onChange={e => setEditForm(p => ({ ...p, phone: e.target.value }))}
                    onBlur={e => setEditForm(p => ({ ...p, phone: formatPhone(e.target.value) }))}
                    placeholder="06 12 34 56 78"
                    className="bg-secondary border-border"
                  />
                </div>
                <div>
                  <label className="font-inter text-xs text-muted-foreground mb-1 block">Localisation</label>
                  <Input value={editForm.location} onChange={e => setEditForm(p => ({ ...p, location: e.target.value }))} className="bg-secondary border-border" />
                </div>
              </div>

              <Button onClick={() => updateUser.mutate({ id: editUser.id, data: editForm })} disabled={updateUser.isPending} className="w-full bg-primary text-primary-foreground">
                {updateUser.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save className="w-4 h-4 mr-2" />Sauvegarder</>}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}