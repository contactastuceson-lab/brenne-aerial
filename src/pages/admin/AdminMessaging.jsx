import React, { useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Send, Bell, Loader2, MessageSquare, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

export default function AdminMessaging() {
  const { t, lang } = useLanguage();
  const queryClient = useQueryClient();

  const { data: messages = [] } = useQuery({
    queryKey: ['admin-all-messages'],
    queryFn: () => base44.entities.Message.list('-created_date', 50),
  });

  const { data: notifications = [] } = useQuery({
    queryKey: ['admin-all-notifications'],
    queryFn: () => base44.entities.Notification.list('-created_date', 50),
  });

  const { data: users = [] } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => base44.entities.User.list(),
  });

  const [notifForm, setNotifForm] = useState({ user_email: '', title: '', content: '', type: 'system' });
  const [bulkNotif, setBulkNotif] = useState(false);

  const sendNotif = useMutation({
    mutationFn: async () => {
      if (bulkNotif) {
        const promises = users.map(u =>
          base44.entities.Notification.create({ ...notifForm, user_email: u.email })
        );
        await Promise.all(promises);
      } else {
        await base44.entities.Notification.create(notifForm);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-all-notifications'] });
      setNotifForm({ user_email: '', title: '', content: '', type: 'system' });
      toast.success(lang === 'fr' ? 'Notification envoyée' : 'Notification sent');
    },
  });

  return (
    <div>
      <h1 className="font-syne font-extrabold text-2xl mb-8">{t('admin.messaging')}</h1>

      <Tabs defaultValue="notifications" className="space-y-6">
        <TabsList className="bg-card border border-border">
          <TabsTrigger value="notifications" className="font-inter text-sm gap-2">
            <Bell className="w-4 h-4" /> Notifications
          </TabsTrigger>
          <TabsTrigger value="messages" className="font-inter text-sm gap-2">
            <MessageSquare className="w-4 h-4" /> Messages
          </TabsTrigger>
        </TabsList>

        {/* Send notification */}
        <TabsContent value="notifications" className="space-y-6">
          <div className="p-5 rounded-xl bg-card border border-border space-y-4">
            <h3 className="font-syne font-bold text-sm">
              {lang === 'fr' ? 'Envoyer une notification' : 'Send notification'}
            </h3>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={bulkNotif}
                  onChange={(e) => setBulkNotif(e.target.checked)}
                  className="rounded border-border"
                />
                <span className="font-inter text-xs text-muted-foreground">
                  {lang === 'fr' ? 'Envoyer à tous les utilisateurs' : 'Send to all users'}
                </span>
              </label>
            </div>
            {!bulkNotif && (
              <select
                value={notifForm.user_email}
                onChange={(e) => setNotifForm(p => ({ ...p, user_email: e.target.value }))}
                className="w-full bg-secondary border border-border rounded-lg px-3 py-2 font-inter text-sm text-foreground"
              >
                <option value="">{lang === 'fr' ? 'Sélectionner un utilisateur' : 'Select user'}</option>
                {users.map(u => (
                  <option key={u.id} value={u.email}>{u.full_name} ({u.email})</option>
                ))}
              </select>
            )}
            <Input
              placeholder={lang === 'fr' ? 'Titre' : 'Title'}
              value={notifForm.title}
              onChange={(e) => setNotifForm(p => ({ ...p, title: e.target.value }))}
              className="bg-secondary border-border"
            />
            <Textarea
              placeholder={lang === 'fr' ? 'Contenu (optionnel)' : 'Content (optional)'}
              value={notifForm.content}
              onChange={(e) => setNotifForm(p => ({ ...p, content: e.target.value }))}
              className="bg-secondary border-border"
            />
            <Button
              onClick={() => sendNotif.mutate()}
              disabled={(!bulkNotif && !notifForm.user_email) || !notifForm.title || sendNotif.isPending}
              className="bg-primary text-primary-foreground"
            >
              {sendNotif.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
              {t('common.send')}
            </Button>
          </div>

          {/* Notification history */}
          <div className="space-y-2">
            {notifications.map((n) => (
              <div key={n.id} className="p-4 rounded-xl bg-card border border-border">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-inter text-sm font-medium">{n.title}</span>
                  <span className="font-mono text-xs text-muted-foreground">
                    {new Date(n.created_date).toLocaleString(lang)}
                  </span>
                </div>
                <p className="font-mono text-xs text-muted-foreground">→ {n.user_email}</p>
                {n.content && <p className="font-inter text-xs text-muted-foreground mt-1">{n.content}</p>}
              </div>
            ))}
          </div>
        </TabsContent>

        {/* All messages */}
        <TabsContent value="messages" className="space-y-2">
          {messages.map((m) => (
            <div key={m.id} className="p-4 rounded-xl bg-card border border-border">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span className="font-inter text-xs text-accent">{m.sender_name || m.sender_email}</span>
                  <span className="font-mono text-xs text-muted-foreground">→</span>
                  <span className="font-inter text-xs text-primary">{m.recipient_email}</span>
                </div>
                <span className="font-mono text-xs text-muted-foreground">
                  {new Date(m.created_date).toLocaleString(lang)}
                </span>
              </div>
              {m.subject && <p className="font-inter text-sm font-medium">{m.subject}</p>}
              <p className="font-inter text-xs text-muted-foreground mt-1">{m.content}</p>
            </div>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}