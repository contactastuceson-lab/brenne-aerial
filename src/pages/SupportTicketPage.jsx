import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, Send, Loader2, CheckCircle2, Clock, AlertCircle,
  ArrowLeft, Bot, UserCog, Paperclip, Hash, MessageCircle, FileText,
  Lock, ShieldAlert, Tag, Wallet, XCircle, Search,
} from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import AiSteps from '@/components/support/AiSteps';
import NexusMarkdown from '@/components/support/NexusMarkdown';
import PendingActionCard from '@/components/support/PendingActionCard';
import EventPickerCard from '@/components/support/EventPickerCard';

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

  const thinkingSteps = useMemo(() => {
    const rt = ticket?.related_item_type;
    const byType = {
      post: { icon: 'post', label: 'Examen de la publication concernée' },
      conversation: { icon: 'history', label: 'Analyse de la discussion concernée' },
      wallet: { icon: 'wallet', label: 'Vérification du portefeuille concerné' },
      event: { icon: 'event', label: "Examen de l'événement concerné" },
      community: { icon: 'community', label: 'Examen de la communauté concernée' },
      space: { icon: 'space', label: 'Examen du Space concerné' },
      story: { icon: 'story', label: 'Examen de la story concernée' },
      referral: { icon: 'referral', label: 'Examen du parrainage concerné' },
      registration: { icon: 'registration', label: "Examen de l'inscription concernée" },
      reward: { icon: 'reward', label: 'Examen de la récompense concernée' },
      cart: { icon: 'cart', label: 'Examen du panier concerné' },
      ticket: { icon: 'ticket', label: 'Examen du ticket concerné' },
      discussion: { icon: 'discussion', label: 'Examen de la discussion forum' },
      forum: { icon: 'forum', label: 'Examen du sujet forum' },
      review: { icon: 'review', label: "Examen de l'avis concerné" },
      certification: { icon: 'certification', label: 'Examen de la certification' },
      donation: { icon: 'donation', label: 'Examen du don concerné' },
      list: { icon: 'list', label: 'Examen de la liste concernée' },
      ad: { icon: 'ad', label: 'Examen de la campagne pub' },
    };
    const steps = [{ icon: 'book', label: 'Lecture de la documentation eza' }];
    if (rt && rt !== 'none' && byType[rt]) steps.push(byType[rt]);
    if (['credits', 'billing'].includes(ticket?.category) || rt === 'wallet') steps.push({ icon: 'wallet', label: 'Vérification de votre solde Eza' });
    if (ticket?.category === 'account') steps.push({ icon: 'user', label: 'Vérification de votre compte' });
    if (ticket?.category === 'events' || rt === 'event' || rt === 'registration') steps.push({ icon: 'event', label: 'Recherche des événements & inscriptions' });
    steps.push({ icon: 'search', label: "Recherche d'une solution applicable" });
    return steps;
  }, [ticket?.related_item_type, ticket?.category]);

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
  const nexusThinking = !sending && messages.length > 0 && !messages.some((m) => m.role === 'assistant' || m.role === 'admin');
  const composerDisabled = isClosed || isLocked || nexusThinking;
  const relatedIcon = { post: Hash, conversation: MessageCircle, wallet: Wallet }[ticket.related_item_type];

  return (
    <div className="max-w-2xl mx-auto px-3 md:px-4 py-4 md:py-6 flex flex-col" style={{ minHeight: 'calc(100dvh - 4rem)' }}>
      {/* Header — style Base44 épuré */}
      <div className="rounded-2xl bg-card border border-border overflow-hidden mb-3">
        <div className="h-1 w-full" style={{ background: 'linear-gradient(90deg, #F37322, #1DA890)' }} />
        <div className="p-4">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/support')}
              className="w-9 h-9 rounded-xl flex items-center justify-center bg-secondary border border-border hover:border-primary/40 transition-colors flex-shrink-0">
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div className="flex-1 min-w-0">
              <h1 className="text-base md:text-lg font-grotesk font-bold truncate">{ticket.subject}</h1>
              <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border inline-flex items-center gap-1 ${meta.cls}`}>
                  <SIcon className="w-2.5 h-2.5" /> {meta.label}
                </span>
                <span className="text-[10px] font-medium px-2 py-0.5 rounded-full border border-border bg-secondary text-muted-foreground">
                  {CATEGORY_LABELS[ticket.category] || 'Autre'}
                </span>
                {ticket.admin_label && (
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded-full border border-violet-400/20 bg-violet-400/10 text-violet-300 inline-flex items-center gap-1">
                    <Tag className="w-2.5 h-2.5" /> {ticket.admin_label}
                  </span>
                )}
                <span className="text-[10px] text-muted-foreground/60 ml-auto">#{String(ticket.id).slice(-6)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Banner Nexus context */}
      <div className="rounded-2xl border border-primary/15 bg-primary/[0.04] p-3 mb-3 flex items-start gap-2.5">
        <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: 'linear-gradient(135deg, #F37322, #1DA890)' }}>
          <Sparkles className="w-4 h-4 text-white" />
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed pt-0.5">
          Nexus connaît votre compte et répond à partir de ce contexte réel.
          {ticket.ai_summary ? <span className="text-foreground/80 block mt-0.5">Résumé : {ticket.ai_summary}</span> : null}
        </p>
      </div>

      {/* Métadonnées : élément concerné + pièces jointes */}
      {(ticket.related_item_type !== 'none' || ticket.file_urls?.length > 0) && (
        <div className="rounded-2xl border border-border bg-secondary/30 p-3 mb-3 space-y-2.5">
          {ticket.related_item_type !== 'none' && ticket.related_item_type !== 'conversation' && relatedIcon && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              {(() => { const Ic = relatedIcon; return <Ic className="w-3.5 h-3.5 text-primary" />; })()}
              <span>Élément concerné : {ticket.related_item_label || ticket.related_item_id}</span>
            </div>
          )}
          {ticket.related_item_type === 'conversation' && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <MessageCircle className="w-3.5 h-3.5 text-primary" />
              <span>Discussion : {ticket.related_item_label}</span>
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
                  style={{ background: 'linear-gradient(135deg, #F37322, #1DA890)' }}>
                  {m.role === 'admin' ? <UserCog className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-white" />}
                </div>
              )}
              <div className={`max-w-[82%] rounded-2xl px-3.5 py-2.5 text-sm ${
                m.role === 'user'
                  ? 'rounded-tr-md text-white'
                  : m.role === 'admin'
                    ? 'bg-blue-500/15 border border-blue-400/20 rounded-tl-md'
                    : 'bg-card border border-border rounded-tl-md'
              }`}
                style={m.role === 'user' ? { background: '#0F172A' } : {}}>
                {m.role !== 'user' ? (
                  <div>
                    {m.role === 'assistant' && m.steps?.length > 0 && (
                      <>
                        <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.08em] text-muted-foreground mb-2">
                          <Search className="w-3 h-3 text-primary" /> Recherche Nexus
                        </div>
                        <AiSteps steps={m.steps} animate={i === messages.length - 1 && !sending} />
                        <div className="h-px bg-border my-2.5" />
                      </>
                    )}
                    <NexusMarkdown>{m.content}</NexusMarkdown>
                    {m.action && (m.action.status === 'executed' || m.action.status === 'failed') && (
                      <div className={`mt-2 flex items-center gap-1.5 text-[11px] ${m.action.status === 'executed' ? 'text-green-400' : 'text-red-400'}`}>
                        {m.action.status === 'executed' ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                        <span>{m.action.status === 'executed' ? 'Action effectuée' : 'Action échouée'} · {m.action.label || m.action.type}</span>
                      </div>
                    )}
                  </div>
                ) : <p style={{ whiteSpace: 'pre-wrap' }} className="leading-relaxed">{m.content}</p>}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {sending && (
          <div className="flex justify-start gap-2.5 items-start">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
              style={{ background: 'linear-gradient(135deg, #F37322, #1DA890)' }}>
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div className="bg-card border border-border rounded-2xl rounded-tl-md px-3.5 py-2.5 max-w-[82%]">
              <AiSteps steps={thinkingSteps} animate={true} />
            </div>
          </div>
        )}
        {nexusThinking && (
          <div className="flex justify-start gap-2.5 items-start">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
              style={{ background: 'linear-gradient(135deg, #F37322, #1DA890)' }}>
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div className="bg-card border border-border rounded-2xl rounded-tl-md px-3.5 py-2.5 max-w-[82%]">
              <AiSteps steps={thinkingSteps} animate={true} />
              <p className="text-[11px] text-muted-foreground mt-1">Nexus traite votre demande en direct…</p>
            </div>
          </div>
        )}
        {ticket.escalation_reason && (
          <div className="flex items-start gap-2 text-xs text-orange-300/90 pl-10 pt-1">
            <ShieldAlert className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
            <span>Escaladé : {ticket.escalation_reason}</span>
          </div>
        )}
        {!composerDisabled && !ticket.pending_action && (ticket.category === 'events' || ticket.related_item_type === 'event') && (
          <EventPickerCard ticket={ticket} onDone={load} />
        )}
        <PendingActionCard ticket={ticket} onDone={load} />
      </div>

      {/* Composer + états */}
      {isLocked && (
        <div className="rounded-2xl border border-amber-400/25 bg-amber-400/[0.06] p-3 flex items-center gap-2.5 sticky bottom-0">
          <Lock className="w-4 h-4 text-amber-300 flex-shrink-0" />
          <p className="text-xs text-amber-200/90">Cette conversation est verrouillée en attendant une confirmation de votre part.</p>
        </div>
      )}
      {isAiResolved && !isLocked && (
        <div className="rounded-2xl border border-primary/15 bg-primary/[0.05] p-2.5 text-center text-xs text-muted-foreground sticky bottom-0">
          Nexus a marqué ce ticket comme résolu · répondez si ce n'est pas réglé.
        </div>
      )}
      {isClosed && !isLocked && (
        <div className="rounded-2xl border border-border bg-card p-3 text-center text-xs text-muted-foreground sticky bottom-0">
          Ce ticket est fermé. <Link to="/support" className="text-primary hover:underline">Ouvrir un nouveau ticket</Link>
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