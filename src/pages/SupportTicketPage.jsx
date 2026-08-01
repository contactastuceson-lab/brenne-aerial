import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, Send, Loader2, CheckCircle2, Clock, AlertCircle,
  ArrowLeft, Bot, User as UserIcon, Paperclip, Hash, MessageCircle, FileText,
  Lock, ShieldAlert, Tag, UserCog, Wallet,
} from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import ReactMarkdown from 'react-markdown';
import AiSteps from '@/components/support/AiSteps';

const CATEGORY_LABELS = {
  account: 'Compte', billing: 'Facturation', credits: 'Crédits', bug: 'Bug technique',
  feature: 'Fonctionnalité', events: 'Événements', moderation: 'Modération', messaging: 'Messagerie', other: 'Autre',
};

const STATUS_META = {
  open: { label: 'Ouvert', icon: Clock, dot: 'bg-amber-400', cls: 'text-amber-300 bg-amber-400/10 border-amber-400/25' },
  ai_resolved: { label: 'Résolu par Nexus', icon: CheckCircle2, dot: 'bg-green-500', cls: 'text-green-300 bg-green-500/10 border-green-500/25' },
  awaiting_human: { label: 'Escaladé humain', icon: ShieldAlert, dot: 'bg-orange-400', cls: 'text-orange-300 bg-orange-400/10 border-orange-400/25' },
  resolved: { label: 'Résolu', icon: CheckCircle2, dot: 'bg-green-500', cls: 'text-green-300 bg-green-500/10 border-green-500/25' },
  closed: { label: 'Fermé', icon: CheckCircle2, dot: 'bg-zinc-500', cls: 'text-muted-foreground bg-secondary border-border' },
};

const PRIORITY_META = {
  low: { label: 'Faible', cls: 'text-slate-300 bg-slate-400/10 border-slate-400/25' },
  medium: { label: 'Normale', cls: 'text-blue-300 bg-blue-400/10 border-blue-400/25' },
  high: { label: 'Haute', cls: 'text-orange-300 bg-orange-400/10 border-orange-400/25' },
  urgent: { label: 'Urgente', cls: 'text-red-300 bg-red-500/10 border-red-500/25' },
};

const ASSIGNEE_META = {
  ai: { label: 'Nexus', icon: Bot, cls: 'text-primary bg-primary/10 border-primary/25' },
  human: { label: 'Humain', icon: UserCog, cls: 'text-orange-300 bg-orange-400/10 border-orange-400/25' },
  unassigned: { label: 'Non assigné', icon: UserIcon, cls: 'text-muted-foreground bg-secondary border-border' },
};

function Badge({ meta, icon: Icon, children, className = '' }) {
  return (
    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border inline-flex items-center gap-1 ${className || meta.cls}`}>
      {Icon && <Icon className="w-2.5 h-2.5" />}
      {children}
    </span>
  );
}

export default function SupportTicketPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reply, setReply] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const scrollRef = useRef(null);

  const load = async () => {
    try {
      const t = await base44.entities.SupportTicket.get(id).catch(() => null);
      if (!t) { setError('Ticket introuvable'); setLoading(false); return; }
      setTicket(t);
    } catch (e) {
      setError('Ticket introuvable');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [id]);

  useEffect(() => {
    if (!id) return;
    const unsub = base44.entities.SupportTicket.subscribe((event) => {
      if (event?.id === id) load();
    });
    return () => { if (unsub) unsub(); };
  }, [id]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [ticket?.messages?.length, loading, sending]);

  // Étapes de recherche affichées en temps réel pendant que Nexus traite
  const sendingSteps = useMemo(() => {
    const steps = [{ icon: 'book', label: 'Lecture de la documentation eza' }];
    if (ticket?.related_item_type === 'post') steps.push({ icon: 'post', label: 'Examen de la publication concernée' });
    if (ticket?.related_item_type === 'conversation') steps.push({ icon: 'history', label: 'Analyse de la discussion' });
    if (['credits', 'billing'].includes(ticket?.category) || ticket?.related_item_type === 'wallet') steps.push({ icon: 'wallet', label: 'Vérification de votre solde Eza' });
    if (ticket?.category === 'account') steps.push({ icon: 'user', label: 'Vérification de votre compte' });
    steps.push({ icon: 'search', label: "Recherche d'une solution applicable" });
    return steps;
  }, [ticket?.related_item_type, ticket?.category]);

  const sendReply = async () => {
    const msg = reply.trim();
    if (!msg || sending) return;
    setSending(true);
    const optimisticMsg = { role: 'user', content: msg, at: new Date().toISOString() };
    setTicket((prev) => prev ? { ...prev, messages: [...(prev.messages || []), optimisticMsg] } : prev);
    setReply('');
    try {
      const res = await base44.functions.invoke('replySupportTicket', { ticketId: id, message: msg });
      const data = res?.data || res;
      if (data?.ticket) setTicket(data.ticket);
      else load();
    } catch (e) {
      setError(e?.message || 'Erreur');
      load();
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center text-muted-foreground">
        <Loader2 className="w-6 h-6 mx-auto mb-3 animate-spin" />
        Chargement du ticket…
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <AlertCircle className="w-8 h-8 mx-auto mb-3 text-muted-foreground/50" />
        <p className="text-sm text-muted-foreground mb-4">{error || 'Ticket introuvable'}</p>
        <Link to="/support" className="text-primary text-sm hover:underline">← Retour au support</Link>
      </div>
    );
  }

  const meta = STATUS_META[ticket.status] || STATUS_META.open;
  const SIcon = meta.icon;
  const prio = PRIORITY_META[ticket.priority] || PRIORITY_META.medium;
  const assignee = ASSIGNEE_META[ticket.assignee] || ASSIGNEE_META.unassigned;
  const AIcon = assignee.icon;
  const messages = ticket.messages || [];
  // Statut terminal = le ticket est "fermé normalement" (résolu par Nexus, résolu, ou fermé).
  // On ne peut plus écrire — il faut ouvrir un nouveau ticket.
  const isClosed = ['ai_resolved', 'resolved', 'closed'].includes(ticket.status);
  const isLocked = !!ticket.user_locked;
  const composerDisabled = isClosed || isLocked;

  return (
    <div className="max-w-3xl mx-auto px-3 md:px-4 py-4 md:py-6 flex flex-col" style={{ minHeight: 'calc(100dvh - 4rem)' }}>
      {/* Header */}
      <div className="rounded-2xl bg-card border border-border p-3 md:p-4 mb-3">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/support')}
            className="w-9 h-9 rounded-xl flex items-center justify-center bg-secondary border border-border hover:border-primary/40 transition-colors flex-shrink-0">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-[15px] md:text-base font-grotesk font-bold truncate">{ticket.subject}</h1>
            <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
              <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border inline-flex items-center gap-1 ${meta.cls}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />
                {meta.label}
              </span>
              <Badge meta={prio}>{prio.label}</Badge>
              <Badge meta={assignee} icon={AIcon}>{assignee.label}</Badge>
              {ticket.admin_label && (
                <Badge className="text-violet-300 bg-violet-400/10 border-violet-400/25" icon={Tag}>
                  {ticket.admin_label}
                </Badge>
              )}
              <span className="text-[10px] text-muted-foreground/70 ml-auto">#{String(ticket.id).slice(-6)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* IA context banner */}
      <div className="rounded-2xl border border-primary/15 bg-primary/[0.04] p-3 mb-3 flex items-start gap-2.5">
        <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: 'linear-gradient(135deg, hsl(205 90% 50%), hsl(195 80% 42%))' }}>
          <Sparkles className="w-4 h-4 text-white" />
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed pt-0.5">
          Nexus connaît votre compte (solde, abonnement, activité, parrainages) et répond à partir de ce contexte réel.
          {ticket.ai_summary ? <span className="text-foreground/80 block mt-1">Résumé : {ticket.ai_summary}</span> : null}
        </p>
      </div>

      {/* Métadonnées : élément concerné + pièces jointes */}
      {(ticket.related_item_type !== 'none' || ticket.file_urls?.length > 0) && (
        <div className="rounded-2xl border border-border bg-secondary/30 p-3 mb-3 space-y-2.5">
          {ticket.related_item_type === 'post' && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Hash className="w-3.5 h-3.5 text-primary" />
              <span>Publication concernée : {ticket.related_item_label || ticket.related_item_id}</span>
            </div>
          )}
          {ticket.related_item_type === 'conversation' && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <MessageCircle className="w-3.5 h-3.5 text-primary" />
              <span>Discussion : {ticket.related_item_label}</span>
            </div>
          )}
          {ticket.related_item_type === 'wallet' && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Wallet className="w-3.5 h-3.5 text-primary" />
              <span>Portefeuille concerné : {ticket.related_item_label}</span>
            </div>
          )}
          {ticket.file_urls?.length > 0 && (
            <div className="flex items-start gap-2">
              <Paperclip className="w-3.5 h-3.5 text-muted-foreground mt-0.5" />
              <div className="flex flex-wrap gap-1.5">
                {ticket.file_urls.map((u) => /\.(jpg|jpeg|png|gif|webp|svg)(\?|$)/i.test(u) ? (
                  <a key={u} href={u} target="_blank" rel="noreferrer" className="w-14 h-14 rounded-lg overflow-hidden border border-border">
                    <img src={u} alt="" className="w-full h-full object-cover" />
                  </a>
                ) : (
                  <a key={u} href={u} target="_blank" rel="noreferrer" className="w-14 h-14 rounded-lg border border-border bg-secondary flex items-center justify-center">
                    <FileText className="w-4 h-4 text-muted-foreground" />
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Conversation */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-3 pb-4 min-h-[240px] pr-1 -mr-1">
        {messages.length === 0 && (
          <div className="text-center py-12">
            <Bot className="w-8 h-8 mx-auto mb-2 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">Décrivez votre problème pour démarrer.</p>
          </div>
        )}
        <AnimatePresence>
          {messages.map((m, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} gap-2.5`}>
              {m.role !== 'user' && (
                <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{ background: 'linear-gradient(135deg, hsl(205 90% 50%), hsl(195 80% 42%))' }}>
                  {m.role === 'admin' ? <UserCog className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-white" />}
                </div>
              )}
              <div className={`max-w-[82%] rounded-2xl px-3.5 py-2.5 text-sm ${
                m.role === 'user'
                  ? 'rounded-tr-md text-white'
                  : m.role === 'admin'
                    ? 'bg-blue-500/15 border border-blue-400/20 rounded-tl-md'
                    : 'bg-[#1C2329] border border-white/[0.06] rounded-tl-md'
              }`}
                style={m.role === 'user' ? { background: 'linear-gradient(135deg, hsl(211 100% 50%), hsl(205 90% 45%))' } : {}}>
                {m.role !== 'user' ? (
                  <div>
                    {m.role === 'assistant' && m.steps?.length > 0 && (
                      <AiSteps steps={m.steps} animate={i === messages.length - 1 && !sending} />
                    )}
                    <div className="prose-sm text-foreground/90 leading-relaxed [&_p]:mb-1 [&_p:last-child]:mb-0 [&_strong]:text-foreground [&_strong]:font-semibold [&_ul]:list-disc [&_ul]:pl-4 [&_li]:mb-0.5">
                      <ReactMarkdown>{m.content}</ReactMarkdown>
                    </div>
                  </div>
                ) : <p style={{ whiteSpace: 'pre-wrap' }} className="leading-relaxed">{m.content}</p>}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {sending && (
          <div className="flex justify-start gap-2.5 items-start">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
              style={{ background: 'linear-gradient(135deg, hsl(205 90% 50%), hsl(195 80% 42%))' }}>
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div className="bg-[#1C2329] border border-white/[0.06] rounded-2xl rounded-tl-md px-3.5 py-2.5 max-w-[82%]">
              <AiSteps steps={sendingSteps} animate={true} />
            </div>
          </div>
        )}
        {ticket.escalation_reason && (
          <div className="flex items-start gap-2 text-xs text-orange-300/90 pl-10 pt-1">
            <ShieldAlert className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
            <span>Escaladé : {ticket.escalation_reason}</span>
          </div>
        )}
      </div>

      {/* Composer */}
      {isLocked && (
        <div className="rounded-2xl border border-amber-400/25 bg-amber-400/[0.06] p-3 flex items-center gap-2.5 sticky bottom-0">
          <Lock className="w-4 h-4 text-amber-300 flex-shrink-0" />
          <p className="text-xs text-amber-200/90">Cette conversation est verrouillée en attendant une confirmation de votre part.</p>
        </div>
      )}
      {isClosed && !isLocked && (
        <div className="rounded-2xl border border-border bg-card p-3 text-center text-xs text-muted-foreground sticky bottom-0">
          Ce ticket est résolu · fermé. <Link to="/support" className="text-primary hover:underline">Ouvrir un nouveau ticket</Link>
        </div>
      )}
      {!composerDisabled && (
        <div className="rounded-2xl border border-border bg-card p-2.5 sticky bottom-0">
          <div className="flex items-end gap-2">
            <textarea
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendReply(); } }}
              placeholder="Répondre à Nexus…"
              rows={2}
              className="flex-1 bg-secondary/50 border border-border rounded-xl px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary/40 resize-none placeholder:text-muted-foreground/60"
            />
            <button
              onClick={sendReply}
              disabled={!reply.trim() || sending}
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white disabled:opacity-40 disabled:saturate-50 transition-transform active:scale-95 flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, hsl(211 100% 50%), hsl(205 90% 45%))' }}
            >
              {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}