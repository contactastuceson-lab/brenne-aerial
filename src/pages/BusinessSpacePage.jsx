import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2, Users, UserPlus, Search, CheckCircle2, XCircle,
  Eye, EyeOff, Trash2, ShieldCheck, Clock, Loader2, RefreshCw,
  Settings, Crown, BadgeCheck, BarChart3, UserCheck, LogIn,
  ChevronRight, Globe, Lock, Sparkles, Edit3, Save, X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { canManageAffiliations, getOrganizationBadge } from '@/lib/affiliationUtils';
import { useOrganizationAffiliations, refreshAffiliations } from '@/hooks/useOrganizationAffiliations';
import { notifyAffiliationInvitation, notifyAffiliationStatus } from '@/lib/affiliationNotifications';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

/* ── helpers ── */
const STATUS_STYLES = {
  accepted: { dot: 'bg-emerald-400', text: 'text-emerald-400', bg: 'bg-emerald-400/10', border: 'border-emerald-400/20', label: 'Actif' },
  pending:  { dot: 'bg-amber-400',   text: 'text-amber-400',   bg: 'bg-amber-400/10',   border: 'border-amber-400/20',   label: 'En attente' },
  rejected: { dot: 'bg-red-400',     text: 'text-red-400',     bg: 'bg-red-400/10',     border: 'border-red-400/20',     label: 'Refusé' },
  removed:  { dot: 'bg-zinc-500',    text: 'text-zinc-500',    bg: 'bg-zinc-500/10',    border: 'border-zinc-500/20',    label: 'Retiré' },
};
const ROLE_OPTIONS = ['member', 'moderator', 'admin'];
const ROLE_LABELS  = { member: 'Membre', moderator: 'Modérateur', admin: 'Admin' };
const ROLE_COLORS  = { member: 'text-zinc-400', moderator: 'text-blue-400', admin: 'text-purple-400' };

/* ── Stat card ── */
function StatCard({ icon: Icon, label, value, color, bg }) {
  return (
    <div className={`flex items-center gap-4 p-5 rounded-2xl border border-zinc-800 ${bg} backdrop-blur`}>
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${bg} border border-zinc-700`}>
        <Icon className={`w-5 h-5 ${color}`} />
      </div>
      <div>
        <p className={`font-grotesk font-black text-2xl leading-none ${color}`}>{value}</p>
        <p className="text-xs text-zinc-500 mt-0.5 font-inter">{label}</p>
      </div>
    </div>
  );
}

/* ── Member row ── */
function MemberRow({ row, onUpdate, onRemove }) {
  const s = STATUS_STYLES[row.status] || STATUS_STYLES.removed;
  const [busy, setBusy] = useState(false);

  const act = async (fn) => { setBusy(true); try { await fn(); } finally { setBusy(false); } };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      className="flex flex-col sm:flex-row sm:items-center gap-3 px-5 py-4 border-b border-zinc-800 last:border-b-0 hover:bg-zinc-900/60 transition-colors"
    >
      {/* Avatar placeholder */}
      <div className="w-9 h-9 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center flex-shrink-0 text-sm font-bold text-zinc-400">
        {(row.userId || '?')[0].toUpperCase()}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-inter text-sm font-medium text-zinc-200 truncate">{row.userId}</span>
          <span className={`inline-flex items-center gap-1.5 text-[10px] font-mono px-2 py-0.5 rounded-full border ${s.bg} ${s.border} ${s.text}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
            {s.label}
          </span>
          <span className={`text-[10px] font-mono ${ROLE_COLORS[row.role] || 'text-zinc-500'}`}>
            {ROLE_LABELS[row.role] || row.role}
          </span>
        </div>
        <p className="font-mono text-[10px] text-zinc-600 mt-0.5">
          {row.createdAt ? formatDistanceToNow(new Date(row.createdAt), { addSuffix: true, locale: fr }) : '—'}
          {row.visibility === 'private' && <span className="ml-2 text-zinc-600">· Badge masqué</span>}
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1.5 flex-shrink-0" onClick={e => e.stopPropagation()}>
        {busy ? (
          <Loader2 className="w-4 h-4 animate-spin text-zinc-500" />
        ) : (
          <>
            {row.status === 'pending' && (
              <>
                <button
                  onClick={() => act(() => onUpdate(row.id, { status: 'accepted', acceptedAt: new Date().toISOString() }))}
                  className="p-1.5 rounded-lg bg-emerald-400/10 hover:bg-emerald-400/20 text-emerald-400 transition-colors"
                  title="Accepter"
                >
                  <CheckCircle2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => act(() => onUpdate(row.id, { status: 'rejected' }))}
                  className="p-1.5 rounded-lg bg-red-400/10 hover:bg-red-400/20 text-red-400 transition-colors"
                  title="Refuser"
                >
                  <XCircle className="w-4 h-4" />
                </button>
              </>
            )}
            {row.status === 'accepted' && (
              <button
                onClick={() => act(() => onUpdate(row.id, { visibility: row.visibility === 'public' ? 'private' : 'public' }))}
                className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 transition-colors"
                title={row.visibility === 'public' ? 'Masquer le badge' : 'Afficher le badge'}
              >
                {row.visibility === 'public' ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              </button>
            )}
            {row.status !== 'removed' && (
              <button
                onClick={() => {
                  const roles = ['member', 'moderator', 'admin'];
                  const next = roles[(roles.indexOf(row.role) + 1) % roles.length];
                  act(() => onUpdate(row.id, { role: next }));
                }}
                className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 transition-colors"
                title="Changer le rôle"
              >
                <ShieldCheck className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={() => act(() => onRemove(row.id))}
              className="p-1.5 rounded-lg bg-zinc-800 hover:bg-red-400/10 text-zinc-600 hover:text-red-400 transition-colors"
              title="Retirer"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </>
        )}
      </div>
    </motion.div>
  );
}

/* ── Org Settings panel ── */
function OrgSettingsPanel({ user, onSaved }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    display_name: user.display_name || user.full_name || '',
    bio: user.bio || '',
    location: user.location || '',
    website: user.website || '',
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await base44.auth.updateMe(form);
      toast.success('Profil organisation mis à jour');
      setEditing(false);
      onSaved?.();
    } catch (e) {
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
        <div className="flex items-center gap-3">
          <Settings className="w-4 h-4 text-zinc-400" />
          <h3 className="font-grotesk font-semibold text-sm text-zinc-200">Paramètres de l'organisation</h3>
        </div>
        {!editing ? (
          <button
            onClick={() => setEditing(true)}
            className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            <Edit3 className="w-3.5 h-3.5" /> Modifier
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <button onClick={() => setEditing(false)} className="p-1 text-zinc-500 hover:text-zinc-300"><X className="w-4 h-4" /></button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-1.5 text-xs bg-primary text-primary-foreground px-3 py-1.5 rounded-lg hover:bg-primary/90 transition-colors"
            >
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              Sauvegarder
            </button>
          </div>
        )}
      </div>

      <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[
          { key: 'display_name', label: 'Nom affiché', icon: Building2 },
          { key: 'location',     label: 'Localisation',  icon: Globe },
          { key: 'website',      label: 'Site web',       icon: Globe },
        ].map(({ key, label, icon: Icon }) => (
          <div key={key}>
            <label className="block text-[10px] font-mono uppercase tracking-widest text-zinc-500 mb-1.5">{label}</label>
            {editing ? (
              <Input
                value={form[key]}
                onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                className="bg-zinc-800/60 border-zinc-700 text-zinc-200 text-sm h-9"
                placeholder={label}
              />
            ) : (
              <p className="text-sm text-zinc-300 font-inter">{form[key] || <span className="text-zinc-600">Non renseigné</span>}</p>
            )}
          </div>
        ))}

        <div className="sm:col-span-2">
          <label className="block text-[10px] font-mono uppercase tracking-widest text-zinc-500 mb-1.5">Bio / Description</label>
          {editing ? (
            <textarea
              value={form.bio}
              onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
              rows={3}
              className="w-full bg-zinc-800/60 border border-zinc-700 rounded-lg text-zinc-200 text-sm p-3 resize-none focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder="Description de votre organisation…"
            />
          ) : (
            <p className="text-sm text-zinc-300 font-inter">{form.bio || <span className="text-zinc-600">Non renseigné</span>}</p>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Invite panel ── */
function InvitePanel({ user, onDone }) {
  const [query, setQuery]           = useState('');
  const [candidate, setCandidate]   = useState(null);
  const [email, setEmail]           = useState('');
  const [role, setRole]             = useState('member');
  const [message, setMessage]       = useState('');
  const [autoAccept, setAutoAccept] = useState(false);
  const [creating, setCreating]     = useState(false);
  const [publicUsers, setPublicUsers] = useState([]);

  useEffect(() => {
    base44.functions.invoke('getPublicUsers', {}).then(r => setPublicUsers(r?.data || [])).catch(() => {});
  }, []);

  const suggestions = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q || candidate) return [];
    return publicUsers.filter(u =>
      [u.display_name, u.full_name, u.username, u.email].filter(Boolean).some(f => f.toLowerCase().includes(q))
    ).slice(0, 5);
  }, [publicUsers, query, candidate]);

  const handleInvite = async () => {
    if (!candidate && !email.trim()) return;
    setCreating(true);
    try {
      const target = candidate || publicUsers.find(u => u.email === email || u.username === email);
      const payload = {
        organizationId: user.id,
        userId: target ? target.id : email.trim(),
        role,
        status: autoAccept ? 'accepted' : 'pending',
        visibility: 'public',
        createdAt: new Date().toISOString(),
        invitedBy: user.id,
        message,
        organizationName: user.display_name || user.full_name || user.email,
        organizationAvatarUrl: user.avatar_url || '',
      };
      const res = await base44.functions.invoke('processOrganizationAffiliation', { action: 'create', affiliation: payload });
      const created = res?.data?.affiliation || res?.affiliation || res;
      await notifyAffiliationInvitation({ targetEmail: target?.email || email.trim(), organizationName: payload.organizationName, invitationId: created?.id });
      await refreshAffiliations({ organizationId: user.id });
      setEmail(''); setCandidate(null); setQuery(''); setMessage('');
      toast.success('Invitation envoyée');
      onDone?.();
    } catch (e) {
      toast.error(e?.message || 'Erreur lors de l\'invitation');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 overflow-hidden">
      <div className="flex items-center gap-3 px-6 py-4 border-b border-zinc-800">
        <UserPlus className="w-4 h-4 text-zinc-400" />
        <h3 className="font-grotesk font-semibold text-sm text-zinc-200">Inviter un membre</h3>
      </div>
      <div className="p-6 space-y-3">
        <div className="relative">
          <Input
            placeholder="Nom, @pseudo ou email…"
            value={candidate ? (candidate.display_name || candidate.full_name || candidate.username || candidate.email) : email}
            onChange={e => { setEmail(e.target.value); setQuery(e.target.value); setCandidate(null); }}
            className="bg-zinc-800/60 border-zinc-700 text-zinc-200 text-sm"
          />
          <AnimatePresence>
            {suggestions.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="absolute z-30 mt-1 w-full rounded-xl border border-zinc-700 bg-zinc-900 shadow-2xl overflow-hidden"
              >
                {suggestions.map(u => (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => { setCandidate(u); setEmail(u.email); setQuery(''); }}
                    className="w-full px-4 py-2.5 text-left hover:bg-zinc-800 transition-colors flex items-center gap-3 border-b border-zinc-800 last:border-b-0"
                  >
                    <div className="w-7 h-7 rounded-full bg-zinc-700 flex items-center justify-center text-xs font-bold text-zinc-300 flex-shrink-0">
                      {u.avatar_url
                        ? <img src={u.avatar_url} alt="" className="w-full h-full object-cover rounded-full" />
                        : (u.display_name || u.full_name || 'U')[0].toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-zinc-200 truncate">{u.display_name || u.full_name || u.username}</p>
                      <p className="text-[11px] text-zinc-500 truncate">{u.username ? `@${u.username}` : u.email}</p>
                    </div>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex gap-2 flex-wrap">
          <select
            value={role}
            onChange={e => setRole(e.target.value)}
            className="h-9 rounded-lg border border-zinc-700 bg-zinc-800/60 px-3 text-sm text-zinc-200 flex-1 min-w-[120px]"
          >
            {ROLE_OPTIONS.map(r => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
          </select>
          <label className="flex items-center gap-2 text-sm text-zinc-400 flex-shrink-0">
            <input type="checkbox" checked={autoAccept} onChange={e => setAutoAccept(e.target.checked)} className="rounded" />
            Accepter direct
          </label>
        </div>

        <Input
          placeholder="Message d'invitation (optionnel)"
          value={message}
          onChange={e => setMessage(e.target.value)}
          className="bg-zinc-800/60 border-zinc-700 text-zinc-200 text-sm"
        />

        <Button
          onClick={handleInvite}
          disabled={creating || (!candidate && !email.trim())}
          className="w-full bg-primary text-primary-foreground gap-2"
        >
          {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
          Envoyer l'invitation
        </Button>
      </div>
    </div>
  );
}

/* ── Main page ── */
export default function BusinessSpacePage() {
  const [user, setUser]           = useState(null);
  const [authChecked, setChecked] = useState(false);
  const [search, setSearch]       = useState('');
  const [statusFilter, setStatus] = useState('all');
  const [activeView, setView]     = useState('members'); // members | invite | settings

  useEffect(() => {
    base44.auth.isAuthenticated().then(async authed => {
      if (authed) setUser(await base44.auth.me());
      setChecked(true);
    });
  }, []);

  const descriptor = useMemo(() => user?.id ? { organizationId: user.id } : null, [user?.id]);
  const { affiliations, loading } = useOrganizationAffiliations(descriptor);

  const badge = getOrganizationBadge(user || {});
  const isSupreme = badge === 'supreme';

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return affiliations.filter(r => {
      if (statusFilter !== 'all' && r.status !== statusFilter) return false;
      if (q) return [r.userId, r.role].filter(Boolean).join(' ').toLowerCase().includes(q);
      return true;
    });
  }, [affiliations, search, statusFilter]);

  const stats = useMemo(() => ({
    total:    affiliations.length,
    accepted: affiliations.filter(r => r.status === 'accepted').length,
    pending:  affiliations.filter(r => r.status === 'pending').length,
    public:   affiliations.filter(r => r.status === 'accepted' && r.visibility === 'public').length,
  }), [affiliations]);

  const handleUpdate = async (id, patch) => {
    const row = affiliations.find(r => r.id === id);
    await base44.functions.invoke('processOrganizationAffiliation', { action: 'update', affiliationId: id, patch });
    if (patch.status === 'accepted') await notifyAffiliationStatus({ targetEmail: row?.userId, organizationName: row?.organizationName, status: 'accepted' });
    if (patch.status === 'rejected') await notifyAffiliationStatus({ targetEmail: row?.userId, organizationName: row?.organizationName, status: 'rejected' });
    await refreshAffiliations({ organizationId: user.id });
    toast.success('Mis à jour');
  };

  const handleRemove = async (id) => {
    const row = affiliations.find(r => r.id === id);
    await base44.functions.invoke('processOrganizationAffiliation', { action: 'delete', affiliationId: id });
    if (row) await notifyAffiliationStatus({ targetEmail: row.userId, organizationName: row.organizationName, status: 'removed' });
    await refreshAffiliations({ organizationId: user.id });
    toast.success('Membre retiré');
  };

  /* Guards */
  if (!authChecked) return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
      <Loader2 className="w-6 h-6 animate-spin text-zinc-600" />
    </div>
  );

  if (!user) return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-5">
      <div className="text-center space-y-6 max-w-sm">
        <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto">
          <Building2 className="w-8 h-8 text-zinc-600" />
        </div>
        <div>
          <h2 className="font-grotesk font-bold text-xl text-zinc-200">Espace Business</h2>
          <p className="text-sm text-zinc-500 mt-2">Connectez-vous pour accéder à votre espace organisation.</p>
        </div>
        <Button onClick={() => base44.auth.redirectToLogin('/business')} className="w-full gap-2">
          <LogIn className="w-4 h-4" /> Se connecter
        </Button>
      </div>
    </div>
  );

  if (!canManageAffiliations(user)) return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-5">
      <div className="text-center space-y-6 max-w-sm">
        <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto">
          <Lock className="w-8 h-8 text-zinc-600" />
        </div>
        <div>
          <h2 className="font-grotesk font-bold text-xl text-zinc-200">Accès restreint</h2>
          <p className="text-sm text-zinc-500 mt-2">L'Espace Business est réservé aux comptes <span className="text-purple-400">Officiel</span> et <span className="text-amber-400">Suprême</span>.</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      {/* ── Top bar ── */}
      <div className="border-b border-zinc-800/80 bg-zinc-950/95 backdrop-blur sticky top-16 z-30">
        <div className="max-w-5xl mx-auto px-5 lg:px-8 py-4 flex items-center justify-between gap-4">
          {/* Identity */}
          <div className="flex items-center gap-3 min-w-0">
            <div
              className="w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center flex-shrink-0 border border-zinc-700"
              style={isSupreme
                ? { background: 'linear-gradient(135deg,#92400e,#d97706)', boxShadow: '0 0 16px rgba(245,158,11,0.3)' }
                : { background: 'linear-gradient(135deg,#581c87,#a855f7)' }
              }
            >
              {user.avatar_url
                ? <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
                : (isSupreme ? <Crown className="w-5 h-5 text-yellow-200" /> : <BadgeCheck className="w-5 h-5 text-purple-200" />)
              }
            </div>
            <div className="min-w-0">
              <p className="font-grotesk font-bold text-sm text-zinc-100 truncate">{user.display_name || user.full_name}</p>
              <div className="flex items-center gap-1.5">
                <span
                  className="text-[10px] font-mono px-2 py-0.5 rounded-full"
                  style={isSupreme
                    ? { background: 'rgba(245,158,11,0.15)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.3)' }
                    : { background: 'rgba(168,85,247,0.15)', color: '#a855f7', border: '1px solid rgba(168,85,247,0.3)' }
                  }
                >
                  {isSupreme ? '👑 Suprême' : '✦ Officiel'}
                </span>
                <span className="text-[10px] text-zinc-600 font-mono">Espace Business</span>
              </div>
            </div>
          </div>

          {/* Nav */}
          <div className="flex items-center gap-1 bg-zinc-900 rounded-xl p-1 border border-zinc-800">
            {[
              { id: 'members',  icon: Users,    label: 'Membres' },
              { id: 'invite',   icon: UserPlus, label: 'Inviter' },
              { id: 'settings', icon: Settings, label: 'Org.' },
            ].map(({ id, icon: Icon, label }) => (
              <button
                key={id}
                onClick={() => setView(id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-inter transition-all ${
                  activeView === id
                    ? 'bg-zinc-800 text-zinc-100'
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-5 lg:px-8 py-8 space-y-6">

        {/* ── Stats ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard icon={Users}      label="Total membres"  value={stats.total}    color="text-zinc-300"    bg="bg-zinc-900/60" />
          <StatCard icon={CheckCircle2} label="Actifs"        value={stats.accepted} color="text-emerald-400" bg="bg-emerald-400/5" />
          <StatCard icon={Clock}      label="En attente"    value={stats.pending}  color="text-amber-400"   bg="bg-amber-400/5" />
          <StatCard icon={Globe}      label="Badge public"  value={stats.public}   color="text-blue-400"    bg="bg-blue-400/5" />
        </div>

        {/* ── Content views ── */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeView}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
          >

            {/* MEMBERS */}
            {activeView === 'members' && (
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 overflow-hidden">
                {/* Toolbar */}
                <div className="flex flex-col sm:flex-row gap-3 p-4 border-b border-zinc-800">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
                    <Input
                      value={search}
                      onChange={e => setSearch(e.target.value)}
                      placeholder="Rechercher un membre…"
                      className="pl-9 bg-zinc-800/60 border-zinc-700 text-zinc-200 text-sm h-9"
                    />
                  </div>
                  <div className="flex gap-2">
                    <select
                      value={statusFilter}
                      onChange={e => setStatus(e.target.value)}
                      className="h-9 rounded-lg border border-zinc-700 bg-zinc-800/60 px-2.5 text-xs text-zinc-300"
                    >
                      <option value="all">Tous</option>
                      <option value="accepted">Actifs</option>
                      <option value="pending">En attente</option>
                      <option value="rejected">Refusés</option>
                    </select>
                    <button
                      onClick={() => refreshAffiliations({ organizationId: user.id })}
                      className="h-9 w-9 flex items-center justify-center rounded-lg border border-zinc-700 bg-zinc-800/60 text-zinc-400 hover:text-zinc-200 transition-colors"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* List */}
                {loading && affiliations.length === 0 ? (
                  <div className="flex items-center justify-center gap-3 py-16 text-zinc-600">
                    <Loader2 className="w-5 h-5 animate-spin" /> Chargement…
                  </div>
                ) : filtered.length === 0 ? (
                  <div className="py-16 text-center">
                    <Users className="w-8 h-8 text-zinc-700 mx-auto mb-3" />
                    <p className="text-sm text-zinc-600">
                      {affiliations.length === 0 ? 'Aucun membre pour l\'instant.' : 'Aucun résultat.'}
                    </p>
                    {affiliations.length === 0 && (
                      <button
                        onClick={() => setView('invite')}
                        className="mt-4 flex items-center gap-1.5 text-xs text-primary mx-auto hover:underline"
                      >
                        Inviter le premier membre <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ) : (
                  <div>
                    <AnimatePresence initial={false}>
                      {filtered.map(row => (
                        <MemberRow key={row.id} row={row} onUpdate={handleUpdate} onRemove={handleRemove} />
                      ))}
                    </AnimatePresence>
                  </div>
                )}
              </div>
            )}

            {/* INVITE */}
            {activeView === 'invite' && (
              <InvitePanel user={user} onDone={() => setView('members')} />
            )}

            {/* SETTINGS */}
            {activeView === 'settings' && (
              <OrgSettingsPanel user={user} onSaved={() => setUser({ ...user })} />
            )}

          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}