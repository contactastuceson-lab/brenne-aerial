import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { MessageCircle, Search, Lock, Eye } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function AdminConversations() {
  const [search, setSearch] = useState('');
  const [selectedConv, setSelectedConv] = useState(null);

  const { data: allMessages = [], isLoading } = useQuery({
    queryKey: ['admin-all-messages'],
    queryFn: () => base44.entities.ChatMessage.list('-created_date', 500),
  });

  const conversations = useMemo(() => {
    const map = {};
    allMessages.forEach(m => {
      const cid = m.conversation_id;
      if (!map[cid]) {
        map[cid] = {
          convId: cid,
          participants: new Set(),
          messages: [],
          participantNames: {},
        };
      }
      map[cid].messages.push(m);
      map[cid].participants.add(m.sender_email);
      map[cid].participants.add(m.recipient_email);
      if (m.sender_name) map[cid].participantNames[m.sender_email] = m.sender_name;
      if (m.recipient_name) map[cid].participantNames[m.recipient_email] = m.recipient_name;
    });
    return Object.values(map).map(conv => ({
      ...conv,
      lastMsg: conv.messages.sort((a, b) => new Date(b.created_date) - new Date(a.created_date))[0],
      participantList: Array.from(conv.participants),
      isAccepted: conv.messages.some(m => m.is_request && m.request_status === 'accepted') || conv.messages.some(m => !m.is_request),
    })).sort((a, b) => new Date(b.lastMsg?.created_date) - new Date(a.lastMsg?.created_date));
  }, [allMessages]);

  const filtered = conversations.filter(c => {
    if (!search) return true;
    const names = Object.values(c.participantNames).join(' ').toLowerCase();
    const emails = c.participantList.join(' ').toLowerCase();
    return names.includes(search.toLowerCase()) || emails.includes(search.toLowerCase());
  });

  const convMessages = useMemo(() => {
    if (!selectedConv) return [];
    return allMessages
      .filter(m => m.conversation_id === selectedConv.convId)
      .sort((a, b) => new Date(a.created_date) - new Date(b.created_date));
  }, [selectedConv, allMessages]);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-grotesk font-bold text-2xl flex items-center gap-3">
            <MessageCircle className="w-6 h-6 text-primary" /> Conversations
          </h1>
          <p className="font-inter text-sm text-muted-foreground">{conversations.length} conversations</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="bg-card border-border pl-9 w-48"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-10">
          <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(conv => (
            <div key={conv.convId} className="flex items-start gap-4 p-4 rounded-xl bg-card border border-border hover:border-primary/20 transition-colors">
              <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                <MessageCircle className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-inter font-medium text-sm">
                    {Object.values(conv.participantNames).join(' ↔ ') || conv.participantList.join(' ↔ ')}
                  </span>
                  {!conv.isAccepted && (
                    <span className="flex items-center gap-1 font-mono text-[9px] text-yellow-400 bg-yellow-400/10 border border-yellow-400/20 px-2 py-0.5 rounded-full">
                      <Lock className="w-2.5 h-2.5" /> En attente
                    </span>
                  )}
                </div>
                <p className="font-mono text-[10px] text-muted-foreground">{conv.messages.length} messages</p>
                {conv.lastMsg && (
                  <p className="font-inter text-xs text-muted-foreground mt-0.5 truncate">
                    "{conv.lastMsg.content}"
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {conv.lastMsg?.created_date && (
                  <span className="font-mono text-[9px] text-muted-foreground">
                    {format(new Date(conv.lastMsg.created_date), 'd MMM', { locale: fr })}
                  </span>
                )}
                <Button size="sm" variant="outline" className="border-border text-xs gap-1.5" onClick={() => setSelectedConv(conv)}>
                  <Eye className="w-3 h-3" /> Voir
                </Button>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="text-center py-16 text-muted-foreground font-inter text-sm">Aucune conversation</div>
          )}
        </div>
      )}

      <Dialog open={!!selectedConv} onOpenChange={() => setSelectedConv(null)}>
        <DialogContent className="bg-card border-border max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="font-grotesk font-bold text-base">
              Conversation — {selectedConv && Object.values(selectedConv.participantNames).join(' ↔ ')}
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto space-y-3 pr-2">
            {convMessages.map(msg => (
              <div key={msg.id} className={`flex ${msg.sender_email < msg.recipient_email ? 'justify-start' : 'justify-end'}`}>
                <div className="max-w-[75%]">
                  <p className="font-mono text-[9px] text-muted-foreground mb-1">{msg.sender_name || msg.sender_email}</p>
                  <div className={`px-3 py-2 rounded-xl font-inter text-sm ${msg.sender_email < msg.recipient_email ? 'bg-secondary border border-border' : 'bg-primary/20 border border-primary/30'}`}>
                    {msg.is_request && (
                      <span className="font-mono text-[9px] text-primary/70 block mb-1 flex items-center gap-1">
                        <Lock className="w-2.5 h-2.5" /> Demande de contact
                      </span>
                    )}
                    {msg.content}
                  </div>
                  <p className="font-mono text-[9px] text-muted-foreground mt-1">
                    {msg.created_date ? format(new Date(msg.created_date), 'd MMM · HH:mm', { locale: fr }) : ''}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}