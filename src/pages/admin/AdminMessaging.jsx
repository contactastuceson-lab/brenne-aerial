import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Send, Bell, Loader2, Flag, Users, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const OFFICIAL_CONV_ID = (recipientEmail) => `brenne_aerial_official_${recipientEmail}`;

export default function AdminMessaging() {
  const qc = useQueryClient();
  const [notifForm, setNotifForm] = useState({ user_email: '', title: '', content: '', type: 'system', bulk: false });
  const [msgForm, setMsgForm] = useState({ recipient_email: '', subject: '', content: '', is_priority: false });
  const [officialForm, setOfficialForm] = useState({ recipient_email: '', content: '' });
  const [openDropdown, setOpenDropdown] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  const { data: messages = [] } = useQuery({ queryKey: ['adm-msgs-all'], queryFn: () => base44.entities.Message.list('-created_date', 100) });
  const { data: notifs = [] } = useQuery({ queryKey: ['adm-notifs-all'], queryFn: () => base44.entities.Notification.list('-created_date', 100) });
  const { data: usersData = { users: [] } } = useQuery({
    queryKey: ['adm-users-msg'],
    queryFn: async () => {
      const res = await base44.functions.invoke('getAdminUsers', {});
      return res.data;
    },
  });
  const users = usersData.users;

  useEffect(() => {
    base44.auth.me().then(setCurrentUser);
  }, []);

  const sendNotif = useMutation({
    mutationFn: async () => {
      if (notifForm.bulk) {
        await Promise.all(users.map(u => base44.entities.Notification.create({ ...notifForm, user_email: u.email })));
      } else {
        await base44.entities.Notification.create(notifForm);
      }
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['adm-notifs-all'] }); setNotifForm(p => ({ ...p, user_email: '', title: '', content: '' })); toast.success('Notification envoyée'); },
  });

  const sendMsg = useMutation({
    mutationFn: async () => {
      const me = await base44.auth.me();
      await base44.entities.Message.create({ sender_email: me.email, sender_name: me.full_name, ...msgForm });
      await base44.entities.Notification.create({ user_email: msgForm.recipient_email, title: 'Nouveau message de l\'admin', content: msgForm.subject, type: 'new_message' });
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['adm-msgs-all'] }); setMsgForm({ recipient_email: '', subject: '', content: '', is_priority: false }); toast.success('Message envoyé'); },
  });

  const sendOfficialMsg = useMutation({
    mutationFn: async () => {
      const convId = OFFICIAL_CONV_ID(officialForm.recipient_email);
      const recipient = users.find(u => u.email === officialForm.recipient_email);
      await base44.entities.ChatMessage.create({
        conversation_id: convId,
        sender_email: 'officiel@brenne-aerial.fr',
        sender_name: 'Brenne Aerial',
        sender_avatar: '',
        recipient_email: officialForm.recipient_email,
        recipient_name: recipient?.full_name || officialForm.recipient_email,
        content: officialForm.content,
        is_request: false,
        request_status: 'accepted',
        is_read: false,
        is_official: true,
      });
      await base44.entities.Notification.create({
        user_email: officialForm.recipient_email,
        title: '📢 Message officiel de Brenne Aerial',
        content: officialForm.content.substring(0, 80) + (officialForm.content.length > 80 ? '…' : ''),
        type: 'system',
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['adm-msgs-all'] });
      setOfficialForm({ recipient_email: '', content: '' });
      toast.success('Message officiel envoyé');
    },
  });

  return (
    <div>
      <h1 className="font-grotesk font-bold text-2xl mb-8">Messagerie & Notifications</h1>

      <Tabs defaultValue="official" className="space-y-6">
        <TabsList className="bg-card border border-border">
          <TabsTrigger value="official" className="font-inter text-sm gap-2"><ShieldCheck className="w-4 h-4" />Message Officiel</TabsTrigger>
          <TabsTrigger value="notifications" className="font-inter text-sm gap-2"><Bell className="w-4 h-4" />Notifications</TabsTrigger>
          <TabsTrigger value="messages" className="font-inter text-sm gap-2"><Send className="w-4 h-4" />Messages</TabsTrigger>
        </TabsList>

        {/* ── Official Message Tab ── */}
         <TabsContent value="official" className="space-y-5">
           {currentUser?.role !== 'admin' ? (
             <div className="p-5 rounded-xl bg-destructive/10 border border-destructive/30 text-center">
               <p className="font-inter text-sm text-destructive">Seuls les administrateurs peuvent envoyer des messages officiels.</p>
             </div>
           ) : (
           <div className="p-5 rounded-xl bg-card border border-primary/30 space-y-4">
            <div className="flex items-center gap-3 pb-2 border-b border-border">
              <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-grotesk font-bold text-sm">Message Officiel Brenne Aerial</h3>
                <p className="font-inter text-xs text-muted-foreground">Envoyé depuis le profil officiel — l'utilisateur ne peut pas répondre</p>
              </div>
            </div>
            <div className="relative">
              <button
                onClick={() => setOpenDropdown(!openDropdown)}
                className="w-full text-left px-3 py-2 rounded-lg border border-border bg-secondary hover:bg-secondary/80 transition-colors font-inter text-sm"
              >
                {officialForm.recipient_email ? users.find(u => u.email === officialForm.recipient_email)?.full_name : 'Sélectionner un destinataire'}
              </button>
              {openDropdown && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto">
                  {users.map(u => (
                    <button
                      key={u.id}
                      onClick={() => { setOfficialForm(p => ({ ...p, recipient_email: u.email })); setOpenDropdown(false); }}
                      className="w-full text-left px-3 py-2 hover:bg-secondary transition-colors font-inter text-sm border-b border-border last:border-b-0"
                    >
                      <span className="font-medium text-foreground">{u.full_name}</span>
                      <span className="text-muted-foreground text-xs ml-2">({u.email})</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <Textarea
              placeholder="Contenu du message officiel..."
              value={officialForm.content}
              onChange={e => setOfficialForm(p => ({ ...p, content: e.target.value }))}
              className="bg-secondary border-border min-h-[100px]"
            />
            <div className="bg-primary/5 border border-primary/15 rounded-lg px-3 py-2 font-inter text-xs text-muted-foreground">
              💡 Ce message apparaîtra dans la messagerie de l'utilisateur sous le nom <strong className="text-primary">Brenne Aerial</strong> avec un badge officiel. La réponse sera désactivée.
            </div>
            <Button
              onClick={() => sendOfficialMsg.mutate()}
              disabled={!officialForm.recipient_email || !officialForm.content || sendOfficialMsg.isPending}
              className="bg-primary text-primary-foreground gap-2"
            >
              {sendOfficialMsg.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
              Envoyer le message officiel
              </Button>
              </div>
              )}
              </TabsContent>

        <TabsContent value="notifications" className="space-y-5">
          <div className="p-5 rounded-xl bg-card border border-border space-y-3">
            <h3 className="font-grotesk font-semibold text-sm">Envoyer une notification</h3>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={notifForm.bulk} onChange={e => setNotifForm(p => ({ ...p, bulk: e.target.checked }))} />
              <span className="font-inter text-xs text-muted-foreground flex items-center gap-1"><Users className="w-3 h-3" />Envoyer à tous</span>
            </label>
            {!notifForm.bulk && (
              <select value={notifForm.user_email} onChange={e => setNotifForm(p => ({ ...p, user_email: e.target.value }))}
                className="w-full bg-secondary border border-border rounded-lg px-3 py-2 font-inter text-sm text-foreground">
                <option value="">Sélectionner un utilisateur</option>
                {users.map(u => <option key={u.id} value={u.email}>{u.full_name} ({u.email})</option>)}
              </select>
            )}
            <Input placeholder="Titre *" value={notifForm.title} onChange={e => setNotifForm(p => ({ ...p, title: e.target.value }))} className="bg-secondary border-border" />
            <Textarea placeholder="Contenu (optionnel)" value={notifForm.content} onChange={e => setNotifForm(p => ({ ...p, content: e.target.value }))} className="bg-secondary border-border" />
            <Button onClick={() => sendNotif.mutate()} disabled={(!notifForm.bulk && !notifForm.user_email) || !notifForm.title || sendNotif.isPending} className="bg-primary text-primary-foreground">
              {sendNotif.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Bell className="w-4 h-4 mr-2" />} Envoyer
            </Button>
          </div>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {notifs.map(n => (
              <div key={n.id} className="p-3 rounded-lg bg-card border border-border">
                <div className="flex justify-between mb-1">
                  <p className="font-inter text-sm font-medium">{n.title}</p>
                  <span className="font-mono text-[10px] text-muted-foreground">{n.created_date ? format(new Date(n.created_date), 'd MMM', { locale: fr }) : ''}</span>
                </div>
                <p className="font-mono text-xs text-muted-foreground">→ {n.user_email}</p>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="messages" className="space-y-5">
          <div className="p-5 rounded-xl bg-card border border-border space-y-3">
            <h3 className="font-grotesk font-semibold text-sm">Envoyer un message</h3>
            <select value={msgForm.recipient_email} onChange={e => setMsgForm(p => ({ ...p, recipient_email: e.target.value }))}
              className="w-full bg-secondary border border-border rounded-lg px-3 py-2 font-inter text-sm text-foreground">
              <option value="">Destinataire</option>
              {users.map(u => <option key={u.id} value={u.email}>{u.full_name}</option>)}
            </select>
            <Input placeholder="Objet" value={msgForm.subject} onChange={e => setMsgForm(p => ({ ...p, subject: e.target.value }))} className="bg-secondary border-border" />
            <Textarea placeholder="Message..." value={msgForm.content} onChange={e => setMsgForm(p => ({ ...p, content: e.target.value }))} className="bg-secondary border-border" />
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-inter text-muted-foreground">
                <input type="checkbox" checked={msgForm.is_priority} onChange={e => setMsgForm(p => ({ ...p, is_priority: e.target.checked }))} />
                <Flag className="w-3 h-3 text-destructive" /> Prioritaire
              </label>
              <Button onClick={() => sendMsg.mutate()} disabled={!msgForm.recipient_email || !msgForm.content || sendMsg.isPending} className="bg-primary text-primary-foreground">
                {sendMsg.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </Button>
            </div>
          </div>
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {messages.map(m => (
              <div key={m.id} className={`p-3 rounded-lg bg-card border ${m.is_priority ? 'border-destructive/30' : 'border-border'}`}>
                <div className="flex items-center gap-2 mb-1">
                  {m.is_priority && <Flag className="w-3 h-3 text-destructive" />}
                  <span className="font-mono text-xs text-accent">{m.sender_name || m.sender_email}</span>
                  <span className="font-mono text-[10px] text-muted-foreground">→ {m.recipient_email}</span>
                  <span className="font-mono text-[10px] text-muted-foreground ml-auto">{m.created_date ? format(new Date(m.created_date), 'd MMM HH:mm', { locale: fr }) : ''}</span>
                </div>
                {m.subject && <p className="font-inter text-sm font-medium">{m.subject}</p>}
                <p className="font-inter text-xs text-muted-foreground">{m.content}</p>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}