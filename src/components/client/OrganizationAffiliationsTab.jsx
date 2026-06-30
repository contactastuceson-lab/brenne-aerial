import React, { useEffect, useMemo, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Search, CheckCircle2, Sparkles, ShieldCheck, Eye, EyeOff, Loader2, UserPlus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { canManageAffiliations } from '@/lib/affiliationUtils';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { notifyAffiliationInvitation, notifyAffiliationStatus } from '@/lib/affiliationNotifications';
import { useOrganizationAffiliations, refreshAffiliations } from '@/hooks/useOrganizationAffiliations';

const ROLE_OPTIONS = ['member', 'admin', 'moderator'];
const STATUS_OPTIONS = ['all', 'pending', 'accepted', 'rejected', 'removed'];
const VISIBILITY_OPTIONS = ['all', 'public', 'private'];

export default function OrganizationAffiliationsTab({ user }) {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [visibilityFilter, setVisibilityFilter] = useState('all');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('member');
  const [inviteMessage, setInviteMessage] = useState('');
  const [autoAccept, setAutoAccept] = useState(false);
  const [creating, setCreating] = useState(false);
  const [publicUsers, setPublicUsers] = useState([]);
  const [inviteQuery, setInviteQuery] = useState('');
  const [inviteCandidate, setInviteCandidate] = useState(null);

  const { affiliations, loading: affiliationLoading } = useOrganizationAffiliations(user?.id ? { organizationId: user.id } : null);
  const loading = affiliationLoading;

  const canManage = canManageAffiliations(user);

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const response = await base44.functions.invoke('getPublicUsers', {});
        setPublicUsers(response.data || response || []);
      } catch (error) {
        console.error('Unable to load public users for suggestions', error);
      }
    };
    loadUsers();
  }, []);

  const filteredAffiliations = useMemo(() => {
    const query = search.toLowerCase();
    return affiliations.filter((row) => {
      const matchesSearch = !query || [row.organizationName, row.role, row.status, row.message].filter(Boolean).join(' ').toLowerCase().includes(query);
      const matchesRole = roleFilter === 'all' || row.role === roleFilter;
      const matchesStatus = statusFilter === 'all' || row.status === statusFilter;
      const matchesVisibility = visibilityFilter === 'all' || row.visibility === visibilityFilter;
      return matchesSearch && matchesRole && matchesStatus && matchesVisibility;
    });
  }, [affiliations, roleFilter, search, statusFilter, visibilityFilter]);

  const suggestions = useMemo(() => {
    const q = inviteQuery.trim().toLowerCase();
    if (!q) return [];
    return publicUsers.filter((u) => [u.display_name, u.full_name, u.username, u.email]
      .filter(Boolean)
      .some((field) => field.toLowerCase().includes(q)))
      .slice(0, 6);
  }, [publicUsers, inviteQuery]);

  const inviteUser = async () => {
    if ((!inviteEmail && !inviteCandidate) || !user?.id) return;
    setCreating(true);
    try {
      const target = inviteCandidate || publicUsers.find((u) => u.email === inviteEmail || u.username === inviteEmail || u.id === inviteEmail);
      const payload = {
        organizationId: user.id,
        userId: target ? target.id : inviteEmail,
        role: inviteRole,
        status: autoAccept ? 'accepted' : 'pending',
        visibility: 'public',
        createdAt: new Date().toISOString(),
        invitedBy: user.id,
        message: inviteMessage,
        organizationName: user.display_name || user.full_name || user.email,
        organizationAvatarUrl: user.avatar_url || '',
      };
      const created = await base44.functions.invoke('processOrganizationAffiliation', { action: 'create', affiliation: payload });
      const affiliation = created?.data?.affiliation || created?.affiliation || created;
      const targetEmail = target?.email || inviteEmail;
      await notifyAffiliationInvitation({ targetEmail, organizationName: payload.organizationName, invitationId: affiliation.id });
      await refreshAffiliations({ organizationId: user.id });
      setInviteEmail('');
      setInviteCandidate(null);
      setInviteQuery('');
      setInviteMessage('');
      toast.success('Invitation envoyée');
    } catch (error) {
      toast.error('Impossible d’envoyer l’invitation');
    } finally {
      setCreating(false);
    }
  };

  const updateAffiliation = async (id, patch) => {
    try {
      const response = await base44.functions.invoke('processOrganizationAffiliation', {
        action: 'update',
        affiliationId: id,
        patch,
      });
      const updated = response?.data?.affiliation || response?.affiliation || response;

      if (patch.status === 'accepted') {
        await notifyAffiliationStatus({ targetEmail: updated.userId, organizationName: updated.organizationName, status: 'accepted' });
      } else if (patch.status === 'rejected') {
        await notifyAffiliationStatus({ targetEmail: updated.userId, organizationName: updated.organizationName, status: 'rejected' });
      } else if (patch.role) {
        await notifyAffiliationStatus({ targetEmail: updated.userId, organizationName: updated.organizationName, status: 'role_changed' });
      }
      await refreshAffiliations({ organizationId: user.id });
      toast.success('Affiliation mise à jour');
    } catch {
      toast.error('Impossible de mettre à jour l’affiliation');
    }
  };

  const removeAffiliation = async (id) => {
    try {
      const response = await base44.functions.invoke('processOrganizationAffiliation', {
        affiliationId: id,
        action: 'delete',
      });
      const removed = affiliations.find((row) => row.id === id);
      if (removed) {
        await notifyAffiliationStatus({ targetEmail: removed.userId, organizationName: removed.organizationName, status: 'removed' });
      }
      await refreshAffiliations({ organizationId: user.id });
      toast.success('Affiliation supprimée');
    } catch {
      toast.error('Impossible de supprimer l’affiliation');
    }
  };

  if (!canManage) {
    return (
      <div className="rounded-2xl border border-border bg-card p-6 text-sm text-muted-foreground">
        Seuls les propriétaires ou administrateurs d’une organisation officielle ou suprême peuvent gérer les affiliations.
      </div>
    );
  }

  if (loading) {
    return (
      <div className="rounded-2xl border border-border bg-card p-6 flex items-center gap-3 text-sm text-muted-foreground">
        <Loader2 className="w-4 h-4 animate-spin" /> Chargement des affiliations…
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-border bg-card p-4 md:p-6 space-y-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="font-grotesk font-semibold text-lg">Affiliations</p>
            <p className="font-inter text-sm text-muted-foreground">Invitez, gérez et pilotez l’affiliation de comptes à votre organisation.</p>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Sparkles className="w-4 h-4 text-primary" /> {affiliations.filter((row) => row.status === 'accepted').length} affilié{affiliations.filter((row) => row.status === 'accepted').length > 1 ? 's' : ''}
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-[1.2fr_0.6fr_0.6fr_0.4fr] relative">
          <div className="relative">
            <Input
              placeholder="Email ou identifiant utilisateur"
              value={inviteCandidate ? `${inviteCandidate.display_name || inviteCandidate.full_name || inviteCandidate.username || inviteCandidate.email}` : inviteEmail}
              onChange={(e) => {
                setInviteEmail(e.target.value);
                setInviteQuery(e.target.value);
                setInviteCandidate(null);
              }}
            />
            {suggestions.length > 0 && !inviteCandidate && (
              <div className="absolute z-20 mt-1 max-h-60 w-full overflow-hidden overflow-y-auto rounded-2xl border border-border bg-card shadow-xl">
                {suggestions.map((user) => (
                  <button
                    key={user.id}
                    type="button"
                    onClick={() => {
                      setInviteCandidate(user);
                      setInviteEmail(user.email);
                      setInviteQuery('');
                    }}
                    className="w-full px-3 py-2 text-left hover:bg-primary/5 transition-colors flex items-center gap-3"
                  >
                    <div className="w-8 h-8 rounded-full bg-primary/10 overflow-hidden flex items-center justify-center text-xs font-semibold text-primary">
                      {user.avatar_url ? (
                        <img src={user.avatar_url} alt={user.display_name || user.full_name || user.username} className="h-full w-full object-cover" />
                      ) : (
                        <span>{(user.display_name || user.full_name || user.username || 'U')[0].toUpperCase()}</span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{user.display_name || user.full_name || user.username}</p>
                      <p className="text-[11px] text-muted-foreground truncate">{user.username ? `@${user.username}` : user.email}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
          <select value={inviteRole} onChange={(e) => setInviteRole(e.target.value)} className="h-10 rounded-lg border border-border bg-background px-3 text-sm">
            {ROLE_OPTIONS.map((role) => <option key={role} value={role}>{role}</option>)}
          </select>
          <label className="flex items-center gap-2 text-sm text-muted-foreground">
            <input type="checkbox" checked={autoAccept} onChange={(e) => setAutoAccept(e.target.checked)} />
            Accepter automatiquement
          </label>
          <Button onClick={inviteUser} disabled={creating} className="gap-2">
            {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />} Inviter
          </Button>
        </div>
        <Input placeholder="Message facultatif" value={inviteMessage} onChange={(e) => setInviteMessage(e.target.value)} />
      </div>

      <div className="rounded-2xl border border-border bg-card p-4 md:p-6 space-y-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Rechercher un affilié" className="pl-9" />
          </div>
          <div className="flex flex-wrap gap-2">
            <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="h-10 rounded-lg border border-border bg-background px-3 text-sm">
              <option value="all">Tous les rôles</option>
              {ROLE_OPTIONS.map((role) => <option key={role} value={role}>{role}</option>)}
            </select>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="h-10 rounded-lg border border-border bg-background px-3 text-sm">
              <option value="all">Tous les statuts</option>
              {STATUS_OPTIONS.filter((value) => value !== 'all').map((value) => <option key={value} value={value}>{value}</option>)}
            </select>
            <select value={visibilityFilter} onChange={(e) => setVisibilityFilter(e.target.value)} className="h-10 rounded-lg border border-border bg-background px-3 text-sm">
              <option value="all">Toutes visibilités</option>
              {VISIBILITY_OPTIONS.filter((value) => value !== 'all').map((value) => <option key={value} value={value}>{value}</option>)}
            </select>
          </div>
        </div>

        <div className="space-y-3">
          {filteredAffiliations.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
              Aucune affiliation à afficher pour le moment.
            </div>
          ) : filteredAffiliations.map((row) => (
            <motion.div key={row.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl border border-border bg-background/70 p-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-grotesk font-semibold text-sm">{row.organizationName || 'Organisation'}</p>
                  <span className="text-[10px] uppercase tracking-wider rounded-full border border-border px-2 py-0.5 text-muted-foreground">{row.role}</span>
                  <span className={`text-[10px] uppercase tracking-wider rounded-full border px-2 py-0.5 ${row.status === 'accepted' ? 'border-emerald-400/30 text-emerald-400 bg-emerald-400/10' : row.status === 'pending' ? 'border-amber-400/30 text-amber-400 bg-amber-400/10' : 'border-border text-muted-foreground'}`}>
                    {row.status}
                  </span>
                  <span className={`text-[10px] uppercase tracking-wider rounded-full border px-2 py-0.5 ${row.visibility === 'public' ? 'border-primary/30 text-primary bg-primary/10' : 'border-border text-muted-foreground'}`}>
                    {row.visibility}
                  </span>
                </div>
                <p className="font-inter text-xs text-muted-foreground mt-1">Utilisateur : {row.userId}</p>
                {row.message && <p className="font-inter text-xs text-muted-foreground mt-1">“{row.message}”</p>}
                <p className="font-mono text-[10px] text-muted-foreground mt-2">
                  {row.createdAt ? `Créée ${formatDistanceToNow(new Date(row.createdAt), { addSuffix: true, locale: fr })}` : ''}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {row.status === 'pending' && (
                  <Button size="sm" variant="outline" className="gap-2" onClick={() => updateAffiliation(row.id, { status: 'accepted', acceptedAt: new Date().toISOString() })}>
                    <CheckCircle2 className="w-3.5 h-3.5" /> Accepter
                  </Button>
                )}
                {row.status === 'accepted' && (
                  <Button size="sm" variant="outline" className="gap-2" onClick={() => updateAffiliation(row.id, { visibility: row.visibility === 'public' ? 'private' : 'public' })}>
                    {row.visibility === 'public' ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />} {row.visibility === 'public' ? 'Privée' : 'Publique'}
                  </Button>
                )}
                <Button size="sm" variant="outline" className="gap-2" onClick={() => updateAffiliation(row.id, { role: row.role === 'member' ? 'admin' : 'member' })}>
                  <ShieldCheck className="w-3.5 h-3.5" /> Rôle
                </Button>
                <Button size="sm" variant="destructive" className="gap-2" onClick={() => removeAffiliation(row.id)}>
                  <Trash2 className="w-3.5 h-3.5" /> Supprimer
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}