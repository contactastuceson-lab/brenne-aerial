import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { ArrowLeft, Send, Lock, Check, X, Flag, Clock } from 'lucide-react';
import ReportModal from '@/components/shared/ReportModal';
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
  const bottomRef = useRef(null);
  const queryClient = useQueryClient();

  const convId = conv.convId || getConversationId(user.email, conv.email);

  const { data: messages = [] } = useQuery({
    queryKey: ['thread', convId],
    queryFn: () => base44.entities.ChatMessage.filter({ conversation_id: convId }, 'created_date'),
    enabled: !!convId,
    refetchInterval: 2000,
  });

  // Check if there's a pending request from the other person to us
  const pendingRequest = messages.find(
    m => m.is_request && m.request_status === 'pending' && m.sender_email === conv.email && m.recipient_email === user.email
  );

  // Check if there's a request we sent that is still pending
  const myPendingRequest = messages.find(
    m => m.is_request && m.request_status === 'pending' && m.sender_email === user.email
  );

  // Is the conversation open (accepted)?
  const isOpen = messages.some(m => m.is_request && m.request_status === 'accepted');

  // Has there been any request message at all?
  const hasAnyRequest = messages.some(m => m.is_request);

  // Mark messages as read
  useEffect(() => {
    messages
      .filter(m => !m.is_read && m.recipient_email === user.email)
      .forEach(m => base44.entities.ChatMessage.update(m.id, { is_read: true }));
  }, [messages, user.email]);

  // Scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
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

  const handleSend = () => {
    if (!text.trim()) return;
    if (!hasAnyRequest && !isOpen) {
      sendRequest.mutate();
    } else if (isOpen) {
      sendMessage.mutate();
    }
  };

  const visibleMessages = messages.filter(m => !m.is_request || m.request_status !== 'declined');

  return (
    <div className="flex flex-col h-full bg-card border border-border rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-border flex-shrink-0">
        <button onClick={onBack} className="md:hidden p-1.5 rounded-lg hover:bg-secondary text-muted-foreground">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="w-9 h-9 rounded-xl bg-secondary border border-border flex items-center justify-center">
          <span className="font-grotesk font-bold text-sm text-primary">
            {conv.name?.[0]?.toUpperCase() || '?'}
          </span>
        </div>
        <div>
          <p className="font-grotesk font-semibold text-sm">{conv.name}</p>
          <p className="font-mono text-[10px] text-muted-foreground">{conv.email}</p>
        </div>
        {!isOpen && hasAnyRequest && myPendingRequest && (
          <span className="ml-auto font-mono text-[10px] text-amber-400/80 bg-amber-400/10 border border-amber-400/20 px-2 py-1 rounded-full flex items-center gap-1">
            <Clock className="w-3 h-3" />
            En attente
          </span>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {/* Pending request banner (for recipient) */}
        {pendingRequest && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-primary/10 border border-primary/30 rounded-xl p-4 text-center"
          >
            <p className="font-inter text-sm font-medium mb-1">{conv.name} souhaite vous contacter</p>
            <p className="font-inter text-xs text-muted-foreground mb-3">Acceptez pour ouvrir la conversation</p>
            <div className="flex gap-2 justify-center">
              <Button
                size="sm"
                className="bg-primary text-primary-foreground text-xs gap-1.5"
                onClick={() => acceptRequest.mutate()}
                disabled={acceptRequest.isPending}
              >
                <Check className="w-3 h-3" /> Accepter
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="border-destructive/40 text-destructive hover:bg-destructive/10 text-xs gap-1.5"
                onClick={() => declineRequest.mutate()}
                disabled={declineRequest.isPending}
              >
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
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i < 10 ? 0 : 0 }}
                className={`flex group ${isMine ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[75%] ${isMine ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                  {msg.is_request && (
                    <span className="font-mono text-[9px] text-amber-400/70 flex items-center gap-1">
                      <Lock className="w-2.5 h-2.5" />
                      {msg.request_status === 'pending' ? 'Demande de contact' : 'Demande acceptée'}
                    </span>
                  )}
                  <div
                    className={`px-4 py-2.5 rounded-2xl font-inter text-sm leading-relaxed ${
                      isMine
                        ? 'bg-primary text-primary-foreground rounded-tr-sm'
                        : 'bg-secondary text-foreground border border-border rounded-tl-sm'
                    } ${msg.is_request && msg.request_status === 'pending' ? 'opacity-80' : ''}`}
                  >
                    {msg.content}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[9px] text-muted-foreground">
                      {msg.created_date ? format(new Date(msg.created_date), 'HH:mm', { locale: fr }) : ''}
                    </span>
                    {!isMine && (
                      <button
                        onClick={() => setReportMsg(msg)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Flag className="w-2.5 h-2.5 text-muted-foreground/50 hover:text-destructive" />
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-border flex-shrink-0">
        {!isOpen && !hasAnyRequest ? (
          // First message = request
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-muted-foreground font-inter text-xs bg-secondary/50 rounded-lg px-3 py-2">
              <Lock className="w-3 h-3 text-primary/60" />
              Votre premier message sera une demande de contact. La personne devra l'accepter.
            </div>
            <div className="flex gap-2">
              <Input
                value={text}
                onChange={e => setText(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSend()}
                placeholder="Écrivez votre message de présentation..."
                className="bg-secondary border-border font-inter text-sm"
              />
              <Button
                onClick={handleSend}
                disabled={!text.trim() || sendRequest.isPending}
                className="bg-primary text-primary-foreground flex-shrink-0"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ) : myPendingRequest && !isOpen ? (
          <div className="text-center py-2 font-inter text-xs text-muted-foreground flex items-center justify-center gap-2">
            <Clock className="w-3 h-3 text-amber-400" />
            En attente d'acceptation...
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
            <Button
              onClick={handleSend}
              disabled={!text.trim() || sendMessage.isPending}
              className="bg-primary text-primary-foreground flex-shrink-0"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        ) : null}
      </div>

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