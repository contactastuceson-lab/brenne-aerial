import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Bell, MessageSquare, Award, User, Send, Loader2, FileText, ChevronRight, Flag, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import BadgeChip from '@/components/ui/BadgeChip';
import StatusBadge from '@/components/ui/StatusBadge';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Link } from 'react-router-dom';

export default function DashboardPage() {
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [msgForm, setMsgForm] = useState({ recipient_email: '', subject: '', content: '', is_priority: false });

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => base44.auth.redirectToLogin('/dashboard'));
  }, []);

  const { data: notifs = [] } = useQuery({
    queryKey: ['my-notifs', user?.email],
    queryFn: () => base44.entities.Notification.filter({ user_email: user.email }, '-created_date', 30),
    enabled: !!user?.email,
  });

  const { data: myQuotes = [] } = useQuery({
    queryKey: ['my-quotes', user?.email],
    queryFn: () => base44.entities.Quote.filter({ client_email: user.email }, '-created_date', 10),
    enabled: !!user?.email,
  });

  const { data: messages = [] } = useQuery({
    queryKey: ['my-messages', user?.email],
    queryFn: async () => {
      const [sent, recv] = await Promise.all([
        base44.entities.Message.filter({ sender_email: user.email }, '-created_date', 20),
        base44.entities.Message.filter({ recipient_email: user.email }, '-created_date', 20),
      ]);
      return [...sent, ...recv].sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
    },
    enabled: !!user?.email,
  });

  const { data: allUsers = [] } = useQuery({
    queryKey: ['users-list'],
    queryFn: () => base44.entities.User.list(),
    enabled: !!user,
  });

  const markRead = useMutation({
    mutationFn: (id) => base44.entities.Notification.update(id, { is_read: true }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['my-notifs'] }),
  });

  const sendMsg = useMutation({
    mutationFn: async () => {
      await base44.entities.Message.create({
        sender_email: user.email, sender_name: user.full_name,
        recipient_name: allUsers.find(u => u.email === msgForm.recipient_email)?.full_name || msgForm.recipient_email,
        ...msgForm,
      });
      await base44.entities.Notification.create({
        user_email: msgForm.recipient_email,
        title: 'Nouveau message',
        content: `${user.full_name} : ${msgForm.subject || msgForm.content.substring(0, 50)}`,
        type: 'new_message',
        link: '/dashboard',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-messages'] });
      setMsgForm({ recipient_email: '', subject: '', content: '', is_priority: false });
      toast.success('Message envoyé');
    },
  });

  if (!user) {
    return <div className="min-h-screen flex items-center justify-center"><div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;
  }

  const unread = notifs.filter(n => !n.is_read).length;
  const unreadMsg = messages.filter(m => !m.is_read && m.recipient_email === user.email).length;

  return (
    <div className="pt-20 min-h-screen px-5 lg:px-10 py-10">
      <div className="max-w-5xl mx-auto">
        {/* Profile header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10 p-6 rounded-2xl bg-card border border-border">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center flex-shrink-0 sky-glow">
              {user.avatar_url ? (
                <img src={user.avatar_url} alt="" className="w-full h-full object-cover rounded-xl" />
              ) : (
                <span className="font-grotesk font-bold text-primary text-xl">
                  {user.full_name?.[0]?.toUpperCase() || 'U'}
                </span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="font-grotesk font-bold text-xl">{user.full_name}</h1>
              <p className="font-mono text-xs text-muted-foreground">{user.email}</p>
              {user.badges?.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {user.badges.map(b => <BadgeChip key={b} badge={b} />)}
                </div>
              )}
            </div>
            <Link to="/quote">
              <Button size="sm" className="bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 font-grotesk">
                Nouveau devis
              </Button>
            </Link>
          </div>
        </motion.div>

        <Tabs defaultValue="notifications">
          <TabsList className="bg-card border border-border mb-6">
            <TabsTrigger value="notifications" className="gap-1.5 font-inter text-sm">
              <Bell className="w-4 h-4" /> Notifs {unread > 0 && <span className="w-4 h-4 rounded-full bg-primary text-primary-foreground font-mono text-[10px] flex items-center justify-center">{unread}</span>}
            </TabsTrigger>
            <TabsTrigger value="messages" className="gap-1.5 font-inter text-sm">
              <MessageSquare className="w-4 h-4" /> Messages {unreadMsg > 0 && <span className="w-4 h-4 rounded-full bg-primary text-primary-foreground font-mono text-[10px] flex items-center justify-center">{unreadMsg}</span>}
            </TabsTrigger>
            <TabsTrigger value="quotes" className="gap-1.5 font-inter text-sm">
              <FileText className="w-4 h-4" /> Mes devis
            </TabsTrigger>
            <TabsTrigger value="badges" className="gap-1.5 font-inter text-sm">
              <Award className="w-4 h-4" /> Badges
            </TabsTrigger>
          </TabsList>

          {/* Notifications */}
          <TabsContent value="notifications" className="space-y-2">
            {notifs.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground font-inter text-sm">Aucune notification</div>
            ) : notifs.map(n => (
              <div key={n.id} onClick={() => !n.is_read && markRead.mutate(n.id)}
                className={`p-4 rounded-xl border cursor-pointer transition-colors ${n.is_read ? 'bg-card border-border' : 'bg-primary/5 border-primary/20'}`}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-inter text-sm font-medium">{n.title}</p>
                    {n.content && <p className="font-inter text-xs text-muted-foreground mt-1">{n.content}</p>}
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="font-mono text-[10px] text-muted-foreground">
                      {n.created_date ? format(new Date(n.created_date), 'd MMM', { locale: fr }) : ''}
                    </span>
                    {!n.is_read && <div className="w-2 h-2 rounded-full bg-primary" />}
                  </div>
                </div>
              </div>
            ))}
          </TabsContent>

          {/* Messages */}
          <TabsContent value="messages" className="space-y-5">
            {/* Compose */}
            <div className="p-5 rounded-xl bg-card border border-border space-y-3">
              <h3 className="font-grotesk font-semibold text-sm">Nouveau message</h3>
              <select value={msgForm.recipient_email} onChange={e => setMsgForm(p => ({ ...p, recipient_email: e.target.value }))}
                className="w-full bg-secondary border border-border rounded-lg px-3 py-2 font-inter text-sm text-foreground">
                <option value="">Sélectionner un destinataire</option>
                {allUsers.filter(u => u.email !== user.email).map(u => (
                  <option key={u.id} value={u.email}>{u.full_name} ({u.email})</option>
                ))}
              </select>
              <Input placeholder="Objet" value={msgForm.subject} onChange={e => setMsgForm(p => ({ ...p, subject: e.target.value }))} className="bg-secondary border-border" />
              <Textarea placeholder="Votre message..." value={msgForm.content} onChange={e => setMsgForm(p => ({ ...p, content: e.target.value }))} className="bg-secondary border-border min-h-[90px]" />
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={msgForm.is_priority} onChange={e => setMsgForm(p => ({ ...p, is_priority: e.target.checked }))} className="rounded" />
                  <span className="font-inter text-xs text-muted-foreground flex items-center gap-1"><Flag className="w-3 h-3 text-destructive" />Prioritaire</span>
                </label>
                <Button onClick={() => sendMsg.mutate()} disabled={!msgForm.recipient_email || !msgForm.content || sendMsg.isPending} className="bg-primary text-primary-foreground text-sm">
                  {sendMsg.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              {messages.map(m => {
                const isSent = m.sender_email === user.email;
                return (
                  <div key={m.id} className={`p-4 rounded-xl border ${!m.is_read && !isSent ? 'bg-primary/5 border-primary/20' : 'bg-card border-border'}`}>
                    <div className="flex items-center gap-2 mb-1.5">
                      {m.is_priority && <Flag className="w-3 h-3 text-destructive" />}
                      <span className={`font-mono text-[10px] ${isSent ? 'text-primary' : 'text-accent'}`}>
                        {isSent ? `→ ${m.recipient_name || m.recipient_email}` : `← ${m.sender_name || m.sender_email}`}
                      </span>
                      <span className="font-mono text-[10px] text-muted-foreground ml-auto">
                        {m.created_date ? format(new Date(m.created_date), 'd MMM HH:mm', { locale: fr }) : ''}
                      </span>
                    </div>
                    {m.subject && <p className="font-inter text-sm font-medium mb-1">{m.subject}</p>}
                    <p className="font-inter text-xs text-muted-foreground">{m.content}</p>
                  </div>
                );
              })}
            </div>
          </TabsContent>

          {/* Quotes */}
          <TabsContent value="quotes" className="space-y-3">
            {myQuotes.length === 0 ? (
              <div className="text-center py-10">
                <p className="font-inter text-sm text-muted-foreground mb-4">Aucun devis pour le moment</p>
                <Link to="/quote"><Button size="sm" className="bg-primary text-primary-foreground">Demander un devis</Button></Link>
              </div>
            ) : myQuotes.map(q => (
              <div key={q.id} className="p-4 rounded-xl bg-card border border-border">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <StatusBadge status={q.status} />
                      <span className="font-mono text-xs text-muted-foreground">{q.date_souhaitee || '—'}</span>
                    </div>
                    <p className="font-grotesk font-semibold text-sm">{q.service_type?.replace(/_/g, ' ')}</p>
                    {q.prix_estime && <p className="font-mono text-xs text-primary mt-1">{q.prix_estime}€ estimé</p>}
                  </div>
                  <span className="font-mono text-[10px] text-muted-foreground">
                    {q.created_date ? format(new Date(q.created_date), 'd MMM yy', { locale: fr }) : ''}
                  </span>
                </div>
              </div>
            ))}
          </TabsContent>

          {/* Badges */}
          <TabsContent value="badges">
            <div className="p-6 rounded-xl bg-card border border-border">
              <h3 className="font-grotesk font-bold text-base mb-4">Vos badges</h3>
              {user.badges?.length > 0 ? (
                <div className="flex flex-wrap gap-3">
                  {user.badges.map(b => <BadgeChip key={b} badge={b} size="lg" />)}
                </div>
              ) : (
                <p className="font-inter text-sm text-muted-foreground">Aucun badge attribué pour l'instant.</p>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}