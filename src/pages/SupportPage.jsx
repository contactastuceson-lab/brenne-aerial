import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ArrowLeft, Send, Loader2, Sparkles, Menu } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import MessageBubble from '@/components/support/MessageBubble';
import ConversationList from '@/components/support/ConversationList';

const AGENT = 'nexus_support';

export default function SupportPage() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [loadingConvos, setLoadingConvos] = useState(true);
  const [activeId, setActiveId] = useState(null);
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [showSidebarMobile, setShowSidebarMobile] = useState(false);
  const scrollRef = useRef(null);

  const loadConversations = useCallback(async () => {
    try {
      const list = await base44.agents.listConversations({ agent_name: AGENT }).catch(() => []);
      setConversations(list || []);
    } finally {
      setLoadingConvos(false);
    }
  }, []);

  useEffect(() => { loadConversations(); }, [loadConversations]);

  // Subscribe to active conversation updates (streaming)
  useEffect(() => {
    if (!activeId) { setMessages([]); return; }
    let stop = false;
    const unsub = base44.agents.subscribeToConversation(activeId, (data) => {
      if (!stop && data?.messages) {
        setMessages(data.messages);
        setConversation((prev) => prev ? { ...prev, messages: data.messages } : prev);
      }
    });
    // Load full conversation once
    (async () => {
      try {
        const conv = await base44.agents.getConversation(activeId);
        if (!stop) { setConversation(conv); setMessages(conv.messages || []); }
      } catch {}
    })();
    return () => { stop = true; if (unsub) unsub(); };
  }, [activeId]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages?.length, sending]);

  const openConversation = (id) => {
    setActiveId(id);
    setShowSidebarMobile(false);
  };

  const newConversation = async () => {
    try {
      const conv = await base44.agents.createConversation({
        agent_name: AGENT,
        metadata: { name: 'Nouvelle conversation', description: '' },
      });
      setConversations((prev) => [conv, ...prev]);
      setActiveId(conv.id);
      setConversation(conv);
      setMessages([]);
      setShowSidebarMobile(false);
    } catch (e) {}
  };

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || sending) return;
    if (!conversation) return;
    setSending(true);
    setInput('');
    // Optimistic
    setMessages((prev) => [...prev, { role: 'user', content: text }]);
    try {
      await base44.agents.addMessage(conversation, { role: 'user', content: text });
      // Update conversation name from first message
      if ((conversation.metadata?.name === 'Nouvelle conversation' || !conversation.metadata?.name) && text) {
        const name = text.slice(0, 40);
        base44.agents.updateConversation(conversation.id, { metadata: { name, description: text.slice(0, 80) } }).catch(() => {});
        setConversations((prev) => prev.map((c) => c.id === conversation.id ? { ...c, metadata: { name, description: text.slice(0, 80) } } : c));
      }
    } catch (e) {
      setMessages((prev) => [...prev, { role: 'assistant', content: '⚠ Erreur d\'envoi. Réessayez.' }]);
    } finally {
      setSending(false);
    }
  };

  const isAssistantThinking = sending || (messages.length > 0 && messages[messages.length - 1]?.role === 'user' && !sending);

  return (
    <div className="max-w-5xl mx-auto px-0 md:px-4 py-0 md:py-6">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 md:px-0 mb-4">
        {activeId && (
          <button onClick={() => { setActiveId(null); setConversation(null); setMessages([]); }}
            className="md:hidden w-9 h-9 rounded-xl flex items-center justify-center bg-secondary border border-border">
            <ArrowLeft className="w-4 h-4" />
          </button>
        )}
        <div className="w-11 h-11 rounded-2xl flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, hsl(205 90% 48%), hsl(195 80% 40%))' }}>
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1">
          <h1 className="text-lg font-grotesk font-bold">Support Nexus</h1>
          <p className="text-xs text-muted-foreground">IA en temps réel • connaît votre compte & la plateforme</p>
        </div>
        {!activeId && (
          <button onClick={() => setShowSidebarMobile(true)} className="md:hidden w-9 h-9 rounded-xl flex items-center justify-center bg-secondary border border-border">
            <Menu className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="flex gap-4 h-[calc(100dvh-9rem)] md:h-[70vh]">
        {/* Sidebar — desktop always, mobile toggle */}
        <div className={`${activeId ? 'hidden md:flex' : 'flex'} md:flex md:w-72 flex-shrink-0 rounded-2xl border border-border bg-card overflow-hidden`}>
          <ConversationList
            conversations={conversations}
            activeId={activeId}
            onSelect={openConversation}
            onNew={newConversation}
            loading={loadingConvos}
          />
        </div>

        {/* Chat */}
        <div className={`flex-1 flex flex-col rounded-2xl border border-border bg-card overflow-hidden ${activeId ? 'flex' : 'hidden md:flex'}`}>
          {!activeId ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
                style={{ background: 'linear-gradient(135deg, hsl(205 90% 48%), hsl(195 80% 40%))' }}>
                <Sparkles className="w-7 h-7 text-white" />
              </div>
              <h2 className="text-base font-grotesk font-bold mb-1">Nexus Support</h2>
              <p className="text-sm text-muted-foreground max-w-xs mb-6">
                Posez votre question, Nexus répond en direct et crée un ticket pour tracer la demande.
              </p>
              <button onClick={newConversation}
                className="h-10 px-5 rounded-xl font-semibold text-sm text-white transition-transform active:scale-95"
                style={{ background: 'linear-gradient(135deg, hsl(205 90% 48%), hsl(195 80% 40%))' }}>
                Démarrer une conversation
              </button>
            </div>
          ) : (
            <>
              <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.length === 0 && (
                  <div className="text-center py-10">
                    <p className="text-sm text-muted-foreground mb-1">Nexus est prêt 👋</p>
                    <p className="text-xs text-muted-foreground/70">Décrivez votre problème ou votre question.</p>
                  </div>
                )}
                {messages.map((m, i) => <MessageBubble key={i} message={m} />)}
                {(sending || isAssistantThinking) && (
                  <div className="flex gap-2.5 justify-start">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background: 'linear-gradient(135deg, hsl(205 90% 48%), hsl(195 80% 40%))' }}>
                      <span className="text-white text-xs font-bold">N</span>
                    </div>
                    <div className="bg-secondary border border-border rounded-2xl rounded-tl-sm px-3.5 py-2.5">
                      <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                    </div>
                  </div>
                )}
              </div>
              <div className="p-3 border-t border-border">
                <div className="flex items-end gap-2">
                  <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                    placeholder="Écrivez à Nexus…"
                    rows={2}
                    className="flex-1 bg-secondary/60 border border-border rounded-xl px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary/40 resize-none"
                  />
                  <button
                    onClick={sendMessage}
                    disabled={!input.trim() || sending}
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-white disabled:opacity-40 transition-transform active:scale-95 flex-shrink-0"
                    style={{ background: 'linear-gradient(135deg, hsl(205 90% 48%), hsl(195 80% 40%))' }}>
                    {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}