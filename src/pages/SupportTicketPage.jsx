import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send, Loader2, CheckCircle2, Clock, AlertCircle,
  ArrowLeft, Bot, UserCog, X,
  ShieldAlert, Sparkles,
} from 'lucide-react';
import { base44 } from '@/api/base44Client';
import NexusMarkdown from '@/components/support/NexusMarkdown';

const CATEGORY_LABELS = {
  account: 'Compte', billing: 'Facturation', credits: 'Crédits', bug: 'Bug technique',
  feature: 'Fonctionnalité', events: 'Événements', moderation: 'Modération', messaging: 'Messagerie', other: 'Autre',
};

const STATUS_META = {
  open: { label: 'Ouvert', icon: Clock, cls: 'text-amber-400 bg-amber-400/10 border-amber-400/20' },
  ai_resolved: { label: 'Résolu IA', icon: CheckCircle2, cls: 'text-green-400 bg-green-400/10 border-green-400/20' },
  awaiting_human: { label: 'Escaladé', icon: ShieldAlert, cls: 'text-orange-400 bg-orange-400/10 border-orange-400/20' },
  resolved: { label: 'Résolu', icon: CheckCircle2, cls: 'text-green-400 bg-green-400/10 border-green-400/20' },
  closed: { label: 'Fermé', icon: CheckCircle2, cls: 'text-muted-foreground bg-secondary border-border' },
};

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
  if (days < 7) return `il y a ${days} jour${days > 1 ? 's' : ''}`;
  return new Date(iso).toLocaleDateString('fr-FR');
}

export default function SupportTicketPage() {
  const { id } = useParams();
  const navigate = useNavigate();
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
    } catch {
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

  const sendReply = async () => {
    const msg = reply.trim();
    if (!msg || sending) return;
    setSending(true);
    const optimistic = { role: 'user', content: msg, at: new Date().toISOString() };
    setTicket((prev) => prev ? { ...prev, messages: [...(prev.messages || []), optimistic] } : prev);
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
      <div className="max-w-2xl mx-auto px-4 py-20 text-center text-muted-foreground">
        <Loader2 className="w-6 h-6 mx-auto mb-3 animate-spin" />
        Chargement du ticket…
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <AlertCircle className="w-8 h-8 mx-auto mb-3 text-muted-foreground/50" />
        <p className="text-sm text-muted-foreground mb-4">{error || 'Ticket introuvable'}</p>
        <Link to="/support" className="text-primary text-sm hover:underline">← Retour au support</Link>
      </div>
    );
  }

  const meta = STATUS_META[ticket.status] || STATUS_META.open;
  const SIcon = meta.icon;
  const messages = ticket.messages || [];
  const isClosed = ['resolved', 'closed'].includes(ticket.status);
  const isLocked = !!ticket.user_locked;
  const isAiResolved = ticket.status === 'ai_resolved';
  const isEscalated = ticket.status === 'awaiting_human';
  const nexusThinking = sending || (!sending && messages.length > 0 && !messages.some((m) => m.role === 'assistant' || m.role === 'admin'));
  const composerDisabled = isClosed || isLocked || sending;

  return (
    <div className="max-w-2xl mx-auto px-3 md:px-4 py-4 md:py-6 flex flex-col" style={{ minHeight: 'calc(100dvh - 4rem)' }}>
      {/* Header */}
      <div className="rounded-2xl bg-card border border-border overflow-hidden mb-3">
        <div className="h-0.5 w-full" style={{ background: 'linear-gradient(90deg, #F37322, #1DA890)' }} />
        <div className="p-4">
          <div className="flex items-center gap-2.5">
            <button onClick={() => navigate('/support/conversation')}
              className="w-8 h-8 rounded-lg flex items-center justify-center bg-secondary border border-border hover:border-primary/40 transition-colors flex-shrink-0">
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div className="flex-1 min-w-0">
              <h1 className="text-sm md:text-base font-grotesk font-bold truncate leading-tight">{ticket.subject}</h1>
              <div className="flex items-center gap-2 mt-1.5 flex-wrap text-[10px] text-muted-foreground">
                <span className="font-mono px-1.5 py-0.5 rounded border border-border bg-secondary">
                  #{String(ticket.id).slice(-6)}
                </span>
                <span className="inline-flex items-center gap-0.5">
                  <Clock className="w-2.5 h-2.5" /> {timeAgo(ticket.created_date)}
                </span>
                <span className={`inline-flex items-center gap-0.5 font-medium px-1.5 py-0.5 rounded-full border ${meta.cls}`}>
                  <SIcon className="w-2.5 h-2.5" /> {meta.label}
                </span>
                <span className="inline-flex items-center gap-0.5">
                  <Sparkles className="w-2.5 h-2.5" /> {CATEGORY_LABELS[ticket.category] || 'Autre'}
                </span>
              </div>
            </div>
            <button onClick={() => navigate('/support/conversation')}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors flex-shrink-0">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Conversation */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-4 pb-4 min-h-[240px] pr-1 -mr-1">
        {messages.length === 0 && (
          <div className="text-center py-12">
            <Bot className="w-8 h-8 mx-auto mb-2 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">Décrivez votre problème pour démarrer.</p>
          </div>
        )}
        <AnimatePresence>
          {messages.map((m, i) => {
            const isUser = m.role === 'user';
            const isAssistant = m.role === 'assistant';
            return (
              <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                className={`flex ${isUser ? 'justify-end' : 'justify-start'} gap-2`}>
                {!isUser && (
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-3"
                    style={{ background: 'linear-gradient(135deg, #F37322, #1DA890)' }}>
                    {m.role === 'admin' ? <UserCog className="w-3.5 h-3.5 text-white" /> : <Bot className="w-3.5 h-3.5 text-white" />}
                  </div>
                )}
                <div className={`max-w-[85%] ${isUser ? 'items-end' : 'items-start'} flex flex-col`}>
                  <div className={`rounded-2xl px-3.5 py-2.5 text-sm ${
                    isUser
                      ? 'rounded-br-md text-white'
                      : 'bg-card border border-border rounded-bl-md'
                  }`}
                    style={isUser ? { background: '#0F172A' } : {}}>
                    {!isUser ? (
                      <NexusMarkdown>{m.content}</NexusMarkdown>
                    ) : <p style={{ whiteSpace: 'pre-wrap' }} className="leading-relaxed">{m.content}</p>}
                  </div>
                  <span className="text-[10px] text-muted-foreground/60 mt-1 px-1">
                    {formatTime(m.at)}
                  </span>
                </div>
                {isUser && (
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-3 bg-secondary border border-border">
                    <span className="text-[10px] font-bold text-muted-foreground">
                      {(ticket.user_name || ticket.user_email || 'U').charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
        {nexusThinking && (
          <div className="flex justify-start gap-2 items-start">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-3"
              style={{ background: 'linear-gradient(135deg, #F37322, #1DA890)' }}>
              <Bot className="w-3.5 h-3.5 text-white" />
            </div>
            <div className="bg-card border border-border rounded-2xl rounded-bl-md px-4 py-3">
              <div className="flex items-center gap-1.5">
                {[0, 1, 2].map((i) => (
                  <motion.div key={i} className="w-1.5 h-1.5 rounded-full bg-primary/50"
                    animate={{ y: [0, -4, 0], opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }} />
                ))}
              </div>
            </div>
          </div>
        )}
        {ticket.escalation_reason && (
          <div className="flex items-start gap-2 text-xs text-orange-300/90 pl-9">
            <ShieldAlert className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
            <span>Escaladé : {ticket.escalation_reason}</span>
          </div>
        )}
      </div>

      {/* Status footer */}
      {isClosed && !isLocked && (
        <div className="rounded-2xl border border-border bg-secondary/40 p-4 text-center sticky bottom-0">
          <CheckCircle2 className="w-5 h-5 mx-auto mb-1.5 text-green-400" />
          <p className="text-sm font-semibold">Ce ticket a été résolu</p>
          <p className="text-xs text-muted-foreground mt-0.5">Veuillez créer un nouveau ticket pour une assistance supplémentaire.</p>
          <Link to="/support/conversation" className="inline-flex items-center gap-1 text-xs text-primary font-medium mt-2 hover:underline">
            Créer un nouveau ticket →
          </Link>
        </div>
      )}
      {isLocked && (
        <div className="rounded-2xl border border-amber-400/25 bg-amber-400/[0.06] p-3 flex items-center gap-2.5 sticky bottom-0">
          <ShieldAlert className="w-4 h-4 text-amber-300 flex-shrink-0" />
          <p className="text-xs text-amber-200/90">Cette conversation est verrouillée.</p>
        </div>
      )}
      {isAiResolved && !isLocked && !isClosed && (
        <div className="rounded-xl border border-primary/15 bg-primary/[0.05] p-2.5 text-center text-xs text-muted-foreground sticky bottom-0">
          Nexus a marqué ce ticket comme résolu · répondez si ce n'est pas réglé.
        </div>
      )}
      {isEscalated && !isClosed && !isLocked && (
        <div className="rounded-xl border border-orange-400/20 bg-orange-400/[0.05] p-2.5 flex items-center gap-2 sticky bottom-0">
          <ShieldAlert className="w-4 h-4 text-orange-400 flex-shrink-0" />
          <p className="text-xs text-orange-300/90">Pris en charge par un spécialiste du support — réponse sous 24-48h.</p>
        </div>
      )}
      {!composerDisabled && (
        <div className="rounded-2xl border border-border bg-card p-2.5 sticky bottom-0">
          <div className="flex items-end gap-2">
            <textarea
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendReply(); } }}
              placeholder="Écrivez votre message…"
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
      )}
    </div>
  );
}