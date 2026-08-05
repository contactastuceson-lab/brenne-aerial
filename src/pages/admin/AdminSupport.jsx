import React, { useState, useEffect, useCallback, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import NexusMarkdown from '@/components/support/NexusMarkdown';
import AdminMessageAuthor from '@/components/support/AdminMessageAuthor';
import TicketUserInfo from '@/components/support/TicketUserInfo';
import UserMessageAuthor from '@/components/support/UserMessageAuthor';
import NexusMessageAuthor from '@/components/support/NexusMessageAuthor';
import {
  Loader2, RefreshCw, Send, Clock, CheckCircle2, AlertCircle,
  ShieldAlert, Sparkles, Bot, UserCog, X, Search,
  Paperclip, MessageCircle, Filter, ChevronDown,
  Trash2, Flag, StickyNote, Tag, UserSquare, ExternalLink,
} from 'lucide-react';

const CATEGORY_LABELS = {
  account: 'Compte', billing: 'Facturation', credits: 'Crédits', bug: 'Bug',
  feature: 'Fonctionnalité', events: 'Événements', moderation: 'Modération',
  messaging: 'Messagerie', other: 'Autre',
};

const STATUS_META = {
  open: { label: 'Ouvert', icon: Clock, cls: 'text-amber-400 bg-amber-400/10 border-amber-400/20' },
  ai_resolved: { label: 'Résolu IA', icon: CheckCircle2, cls: 'text-green-400 bg-green-400/10 border-green-400/20' },
  awaiting_human: { label: 'Escaladé', icon: ShieldAlert, cls: 'text-orange-400 bg-orange-400/10 border-orange-400/20' },
  resolved: { label: 'Résolu', icon: CheckCircle2, cls: 'text-green-400 bg-green-400/10 border-green-400/20' },
  closed: { label: 'Fermé', icon: CheckCircle2, cls: 'text-green-400 bg-green-400/10 border-green-400/20' },
};

const PRIORITY_LABELS = {
  low: 'Basse', medium: 'Moyenne', high: 'Haute', urgent: 'Urgente',
};

const OPEN_STATUSES = ['open', 'ai_resolved', 'awaiting_human'];
const CLOSED_STATUSES = ['resolved', 'closed'];

function formatTime(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }) + ', ' + d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
}

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
  return new Date(iso).toLocaleDateString('fr-FR');
}

export default function AdminSupport() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [reply, setReply] = useState('');
  const [sending, setSending] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [filter, setFilter] = useState('open');
  const [search, setSearch] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [adminNotes, setAdminNotes] = useState('');
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const scrollRef = useRef(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const list = await base44.entities.SupportTicket.list('-created_date', 200).catch(() => []);
      setTickets(list || []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    const unsub = base44.entities.SupportTicket.subscribe((event) => {
      if (event.type === 'create') {
        base44.entities.SupportTicket.get(event.id).then((t) => setTickets((prev) => [t, ...prev])).catch(() => {});
      } else if (event.type === 'update') {
        setTickets((prev) => prev.map((t) => (t.id === event.id ? { ...t, ...event.data } : t)));
        if (selected?.id === event.id) {
          base44.entities.SupportTicket.get(event.id).then(setSelected).catch(() => {});
        }
      } else if (event.type === 'delete') {
        setTickets((prev) => prev.filter((t) => t.id !== event.id));
      }
    });
    return unsub;
  }, [selected?.id]);

  useEffect(() => {
    if (selected) setAdminNotes(selected.admin_notes || '');
  }, [selected?.id]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [selected?.messages?.length, sending]);

  const filteredTickets = tickets.filter((t) => {
    const statusMatch = filter === 'all' ? true : filter === 'open' ? OPEN_STATUSES.includes(t.status) : CLOSED_STATUSES.includes(t.status);
    const catMatch = categoryFilter === 'all' ? true : t.category === categoryFilter;
    const searchMatch = !search.trim() ? true :
      (t.subject || '').toLowerCase().includes(search.toLowerCase()) ||
      (t.user_email || '').toLowerCase().includes(search.toLowerCase()) ||
      (t.user_name || '').toLowerCase().includes(search.toLowerCase()) ||
      (t.id || '').toLowerCase().includes(search.toLowerCase());
    return statusMatch && catMatch && searchMatch;
  });

  const stats = {
    open: tickets.filter((t) => OPEN_STATUSES.includes(t.status)).length,
    closed: tickets.filter((t) => CLOSED_STATUSES.includes(t.status)).length,
    all: tickets.length,
  };

  const sendReply = async () => {
    const msg = reply.trim();
    if (!msg || !selected || sending) return;
    setSending(true);
    const optimistic = { role: 'admin', content: msg, at: new Date().toISOString(), admin_id: user?.id, admin_name: user?.full_name };
    setSelected((prev) => prev ? { ...prev, messages: [...(prev.messages || []), optimistic] } : prev);
    setReply('');
    try {
      const msgs = [...(selected.messages || []), optimistic];
      const updated = await base44.entities.SupportTicket.update(selected.id, {
        messages: msgs,
        status: selected.status === 'closed' ? 'closed' : 'resolved',
        assignee: 'human',
        handled_by: 'human',
        admin_notes: msg,
      });
      setSelected(updated);
      setTickets((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
      if (selected.user_email) {
        await base44.integrations.Core.SendEmail({
          to: selected.user_email,
          subject: 'eza · Réponse à votre ticket',
          body: `<div style="font-family:Inter,sans-serif;max-width:560px;margin:auto;padding:24px;color:#e2e8f0;background:#0b1120"><h2 style="color:#38bdf8">Réponse du support eza</h2><p style="font-size:15px;line-height:1.6">${msg.replace(/\n/g, '<br>')}</p><p style="color:#64748b;font-size:13px;margin-top:24px">— Équipe eza</p></div>`,
        }).catch(() => {});
      }
    } catch {}
    setSending(false);
  };

  const changeStatus = async (status) => {
    if (!selected || actionLoading) return;
    setActionLoading(true);
    try {
      const updated = await base44.entities.SupportTicket.update(selected.id, { status });
      setSelected(updated);
      setTickets((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    } catch {}
    setActionLoading(false);
  };

  const closeTicket = async () => {
    if (!selected || actionLoading) return;
    setActionLoading(true);
    try {
      const updated = await base44.entities.SupportTicket.update(selected.id, { status: 'closed', assignee: 'human' });
      setSelected(updated);
      setTickets((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    } catch {}
    setActionLoading(false);
  };

  const changePriority = async (priority) => {
    if (!selected || actionLoading) return;
    setActionLoading(true);
    try {
      const updated = await base44.entities.SupportTicket.update(selected.id, { priority });
      setSelected(updated);
      setTickets((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    } catch {}
    setActionLoading(false);
  };

  const changeCategory = async (category) => {
    if (!selected || actionLoading) return;
    setActionLoading(true);
    try {
      const updated = await base44.entities.SupportTicket.update(selected.id, { category });
      setSelected(updated);
      setTickets((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    } catch {}
    setActionLoading(false);
  };

  const changeAssignee = async (assignee) => {
    if (!selected || actionLoading) return;
    setActionLoading(true);
    try {
      const updated = await base44.entities.SupportTicket.update(selected.id, { assignee });
      setSelected(updated);
      setTickets((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    } catch {}
    setActionLoading(false);
  };

  const saveAdminNotes = async () => {
    if (!selected || actionLoading) return;
    setActionLoading(true);
    try {
      const updated = await base44.entities.SupportTicket.update(selected.id, { admin_notes: adminNotes });
      setSelected(updated);
      setTickets((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    } catch {}
    setActionLoading(false);
  };

  const setAdminLabel = async (label) => {
    if (!selected || actionLoading) return;
    setActionLoading(true);
    try {
      const updated = await base44.entities.SupportTicket.update(selected.id, { admin_label: label });
      setSelected(updated);
      setTickets((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    } catch {}
    setActionLoading(false);
  };

  const deleteTicket = async () => {
    if (!selected || actionLoading) return;
    setActionLoading(true);
    try {
      await base44.entities.SupportTicket.delete(selected.id);
      setTickets((prev) => prev.filter((t) => t.id !== selected.id));
      setSelected(null);
    } catch {}
    setActionLoading(false);
  };

  return (
    <div className="flex h-[calc(100vh-3.5rem)] md:h-[calc(100vh-4rem)] overflow-hidden">
      {/* Liste des tickets — moitié gauche */}
      <div className={`${selected ? 'hidden md:flex' : 'flex'} flex-col w-full md:w-1/2 border-r border-border bg-background`}>
        {/* Header liste */}
        <div className="flex items-center justify-between gap-2 px-4 py-3 border-b border-border flex-shrink-0">
          <div className="flex items-center gap-2">
            <Bot className="w-5 h-5 text-primary" />
            <h1 className="text-base font-grotesk font-bold">Support — Tickets</h1>
          </div>
          <button onClick={load} className="w-8 h-8 rounded-lg flex items-center justify-center bg-secondary border border-border hover:border-primary/40 transition-colors">
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Recherche */}
        <div className="px-3 py-2 border-b border-border flex-shrink-0">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher (sujet, email, #ID)…"
              className="w-full bg-secondary/50 border border-border rounded-lg pl-8 pr-3 py-2 text-xs outline-none focus:ring-1 focus:ring-primary/40 placeholder:text-muted-foreground/50"
            />
          </div>
        </div>

        {/* Filtres */}
        <div className="flex items-center gap-1.5 px-3 py-2 border-b border-border flex-shrink-0">
          <div className="flex items-center gap-1 p-0.5 rounded-lg border border-border bg-card">
            <button onClick={() => setFilter('open')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors ${filter === 'open' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
              Ouverts ({stats.open})
            </button>
            <button onClick={() => setFilter('closed')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors ${filter === 'closed' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
              Fermés ({stats.closed})
            </button>
            <button onClick={() => setFilter('all')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors ${filter === 'all' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
              Tous ({stats.all})
            </button>
          </div>
          <button onClick={() => setShowFilters(!showFilters)}
            className={`h-7 px-2 rounded-lg border text-[11px] font-medium flex items-center gap-1 transition-colors ${categoryFilter !== 'all' ? 'border-primary/40 bg-primary/10 text-primary' : 'border-border bg-card text-muted-foreground hover:text-foreground'}`}>
            <Filter className="w-3 h-3" /> {categoryFilter !== 'all' ? CATEGORY_LABELS[categoryFilter] : 'Catégorie'}
            <ChevronDown className="w-2.5 h-2.5" />
          </button>
        </div>

        {showFilters && (
          <div className="px-3 py-2 border-b border-border flex flex-wrap gap-1 flex-shrink-0">
            <button onClick={() => { setCategoryFilter('all'); setShowFilters(false); }}
              className={`text-[11px] px-2 py-1 rounded-full border ${categoryFilter === 'all' ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground hover:text-foreground'}`}>
              Toutes
            </button>
            {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
              <button key={key} onClick={() => { setCategoryFilter(key); setShowFilters(false); }}
                className={`text-[11px] px-2 py-1 rounded-full border ${categoryFilter === key ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground hover:text-foreground'}`}>
                {label}
              </button>
            ))}
          </div>
        )}

        {/* Liste scrollable */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="text-center py-12 text-muted-foreground">
              <Loader2 className="w-5 h-5 mx-auto mb-2 animate-spin" /> Chargement…
            </div>
          ) : filteredTickets.length === 0 ? (
            <div className="text-center py-12 px-4">
              <AlertCircle className="w-8 h-8 mx-auto mb-2 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">Aucun ticket {filter === 'open' ? 'ouvert' : filter === 'closed' ? 'fermé' : ''}</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {filteredTickets.map((t) => {
                const meta = STATUS_META[t.status] || STATUS_META.open;
                const SIcon = meta.icon;
                const isActive = selected?.id === t.id;
                return (
                  <button key={t.id} onClick={() => setSelected(t)}
                    className={`w-full text-left px-3 py-3 flex items-start gap-2.5 transition-colors ${isActive ? 'bg-primary/5 border-l-2 border-l-primary' : 'hover:bg-secondary/40 border-l-2 border-l-transparent'}`}>
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 border ${meta.cls}`}>
                      <SIcon className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="text-xs font-medium truncate flex-1">{t.subject}</p>
                        <span className="text-[9px] text-muted-foreground flex-shrink-0">{timeAgo(t.created_date)}</span>
                      </div>
                      <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                        <span className="text-[10px] text-muted-foreground truncate">{t.user_email}</span>
                      </div>
                      <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                        <span className="text-[9px] px-1 py-0.5 rounded bg-secondary text-muted-foreground">{CATEGORY_LABELS[t.category] || 'Autre'}</span>
                        {t.priority === 'urgent' && <span className="text-[9px] px-1 py-0.5 rounded bg-red-400/10 text-red-400 border border-red-400/20">Urgent</span>}
                        {t.related_item_type === 'conversation' && <span className="text-[9px] text-primary flex items-center gap-0.5"><MessageCircle className="w-2 h-2" /></span>}
                        {t.file_urls?.length > 0 && <span className="text-[9px] text-muted-foreground flex items-center gap-0.5"><Paperclip className="w-2 h-2" /> {t.file_urls.length}</span>}
                        <span className="text-[9px] font-mono text-muted-foreground ml-auto">#{String(t.id).slice(-6)}</span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Conversation — moitié droite (drawer) */}
      {!selected ? (
        <div className="hidden md:flex flex-col w-1/2 items-center justify-center bg-background">
          <div className="w-14 h-14 rounded-2xl bg-secondary/50 border border-border flex items-center justify-center mb-3">
            <Bot className="w-6 h-6 text-muted-foreground/50" />
          </div>
          <p className="text-sm text-muted-foreground font-medium">Sélectionnez un ticket</p>
          <p className="text-xs text-muted-foreground/60 mt-0.5">Choisissez une conversation dans la liste pour la gérer.</p>
        </div>
      ) : (
        <div className="fixed md:relative inset-0 z-50 md:z-auto flex flex-col w-full md:w-1/2 bg-background">
          {/* Overlay mobile */}
          <div className="md:hidden absolute inset-0 bg-black/40" onClick={() => setSelected(null)} />

          <div className="relative flex flex-col h-full bg-background">
            {/* Header */}
            <div className="rounded-none border-b border-border bg-card">
              <div className="h-0.5 w-full" style={{ background: 'linear-gradient(90deg, #F37322, #1DA890)' }} />
              <div className="p-3 md:p-4">
                <div className="flex items-center gap-2.5">
                  <button onClick={() => setSelected(null)}
                    className="md:hidden w-8 h-8 rounded-lg flex items-center justify-center bg-secondary border border-border flex-shrink-0">
                    <X className="w-4 h-4" />
                  </button>
                  <div className="flex-1 min-w-0">
                    <h1 className="text-sm md:text-base font-grotesk font-bold truncate leading-tight">{selected.subject}</h1>
                    <div className="flex items-center gap-2 mt-1.5 flex-wrap text-[10px] text-muted-foreground">
                      <span className="font-mono px-1.5 py-0.5 rounded border border-border bg-secondary">
                        #{String(selected.id).slice(-6)}
                      </span>
                      <span className="inline-flex items-center gap-0.5">
                        <Clock className="w-2.5 h-2.5" /> {timeAgo(selected.created_date)}
                      </span>
                      {(() => { const m = STATUS_META[selected.status] || STATUS_META.open; const SI = m.icon; return (
                        <span className={`inline-flex items-center gap-0.5 font-medium px-1.5 py-0.5 rounded-full border ${m.cls}`}>
                          <SI className="w-2.5 h-2.5" /> {m.label}
                        </span>
                      ); })()}
                      <span className="inline-flex items-center gap-0.5">
                        <Sparkles className="w-2.5 h-2.5" /> {CATEGORY_LABELS[selected.category] || 'Autre'}
                      </span>
                      {selected.priority === 'urgent' && (
                        <span className="inline-flex items-center gap-0.5 font-medium px-1.5 py-0.5 rounded-full border border-red-400/30 bg-red-400/10 text-red-400">
                          Urgent
                        </span>
                      )}
                    </div>
                  </div>
                  <button onClick={() => setSelected(null)}
                    className="hidden md:flex w-8 h-8 rounded-lg items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors flex-shrink-0">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Infos utilisateur */}
                <div className="flex items-center gap-2 mt-2.5 text-[11px] flex-wrap">
                  <TicketUserInfo userId={selected.user_id} fallbackName={selected.user_name} fallbackEmail={selected.user_email} />
                  {selected.related_item_label && (
                    <>
                      <span className="text-muted-foreground/50">·</span>
                      <span className="text-foreground/70 truncate">{selected.related_item_label}</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Conversation */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-4 p-3 md:p-4 min-h-[240px]">
              {selected.escalation_reason && (
                <div className="flex items-start gap-2 text-xs text-orange-300/90 p-2.5 rounded-lg bg-orange-400/10 border border-orange-400/20">
                  <ShieldAlert className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                  <span>{selected.escalation_reason}</span>
                </div>
              )}
              {selected.ai_summary && (
                <div className="rounded-lg bg-primary/5 border border-primary/20 p-2.5">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> Résumé Nexus
                  </p>
                  <p className="text-xs text-foreground/90">{selected.ai_summary}</p>
                </div>
              )}

              {(selected.messages || []).length === 0 && (
                <div className="text-center py-12">
                  <Bot className="w-8 h-8 mx-auto mb-2 text-muted-foreground/40" />
                  <p className="text-sm text-muted-foreground">Aucun message dans ce ticket.</p>
                </div>
              )}

              {(selected.messages || []).map((m, i) => {
                const isUser = m.role === 'user';
                const isAdmin = m.role === 'admin';
                return (
                  <div key={i} className={`flex ${isUser ? 'justify-end' : 'justify-start'} gap-2`}>
                    <div className={`max-w-[85%] flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
                      {isAdmin && <AdminMessageAuthor adminId={m.admin_id} fallbackName={m.admin_name} />}
                      {isUser && <UserMessageAuthor userId={selected.user_id} fallbackName={selected.user_name} />}
                      {!isAdmin && !isUser && <NexusMessageAuthor />}
                      <div className={`rounded-2xl px-3.5 py-2.5 text-sm ${
                        isUser ? 'rounded-br-md text-white' : 'bg-card border border-border rounded-bl-md'
                      }`} style={isUser ? { background: '#0F172A' } : {}}>
                        {!isUser ? (
                          <NexusMarkdown>{m.content || ''}</NexusMarkdown>
                        ) : <p style={{ whiteSpace: 'pre-wrap' }} className="leading-relaxed">{m.content}</p>}
                      </div>
                      <span className="text-[10px] text-muted-foreground/60 mt-1 px-1">
                        {formatTime(m.at)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Barre d'actions */}
            <div className="border-t border-border bg-card">
              <div className="flex items-center gap-1 px-3 py-2 border-b border-border/50">
                <button onClick={() => setShowAdminPanel(!showAdminPanel)}
                  className={`h-8 px-3 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${showAdminPanel ? 'bg-primary/15 text-primary' : 'bg-secondary text-muted-foreground hover:text-foreground'}`}>
                  <Tag className="w-3.5 h-3.5" /> Gestion
                  <ChevronDown className={`w-3 h-3 transition-transform ${showAdminPanel ? 'rotate-180' : ''}`} />
                </button>
                <div className="w-px h-5 bg-border mx-0.5" />
                <button onClick={() => changeStatus('awaiting_human')} disabled={actionLoading}
                  className="h-8 px-2.5 rounded-lg text-xs font-medium text-orange-300 hover:bg-orange-400/10 transition-colors disabled:opacity-40 flex items-center gap-1">
                  {actionLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ShieldAlert className="w-3.5 h-3.5" />}
                  Escalader
                </button>
                <button onClick={() => changeStatus('resolved')} disabled={actionLoading}
                  className="h-8 px-2.5 rounded-lg text-xs font-medium text-green-300 hover:bg-green-400/10 transition-colors disabled:opacity-40 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Résoudre
                </button>
                <button onClick={closeTicket} disabled={actionLoading}
                  className="h-8 px-2.5 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors disabled:opacity-40 flex items-center gap-1">
                  <X className="w-3.5 h-3.5" /> Fermer
                </button>
                <button onClick={deleteTicket} disabled={actionLoading}
                  className="h-8 px-2.5 rounded-lg text-xs font-medium text-red-400 hover:bg-red-400/10 transition-colors disabled:opacity-40 flex items-center gap-1 ml-auto">
                  {actionLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                  <span className="hidden sm:inline">Supprimer</span>
                </button>
              </div>

              {/* Panneau de gestion */}
              {showAdminPanel && (
                <div className="px-3 py-3 space-y-3 bg-secondary/20">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {/* Priorité */}
                    <div>
                      <label className="text-[10px] font-mono text-muted-foreground/60 uppercase tracking-wider mb-1 block">Priorité</label>
                      <select
                        value={selected.priority || 'medium'}
                        onChange={(e) => changePriority(e.target.value)}
                        disabled={actionLoading}
                        className="w-full bg-background border border-border rounded-lg px-2 py-1.5 text-xs outline-none focus:ring-1 focus:ring-primary/40 cursor-pointer"
                      >
                        {Object.entries(PRIORITY_LABELS).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
                      </select>
                    </div>
                    {/* Catégorie */}
                    <div>
                      <label className="text-[10px] font-mono text-muted-foreground/60 uppercase tracking-wider mb-1 block">Catégorie</label>
                      <select
                        value={selected.category || 'other'}
                        onChange={(e) => changeCategory(e.target.value)}
                        disabled={actionLoading}
                        className="w-full bg-background border border-border rounded-lg px-2 py-1.5 text-xs outline-none focus:ring-1 focus:ring-primary/40 cursor-pointer"
                      >
                        {Object.entries(CATEGORY_LABELS).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
                      </select>
                    </div>
                    {/* Assigné */}
                    <div>
                      <label className="text-[10px] font-mono text-muted-foreground/60 uppercase tracking-wider mb-1 block">Assigné à</label>
                      <select
                        value={selected.assignee || 'unassigned'}
                        onChange={(e) => changeAssignee(e.target.value)}
                        disabled={actionLoading}
                        className="w-full bg-background border border-border rounded-lg px-2 py-1.5 text-xs outline-none focus:ring-1 focus:ring-primary/40 cursor-pointer"
                      >
                        <option value="ai">Nexus IA</option>
                        <option value="human">Humain</option>
                        <option value="unassigned">Non assigné</option>
                      </select>
                    </div>
                  </div>

                  {/* Label + notes */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] font-mono text-muted-foreground/60 uppercase tracking-wider mb-1 block">Label interne</label>
                      <input
                        value={selected.admin_label || ''}
                        onChange={(e) => setSelected((prev) => prev ? { ...prev, admin_label: e.target.value } : prev)}
                        onBlur={(e) => setAdminLabel(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') e.target.blur(); }}
                        placeholder="VIP, litige, suivi…"
                        className="w-full bg-background border border-border rounded-lg px-2.5 py-1.5 text-xs outline-none focus:ring-1 focus:ring-primary/40"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-mono text-muted-foreground/60 uppercase tracking-wider mb-1 block">Utilisateur</label>
                      <div className="flex items-center gap-1.5 bg-background border border-border rounded-lg px-2.5 py-1.5">
                        <UserSquare className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                        <span className="text-xs text-muted-foreground truncate flex-1">{selected.user_email}</span>
                        <a href={`/@${selected.user_name || ''}`} target="_blank" rel="noreferrer"
                          className="text-primary hover:underline flex items-center gap-0.5 flex-shrink-0">
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="text-[10px] font-mono text-muted-foreground/60 uppercase tracking-wider mb-1 flex items-center gap-1">
                      <StickyNote className="w-2.5 h-2.5" /> Notes internes
                    </label>
                    <div className="flex gap-2">
                      <textarea
                        value={adminNotes}
                        onChange={(e) => setAdminNotes(e.target.value)}
                        placeholder="Notes administratives (non visibles par l'utilisateur)…"
                        rows={2}
                        className="flex-1 bg-background border border-border rounded-lg px-2.5 py-1.5 text-xs outline-none focus:ring-1 focus:ring-primary/40 resize-none"
                      />
                      <button onClick={saveAdminNotes} disabled={actionLoading}
                        className="self-end h-8 px-3 rounded-lg bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-colors disabled:opacity-40 flex items-center gap-1 text-xs font-medium whitespace-nowrap">
                        {actionLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle2 className="w-3 h-3" />}
                        Enregistrer
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Composer */}
              <div className="flex items-end gap-2 p-2.5">
                <textarea
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendReply(); } }}
                  placeholder="Répondre en tant qu'admin…"
                  rows={2}
                  className="flex-1 bg-secondary/50 border border-border rounded-xl px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary/40 resize-none placeholder:text-muted-foreground/60"
                />
                <button
                  onClick={sendReply}
                  disabled={!reply.trim() || sending}
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-white disabled:opacity-40 disabled:saturate-50 transition-transform active:scale-95 flex-shrink-0"
                  style={{ background: 'linear-gradient(135deg, #F37322, #1DA890)' }}
                >
                  {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}