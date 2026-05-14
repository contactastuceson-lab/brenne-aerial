import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import ReactMarkdown from 'react-markdown';
import {
  Sparkles, Send, Loader2, ChevronDown, ChevronUp, X,
  BarChart3, Users, FileText, Megaphone, Mail, Flag,
  Plus, Trash2, MessageSquare, Clock, Zap
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const QUICK_ACTIONS = [
  { icon: BarChart3, label: 'Stats', msg: 'Donne-moi les statistiques complètes de la plateforme.' },
  { icon: Users, label: 'Admins', msg: 'Liste tous les utilisateurs qui ont un rôle admin ou supérieur.' },
  { icon: FileText, label: 'Devis', msg: 'Montre-moi tous les devis en attente de traitement.' },
  { icon: Flag, label: 'Signalements', msg: 'Liste les signalements en attente.' },
  { icon: Megaphone, label: 'Annonce', msg: 'Je veux créer une nouvelle annonce pour tous les utilisateurs.' },
  { icon: Mail, label: 'Email', msg: 'Je veux envoyer un email officiel de la direction.' },
];

function ToolResultDisplay({ tool, result }) {
  const [expanded, setExpanded] = useState(false);
  const isArray = Array.isArray(result);
  const count = isArray ? result.length : null;
  return (
    <div className="mt-2 rounded-lg border border-primary/20 bg-primary/5 overflow-hidden">
      <button onClick={() => setExpanded(p => !p)}
        className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-primary/10 transition-colors">
        <Zap className="w-3 h-3 text-primary flex-shrink-0" />
        <span className="font-mono text-[10px] text-primary flex-1">
          {tool}{count !== null ? ` → ${count} résultat${count > 1 ? 's' : ''}` : ' → OK'}
        </span>
        {expanded ? <ChevronDown className="w-3 h-3 text-muted-foreground" /> : <ChevronUp className="w-3 h-3 text-muted-foreground" />}
      </button>
      {expanded && (
        <pre className="px-3 pb-3 font-mono text-[9px] text-muted-foreground overflow-auto max-h-32 leading-relaxed">
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
      className={`flex gap-2 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <div className="w-6 h-6 rounded-lg flex-shrink-0 flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg,#92400e,#d97706)', boxShadow: '0 0 12px rgba(245,158,11,0.3)' }}>
          <Sparkles className="w-3 h-3 text-yellow-100" />
        </div>
      )}
      <div className={`max-w-[85%] ${isUser ? 'flex flex-col items-end' : ''}`}>
        {msg.content && (
          <div className={`rounded-2xl px-3 py-2 text-xs leading-relaxed ${
            isUser ? 'text-white rounded-tr-sm' : 'bg-card border border-border rounded-tl-sm'
          }`} style={isUser ? { background: 'linear-gradient(135deg,#92400e,#b45309)' } : {}}>
            {isUser
              ? <p>{msg.content}</p>
              : <ReactMarkdown components={{
                  p: ({ children }) => <p className="mb-1 last:mb-0">{children}</p>,
                  strong: ({ children }) => <strong className="font-semibold text-yellow-400">{children}</strong>,
                  ul: ({ children }) => <ul className="ml-3 list-disc space-y-0.5 my-0.5">{children}</ul>,
                  li: ({ children }) => <li className="text-[10px] text-muted-foreground">{children}</li>,
                }}>{msg.content}</ReactMarkdown>
            }
          </div>
        )}
        {msg.tool_result && <ToolResultDisplay tool={msg.tool_name || 'tool'} result={msg.tool_result} />}
      </div>
    </motion.div>
  );
}

function ChatPanel({ conversation, onUpdate }) {
  const [messages, setMessages] = useState(conversation.messages || []);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  const isNew = messages.length === 0;

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const saveMessages = async (newMessages) => {
    const firstUserMsg = newMessages.find(m => m.role === 'user');
    const title = firstUserMsg
      ? firstUserMsg.content.slice(0, 40) + (firstUserMsg.content.length > 40 ? '…' : '')
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
      <div className="flex-1 overflow-y-auto p-3 space-y-3 min-h-0">
        {isNew && (
          <div className="text-center py-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-2"
              style={{ background: 'linear-gradient(135deg,#92400e,#d97706)', boxShadow: '0 0 20px rgba(245,158,11,0.3)' }}>
              <Sparkles className="w-5 h-5 text-yellow-100" />
            </div>
            <p className="font-grotesk font-bold text-xs text-yellow-200 mb-2">NEXUS — IA Super Admin</p>
            <p className="font-inter text-[10px] text-muted-foreground mb-3">Nouvelle conversation. Que souhaitez-vous faire ?</p>
            <div className="grid grid-cols-2 gap-1.5">
              {QUICK_ACTIONS.map(({ icon: Icon, label, msg }) => (
                <button key={label} onClick={() => sendMessage(msg)}
                  className="flex flex-col items-center gap-1 px-2 py-2 rounded-lg text-left border transition-all text-[9px] font-inter hover:border-yellow-500/30 hover:bg-yellow-500/5"
                  style={{ borderColor: 'rgba(245,158,11,0.15)', background: 'rgba(146,64,14,0.08)' }}>
                  <Icon className="w-3 h-3 text-yellow-500/70" />
                  <span className="text-muted-foreground text-center">{label}</span>
                </button>
              ))}
            </div>
          </div>
        )}
        {messages.map((msg, i) => <MessageBubble key={i} msg={msg} />)}
        {loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-2 justify-start">
            <div className="w-6 h-6 rounded-lg flex-shrink-0 flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg,#92400e,#d97706)' }}>
              <Sparkles className="w-3 h-3 text-yellow-100" />
            </div>
            <div className="bg-card border border-border rounded-2xl rounded-tl-sm px-3 py-2 flex items-center gap-1.5">
              {[0, 1, 2].map(i => (
                <motion.div key={i} className="w-1.5 h-1.5 rounded-full bg-yellow-500/50"
                  animate={{ y: [0, -4, 0], opacity: [0.4, 1, 0.4] }}
                  transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }} />
              ))}
            </div>
          </motion.div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="px-3 py-2 border-t flex gap-2 flex-shrink-0"
        style={{ borderColor: 'rgba(245,158,11,0.15)', background: 'rgba(0,0,0,0.2)' }}>
        <input value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
          placeholder="Ex: Mets Jean Dupont en admin..."
          className="flex-1 bg-secondary/50 border rounded-lg px-3 py-2 text-xs font-inter placeholder:text-muted-foreground/50 focus:outline-none transition-all"
          style={{ borderColor: 'rgba(245,158,11,0.2)' }}
        />
        <button onClick={() => sendMessage()} disabled={!input.trim() || loading}
          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 disabled:opacity-30 transition-all"
          style={{ background: 'linear-gradient(135deg,#92400e,#d97706)' }}>
          {loading ? <Loader2 className="w-3 h-3 text-yellow-100 animate-spin" /> : <Send className="w-3 h-3 text-yellow-100" />}
        </button>
      </div>
    </div>
  );
}

export default function PDGAIAgentMobile() {
  const qc = useQueryClient();
  const [activeId, setActiveId] = useState(null);
  const [historyOpen, setHistoryOpen] = useState(false);

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
      setHistoryOpen(false);
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
        <div className="w-5 h-5 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full rounded-2xl border overflow-hidden"
      style={{
        borderColor: 'rgba(245,158,11,0.2)',
        boxShadow: '0 0 40px rgba(245,158,11,0.05)',
        height: 'calc(100vh - 280px)',
        minHeight: '500px',
        background: 'linear-gradient(180deg,hsl(214 45% 5%),hsl(214 40% 7%))',
      }}>

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b flex-shrink-0"
        style={{ borderColor: 'rgba(245,158,11,0.12)', background: 'linear-gradient(90deg,rgba(146,64,14,0.1),transparent)' }}>
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: 'linear-gradient(135deg,#92400e,#d97706)' }}>
            <Sparkles className="w-3 h-3 text-yellow-100" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-grotesk font-bold text-xs text-yellow-200 truncate">
              {activeConv ? (activeConv.title || 'Nouvelle') : 'NEXUS'}
            </p>
            <p className="font-mono text-[9px] text-green-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" /> Live
            </p>
          </div>
        </div>

        {/* History toggle & new */}
        <div className="flex items-center gap-1 flex-shrink-0">
          <button onClick={() => setHistoryOpen(!historyOpen)}
            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
              historyOpen ? 'bg-yellow-500/20 border border-yellow-500/30' : 'hover:bg-yellow-500/10 border border-transparent'
            }`}
            title="Historique">
            <MessageSquare className="w-3 h-3 text-yellow-500" />
          </button>
          <button onClick={() => createMutation.mutate()}
            className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-yellow-500/10 transition-colors border border-transparent"
            title="Nouvelle conversation">
            {createMutation.isPending
              ? <Loader2 className="w-3 h-3 text-yellow-500 animate-spin" />
              : <Plus className="w-3 h-3 text-yellow-500" />}
          </button>
        </div>
      </div>

      {/* History accordion */}
      <AnimatePresence>
        {historyOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="border-b overflow-hidden"
            style={{ borderColor: 'rgba(245,158,11,0.12)' }}>
            <div className="p-2 space-y-1 max-h-48 overflow-y-auto">
              {conversations.length === 0 ? (
                <p className="text-center text-[10px] text-muted-foreground py-3">Aucune conversation</p>
              ) : (
                conversations.map(conv => (
                  <button key={conv.id}
                    onClick={() => { setActiveId(conv.id); setHistoryOpen(false); }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-all ${
                      activeId === conv.id
                        ? 'bg-yellow-500/15 border border-yellow-500/25 text-yellow-200'
                        : 'hover:bg-white/5 border border-transparent text-muted-foreground'
                    }`}>
                    <p className="truncate font-medium">{conv.title || 'Nouvelle'}</p>
                    {conv.last_message_at && (
                      <p className="font-mono text-[9px] text-muted-foreground/50 mt-0.5">
                        {format(new Date(conv.last_message_at), 'dd MMM HH:mm', { locale: fr })}
                      </p>
                    )}
                  </button>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat or empty state */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {activeConv ? (
          <ChatPanel key={activeConv.id} conversation={activeConv} onUpdate={handleUpdate} />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 text-muted-foreground">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg,#92400e,#d97706)', boxShadow: '0 0 24px rgba(245,158,11,0.25)', opacity: 0.5 }}>
              <Sparkles className="w-6 h-6 text-yellow-100" />
            </div>
            <p className="font-inter text-xs">Créez ou sélectionnez une conversation</p>
            <button onClick={() => createMutation.mutate()}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg font-grotesk font-semibold text-xs text-yellow-100 transition-all hover:opacity-90"
              style={{ background: 'linear-gradient(135deg,#92400e,#d97706)' }}>
              <Plus className="w-3 h-3" /> Nouvelle
            </button>
          </div>
        )}
      </div>

      <div className="px-3 pb-2 flex-shrink-0 text-center">
        <p className="font-mono text-[8px] text-muted-foreground/20">NEXUS · Direction uniquement</p>
      </div>
    </div>
  );
}