import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import {
  ArrowLeft, Send, Lock, Check, X, Flag, Clock,
  MoreVertical, Trash2, Copy, Info, ShieldOff, ShieldAlert, ShieldCheck
} from 'lucide-react';
import ReportModal from '@/components/shared/ReportModal';
import UserProfileModal from '@/components/shared/UserProfileModal';
import BadgeChip from '@/components/ui/BadgeChip';
import VerificationIcons from '@/components/ui/VerificationIcon';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { motion, AnimatePresence } from 'framer-motion';

function getConversationId(emailA, emailB) {
  return [emailA, emailB].sort().join('_');
}

export default function MessageThread({ user, conv, onBack }) {
  const [text, setText] = useState('');
  const [reportMsg, setReportMsg] = useState(null);
  const [showOptions, setShowOptions] = useState(false);
  const [msgMenu, setMsgMenu] = useState(null); // { id, x, y }
  const bottomRef = useRef(null);
  const scrollAreaRef = useRef(null);
  const optionsRef = useRef(null);
  const queryClient = useQueryClient();
  const prevCountRef = useRef(0);
  const isInitialLoad = useRef(true);

  const [showUnblockConfirm, setShowUnblockConfirm] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const convId = conv.convId || getConversationId(user.email, conv.email);

  useEffect(() => {
    isInitialLoad.current = true;
    prevCountRef.current = 0;
  }, [convId]);

  // Close menus on outside click
  useEffect(() => {
    const handler = (e) => {
      if (optionsRef.current && !optionsRef.current.contains(e.target)) {
        setShowOptions(false);
      }
      if (msgMenu) setMsgMenu(null);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [msgMenu]);

  // Official / protected team members cannot be blocked
  const PROTECTED_BADGES = ['Admin', 'Officiel', 'Collaborateur', 'Pilote'];
  const isProtectedTeamMember = conv.role === 'admin' || conv.badges?.some(b => PROTECTED_BADGES.includes(b));

  // Block status
  const { data: myBlocks = [] } = useQuery({
    queryKey: ['my-blocks', user.email],
    queryFn: () => base44.entities.Block.filter({ blocker_email: user.email }),
    enabled: !!user.email,
  });
  const blockRecord = myBlocks.find(b => b.blocked_email === conv.email);
  const isBlocked = !!blockRecord;

  const blockUser = useMutation({
    mutationFn: () => base44.entities.Block.create({ blocker_email: user.email, blocked_email: conv.email }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-blocks', user.email] });
      toast.success(`${conv.name} a été bloqué`);
      setShowOptions(false);
    },
  });

  const unblockUser = useMutation({
    mutationFn: () => base44.entities.Block.delete(blockRecord.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-blocks', user.email] });
      toast.success(`${conv.name} a été débloqué`);
      setShowUnblockConfirm(false);
    },
  });

  const { data: messages = [] } = useQuery({
    queryKey: ['thread', convId],
    queryFn: () => base44.entities.ChatMessage.filter({ conversation_id: convId }, 'created_date'),
    enabled: !!convId,
    refetchInterval: 2000,
  });

  const pendingRequest = messages.find(
    m => m.is_request && m.request_status === 'pending' && m.sender_email === conv.email && m.recipient_email === user.email
  );
  const myPendingRequest = messages.find(
    m => m.is_request && m.request_status === 'pending' && m.sender_email === user.email
  );
  const isOpen = messages.some(m => m.is_request && m.request_status === 'accepted');
  const hasAnyRequest = messages.some(m => m.is_request);

  // Mark as read
  useEffect(() => {
    messages
      .filter(m => !m.is_read && m.recipient_email === user.email)
      .forEach(m => base44.entities.ChatMessage.update(m.id, { is_read: true }));
  }, [messages, user.email]);

  // Auto-scroll
  useEffect(() => {
    if (!scrollAreaRef.current) return;
    const el = scrollAreaRef.current;
    const isAtBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 100;
    const isNewMessage = messages.length > prevCountRef.current;
    if (isInitialLoad.current && messages.length > 0) {
      el.scrollTop = el.scrollHeight;
      isInitialLoad.current = false;
    } else if (isNewMessage && isAtBottom) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
    prevCountRef.current = messages.length;
  }, [messages]);

  const sendRequest = useMutation({
    mutationFn: async () => {
      await base44.entities.ChatMessage.create({
        conversation_id: convId,
        sender_email: user.email,
        sender_name: user.full_name,
        sender_avatar: user.avatar_url || '',
        recipient_email: conv.email,
        recipient_name: conv.name,
        content: text.trim(),
        is_request: true,
        request_status: 'pending',
        is_read: false,
      });
    },
    onSuccess: () => {
      setText('');
      queryClient.invalidateQueries({ queryKey: ['thread', convId] });
      queryClient.invalidateQueries({ queryKey: ['all-chat-messages'] });
      queryClient.invalidateQueries({ queryKey: ['message-requests'] });
      toast.success('Demande envoyée');
    },
  });

  const sendMessage = useMutation({
    mutationFn: async () => {
      await base44.entities.ChatMessage.create({
        conversation_id: convId,
        sender_email: user.email,
        sender_name: user.full_name,
        sender_avatar: user.avatar_url || '',
        recipient_email: conv.email,
        recipient_name: conv.name,
        content: text.trim(),
        is_request: false,
        request_status: 'accepted',
        is_read: false,
      });
    },
    onSuccess: () => {
      setText('');
      queryClient.invalidateQueries({ queryKey: ['thread', convId] });
      queryClient.invalidateQueries({ queryKey: ['all-chat-messages'] });
    },
  });

  const acceptRequest = useMutation({
    mutationFn: async () => {
      await base44.entities.ChatMessage.update(pendingRequest.id, { request_status: 'accepted' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['thread', convId] });
      queryClient.invalidateQueries({ queryKey: ['message-requests'] });
      queryClient.invalidateQueries({ queryKey: ['all-chat-messages'] });
      toast.success('Demande acceptée !');
    },
  });

  const declineRequest = useMutation({
    mutationFn: async () => {
      await base44.entities.ChatMessage.update(pendingRequest.id, { request_status: 'declined' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['thread', convId] });
      queryClient.invalidateQueries({ queryKey: ['message-requests'] });
      queryClient.invalidateQueries({ queryKey: ['all-chat-messages'] });
      toast('Demande refusée');
      onBack();
    },
  });

  const deleteConversation = useMutation({
    mutationFn: async () => {
      await Promise.all(messages.map(m => base44.entities.ChatMessage.delete(m.id)));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-chat-messages'] });
      toast.success('Conversation supprimée');
      onBack();
    },
  });

  const deleteMessage = useMutation({
    mutationFn: async (msgId) => {
      await base44.entities.ChatMessage.delete(msgId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['thread', convId] });
      queryClient.invalidateQueries({ queryKey: ['all-chat-messages'] });
      toast.success('Message supprimé');
    },
  });

  const handleSend = () => {
    if (!text.trim()) return;
    if (!hasAnyRequest && !isOpen) sendRequest.mutate();
    else if (isOpen) sendMessage.mutate();
  };

  const handleMsgContextMenu = (e, msg) => {
    e.preventDefault();
    setMsgMenu({ id: msg.id, msg, x: e.clientX, y: e.clientY });
  };

  // Detect if this is an official conversation
  const isOfficialConversation = messages.some(m => m.is_official);

  // If I blocked them, hide their messages from my view (they can still send but I don't see)
  const visibleMessages = messages
    .filter(m => !m.is_request || m.request_status !== 'declined')
    .filter(m => !(isBlocked && m.sender_email === conv.email));

  return (
    <div className={`flex flex-col h-full rounded-2xl overflow-hidden relative ${isOfficialConversation ? 'border border-primary/30' : 'bg-card border border-border'}`}
      style={isOfficialConversation ? { background: 'linear-gradient(180deg, hsl(214 50% 5%) 0%, hsl(214 50% 4%) 100%)' } : {}}>

      {/* ── Header officiel ── */}
      {isOfficialConversation ? (
        <div className="flex items-center gap-3 px-4 py-4 flex-shrink-0 relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, hsl(205 90% 10%) 0%, hsl(214 50% 7%) 60%, hsl(205 80% 8%) 100%)', borderBottom: '1px solid rgba(56,170,220,0.2)' }}>
          {/* Glow bg */}
          <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at 30% 50%, rgba(56,170,220,0.08) 0%, transparent 70%)' }} />

          <button onClick={onBack} className="md:hidden p-1.5 rounded-lg hover:bg-white/10 text-primary/70 transition-colors z-10">
            <ArrowLeft className="w-4 h-4" />
          </button>

          {/* Avatar officiel premium */}
          <div className="relative z-10 flex-shrink-0">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, hsl(205 90% 20%), hsl(205 90% 12%))', border: '1.5px solid rgba(56,170,220,0.5)', boxShadow: '0 0 20px rgba(56,170,220,0.25)' }}>
              <ShieldCheck className="w-6 h-6 text-primary" />
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-primary rounded-full border-2 flex items-center justify-center" style={{ borderColor: 'hsl(205 90% 10%)' }}>
              <span className="w-1.5 h-1.5 bg-primary-foreground rounded-full" />
            </span>
          </div>

          <div className="flex-1 min-w-0 z-10">
            <div className="flex items-center gap-2">
              <span className="font-grotesk font-bold text-base text-foreground">{conv.name}</span>
              <span className="flex items-center gap-1 font-mono text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
                style={{ background: 'rgba(56,170,220,0.15)', border: '1px solid rgba(56,170,220,0.35)', color: 'hsl(205 90% 70%)' }}>
                <ShieldCheck className="w-2.5 h-2.5" /> Officiel
              </span>
            </div>
            <p className="font-inter text-[11px] text-primary/60 mt-0.5">Communication officielle · Lecture seule</p>
          </div>
        </div>
      ) : (
        /* ── Header normal ── */
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border flex-shrink-0 bg-card">
          <button onClick={onBack} className="md:hidden p-1.5 rounded-lg hover:bg-secondary text-muted-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </button>

          <div className="w-10 h-10 rounded-full bg-secondary border border-border hover:ring-2 hover:ring-primary/40 cursor-pointer transition-all flex items-center justify-center overflow-hidden flex-shrink-0"
            onClick={() => setShowProfile(true)}>
            {conv.avatar ? (
              <img src={conv.avatar} alt="" className="w-full h-full object-cover" />
            ) : (
              <span className="font-grotesk font-bold text-sm text-primary">{conv.name?.[0]?.toUpperCase() || '?'}</span>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <button onClick={() => setShowProfile(true)} className="font-grotesk font-semibold text-sm hover:text-primary transition-colors">{conv.name}</button>
              <VerificationIcons verifications={conv.verifications} />
              {conv.badges?.slice(0, 2).map(b => <BadgeChip key={b} badge={b} size="sm" />)}
            </div>
            {!isOpen && hasAnyRequest && myPendingRequest && (
              <p className="font-mono text-[10px] text-amber-400/80 flex items-center gap-1 mt-0.5">
                <Clock className="w-2.5 h-2.5" /> En attente de réponse
              </p>
            )}
          </div>

          {/* Options button */}
          <div className="relative" ref={optionsRef}>
            <button onClick={() => setShowOptions(v => !v)} className="p-2 rounded-lg hover:bg-secondary text-muted-foreground transition-colors">
              <MoreVertical className="w-4 h-4" />
            </button>

          <AnimatePresence>
            {showOptions && (
              <motion.div
                initial={{ opacity: 0, scale: 0.92, y: -4 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.92, y: -4 }}
                transition={{ duration: 0.12 }}
                className="absolute right-0 top-10 z-50 w-52 bg-popover border border-border rounded-xl shadow-2xl overflow-hidden"
              >
                <div className="py-1">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(conv.email);
                      toast.success('Email copié');
                      setShowOptions(false);
                    }}
                    className="flex items-center gap-3 w-full px-4 py-2.5 font-inter text-sm text-foreground hover:bg-secondary transition-colors"
                  >
                    <Copy className="w-4 h-4 text-muted-foreground" />
                    Copier l'email
                  </button>
                  <button
                    onClick={() => { setShowProfile(true); setShowOptions(false); }}
                    className="flex items-center gap-3 w-full px-4 py-2.5 font-inter text-sm text-foreground hover:bg-secondary transition-colors"
                  >
                    <Info className="w-4 h-4 text-muted-foreground" />
                    Voir le profil
                  </button>
                  <div className="h-px bg-border my-1" />
                  <button
                    onClick={() => {
                      if (window.confirm(`Supprimer toute la conversation avec ${conv.name} ?`)) {
                        deleteConversation.mutate();
                      }
                      setShowOptions(false);
                    }}
                    disabled={deleteConversation.isPending}
                    className="flex items-center gap-3 w-full px-4 py-2.5 font-inter text-sm text-destructive hover:bg-destructive/10 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    Supprimer la conversation
                  </button>
                  {!isProtectedTeamMember && (
                    !isBlocked ? (
                      <button
                        onClick={() => { blockUser.mutate(); }}
                        disabled={blockUser.isPending}
                        className="flex items-center gap-3 w-full px-4 py-2.5 font-inter text-sm text-destructive hover:bg-destructive/10 transition-colors"
                      >
                        <ShieldAlert className="w-4 h-4" />
                        Bloquer cet utilisateur
                      </button>
                    ) : (
                      <button
                        onClick={() => { setShowUnblockConfirm(true); setShowOptions(false); }}
                        className="flex items-center gap-3 w-full px-4 py-2.5 font-inter text-sm text-yellow-400 hover:bg-yellow-400/10 transition-colors"
                      >
                        <ShieldOff className="w-4 h-4" />
                        Débloquer cet utilisateur
                      </button>
                    )
                  )}
                  <button
                    onClick={() => {
                      setReportMsg({ sender_email: conv.email, sender_name: conv.name, id: convId, content: '' });
                      setShowOptions(false);
                    }}
                    className="flex items-center gap-3 w-full px-4 py-2.5 font-inter text-sm text-destructive hover:bg-destructive/10 transition-colors"
                  >
                    <Flag className="w-4 h-4" />
                    Signaler cet utilisateur
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      )}

      {/* ── Messages ── */}
      <div ref={scrollAreaRef} className={`flex-1 overflow-y-auto p-4 space-y-2 ${isOfficialConversation ? 'official-bg' : ''}`}
        style={isOfficialConversation ? { background: 'radial-gradient(ellipse at 50% 0%, rgba(56,170,220,0.04) 0%, transparent 60%)' } : {}}>

        {pendingRequest && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-primary/10 border border-primary/30 rounded-xl p-4 text-center mb-4"
          >
            <p className="font-inter text-sm font-medium mb-1">{conv.name} souhaite vous contacter</p>
            <p className="font-inter text-xs text-muted-foreground mb-3">Acceptez pour ouvrir la conversation</p>
            <div className="flex gap-2 justify-center">
              <Button size="sm" className="bg-primary text-primary-foreground text-xs gap-1.5" onClick={() => acceptRequest.mutate()} disabled={acceptRequest.isPending}>
                <Check className="w-3 h-3" /> Accepter
              </Button>
              <Button size="sm" variant="outline" className="border-destructive/40 text-destructive hover:bg-destructive/10 text-xs gap-1.5" onClick={() => declineRequest.mutate()} disabled={declineRequest.isPending}>
                <X className="w-3 h-3" /> Refuser
              </Button>
            </div>
          </motion.div>
        )}

        <AnimatePresence>
          {visibleMessages.map((msg, i) => {
            const isMine = msg.sender_email === user.email;
            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex group ${isMine ? 'justify-end' : 'justify-start'}`}
                onContextMenu={(e) => handleMsgContextMenu(e, msg)}
              >
                <div className={`max-w-[78%] flex flex-col gap-0.5 ${isMine ? 'items-end' : 'items-start'}`}>
                  {msg.is_request && (
                    <span className="font-mono text-[9px] text-amber-400/70 flex items-center gap-1 mb-0.5">
                      <Lock className="w-2.5 h-2.5" />
                      {msg.request_status === 'pending' ? 'Demande de contact' : 'Demande acceptée'}
                    </span>
                  )}
                  <div
                    className={`px-4 py-2.5 rounded-2xl font-inter text-sm leading-relaxed select-text ${
                      msg.is_official
                        ? 'rounded-tl-sm'
                        : isMine
                          ? 'bg-primary text-primary-foreground rounded-tr-sm'
                          : 'bg-secondary text-foreground border border-border rounded-tl-sm'
                    } ${msg.is_request && msg.request_status === 'pending' ? 'opacity-75' : ''}`}
                    style={msg.is_official ? {
                      background: 'linear-gradient(135deg, hsl(205 90% 12%), hsl(205 80% 9%))',
                      border: '1px solid rgba(56,170,220,0.25)',
                      color: 'hsl(210 20% 94%)',
                      boxShadow: '0 2px 12px rgba(56,170,220,0.08)',
                    } : {}}
                  >
                    {msg.content}
                  </div>
                  <div className={`flex items-center gap-2 px-1 ${isMine ? 'flex-row-reverse' : ''}`}>
                    <span className="font-mono text-[9px] text-muted-foreground">
                      {msg.created_date ? format(new Date(msg.created_date), 'HH:mm', { locale: fr }) : ''}
                    </span>
                    {/* Quick actions on hover */}
                    <div className={`flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity`}>
                      <button
                        onClick={() => { navigator.clipboard.writeText(msg.content); toast.success('Copié'); }}
                        className="p-0.5 rounded hover:bg-secondary"
                        title="Copier"
                      >
                        <Copy className="w-2.5 h-2.5 text-muted-foreground/60" />
                      </button>
                      {!isMine && (
                        <button onClick={() => setReportMsg(msg)} className="p-0.5 rounded hover:bg-secondary" title="Signaler">
                          <Flag className="w-2.5 h-2.5 text-muted-foreground/60 hover:text-destructive" />
                        </button>
                      )}
                      {isMine && (
                        <button
                          onClick={() => { if (window.confirm('Supprimer ce message ?')) deleteMessage.mutate(msg.id); }}
                          className="p-0.5 rounded hover:bg-secondary"
                          title="Supprimer"
                        >
                          <Trash2 className="w-2.5 h-2.5 text-muted-foreground/60 hover:text-destructive" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
        <div ref={bottomRef} />
      </div>

      {/* ── Input ── */}
      <div className={`px-4 py-3 flex-shrink-0 ${isOfficialConversation ? '' : 'border-t border-border bg-card'}`}
        style={isOfficialConversation ? { borderTop: '1px solid rgba(56,170,220,0.15)', background: 'linear-gradient(180deg, hsl(214 50% 5%) 0%, hsl(205 90% 6%) 100%)' } : {}}>
        {isOfficialConversation ? (
          <div className="flex flex-col items-center gap-3 py-2">
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl w-full"
              style={{ background: 'rgba(56,170,220,0.06)', border: '1px solid rgba(56,170,220,0.15)' }}>
              <Lock className="w-3.5 h-3.5 flex-shrink-0" style={{ color: 'hsl(205 90% 60%)' }} />
              <span className="font-inter text-xs text-center flex-1" style={{ color: 'hsl(215 15% 55%)' }}>
                Conversation en <span className="font-semibold" style={{ color: 'hsl(205 90% 65%)' }}>lecture seule</span> · Impossible de répondre
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-1 h-1 rounded-full bg-primary/40" />
              <span className="font-mono text-[9px] uppercase tracking-widest" style={{ color: 'hsl(205 90% 50%)', opacity: 0.6 }}>Brenne Aerial · Communication officielle</span>
              <div className="w-1 h-1 rounded-full bg-primary/40" />
            </div>
          </div>
        ) : isBlocked ? (
          <div className="flex items-center justify-between gap-3 bg-destructive/10 border border-destructive/20 rounded-xl px-4 py-3">
            <div className="flex items-center gap-2 min-w-0">
              <ShieldAlert className="w-4 h-4 text-destructive flex-shrink-0" />
              <span className="font-inter text-sm text-destructive/90">Vous avez bloqué <span className="font-semibold">{conv.name}</span></span>
            </div>
            <Button
              size="sm"
              variant="outline"
              className="border-destructive/30 text-destructive hover:bg-destructive/10 text-xs flex-shrink-0 gap-1.5"
              onClick={() => setShowUnblockConfirm(true)}
            >
              <ShieldOff className="w-3 h-3" /> Débloquer
            </Button>
          </div>
        ) : !isOpen && !hasAnyRequest ? (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-muted-foreground font-inter text-xs bg-secondary/50 rounded-lg px-3 py-2">
              <Lock className="w-3 h-3 text-primary/60 flex-shrink-0" />
              <span>Premier message = demande de contact. La personne devra l'accepter.</span>
            </div>
            <div className="flex gap-2">
              <Input
                value={text}
                onChange={e => setText(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSend()}
                placeholder="Votre message de présentation..."
                className="bg-secondary border-border font-inter text-sm"
              />
              <Button onClick={handleSend} disabled={!text.trim() || sendRequest.isPending} className="bg-primary text-primary-foreground flex-shrink-0 px-4">
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ) : myPendingRequest && !isOpen ? (
          <div className="text-center py-2 font-inter text-xs text-muted-foreground flex items-center justify-center gap-2">
            <Clock className="w-3 h-3 text-amber-400" /> En attente d'acceptation...
          </div>
        ) : isOpen ? (
          <div className="flex gap-2">
            <Input
              value={text}
              onChange={e => setText(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
              placeholder="Votre message..."
              className="bg-secondary border-border font-inter text-sm"
            />
            <Button onClick={handleSend} disabled={!text.trim() || sendMessage.isPending} className="bg-primary text-primary-foreground flex-shrink-0 px-4">
              <Send className="w-4 h-4" />
            </Button>
          </div>
        ) : (
          <div className="text-center py-2 font-inter text-xs text-muted-foreground">Cette conversation est fermée.</div>
        )}
      </div>

      {/* Context menu for messages (right-click) */}
      <AnimatePresence>
        {msgMenu && (
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.92 }}
            transition={{ duration: 0.1 }}
            style={{ position: 'fixed', top: msgMenu.y, left: Math.min(msgMenu.x, window.innerWidth - 200), zIndex: 100 }}
            className="w-48 bg-popover border border-border rounded-xl shadow-2xl overflow-hidden"
          >
            <button
              onClick={() => { navigator.clipboard.writeText(msgMenu.msg.content); toast.success('Copié'); setMsgMenu(null); }}
              className="flex items-center gap-3 w-full px-4 py-2.5 font-inter text-sm hover:bg-secondary transition-colors"
            >
              <Copy className="w-4 h-4 text-muted-foreground" /> Copier
            </button>
            {msgMenu.msg.sender_email !== user.email && (
              <button
                onClick={() => { setReportMsg(msgMenu.msg); setMsgMenu(null); }}
                className="flex items-center gap-3 w-full px-4 py-2.5 font-inter text-sm text-destructive hover:bg-destructive/10 transition-colors"
              >
                <Flag className="w-4 h-4" /> Signaler
              </button>
            )}
            {msgMenu.msg.sender_email === user.email && (
              <button
                onClick={() => { if (window.confirm('Supprimer ce message ?')) deleteMessage.mutate(msgMenu.msg.id); setMsgMenu(null); }}
                className="flex items-center gap-3 w-full px-4 py-2.5 font-inter text-sm text-destructive hover:bg-destructive/10 transition-colors"
              >
                <Trash2 className="w-4 h-4" /> Supprimer
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Unblock confirmation modal ── */}
      <AnimatePresence>
        {showUnblockConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-card border border-border rounded-2xl p-6 max-w-sm w-full shadow-2xl"
            >
              <div className="w-12 h-12 rounded-full bg-yellow-400/10 border border-yellow-400/20 flex items-center justify-center mx-auto mb-4">
                <ShieldOff className="w-6 h-6 text-yellow-400" />
              </div>
              <h3 className="font-grotesk font-bold text-base text-center mb-2">Débloquer {conv.name} ?</h3>
              <p className="font-inter text-sm text-muted-foreground text-center mb-6">
                Cette personne pourra à nouveau vous envoyer des messages et vous verrez ses messages.
              </p>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1 border-border"
                  onClick={() => setShowUnblockConfirm(false)}
                >
                  Annuler
                </Button>
                <Button
                  className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-black font-semibold gap-1.5"
                  onClick={() => unblockUser.mutate()}
                  disabled={unblockUser.isPending}
                >
                  <ShieldOff className="w-4 h-4" />
                  {unblockUser.isPending ? 'Déblocage...' : 'Débloquer'}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {showProfile && (
        <UserProfileModal
          profile={{
            full_name: conv.name,
            email: conv.email,
            avatar_url: conv.avatar,
            cover_url: conv.cover_url,
            bio: conv.bio,
            location: conv.location,
            role: conv.role,
            badges: conv.badges,
            verifications: conv.verifications,
          }}
          onClose={() => setShowProfile(false)}
        />
      )}

      {reportMsg && (
        <ReportModal
          open={!!reportMsg}
          onClose={() => setReportMsg(null)}
          user={user}
          targetType="message"
          targetId={reportMsg.id}
          targetEmail={reportMsg.sender_email}
          targetName={reportMsg.sender_name}
          messageContent={reportMsg.content}
        />
      )}
    </div>
  );
}