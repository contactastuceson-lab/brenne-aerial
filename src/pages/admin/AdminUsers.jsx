import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Save, Loader2, Search, ShieldCheck, ShieldOff, CheckCircle, Flag, Download, Trash2, UserX, AlertTriangle, RefreshCw, UserPlus } from
'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import BadgeChip from '@/components/ui/BadgeChip';
import UserEditModal from '@/components/admin/UserEditModal';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import { ROLE_CONFIG, getUserLevel, getAssignableRoles, PDG_EMAILS, PDG_ADJOINT_EMAILS } from '@/lib/roles';

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
  active: 'text-green-400 bg-green-400/10 border-green-400/30',
  suspended: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30',
  banned: 'text-red-400 bg-red-400/10 border-red-400/30',
  restricted: 'text-orange-400 bg-orange-400/10 border-orange-400/30',
  closed: 'text-gray-400 bg-gray-400/10 border-gray-400/30'
};

const STATUS_LABELS = {
  active: 'Actif',
  suspended: 'Suspendu',
  banned: 'Banni',
  restricted: 'Restreint',
  closed: 'Fermé'
};

export default function AdminUsers() {
  const qc = useQueryClient();
  const [currentUser, setCurrentUser] = useState(null);
  useEffect(() => {base44.auth.me().then(setCurrentUser).catch(() => {});}, []);
  const myLevel = getUserLevel(currentUser);
  const isOwner = currentUser?.role === 'owner' || PDG_EMAILS.includes(currentUser?.email);
  const isPdgAdjoint = currentUser?.role === 'pdg_adjoint' || PDG_ADJOINT_EMAILS.includes(currentUser?.email);
  const canManageSupreme = myLevel >= 100;
  // Roles this admin can assign
  const assignableRoles = getAssignableRoles(currentUser);
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
    }
  });

  const { data: reports = [] } = useQuery({
    queryKey: ['adm-user-reports'],
    queryFn: () => base44.entities.Report.filter({ target_type: 'user', status: 'pending' })
  });

  const { data: deletionRequests = [] } = useQuery({
    queryKey: ['adm-deletion-requests'],
    queryFn: () => base44.entities.DeletionRequest.filter({ status: 'pending' })
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
    }
  });

  const refuseDeletion = useMutation({
    mutationFn: ({ requestId, userEmail, userName }) => base44.functions.invoke('refuseDeletionRequest', { requestId, userEmail, userName }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['adm-deletion-requests'] });
      setDeleteConfirm(null);
      toast.success('Demande refusée — email envoyé à l\'utilisateur');
    },
    onError: () => toast.error('Erreur lors du refus')
  });

  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [deleteReason, setDeleteReason] = useState('');
  const [emailSent, setEmailSent] = useState(false);
  const [createModal, setCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({ email: '', role: 'user' });
  const [createLoading, setCreateLoading] = useState(false);

  const sendDeletionEmail = useMutation({
    mutationFn: ({ userEmail, userName, reason, hadRequest }) =>
    base44.functions.invoke('sendDeletionEmail', { userEmail, userName, reason, hadRequest }),
    onSuccess: () => {
      setEmailSent(true);
      toast.success('Email envoyé à l\'utilisateur');
    },
    onError: () => toast.error('Erreur lors de l\'envoi de l\'email')
  });

  const updateUser = useMutation({
    mutationFn: ({ id, data }) => base44.functions.invoke('adminUpdateUser', { id, data }),
    onSuccess: () => {
      setTimeout(() => qc.invalidateQueries({ queryKey: ['adm-users-list'] }), 1000);
      setEditUser(null);
      toast.success('Utilisateur mis à jour');
    },
    onError: (err) => toast.error('Erreur : ' + (err?.message || 'Impossible de modifier cet utilisateur'))
  });

  const quickAction = useMutation({
    mutationFn: ({ id, data }) => base44.functions.invoke('adminUpdateUser', { id, data }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['adm-users-list'] }),
    onError: (err) => toast.error('Erreur : ' + (err?.message || 'Impossible de modifier cet utilisateur'))
  });

  const toggleBadge = (badge) => setEditForm((p) => ({
    ...p, badges: p.badges?.includes(badge) ? p.badges.filter((b) => b !== badge) : [...(p.badges || []), badge]
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
      closed_by: u.closed_by || ''
    });
  };

  const bulkSuspend = useMutation({
    mutationFn: async (ids) => {
      await Promise.all(ids.map((id) => base44.functions.invoke('adminUpdateUser', { id, data: { account_status: 'suspended', suspension_reason: 'Suspension groupée' } })));
    },
    onSuccess: () => {qc.invalidateQueries({ queryKey: ['adm-users-list'] });setSelectedIds([]);toast.success('Comptes suspendus');}
  });

  const bulkBan = useMutation({
    mutationFn: async (ids) => {
      await Promise.all(ids.map((id) => base44.functions.invoke('adminUpdateUser', { id, data: { account_status: 'banned', suspension_reason: 'Bannissement groupé' } })));
    },
    onSuccess: () => {qc.invalidateQueries({ queryKey: ['adm-users-list'] });setSelectedIds([]);toast.success('Comptes bannis');}
  });

  const exportCSV = () => {
    const rows = [['Nom', 'Email', 'Rôle', 'Statut', 'Badges', 'Téléphone', 'Localisation']];
    filtered.forEach((u) => rows.push([u.display_name || u.full_name || '', u.email || '', u.role || 'user', u.account_status || 'active', (u.badges || []).join(', '), u.phone || '', u.location || '']));
    const csv = rows.map((r) => r.map((v) => `"${v}"`).join(',')).join('\n');
    const a = document.createElement('a');a.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv);
    a.download = 'utilisateurs.csv';a.click();
  };

  const toggleSelect = (id) => setSelectedIds((p) => p.includes(id) ? p.filter((x) => x !== id) : [...p, id]);
  const toggleAll = () => setSelectedIds(selectedIds.length === filtered.length ? [] : filtered.map((u) => u.id));

  // Poll backend periodically to refresh users list (replacement for realtime subscribe)
  useEffect(() => {
    const handler = () => qc.invalidateQueries({ queryKey: ['adm-users-list'] });
    handler();
    const iv = setInterval(handler, 15000);
    return () => clearInterval(iv);
  }, [qc]);

  const filtered = users.
  filter((u) => filterStatus === 'all' || (u.account_status || 'active') === filterStatus).
  filter((u) => filterRole === 'all' || (u.role || 'user') === filterRole).
  filter((u) => filterBadge === 'all' || (u.badges || []).includes(filterBadge)).
  filter((u) => !search || (u.display_name || u.full_name)?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase()));

  const reportCountForUser = (email) => reports.filter((r) => r.target_email === email).length;
  const hasDeletionRequest = (email) => deletionRequests.some((r) => r.user_email === email);

  return (
    <div>
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div>
          <h1 className="font-grotesk font-bold text-2xl">Gestion des comptes</h1>
          <p className="font-inter text-sm text-muted-foreground">{users.length} comptes · {filtered.length} affiché{filtered.length > 1 ? 's' : ''}</p>
          {deletionRequests.length > 0 &&
          <p className="font-inter text-xs text-destructive mt-0.5 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" /> {deletionRequests.length} demande{deletionRequests.length > 1 ? 's' : ''} de suppression en attente
            </p>
          }
        </div>
        <div className="flex gap-2">
          <Button size="sm" onClick={() => {setCreateModal(true);setCreateForm({ email: '', role: 'user' });}} className="bg-primary text-primary-foreground text-xs gap-1.5">
            <UserPlus className="w-3.5 h-3.5" /> Créer un compte
          </Button>
          <Button size="sm" variant="outline" onClick={exportCSV} className="border-border text-xs gap-1.5">
            <Download className="w-3.5 h-3.5" /> Exporter CSV
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input placeholder="Rechercher..." value={search} onChange={(e) => setSearch(e.target.value)} className="bg-card border-border pl-9 w-44" />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="bg-card border-border w-36"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous statuts</SelectItem>
            <SelectItem value="active">Actifs</SelectItem>
            <SelectItem value="suspended">Suspendus</SelectItem>
            <SelectItem value="banned">Bannis</SelectItem>
            <SelectItem value="restricted">Restreints</SelectItem>
            <SelectItem value="closed">Fermés</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterRole} onValueChange={setFilterRole}>
          <SelectTrigger className="bg-card border-border w-36"><SelectValue placeholder="Rôle" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous rôles</SelectItem>
            {Object.entries(ROLE_CONFIG).map(([role, cfg]) =>
            <SelectItem key={role} value={role}>{cfg.emoji} {cfg.label}</SelectItem>
            )}
          </SelectContent>
        </Select>
        <Select value={filterBadge} onValueChange={setFilterBadge}>
          <SelectTrigger className="bg-card border-border w-36"><SelectValue placeholder="Badge" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous badges</SelectItem>
            {BADGES.map((b) => <SelectItem key={b} value={b}>{b}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Bulk action bar */}
      {selectedIds.length > 0 &&
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
      }

      {isLoading ?
      <div className="flex justify-center py-10"><div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div> :

      <div className="space-y-2">
          {/* Select all */}
          {filtered.length > 0 &&
        <div className="flex items-center gap-2 px-1 mb-1">
              <input type="checkbox" checked={selectedIds.length === filtered.length && filtered.length > 0}
          onChange={toggleAll} className="w-3.5 h-3.5 accent-primary cursor-pointer" />
              <span className="font-inter text-xs text-muted-foreground">Tout sélectionner</span>
            </div>
        }
          {filtered.map((u) => {
          const status = u.account_status || 'active';
          const reportCount = reportCountForUser(u.email);
          const isTargetSupreme = (u.verifications || []).includes('supreme');
          const blocked = isTargetSupreme && !canManageSupreme;
          const cfg = ROLE_CONFIG[u.role] || ROLE_CONFIG.user;
          const isOwnerUser = PDG_EMAILS.includes(u.email) || u.role === 'owner';
          const isPdgAdj = PDG_ADJOINT_EMAILS.includes(u.email) || u.role === 'pdg_adjoint';
          const roleLabel = isOwnerUser ? '👑 PDG' : isPdgAdj ? '🥈 PDG-Adj' : `${cfg.emoji} ${cfg.label}`;

          return (
            <div key={u.id} className={`flex flex-col lg:flex-row lg:items-center gap-4 p-4 rounded-xl bg-card border transition-colors ${selectedIds.includes(u.id) ? 'border-primary/40 bg-primary/5' : 'border-border hover:border-primary/20'}`}>
                {/* Checkbox */}
                <input type="checkbox" checked={selectedIds.includes(u.id)} onChange={() => toggleSelect(u.id)}
              className="w-3.5 h-3.5 accent-primary cursor-pointer flex-shrink-0" />

                {/* Avatar + User Info */}
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className="w-12 h-12 lg:w-10 lg:h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {u.avatar_url ?
                  <img src={u.avatar_url} className="w-full h-full object-cover" alt="" /> :
                  <span className="font-grotesk font-bold text-primary text-lg lg:text-base">{(u.display_name || u.full_name)?.[0] || 'U'}</span>
                  }
                  </div>

                  <div className="flex-1 min-w-0">
                    {/* Name + Status badges */}
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <p className="font-grotesk font-bold text-sm lg:text-base">{u.display_name || u.full_name || '—'}</p>
                      {u.verified_status === 'yes' && <CheckCircle className="w-3.5 h-3.5 flex-shrink-0 text-[#f50a0a] bg-gray-900" />}
                    </div>

                    {/* Status + Reports */}
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                      <span className={`font-mono text-[9px] px-2 py-0.5 rounded-full border ${STATUS_COLORS[status]}`}>
                        {STATUS_LABELS[status]}
                      </span>
                      {reportCount > 0 &&
                    <Link to="/admin/reports">
                          <span className="flex items-center gap-1 font-mono text-[9px] text-destructive bg-destructive/10 border border-destructive/30 px-2 py-0.5 rounded-full cursor-pointer hover:bg-destructive/20">
                            <Flag className="w-2.5 h-2.5" /> {reportCount}
                          </span>
                        </Link>
                    }
                      <span className="hidden lg:inline font-mono text-xs text-muted-foreground">{roleLabel}</span>
                    </div>

                    {/* Email + Phone */}
                    <div>
                      <p className="font-mono text-xs text-muted-foreground truncate">{u.email}</p>
                      {u.phone && <p className="font-mono text-xs text-muted-foreground/60">{formatPhone(u.phone)}</p>}
                    </div>

                    {/* Badges */}
                    {u.badges?.length > 0 &&
                  <div className="flex flex-wrap gap-1 mt-2">
                        {u.badges.map((b) => <BadgeChip key={b} badge={b} size="sm" />)}
                      </div>
                  }
                  </div>
                </div>

                {/* Action Buttons - Stacked on mobile, Row on desktop */}
                <div className="flex gap-2 flex-wrap lg:flex-nowrap lg:flex-shrink-0">
                  {status === 'active' ?
                <Button size="sm" variant="outline"
                className={blocked ? 'border-amber-600/30 text-amber-600/50 text-xs gap-1 cursor-not-allowed opacity-50 flex-1 lg:flex-none' : 'border-yellow-400/30 text-yellow-400 hover:bg-yellow-400/10 text-xs gap-1 flex-1 lg:flex-none'}
                onClick={() => blocked ? toast.error('Seul le PDG ou PDG-Adjoint peut agir sur un membre Suprême.') : quickAction.mutate({ id: u.id, data: { account_status: 'suspended', suspension_reason: 'Suspension admin' } })}>
                      <ShieldOff className="w-3 h-3" />
                      <span className="hidden sm:inline">Suspendre</span>
                    </Button> :
                status !== 'active' &&
                <Button size="sm" variant="outline" className="border-green-400/30 text-green-400 hover:bg-green-400/10 text-xs gap-1 flex-1 lg:flex-none"
                onClick={() => quickAction.mutate({ id: u.id, data: { account_status: 'active', suspension_reason: '' } })}>
                      <ShieldCheck className="w-3 h-3" />
                      <span className="hidden sm:inline">Réactiver</span>
                    </Button>
                }

                  <Button size="sm" variant="outline"
                onClick={() => blocked ? toast.error('Seul le PDG ou PDG-Adjoint peut modifier un membre Suprême.') : openEdit(u)}
                className={`text-xs flex-1 lg:flex-none gap-1 ${blocked ? 'border-amber-600/30 text-amber-600/50 cursor-not-allowed opacity-50' : 'border-primary/30 text-primary hover:bg-primary/10'}`}>
                    <span className="hidden sm:inline">Modifier</span>
                    <span className="sm:hidden">✏️</span>
                  </Button>

                  <Button size="sm" variant="outline"
                onClick={() => blocked ? toast.error('Seul le PDG ou PDG-Adjoint peut supprimer un membre Suprême.') : (setDeleteConfirm(u), setDeleteReason(''), setEmailSent(false))}
                className={`text-xs flex-1 lg:flex-none gap-1 ${
                blocked ?
                'border-amber-600/30 text-amber-600/50 cursor-not-allowed opacity-50' :
                `border-destructive/40 text-destructive hover:bg-destructive/10 ${hasDeletionRequest(u.email) ? 'animate-pulse border-destructive' : ''}`}`
                }>
                    <Trash2 className="w-3 h-3" />
                    <span className="hidden sm:inline">{hasDeletionRequest(u.email) ? 'Demande!' : 'Suppr.'}</span>
                  </Button>
                </div>
              </div>);

        })}
          {filtered.length === 0 &&
        <div className="text-center py-16 text-muted-foreground font-inter text-sm">Aucun utilisateur trouvé</div>
        }
        </div>
      }

      {/* Delete confirmation dialog */}
      {deleteConfirm && (() => {
        const isTargetSupreme = (deleteConfirm.verifications || []).includes('supreme');
        return (
          <div className="fixed inset-0 backdrop-blur-sm z-50 flex items-center justify-center p-4" style={isTargetSupreme ? { background: 'rgba(13,8,0,0.92)' } : { background: 'rgba(0,0,0,0.8)' }}>
          <div className="rounded-2xl p-6 max-w-sm w-full space-y-4" style={isTargetSupreme ? {
              background: 'linear-gradient(145deg,#1a0c00,#2d1500,#1a0c00)',
              border: '1px solid rgba(217,119,6,0.5)',
              boxShadow: '0 0 40px rgba(245,158,11,0.15), 0 0 80px rgba(245,158,11,0.05)'
            } : { background: 'hsl(var(--card))', border: '1px solid rgba(239,68,68,0.3)' }}>
            <div className="flex items-center gap-2">
              {isTargetSupreme ? <span style={{ fontSize: 20 }}>👑</span> : <AlertTriangle className="w-5 h-5 text-destructive" />}
              <h3 className="font-grotesk font-bold text-base" style={isTargetSupreme ? { background: 'linear-gradient(90deg,#f59e0b,#fde68a)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' } : {}}>Supprimer le compte{isTargetSupreme ? ' — Rang Suprême' : ''}</h3>
            </div>
            {isTargetSupreme &&
              <div style={{ background: 'linear-gradient(135deg,rgba(245,158,11,0.08),rgba(217,119,6,0.05))', border: '1px solid rgba(217,119,6,0.35)', borderRadius: 10, padding: '12px 16px' }}>
                <p className="font-mono text-[10px] font-bold uppercase tracking-widest" style={{ color: '#f59e0b' }}>👑 Membre Suprême — Action Exclusive Propriétaire</p>
                <p className="font-inter text-xs mt-1" style={{ color: '#a08040' }}>Cette suppression est irréversible et concerne un membre d'élite.</p>
              </div>
              }
            {hasDeletionRequest(deleteConfirm.email) &&
              <div className="bg-destructive/10 border border-destructive/30 rounded-lg px-3 py-2 font-inter text-xs text-destructive">
                ⚠️ Cet utilisateur a demandé la suppression de son compte.
              </div>
              }
            <p className="font-inter text-sm text-muted-foreground">
               Supprimer définitivement <strong className="text-foreground">{deleteConfirm.display_name || deleteConfirm.full_name}</strong> ({deleteConfirm.email}) ? Cette action est irréversible.
             </p>
            {!hasDeletionRequest(deleteConfirm.email) &&
              <div>
                <label className="font-inter text-xs text-muted-foreground mb-1 block">Raison de la suppression <span className="text-destructive">*</span></label>
                <Textarea
                  value={deleteReason}
                  onChange={(e) => setDeleteReason(e.target.value)}
                  placeholder="Ex: Compte inactif, violation des CGU..."
                  className="bg-secondary border-border resize-none h-20 text-sm" />
                
              </div>
              }
            <div className="flex flex-col gap-2">
              {hasDeletionRequest(deleteConfirm.email) &&
                <Button size="sm" variant="outline"
                className="border-yellow-400/30 text-yellow-400 hover:bg-yellow-400/10 text-xs gap-1.5 w-full"
                onClick={() => {
                  const req = deletionRequests.find((r) => r.user_email === deleteConfirm.email);
                  if (req) refuseDeletion.mutate({ requestId: req.id, userEmail: deleteConfirm.email, userName: deleteConfirm.display_name || deleteConfirm.full_name });
                }}
                disabled={refuseDeletion.isPending}>
                  {refuseDeletion.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : '❌'} Refuser la demande (et notifier l'utilisateur)
                </Button>
                }
              {!emailSent ?
                <Button size="sm" variant="outline"
                className="border-primary/40 text-primary hover:bg-primary/10 text-xs gap-1.5 w-full"
                onClick={() => sendDeletionEmail.mutate({
                  userEmail: deleteConfirm.email,
                  userName: deleteConfirm.display_name || deleteConfirm.full_name,
                  reason: deleteReason,
                  hadRequest: hasDeletionRequest(deleteConfirm.email)
                })}
                disabled={sendDeletionEmail.isPending || !hasDeletionRequest(deleteConfirm.email) && !deleteReason.trim()}>
                  {sendDeletionEmail.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : '📧'} Étape 1 — Envoyer l'email de notification
                </Button> :

                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-green-400/10 border border-green-400/20">
                  <span className="text-green-400 text-xs">✅ Email envoyé</span>
                  <button className="ml-auto text-xs text-muted-foreground underline" onClick={() => setEmailSent(false)}>Renvoyer</button>
                </div>
                }
              <div className="flex gap-2 justify-end">
                <Button size="sm" variant="outline" className="border-border text-xs" onClick={() => setDeleteConfirm(null)}>Annuler</Button>
                <Button size="sm" className="bg-destructive text-white hover:bg-destructive/90 text-xs gap-1.5"
                  onClick={() => deleteUser.mutate({ userId: deleteConfirm.id, userEmail: deleteConfirm.email, userName: deleteConfirm.display_name || deleteConfirm.full_name, reason: deleteReason })}
                  disabled={deleteUser.isPending || !emailSent}>
                   {deleteUser.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
                   Étape 2 — Supprimer définitivement
                  </Button>
              </div>
            </div>
          </div>
        </div>);

      })()}

      {/* Create user modal */}
      {createModal &&
      <div className="fixed inset-0 backdrop-blur-sm bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="rounded-2xl p-6 max-w-sm w-full space-y-4 bg-card border border-border">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center">
                <UserPlus className="w-4 h-4 text-primary" />
              </div>
              <h3 className="font-grotesk font-bold text-base">Créer un compte utilisateur</h3>
            </div>

            <p className="font-inter text-xs text-muted-foreground">
              Un email d'invitation sera envoyé à l'adresse indiquée avec un lien de connexion.
            </p>

            <div className="space-y-3">
              <div>
                <label className="font-inter text-xs text-muted-foreground mb-1 block">Adresse email <span className="text-destructive">*</span></label>
                <Input
                type="email"
                placeholder="utilisateur@exemple.com"
                value={createForm.email}
                onChange={(e) => setCreateForm((p) => ({ ...p, email: e.target.value }))}
                className="bg-secondary border-border text-sm"
                autoFocus />
              
              </div>
              <div>
                <label className="font-inter text-xs text-muted-foreground mb-1 block">Rôle</label>
                <Select value={createForm.role} onValueChange={(v) => setCreateForm((p) => ({ ...p, role: v }))}>
                  <SelectTrigger className="bg-secondary border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {assignableRoles.map((r) =>
                  <SelectItem key={r.role} value={r.role}>{r.emoji} {r.label}</SelectItem>
                  )}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex gap-2 justify-end pt-1">
              <Button size="sm" variant="outline" className="border-border text-xs" onClick={() => setCreateModal(false)}>
                Annuler
              </Button>
              <Button
              size="sm"
              className="bg-primary text-primary-foreground text-xs gap-1.5"
              disabled={!createForm.email.trim() || createLoading}
              onClick={async () => {
                setCreateLoading(true);
                try {
                  await base44.users.inviteUser(createForm.email.trim(), createForm.role);
                  toast.success(`Invitation envoyée à ${createForm.email}`);
                  setCreateModal(false);
                  setTimeout(() => qc.invalidateQueries({ queryKey: ['adm-users-list'] }), 2000);
                } catch (err) {
                  toast.error(err?.message || 'Erreur lors de la création du compte');
                } finally {
                  setCreateLoading(false);
                }
              }}>
              
                {createLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <UserPlus className="w-3 h-3" />}
                Envoyer l'invitation
              </Button>
            </div>
          </div>
        </div>
      }

      {editUser &&
      <UserEditModal
        user={editUser}
        open={!!editUser}
        onClose={() => setEditUser(null)}
        onSave={(data) => {
          updateUser.mutate({ id: editUser.id, data }, {
            onSuccess: () => setEditUser(null)
          });
        }}
        isLoading={updateUser.isPending}
        currentUser={currentUser} />

      }
    </div>);

}