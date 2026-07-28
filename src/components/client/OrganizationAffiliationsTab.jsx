/**
 * OrganizationAffiliationsTab — Onglet de gestion des affiliations côté ORGANISATION.
 * Utilisé dans EspaceClientPage pour les comptes éligibles (official / supreme).
 *
 * Source de données : useOrganizationAffiliations({ organizationId }) via le store centralisé.
 * Toutes les mutations passent par processOrganizationAffiliation (backend).
 */

import React, { useEffect, useMemo, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, CheckCircle2, XCircle, Sparkles, ShieldCheck, Eye, EyeOff,
  Loader2, UserPlus, Trash2, Users, Clock, RefreshCw, AlertTriangle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { canManageAffiliations } from '@/lib/affiliationUtils';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { notifyAffiliationInvitation, notifyAffiliationStatus } from '@/lib/affiliationNotifications';
import { useOrganizationAffiliations, refreshAffiliations } from '@/hooks/useOrganizationAffiliations';
import RemovalRequestDialog from '@/components/affiliations/RemovalRequestDialog';

const ROLE_OPTIONS = ['member', 'moderator', 'admin'];
const STATUS_FILTERS = ['all', 'pending', 'accepted', 'rejected', 'removed'];
const VISIBILITY_FILTERS = ['all', 'public', 'private'];

const STATUS_STYLES = {
  accepted: 'border-emerald-400/30 text-emerald-400 bg-emerald-400/10',
  pending:  'border-amber-400/30 text-amber-400 bg-amber-400/10',
  rejected: 'border-red-400/30 text-red-400 bg-red-400/10',
  removed:  'border-border text-muted-foreground bg-muted/30',
};
const STATUS_LABELS = { accepted: 'Accepté', pending: 'En attente', rejected: 'Refusé', removed: 'Retiré' };
const ROLE_LABELS   = { member: 'Membre', moderator: 'Modérateur', admin: 'Admin' };

export default function OrganizationAffiliationsTab({ user }) {
  // ── Filtres ──────────────────────────────────────────────────────────────────
  const [search, setSearch]               = useState('');
  const [statusFilter, setStatusFilter]   = useState('all');
  const [visibilityFilter, setVisFilter]  = useState('all');

  // ── Invite ───────────────────────────────────────────────────────────────────
  const [inviteQuery, setInviteQuery]       = useState('');
  const [inviteCandidate, setCandidate]     = useState(null);
  const [inviteEmail, setInviteEmail]       = useState('');
  const [inviteRole, setInviteRole]         = useState('member');
  const [inviteMessage, setInviteMessage]   = useState('');
  const [autoAccept, setAutoAccept]         = useState(false);
  const [creating, setCreating]             = useState(false);
  const [publicUsers, setPublicUsers]       = useState([]);
  const [removalTarget, setRemovalTarget]   = useState(null);

  // ── Données affiliations ─────────────────────────────────────────────────────
  const descriptor = useMemo(
    () => (user?.id ? { organizationId: user.id } : null),
    [user?.id],
  );
  const { affiliations, loading, error } = useOrganizationAffiliations(descriptor);

  const canManage = canManageAffiliations(user);

  // ── Chargement liste utilisateurs publics (pour autocomplete invite) ──────────
  useEffect(() => {
    base44.functions.invoke('getPublicUsers', {})
      .then((r) => setPublicUsers(r?.data || r || []))
      .catch(() => {});
  }, []);

  // ── Stats ─────────────────────────────────────────────────────────────────────
  const stats = useMemo(() => ({
    total:    affiliations.length,
    accepted: affiliations.filter((r) => r.status === 'accepted').length,
    pending:  affiliations.filter((r) => r.status === 'pending').length,
  }), [affiliations]);

  // ── Filtrage ──────────────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return affiliations.filter((row) => {
      if (statusFilter !== 'all' && row.status !== statusFilter) return false;
      if (visibilityFilter !== 'all' && row.visibility !== visibilityFilter) return false;
      if (q) {
        const text = [row.organizationName, row.role, row.userId, row.message].filter(Boolean).join(' ').toLowerCase();
        if (!text.includes(q)) return false;
      }
      return true;
    });
  }, [affiliations, search, statusFilter, visibilityFilter]);

  // ── Suggestions autocomplete ──────────────────────────────────────────────────
  const suggestions = useMemo(() => {
    const q = inviteQuery.trim().toLowerCase();
    if (!q || inviteCandidate) return [];
    return publicUsers
      .filter((u) => [u.display_name, u.full_name, u.username, u.email]
        .filter(Boolean).some((f) => f.toLowerCase().includes(q)))
      .slice(0, 6);
  }, [publicUsers, inviteQuery, inviteCandidate]);

  // ── Mutations ─────────────────────────────────────────────────────────────────

  const handleInvite = async () => {
    if (!inviteCandidate && !inviteEmail.trim()) return;
    if (!user?.id) return;
    setCreating(true);
    try {
      const target = inviteCandidate
        || publicUsers.find((u) => u.email === inviteEmail || u.username === inviteEmail);

      const payload = {
        organizationId:     user.id,
        userId:             target ? target.id : inviteEmail.trim(),
        role:               inviteRole,
        status:             autoAccept ? 'accepted' : 'pending',
        visibility:         'public',
        createdAt:          new Date().toISOString(),
        invitedBy:          user.id,
        message:            inviteMessage,
        organizationName:   user.display_name || user.full_name || user.email,
        organizationAvatarUrl: user.avatar_url || '',
      };

      const res = await base44.functions.invoke('processOrganizationAffiliation', { action: 'create', affiliation: payload });
      const created = res?.data?.affiliation || res?.affiliation || res;
      const targetEmail = target?.email || inviteEmail.trim();

      await notifyAffiliationInvitation({
        targetEmail,
        organizationName: payload.organizationName,
        invitationId: created?.id,
      });

      await refreshAffiliations({ organizationId: user.id });
      setInviteEmail(''); setCandidate(null); setInviteQuery(''); setInviteMessage('');
      toast.success('Invitation envoyée avec succès');
    } catch (e) {
      toast.error(e?.message || 'Impossible d\'envoyer l\'invitation');
    } finally {
      setCreating(false);
    }
  };

  const handleUpdate = async (id, patch) => {
    try {
      const res = await base44.functions.invoke('processOrganizationAffiliation', {
        action: 'update', affiliationId: id, patch,
      });
      const updated = res?.data?.affiliation || res?.affiliation || res;

      if (patch.status === 'accepted') {
        await notifyAffiliationStatus({ targetEmail: updated?.userId, organizationName: updated?.organizationName, status: 'accepted' });
      } else if (patch.status === 'rejected') {
        await notifyAffiliationStatus({ targetEmail: updated?.userId, organizationName: updated?.organizationName, status: 'rejected' });
      } else if (patch.role) {
        await notifyAffiliationStatus({ targetEmail: updated?.userId, organizationName: updated?.organizationName, status: 'role_changed' });
      }

      await refreshAffiliations({ organizationId: user.id });
      toast.success('Affiliation mise à jour');
    } catch (e) {
      toast.error(e?.message || 'Mise à jour impossible');
    }
  };

  const handleRequestRemoval = async (reason) => {
    if (!removalTarget) return;
    try {
      await base44.functions.invoke('processOrganizationAffiliation', {
        action: 'requestRemoval',
        affiliationId: removalTarget.id,
        reason,
      });
      await refreshAffiliations({ organizationId: user.id });
      toast.success('Demande de suppression envoyée aux administrateurs');
      setRemovalTarget(null);
    } catch (e) {
      toast.error(e?.message || 'Impossible d\'envoyer la demande');
    }
  };

  const handleToggleRole = (row) => {
    const next = row.role === 'member' ? 'moderator' : row.role === 'moderator' ? 'admin' : 'member';
    handleUpdate(row.id, { role: next });
  };

  // ── Guard ─────────────────────────────────────────────────────────────────────

  if (!canManage) {
    return (
      <div className="rounded-2xl border border-border bg-card p-8 text-center space-y-2">
        <Users className="w-8 h-8 text-muted-foreground mx-auto" />
        <p className="font-grotesk font-semibold">Accès restreint</p>
        <p className="text-sm text-muted-foreground">
          Seuls les comptes Officiel ou Suprême peuvent gérer des affiliations.
        </p>
      </div>
    );
  }

  // ── Render ────────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-5">

      {/* ── Stats ── */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Total', value: stats.total, icon: Users, color: 'text-primary' },
          { label: 'Acceptés', value: stats.accepted, icon: CheckCircle2, color: 'text-emerald-400' },
          { label: 'En attente', value: stats.pending, icon: Clock, color: 'text-amber-400' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="rounded-xl border border-border bg-card p-3 flex items-center gap-3">
            <Icon className={`w-5 h-5 ${color} flex-shrink-0`} />
            <div>
              <p className="font-grotesk font-bold text-lg leading-none">{value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Formulaire d'invitation ── */}
      <div className="rounded-2xl border border-border bg-card p-4 md:p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-grotesk font-semibold text-base">Inviter un membre</p>
            <p className="text-xs text-muted-foreground mt-0.5">Recherchez un utilisateur par nom, @pseudo ou email.</p>
          </div>
          <UserPlus className="w-5 h-5 text-muted-foreground" />
        </div>

        <div className="relative">
          <Input
            placeholder="Nom, @pseudo ou email..."
            value={inviteCandidate
              ? (inviteCandidate.display_name || inviteCandidate.full_name || inviteCandidate.username || inviteCandidate.email)
              : inviteEmail}
            onChange={(e) => {
              setInviteEmail(e.target.value);
              setInviteQuery(e.target.value);
              setCandidate(null);
            }}
          />
          <AnimatePresence>
            {suggestions.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="absolute z-30 mt-1 w-full rounded-2xl border border-border bg-card shadow-2xl overflow-hidden"
              >
                {suggestions.map((u) => (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => { setCandidate(u); setInviteEmail(u.email); setInviteQuery(''); }}
                    className="w-full px-4 py-2.5 text-left hover:bg-primary/5 transition-colors flex items-center gap-3 border-b border-border last:border-b-0"
                  >
                    <div className="w-8 h-8 rounded-full bg-primary/10 overflow-hidden flex items-center justify-center text-xs font-bold text-primary flex-shrink-0">
                      {u.avatar_url
                        ? <img src={u.avatar_url} alt="" className="h-full w-full object-cover" />
                        : <span>{(u.display_name || u.full_name || u.username || 'U')[0].toUpperCase()}</span>}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{u.display_name || u.full_name || u.username}</p>
                      <p className="text-[11px] text-muted-foreground truncate">{u.username ? `@${u.username}` : u.email}</p>
                    </div>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-[1fr_1fr_auto]">
          <select
            value={inviteRole}
            onChange={(e) => setInviteRole(e.target.value)}
            className="h-10 rounded-lg border border-border bg-background px-3 text-sm col-span-1"
          >
            {ROLE_OPTIONS.map((r) => <option key={r} value={r}>{ROLE_LABELS[r] || r}</option>)}
          </select>
          <label className="flex items-center gap-2 text-sm text-muted-foreground col-span-1">
            <input type="checkbox" checked={autoAccept} onChange={(e) => setAutoAccept(e.target.checked)} className="rounded" />
            Accepter directement
          </label>
          <Button
            onClick={handleInvite}
            disabled={creating || (!inviteCandidate && !inviteEmail.trim())}
            className="gap-2 col-span-2 sm:col-span-1"
          >
            {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
            Inviter
          </Button>
        </div>

        <Input
          placeholder="Message d'invitation (optionnel)"
          value={inviteMessage}
          onChange={(e) => setInviteMessage(e.target.value)}
        />
      </div>

      {/* ── Liste des affiliations ── */}
      <div className="rounded-2xl border border-border bg-card p-4 md:p-6 space-y-4">
        {/* Barre de filtres */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Rechercher…" className="pl-9" />
          </div>
          <div className="flex gap-2 flex-wrap">
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="h-9 rounded-lg border border-border bg-background px-2.5 text-xs">
              {STATUS_FILTERS.map((v) => <option key={v} value={v}>{v === 'all' ? 'Tous statuts' : STATUS_LABELS[v] || v}</option>)}
            </select>
            <select value={visibilityFilter} onChange={(e) => setVisFilter(e.target.value)} className="h-9 rounded-lg border border-border bg-background px-2.5 text-xs">
              {VISIBILITY_FILTERS.map((v) => <option key={v} value={v}>{v === 'all' ? 'Toutes visibilités' : v === 'public' ? 'Publique' : 'Privée'}</option>)}
            </select>
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 h-9"
              onClick={() => refreshAffiliations({ organizationId: user.id })}
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>

        {/* États */}
        {loading && affiliations.length === 0 && (
          <div className="flex items-center gap-3 py-8 justify-center text-sm text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin" /> Chargement…
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            {affiliations.length === 0 ? 'Aucune affiliation. Invitez votre premier membre !' : 'Aucun résultat pour cette recherche.'}
          </div>
        )}

        {error && affiliations.length === 0 && (
          <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive text-center">
            Erreur de chargement. Cliquez sur ↻ pour réessayer.
          </div>
        )}

        {/* Cartes */}
        <div className="space-y-2">
          <AnimatePresence initial={false}>
            {filtered.map((row) => (
              <motion.div
                key={row.id}
                layout
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.97 }}
                className="rounded-xl border border-border bg-background/60 p-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between"
              >
                {/* Infos */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className={`text-[10px] uppercase tracking-wider rounded-full border px-2 py-0.5 font-mono ${STATUS_STYLES[row.status] || ''}`}>
                      {STATUS_LABELS[row.status] || row.status}
                    </span>
                    <span className="text-[10px] uppercase tracking-wider rounded-full border border-border px-2 py-0.5 text-muted-foreground font-mono">
                      {ROLE_LABELS[row.role] || row.role}
                    </span>
                    <span className={`text-[10px] uppercase tracking-wider rounded-full border px-2 py-0.5 font-mono ${row.visibility === 'public' ? 'border-primary/30 text-primary bg-primary/10' : 'border-border text-muted-foreground'}`}>
                      {row.visibility === 'public' ? 'Publique' : 'Privée'}
                    </span>
                    {row.removalRequestStatus === 'pending' && (
                      <span className="text-[10px] uppercase tracking-wider rounded-full border border-amber-400/30 text-amber-400 bg-amber-400/10 px-2 py-0.5 font-mono">
                        Suppression demandée
                      </span>
                    )}
                    {row.removalRequestStatus === 'rejected' && (
                      <span className="text-[10px] uppercase tracking-wider rounded-full border border-red-400/30 text-red-400 bg-red-400/10 px-2 py-0.5 font-mono">
                        Demande refusée
                      </span>
                    )}
                    {row.removalRequestStatus === 'approved' && (
                      <span className="text-[10px] uppercase tracking-wider rounded-full border border-zinc-400/30 text-zinc-400 bg-zinc-400/10 px-2 py-0.5 font-mono">
                        Suppression approuvée
                      </span>
                    )}
                  </div>
                  <p className="font-inter text-sm font-medium text-foreground truncate">{row.userId}</p>
                  {row.message && (
                    <p className="font-inter text-xs text-muted-foreground mt-0.5 italic">"{row.message}"</p>
                  )}
                  <p className="font-mono text-[10px] text-muted-foreground mt-1">
                    {row.createdAt ? formatDistanceToNow(new Date(row.createdAt), { addSuffix: true, locale: fr }) : ''}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-2 shrink-0">
                  {row.status === 'pending' && (
                    <>
                      <Button size="sm" variant="outline" className="gap-1.5 text-emerald-400 border-emerald-400/30 hover:bg-emerald-400/10"
                        onClick={() => handleUpdate(row.id, { status: 'accepted', acceptedAt: new Date().toISOString() })}>
                        <CheckCircle2 className="w-3.5 h-3.5" /> Accepter
                      </Button>
                      <Button size="sm" variant="outline" className="gap-1.5 text-red-400 border-red-400/30 hover:bg-red-400/10"
                        onClick={() => handleUpdate(row.id, { status: 'rejected' })}>
                        <XCircle className="w-3.5 h-3.5" /> Refuser
                      </Button>
                    </>
                  )}
                  {row.status === 'accepted' && (
                    <Button size="sm" variant="outline" className="gap-1.5"
                      onClick={() => handleUpdate(row.id, { visibility: row.visibility === 'public' ? 'private' : 'public' })}>
                      {row.visibility === 'public' ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      {row.visibility === 'public' ? 'Rendre privée' : 'Rendre publique'}
                    </Button>
                  )}
                  {row.status !== 'removed' && (
                    <Button size="sm" variant="outline" className="gap-1.5"
                      onClick={() => handleToggleRole(row)}>
                      <ShieldCheck className="w-3.5 h-3.5" />
                      {ROLE_LABELS[row.role === 'member' ? 'moderator' : row.role === 'moderator' ? 'admin' : 'member'] || 'Changer rôle'}
                    </Button>
                  )}
                  <Button size="sm" variant="outline" className="gap-1.5 text-amber-400 border-amber-400/30 hover:bg-amber-400/10"
                    onClick={() => setRemovalTarget(row)}>
                    <AlertTriangle className="w-3.5 h-3.5" /> Demander suppression
                  </Button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      <RemovalRequestDialog
        open={!!removalTarget}
        onOpenChange={(o) => { if (!o) setRemovalTarget(null); }}
        target={removalTarget}
        onSubmit={handleRequestRemoval}
      />
    </div>
  );
}