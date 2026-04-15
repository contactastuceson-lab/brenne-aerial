import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Loader2, Bot, ChevronRight } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';

const KNOWLEDGE_BASE = `
Tu es l'assistant virtuel de Brenne Aerial, une entreprise de drone professionnelle.

SERVICES PROPOSÉS :
1. Vidéo événementielle (mariages, anniversaires, événements d'entreprise) — à partir de 350€
2. Inspection de toiture & chantier — analyse précise depuis les airs, rapport photo/vidéo HD — à partir de 200€
3. Captation immobilière — mise en valeur de biens résidentiels et commerciaux — à partir de 250€
4. Suivi de chantier — documentation régulière de l'avancement — sur devis
5. Retour en temps réel — transmission live pour événements — sur devis
6. Flash Delivery — livraison de fichiers sous 24h — option disponible

TARIFS INDICATIFS :
- Prestation 1h : à partir de 200€
- Prestation 2-3h : à partir de 350€
- Demi-journée : à partir de 550€
- Journée complète : à partir de 900€
- Multi-jours : sur devis

ZONE D'INTERVENTION : France entière (Pays de la Loire, Bretagne, Centre-Val-de-Loire, et toute la France)

DÉLAIS : Réponse sous 48h après demande de devis. Intervention possible sous 5 jours ouvrés.

RÉGLEMENTATIONS : Brenne Aerial est certifiée DGAC, opère en conformité totale avec la réglementation européenne EASA. Toutes les autorisations nécessaires sont gérées par notre équipe.

CONTACT :
- Page de contact : /contact
- Demande de devis : /quote
- Planning : /planning
- Portfolio : /portfolio
- Blog : /blog

ESPACE CLIENT :
- Accès aux fichiers livrés : /espace-client
- Check-up toiture gratuit (IA) : /toiture-checkup
- Programme de parrainage : /parrainage
- Annuaire partenaires : /partenaires

Réponds en français, de façon concise et amicale. Si l'utilisateur est intéressé par une prestation, encourage-le à remplir un devis. Ne dépasse jamais 3-4 phrases par réponse. Propose un lien pertinent à la fin si possible.
`;

const SUGGESTED = [
  "Quels sont vos tarifs ?",
  "Inspection de toiture ?",
  "Zones d'intervention ?",
  "Délai de livraison ?",
  "Comment obtenir un devis ?",
];

function ChatMessage({ msg }) {
  const isBot = msg.role === 'assistant';
  return (
    <div className={`flex gap-2 ${isBot ? 'justify-start' : 'justify-end'}`}>
      {isBot && (
        <div className="w-7 h-7 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
          <Bot className="w-3.5 h-3.5 text-primary" />
        </div>
      )}
      <div className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
        isBot
          ? 'bg-card border border-border text-foreground rounded-tl-sm'
          : 'bg-primary text-primary-foreground rounded-tr-sm'
      }`}>
        <p style={{ whiteSpace: 'pre-wrap' }}>{msg.content}</p>
        {msg.link && (
          <Link to={msg.link.href}
            className="mt-2 flex items-center gap-1 text-xs font-semibold underline underline-offset-2 opacity-80 hover:opacity-100">
            {msg.link.label} <ChevronRight className="w-3 h-3" />
          </Link>
        )}
      </div>
    </div>
  );
}

export default function ChatbotWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Bonjour ! 👋 Je suis l\'assistant Brenne Aerial. Comment puis-je vous aider ? Tarifs, services, devis… posez-moi vos questions !' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    if (open && bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, open]);

  const send = async (text) => {
    const content = text || input.trim();
    if (!content || loading) return;
    setInput('');
    const userMsg = { role: 'user', content };
    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setLoading(true);

    // Build conversation history for context
    const history = nextMessages.map(m => `${m.role === 'user' ? 'Client' : 'Assistant'}: ${m.content}`).join('\n');

    const prompt = `${KNOWLEDGE_BASE}\n\n--- HISTORIQUE DE CONVERSATION ---\n${history}\n\nAssistant:`;

    const response = await base44.integrations.Core.InvokeLLM({ prompt });
    const botMsg = { role: 'assistant', content: response };

    // Detect link to inject
    let link = null;
    if (/devis|tarif|prix|quote/i.test(content)) link = { href: '/quote', label: 'Faire une demande de devis' };
    else if (/portfolio|réalisation|exemple/i.test(content)) link = { href: '/portfolio', label: 'Voir le portfolio' };
    else if (/toiture|inspection|toit/i.test(content)) link = { href: '/toiture-checkup', label: 'Check-up toiture gratuit' };
    else if (/contact|appel|téléphone|mail/i.test(content)) link = { href: '/contact', label: 'Nous contacter' };

    if (link) botMsg.link = link;
    setMessages(p => [...p, botMsg]);
    setLoading(false);
  };

  return (
    <>
      {/* Floating button */}
      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.7 }}
        className="fixed bottom-6 left-6 z-40"
      >
        <motion.button
          whileHover={{ scale: 1.15 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setOpen(p => !p)}
          className="relative w-14 h-14 rounded-full shadow-lg hover:shadow-xl transition-shadow flex items-center justify-center group"
          style={{ background: 'linear-gradient(135deg, hsl(205 90% 50%), hsl(195 80% 42%))' }}
        >
          <AnimatePresence mode="wait">
            {open
              ? <motion.div key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}>
                  <X className="w-6 h-6 text-white" />
                </motion.div>
              : <motion.div key="chat" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}>
                  <MessageCircle className="w-6 h-6 text-white" />
                </motion.div>
            }
          </AnimatePresence>
          {/* Pulse ring */}
          {!open && (
            <motion.div
              animate={{ scale: [1, 1.3], opacity: [0.6, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute inset-0 rounded-full border-2 border-primary"
            />
          )}
          {/* Tooltip */}
          {!open && (
            <div className="absolute bottom-full left-0 mb-3 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              <div className="bg-background border border-border rounded-lg px-3 py-1.5 text-xs font-semibold whitespace-nowrap">
                Assistance IA
                <div className="absolute top-full left-3 w-0 h-0 border-l-[6px] border-r-[6px] border-t-[6px] border-l-transparent border-r-transparent border-t-border" />
              </div>
            </div>
          )}
        </motion.button>
      </motion.div>

      {/* Chat window */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 28 }}
            className="fixed bottom-24 left-6 z-50 w-[340px] sm:w-[380px] flex flex-col rounded-2xl overflow-hidden shadow-2xl"
            style={{
              background: 'hsl(var(--card))',
              border: '1px solid hsl(var(--primary) / 0.2)',
              maxHeight: '70vh',
            }}
          >
            {/* Header */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-border flex-shrink-0"
              style={{ background: 'linear-gradient(90deg, hsl(205 90% 50% / 0.12), hsl(195 80% 42% / 0.08))' }}>
              <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                <Bot className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="font-grotesk font-bold text-sm">Assistant Brenne Aerial</p>
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
                  <p className="font-mono text-[10px] text-muted-foreground">En ligne · Propulsé par IA</p>
                </div>
              </div>
              <button onClick={() => setOpen(false)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-secondary transition-colors">
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
              {messages.map((msg, i) => <ChatMessage key={i} msg={msg} />)}
              {loading && (
                <div className="flex gap-2 justify-start">
                  <div className="w-7 h-7 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                    <Bot className="w-3.5 h-3.5 text-primary" />
                  </div>
                  <div className="bg-card border border-border rounded-2xl rounded-tl-sm px-3.5 py-2.5 flex items-center gap-1.5">
                    {[0, 1, 2].map(i => (
                      <motion.div key={i} className="w-1.5 h-1.5 rounded-full bg-primary/60"
                        animate={{ y: [0, -4, 0] }} transition={{ duration: 0.7, repeat: Infinity, delay: i * 0.15 }} />
                    ))}
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Suggestions */}
            {messages.length <= 1 && (
              <div className="px-3 pb-2 flex gap-1.5 flex-wrap flex-shrink-0">
                {SUGGESTED.map(s => (
                  <button key={s} onClick={() => send(s)}
                    className="text-[11px] font-inter px-2.5 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary hover:bg-primary/20 transition-colors">
                    {s}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <div className="px-3 py-3 border-t border-border flex gap-2 flex-shrink-0">
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
                placeholder="Votre question…"
                className="flex-1 bg-secondary border border-border rounded-xl px-3 py-2 text-sm font-inter placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"
              />
              <button
                onClick={() => send()}
                disabled={!input.trim() || loading}
                className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center flex-shrink-0 hover:bg-primary/90 disabled:opacity-40 transition-colors"
              >
                {loading ? <Loader2 className="w-4 h-4 text-primary-foreground animate-spin" /> : <Send className="w-4 h-4 text-primary-foreground" />}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}