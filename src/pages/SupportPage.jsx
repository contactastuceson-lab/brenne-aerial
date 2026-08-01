import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Send, Loader2, Ticket, CheckCircle2, Clock, AlertCircle, MessageSquare } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import ReactMarkdown from 'react-markdown';

const CATEGORY_LABELS = {
  account: 'Compte', billing: 'Facturation', credits: 'Crédits', bug: 'Bug',
  feature: ' Fonctionnalité', events: 'Événements', moderation: 'Modération', other: 'Autre',
};

const STATUS_META = {
  open: { label: 'Ouvert', icon: Clock, cls: 'text-amber-400 bg-amber-400/10 border-amber-400/20' },
  ai_resolved: { label: 'Résolu par IA', icon: CheckCircle2, cls: 'text-green-400 bg-green-400/10 border-green-400/20' },
  awaiting_human: { label: 'Escaladé', icon: AlertCircle, cls: 'text-orange-400 bg-orange-400/10 border-orange-400/20' },
  resolved: { label: 'Résolu', icon: CheckCircle2, cls: 'text-green-400 bg-green-400/10 border-green-400/20' },
  closed: { label: 'Fermé', icon: CheckCircle2, cls: 'text-muted-foreground bg-secondary border-border' },
};

const QUICK_TOPICS = [
  'Comment gagner des crédits Eza ?',
  'Je ne reçois pas l\'email de vérification',
  'Comment fonctionne le parrainage ?',
  'Signaler un contenu inapproprié',
  'Problème avec mon inscription à un événement',
];

export default function SupportPage() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [loadingList, setLoadingList] = useState(true);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [pendingReply, setPendingReply] = useState(null);
  const [openTicketId, setOpenTicketId] = useState(null);

  const loadTickets = useCallback(async () => {
    if (!user?.email) return;
    try {
      const list = await base44.entities.SupportTicket.filter(
        { user_email: user.email }, '-created_date', 30
      ).catch(() => []);
      setTickets(list || []);
    } finally {
      setLoadingList(false);
    }
  }, [user?.email]);

  useEffect(() => { loadTickets(); }, [loadTickets]);

  // Poll the just-created ticket to surface the IA reply
  useEffect(() => {
    if (!pendingReply) return;
    let stop = false;
    const t = setTimeout(async () => {
      try {
        const t2 = await base44.entities.SupportTicket.get(pendingReply).catch(() => null);
        if (!stop && t2) {
          setTickets((prev) => prev.map((tk) => tk.id === t2.id ? t2 : tk));
          if ((t2.messages || []).some((m) => m.role === 'assistant')) {
            setOpenTicketId(t2.id);
            setPendingReply(null);
          } else {
            setPendingReply(null);
          }
        }
      } catch {
        setPendingReply(null);
      }
    }, 4000);
    return () => { stop = true; clearTimeout(t); };
  }, [pendingReply]);

  const submit = async () => {
    const msg = message.trim();
    if (!msg || submitting) return;
    setSubmitting(true);
    const subj = subject.trim() || msg.slice(0, 60);
    try {
      const ticket = await base44.entities.SupportTicket.create({
        subject: subj,
        user_email: user.email,
        user_id: user.id,
        user_name: user.full_name || user.email,
        category: 'other',
        status: 'open',
        messages: [{ role: 'user', content: msg, at: new Date().toISOString() }],
      });
      setSubject(''); setMessage('');
      setTickets((prev) => [ticket, ...prev]);
      setPendingReply(ticket.id);
    } catch (e) {
      // ignore
    } finally {
      setSubmitting(false);
    }
  };

  const pickTopic = (t) => { setMessage(t); setSubject(t.split('?')[0].split(':')[0]); };

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 md:py-10">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, hsl(205 90% 48%), hsl(195 80% 40%))' }}>
          <Sparkles className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-grotesk font-bold">Support eza — Nexus IA</h1>
          <p className="text-sm text-muted-foreground">L'IA répond instantanément, 24h/24. Escalade humaine si besoin.</p>
        </div>
      </div>

      {/* Composer */}
      <div className="rounded-2xl border border-border bg-card p-4 mb-6">
        <input
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="Sujet (optionnel)"
          className="w-full bg-transparent text-sm font-medium mb-2 outline-none placeholder:text-muted-foreground/60"
        />
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Décrivez votre demande, votre problème, votre question…"
          rows={4}
          className="w-full bg-secondary/60 border border-border rounded-xl p-3 text-sm outline-none focus:ring-1 focus:ring-primary/40 resize-none"
        />
        <div className="flex flex-wrap gap-1.5 mt-3 mb-3">
          {QUICK_TOPICS.map((t) => (
          <button key={t} onClick={() => pickTopic(t)}
              className="text-xs px-2.5 py-1 rounded-full bg-secondary border border-border hover:border-primary/40 text-muted-foreground hover:text-foreground transition-colors">
              {t}
            </button>
          ))}
        </div>
        <button
          onClick={submit}
          disabled={!message.trim() || submitting}
          className="w-full h-11 rounded-xl flex items-center justify-center gap-2 font-semibold text-sm text-white disabled:opacity-40 transition-transform active:scale-[.98]"
          style={{ background: 'linear-gradient(135deg, hsl(205 90% 48%), hsl(195 80% 40%))' }}
        >
          {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          {submitting ? 'Transmission à Nexus…' : 'Envoyer à Nexus'}
        </button>
      </div>

      {/* Tickets */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-grotesk font-semibold flex items-center gap-2">
          <Ticket className="w-4 h-4 text-primary" /> Vos tickets
        </h2>
        {tickets.length > 0 && (
          <span className="text-xs text-muted-foreground">{tickets.length} ticket(s)</span>
        )}
      </div>

      {loadingList ? (
        <div className="text-center py-10 text-muted-foreground text-sm">
          <Loader2 className="w-5 h-5 mx-auto mb-2 animate-spin" /> Chargement…
        </div>
      ) : tickets.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-10 text-center">
          <MessageSquare className="w-8 h-8 mx-auto mb-3 text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">Aucun ticket pour l'instant. Posez votre première question ci-dessus 👆</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          <AnimatePresence>
            {tickets.map((tk) => {
              const meta = STATUS_META[tk.status] || STATUS_META.open;
              const SIcon = meta.icon;
              const isOpen = openTicketId === tk.id;
              const aiMsg = (tk.messages || []).find((m) => m.role === 'assistant');
              return (
                <motion.div key={tk.id} layout
                  className="rounded-2xl border border-border bg-card overflow-hidden">
                  <button onClick={() => setOpenTicketId(isOpen ? null : tk.id)}
                    className="w-full flex items-start gap-3 p-4 text-left">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 border ${meta.cls}`}>
                      <SIcon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{tk.subject}</p>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full border ${meta.cls}`}>{meta.label}</span>
                        <span className="text-[10px] text-muted-foreground">{CATEGORY_LABELS[tk.category] || '—'}</span>
                        {pendingReply === tk.id && (
                          <span className="text-[10px] text-primary flex items-center gap-1">
                            <Loader2 className="w-3 h-3 animate-spin" /> Nexus analyse…
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }}
                        className="overflow-hidden border-t border-border">
                        <div className="p-4 space-y-3">
                          {(tk.messages || []).map((m, i) => (
                            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                              <div className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm ${
                                m.role === 'user'
                                  ? 'text-primary-foreground rounded-tr-sm'
                                  : 'bg-secondary border border-border rounded-tl-sm'
                              }`}
                                style={m.role === 'user' ? { background: 'linear-gradient(135deg, hsl(205 90% 48%), hsl(195 80% 40%))' } : {}}>
                                {m.role !== 'user' ? (
                                  <ReactMarkdown components={{
                                    p: ({ children }) => <p className="mb-1 last:mb-0">{children}</p>,
                                    strong: ({ children }) => <strong className="font-semibold text-primary">{children}</strong>,
                                  }}>{m.content}</ReactMarkdown>
                                ) : <p style={{ whiteSpace: 'pre-wrap' }}>{m.content}</p>}
                              </div>
                            </div>
                          ))}
                          {!aiMsg && pendingReply !== tk.id && (
                            <p className="text-xs text-muted-foreground pl-1">Nexus prépare une réponse…</p>
                          )}
                          {tk.escalation_reason && (
                            <p className="text-xs text-orange-400/80 pl-1">Escalade : {tk.escalation_reason}</p>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}