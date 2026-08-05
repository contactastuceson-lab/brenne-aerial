import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import {
  Flag, Eye, Check, X, Search, AlertCircle, TrendingUp, Shield,
  Trash2, Sparkles, ExternalLink, MessageSquare, FileText, Users,
  Radio, Calendar, Star, User, Hash, Loader2, ChevronDown,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { format, differenceInDays } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Link } from 'react-router-dom';

const STATUS_META = {
  pending: { label: 'En attente', icon: AlertCircle, cls: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20' },
  reviewed: { label: 'En examen', icon: TrendingUp, cls: 'text-blue-400 bg-blue-400/10 border-blue-400/20' },
  resolved: { label: 'Résolu', icon: Check, cls: 'text-green-400 bg-green-400/10 border-green-400/20' },
  dismissed: { label: 'Rejeté', icon: X, cls: 'text-red-400 bg-red-400/10 border-red-400/20' },
};

const REASON_LABELS = {
  spam: { label: 'Spam', icon: '🚫' },
  harcelement: { label: 'Harcèlement', icon: '⚠️' },
  contenu_inapproprie: { label: 'Contenu inapproprié', icon: '🔞' },
  usurpation: { label: "Usurpation d'identité", icon: '🎭' },
  discours_haineux: { label: 'Discours haineux', icon: '💬' },
  violence: { label: 'Violence / menace', icon: '⚔️' },
  mise_en_danger: { label: 'Mise en danger', icon: '🚨' },
  illegal: { label: 'Contenu illégal', icon: '⚖️' },
  autre: { label: 'Autre', icon: '❓' },
};

const TARGET_TYPE_META = {
  user: { label: 'Utilisateur', icon: User, color: 'text-purple-400', bg: 'bg-purple-400/10', border: 'border-purple-400/20' },
  message: { label: 'Message privé', icon: MessageSquare, color: 'text-blue-400', bg: 'bg-blue-400/10', border: 'border-blue-400/20' },
  post: { label: 'Publication', icon: FileText, color: 'text-primary', bg: 'bg-primary/10', border: 'border-primary/20' },
  discussion: { label: 'Discussion', icon: MessageSquare, color: 'text-cyan-400', bg: 'bg-cyan-400/10', border: 'border-cyan-400/20' },
  discussion_reply: { label: 'Réponse discussion', icon: MessageSquare, color: 'text-cyan-400', bg: 'bg-cyan-400/10', border: 'border-cyan-400/20' },
  forum_topic: { label: 'Sujet forum', icon: Hash, color: 'text-orange-400', bg: 'bg-orange-400/10', border: 'border-orange-400/20' },
  forum_post: { label: 'Message forum', icon: Hash, color: 'text-orange-400', bg: 'bg-orange-400/10', border: 'border-orange-400/20' },
  community: { label: 'Communauté', icon: Users, color: 'text-green-400', bg: 'bg-green-400/10', border: 'border-green-400/20' },
  space: { label: 'Space audio', icon: Radio, color: 'text-pink-400', bg: 'bg-pink-400/10', border: 'border-pink-400/20' },
  story: { label: 'Story', icon: Star, color: 'text-amber-400', bg: 'bg-amber-400/10', border: 'border-amber-400/20' },
  event: { label: 'Événement', icon: Calendar, color: 'text-indigo-400', bg: 'bg-indigo-400/10', border: 'border-indigo-400/20' },
  review: { label: 'Avis', icon: Star, color: 'text-yellow-400', bg: 'bg-yellow-400/10', border: 'border-yellow-400/20' },
};

function timeAgo(iso) {
  if (!iso) return '';
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "à l'instant";
  if (mins < 60) return `il y a ${mins} min`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `il y a ${hrs}h`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `il y a ${days}j`;
  return format(new Date(iso), 'd MMM', { locale: fr });
}

export default function AdminReports() {
  const qc = useQueryClient();
  const [selected, setSelected] = useState(null);
  const [filterStatus, setFilterStatus] = useState('pending');
  const [filterType, setFilterType] = useState('all');
  const [filterReason, setFilterReason] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [drafting, setDrafting] = useState(false);

  const { data: reports = [], isLoading } = useQuery({
    queryKey: ['admin-reports'],
    queryFn: () => base44.entities.Report.list('-created_date', 200),
  });

  const logAction = async (action, entityId, changes) => {
    try {
      await base44.functions.invoke('logAuditAction', { action, entity_type: 'Report', entity_id: entityId, changes });
    } catch {}
  };

  const updateReport = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Report.update(id, data),
    onSuccess: (_, { id, data }) => {
      qc.invalidateQueries({ queryKey: ['admin-reports'] });
      logAction('update', id, data);
      if (data.status && selected) {
        base44.functions.invoke('sendReportStatusUpdate', {
          reportId: id,
          reporterEmail: selected.reporter_email,
          reporterName: selected.reporter_name,
          targetName: selected.target_name || selected.target_email,
          targetType: selected.target_type,
          reason: selected.reason,
          newStatus: data.status,
          adminNotes: data.admin_notes || '',
        }).catch(() => {});
      }
      setSelected(null);
      toast.success('✓ Signalement mis à jour');
    },
    onError: () => toast.error('Erreur lors de la mise à jour'),
  });

  const deleteReport = useMutation({
    mutationFn: (id) => base44.entities.Report.delete(id),
    onSuccess: (_, id) => {
      qc.invalidateQueries({ queryKey: ['admin-reports'] });
      logAction('delete', id, {});
      setSelected(null);
      toast.success('✓ Signalement supprimé');
    },
  });

  const draftReply = async () => {
    if (!selected) return;
    setDrafting(true);
    try {
      const ctx = `Raison: ${selected.reason}\nCible: ${selected.target_name || selected.target_email}\nType: ${TARGET_TYPE_META[selected.target_type]?.label || selected.target_type}\nDétails: ${selected.details || ''}\nContenu signalé: ${selected.message_content || selected.target_content_preview || ''}`;
      const res = await base44.functions.invoke('nexusDraftReply', {
        context: ctx,
        recipient: selected.reporter_name || selected.reporter_email || "l'utilisateur",
        tone: 'professionnel, rassurant et ferme si besoin',
      });
      const draft = res?.data?.draft ?? res?.draft ?? '';
      if (draft) {
        setAdminNotes((prev) => (prev ? prev + '\n\n' : '') + draft);
        toast.success('✓ Réponse générée par Nexus');
      } else {
        toast.error("Nexus n'a pas pu générer de réponse");
      }
    } catch {
      toast.error('Erreur lors de la génération');
    } finally {
      setDrafting(false);
    }
  };

  const filtered = useMemo(() => {
    let result = reports;
    if (filterStatus !== 'all') result = result.filter(r => r.status === filterStatus);
    if (filterType !== 'all') result = result.filter(r => r.target_type === filterType);
    if (filterReason !== 'all') result = result.filter(r => r.reason === filterReason);
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(r =>
        r.target_name?.toLowerCase().includes(q) ||
        r.target_email?.toLowerCase().includes(q) ||
        r.reporter_name?.toLowerCase().includes(q) ||
        r.target_content_preview?.toLowerCase().includes(q) ||
        r.message_content?.toLowerCase().includes(q)
      );
    }
    return result;
  }, [reports, filterStatus, filterType, filterReason, searchQuery]);

  const stats = {
    total: reports.length,
    pending: reports.filter(r => r.status === 'pending').length,
    reviewed: reports.filter(r => r.status === 'reviewed').length,
    resolved: reports.filter(r => r.status === 'resolved').length,
    dismissed: reports.filter(r => r.status === 'dismissed').length,
  };

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)] md:h-[calc(100vh-4rem)] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 px-4 py-3 border-b border-border flex-shrink-0">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-destructive" />
          <h1 className="text-base font-grotesk font-bold">Modération — Signalements</h1>
        </div>
        <div className="flex items-center gap-1.5">
          {[
            { key: 'pending', label: 'En attente', count: stats.pending, cls: 'text-yellow-400' },
            { key: 'reviewed', label: 'En examen', count: stats.reviewed, cls: 'text-blue-400' },
            { key: 'resolved', label: 'Résolus', count: stats.resolved, cls: 'text-green-400' },
            { key: 'dismissed', label: 'Rejetés', count: stats.dismissed, cls: 'text-red-400' },
          ].map(s => (
            <button key={s.key} onClick={() => setFilterStatus(s.key)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors ${filterStatus === s.key ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground hover:text-foreground'}`}>
              {s.label} <span className={filterStatus === s.key ? '' : s.cls}>{s.count}</span>
            </button>
          ))}
          <button onClick={() => setFilterStatus('all')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors ${filterStatus === 'all' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground hover:text-foreground'}`}>
            Tous ({stats.total})
          </button>
        </div>
      </div>

      {/* Filters bar */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-border flex-shrink-0 flex-wrap">
        <div className="relative flex-1 min-w-[180px]">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Rechercher (nom, email, contenu, signaleur)…"
            className="w-full bg-secondary/50 border border-border rounded-lg pl-8 pr-3 py-1.5 text-xs outline-none focus:ring-1 focus:ring-primary/40 placeholder:text-muted-foreground/50"
          />
        </div>
        <select value={filterType} onChange={e => setFilterType(e.target.value)}
          className="bg-secondary/50 border border-border rounded-lg px-2.5 py-1.5 text-xs outline-none cursor-pointer focus:ring-1 focus:ring-primary/40">
          <option value="all">Tous les types</option>
          {Object.entries(TARGET_TYPE_META).map(([k, m]) => <option key={k} value={k}>{m.label}</option>)}
        </select>
        <select value={filterReason} onChange={e => setFilterReason(e.target.value)}
          className="bg-secondary/50 border border-border rounded-lg px-2.5 py-1.5 text-xs outline-none cursor-pointer focus:ring-1 focus:ring-primary/40">
          <option value="all">Toutes les raisons</option>
          {Object.entries(REASON_LABELS).map(([k, m]) => <option key={k} value={k}>{m.icon} {m.label}</option>)}
        </select>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="text-center py-12 text-muted-foreground">
            <Loader2 className="w-5 h-5 mx-auto mb-2 animate-spin" /> Chargement…
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 px-4">
            <Flag className="w-8 h-8 mx-auto mb-2 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">Aucun signalement</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filtered.map(r => {
              const sMeta = STATUS_META[r.status] || STATUS_META.pending;
              const SIcon = sMeta.icon;
              const tMeta = TARGET_TYPE_META[r.target_type] || TARGET_TYPE_META.user;
              const TIcon = tMeta.icon;
              const rMeta = REASON_LABELS[r.reason] || REASON_LABELS.autre;
              const daysSince = differenceInDays(new Date(), new Date(r.created_date));
              const isUrgent = daysSince > 3 && r.status === 'pending';
              const preview = r.target_content_preview || r.message_content || '';
              const isActive = selected?.id === r.id;

              return (
                <button key={r.id} onClick={() => { setSelected(r); setAdminNotes(r.admin_notes || ''); }}
                  className={`w-full text-left px-3 py-3 flex items-start gap-2.5 transition-colors ${isActive ? 'bg-primary/5 border-l-2 border-l-primary' : 'hover:bg-secondary/40 border-l-2 border-l-transparent'}`}>
                  {/* Type icon */}
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 border ${tMeta.bg} ${tMeta.border}`}>
                    <TIcon className={`w-3.5 h-3.5 ${tMeta.color}`} />
                  </div>

                  <div className="flex-1 min-w-0">
                    {/* Top row: type + reason + status */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${tMeta.bg} ${tMeta.color}`}>{tMeta.label}</span>
                      <span className="text-[10px] text-muted-foreground">{rMeta.icon} {rMeta.label}</span>
                      <span className={`text-[9px] font-medium px-1.5 py-0.5 rounded-full border ${sMeta.cls} flex items-center gap-0.5`}>
                        <SIcon className="w-2.5 h-2.5" /> {sMeta.label}
                      </span>
                      {isUrgent && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-red-400/15 text-red-400 border border-red-400/20">URGENT ({daysSince}j)</span>}
                    </div>

                    {/* Content preview */}
                    {preview ? (
                      <p className="text-xs text-foreground/80 mt-1 line-clamp-2 italic">"{preview}"</p>
                    ) : (
                      <p className="text-xs text-muted-foreground/60 mt-1 italic">Aucun aperçu de contenu</p>
                    )}

                    {/* Bottom row: author + reporter + time */}
                    <div className="flex items-center gap-1.5 mt-1 flex-wrap text-[10px] text-muted-foreground">
                      {r.target_name && <span className="truncate">par <span className="text-foreground/70 font-medium">{r.target_name}</span></span>}
                      <span className="text-muted-foreground/40">·</span>
                      <span>signalé par {r.reporter_name}</span>
                      <span className="text-muted-foreground/40">·</span>
                      <span>{timeAgo(r.created_date)}</span>
                      <span className="text-muted-foreground/40 ml-auto font-mono">#{String(r.id).slice(-6)}</span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Detail drawer */}
      {selected && (
        <div className="fixed md:relative inset-0 z-50 md:z-auto flex flex-col w-full md:w-1/2 bg-background border-l border-border">
          <div className="md:hidden absolute inset-0 bg-black/40" onClick={() => setSelected(null)} />
          <div className="relative flex flex-col h-full bg-background">
            {/* Header */}
            <div className="border-b border-border bg-card flex-shrink-0">
              <div className="h-0.5 w-full" style={{ background: 'linear-gradient(90deg, #ef4444, #f59e0b)' }} />
              <div className="p-3 md:p-4">
                <div className="flex items-center gap-2.5">
                  <button onClick={() => setSelected(null)}
                    className="md:hidden w-8 h-8 rounded-lg flex items-center justify-center bg-secondary border border-border flex-shrink-0">
                    <X className="w-4 h-4" />
                  </button>
                  {(() => {
                    const tMeta = TARGET_TYPE_META[selected.target_type] || TARGET_TYPE_META.user;
                    const TIcon = tMeta.icon;
                    return (
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center border ${tMeta.bg} ${tMeta.border} flex-shrink-0`}>
                        <TIcon className={`w-4 h-4 ${tMeta.color}`} />
                      </div>
                    );
                  })()}
                  <div className="flex-1 min-w-0">
                    <h1 className="text-sm font-grotesk font-bold truncate">
                      {TARGET_TYPE_META[selected.target_type]?.label || 'Contenu'} signalé
                    </h1>
                    <div className="flex items-center gap-1.5 mt-0.5 flex-wrap text-[10px] text-muted-foreground">
                      <span className="font-mono px-1.5 py-0.5 rounded border border-border bg-secondary">#{String(selected.id).slice(-6)}</span>
                      <span>{timeAgo(selected.created_date)}</span>
                      {(() => { const m = STATUS_META[selected.status] || STATUS_META.pending; const SI = m.icon; return (
                        <span className={`inline-flex items-center gap-0.5 font-medium px-1.5 py-0.5 rounded-full border ${m.cls}`}>
                          <SI className="w-2.5 h-2.5" /> {m.label}
                        </span>
                      ); })()}
                    </div>
                  </div>
                  <button onClick={() => setSelected(null)}
                    className="hidden md:flex w-8 h-8 rounded-lg items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary flex-shrink-0">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-3 md:p-4 space-y-3">
              {/* Investigation context */}
              <div className="rounded-xl bg-secondary/30 border border-border p-3 space-y-2">
                <p className="text-[10px] font-mono text-muted-foreground/60 uppercase tracking-wider flex items-center gap-1">
                  <Eye className="w-2.5 h-2.5" /> Contexte d'enquête
                </p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <p className="text-[9px] text-muted-foreground">Type de contenu</p>
                    <p className="font-semibold">{TARGET_TYPE_META[selected.target_type]?.label || selected.target_type}</p>
                  </div>
                  <div>
                    <p className="text-[9px] text-muted-foreground">ID du contenu</p>
                    <p className="font-mono text-[10px] truncate">{selected.target_id || '—'}</p>
                  </div>
                  <div>
                    <p className="text-[9px] text-muted-foreground">Auteur du contenu</p>
                    <p className="font-semibold truncate">{selected.target_name || '—'}</p>
                  </div>
                  <div>
                    <p className="text-[9px] text-muted-foreground">Email auteur</p>
                    <p className="font-mono text-[10px] truncate">{selected.target_email || '—'}</p>
                  </div>
                </div>
                {selected.target_context && (
                  <div className="border-t border-border pt-2">
                    <p className="text-[9px] text-muted-foreground">Emplacement</p>
                    <p className="text-xs text-foreground/80">{selected.target_context}</p>
                  </div>
                )}
              </div>

              {/* Link to content */}
              {selected.target_url && (
                <a href={selected.target_url} target="_blank" rel="noreferrer"
                  className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-primary/10 border border-primary/20 text-primary hover:bg-primary/20 transition-colors text-xs font-semibold">
                  <ExternalLink className="w-3.5 h-3.5 flex-shrink-0" />
                  Voir le contenu signalé
                  <span className="text-muted-foreground ml-auto text-[10px] truncate">{selected.target_url}</span>
                </a>
              )}

              {/* Reason + details */}
              <div className="rounded-xl bg-secondary/30 border border-border p-3 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-muted-foreground/60 uppercase tracking-wider">Raison</span>
                  <span className="text-xs font-semibold">{REASON_LABELS[selected.reason]?.icon} {REASON_LABELS[selected.reason]?.label || selected.reason}</span>
                </div>
                {selected.details && (
                  <div className="border-t border-border pt-2">
                    <p className="text-[10px] font-mono text-muted-foreground/60 uppercase tracking-wider mb-1">Détails du signaleur</p>
                    <p className="text-xs text-foreground/80">{selected.details}</p>
                  </div>
                )}
              </div>

              {/* Content snapshot */}
              {(selected.message_content || selected.target_content_preview) && (
                <div className="rounded-xl bg-destructive/5 border border-destructive/20 p-3">
                  <p className="text-[10px] font-mono text-muted-foreground/60 uppercase tracking-wider mb-1.5">Contenu signalé (snapshot)</p>
                  <p className="text-xs text-foreground/90 italic whitespace-pre-wrap">"{selected.message_content || selected.target_content_preview}"</p>
                </div>
              )}

              {/* Reporter info */}
              <div className="rounded-xl bg-secondary/30 border border-border p-3">
                <p className="text-[10px] font-mono text-muted-foreground/60 uppercase tracking-wider mb-1">Signalé par</p>
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-secondary border border-border flex items-center justify-center text-[10px] font-bold text-muted-foreground flex-shrink-0">
                    {(selected.reporter_name || selected.reporter_email || 'U').charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold truncate">{selected.reporter_name || 'Anonyme'}</p>
                    <p className="text-[10px] text-muted-foreground truncate">{selected.reporter_email}</p>
                  </div>
                </div>
              </div>

              {/* Admin notes */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[10px] font-mono text-muted-foreground/60 uppercase tracking-wider">Notes & décision</label>
                  <button onClick={draftReply} disabled={drafting}
                    className="h-7 px-2.5 rounded-lg border border-primary/30 text-primary text-[11px] font-semibold flex items-center gap-1 hover:bg-primary/10 transition-colors disabled:opacity-40">
                    {drafting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />} Nexus
                  </button>
                </div>
                <Textarea
                  value={adminNotes}
                  onChange={e => setAdminNotes(e.target.value)}
                  className="bg-secondary border-border text-xs resize-none h-20"
                  placeholder="Ex: Compte suspendu 30j, contenu supprimé, utilisateur averti…"
                />
              </div>
            </div>

            {/* Actions bar */}
            <div className="border-t border-border bg-card p-2.5 flex items-center gap-1.5 flex-shrink-0">
              <button onClick={() => updateReport.mutate({ id: selected.id, data: { status: 'reviewed', admin_notes: adminNotes } })}
                disabled={updateReport.isPending}
                className="h-8 px-2.5 rounded-lg text-xs font-medium text-blue-300 hover:bg-blue-400/10 transition-colors disabled:opacity-40 flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5" /> Examiner
              </button>
              <button onClick={() => updateReport.mutate({ id: selected.id, data: { status: 'resolved', admin_notes: adminNotes } })}
                disabled={updateReport.isPending}
                className="h-8 px-2.5 rounded-lg text-xs font-medium text-green-300 hover:bg-green-400/10 transition-colors disabled:opacity-40 flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> Résoudre
              </button>
              <button onClick={() => updateReport.mutate({ id: selected.id, data: { status: 'dismissed', admin_notes: adminNotes } })}
                disabled={updateReport.isPending}
                className="h-8 px-2.5 rounded-lg text-xs font-medium text-red-300 hover:bg-red-400/10 transition-colors disabled:opacity-40 flex items-center gap-1">
                <X className="w-3.5 h-3.5" /> Rejeter
              </button>
              <button onClick={() => deleteReport.mutate(selected.id)} disabled={deleteReport.isPending}
                className="h-8 px-2.5 rounded-lg text-xs font-medium text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-40 flex items-center gap-1 ml-auto">
                {deleteReport.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                <span className="hidden sm:inline">Supprimer</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}