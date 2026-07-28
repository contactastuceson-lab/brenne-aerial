import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import ReactMarkdown from 'react-markdown';
import {
  Sparkles, Send, Loader2, ChevronDown, ChevronRight,
  Terminal, Zap, Users, BarChart3, FileText, Megaphone, Mail, Flag,
  Plus, Trash2, MessageSquare, Clock
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const QUICK_ACTIONS = [
  { icon: BarChart3, label: 'Stats plateforme', msg: 'Donne-moi les statistiques complètes de la plateforme.' },
  { icon: Users, label: 'Liste des admins', msg: 'Liste tous les utilisateurs qui ont un rôle admin ou supérieur.' },
  { icon: FileText, label: 'Devis en attente', msg: 'Montre-moi tous les devis en attente de traitement.' },
  { icon: Flag, label: 'Signalements', msg: 'Liste les signalements en attente.' },
  { icon: Megaphone, label: 'Créer annonce', msg: 'Je veux créer une nouvelle annonce pour tous les utilisateurs.' },
  { icon: Mail, label: 'Email direction', msg: 'Je veux envoyer un email officiel de la direction.' },
];

// Shared NEXUS accent (refined amber, restrained)
const accent = '#f59e0b';
const accentSoft = 'rgba(245,158,11,0.08)';

function ToolResultDisplay({ tool, result }) {
  const [expanded, setExpanded] = useState(false);
  const isArray = Array.isArray(result);
  const count = isArray ? result.length : null;
  return (
    <div className="mt-2.5 rounded-xl border border-border bg-card/40 overflow-hidden">
      <button onClick={() => setExpanded(p => !p)}
        className="w-full flex items-center gap-2.5 px-3.5 py-2 text-left hover:bg-secondary/40 transition-colors">
        <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ background: accentSoft }}>
          <Terminal className="w-3 h-3 flex-shrink-0" style={{ color: accent }} />
        </div>
        <span className="font-mono text-xs text-muted-foreground flex-1 truncate">
          <span style={{ color: accent }}>{tool}</span>
          {count !== null ? ` · ${count} résultat${count > 1 ? 's' : ''}` : ' · OK'}
        </span>
        {expanded
          ? <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
          : <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />}
      </button>
      {expanded && (
        <div className="border-t border-border">
          <pre className="px-3.5 py-3 font-mono text-[11px] text-muted-foreground overflow-auto max-h-56 leading-relaxed bg-black/20">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}

function MarkdownTable({ children }) {
  return (
    <div className="my-3 overflow-x-auto rounded-xl border border-border bg-card/40">
      <table className="w-full text-[11px] font-inter border-collapse">
        {children}
      </table>
    </div>
  );
}

function MessageBubble({ msg }) {
  const isUser = msg.role === 'user';
  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={`flex gap-2.5 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <div className="w-7 h-7 rounded-lg flex-shrink-0 flex items-center justify-center mt-0.5"
          style={{ background: accentSoft, border: `1px solid ${accent}33` }}>
          <Sparkles className="w-3.5 h-3.5" style={{ color: accent }} />
        </div>
      )}
      <div className={`max-w-[82%] ${isUser ? 'flex flex-col items-end' : ''}`}>
        {msg.content && (
          <div className={`rounded-2xl px-4 py-2.5 text-[13px] leading-relaxed ${
            isUser
              ? 'text-white rounded-br-md'
              : 'bg-card border border-border text-card-foreground rounded-bl-md'
          }`} style={isUser ? { background: accentSoft, border: `1px solid ${accent}55`, color: '#fef3c7' } : {}}>
            {isUser
              ? <p className="whitespace-pre-wrap">{msg.content}</p>
              : <div className="prose-nexus">
                  <ReactMarkdown components={{
                    p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                    h1: ({ children }) => <h3 className="text-sm font-semibold mb-2 mt-1 text-foreground">{children}</h3>,
                    h2: ({ children }) => <h4 className="text-sm font-semibold mb-2 mt-1 text-foreground">{children}</h4>,
                    h3: ({ children }) => <h5 className="text-[13px] font-semibold mb-1.5 mt-1 text-foreground">{children}</h5>,
                    strong: ({ children }) => <strong className="font-semibold" style={{ color: accent }}>{children}</strong>,
                    ul: ({ children }) => <ul className="ml-4 list-disc space-y-0.5 my-1.5 text-muted-foreground">{children}</ul>,
                    ol: ({ children }) => <ol className="ml-4 list-decimal space-y-0.5 my-1.5 text-muted-foreground">{children}</ol>,
                    li: ({ children }) => <li className="text-[13px]">{children}</li>,
                    table: MarkdownTable,
                    thead: ({ children }) => <thead className="bg-secondary/50">{children}</thead>,
                    th: ({ children }) => <th className="text-left font-semibold px-3 py-2 border-b border-border text-foreground whitespace-nowrap">{children}</th>,
                    td: ({ children }) => <td className="px-3 py-1.5 border-b border-border/50 text-muted-foreground align-top">{children}</td>,
                    code: ({ children, className }) => {
                      const isBlock = className?.includes('language-');
                      return isBlock
                        ? <pre className="bg-black/40 rounded-lg p-3 font-mono text-[11px] overflow-auto my-2 border border-border"><code>{children}</code></pre>
                        : <code className="bg-secondary/60 rounded px-1 py-0.5 font-mono text-[11px]" style={{ color: accent }}>{children}</code>;
                    },
                    blockquote: ({ children }) => <blockquote className="border-l-2 pl-3 my-2 italic text-muted-foreground" style={{ borderColor: accent }}>{children}</blockquote>,
                  }}>{msg.content}</ReactMarkdown>
                </div>
            }
          </div>
        )}
        {msg.tool_result && <ToolResultDisplay tool={msg.tool_name || 'tool'} result={msg.tool_result} />}
      </div>
    </motion.div>
  );
}

// ─── Chat panel for a single conversation ───────────────────────────────────
function ChatPanel({ conversation, onUpdate }) {
  const [messages, setMessages] = useState(conversation.messages || []);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const isNew = messages.length === 0;

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const saveMessages = async (newMessages) => {
    const firstUserMsg = newMessages.find(m => m.role === 'user');
    const title = firstUserMsg
      ? firstUserMsg.content.slice(0, 60) + (firstUserMsg.content.length > 60 ? '…' : '')
      : conversation.title;
    await base44.entities.NexusConversation.update(conversation.id, {
      messages: newMessages,
      title,
      last_message_at: new Date().toISOString(),
    });
    onUpdate({ ...conversation, messages: newMessages, title });
  };

  const sendMessage = async (text) => {
    const content = (text || input).trim();
    if (!content || loading) return;
    setInput('');
    setLoading(true);

    const userMsg = { role: 'user', content };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);

    const apiMessages = newMessages.map(m => ({ role: m.role, content: m.content || '' })).filter(m => m.content);

    try {
      const res = await base44.functions.invoke('pdgAIAgent', { messages: apiMessages });
      const data = res.data;

      if (data.error) {
        const errMsg = { role: 'assistant', content: `❌ Erreur : ${data.error}` };
        const updated = [...newMessages, errMsg];
        setMessages(updated);
        await saveMessages(updated);
        setLoading(false);
        return;
      }

      if (data.tool_call && data.tool_result !== undefined) {
        const aiMsgWithTool = { role: 'assistant', content: data.content, tool_name: data.tool_call.tool, tool_result: data.tool_result };
        const withTool = [...newMessages, aiMsgWithTool];
        setMessages(withTool);

        const messagesForFollowup = [...apiMessages, { role: 'assistant', content: data.content || '' }];
        const res2 = await base44.functions.invoke('pdgAIAgent', { messages: messagesForFollowup, tool_result: { tool: data.tool_call.tool, result: data.tool_result } });
        const data2 = res2.data;
        if (data2.content) {
          const finalMsg = { role: 'assistant', content: data2.content };
          const final = [...withTool, finalMsg];
          setMessages(final);
          await saveMessages(final);
        } else {
          await saveMessages(withTool);
        }
      } else {
        const aiMsg = { role: 'assistant', content: data.content };
        const updated = [...newMessages, aiMsg];
        setMessages(updated);
        await saveMessages(updated);
      }
    } catch (err) {
      const errMsg = { role: 'assistant', content: `❌ Erreur : ${err.message}` };
      const updated = [...newMessages, errMsg];
      setMessages(updated);
      await saveMessages(updated);
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-5 space-y-4 min-h-0">
        {isNew && (
          <div className="text-center py-8 max-w-xl mx-auto">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
              style={{ background: accentSoft, border: `1px solid ${accent}33` }}>
              <Sparkles className="w-7 h-7" style={{ color: accent }} />
            </div>
            <p className="font-grotesk font-bold text-base text-foreground mb-1">NEXUS</p>
            <p className="font-inter text-xs text-muted-foreground">IA Super Admin · Nouvelle conversation. Que souhaitez-vous faire ?</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-6">
              {QUICK_ACTIONS.map(({ icon: Icon, label, msg }) => (
                <button key={label} onClick={() => sendMessage(msg)}
                  className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left border border-border bg-card/40 transition-all text-xs font-inter hover:border-primary/30 hover:bg-secondary/40">
                  <Icon className="w-4 h-4 flex-shrink-0" style={{ color: accent }} />
                  <span className="text-muted-foreground truncate">{label}</span>
                </button>
              ))}
            </div>
          </div>
        )}
        {messages.map((msg, i) => <MessageBubble key={i} msg={msg} />)}
        {loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-2.5 justify-start">
            <div className="w-7 h-7 rounded-lg flex-shrink-0 flex items-center justify-center mt-0.5"
              style={{ background: accentSoft, border: `1px solid ${accent}33` }}>
              <Sparkles className="w-3.5 h-3.5" style={{ color: accent }} />
            </div>
            <div className="bg-card border border-border rounded-2xl rounded-bl-md px-4 py-3 flex items-center gap-1.5">
              {[0, 1, 2].map(i => (
                <motion.div key={i} className="w-1.5 h-1.5 rounded-full"
                  style={{ background: accent }}
                  animate={{ y: [0, -4, 0], opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }} />
              ))}
            </div>
          </motion.div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-4 py-3 border-t border-border flex gap-2 flex-shrink-0 bg-card/30">
        <input ref={inputRef} value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
          placeholder="Ex : Mets Jean Dupont en admin, montre-moi les devis pending…"
          className="flex-1 bg-background/60 border border-border rounded-xl px-4 py-2.5 text-sm font-inter placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all"
        />
        <button onClick={() => sendMessage()} disabled={!input.trim() || loading}
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 disabled:opacity-30 disabled:cursor-not-allowed transition-all hover:scale-105 active:scale-95"
          style={{ background: `linear-gradient(135deg,${accent},${accent}cc)` }}>
          {loading ? <Loader2 className="w-4 h-4 text-white animate-spin" /> : <Send className="w-4 h-4 text-white" />}
        </button>
      </div>
    </div>
  );
}

// ─── Main component ──────────────────────────────────────────────────────────
export default function PDGAIAgent() {
  const qc = useQueryClient();
  const [activeId, setActiveId] = useState(null);

  const { data: conversations = [], isLoading } = useQuery({
    queryKey: ['nexus-conversations'],
    queryFn: () => base44.entities.NexusConversation.list('-last_message_at'),
  });

  const createMutation = useMutation({
    mutationFn: () => base44.entities.NexusConversation.create({
      title: 'Nouvelle conversation',
      messages: [],
      last_message_at: new Date().toISOString(),
    }),
    onSuccess: (conv) => {
      qc.invalidateQueries({ queryKey: ['nexus-conversations'] });
      setActiveId(conv.id);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.NexusConversation.delete(id),
    onSuccess: (_, id) => {
      qc.invalidateQueries({ queryKey: ['nexus-conversations'] });
      if (activeId === id) setActiveId(null);
      toast.success('Conversation supprimée');
    },
  });

  useEffect(() => {
    if (!activeId && conversations.length > 0) setActiveId(conversations[0].id);
  }, [conversations, activeId]);

  const activeConv = conversations.find(c => c.id === activeId);

  const handleUpdate = (updated) => {
    qc.setQueryData(['nexus-conversations'], (old) =>
      old?.map(c => c.id === updated.id ? updated : c) || []
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 rounded-2xl border border-border overflow-hidden bg-card/20"
      style={{ height: 'calc(100vh - 280px)', minHeight: '500px' }}>

      {/* ── Sidebar: conversation list ── */}
      <div className="w-60 flex-shrink-0 flex flex-col border-r border-border bg-sidebar/40">

        {/* Header sidebar */}
        <div className="px-3.5 py-3 border-b border-border flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: accentSoft, border: `1px solid ${accent}33` }}>
              <MessageSquare className="w-3 h-3" style={{ color: accent }} />
            </div>
            <span className="font-grotesk font-bold text-xs text-foreground">Historique</span>
          </div>
          <button onClick={() => createMutation.mutate()} disabled={createMutation.isPending}
            title="Nouvelle conversation"
            className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-secondary/60 border border-border transition-colors">
            {createMutation.isPending
              ? <Loader2 className="w-3.5 h-3.5 text-muted-foreground animate-spin" />
              : <Plus className="w-3.5 h-3.5" style={{ color: accent }} />}
          </button>
        </div>

        {/* Conversations list */}
        <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
          {conversations.length === 0 && (
            <div className="text-center py-8">
              <p className="font-inter text-xs text-muted-foreground">Aucune conversation</p>
              <button onClick={() => createMutation.mutate()}
                className="mt-3 text-xs font-inter hover:opacity-80 underline underline-offset-2"
                style={{ color: accent }}>
                Créer la première
              </button>
            </div>
          )}
          {conversations.map(conv => (
            <div key={conv.id}
              className={`group flex items-start gap-2 px-2.5 py-2 rounded-lg cursor-pointer transition-all ${
                activeId === conv.id
                  ? 'bg-secondary/60 border border-border'
                  : 'hover:bg-secondary/30 border border-transparent'
              }`}
              onClick={() => setActiveId(conv.id)}>
              <div className="flex-1 min-w-0">
                <p className={`font-inter text-xs font-medium truncate leading-tight ${activeId === conv.id ? 'text-foreground' : 'text-muted-foreground'}`}>
                  {conv.title || 'Nouvelle conversation'}
                </p>
                {conv.last_message_at && (
                  <p className="font-mono text-[9px] text-muted-foreground/60 mt-0.5 flex items-center gap-1">
                    <Clock className="w-2 h-2" />
                    {format(new Date(conv.last_message_at), 'dd MMM HH:mm', { locale: fr })}
                  </p>
                )}
                <p className="font-mono text-[9px] text-muted-foreground/40 mt-0.5">
                  {conv.messages?.length || 0} msg
                </p>
              </div>
              <button
                onClick={e => { e.stopPropagation(); deleteMutation.mutate(conv.id); }}
                className="opacity-0 group-hover:opacity-100 w-5 h-5 flex items-center justify-center rounded-md hover:bg-destructive/20 transition-all flex-shrink-0 mt-0.5">
                <Trash2 className="w-3 h-3 text-destructive" />
              </button>
            </div>
          ))}
        </div>

        {/* Footer info */}
        <div className="px-3 py-2 border-t border-border flex-shrink-0">
          <div className="flex items-center justify-center gap-1.5">
            <Zap className="w-3 h-3" style={{ color: accent }} />
            <span className="font-mono text-[9px] text-muted-foreground">claude sonnet</span>
          </div>
        </div>
      </div>

      {/* ── Main chat area ── */}
      <div className="flex-1 flex flex-col min-w-0 bg-background/40">

        {/* Chat header */}
        <div className="flex items-center gap-3 px-5 py-3 border-b border-border flex-shrink-0 bg-card/30">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: accentSoft, border: `1px solid ${accent}33` }}>
            <Sparkles className="w-4 h-4" style={{ color: accent }} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-grotesk font-bold text-sm text-foreground truncate">
              {activeConv ? (activeConv.title || 'Nouvelle conversation') : 'NEXUS — IA Super Admin'}
            </p>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              <p className="font-mono text-[10px] text-green-400/80">Accès complet plateforme · Réservé Direction</p>
            </div>
          </div>
        </div>

        {/* Content */}
        {activeConv ? (
          <ChatPanel key={activeConv.id} conversation={activeConv} onUpdate={handleUpdate} />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 text-muted-foreground">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center opacity-60"
              style={{ background: accentSoft, border: `1px solid ${accent}33` }}>
              <Sparkles className="w-7 h-7" style={{ color: accent }} />
            </div>
            <p className="font-inter text-sm">Sélectionnez ou créez une conversation</p>
            <button onClick={() => createMutation.mutate()}
              className="flex items-center gap-2 px-4 py-2 rounded-xl font-grotesk font-semibold text-sm text-white transition-all hover:opacity-90"
              style={{ background: `linear-gradient(135deg,${accent},${accent}cc)` }}>
              <Plus className="w-4 h-4" /> Nouvelle conversation
            </button>
          </div>
        )}

        <div className="px-4 pb-2 flex-shrink-0 text-center">
          <p className="font-mono text-[9px] text-muted-foreground/40">
            NEXUS · Actions irréversibles possibles · Usage Direction uniquement
          </p>
        </div>
      </div>
    </div>
  );
}