import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import {
  User, Save, Loader2, Search, ShieldCheck, ShieldOff,
  Ban, Clock, CheckCircle, Flag, Eye
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

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['adm-users-list'],
    queryFn: () => base44.entities.User.list(),
  });

  const { data: reports = [] } = useQuery({
    queryKey: ['adm-user-reports'],
    queryFn: () => base44.entities.Report.filter({ target_type: 'user', status: 'pending' }),
  });

  const updateUser = useMutation({
    mutationFn: ({ id, data }) => base44.entities.User.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['adm-users-list'] });
      setEditUser(null);
      toast.success('Utilisateur mis à jour');
    },
  });

  const quickAction = useMutation({
    mutationFn: ({ id, data }) => base44.entities.User.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['adm-users-list'] }),
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
      is_verified: u.is_verified || false,
      account_status: u.account_status || 'active',
      suspension_reason: u.suspension_reason || '',
      suspension_until: u.suspension_until || '',
    });
  };

  const filtered = users
    .filter(u => filterStatus === 'all' || (u.account_status || 'active') === filterStatus)
    .filter(u => !search || u.full_name?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase()));

  const reportCountForUser = (email) => reports.filter(r => r.target_email === email).length;

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="font-grotesk font-bold text-2xl">Gestion des comptes</h1>
          <p className="font-inter text-sm text-muted-foreground">{users.length} comptes</p>
        </div>
        <div className="flex gap-2">
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="bg-card border-border w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous</SelectItem>
              <SelectItem value="active">Actifs</SelectItem>
              <SelectItem value="suspended">Suspendus</SelectItem>
              <SelectItem value="banned">Bannis</SelectItem>
              <SelectItem value="restricted">Restreints</SelectItem>
            </SelectContent>
          </Select>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <Input placeholder="Rechercher..." value={search} onChange={e => setSearch(e.target.value)} className="bg-card border-border pl-9 w-48" />
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-10"><div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>
      ) : (
        <div className="space-y-2">
          {filtered.map(u => {
            const status = u.account_status || 'active';
            const reportCount = reportCountForUser(u.email);
            return (
              <div key={u.id} className="flex items-center gap-4 p-4 rounded-xl bg-card border border-border hover:border-primary/20 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 overflow-hidden">
                  {u.avatar_url
                    ? <img src={u.avatar_url} className="w-full h-full object-cover" alt="" />
                    : <span className="font-grotesk font-bold text-primary">{u.full_name?.[0] || 'U'}</span>
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-inter text-sm font-medium">{u.full_name || '—'}</p>
                    {u.is_verified && <CheckCircle className="w-3.5 h-3.5 text-accent" />}
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
                </div>
              </div>
            );
          })}
          {filtered.length === 0 && (
            <div className="text-center py-16 text-muted-foreground font-inter text-sm">Aucun utilisateur trouvé</div>
          )}
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
                  checked={editForm.is_verified}
                  onCheckedChange={v => setEditForm(p => ({ ...p, is_verified: v }))}
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