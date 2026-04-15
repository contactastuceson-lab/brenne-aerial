import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import ReactMarkdown from 'react-markdown';
import {
  Sparkles, Send, Loader2, RotateCcw, ChevronDown, ChevronRight,
  Terminal, CheckCircle2, AlertCircle, Zap, Users, BarChart3,
  FileText, Megaphone, Mail, Flag
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const QUICK_ACTIONS = [
  { icon: BarChart3, label: 'Stats plateforme', msg: 'Donne-moi les statistiques complètes de la plateforme.' },
  { icon: Users, label: 'Liste des admins', msg: 'Liste tous les utilisateurs qui ont un rôle admin ou supérieur.' },
  { icon: FileText, label: 'Devis en attente', msg: 'Montre-moi tous les devis en attente de traitement.' },
  { icon: Flag, label: 'Signalements', msg: 'Liste les signalements en attente.' },
  { icon: Megaphone, label: 'Créer annonce', msg: 'Je veux créer une nouvelle annonce pour tous les utilisateurs.' },
  { icon: Mail, label: 'Email direction', msg: 'Je veux envoyer un email officiel de la direction.' },
];

function ToolResultDisplay({ tool, result }) {
  const [expanded, setExpanded] = useState(false);
  const isArray = Array.isArray(result);
  const count = isArray ? result.length : null;

  return (
    <div className="mt-2 rounded-lg border border-primary/20 bg-primary/5 overflow-hidden">
      <button
        onClick={() => setExpanded(p => !p)}
        className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-primary/10 transition-colors"
      >
        <Terminal className="w-3.5 h-3.5 text-primary flex-shrink-0" />
        <span className="font-mono text-xs text-primary flex-1">
          ⚙️ {tool}{count !== null ? ` → ${count} résultat${count > 1 ? 's' : ''}` : ' → OK'}
        </span>
        {expanded
          ? <ChevronDown className="w-3 h-3 text-muted-foreground" />
          : <ChevronRight className="w-3 h-3 text-muted-foreground" />
        }
      </button>
      {expanded && (
        <pre className="px-3 pb-3 font-mono text-[10px] text-muted-foreground overflow-auto max-h-48 leading-relaxed">
          {JSON.stringify(result, null, 2)}
        </pre>
      )}
    </div>
  );
}

function MessageBubble({ msg }) {
  const isUser = msg.role === 'user';
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      {!isUser && (
        <div className="w-8 h-8 rounded-xl flex-shrink-0 flex items-center justify-center mt-1"
          style={{ background: 'linear-gradient(135deg,#92400e,#d97706)', boxShadow: '0 0 12px rgba(245,158,11,0.3)' }}>
          <Sparkles className="w-4 h-4 text-yellow-100" />
        </div>
      )}
      <div className={`max-w-[80%] ${isUser ? 'flex flex-col items-end' : ''}`}>
        {msg.content && (
          <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
            isUser
              ? 'text-white rounded-tr-sm'
              : 'bg-card border border-border rounded-tl-sm'
          }`}
            style={isUser ? { background: 'linear-gradient(135deg,#92400e,#b45309)' } : {}}>
            {isUser
              ? <p>{msg.content}</p>
              : <ReactMarkdown
                  components={{
                    p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                    strong: ({ children }) => <strong className="font-semibold text-yellow-400">{children}</strong>,
                    ul: ({ children }) => <ul className="ml-4 list-disc space-y-0.5 my-1">{children}</ul>,
                    li: ({ children }) => <li className="text-xs text-muted-foreground">{children}</li>,
                    code: ({ children, className }) => {
                      const isBlock = className?.includes('language-');
                      return isBlock
                        ? <pre className="bg-black/40 rounded-lg p-3 font-mono text-xs overflow-auto my-2"><code>{children}</code></pre>
                        : <code className="bg-black/30 rounded px-1 font-mono text-xs text-yellow-300">{children}</code>;
                    },
                  }}
                >
                  {msg.content}
                </ReactMarkdown>
            }
          </div>
        )}
        {/* Tool result display */}
        {msg.tool_result && (
          <ToolResultDisplay tool={msg.tool_name || 'tool'} result={msg.tool_result} />
        )}
        {/* Loading tool indicator */}
        {msg.loading_tool && (
          <div className="mt-2 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/20">
            <Loader2 className="w-3 h-3 text-primary animate-spin" />
            <span className="font-mono text-xs text-primary">Exécution de {msg.loading_tool}...</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default function PDGAIAgent() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `Bonjour 👑 Je suis **NEXUS**, votre IA Super Admin.\n\nJ'ai un accès complet à la plateforme Brenne Aerial : utilisateurs, rôles, devis, annonces, emails, statistiques et plus encore.\n\nQue souhaitez-vous faire ?`,
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (text) => {
    const content = (text || input).trim();
    if (!content || loading) return;
    setInput('');
    setLoading(true);

    const userMsg = { role: 'user', content };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);

    // Convert messages to format for API (skip tool_result metadata)
    const apiMessages = updatedMessages.map(m => ({
      role: m.role,
      content: m.content || '',
    })).filter(m => m.content);

    try {
      const res = await base44.functions.invoke('pdgAIAgent', { messages: apiMessages });
      const data = res.data;

      if (data.error) {
        setMessages(p => [...p, { role: 'assistant', content: `❌ Erreur : ${data.error}` }]);
        setLoading(false);
        return;
      }

      // If there's a tool call that was already executed
      if (data.tool_call && data.tool_result !== undefined) {
        const aiMsgWithTool = {
          role: 'assistant',
          content: data.content,
          tool_name: data.tool_call.tool,
          tool_result: data.tool_result,
        };
        setMessages(p => [...p, aiMsgWithTool]);

        // Now ask the AI to interpret the result
        const messagesWithTool = [
          ...apiMessages,
          { role: 'assistant', content: data.content || '' },
        ];

        const res2 = await base44.functions.invoke('pdgAIAgent', {
          messages: messagesWithTool,
          tool_result: { tool: data.tool_call.tool, result: data.tool_result },
        });

        const data2 = res2.data;
        if (data2.content) {
          setMessages(p => [...p, { role: 'assistant', content: data2.content }]);
        }
      } else {
        setMessages(p => [...p, { role: 'assistant', content: data.content }]);
      }
    } catch (err) {
      setMessages(p => [...p, { role: 'assistant', content: `❌ Erreur de connexion : ${err.message}` }]);
    }

    setLoading(false);
  };

  const reset = () => {
    setMessages([{
      role: 'assistant',
      content: 'Conversation réinitialisée. Comment puis-je vous aider ?',
    }]);
  };

  return (
    <div className="flex flex-col h-full rounded-2xl border overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, hsl(214 45% 5%), hsl(214 40% 7%))',
        borderColor: 'rgba(245,158,11,0.2)',
        boxShadow: '0 0 40px rgba(245,158,11,0.05)',
        minHeight: '600px',
        maxHeight: 'calc(100vh - 260px)',
      }}>

      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-3.5 border-b flex-shrink-0"
        style={{ borderColor: 'rgba(245,158,11,0.15)', background: 'linear-gradient(90deg,rgba(146,64,14,0.15),transparent)' }}>
        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: 'linear-gradient(135deg,#92400e,#d97706)', boxShadow: '0 0 16px rgba(245,158,11,0.4)' }}>
          <Sparkles className="w-4.5 h-4.5 text-yellow-100" />
        </div>
        <div className="flex-1">
          <p className="font-grotesk font-bold text-sm text-yellow-200">NEXUS — IA Super Admin</p>
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            <p className="font-mono text-[10px] text-green-400">Accès complet plateforme • Réservé Direction</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="flex items-center gap-1 bg-yellow-500/10 border border-yellow-500/20 rounded-lg px-2 py-1">
            <Zap className="w-3 h-3 text-yellow-400" />
            <span className="font-mono text-[10px] text-yellow-400">claude sonnet</span>
          </div>
          <button onClick={reset} title="Réinitialiser"
            className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground">
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Quick actions */}
      {messages.length <= 1 && (
        <div className="px-4 pt-4 pb-2 flex-shrink-0">
          <p className="font-mono text-[9px] text-yellow-500/60 uppercase tracking-widest mb-2">Actions rapides</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
            {QUICK_ACTIONS.map(({ icon: Icon, label, msg }) => (
              <button key={label} onClick={() => sendMessage(msg)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-left border transition-all text-xs font-inter hover:border-yellow-500/30 hover:bg-yellow-500/5"
                style={{ borderColor: 'rgba(245,158,11,0.15)', background: 'rgba(146,64,14,0.08)' }}>
                <Icon className="w-3.5 h-3.5 text-yellow-500/70 flex-shrink-0" />
                <span className="text-muted-foreground truncate">{label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
        {messages.map((msg, i) => <MessageBubble key={i} msg={msg} />)}

        {/* Loading */}
        {loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3 justify-start">
            <div className="w-8 h-8 rounded-xl flex-shrink-0 flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg,#92400e,#d97706)' }}>
              <Sparkles className="w-4 h-4 text-yellow-100" />
            </div>
            <div className="bg-card border border-border rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-2">
              {[0, 1, 2].map(i => (
                <motion.div key={i} className="w-2 h-2 rounded-full bg-yellow-500/50"
                  animate={{ y: [0, -5, 0], opacity: [0.4, 1, 0.4] }}
                  transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }} />
              ))}
            </div>
          </motion.div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-4 py-3 border-t flex gap-2 flex-shrink-0"
        style={{ borderColor: 'rgba(245,158,11,0.15)', background: 'rgba(0,0,0,0.2)' }}>
        <input
          ref={inputRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
          placeholder="Ex: Mets Jean Dupont en admin, montre-moi les devis pending..."
          className="flex-1 bg-secondary/50 border rounded-xl px-4 py-2.5 text-sm font-inter placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 transition-all"
          style={{ borderColor: 'rgba(245,158,11,0.2)' }}
          onFocus={e => e.target.style.borderColor = 'rgba(245,158,11,0.5)'}
          onBlur={e => e.target.style.borderColor = 'rgba(245,158,11,0.2)'}
        />
        <button
          onClick={() => sendMessage()}
          disabled={!input.trim() || loading}
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 disabled:opacity-30 transition-all hover:scale-105 active:scale-95"
          style={{ background: 'linear-gradient(135deg,#92400e,#d97706)' }}
        >
          {loading
            ? <Loader2 className="w-4 h-4 text-yellow-100 animate-spin" />
            : <Send className="w-4 h-4 text-yellow-100" />
          }
        </button>
      </div>

      <div className="px-4 pb-2 flex-shrink-0 text-center">
        <p className="font-mono text-[9px] text-muted-foreground/30">
          NEXUS utilise Claude Sonnet — Actions irréversibles possibles — Usage Direction uniquement
        </p>
      </div>
    </div>
  );
}