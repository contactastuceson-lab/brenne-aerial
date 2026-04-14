import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Crown, Search, Shield, Building2, ChevronDown, UserCheck, AlertTriangle, Check, X } from 'lucide-react';
import { ROLE_CONFIG, PDG_EMAILS, PDG_ADJOINT_EMAILS } from '@/lib/roles';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

// Rôles de direction gérables ici
const GOVERNANCE_ROLES = ['owner', 'pdg_adjoint', 'conseil_admin', 'admin', 'directeur', 'responsable'];

export default function AdminGovernance() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [pendingChange, setPendingChange] = useState(null); // { userId, userName, oldRole, newRole }

  React.useEffect(() => { base44.auth.me().then(setCurrentUser).catch(() => {}); }, []);

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['gov-users'],
    queryFn: async () => {
      const res = await base44.functions.invoke('adminGetUsers', {});
      return res.data.users || [];
    },
  });

  const updateRoleMutation = useMutation({
    mutationFn: ({ id, role }) => base44.functions.invoke('adminUpdateUser', { id, data: { role } }),
    onSuccess: (_, { id, role }) => {
      qc.setQueryData(['gov-users'], old =>
        (old || []).map(u => u.id === id ? { ...u, role } : u)
      );
      toast.success('Rôle mis à jour avec succès');
      setPendingChange(null);
    },
    onError: () => { toast.error('Erreur lors de la mise à jour'); setPendingChange(null); },
  });

  const isOwner = currentUser?.role === 'owner' || PDG_EMAILS.includes(currentUser?.email);
  const isPdgAdjoint = currentUser?.role === 'pdg_adjoint' || PDG_ADJOINT_EMAILS.includes(currentUser?.email);
  const isTopMgmt = isOwner || isPdgAdjoint;

  // Un PDG-Adjoint ne peut pas modifier le PDG
  const canEditUser = (targetUser) => {
    if (!isTopMgmt) return false;
    if (isOwner) return true; // Le PDG peut tout faire
    // PDG-Adjoint ne peut pas toucher le PDG
    if (PDG_EMAILS.includes(targetUser.email)) return false;
    if (targetUser.role === 'owner' && !PDG_ADJOINT_EMAILS.includes(targetUser.email)) return false;
    return true;
  };

  const canAssignRole = (role) => {
    if (isOwner) return true;
    if (isPdgAdjoint) return role !== 'owner'; // PDG-Adjoint ne peut pas nommer un autre PDG
    return false;
  };

  // Filtrer les membres de direction uniquement
  const governanceUsers = users.filter(u =>
    GOVERNANCE_ROLES.includes(u.role) || PDG_EMAILS.includes(u.email) || PDG_ADJOINT_EMAILS.includes(u.email)
  );

  const filtered = governanceUsers.filter(u =>
    !search || u.full_name?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase())
  );

  // Compter par rôle
  const roleCounts = {};
  GOVERNANCE_ROLES.forEach(r => { roleCounts[r] = governanceUsers.filter(u => u.role === r || (r === 'owner' && PDG_EMAILS.includes(u.email))).length; });

  return (
    <div>
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-yellow-500/10 border border-yellow-500/30 flex items-center justify-center">
            <Crown className="w-5 h-5 text-yellow-500" />
          </div>
          <div>
            <h1 className="font-grotesk font-bold text-2xl">Gouvernance & Direction</h1>
            <p className="font-inter text-sm text-muted-foreground">Gérez les rôles de direction et la structure organisationnelle</p>
          </div>
        </div>
      </div>

      {/* Organigramme des rôles */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
        {GOVERNANCE_ROLES.map(role => {
          const cfg = ROLE_CONFIG[role];
          return (
            <div key={role} className={`bg-card border rounded-xl p-3 text-center ${cfg.border}`}>
              <p className="text-xl mb-1">{cfg.emoji}</p>
              <p className={`font-mono text-[10px] font-bold ${cfg.color}`}>{cfg.label}</p>
              <p className={`font-grotesk font-bold text-2xl mt-1 ${cfg.color}`}>{roleCounts[role] || 0}</p>
            </div>
          );
        })}
      </div>

      {/* Recherche */}
      <div className="relative mb-5">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
        <Input
          placeholder="Rechercher un membre de direction..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pl-9 bg-card border-border"
        />
      </div>

      {/* Confirmation dialog */}
      {pendingChange && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-card border border-border rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-yellow-500/10 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-yellow-500" />
              </div>
              <div>
                <h3 className="font-grotesk font-bold">Confirmer le changement</h3>
                <p className="font-inter text-xs text-muted-foreground">Cette action modifie les droits de direction</p>
              </div>
            </div>
            <div className="bg-secondary/50 rounded-xl p-4 space-y-2 font-inter text-sm">
              <p><span className="text-muted-foreground">Utilisateur :</span> <span className="font-semibold">{pendingChange.userName}</span></p>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Rôle :</span>
                <span className={`font-semibold ${ROLE_CONFIG[pendingChange.oldRole]?.color}`}>{ROLE_CONFIG[pendingChange.oldRole]?.emoji} {ROLE_CONFIG[pendingChange.oldRole]?.label}</span>
                <span className="text-muted-foreground">→</span>
                <span className={`font-semibold ${ROLE_CONFIG[pendingChange.newRole]?.color}`}>{ROLE_CONFIG[pendingChange.newRole]?.emoji} {ROLE_CONFIG[pendingChange.newRole]?.label}</span>
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setPendingChange(null)}>
                <X className="w-4 h-4" /> Annuler
              </Button>
              <Button
                className="flex-1 bg-primary"
                disabled={updateRoleMutation.isPending}
                onClick={() => updateRoleMutation.mutate({ id: pendingChange.userId, role: pendingChange.newRole })}
              >
                <Check className="w-4 h-4" /> Confirmer
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Liste des membres */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.length === 0 && (
            <div className="text-center py-16 text-muted-foreground font-inter text-sm">
              Aucun membre de direction trouvé
            </div>
          )}
          {filtered.map(u => {
            const effectiveRole = PDG_EMAILS.includes(u.email) ? 'owner' : (PDG_ADJOINT_EMAILS.includes(u.email) ? 'pdg_adjoint' : u.role);
            const roleCfg = ROLE_CONFIG[effectiveRole] || ROLE_CONFIG.user;
            const editable = canEditUser(u);
            const isCurrentUser = u.email === currentUser?.email;

            return (
              <div key={u.id} className={`bg-card border rounded-xl p-4 transition-colors ${editable ? 'hover:border-primary/30' : 'opacity-80'} border-border`}>
                <div className="flex items-center gap-3">
                  {/* Avatar */}
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0 ${roleCfg.bg} border ${roleCfg.border}`}>
                    {u.avatar_url
                      ? <img src={u.avatar_url} className="w-full h-full object-cover" alt="" />
                      : <span className={`font-grotesk font-bold text-sm ${roleCfg.color}`}>{u.full_name?.[0] || '?'}</span>
                    }
                  </div>

                  {/* Infos */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-inter font-semibold text-sm truncate">{u.full_name || '—'}</p>
                      {isCurrentUser && <span className="font-mono text-[9px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">Vous</span>}
                    </div>
                    <p className="font-mono text-xs text-muted-foreground truncate">{u.email}</p>
                    <span className={`inline-flex items-center gap-1 mt-1 font-mono text-[10px] px-2 py-0.5 rounded-full border ${roleCfg.bg} ${roleCfg.color} ${roleCfg.border}`}>
                      {roleCfg.emoji} {roleCfg.label}
                    </span>
                  </div>

                  {/* Sélecteur de rôle */}
                  {editable && (
                    <div className="flex-shrink-0">
                      <select
                        value={effectiveRole || 'user'}
                        onChange={e => setPendingChange({ userId: u.id, userName: u.full_name || u.email, oldRole: u.role, newRole: e.target.value })}
                        className="bg-secondary border border-border text-foreground font-inter text-xs rounded-lg px-2 py-1.5 cursor-pointer hover:border-primary/50 focus:border-primary outline-none"
                      >
                        {GOVERNANCE_ROLES.filter(r => canAssignRole(r)).map(r => {
                          const rc = ROLE_CONFIG[r];
                          return <option key={r} value={r}>{rc.emoji} {rc.label}</option>;
                        })}
                        <option value="user">👤 Membre</option>
                      </select>
                    </div>
                  )}
                  {!editable && (
                    <div className="flex-shrink-0">
                      <Shield className="w-4 h-4 text-muted-foreground" title="Non modifiable" />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Info droits */}
      <div className="mt-8 bg-secondary/40 border border-border rounded-xl p-4">
        <div className="flex items-start gap-3">
          <UserCheck className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
          <div className="font-inter text-xs text-muted-foreground space-y-1">
            <p className="font-semibold text-foreground">Règles de gouvernance</p>
            <p>• Le <span className="text-yellow-500">PDG</span> peut modifier tous les rôles sans restriction.</p>
            <p>• Le <span className="text-orange-400">PDG-Adjoint</span> peut gérer tous les rôles sauf le PDG.</p>
            <p>• Les autres rôles n'ont pas accès à cette page.</p>
            <p>• Vous ne pouvez pas modifier votre propre rôle.</p>
          </div>
        </div>
      </div>
    </div>
  );
}