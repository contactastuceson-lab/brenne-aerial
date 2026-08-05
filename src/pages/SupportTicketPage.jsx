import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send, Loader2, CheckCircle2, Clock, AlertCircle,
  ArrowLeft, Bot, UserCog, X,
  ShieldAlert, Sparkles, ThumbsUp, ThumbsDown,
} from 'lucide-react';
import { base44 } from '@/api/base44Client';
import NexusMarkdown from '@/components/support/NexusMarkdown';
import AdminMessageAuthor from '@/components/support/AdminMessageAuthor';
import NexusMessageAuthor from '@/components/support/NexusMessageAuthor';
import UserMessageAuthor from '@/components/support/UserMessageAuthor';

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
  const [actionLoading, setActionLoading] = useState(false);
  const [feedbackLoading, setFeedbackLoading] = useState(null);
  const [satisfactionLoading, setSatisfactionLoading] = useState(false);
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

  const rateMessage = async (msgIndex, feedback) => {
    if (feedbackLoading !== null) return;
    setFeedbackLoading(msgIndex);
    try {
      const msgs = [...(ticket.messages || [])];
      if (!msgs[msgIndex]) return;
      const current = msgs[msgIndex].feedback;
      const newFeedback = current === feedback ? null : feedback;
      msgs[msgIndex] = { ...msgs[msgIndex], feedback: newFeedback };
      setTicket((prev) => ({ ...prev, messages: msgs }));
      await base44.entities.SupportTicket.update(id, { messages: msgs });
    } catch {}
    setFeedbackLoading(null);
  };

  const closeTicket = async () => {
    if (actionLoading) return;
    setActionLoading(true);
    try {
      const updated = await base44.entities.SupportTicket.update(id, {
        status: 'closed',
        assignee: ticket.assignee === 'human' ? 'human' : 'ai',
      });
      setTicket(updated);
    } catch {}
    setActionLoading(false);
  };

  const escalateToHuman = async () => {
    if (actionLoading) return;
    setActionLoading(true);
    try {
      const updated = await base44.entities.SupportTicket.update(id, {
        status: 'awaiting_human',
        assignee: 'human',
        handled_by: 'escalated',
        escalation_reason: "Prise en charge humaine demandée par l'utilisateur",
      });
      setTicket(updated);
    } catch {}
    setActionLoading(false);
  };

  const submitSatisfaction = async (rating) => {
    if (satisfactionLoading) return;
    setSatisfactionLoading(true);
    try {
      const updated = await base44.entities.SupportTicket.update(id, { satisfaction: rating });
      setTicket(updated);
    } catch {}
    setSatisfactionLoading(false);
  };

  if (loading) {
    return (
      <>
        <div className="fixed top-0 left-0 z-40 w-full h-[100dvh] bg-black/40 backdrop-blur-sm hidden md:block" onClick={() => navigate('/support/conversation')} />
        <div className="fixed top-0 right-0 z-50 h-[100dvh] w-full md:w-1/2 bg-background border-l border-border flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      </>
    );
  }

  if (error || !ticket) {
    return (
      <>
        <div className="fixed top-0 left-0 z-40 w-full h-[100dvh] bg-black/40 backdrop-blur-sm hidden md:block" onClick={() => navigate('/support/conversation')} />
        <div className="fixed top-0 right-0 z-50 h-[100dvh] w-full md:w-1/2 bg-background border-l border-border flex flex-col items-center justify-center gap-3 px-4">
          <AlertCircle className="w-8 h-8 text-muted-foreground/50" />
          <p className="text-sm text-muted-foreground text-center">{error || 'Ticket introuvable'}</p>
          <Link to="/support/conversation" className="text-primary text-sm hover:underline">← Retour aux conversations</Link>
        </div>
      </>
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
  const hasSatisfaction = !!ticket.satisfaction;

  return (
    <>
      <div className="fixed top-0 left-0 z-40 w-full h-[100dvh] bg-black/40 backdrop-blur-sm hidden md:block" onClick={() => navigate('/support/conversation')} />
      <div className="fixed top-0 right-0 z-50 h-[100dvh] w-full md:w-1/2 bg-background border-l border-border flex flex-col p-3 md:p-4">
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
            {/* Action buttons */}
            {!isClosed && !isLocked && (
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <button onClick={escalateToHuman} disabled={actionLoading}
                  className="h-8 px-2.5 rounded-lg flex items-center gap-1 text-[11px] font-medium border border-orange-400/30 bg-orange-400/10 text-orange-300 hover:bg-orange-400/20 transition-colors disabled:opacity-40">
                  {actionLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <UserCog className="w-3 h-3" />}
                  <span className="hidden sm:inline">Humain</span>
                </button>
                <button onClick={closeTicket} disabled={actionLoading}
                  className="h-8 px-2.5 rounded-lg flex items-center gap-1 text-[11px] font-medium border border-border bg-secondary text-muted-foreground hover:text-foreground hover:border-foreground/20 transition-colors disabled:opacity-40">
                  <CheckCircle2 className="w-3 h-3" />
                  <span className="hidden sm:inline">Fermer</span>
                </button>
              </div>
            )}
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
            const feedback = m.feedback;
            return (
              <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                className={`flex ${isUser ? 'justify-end' : 'justify-start'} gap-2`}>
                <div className={`max-w-[85%] ${isUser ? 'items-end' : 'items-start'} flex flex-col`}>
                  {m.role === 'admin' && <AdminMessageAuthor adminId={m.admin_id} fallbackName={m.admin_name} />}
                  {isAssistant && <NexusMessageAuthor />}
                  {isUser && <UserMessageAuthor userId={ticket.user_id} fallbackName={ticket.user_name} />}
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
                  <div className="flex items-center gap-2 mt-1 px-1">
                    <span className="text-[10px] text-muted-foreground/60">
                      {formatTime(m.at)}
                    </span>
                    {isAssistant && (
                      <div className="flex items-center gap-0.5">
                        <button
                          onClick={() => rateMessage(i, 'up')}
                          disabled={feedbackLoading === i}
                          className={`w-5 h-5 rounded flex items-center justify-center transition-colors ${
                            feedback === 'up' ? 'text-green-400 bg-green-400/10' : 'text-muted-foreground/40 hover:text-green-400 hover:bg-green-400/5'
                          }`}>
                          {feedbackLoading === i ? <Loader2 className="w-3 h-3 animate-spin" /> : <ThumbsUp className="w-3 h-3" />}
                        </button>
                        <button
                          onClick={() => rateMessage(i, 'down')}
                          disabled={feedbackLoading === i}
                          className={`w-5 h-5 rounded flex items-center justify-center transition-colors ${
                            feedback === 'down' ? 'text-red-400 bg-red-400/10' : 'text-muted-foreground/40 hover:text-red-400 hover:bg-red-400/5'
                          }`}>
                          <ThumbsDown className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
        {nexusThinking && (
          <div className="flex justify-start items-start">
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

      {/* Satisfaction survey or status footer */}
      {isClosed && !hasSatisfaction && !isLocked && (
        <div className="rounded-2xl border border-border bg-card p-4 text-center">
          <p className="text-sm font-semibold mb-1">
            {isEscalated ? 'Ticket transmis à un humain' : 'Ce ticket est fermé'}
          </p>
          <p className="text-xs text-muted-foreground mb-3">Nexus vous a-t-il aidé ? Votre avis compte.</p>
          <div className="flex items-center justify-center gap-3">
            <button onClick={() => submitSatisfaction('up')} disabled={satisfactionLoading}
              className="flex flex-col items-center gap-1 px-4 py-2 rounded-xl border border-border hover:border-green-400/40 hover:bg-green-400/5 transition-colors group disabled:opacity-40">
              {satisfactionLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ThumbsUp className="w-5 h-5 text-muted-foreground group-hover:text-green-400 transition-colors" />}
              <span className="text-[10px] text-muted-foreground">Utile</span>
            </button>
            <button onClick={() => submitSatisfaction('down')} disabled={satisfactionLoading}
              className="flex flex-col items-center gap-1 px-4 py-2 rounded-xl border border-border hover:border-red-400/40 hover:bg-red-400/5 transition-colors group disabled:opacity-40">
              <ThumbsDown className="w-5 h-5 text-muted-foreground group-hover:text-red-400 transition-colors" />
              <span className="text-[10px] text-muted-foreground">Pas utile</span>
            </button>
          </div>
        </div>
      )}
      {isClosed && hasSatisfaction && !isLocked && (
        <div className="rounded-2xl border border-border bg-secondary/40 p-4 text-center">
          <CheckCircle2 className={`w-5 h-5 mx-auto mb-1.5 ${ticket.satisfaction === 'up' ? 'text-green-400' : 'text-orange-400'}`} />
          <p className="text-sm font-semibold">Ce ticket est fermé</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {ticket.satisfaction === 'up' ? 'Merci pour votre retour positif !' : 'Merci pour votre retour, on va améliorer ça.'}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">Veuillez en ouvrir un nouveau pour une assistance supplémentaire.</p>
          <Link to="/support/conversation" className="inline-flex items-center gap-1 text-xs text-primary font-medium mt-2 hover:underline">
            Créer un nouveau ticket →
          </Link>
        </div>
      )}
      {isLocked && (
        <div className="rounded-2xl border border-amber-400/25 bg-amber-400/[0.06] p-3 flex items-center gap-2.5">
          <ShieldAlert className="w-4 h-4 text-amber-300 flex-shrink-0" />
          <p className="text-xs text-amber-200/90">Cette conversation est verrouillée.</p>
        </div>
      )}
      {isAiResolved && !isClosed && !isLocked && (
        <div className="rounded-xl border border-primary/15 bg-primary/[0.05] p-2.5 text-center text-xs text-muted-foreground">
          Nexus a marqué ce ticket comme résolu · répondez si ce n'est pas réglé.
        </div>
      )}
      {!composerDisabled && (
        <div className="border-t border-border bg-card p-2.5">
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
    </>
  );
}