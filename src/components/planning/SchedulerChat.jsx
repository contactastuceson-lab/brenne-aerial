import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { Bot, Send, Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ReactMarkdown from 'react-markdown';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function SchedulerChat() {
  const [open, setOpen] = useState(false);
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);

  // Create conversation on first open, with user context + available slots
  useEffect(() => {
    if (!open || conversation) return;

    const init = async () => {
      // Fetch user and available slots in parallel
      const [user, allAppointments] = await Promise.all([
        base44.auth.me().catch(() => null),
        base44.entities.Appointment.list('-date', 200),
      ]);

      // Filter available slots (confirmed + no client_email)
      const available = allAppointments.filter(
        a => a.status === 'confirmed' && (!a.client_email || a.client_email.trim() === '')
      );

      // Build context message
      let contextMsg = '=== CONTEXTE SYSTÈME (ne pas afficher au client) ===\n\n';

      if (user) {
        contextMsg += `UTILISATEUR CONNECTÉ :\n- Nom : ${user.full_name || 'Non renseigné'}\n- Email : ${user.email}\n\nUtilise ces informations pour pré-remplir le nom et l'email lors d'une réservation, sans les redemander sauf si l'utilisateur veut les modifier.\n\n`;
      } else {
        contextMsg += `UTILISATEUR : Non connecté (invité).\n\n`;
      }

      if (available.length === 0) {
        contextMsg += `CRÉNEAUX DISPONIBLES : Aucun créneau disponible pour le moment.\n`;
      } else {
        contextMsg += `CRÉNEAUX DISPONIBLES (${available.length} au total) :\n`;
        available.forEach(a => {
          const dateLabel = format(new Date(a.date), 'EEEE d MMMM yyyy', { locale: fr });
          contextMsg += `- ID: ${a.id} | ${dateLabel} | ${a.time_start}${a.time_end ? ' → ' + a.time_end : ''}${a.service_type ? ' | ' + a.service_type : ''}${a.location ? ' | ' + a.location : ''}\n`;
        });
        contextMsg += `\nPour réserver un créneau, utilise l'ID correspondant pour mettre à jour l'Appointment.`;
      }

      const conv = await base44.agents.createConversation({
        agent_name: 'appointment_scheduler',
        metadata: { name: 'Planification RDV' },
      });

      // Send context as first system-like user message (hidden)
      await base44.agents.addMessage(conv, {
        role: 'user',
        content: contextMsg,
      });

      setConversation(conv);
      setMessages(conv.messages || []);
    };

    init();
  }, [open]);

  // Subscribe to real-time updates
  useEffect(() => {
    if (!conversation?.id) return;
    const unsub = base44.agents.subscribeToConversation(conversation.id, (data) => {
      setMessages(data.messages || []);
    });
    return unsub;
  }, [conversation?.id]);

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || !conversation || sending) return;
    const text = input.trim();
    setInput('');
    setSending(true);
    await base44.agents.addMessage(conversation, { role: 'user', content: text });
    setSending(false);
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const isStreaming = messages.length > 0 && messages[messages.length - 1]?.role === 'assistant' &&
    messages[messages.length - 1]?.status === 'streaming';

  return (
    <>
      {/* Floating toggle button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-20 md:bottom-6 right-4 md:right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 transition-all sky-glow font-inter text-sm font-semibold"
        >
          <Bot className="w-4 h-4" />
          Planifier avec l'IA
        </button>
      )}

      {/* Chat panel */}
      {open && (
        <div className="fixed bottom-20 md:bottom-6 right-2 md:right-6 z-50 w-[calc(100vw-16px)] md:w-[360px] max-h-[70vh] md:max-h-[600px] flex flex-col rounded-2xl border border-primary/30 bg-card shadow-2xl sky-glow overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-primary/10 border-b border-primary/20">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center">
                <Bot className="w-3.5 h-3.5 text-primary" />
              </div>
              <div>
                <p className="font-grotesk font-semibold text-sm">Assistant Planning</p>
                <p className="font-mono text-[10px] text-muted-foreground">Brenne Aerial · IA</p>
              </div>
            </div>
            <button onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0" style={{ maxHeight: '440px' }}>
            {!conversation && (
              <div className="flex justify-center py-8">
                <Loader2 className="w-5 h-5 text-primary animate-spin" />
              </div>
            )}
            {messages.filter(msg => !msg.content?.startsWith('=== CONTEXTE SYSTÈME')).map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-xl px-3 py-2 text-sm ${
                  msg.role === 'user'
                    ? 'bg-primary text-primary-foreground font-inter'
                    : 'bg-secondary border border-border font-inter'
                }`}>
                  {msg.role === 'assistant' ? (
                    <ReactMarkdown
                      className="prose prose-sm prose-invert max-w-none text-foreground [&>*:first-child]:mt-0 [&>*:last-child]:mb-0"
                      components={{
                        p: ({ children }) => <p className="my-1 text-sm leading-relaxed">{children}</p>,
                        ul: ({ children }) => <ul className="my-1 ml-4 list-disc text-sm">{children}</ul>,
                        li: ({ children }) => <li className="my-0.5">{children}</li>,
                        strong: ({ children }) => <strong className="text-primary font-semibold">{children}</strong>,
                      }}
                    >
                      {msg.content}
                    </ReactMarkdown>
                  ) : (
                    <p className="text-sm leading-relaxed">{msg.content}</p>
                  )}
                </div>
              </div>
            ))}
            {isStreaming && (
              <div className="flex justify-start">
                <div className="bg-secondary border border-border rounded-xl px-3 py-2">
                  <div className="flex gap-1 items-center h-4">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="p-3 border-t border-border flex gap-2">
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Décrivez votre besoin..."
              rows={1}
              disabled={!conversation || sending}
              className="flex-1 bg-secondary border border-border rounded-xl px-3 py-2 text-sm font-inter placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50"
              style={{ lineHeight: '1.4' }}
            />
            <Button
              size="icon"
              onClick={handleSend}
              disabled={!input.trim() || !conversation || sending}
              className="bg-primary text-primary-foreground flex-shrink-0 h-9 w-9"
            >
              {sending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
            </Button>
          </div>
        </div>
      )}
    </>
  );
}