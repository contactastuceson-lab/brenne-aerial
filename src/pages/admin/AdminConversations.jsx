import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import {
  MessageCircle, Search, Lock, Eye, Trash2, Clock,
  CheckCircle, XCircle, ChevronLeft, Copy, MessageSquare
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

const STATUS_FILTER = [
  { key: 'all',      label: 'Tout',        color: 'text-foreground' },
  { key: 'open',     label: 'Ouvertes',    color: 'text-green-400' },
  { key: 'pending',  label: 'En attente',  color: 'text-yellow-400' },
  { key: 'declined', label: 'Refusées',    color: 'text-red-400' },
];

export default function AdminConversations() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedConv, setSelectedConv] = useState(null);
  const queryClient = useQueryClient();

  const { data: allMessages = [], isLoading } = useQuery({
    queryKey: ['admin-all-messages'],
    queryFn: () => base44.entities.ChatMessage.list('-created_date', 1000),
    refetchInterval: 10000,
  });

  const { data: allUsers = [] } = useQuery({
    queryKey: ['admin-users-conv'],
    queryFn: () => base44.entities.User.list(),
  });

  const userMap = useMemo(() => Object.fromEntries(allUsers.map(u => [u.email, u])), [allUsers]);

  // Delete a single message
  const deleteMessage = useMutation({
    mutationFn: (id) => base44.entities.ChatMessage.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-all-messages'] });
      toast.success('Message supprimé');
    },
  });

  // Delete full conversation
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

  // Conversations aggregation
  const conversations = useMemo(() => {
    const map = {};
    allMessages.forEach(m => {
      const cid = m.conversation_id;
      if (!map[cid]) {
        map[cid] = { convId: cid, participants: new Set(), messages: [], participantNames: {} };
      }
      map[cid].messages.push(m);
      map[cid].participants.add(m.sender_email);
      map[cid].participants.add(m.recipient_email);
      if (m.sender_name) map[cid].participantNames[m.sender_email] = m.sender_name;
      if (m.recipient_name) map[cid].participantNames[m.recipient_email] = m.recipient_name;
    });
    return Object.values(map).map(conv => {
      const msgs = conv.messages.sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
      const hasAccepted = conv.messages.some(m => m.is_request && m.request_status === 'accepted') || conv.messages.some(m => !m.is_request);
      const hasPending = conv.messages.some(m => m.is_request && m.request_status === 'pending');
      const hasDeclined = conv.messages.some(m => m.is_request && m.request_status === 'declined');
      const status = hasDeclined ? 'declined' : hasPending && !hasAccepted ? 'pending' : hasAccepted ? 'open' : 'pending';
      return {
        ...conv,
        participantList: Array.from(conv.participants),
        lastMsg: msgs[0],
        status,
      };
    }).sort((a, b) => new Date(b.lastMsg?.created_date) - new Date(a.lastMsg?.created_date));
  }, [allMessages]);

  const filtered = conversations.filter(c => {
    const matchSearch = !search ||
      Object.values(c.participantNames).join(' ').toLowerCase().includes(search.toLowerCase()) ||
      c.participantList.join(' ').toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || c.status === statusFilter;
    return matchSearch && matchStatus;
  });

  // Stats
  const stats = useMemo(() => ({
    total: conversations.length,
    open: conversations.filter(c => c.status === 'open').length,
    pending: conversations.filter(c => c.status === 'pending').length,
    declined: conversations.filter(c => c.status === 'declined').length,
    totalMessages: allMessages.length,
  }), [conversations, allMessages]);

  // Selected conversation messages sorted
  const convMessages = useMemo(() => {
    if (!selectedConv) return [];
    return allMessages
      .filter(m => m.conversation_id === selectedConv.convId)
      .sort((a, b) => new Date(a.created_date) - new Date(b.created_date));
  }, [selectedConv, allMessages]);

  const StatusBadge = ({ status }) => {
    const cfg = {
      open:     { icon: CheckCircle, color: 'text-green-400',  bg: 'bg-green-400/10',  border: 'border-green-400/20',  label: 'Ouverte' },
      pending:  { icon: Clock,       color: 'text-yellow-400', bg: 'bg-yellow-400/10', border: 'border-yellow-400/20', label: 'En attente' },
      declined: { icon: XCircle,     color: 'text-red-400',    bg: 'bg-red-400/10',    border: 'border-red-400/20',    label: 'Refusée' },
    }[status] || {};
    const Icon = cfg.icon;
    return (
      <span className={`flex items-center gap-1 font-mono text-[9px] px-2 py-0.5 rounded-full border ${cfg.color} ${cfg.bg} ${cfg.border}`}>
        <Icon className="w-2.5 h-2.5" /> {cfg.label}
      </span>
    );
  };

  // ── Conversation detail view ──
  if (selectedConv) {
    const names = Object.values(selectedConv.participantNames);
    const [personA, personB] = selectedConv.participantList;
    return (
      <div>
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => setSelectedConv(null)} className="p-2 rounded-xl hover:bg-secondary border border-border text-muted-foreground transition-colors">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="font-grotesk font-bold text-xl">{names.join(' ↔ ')}</h1>
            <p className="font-mono text-xs text-muted-foreground">{convMessages.length} messages · {selectedConv.convId}</p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <StatusBadge status={selectedConv.status} />
            <Button
              size="sm"
              variant="outline"
              className="border-destructive/40 text-destructive hover:bg-destructive/10 gap-1.5 text-xs"
              onClick={() => {
                if (window.confirm(`Supprimer toute la conversation entre ${names.join(' et ')} ?`)) {
                  deleteConversation.mutate(selectedConv.convId);
                }
              }}
              disabled={deleteConversation.isPending}
            >
              <Trash2 className="w-3.5 h-3.5" /> Supprimer la conversation
            </Button>
          </div>
        </div>

        {/* Participants cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
          {selectedConv.participantList.map(email => {
            const profile = userMap[email];
            const name = selectedConv.participantNames[email] || email;
            const sentCount = convMessages.filter(m => m.sender_email === email).length;
            return (
              <div key={email} className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border">
                <div className="w-10 h-10 rounded-full bg-secondary border border-border flex items-center justify-center overflow-hidden flex-shrink-0">
                  {profile?.avatar_url
                    ? <img src={profile.avatar_url} className="w-full h-full object-cover" alt="" />
                    : <span className="font-grotesk font-bold text-sm text-primary">{name[0]}</span>
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-inter font-semibold text-sm truncate">{name}</p>
                  <p className="font-mono text-[10px] text-muted-foreground truncate">{email}</p>
                  <p className="font-mono text-[10px] text-primary">{sentCount} message{sentCount > 1 ? 's' : ''} envoyé{sentCount > 1 ? 's' : ''}</p>
                </div>
                <button
                  onClick={() => { navigator.clipboard.writeText(email); toast.success('Email copié'); }}
                  className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground transition-colors"
                >
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
          <div className="p-4 space-y-3 max-h-[60vh] overflow-y-auto">
            {convMessages.map(msg => {
              const isFirst = msg.sender_email === personA;
              return (
                <div key={msg.id} className={`flex group ${isFirst ? 'justify-start' : 'justify-end'}`}>
                  <div className={`max-w-[75%] flex flex-col gap-0.5 ${isFirst ? 'items-start' : 'items-end'}`}>
                    <p className="font-mono text-[9px] text-muted-foreground px-1">
                      {selectedConv.participantNames[msg.sender_email] || msg.sender_email}
                    </p>
                    <div className={`relative px-3 py-2 rounded-xl font-inter text-sm ${
                      isFirst
                        ? 'bg-secondary border border-border rounded-tl-sm'
                        : 'bg-primary/20 border border-primary/30 rounded-tr-sm'
                    }`}>
                      {msg.is_request && (
                        <span className="font-mono text-[9px] text-yellow-400/80 flex items-center gap-1 mb-1">
                          <Lock className="w-2.5 h-2.5" />
                          {msg.request_status === 'pending' ? 'Demande de contact' : msg.request_status === 'accepted' ? 'Demande acceptée' : 'Demande refusée'}
                        </span>
                      )}
                      {msg.content}
                      {/* Delete button on hover */}
                      <button
                        onClick={() => { if (window.confirm('Supprimer ce message ?')) deleteMessage.mutate(msg.id); }}
                        className="absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 transition-opacity w-5 h-5 bg-destructive rounded-full flex items-center justify-center"
                        title="Supprimer le message"
                      >
                        <Trash2 className="w-2.5 h-2.5 text-white" />
                      </button>
                    </div>
                    <p className="font-mono text-[9px] text-muted-foreground px-1">
                      {msg.created_date ? format(new Date(msg.created_date), 'd MMM · HH:mm', { locale: fr }) : ''}
                    </p>
                  </div>
                </div>
              );
            })}
            {convMessages.length === 0 && (
              <p className="text-center font-inter text-sm text-muted-foreground py-8">Aucun message</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ── List view ──
  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between mb-6 gap-4 flex-wrap">
        <div>
          <h1 className="font-grotesk font-bold text-2xl flex items-center gap-3">
            <MessageCircle className="w-6 h-6 text-primary" /> Conversations
          </h1>
          <p className="font-inter text-sm text-muted-foreground">{conversations.length} conversations · {allMessages.length} messages</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="bg-card border-border pl-9 w-52"
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Total', value: stats.total, icon: MessageSquare, color: 'text-primary', bg: 'bg-primary/10' },
          { label: 'Ouvertes', value: stats.open, icon: CheckCircle, color: 'text-green-400', bg: 'bg-green-400/10' },
          { label: 'En attente', value: stats.pending, icon: Clock, color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
          { label: 'Refusées', value: stats.declined, icon: XCircle, color: 'text-red-400', bg: 'bg-red-400/10' },
        ].map(s => (
          <div key={s.label} className="bg-card border border-border rounded-xl p-3 flex items-center gap-3">
            <div className={`w-9 h-9 rounded-lg ${s.bg} flex items-center justify-center flex-shrink-0`}>
              <s.icon className={`w-4 h-4 ${s.color}`} />
            </div>
            <div>
              <p className={`font-grotesk font-bold text-xl ${s.color}`}>{s.value}</p>
              <p className="font-mono text-[10px] text-muted-foreground">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Status filter */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {STATUS_FILTER.map(f => (
          <button
            key={f.key}
            onClick={() => setStatusFilter(f.key)}
            className={`px-3 py-1.5 rounded-lg font-inter text-xs border transition-all ${
              statusFilter === f.key
                ? 'bg-primary/15 border-primary/30 text-primary'
                : 'border-border text-muted-foreground hover:text-foreground hover:border-border/80'
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
              const names = Object.values(conv.participantNames);
              const msgCount = conv.messages.length;
              return (
                <motion.div
                  key={conv.convId}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.02 }}
                  className="flex items-center gap-3 p-3 sm:p-4 rounded-xl bg-card border border-border hover:border-primary/20 transition-colors"
                >
                  {/* Avatars stack */}
                  <div className="flex -space-x-2 flex-shrink-0">
                    {conv.participantList.slice(0, 2).map((email, idx) => {
                      const profile = userMap[email];
                      const name = conv.participantNames[email] || email;
                      return (
                        <div
                          key={email}
                          className="w-9 h-9 rounded-full bg-secondary border-2 border-background flex items-center justify-center overflow-hidden"
                          style={{ zIndex: 2 - idx }}
                        >
                          {profile?.avatar_url
                            ? <img src={profile.avatar_url} className="w-full h-full object-cover" alt="" />
                            : <span className="font-grotesk font-bold text-xs text-primary">{name[0]?.toUpperCase()}</span>
                          }
                        </div>
                      );
                    })}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-0.5">
                      <span className="font-inter font-semibold text-sm truncate">
                        {names.join(' ↔ ')}
                      </span>
                      <StatusBadge status={conv.status} />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] text-muted-foreground">{msgCount} message{msgCount > 1 ? 's' : ''}</span>
                      {conv.lastMsg && (
                        <>
                          <span className="text-muted-foreground/40 text-[10px]">·</span>
                          <span className="font-inter text-[11px] text-muted-foreground truncate max-w-[200px]">
                            "{conv.lastMsg.content}"
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {conv.lastMsg?.created_date && (
                      <span className="font-mono text-[10px] text-muted-foreground hidden sm:block">
                        {format(new Date(conv.lastMsg.created_date), 'd MMM', { locale: fr })}
                      </span>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-border text-xs gap-1.5"
                      onClick={() => setSelectedConv(conv)}
                    >
                      <Eye className="w-3 h-3" /> Voir
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-destructive/60 hover:text-destructive hover:bg-destructive/10 px-2"
                      onClick={() => {
                        if (window.confirm(`Supprimer la conversation entre ${names.join(' et ')} ?`)) {
                          deleteConversation.mutate(conv.convId);
                        }
                      }}
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