import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import {
  MessageCircle, Search, Lock, Eye, Trash2, Clock,
  CheckCircle, XCircle, ChevronLeft, Copy, MessageSquare,
  ShieldCheck, Send, AlertTriangle, StickyNote, FileText
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import ConvStatsBar from '@/components/admin/conversations/ConvStatsBar';
import ConvStatusBadge from '@/components/admin/conversations/ConvStatusBadge';
import ConvMessageBubble from '@/components/admin/conversations/ConvMessageBubble';
import ConvAdminToolbar from '@/components/admin/conversations/ConvAdminToolbar';

const STATUS_FILTER = [
  { key: 'all',      label: 'Tout' },
  { key: 'open',     label: 'Ouvertes' },
  { key: 'pending',  label: 'En attente' },
  { key: 'declined', label: 'Refusées' },
];

const MSG_TYPES = {
  official: { label: 'Officiel', icon: ShieldCheck,    color: 'text-primary',     placeholder: 'Message officiel (visible par les 2 participants)...' },
  warning:  { label: 'Avertissement', icon: AlertTriangle, color: 'text-orange-400', placeholder: 'Message d\'avertissement (visible par les 2 participants)...' },
  note:     { label: 'Note interne', icon: StickyNote,   color: 'text-muted-foreground', placeholder: 'Note interne (NON visible par les utilisateurs)...' },
};

export default function AdminConversations() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedConv, setSelectedConv] = useState(null);
  const [adminMsg, setAdminMsg] = useState('');
  const [msgType, setMsgType] = useState('official'); // official | warning | note
  const bottomRef = useRef(null);
  const queryClient = useQueryClient();

  const { data: allMessages = [], isLoading } = useQuery({
    queryKey: ['admin-all-messages'],
    queryFn: () => base44.entities.ChatMessage.list('-created_date', 2000),
    refetchInterval: 8000,
  });

  const { data: allUsers = [] } = useQuery({
    queryKey: ['admin-users-conv'],
    queryFn: () => base44.entities.User.list(),
  });

  const { data: allControls = [] } = useQuery({
    queryKey: ['admin-conv-controls'],
    queryFn: () => base44.entities.ConversationControl.list(),
  });

  const userMap = useMemo(() => Object.fromEntries(allUsers.map(u => [u.email, u])), [allUsers]);
  const controlMap = useMemo(() => Object.fromEntries(allControls.map(c => [c.conversation_id, c])), [allControls]);

  // ── Mutations ──

  const deleteMessage = useMutation({
    mutationFn: (id) => base44.entities.ChatMessage.delete(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-all-messages'] }); toast.success('Message supprimé'); },
  });

  const editMessage = useMutation({
    mutationFn: ({ id, content }) => base44.entities.ChatMessage.update(id, { content }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-all-messages'] }); toast.success('Message modifié'); },
  });

  const sendAdminMessage = useMutation({
    mutationFn: async ({ conv }) => {
      const participants = conv.participantList.filter(e => e !== 'admin@brenneaerial.fr');
      const [emailA, emailB] = participants;
      const isNote = msgType === 'note';
      const isWarning = msgType === 'warning';
      await base44.entities.ChatMessage.create({
        conversation_id: conv.convId,
        sender_email: 'admin@brenneaerial.fr',
        sender_name: 'Administrateur',
        sender_avatar: '',
        recipient_email: emailA || conv.participantList[0],
        recipient_name: conv.participantNames[emailA] || emailA || '',
        content: adminMsg.trim(),
        is_request: false,
        request_status: 'accepted',
        is_read: false,
        is_official: !isNote && !isWarning,
        is_warning: isWarning,
        is_admin_note: isNote,
      });
    },
    onSuccess: () => {
      setAdminMsg('');
      queryClient.invalidateQueries({ queryKey: ['admin-all-messages'] });
      toast.success(MSG_TYPES[msgType].label + ' envoyé');
    },
  });

  const deleteConversation = useMutation({
    mutationFn: async (convId) => {
      const msgs = allMessages.filter(m => m.conversation_id === convId);
      await Promise.all(msgs.map(m => base44.entities.ChatMessage.delete(m.id)));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-all-messages'] });
      setSelectedConv(null);
      toast.success('Conversation supprimée');
    },
  });

  const upsertControl = useMutation({
    mutationFn: async ({ convId, data }) => {
      const existing = controlMap[convId];
      const participants = selectedConv?.participantList.filter(e => e !== 'admin@brenneaerial.fr') || [];
      const [emailA, emailB] = participants;
      if (existing) {
        await base44.entities.ConversationControl.update(existing.id, data);
      } else {
        await base44.entities.ConversationControl.create({
          conversation_id: convId,
          email_a: emailA,
          email_b: emailB,
          ...data,
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-conv-controls'] });
      toast.success('Contrôle mis à jour');
    },
  });

  // Handle toolbar actions
  const handleAdminAction = (action, value) => {
    const convId = selectedConv.convId;
    const control = controlMap[convId];
    const participants = selectedConv.participantList.filter(e => e !== 'admin@brenneaerial.fr');
    const [emailA, emailB] = participants;

    if (action === 'lock_all') {
      upsertControl.mutate({ convId, data: { locked_for_all: value, locked_for_email: null } });
    } else if (action === 'lock_one') {
      const currentLocked = control?.locked_for_email === value;
      upsertControl.mutate({ convId, data: { locked_for_email: currentLocked ? null : value, locked_for_all: false } });
    } else if (action === 'block_a_to_b') {
      upsertControl.mutate({ convId, data: { blocked_a_to_b: value, email_a: emailA, email_b: emailB } });
    } else if (action === 'block_b_to_a') {
      upsertControl.mutate({ convId, data: { blocked_b_to_a: value, email_a: emailA, email_b: emailB } });
    } else if (action === 'set_msg_type') {
      setMsgType(value);
      toast.info(`Type de message : ${MSG_TYPES[value].label}`);
    }
  };

  // Conversations aggregation
  const conversations = useMemo(() => {
    const map = {};
    allMessages.forEach(m => {
      const cid = m.conversation_id;
      if (!map[cid]) map[cid] = { convId: cid, participants: new Set(), messages: [], participantNames: {} };
      map[cid].messages.push(m);
      map[cid].participants.add(m.sender_email);
      map[cid].participants.add(m.recipient_email);
      if (m.sender_name) map[cid].participantNames[m.sender_email] = m.sender_name;
      if (m.recipient_name) map[cid].participantNames[m.recipient_email] = m.recipient_name;
    });
    return Object.values(map).map(conv => {
      const msgs = conv.messages.sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
      const hasAccepted = conv.messages.some(m => (m.is_request && m.request_status === 'accepted') || !m.is_request);
      const hasPending = conv.messages.some(m => m.is_request && m.request_status === 'pending');
      const hasDeclined = conv.messages.some(m => m.is_request && m.request_status === 'declined');
      const status = hasDeclined ? 'declined' : hasPending && !hasAccepted ? 'pending' : hasAccepted ? 'open' : 'pending';
      const ctrl = controlMap[conv.convId];
      return { ...conv, participantList: Array.from(conv.participants), lastMsg: msgs[0], status, isLocked: ctrl?.locked_for_all || !!ctrl?.locked_for_email };
    }).sort((a, b) => new Date(b.lastMsg?.created_date) - new Date(a.lastMsg?.created_date));
  }, [allMessages, controlMap]);

  const filtered = conversations.filter(c => {
    const matchSearch = !search || Object.values(c.participantNames).join(' ').toLowerCase().includes(search.toLowerCase()) || c.participantList.join(' ').toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || c.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const stats = useMemo(() => ({
    total: conversations.length,
    open: conversations.filter(c => c.status === 'open').length,
    pending: conversations.filter(c => c.status === 'pending').length,
    declined: conversations.filter(c => c.status === 'declined').length,
    totalMessages: allMessages.length,
  }), [conversations, allMessages]);

  const convMessages = useMemo(() => {
    if (!selectedConv) return [];
    return allMessages.filter(m => m.conversation_id === selectedConv.convId).sort((a, b) => new Date(a.created_date) - new Date(b.created_date));
  }, [selectedConv, allMessages]);

  // Auto scroll
  useEffect(() => {
    if (selectedConv) bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [convMessages.length]);

  // ── DETAIL VIEW ──
  if (selectedConv) {
    const names = Object.values(selectedConv.participantNames).filter(n => n && n !== 'Administrateur');
    const control = controlMap[selectedConv.convId];
    const [personA] = selectedConv.participantList;
    const MsgTypeIcon = MSG_TYPES[msgType].icon;

    return (
      <div>
        {/* Header */}
        <div className="flex items-center gap-3 mb-4 flex-wrap">
          <button onClick={() => setSelectedConv(null)} className="p-2 rounded-xl hover:bg-secondary border border-border text-muted-foreground transition-colors">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="font-grotesk font-bold text-xl truncate">{names.join(' ↔ ')}</h1>
            <p className="font-mono text-xs text-muted-foreground">{convMessages.length} messages</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <ConvStatusBadge status={selectedConv.status} locked={selectedConv.isLocked} />
            <ConvAdminToolbar conv={selectedConv} control={control} onAction={handleAdminAction} />
            <Button
              size="sm"
              variant="outline"
              className="border-destructive/40 text-destructive hover:bg-destructive/10 gap-1.5 text-xs"
              onClick={() => { if (window.confirm(`Supprimer toute la conversation ?`)) deleteConversation.mutate(selectedConv.convId); }}
              disabled={deleteConversation.isPending}
            >
              <Trash2 className="w-3.5 h-3.5" /> Supprimer
            </Button>
          </div>
        </div>

        {/* Control status banners */}
        {control && (
          <div className="space-y-2 mb-4">
            {control.locked_for_all && (
              <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-orange-400/10 border border-orange-400/20">
                <Lock className="w-4 h-4 text-orange-400" />
                <span className="font-inter text-xs text-orange-300">Conversation verrouillée pour <strong>les 2 participants</strong> — aucun ne peut écrire</span>
              </div>
            )}
            {control.locked_for_email && !control.locked_for_all && (
              <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-orange-400/10 border border-orange-400/20">
                <Lock className="w-4 h-4 text-orange-400" />
                <span className="font-inter text-xs text-orange-300">Verrouillé pour <strong>{selectedConv.participantNames[control.locked_for_email] || control.locked_for_email}</strong> uniquement</span>
              </div>
            )}
            {(control.blocked_a_to_b || control.blocked_b_to_a) && (
              <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-400/10 border border-red-400/20">
                <XCircle className="w-4 h-4 text-red-400" />
                <span className="font-inter text-xs text-red-300">
                  Blocage croisé actif :
                  {control.blocked_a_to_b && <strong> {selectedConv.participantNames[control.email_a] || control.email_a} → {selectedConv.participantNames[control.email_b] || control.email_b}</strong>}
                  {control.blocked_a_to_b && control.blocked_b_to_a && ' · '}
                  {control.blocked_b_to_a && <strong> {selectedConv.participantNames[control.email_b] || control.email_b} → {selectedConv.participantNames[control.email_a] || control.email_a}</strong>}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Participants */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
          {selectedConv.participantList.filter(e => e !== 'admin@brenneaerial.fr').map(email => {
            const profile = userMap[email];
            const name = selectedConv.participantNames[email] || email;
            const sentCount = convMessages.filter(m => m.sender_email === email).length;
            return (
              <div key={email} className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border">
                <div className="w-10 h-10 rounded-full bg-secondary border border-border flex items-center justify-center overflow-hidden flex-shrink-0">
                  {profile?.avatar_url
                    ? <img src={profile.avatar_url} className="w-full h-full object-cover" alt="" />
                    : <span className="font-grotesk font-bold text-sm text-primary">{name[0]?.toUpperCase()}</span>
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-inter font-semibold text-sm truncate">{name}</p>
                  <p className="font-mono text-[10px] text-muted-foreground truncate">{email}</p>
                  <p className="font-mono text-[10px] text-primary">{sentCount} message{sentCount > 1 ? 's' : ''}</p>
                </div>
                <button onClick={() => { navigator.clipboard.writeText(email); toast.success('Email copié'); }} className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground transition-colors">
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>

        {/* Messages thread */}
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <div className="px-4 py-3 border-b border-border flex items-center justify-between">
            <span className="font-grotesk font-semibold text-sm">Messages</span>
            <span className="font-mono text-xs text-muted-foreground">{convMessages.length} messages</span>
          </div>

          <div className="p-4 space-y-3 max-h-[45vh] overflow-y-auto">
            {convMessages.map(msg => (
              <ConvMessageBubble
                key={msg.id}
                msg={msg}
                isFirst={msg.sender_email === personA}
                participantNames={selectedConv.participantNames}
                onDelete={(id) => { if (window.confirm('Supprimer ce message ?')) deleteMessage.mutate(id); }}
                onEdit={(id, content) => editMessage.mutate({ id, content })}
              />
            ))}
            {convMessages.length === 0 && (
              <p className="text-center font-inter text-sm text-muted-foreground py-8">Aucun message</p>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Admin input zone */}
          <div className="border-t p-4 space-y-3"
            style={{
              background: msgType === 'warning'
                ? 'linear-gradient(180deg, hsl(38 90% 4%) 0%, hsl(38 80% 3%) 100%)'
                : msgType === 'note'
                  ? 'hsl(214 40% 6%)'
                  : 'linear-gradient(180deg, hsl(205 90% 5%) 0%, hsl(214 50% 5%) 100%)',
              borderTopColor: msgType === 'warning' ? 'rgba(251,146,60,0.2)' : msgType === 'note' ? 'rgba(255,255,255,0.08)' : 'rgba(56,170,220,0.2)',
            }}
          >
            {/* Type selector */}
            <div className="flex items-center gap-2 flex-wrap">
              {Object.entries(MSG_TYPES).map(([key, cfg]) => {
                const Icon = cfg.icon;
                return (
                  <button
                    key={key}
                    onClick={() => setMsgType(key)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-inter border transition-all ${
                      msgType === key
                        ? `${cfg.color} bg-current/10 border-current/30`
                        : 'text-muted-foreground border-border hover:border-border/80'
                    }`}
                  >
                    <Icon className="w-3 h-3" /> {cfg.label}
                  </button>
                );
              })}
            </div>

            {/* Input */}
            <div className="flex gap-2">
              <Textarea
                value={adminMsg}
                onChange={e => setAdminMsg(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); if (adminMsg.trim()) sendAdminMessage.mutate({ conv: selectedConv }); } }}
                placeholder={MSG_TYPES[msgType].placeholder}
                className="bg-secondary/50 font-inter text-sm resize-none min-h-[60px]"
                style={{
                  borderColor: msgType === 'warning' ? 'rgba(251,146,60,0.3)' : msgType === 'note' ? 'rgba(255,255,255,0.1)' : 'rgba(56,170,220,0.25)',
                }}
              />
              <Button
                onClick={() => sendAdminMessage.mutate({ conv: selectedConv })}
                disabled={!adminMsg.trim() || sendAdminMessage.isPending}
                className={`self-end flex-shrink-0 px-4 gap-1.5 ${
                  msgType === 'warning' ? 'bg-orange-500 hover:bg-orange-600 text-white' : msgType === 'note' ? 'bg-secondary hover:bg-secondary/80 text-foreground' : ''
                }`}
              >
                <Send className="w-4 h-4" />
                Envoyer
              </Button>
            </div>

            {msgType === 'note' && (
              <p className="font-mono text-[9px] text-muted-foreground/50 flex items-center gap-1">
                <StickyNote className="w-2.5 h-2.5" /> Cette note est uniquement visible par les administrateurs
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ── LIST VIEW ──
  return (
    <div>
      <div className="flex items-start justify-between mb-6 gap-4 flex-wrap">
        <div>
          <h1 className="font-grotesk font-bold text-2xl flex items-center gap-3">
            <MessageCircle className="w-6 h-6 text-primary" /> Conversations
          </h1>
          <p className="font-inter text-sm text-muted-foreground">{conversations.length} conversations · {allMessages.length} messages</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Rechercher..." value={search} onChange={e => setSearch(e.target.value)} className="bg-card border-border pl-9 w-52" />
        </div>
      </div>

      <ConvStatsBar stats={stats} />

      <div className="flex gap-2 mb-4 flex-wrap">
        {STATUS_FILTER.map(f => (
          <button
            key={f.key}
            onClick={() => setStatusFilter(f.key)}
            className={`px-3 py-1.5 rounded-lg font-inter text-xs border transition-all ${
              statusFilter === f.key ? 'bg-primary/15 border-primary/30 text-primary' : 'border-border text-muted-foreground hover:text-foreground'
            }`}
          >
            {f.label}
            <span className="ml-1.5 font-mono text-[9px] opacity-70">
              ({f.key === 'all' ? conversations.length : conversations.filter(c => c.status === f.key).length})
            </span>
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-10">
          <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="space-y-2">
          <AnimatePresence>
            {filtered.map((conv, i) => {
              const names = Object.values(conv.participantNames).filter(Boolean);
              const msgCount = conv.messages.length;
              return (
                <motion.div
                  key={conv.convId}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.02 }}
                  className="flex items-center gap-3 p-3 sm:p-4 rounded-xl bg-card border border-border hover:border-primary/20 transition-colors"
                >
                  <div className="flex -space-x-2 flex-shrink-0">
                    {conv.participantList.filter(e => e !== 'admin@brenneaerial.fr').slice(0, 2).map((email, idx) => {
                      const profile = userMap[email];
                      const name = conv.participantNames[email] || email;
                      return (
                        <div key={email} className="w-9 h-9 rounded-full bg-secondary border-2 border-background flex items-center justify-center overflow-hidden" style={{ zIndex: 2 - idx }}>
                          {profile?.avatar_url
                            ? <img src={profile.avatar_url} className="w-full h-full object-cover" alt="" />
                            : <span className="font-grotesk font-bold text-xs text-primary">{name[0]?.toUpperCase()}</span>
                          }
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-0.5">
                      <span className="font-inter font-semibold text-sm truncate">{names.join(' ↔ ')}</span>
                      <ConvStatusBadge status={conv.status} locked={conv.isLocked} />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] text-muted-foreground">{msgCount} message{msgCount > 1 ? 's' : ''}</span>
                      {conv.lastMsg && (
                        <>
                          <span className="text-muted-foreground/40 text-[10px]">·</span>
                          <span className="font-inter text-[11px] text-muted-foreground truncate max-w-[200px]">"{conv.lastMsg.content}"</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    {conv.lastMsg?.created_date && (
                      <span className="font-mono text-[10px] text-muted-foreground hidden sm:block">
                        {format(new Date(conv.lastMsg.created_date), 'd MMM', { locale: fr })}
                      </span>
                    )}
                    <Button size="sm" variant="outline" className="border-border text-xs gap-1.5" onClick={() => setSelectedConv(conv)}>
                      <Eye className="w-3 h-3" /> Voir
                    </Button>
                    <Button
                      size="sm" variant="ghost"
                      className="text-destructive/60 hover:text-destructive hover:bg-destructive/10 px-2"
                      onClick={() => { if (window.confirm(`Supprimer la conversation entre ${names.join(' et ')} ?`)) deleteConversation.mutate(conv.convId); }}
                      disabled={deleteConversation.isPending}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
          {filtered.length === 0 && (
            <div className="text-center py-16 text-muted-foreground font-inter text-sm">Aucune conversation trouvée</div>
          )}
        </div>
      )}
    </div>
  );
}