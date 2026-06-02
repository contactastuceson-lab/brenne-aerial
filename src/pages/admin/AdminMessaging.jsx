import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Send, Bell, Loader2, Flag, Users, ShieldCheck, Sparkles, MessageCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { hasAdminAccess } from '@/lib/roles';
import { motion } from 'framer-motion';
import OfficialMessageEditor from '@/components/admin/OfficialMessageEditor';

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
    <div className="space-y-4 lg:space-y-6">
      <div>
        <h1 className="font-grotesk font-bold text-2xl lg:text-3xl mb-2">Messagerie & Notifications</h1>
        <p className="text-muted-foreground text-xs lg:text-sm">Communications officielles, notifications et messages avec les utilisateurs</p>
      </div>

      <Tabs defaultValue="official" className="space-y-4 lg:space-y-6">
        <TabsList className="bg-card border border-border grid w-full grid-cols-3 lg:w-auto">
          <TabsTrigger value="official" className="font-inter text-xs lg:text-sm gap-2"><ShieldCheck className="w-3 h-3 lg:w-4 lg:h-4" /><span className="hidden sm:inline">Officiel</span></TabsTrigger>
          <TabsTrigger value="notifications" className="font-inter text-xs lg:text-sm gap-2"><Bell className="w-3 h-3 lg:w-4 lg:h-4" /><span className="hidden sm:inline">Notifications</span></TabsTrigger>
          <TabsTrigger value="messages" className="font-inter text-xs lg:text-sm gap-2"><Send className="w-3 h-3 lg:w-4 lg:h-4" /><span className="hidden sm:inline">Messages</span></TabsTrigger>
        </TabsList>

        {/* ── Official Message Tab ── */}
         <TabsContent value="official" className="space-y-4 lg:space-y-5">
           {!hasAdminAccess(currentUser) ? (
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 lg:p-5 rounded-2xl bg-destructive/10 border border-destructive/30 text-center">
               <p className="font-inter text-xs lg:text-sm text-destructive">Vous n'avez pas les permissions pour accéder à cette fonctionnalité.</p>
             </motion.div>
           ) : (
           <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-4 lg:p-6 rounded-2xl bg-gradient-to-br from-primary/5 to-accent/5 border border-primary/20 space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-primary/10">
              <div className="w-10 h-10 rounded-xl bg-primary/15 border border-primary/25 flex items-center justify-center flex-shrink-0">
                <ShieldCheck className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-grotesk font-bold text-sm lg:text-base">Message Officiel</h3>
                <p className="font-inter text-[10px] lg:text-xs text-muted-foreground">Badge officiel • Pas de réponse possible</p>
              </div>
            </div>
            <div className="relative">
              <button
                onClick={() => setOpenDropdown(!openDropdown)}
                className="w-full text-left px-4 py-2.5 rounded-xl border border-border bg-card hover:bg-secondary/50 transition-all font-inter text-xs lg:text-sm"
              >
                {officialForm.recipient_email ? users.find(u => u.email === officialForm.recipient_email)?.full_name : 'Sélectionner un destinataire'}
              </button>
              {openDropdown && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-xl shadow-lg z-50 max-h-56 overflow-y-auto">
                  {users.map(u => (
                    <button
                      key={u.id}
                      onClick={() => { setOfficialForm(p => ({ ...p, recipient_email: u.email })); setOpenDropdown(false); }}
                      className="w-full text-left px-4 py-2.5 hover:bg-secondary/50 transition-all font-inter text-xs lg:text-sm border-b border-border last:border-b-0"
                    >
                      <span className="font-medium text-foreground">{u.full_name}</span>
                      <span className="text-muted-foreground text-[10px] ml-2">({u.email})</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <OfficialMessageEditor 
              content={officialForm.content}
              onChange={content => setOfficialForm(p => ({ ...p, content }))}
              disabled={!officialForm.recipient_email}
            />
            <div className="bg-primary/10 border border-primary/20 rounded-xl px-3 py-2.5 font-inter text-[10px] lg:text-xs text-muted-foreground space-y-1">
              <p className="flex items-center gap-1"><Sparkles className="w-3 h-3" /> Message aparaîtra comme officiel Brenne Aerial</p>
            </div>
            <Button
              onClick={() => sendOfficialMsg.mutate()}
              disabled={!officialForm.recipient_email || !officialForm.content || sendOfficialMsg.isPending}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground gap-2 rounded-xl h-9 lg:h-10 text-xs lg:text-sm"
            >
              {sendOfficialMsg.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
              Envoyer
            </Button>
            </motion.div>
            )}
            </TabsContent>

        <TabsContent value="notifications" className="space-y-4 lg:space-y-5">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-4 lg:p-6 rounded-2xl bg-gradient-to-br from-accent/5 to-primary/5 border border-accent/20 space-y-3 lg:space-y-4">
            <h3 className="font-grotesk font-bold text-sm lg:text-base">Envoyer une notification</h3>
            <label className="flex items-center gap-2.5 cursor-pointer px-3 py-2 rounded-xl hover:bg-accent/5 transition-colors">
              <input type="checkbox" checked={notifForm.bulk} onChange={e => setNotifForm(p => ({ ...p, bulk: e.target.checked }))} className="w-4 h-4 cursor-pointer" />
              <span className="font-inter text-xs lg:text-sm text-foreground flex items-center gap-1.5"><Users className="w-3.5 h-3.5 text-accent" />Envoyer à tous</span>
            </label>
            {!notifForm.bulk && (
              <select value={notifForm.user_email} onChange={e => setNotifForm(p => ({ ...p, user_email: e.target.value }))}
                className="w-full bg-card border border-border rounded-xl px-4 py-2.5 font-inter text-xs lg:text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50">
                <option value="">Sélectionner un utilisateur</option>
                {users.map(u => <option key={u.id} value={u.email}>{u.full_name} ({u.email})</option>)}
              </select>
            )}
            <Input placeholder="Titre *" value={notifForm.title} onChange={e => setNotifForm(p => ({ ...p, title: e.target.value }))} className="bg-card border-border rounded-xl h-9 lg:h-10 text-xs lg:text-sm" />
            <Textarea placeholder="Contenu (optionnel)" value={notifForm.content} onChange={e => setNotifForm(p => ({ ...p, content: e.target.value }))} className="bg-card border-border rounded-xl min-h-20 lg:min-h-24 text-xs lg:text-sm" />
            <Button onClick={() => sendNotif.mutate()} disabled={(!notifForm.bulk && !notifForm.user_email) || !notifForm.title || sendNotif.isPending} className="w-full bg-accent hover:bg-accent/90 text-white gap-2 rounded-xl h-9 lg:h-10 text-xs lg:text-sm">
              {sendNotif.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Bell className="w-4 h-4" />} Envoyer
            </Button>
          </motion.div>
          <div className="space-y-2 max-h-72 overflow-y-auto">
            <p className="text-[10px] lg:text-xs text-muted-foreground px-1 font-mono uppercase tracking-wide">Dernières ({notifs.length})</p>
            {notifs.slice(0, 10).map((n, idx) => (
              <motion.div key={n.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.05 }} className="p-3 lg:p-4 rounded-xl bg-card border border-border hover:border-accent/30 transition-colors">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <p className="font-inter text-xs lg:text-sm font-medium text-foreground flex-1">{n.title}</p>
                  <span className="font-mono text-[9px] text-muted-foreground flex-shrink-0 flex items-center gap-1"><Clock className="w-3 h-3" />{n.created_date ? format(new Date(n.created_date), 'd MMM', { locale: fr }) : ''}</span>
                </div>
                <p className="font-mono text-[10px] text-muted-foreground">→ {n.user_email}</p>
                {n.content && <p className="font-inter text-[10px] text-muted-foreground mt-1.5 line-clamp-2">{n.content}</p>}
              </motion.div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="messages" className="space-y-4 lg:space-y-5">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-4 lg:p-6 rounded-2xl bg-gradient-to-br from-sky-500/5 to-cyan-500/5 border border-primary/20 space-y-3 lg:space-y-4">
            <h3 className="font-grotesk font-bold text-sm lg:text-base">Envoyer un message</h3>
            <select value={msgForm.recipient_email} onChange={e => setMsgForm(p => ({ ...p, recipient_email: e.target.value }))}
              className="w-full bg-card border border-border rounded-xl px-4 py-2.5 font-inter text-xs lg:text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50">
              <option value="">Destinataire</option>
              {users.map(u => <option key={u.id} value={u.email}>{u.full_name}</option>)}
            </select>
            <Input placeholder="Objet" value={msgForm.subject} onChange={e => setMsgForm(p => ({ ...p, subject: e.target.value }))} className="bg-card border-border rounded-xl h-9 lg:h-10 text-xs lg:text-sm" />
            <Textarea placeholder="Message..." value={msgForm.content} onChange={e => setMsgForm(p => ({ ...p, content: e.target.value }))} className="bg-card border-border rounded-xl min-h-20 lg:min-h-24 text-xs lg:text-sm" />
            <div className="flex items-center justify-between gap-2">
              <label className="flex items-center gap-2.5 cursor-pointer px-3 py-2 rounded-lg hover:bg-primary/5 transition-colors">
                <input type="checkbox" checked={msgForm.is_priority} onChange={e => setMsgForm(p => ({ ...p, is_priority: e.target.checked }))} className="w-4 h-4 cursor-pointer" />
                <span className="font-inter text-xs lg:text-sm text-foreground flex items-center gap-1"><Flag className="w-3.5 h-3.5 text-destructive" /> Prioritaire</span>
              </label>
              <Button onClick={() => sendMsg.mutate()} disabled={!msgForm.recipient_email || !msgForm.content || sendMsg.isPending} className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2 rounded-xl h-9 lg:h-10 text-xs lg:text-sm">
                {sendMsg.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />} Envoyer
              </Button>
            </div>
          </motion.div>
          <div className="space-y-2 max-h-80 overflow-y-auto">
            <p className="text-[10px] lg:text-xs text-muted-foreground px-1 font-mono uppercase tracking-wide">Derniers ({messages.length})</p>
            {messages.slice(0, 15).map((m, idx) => (
              <motion.div key={m.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.03 }} className={`p-3 lg:p-4 rounded-xl border transition-colors ${m.is_priority ? 'bg-destructive/5 border-destructive/30 hover:border-destructive/50' : 'bg-card border-border hover:border-primary/30'}`}>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-1.5 flex-1 min-w-0">
                    {m.is_priority && <Flag className="w-3 h-3 text-destructive flex-shrink-0" />}
                    <span className="font-grotesk font-semibold text-xs lg:text-sm text-foreground truncate">{m.sender_name || m.sender_email}</span>
                  </div>
                  <span className="font-mono text-[9px] text-muted-foreground flex-shrink-0">{m.created_date ? format(new Date(m.created_date), 'dd MMM', { locale: fr }) : ''}</span>
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                    <MessageCircle className="w-3 h-3" />
                    <span className="truncate">→ {m.recipient_email}</span>
                  </div>
                  {m.subject && <p className="font-inter text-xs font-medium text-foreground line-clamp-1">{m.subject}</p>}
                  <p className="font-inter text-[10px] text-muted-foreground line-clamp-2">{m.content}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}