import React, { useMemo, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { format, isToday, isYesterday } from 'date-fns';
import { fr } from 'date-fns/locale';
import { MessageCircle, CheckCircle, Star, Award, Zap, Shield, UserCheck, ShieldCheck } from 'lucide-react';
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
    staleTime: 10000,
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
    queryKey: ['public-users-conv'],
    queryFn: async () => {
      const res = await base44.functions.invoke('getPublicUsers', {});
      return Array.isArray(res.data) ? res.data : [];
    },
    enabled: !!user.email,
  });

  const conversations = useMemo(() => {
    const map = {};
    allMessages
      .filter(m => !m.is_request || m.request_status === 'accepted' || (m.is_request && m.request_status === 'pending'))
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
      const isOnline = lastSeen && (Date.now() - lastSeen.getTime()) < 20 * 1000;
      const isOfficial = conv.messages.some(m => m.is_official);
      return {
        ...conv,
        name: profile?.display_name || profile?.full_name || conv.name,
        avatar: isOfficial ? null : profile?.avatar_url,
        cover_url: profile?.cover_url,
        bio: profile?.bio,
        location: profile?.location,
        role: profile?.role,
        username: profile?.username,
        badges: profile?.badges || [],
        verifications: profile?.verifications || [],
        is_verified: profile?.verified_status === 'yes',
        isOnline,
        isOfficial,
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
            className={`w-full text-left px-3 py-3.5 rounded-xl transition-all relative ${
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
                <div className={`w-13 h-13 rounded-full flex items-center justify-center overflow-hidden ${conv.isOfficial ? 'bg-primary/10 border-2 border-primary/40' : 'bg-secondary border-2 border-border'}`}
                  style={{ width: 52, height: 52 }}>
                  {conv.isOfficial ? (
                    <ShieldCheck className="w-6 h-6 text-primary" />
                  ) : conv.avatar ? (
                    <img src={conv.avatar} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span className="font-grotesk font-bold text-xl text-primary">
                      {conv.name?.[0]?.toUpperCase() || '?'}
                    </span>
                  )}
                </div>
                {/* Online dot */}
                {!conv.isOfficial && conv.isOnline && (
                  <span className="absolute bottom-0.5 right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-background" />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                {/* Row 1 : name + time */}
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5 min-w-0 flex-1">
                    <span className={`font-grotesk text-sm truncate ${hasUnread ? 'font-bold text-foreground' : 'font-semibold text-foreground/90'}`}>
                      {conv.name}
                    </span>
                    <VerificationIcons verifications={conv.verifications} size="sm" user={conv} />
                    {conv.isOfficial && (
                      <span className="flex items-center gap-0.5 font-mono text-[9px] text-primary bg-primary/10 border border-primary/20 px-1.5 py-0.5 rounded-full flex-shrink-0 whitespace-nowrap">
                        <ShieldCheck className="w-2.5 h-2.5" /> Officiel
                      </span>
                    )}
                  </div>
                  <span className={`font-mono text-[10px] flex-shrink-0 ml-2 ${hasUnread ? 'text-primary font-bold' : 'text-muted-foreground'}`}>
                    {conv.lastMsg?.created_date ? formatTime(conv.lastMsg.created_date) : ''}
                  </span>
                </div>

                {/* Row 2 : badges */}
                {!conv.isOfficial && conv.badges?.length > 0 && (
                  <div className="flex items-center gap-1 mb-1 flex-wrap">
                    {conv.badges.slice(0, 3).map(badge => {
                      const cfg = BADGE_ICONS[badge];
                      if (!cfg) return null;
                      const BIcon = cfg.icon;
                      return (
                        <span key={badge} className={`flex items-center gap-0.5 font-mono text-[9px] px-1.5 py-0.5 rounded-full border border-current/20 bg-current/5 ${cfg.color}`}>
                          <BIcon className="w-2.5 h-2.5" />
                          {badge}
                        </span>
                      );
                    })}
                  </div>
                )}

                {/* Row 3 : last message + unread */}
                <div className="flex items-center justify-between gap-2">
                  <p className={`font-inter text-xs truncate flex-1 ${hasUnread ? 'text-foreground/80 font-medium' : 'text-muted-foreground'}`}>
                    {conv.lastMsg?.sender_email === user.email && (
                      <span className="text-muted-foreground/60">Vous : </span>
                    )}
                    {conv.lastMsg?.content}
                  </p>
                  {hasUnread && (
                    <span className="min-w-5 h-5 px-1 rounded-full bg-primary text-primary-foreground font-mono text-[10px] flex items-center justify-center flex-shrink-0 font-bold">
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