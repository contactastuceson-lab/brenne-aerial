import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { MessageCircle } from 'lucide-react';

function getConversationId(emailA, emailB) {
  return [emailA, emailB].sort().join('_');
}

export default function ConversationList({ user, selectedConvId, onSelectConv }) {
  // All accepted messages involving the user
  const { data: allMessages = [], isLoading } = useQuery({
    queryKey: ['all-chat-messages', user.email],
    queryFn: async () => {
      const [sent, recv] = await Promise.all([
        base44.entities.ChatMessage.filter({ sender_email: user.email }),
        base44.entities.ChatMessage.filter({ recipient_email: user.email }),
      ]);
      return [...sent, ...recv];
    },
    enabled: !!user.email,
    refetchInterval: 3000,
  });

  // Group by conversation, only accepted ones
  const conversations = useMemo(() => {
    const map = {};
    allMessages
      .filter(m => !m.is_request || m.request_status === 'accepted')
      .forEach(m => {
        const cid = m.conversation_id;
        if (!map[cid]) {
          const otherEmail = m.sender_email === user.email ? m.recipient_email : m.sender_email;
          const otherName = m.sender_email === user.email ? m.recipient_name : m.sender_name;
          map[cid] = { convId: cid, email: otherEmail, name: otherName, messages: [] };
        }
        map[cid].messages.push(m);
      });

    return Object.values(map).map(conv => ({
      ...conv,
      lastMsg: conv.messages.sort((a, b) => new Date(b.created_date) - new Date(a.created_date))[0],
      unread: conv.messages.filter(m => !m.is_read && m.recipient_email === user.email).length,
    })).sort((a, b) => new Date(b.lastMsg?.created_date) - new Date(a.lastMsg?.created_date));
  }, [allMessages, user.email]);

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center py-10">
        <MessageCircle className="w-8 h-8 text-muted-foreground/40 mb-3" />
        <p className="font-inter text-xs text-muted-foreground">Aucune conversation</p>
        <p className="font-inter text-[10px] text-muted-foreground/60 mt-1">Suivez des profils pour les contacter</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto space-y-1 pr-1">
      {conversations.map(conv => (
        <button
          key={conv.convId}
          onClick={() => onSelectConv(conv)}
          className={`w-full text-left p-3 rounded-xl transition-all ${
            selectedConvId === conv.convId
              ? 'bg-primary/15 border border-primary/30'
              : 'bg-card border border-border hover:border-primary/20 hover:bg-card/80'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center flex-shrink-0 border border-border">
              <span className="font-grotesk font-bold text-sm text-primary">
                {conv.name?.[0]?.toUpperCase() || '?'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-0.5">
                <span className="font-inter font-medium text-sm truncate">{conv.name}</span>
                {conv.lastMsg?.created_date && (
                  <span className="font-mono text-[9px] text-muted-foreground flex-shrink-0 ml-2">
                    {format(new Date(conv.lastMsg.created_date), 'HH:mm', { locale: fr })}
                  </span>
                )}
              </div>
              <div className="flex items-center justify-between">
                <p className="font-inter text-[11px] text-muted-foreground truncate">{conv.lastMsg?.content}</p>
                {conv.unread > 0 && (
                  <span className="w-4 h-4 rounded-full bg-primary text-primary-foreground font-mono text-[9px] flex items-center justify-center flex-shrink-0 ml-2">
                    {conv.unread}
                  </span>
                )}
              </div>
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}