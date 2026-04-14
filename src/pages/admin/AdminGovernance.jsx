import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Crown, Building2, Shield, Users, Edit2, Check, X, UserCog, Award } from 'lucide-react';
import { ROLE_CONFIG, PDG_ADJOINT_EMAILS } from '@/lib/roles';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

const GOVERNANCE_ROLES = ['owner', 'pdg_adjoint', 'conseil_admin', 'admin', 'directeur', 'responsable', 'collaborateur_interne'];

export default function AdminGovernance() {
  const qc = useQueryClient();
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [currentUser, setCurrentUser] = useState(null);

  React.useEffect(() => { base44.auth.me().then(setCurrentUser).catch(() => {}); }, []);

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['gov-users'],
    queryFn: async () => {
      const res = await base44.functions.invoke('adminGetUsers', {});
      return res.data.users || [];
    },
  });

  const updateUser = useMutation({
    mutationFn: ({ id, data }) => base44.functions.invoke('adminUpdateUser', { id, data }),
    onSuccess: (_, { id, data }) => {
      qc.setQueryData(['gov-users'], old => (old || []).map(u => u.id === id ? { ...u, ...data } : u));
      toast.success('Mis à jour');
      setEditingId(null);
    },
    onError: () => toast.error('Erreur lors de la mise à jour'),
  });

  const isSelf = (u) => u.email === currentUser?.email;
  const isOwnerSelf = currentUser?.role === 'owner' || currentUser?.email === 'contact.astuceson@gmail.com';
  const isPdgAdjointSelf = currentUser?.role === 'pdg_adjoint' || PDG_ADJOINT_EMAILS.includes(currentUser?.email);

  // Stats par rôle
  const roleCounts = GOVERNANCE_ROLES.reduce((acc, r) => {
    acc[r] = users.filter(u => u.role === r).length;
    return acc;
  }, {});

  const govUsers = users.filter(u => GOVERNANCE_ROLES.includes(u.role)).sort((a, b) => {
    const la = ROLE_CONFIG[a.role]?.level || 0;
    const lb = ROLE_CONFIG[b.role]?.level || 0;
    return lb - la;
  });

  const startEdit = (u) => {
    setEditingId(u.id);
    setEditForm({ role: u.role, title: u.title || '', department: u.department || '' });
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-grotesk font-bold text-2xl flex items-center gap-2">
          <Building2 className="w-6 h-6 text-primary" />
          Gouvernance & Organigramme
        </h1>
        <p className="font-inter text-sm text-muted-foreground mt-1">Gérez les rôles internes et la structure de l'entreprise</p>
      </div>

      {/* Organigramme résumé */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mb-8">
        {GOVERNANCE_ROLES.map(role => {
          const cfg = ROLE_CONFIG[role];
          return (
            <div key={role} className={`bg-card border ${cfg.border} rounded-xl p-3 text-center`}>
              <p className="text-xl mb-1">{cfg.emoji}</p>
              <p className={`font-grotesk font-bold text-lg ${cfg.color}`}>{roleCounts[role] || 0}</p>
              <p className="font-inter text-xs text-muted-foreground leading-tight">{cfg.label}</p>
            </div>
          );
        })}
      </div>

      {/* Membres de gouvernance */}
      <div className="space-y-2">
        <h2 className="font-grotesk font-semibold text-base mb-4">Membres de la Direction</h2>
        {isLoading ? (
          <div className="flex justify-center py-10"><div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>
        ) : (
          govUsers.map(u => {
            const cfg = ROLE_CONFIG[u.role] || ROLE_CONFIG.user;
            const isEditing = editingId === u.id;
            const canEdit = isOwnerSelf || (isPdgAdjointSelf && u.role !== 'owner');

            return (
              <div key={u.id} className={`bg-card border rounded-xl p-4 transition-colors ${isEditing ? 'border-primary/40' : 'border-border'}`}>
                {isEditing ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center overflow-hidden flex-shrink-0">
                        {u.avatar_url ? <img src={u.avatar_url} className="w-full h-full object-cover" alt="" /> : <span className="font-bold text-sm text-primary">{u.full_name?.[0]}</span>}
                      </div>
                      <div>
                        <p className="font-inter font-semibold text-sm">{u.full_name}</p>
                        <p className="font-mono text-xs text-muted-foreground">{u.email}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="font-inter text-xs text-muted-foreground mb-1 block">Rôle</label>
                        <Select value={editForm.role} onValueChange={v => setEditForm(p => ({ ...p, role: v }))}>
                          <SelectTrigger className="bg-secondary border-border text-xs h-8">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(ROLE_CONFIG).map(([key, rcfg]) => (
                              <SelectItem key={key} value={key} disabled={key === 'owner' && !isOwnerSelf}>
                                {rcfg.emoji} {rcfg.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="font-inter text-xs text-muted-foreground mb-1 block">Titre officiel</label>
                        <Input value={editForm.title} onChange={e => setEditForm(p => ({ ...p, title: e.target.value }))} placeholder="ex: Directeur Technique" className="bg-secondary border-border h-8 text-xs" />
                      </div>
                      <div>
                        <label className="font-inter text-xs text-muted-foreground mb-1 block">Département</label>
                        <Input value={editForm.department} onChange={e => setEditForm(p => ({ ...p, department: e.target.value }))} placeholder="ex: Technique" className="bg-secondary border-border h-8 text-xs" />
                      </div>
                    </div>
                    <div className="flex gap-2 justify-end">
                      <Button size="sm" variant="outline" onClick={() => setEditingId(null)} className="h-7 text-xs gap-1"><X className="w-3 h-3" />Annuler</Button>
                      <Button size="sm" onClick={() => updateUser.mutate({ id: u.id, data: editForm })} className="h-7 text-xs gap-1"><Check className="w-3 h-3" />Sauvegarder</Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden"
                      style={{ background: `color-mix(in srgb, ${cfg.color.replace('text-', '')} 15%, transparent)` }}>
                      {u.avatar_url ? <img src={u.avatar_url} className="w-full h-full object-cover" alt="" /> : <span className="font-bold text-base">{cfg.emoji}</span>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-inter font-semibold text-sm">{u.full_name}</p>
                        {isSelf(u) && <span className="font-mono text-[9px] bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded-full">Vous</span>}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                        <span className={`font-mono text-[10px] px-2 py-0.5 rounded-full border ${cfg.bg} ${cfg.color} ${cfg.border}`}>{cfg.emoji} {cfg.label}</span>
                        {u.title && <span className="font-inter text-xs text-muted-foreground">{u.title}</span>}
                        {u.department && <span className="font-mono text-[10px] text-muted-foreground">· {u.department}</span>}
                      </div>
                      <p className="font-mono text-[10px] text-muted-foreground mt-0.5">{u.email}</p>
                    </div>
                    {canEdit && (
                      <Button size="sm" variant="ghost" onClick={() => startEdit(u)} className="flex-shrink-0 h-7 w-7 p-0">
                        <Edit2 className="w-3.5 h-3.5 text-muted-foreground" />
                      </Button>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Attribuer rôle à un user existant */}
      <div className="mt-8 bg-card border border-border rounded-xl p-5">
        <h3 className="font-grotesk font-semibold text-sm mb-4 flex items-center gap-2"><UserCog className="w-4 h-4 text-primary" />Élever un membre au rang de direction</h3>
        <PromoteUser users={users} govRoles={GOVERNANCE_ROLES} onPromote={(id, role, title, dept) => updateUser.mutate({ id, data: { role, title, department: dept } })} canAssignOwner={isOwnerSelf} />
      </div>
    </div>
  );
}

function PromoteUser({ users, govRoles, onPromote, canAssignOwner }) {
  const [selectedUser, setSelectedUser] = useState('');
  const [selectedRole, setSelectedRole] = useState('directeur');
  const [title, setTitle] = useState('');
  const [dept, setDept] = useState('');

  const nonGovUsers = users.filter(u => !govRoles.includes(u.role));

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
      <div>
        <label className="font-inter text-xs text-muted-foreground mb-1 block">Membre</label>
        <Select value={selectedUser} onValueChange={setSelectedUser}>
          <SelectTrigger className="bg-secondary border-border text-xs">
            <SelectValue placeholder="Choisir un membre..." />
          </SelectTrigger>
          <SelectContent>
            {nonGovUsers.map(u => (
              <SelectItem key={u.id} value={u.id}>{u.full_name} — {u.email}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <label className="font-inter text-xs text-muted-foreground mb-1 block">Nouveau rôle</label>
        <Select value={selectedRole} onValueChange={setSelectedRole}>
          <SelectTrigger className="bg-secondary border-border text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(ROLE_CONFIG)
              .filter(([key]) => key !== 'user' && key !== 'vip' && key !== 'collaborateur' && key !== 'pilote' && (key !== 'owner' || canAssignOwner))
              .map(([key, cfg]) => (
                <SelectItem key={key} value={key}>{cfg.emoji} {cfg.label}</SelectItem>
              ))
            }
          </SelectContent>
        </Select>
      </div>
      <div>
        <label className="font-inter text-xs text-muted-foreground mb-1 block">Titre</label>
        <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="ex: Dir. Commercial" className="bg-secondary border-border text-xs" />
      </div>
      <div className="flex flex-col justify-end">
        <Button
          disabled={!selectedUser}
          onClick={() => { onPromote(selectedUser, selectedRole, title, dept); setSelectedUser(''); setTitle(''); }}
          className="gap-2 font-grotesk font-semibold"
        >
          <Award className="w-4 h-4" /> Élever
        </Button>
      </div>
    </div>
  );
}