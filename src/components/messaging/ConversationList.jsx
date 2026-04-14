import React, { useMemo, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { format, isToday, isYesterday } from 'date-fns';
import { fr } from 'date-fns/locale';
import { MessageCircle, CheckCircle, Star, Award, Zap, Shield, UserCheck } from 'lucide-react';
import VerificationIcons from '@/components/ui/VerificationIcon';

function getConversationId(emailA, emailB) {
  return [emailA, emailB].sort().join('_');
}

const BADGE_ICONS = {
  'Fondateur':     { icon: Star,        color: 'text-yellow-400' },
  'VIP':           { icon: Award,       color: 'text-purple-400' },
  'Admin':         { icon: Shield,      color: 'text-red-400' },
  'Officiel':      { icon: CheckCircle, color: 'text-accent' },
  'Vérifié':       { icon: CheckCircle, color: 'text-green-400' },
  'Collaborateur': { icon: UserCheck,   color: 'text-blue-400' },
  'Pilote':        { icon: Zap,         color: 'text-primary' },
  'Beta Testeur':  { icon: Zap,         color: 'text-pink-400' },
  'Partenaire':    { icon: Award,       color: 'text-orange-400' },
};

function formatTime(date) {
  const d = new Date(date);
  if (isToday(d)) return format(d, 'HH:mm');
  if (isYesterday(d)) return 'Hier';
  return format(d, 'dd/MM', { locale: fr });
}

export default function ConversationList({ user, selectedConvId, onSelectConv }) {
  const { data: allMessages = [], isLoading, refetch: refetchMessages } = useQuery({
    queryKey: ['all-chat-messages', user.email],
    queryFn: async () => {
      const [sent, recv] = await Promise.all([
        base44.entities.ChatMessage.filter({ sender_email: user.email }),
        base44.entities.ChatMessage.filter({ recipient_email: user.email }),
      ]);
      return [...sent, ...recv];
    },
    enabled: !!user.email,
    refetchInterval: 5000,
  });

  useEffect(() => {
    if (!user.email) return;
    const unsub = base44.entities.ChatMessage.subscribe((event) => {
      const d = event.data;
      if (d?.sender_email === user.email || d?.recipient_email === user.email) {
        refetchMessages();
      }
    });
    return unsub;
  }, [user.email, refetchMessages]);

  const { data: allUsers = [] } = useQuery({
    queryKey: ['all-users-conv'],
    queryFn: () => base44.entities.User.list(),
    enabled: !!user.email,
  });

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

    return Object.values(map).map(conv => {
      const profile = allUsers.find(u => u.email === conv.email);
      const lastSeen = profile?.last_seen ? new Date(profile.last_seen) : null;
      const isOnline = lastSeen && (Date.now() - lastSeen.getTime()) < 2 * 60 * 1000;
      return {
        ...conv,
        avatar: profile?.avatar_url,
        badges: profile?.badges || [],
        verifications: profile?.verifications || [],
        is_verified: profile?.verified_status === 'yes',
        isOnline,
        lastMsg: conv.messages.sort((a, b) => new Date(b.created_date) - new Date(a.created_date))[0],
        unread: conv.messages.filter(m => !m.is_read && m.recipient_email === user.email).length,
      };
    }).sort((a, b) => new Date(b.lastMsg?.created_date) - new Date(a.lastMsg?.created_date));
  }, [allMessages, user.email, allUsers]);

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
        <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-3">
          <MessageCircle className="w-6 h-6 text-primary/50" />
        </div>
        <p className="font-inter text-sm font-medium text-muted-foreground">Aucune conversation</p>
        <p className="font-inter text-[11px] text-muted-foreground/60 mt-1">Suivez des profils pour les contacter</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto space-y-1 pr-0.5">
      {conversations.map(conv => {
        const isSelected = selectedConvId === conv.convId;
        const topBadge = conv.badges?.[0];
        const badgeCfg = topBadge ? BADGE_ICONS[topBadge] : null;
        const BadgeIcon = badgeCfg?.icon;
        const hasUnread = conv.unread > 0;

        return (
          <button
            key={conv.convId}
            onClick={() => onSelectConv(conv)}
            className={`w-full text-left px-3 py-3 rounded-xl transition-all relative ${
              isSelected
                ? 'bg-primary/15 border border-primary/30'
                : hasUnread
                  ? 'bg-card border border-primary/10 hover:border-primary/25'
                  : 'bg-card border border-border hover:border-border/80 hover:bg-secondary/30'
            }`}
          >
            <div className="flex items-center gap-3">
              {/* Avatar */}
              <div className="relative flex-shrink-0">
                <div className="w-11 h-11 rounded-full bg-secondary border border-border flex items-center justify-center overflow-hidden">
                  {conv.avatar ? (
                    <img src={conv.avatar} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span className="font-grotesk font-bold text-base text-primary">
                      {conv.name?.[0]?.toUpperCase() || '?'}
                    </span>
                  )}
                </div>
                {conv.isOnline && (
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-background" />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                  <div className="flex items-center gap-1 min-w-0 flex-1">
                    <span className={`font-inter text-sm truncate ${hasUnread ? 'font-semibold text-foreground' : 'font-medium text-foreground/90'}`}>
                      {conv.name}
                    </span>
                    <VerificationIcons verifications={conv.verifications} />
                    {BadgeIcon && (
                      <BadgeIcon className={`w-3 h-3 flex-shrink-0 ${badgeCfg.color}`} />
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
                    {conv.lastMsg?.created_date && (
                      <span className={`font-mono text-[10px] ${hasUnread ? 'text-primary' : 'text-muted-foreground'}`}>
                        {formatTime(conv.lastMsg.created_date)}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <p className={`font-inter text-xs truncate flex-1 ${hasUnread ? 'text-foreground/80' : 'text-muted-foreground'}`}>
                    {conv.lastMsg?.sender_email === user.email && (
                      <span className="text-muted-foreground/60">Vous : </span>
                    )}
                    {conv.lastMsg?.content}
                  </p>
                  {hasUnread && (
                    <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground font-mono text-[10px] flex items-center justify-center flex-shrink-0 font-bold">
                      {conv.unread > 9 ? '9+' : conv.unread}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}