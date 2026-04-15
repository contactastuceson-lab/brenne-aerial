import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import ReactMarkdown from 'react-markdown';
import {
  Sparkles, Send, Loader2, RotateCcw, ChevronDown, ChevronRight,
  Terminal, Zap, Users, BarChart3, FileText, Megaphone, Mail, Flag,
  Plus, Trash2, MessageSquare, Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
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

function ToolResultDisplay({ tool, result }) {
  const [expanded, setExpanded] = useState(false);
  const isArray = Array.isArray(result);
  const count = isArray ? result.length : null;
  return (
    <div className="mt-2 rounded-lg border border-primary/20 bg-primary/5 overflow-hidden">
      <button onClick={() => setExpanded(p => !p)}
        className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-primary/10 transition-colors">
        <Terminal className="w-3.5 h-3.5 text-primary flex-shrink-0" />
        <span className="font-mono text-xs text-primary flex-1">
          ⚙️ {tool}{count !== null ? ` → ${count} résultat${count > 1 ? 's' : ''}` : ' → OK'}
        </span>
        {expanded ? <ChevronDown className="w-3 h-3 text-muted-foreground" /> : <ChevronRight className="w-3 h-3 text-muted-foreground" />}
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
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <div className="w-8 h-8 rounded-xl flex-shrink-0 flex items-center justify-center mt-1"
          style={{ background: 'linear-gradient(135deg,#92400e,#d97706)', boxShadow: '0 0 12px rgba(245,158,11,0.3)' }}>
          <Sparkles className="w-4 h-4 text-yellow-100" />
        </div>
      )}
      <div className={`max-w-[80%] ${isUser ? 'flex flex-col items-end' : ''}`}>
        {msg.content && (
          <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
            isUser ? 'text-white rounded-tr-sm' : 'bg-card border border-border rounded-tl-sm'
          }`} style={isUser ? { background: 'linear-gradient(135deg,#92400e,#b45309)' } : {}}>
            {isUser
              ? <p>{msg.content}</p>
              : <ReactMarkdown components={{
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
                }}>{msg.content}</ReactMarkdown>
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
      <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
        {isNew && (
          <div className="text-center py-6">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3"
              style={{ background: 'linear-gradient(135deg,#92400e,#d97706)', boxShadow: '0 0 20px rgba(245,158,11,0.3)' }}>
              <Sparkles className="w-6 h-6 text-yellow-100" />
            </div>
            <p className="font-grotesk font-bold text-sm text-yellow-200 mb-1">NEXUS — IA Super Admin</p>
            <p className="font-inter text-xs text-muted-foreground">Nouvelle conversation. Que souhaitez-vous faire ?</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 mt-4 max-w-lg mx-auto">
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
        {messages.map((msg, i) => <MessageBubble key={i} msg={msg} />)}
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
        <input ref={inputRef} value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
          placeholder="Ex: Mets Jean Dupont en admin, montre-moi les devis pending..."
          className="flex-1 bg-secondary/50 border rounded-xl px-4 py-2.5 text-sm font-inter placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 transition-all"
          style={{ borderColor: 'rgba(245,158,11,0.2)' }}
          onFocus={e => e.target.style.borderColor = 'rgba(245,158,11,0.5)'}
          onBlur={e => e.target.style.borderColor = 'rgba(245,158,11,0.2)'}
        />
        <button onClick={() => sendMessage()} disabled={!input.trim() || loading}
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 disabled:opacity-30 transition-all hover:scale-105 active:scale-95"
          style={{ background: 'linear-gradient(135deg,#92400e,#d97706)' }}>
          {loading ? <Loader2 className="w-4 h-4 text-yellow-100 animate-spin" /> : <Send className="w-4 h-4 text-yellow-100" />}
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

  // Auto-select first conversation
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
        <div className="w-5 h-5 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 rounded-2xl border overflow-hidden"
      style={{
        borderColor: 'rgba(245,158,11,0.2)',
        boxShadow: '0 0 40px rgba(245,158,11,0.05)',
        height: 'calc(100vh - 280px)',
        minHeight: '500px',
      }}>

      {/* ── Sidebar: conversation list ── */}
      <div className="w-60 flex-shrink-0 flex flex-col border-r"
        style={{ background: 'linear-gradient(180deg,hsl(214 45% 5%),hsl(214 40% 6%))', borderColor: 'rgba(245,158,11,0.12)' }}>

        {/* Header sidebar */}
        <div className="px-3 py-3 border-b flex items-center justify-between flex-shrink-0"
          style={{ borderColor: 'rgba(245,158,11,0.12)' }}>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: 'linear-gradient(135deg,#92400e,#d97706)' }}>
              <MessageSquare className="w-3 h-3 text-yellow-100" />
            </div>
            <span className="font-grotesk font-bold text-xs text-yellow-200">Historique</span>
          </div>
          <button onClick={() => createMutation.mutate()} disabled={createMutation.isPending}
            title="Nouvelle conversation"
            className="w-6 h-6 rounded-lg flex items-center justify-center hover:bg-yellow-500/10 transition-colors"
            style={{ border: '1px solid rgba(245,158,11,0.2)' }}>
            {createMutation.isPending
              ? <Loader2 className="w-3 h-3 text-yellow-500 animate-spin" />
              : <Plus className="w-3 h-3 text-yellow-500" />}
          </button>
        </div>

        {/* Conversations list */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {conversations.length === 0 && (
            <div className="text-center py-8">
              <p className="font-inter text-xs text-muted-foreground">Aucune conversation</p>
              <button onClick={() => createMutation.mutate()}
                className="mt-3 text-xs font-inter text-yellow-500 hover:text-yellow-400 underline underline-offset-2">
                Créer la première
              </button>
            </div>
          )}
          {conversations.map(conv => (
            <div key={conv.id}
              className={`group flex items-start gap-2 px-2.5 py-2 rounded-xl cursor-pointer transition-all ${
                activeId === conv.id
                  ? 'bg-yellow-500/10 border border-yellow-500/20'
                  : 'hover:bg-white/5 border border-transparent'
              }`}
              onClick={() => setActiveId(conv.id)}>
              <div className="flex-1 min-w-0">
                <p className={`font-inter text-xs font-medium truncate leading-tight ${activeId === conv.id ? 'text-yellow-200' : 'text-muted-foreground'}`}>
                  {conv.title || 'Nouvelle conversation'}
                </p>
                {conv.last_message_at && (
                  <p className="font-mono text-[9px] text-muted-foreground/50 mt-0.5 flex items-center gap-1">
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
                className="opacity-0 group-hover:opacity-100 w-5 h-5 flex items-center justify-center rounded-md hover:bg-red-500/20 transition-all flex-shrink-0 mt-0.5">
                <Trash2 className="w-3 h-3 text-red-400" />
              </button>
            </div>
          ))}
        </div>

        {/* Footer info */}
        <div className="px-3 py-2 border-t flex-shrink-0 text-center"
          style={{ borderColor: 'rgba(245,158,11,0.12)' }}>
          <div className="flex items-center justify-center gap-1.5">
            <Zap className="w-3 h-3 text-yellow-400" />
            <span className="font-mono text-[9px] text-yellow-400">claude sonnet</span>
          </div>
        </div>
      </div>

      {/* ── Main chat area ── */}
      <div className="flex-1 flex flex-col min-w-0"
        style={{ background: 'linear-gradient(180deg,hsl(214 45% 5%),hsl(214 40% 7%))' }}>

        {/* Chat header */}
        <div className="flex items-center gap-3 px-5 py-3 border-b flex-shrink-0"
          style={{ borderColor: 'rgba(245,158,11,0.12)', background: 'linear-gradient(90deg,rgba(146,64,14,0.1),transparent)' }}>
          <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'linear-gradient(135deg,#92400e,#d97706)', boxShadow: '0 0 12px rgba(245,158,11,0.3)' }}>
            <Sparkles className="w-4 h-4 text-yellow-100" />
          </div>
          <div className="flex-1">
            <p className="font-grotesk font-bold text-sm text-yellow-200">
              {activeConv ? (activeConv.title || 'Nouvelle conversation') : 'NEXUS — IA Super Admin'}
            </p>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              <p className="font-mono text-[10px] text-green-400">Accès complet plateforme · Réservé Direction</p>
            </div>
          </div>
        </div>

        {/* Content */}
        {activeConv ? (
          <ChatPanel key={activeConv.id} conversation={activeConv} onUpdate={handleUpdate} />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 text-muted-foreground">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg,#92400e,#d97706)', boxShadow: '0 0 24px rgba(245,158,11,0.25)', opacity: 0.5 }}>
              <Sparkles className="w-7 h-7 text-yellow-100" />
            </div>
            <p className="font-inter text-sm">Sélectionnez ou créez une conversation</p>
            <button onClick={() => createMutation.mutate()}
              className="flex items-center gap-2 px-4 py-2 rounded-xl font-grotesk font-semibold text-sm text-yellow-100 transition-all hover:opacity-90"
              style={{ background: 'linear-gradient(135deg,#92400e,#d97706)' }}>
              <Plus className="w-4 h-4" /> Nouvelle conversation
            </button>
          </div>
        )}

        <div className="px-4 pb-2 flex-shrink-0 text-center">
          <p className="font-mono text-[9px] text-muted-foreground/30">
            NEXUS · Actions irréversibles possibles · Usage Direction uniquement
          </p>
        </div>
      </div>
    </div>
  );
}