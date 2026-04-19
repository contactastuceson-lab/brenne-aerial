import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { MessageSquare, Bell, Award, User, Send, Loader2, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import BadgeDisplay from '@/components/shared/BadgeDisplay';
import { toast } from 'sonner';

export default function Dashboard() {
  const { t, lang } = useLanguage();
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser);
  }, []);

  const { data: notifications = [] } = useQuery({
    queryKey: ['my-notifications', user?.email],
    queryFn: () => base44.entities.Notification.filter({ user_email: user.email }, '-created_date'),
    enabled: !!user?.email,
  });

  const { data: messages = [] } = useQuery({
    queryKey: ['my-messages', user?.email],
    queryFn: async () => {
      const sent = await base44.entities.Message.filter({ sender_email: user.email }, '-created_date');
      const received = await base44.entities.Message.filter({ recipient_email: user.email }, '-created_date');
      return [...sent, ...received].sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
    },
    enabled: !!user?.email,
  });

  const { data: users = [] } = useQuery({
    queryKey: ['all-users'],
    queryFn: () => base44.entities.User.list(),
    enabled: !!user,
  });

  const [msgForm, setMsgForm] = useState({ recipient_email: '', subject: '', content: '' });

  const sendMsg = useMutation({
    mutationFn: async () => {
      await base44.entities.Message.create({
        sender_email: user.email,
        sender_name: user.full_name,
        ...msgForm,
      });
      await base44.entities.Notification.create({
        user_email: msgForm.recipient_email,
        title: lang === 'fr' ? 'Nouveau message' : 'New message',
        content: `${user.full_name}: ${msgForm.subject}`,
        type: 'new_message',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-messages'] });
      setMsgForm({ recipient_email: '', subject: '', content: '' });
      toast.success(lang === 'fr' ? 'Message envoyé' : 'Message sent');
    },
  });

  const markNotifRead = useMutation({
    mutationFn: (id) => base44.entities.Notification.update(id, { is_read: true }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['my-notifications'] }),
  });

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const unreadNotifs = notifications.filter(n => !n.is_read).length;

  return (
    <div className="min-h-screen py-32 px-6 lg:px-20">
      <div className="max-w-5xl mx-auto">
        {/* Profile header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <div className="flex items-start gap-5">
            <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center">
              <User className="w-7 h-7 text-primary" />
            </div>
            <div>
              <h1 className="font-syne font-extrabold text-2xl">{user.full_name}</h1>
              <p className="font-mono text-xs text-muted-foreground">{user.email}</p>
              <div className="mt-2">
                <BadgeDisplay badges={user.badges || []} />
              </div>
            </div>
          </div>
        </motion.div>

        <Tabs defaultValue="notifications" className="space-y-6">
          <TabsList className="bg-card border border-border">
            <TabsTrigger value="notifications" className="font-inter text-sm gap-2">
              <Bell className="w-4 h-4" />
              {t('dashboard.notifications')}
              {unreadNotifs > 0 && (
                <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground font-mono text-xs flex items-center justify-center">
                  {unreadNotifs}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="messages" className="font-inter text-sm gap-2">
              <MessageSquare className="w-4 h-4" />
              {t('dashboard.messages')}
            </TabsTrigger>
            <TabsTrigger value="badges" className="font-inter text-sm gap-2">
              <Award className="w-4 h-4" />
              {t('dashboard.badges')}
            </TabsTrigger>
          </TabsList>

          {/* Notifications */}
          <TabsContent value="notifications" className="space-y-3">
            {notifications.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground font-inter text-sm">
                {lang === 'fr' ? 'Aucune notification' : 'No notifications'}
              </div>
            ) : notifications.map((n) => (
              <div
                key={n.id}
                onClick={() => !n.is_read && markNotifRead.mutate(n.id)}
                className={`p-4 rounded-xl border cursor-pointer transition-colors ${
                  n.is_read ? 'bg-card border-border' : 'bg-primary/5 border-primary/20'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-inter text-sm font-medium">{n.title}</p>
                    {n.content && <p className="font-inter text-xs text-muted-foreground mt-1">{n.content}</p>}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-muted-foreground">
                      {new Date(n.created_date).toLocaleDateString(lang)}
                    </span>
                    {!n.is_read && <div className="w-2 h-2 rounded-full bg-primary" />}
                  </div>
                </div>
              </div>
            ))}
          </TabsContent>

          {/* Messages */}
          <TabsContent value="messages" className="space-y-6">
            {/* Compose */}
            <div className="p-6 rounded-xl bg-card border border-border space-y-4">
              <h3 className="font-syne font-bold text-sm">
                {lang === 'fr' ? 'Nouveau message' : 'New message'}
              </h3>
              <select
                value={msgForm.recipient_email}
                onChange={(e) => setMsgForm(p => ({ ...p, recipient_email: e.target.value }))}
                className="w-full bg-secondary border border-border rounded-lg px-3 py-2 font-inter text-sm text-foreground"
              >
                <option value="">{lang === 'fr' ? 'Sélectionner un destinataire' : 'Select recipient'}</option>
                {users.filter(u => u.email !== user.email).map(u => (
                  <option key={u.id} value={u.email}>{u.full_name} ({u.email})</option>
                ))}
              </select>
              <Input
                placeholder={lang === 'fr' ? 'Objet' : 'Subject'}
                value={msgForm.subject}
                onChange={(e) => setMsgForm(p => ({ ...p, subject: e.target.value }))}
                className="bg-secondary border-border"
              />
              <Textarea
                placeholder={lang === 'fr' ? 'Votre message...' : 'Your message...'}
                value={msgForm.content}
                onChange={(e) => setMsgForm(p => ({ ...p, content: e.target.value }))}
                className="bg-secondary border-border min-h-[100px]"
              />
              <Button
                onClick={() => sendMsg.mutate()}
                disabled={!msgForm.recipient_email || !msgForm.content || sendMsg.isPending}
                className="bg-primary text-primary-foreground font-inter text-sm"
              >
                {sendMsg.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
                {t('common.send')}
              </Button>
            </div>

            {/* Message list */}
            <div className="space-y-3">
              {messages.map((m) => {
                const isSent = m.sender_email === user.email;
                return (
                  <div key={m.id} className="p-4 rounded-xl bg-card border border-border">
                    <div className="flex items-center gap-2 mb-2">
                      <ChevronRight className={`w-3 h-3 ${isSent ? 'text-primary' : 'text-accent'}`} />
                      <span className="font-inter text-xs text-muted-foreground">
                        {isSent ? `→ ${m.recipient_email}` : `← ${m.sender_name || m.sender_email}`}
                      </span>
                      <span className="font-mono text-xs text-muted-foreground ml-auto">
                        {new Date(m.created_date).toLocaleString(lang)}
                      </span>
                    </div>
                    {m.subject && <p className="font-inter text-sm font-medium mb-1">{m.subject}</p>}
                    <p className="font-inter text-sm text-muted-foreground">{m.content}</p>
                  </div>
                );
              })}
            </div>
          </TabsContent>

          {/* Badges */}
          <TabsContent value="badges">
            <div className="p-8 rounded-xl bg-card border border-border">
              <h3 className="font-syne font-bold text-lg mb-6">{t('dashboard.badges')}</h3>
              {user.badges && user.badges.length > 0 ? (
                <BadgeDisplay badges={user.badges} size="lg" />
              ) : (
                <p className="font-inter text-sm text-muted-foreground">
                  {lang === 'fr' ? "Vous n'avez pas encore de badges." : "You don't have any badges yet."}
                </p>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}