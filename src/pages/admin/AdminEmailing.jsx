import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Mail, Send, Users, User, Loader2, CheckCircle, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

const SENDER_PROFILES = [
  { id: 'pdg', label: 'PDG — Brenne Aerial', name: 'Équipe Brenne Aerial', role: 'Direction' },
  { id: 'support', label: 'Support Client', name: 'Support Brenne Aerial', role: 'Service Client' },
  { id: 'commercial', label: 'Commercial', name: 'Équipe Commerciale', role: 'Commercial' },
];

export default function AdminEmailing() {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sender, setSender] = useState('pdg');
  const [target, setTarget] = useState('all');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const { data: users = [] } = useQuery({
    queryKey: ['adm-users-list'],
    queryFn: async () => {
      const res = await base44.functions.invoke('adminGetUsers', {});
      return res.data.users || [];
    },
  });

  const targetUsers = target === 'all'
    ? users.filter(u => (u.account_status || 'active') === 'active')
    : users.filter(u => (u.account_status || 'active') === 'active' && (u.role || 'user') === target);

  const senderProfile = SENDER_PROFILES.find(p => p.id === sender);

  const handleSend = async () => {
    if (!subject.trim() || !message.trim()) {
      toast.error('Objet et message requis');
      return;
    }
    setSending(true);
    const res = await base44.functions.invoke('adminSendBroadcastEmail', {
      subject,
      message,
      senderName: senderProfile.name,
      senderRole: senderProfile.role,
      recipients: targetUsers.map(u => ({ email: u.email, name: u.full_name })),
    });
    setSending(false);
    if (res.data?.success) {
      setSent(true);
      toast.success(`Email envoyé à ${targetUsers.length} utilisateur(s)`);
    }
  };

  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <h1 className="font-grotesk font-bold text-2xl flex items-center gap-2">
          <Mail className="w-6 h-6 text-primary" /> Emailing Admin
        </h1>
        <p className="font-inter text-sm text-muted-foreground mt-1">Envoyez un email personnalisé à vos utilisateurs</p>
      </div>

      <div className="space-y-5">
        {/* Sender + Target */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="font-inter text-xs text-muted-foreground mb-1.5 block">Expéditeur</label>
            <Select value={sender} onValueChange={setSender}>
              <SelectTrigger className="bg-card border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SENDER_PROFILES.map(p => (
                  <SelectItem key={p.id} value={p.id}>{p.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="font-inter text-xs text-muted-foreground mb-1.5 block">Destinataires</label>
            <Select value={target} onValueChange={v => { setTarget(v); setSent(false); }}>
              <SelectTrigger className="bg-card border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les utilisateurs actifs</SelectItem>
                <SelectItem value="user">Utilisateurs standard</SelectItem>
                <SelectItem value="vip">VIP uniquement</SelectItem>
                <SelectItem value="collaborateur">Collaborateurs</SelectItem>
                <SelectItem value="pilote">Pilotes</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Recipients count */}
        <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary/5 border border-primary/20">
          <Users className="w-4 h-4 text-primary" />
          <span className="font-inter text-sm">
            <strong className="text-primary">{targetUsers.length}</strong> destinataire{targetUsers.length > 1 ? 's' : ''}
          </span>
        </div>

        {/* Subject */}
        <div>
          <label className="font-inter text-xs text-muted-foreground mb-1.5 block">Objet de l'email</label>
          <Input
            value={subject}
            onChange={e => setSubject(e.target.value)}
            placeholder="Ex: Nouvelle fonctionnalité disponible !"
            className="bg-card border-border"
          />
        </div>

        {/* Message */}
        <div>
          <label className="font-inter text-xs text-muted-foreground mb-1.5 block">Message</label>
          <Textarea
            value={message}
            onChange={e => setMessage(e.target.value)}
            placeholder="Rédigez votre message ici... Il sera mis en forme automatiquement dans un bel email."
            className="bg-card border-border resize-none h-48"
          />
        </div>

        {/* Preview card */}
        {(subject || message) && (
          <div className="rounded-xl border border-border bg-secondary p-4 space-y-2">
            <p className="font-inter text-xs text-muted-foreground uppercase tracking-wider">Aperçu</p>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="font-inter text-sm font-medium">{senderProfile.name}</p>
                <p className="font-mono text-xs text-muted-foreground">{senderProfile.role} · contact@brenneaerial.fr</p>
              </div>
            </div>
            {subject && <p className="font-inter text-sm font-semibold mt-2">{subject}</p>}
            {message && <p className="font-inter text-sm text-muted-foreground whitespace-pre-wrap line-clamp-4">{message}</p>}
          </div>
        )}

        {/* Send button */}
        {sent ? (
          <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-green-400/10 border border-green-400/20">
            <CheckCircle className="w-5 h-5 text-green-400" />
            <span className="font-inter text-sm text-green-400">Email envoyé avec succès à {targetUsers.length} utilisateur(s)</span>
            <button className="ml-auto font-inter text-xs text-muted-foreground underline" onClick={() => { setSent(false); setSubject(''); setMessage(''); }}>
              Nouvel envoi
            </button>
          </div>
        ) : (
          <Button
            onClick={handleSend}
            disabled={sending || !subject.trim() || !message.trim() || targetUsers.length === 0}
            className="bg-primary text-primary-foreground gap-2 w-full"
          >
            {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            {sending ? 'Envoi en cours...' : `Envoyer à ${targetUsers.length} utilisateur(s)`}
          </Button>
        )}
      </div>
    </div>
  );
}