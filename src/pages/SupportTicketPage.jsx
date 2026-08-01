import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, Send, Loader2, Ticket, CheckCircle2, Clock, AlertCircle,
  ArrowLeft, MessageSquare, Bot, User as UserIcon, Paperclip, Hash, MessageCircle, FileText,
} from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import ReactMarkdown from 'react-markdown';

const CATEGORY_LABELS = {
  account: 'Compte', billing: 'Facturation', credits: 'Crédits', bug: 'Bug',
  feature: 'Fonctionnalité', events: 'Événements', moderation: 'Modération', other: 'Autre',
};

const STATUS_META = {
  open: { label: 'Ouvert', icon: Clock, cls: 'text-amber-400 bg-amber-400/10 border-amber-400/20' },
  ai_resolved: { label: 'Résolu par IA', icon: CheckCircle2, cls: 'text-green-400 bg-green-400/10 border-green-400/20' },
  awaiting_human: { label: 'Escaladé', icon: AlertCircle, cls: 'text-orange-400 bg-orange-400/10 border-orange-400/20' },
  resolved: { label: 'Résolu', icon: CheckCircle2, cls: 'text-green-400 bg-green-400/10 border-green-400/20' },
  closed: { label: 'Fermé', icon: CheckCircle2, cls: 'text-muted-foreground bg-secondary border-border' },
};

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

  // Realtime : rafraîchir le ticket quand il change (réponse IA via automation)
  useEffect(() => {
    if (!id) return;
    const unsub = base44.entities.SupportTicket.subscribe((event) => {
      if (event?.id === id) load();
    });
    return () => { if (unsub) unsub(); };
  }, [id]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [ticket?.messages?.length, loading]);

  const sendReply = async () => {
    const msg = reply.trim();
    if (!msg || sending) return;
    setSending(true);
    // Optimistic : afficher immédiatement le message utilisateur
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
      <div className="max-w-2xl mx-auto px-4 py-16 text-center text-muted-foreground">
        <Loader2 className="w-6 h-6 mx-auto mb-3 animate-spin" />
        Chargement du ticket…
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <AlertCircle className="w-8 h-8 mx-auto mb-3 text-muted-foreground/50" />
        <p className="text-sm text-muted-foreground mb-4">{error || 'Ticket introuvable'}</p>
        <Link to="/support" className="text-primary text-sm hover:underline">← Retour au support</Link>
      </div>
    );
  }

  const meta = STATUS_META[ticket.status] || STATUS_META.open;
  const SIcon = meta.icon;
  const messages = ticket.messages || [];
  const isClosed = ticket.status === 'closed';

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 md:py-8 flex flex-col" style={{ minHeight: 'calc(100dvh - 4rem)' }}>
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <button onClick={() => navigate('/support')}
          className="w-9 h-9 rounded-xl flex items-center justify-center bg-secondary border border-border hover:border-primary/40 transition-colors flex-shrink-0">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-base font-grotesk font-bold truncate">{ticket.subject}</h1>
          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full border flex items-center gap-1 ${meta.cls}`}>
              <SIcon className="w-2.5 h-2.5" /> {meta.label}
            </span>
            <span className="text-[10px] text-muted-foreground">{CATEGORY_LABELS[ticket.category] || 'Autre'}</span>
            <span className="text-[10px] text-muted-foreground">#{String(ticket.id).slice(-6)}</span>
          </div>
        </div>
      </div>

      {/* IA context banner */}
      <div className="rounded-xl border border-primary/20 bg-primary/5 p-3 mb-4 flex items-start gap-2.5">
        <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: 'linear-gradient(135deg, hsl(205 90% 48%), hsl(195 80% 40%))' }}>
          <Sparkles className="w-3.5 h-3.5 text-white" />
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Nexus connaît votre compte (solde, abonnement, activité, parrainages) et répond à partir de ce contexte.
          {ticket.ai_summary ? <span className="text-foreground/80 block mt-1">Résumé : {ticket.ai_summary}</span> : null}
        </p>
      </div>

      {/* Métadonnées : élément concerné + pièces jointes */}
      {(ticket.related_item_type !== 'none' || ticket.file_urls?.length > 0) && (
        <div className="rounded-xl border border-border bg-secondary/30 p-3 mb-4 space-y-2">
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
          {ticket.file_urls?.length > 0 && (
            <div className="flex items-start gap-2">
              <Paperclip className="w-3.5 h-3.5 text-muted-foreground mt-0.5" />
              <div className="flex flex-wrap gap-1.5">
                {ticket.file_urls.map((u) => /\.(jpg|jpeg|png|gif|webp|svg)(\?|$)/i.test(u) ? (
                  <a key={u} href={u} target="_blank" rel="noreferrer" className="w-12 h-12 rounded-lg overflow-hidden border border-border">
                    <img src={u} alt="" className="w-full h-full object-cover" />
                  </a>
                ) : (
                  <a key={u} href={u} target="_blank" rel="noreferrer" className="w-12 h-12 rounded-lg border border-border bg-secondary flex items-center justify-center">
                    <FileText className="w-4 h-4 text-muted-foreground" />
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Conversation */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-3 pb-4 min-h-[200px]">
        {messages.length === 0 && (
          <p className="text-center text-sm text-muted-foreground py-8">Aucun message.</p>
        )}
        <AnimatePresence>
          {messages.map((m, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} gap-2`}>
              {m.role !== 'user' && (
                <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-1"
                  style={{ background: 'linear-gradient(135deg, hsl(205 90% 48%), hsl(195 80% 40%))' }}>
                  {m.role === 'admin' ? <UserIcon className="w-3.5 h-3.5 text-white" /> : <Bot className="w-3.5 h-3.5 text-white" />}
                </div>
              )}
              <div className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm ${
                m.role === 'user'
                  ? 'text-primary-foreground rounded-tr-sm'
                  : m.role === 'admin'
                    ? 'bg-blue-500/15 border border-blue-400/20 rounded-tl-sm'
                    : 'bg-secondary border border-border rounded-tl-sm'
              }`}
                style={m.role === 'user' ? { background: 'linear-gradient(135deg, hsl(205 90% 48%), hsl(195 80% 40%))' } : {}}>
                {m.role !== 'user' ? (
                  <ReactMarkdown components={{
                    p: ({ children }) => <p className="mb-1 last:mb-0">{children}</p>,
                    strong: ({ children }) => <strong className="font-semibold text-primary">{children}</strong>,
                    ul: ({ children }) => <ul className="list-disc pl-4 mb-1">{children}</ul>,
                    li: ({ children }) => <li className="mb-0.5">{children}</li>,
                  }}>{m.content}</ReactMarkdown>
                ) : <p style={{ whiteSpace: 'pre-wrap' }}>{m.content}</p>}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {sending && (
          <div className="flex justify-start gap-2 items-center">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, hsl(205 90% 48%), hsl(195 80% 40%))' }}>
              <Bot className="w-3.5 h-3.5 text-white" />
            </div>
            <div className="bg-secondary border border-border rounded-2xl rounded-tl-sm px-3.5 py-2.5">
              <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
            </div>
          </div>
        )}
        {ticket.escalation_reason && (
          <p className="text-xs text-orange-400/80 pl-9 pt-1">⚠ Escalade : {ticket.escalation_reason}</p>
        )}
      </div>

      {/* Composer */}
      {!isClosed && (
        <div className="rounded-2xl border border-border bg-card p-3 sticky bottom-0">
          <div className="flex items-end gap-2">
            <textarea
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendReply(); } }}
              placeholder="Répondre à Nexus…"
              rows={2}
              className="flex-1 bg-secondary/60 border border-border rounded-xl px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary/40 resize-none"
            />
            <button
              onClick={sendReply}
              disabled={!reply.trim() || sending}
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white disabled:opacity-40 transition-transform active:scale-95 flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, hsl(205 90% 48%), hsl(195 80% 40%))' }}
            >
              {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}