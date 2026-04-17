import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import {
  Mail, Send, Users, User, Loader2, CheckCircle, Paperclip, X,
  ImageIcon, Plus, Search, UserCheck, ChevronDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

const SENDER_PROFILES = [
  { id: 'pdg', label: '👔 PDG — Direction', name: 'Enor Lefoulon Meyer', role: 'PDG & Fondateur', theme: 'gold' },
  { id: 'support', label: '🎧 Support Client', name: 'Support Brenne Aerial', role: 'Service Client', theme: 'blue' },
  { id: 'commercial', label: '💼 Commercial', name: 'Équipe Commerciale', role: 'Pôle Commercial', theme: 'green' },
  { id: 'ops', label: '🚁 Opérations', name: 'Équipe Opérations', role: 'Pôle Opérations', theme: 'purple' },
];

const TARGET_GROUPS = [
  { value: 'all', label: 'Tous les utilisateurs actifs' },
  { value: 'user', label: 'Utilisateurs standard' },
  { value: 'admin', label: 'Administrateurs' },
  { value: 'vip', label: 'VIP uniquement' },
  { value: 'collaborateur', label: 'Collaborateurs' },
  { value: 'pilote', label: 'Pilotes' },
  { value: 'custom', label: '✏️ Sélection manuelle' },
];

export default function AdminEmailing() {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sender, setSender] = useState('pdg');
  const [target, setTarget] = useState('all');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [attachments, setAttachments] = useState([]);
  const [uploading, setUploading] = useState(false);

  // Custom selection
  const [search, setSearch] = useState('');
  const [selectedEmails, setSelectedEmails] = useState([]);
  const [showUserList, setShowUserList] = useState(false);

  const { data: users = [] } = useQuery({
    queryKey: ['adm-users-list'],
    queryFn: async () => {
      const res = await base44.functions.invoke('adminGetUsers', {});
      return res.data.users || [];
    },
  });

  const activeUsers = users.filter(u => (u.account_status || 'active') === 'active');

  const groupTargetUsers = target === 'all'
    ? activeUsers
    : target === 'custom'
    ? activeUsers.filter(u => selectedEmails.includes(u.email))
    : activeUsers.filter(u => (u.role || 'user') === target);

  const targetUsers = groupTargetUsers;

  const filteredUsers = activeUsers.filter(u =>
    (u.full_name || '').toLowerCase().includes(search.toLowerCase()) ||
    (u.email || '').toLowerCase().includes(search.toLowerCase())
  );

  const toggleUser = (email) => {
    setSelectedEmails(prev =>
      prev.includes(email) ? prev.filter(e => e !== email) : [...prev, email]
    );
  };

  const senderProfile = SENDER_PROFILES.find(p => p.id === sender);

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    setUploading(true);
    for (const file of files) {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setAttachments(prev => [...prev, { url: file_url, name: file.name, type: file.type }]);
    }
    setUploading(false);
    e.target.value = '';
  };

  const removeAttachment = (url) => setAttachments(prev => prev.filter(a => a.url !== url));

  const handleSend = async () => {
    if (!subject.trim() || !message.trim()) {
      toast.error('Objet et message requis');
      return;
    }
    if (target === 'custom' && selectedEmails.length === 0) {
      toast.error('Sélectionnez au moins un destinataire');
      return;
    }
    setSending(true);
    const res = await base44.functions.invoke('adminSendBroadcastEmail', {
      subject,
      message,
      senderName: senderProfile.name,
      senderRole: senderProfile.role,
      senderTheme: senderProfile.theme,
      attachments,
      recipients: targetUsers.map(u => ({ email: u.email, name: u.full_name })),
    });
    setSending(false);
    if (res.data?.success) {
      setSent(true);
      toast.success(`Email envoyé à ${targetUsers.length} utilisateur(s)`);
    }
  };

  const themeColors = {
    gold: { dot: 'bg-yellow-400', text: 'text-yellow-400', border: 'border-yellow-400/30', bg: 'bg-yellow-400/5' },
    blue: { dot: 'bg-primary', text: 'text-primary', border: 'border-primary/30', bg: 'bg-primary/5' },
    green: { dot: 'bg-green-400', text: 'text-green-400', border: 'border-green-400/30', bg: 'bg-green-400/5' },
    purple: { dot: 'bg-purple-400', text: 'text-purple-400', border: 'border-purple-400/30', bg: 'bg-purple-400/5' },
  };
  const tc = themeColors[senderProfile.theme] || themeColors.blue;

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="font-grotesk font-bold text-2xl flex items-center gap-2">
          <Mail className="w-6 h-6 text-primary" /> Emailing Admin
        </h1>
        <p className="font-inter text-sm text-muted-foreground mt-1">Envoyez un email professionnel et personnalisé à vos utilisateurs</p>
      </div>

      {/* Sender */}
      <div className="bg-card border border-border rounded-xl p-5 space-y-4">
        <p className="font-inter text-xs font-semibold text-muted-foreground uppercase tracking-wider">Expéditeur</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {SENDER_PROFILES.map(p => {
            const tc2 = themeColors[p.theme];
            const isSelected = sender === p.id;
            return (
              <button
                key={p.id}
                onClick={() => setSender(p.id)}
                className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all text-center ${
                  isSelected
                    ? `${tc2.border} ${tc2.bg} ${tc2.text}`
                    : 'border-border text-muted-foreground hover:border-border/80 hover:bg-secondary'
                }`}
              >
                <div className={`w-2 h-2 rounded-full ${isSelected ? tc2.dot : 'bg-muted-foreground/40'}`} />
                <span className="font-inter text-xs font-semibold leading-tight">{p.label}</span>
                <span className="font-mono text-[9px] opacity-70">{p.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Target */}
      <div className="bg-card border border-border rounded-xl p-5 space-y-4">
        <p className="font-inter text-xs font-semibold text-muted-foreground uppercase tracking-wider">Destinataires</p>
        <Select value={target} onValueChange={v => { setTarget(v); setSent(false); setSelectedEmails([]); }}>
          <SelectTrigger className="bg-secondary border-border">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {TARGET_GROUPS.map(g => (
              <SelectItem key={g.value} value={g.value}>{g.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Custom user picker */}
        {target === 'custom' && (
          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <Input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Rechercher par nom ou email..."
                className="bg-secondary border-border pl-9 text-sm"
                onFocus={() => setShowUserList(true)}
              />
            </div>

            {showUserList && (
              <div className="border border-border rounded-xl bg-secondary max-h-52 overflow-y-auto divide-y divide-border">
                {filteredUsers.slice(0, 30).map(u => (
                  <button
                    key={u.email}
                    onClick={() => toggleUser(u.email)}
                    className="w-full flex items-center justify-between gap-3 px-4 py-2.5 hover:bg-muted/30 transition-colors text-left"
                  >
                    <div>
                      <p className="font-inter text-sm font-medium">{u.full_name || u.email}</p>
                      <p className="font-mono text-xs text-muted-foreground">{u.email} · {u.role || 'user'}</p>
                    </div>
                    <div className={`w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center transition-colors ${
                      selectedEmails.includes(u.email) ? 'bg-primary border-primary' : 'border-border'
                    }`}>
                      {selectedEmails.includes(u.email) && <span className="text-primary-foreground text-[10px]">✓</span>}
                    </div>
                  </button>
                ))}
                {filteredUsers.length === 0 && (
                  <p className="p-4 text-sm text-muted-foreground text-center">Aucun utilisateur trouvé</p>
                )}
              </div>
            )}

            {selectedEmails.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {selectedEmails.map(email => {
                  const u = activeUsers.find(u => u.email === email);
                  return (
                    <span key={email} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 border border-primary/20 font-inter text-xs">
                      <UserCheck className="w-3 h-3 text-primary" />
                      {u?.full_name || email}
                      <button onClick={() => toggleUser(email)} className="text-muted-foreground hover:text-destructive ml-0.5">
                        <X className="w-2.5 h-2.5" />
                      </button>
                    </span>
                  );
                })}
              </div>
            )}
          </div>
        )}

        <div className={`flex items-center gap-2 px-4 py-2.5 rounded-xl ${tc.bg} border ${tc.border}`}>
          <Users className={`w-4 h-4 ${tc.text}`} />
          <span className="font-inter text-sm">
            <strong className={tc.text}>{targetUsers.length}</strong> destinataire{targetUsers.length > 1 ? 's' : ''} sélectionné{targetUsers.length > 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* Message */}
      <div className="bg-card border border-border rounded-xl p-5 space-y-4">
        <p className="font-inter text-xs font-semibold text-muted-foreground uppercase tracking-wider">Contenu de l'email</p>

        <div>
          <label className="font-inter text-xs text-muted-foreground mb-1.5 block">Objet</label>
          <Input
            value={subject}
            onChange={e => setSubject(e.target.value)}
            placeholder="Ex: Nouvelle fonctionnalité disponible !"
            className="bg-secondary border-border"
          />
        </div>

        <div>
          <label className="font-inter text-xs text-muted-foreground mb-1.5 block">Message (chaque ligne = un paragraphe)</label>
          <Textarea
            value={message}
            onChange={e => setMessage(e.target.value)}
            placeholder={`Bonjour,\n\nVotre message ici...`}
            className="bg-secondary border-border resize-none h-48 font-inter text-sm"
          />
        </div>

        {/* Pièces jointes */}
        <div>
          <label className="font-inter text-xs text-muted-foreground mb-1.5 block">Pièces jointes / Images</label>
          <label className="flex items-center gap-2 px-4 py-3 rounded-xl border border-dashed border-border bg-secondary hover:border-primary/40 cursor-pointer transition-colors">
            {uploading ? <Loader2 className="w-4 h-4 text-primary animate-spin" /> : <Paperclip className="w-4 h-4 text-muted-foreground" />}
            <span className="font-inter text-sm text-muted-foreground">{uploading ? 'Upload en cours...' : 'Ajouter des fichiers ou images'}</span>
            <input type="file" multiple accept="image/*,.pdf,.doc,.docx" className="hidden" onChange={handleFileUpload} disabled={uploading} />
          </label>
          {attachments.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {attachments.map(a => (
                <div key={a.url} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted border border-border">
                  {a.type?.startsWith('image/') ? <ImageIcon className="w-3.5 h-3.5 text-primary" /> : <Paperclip className="w-3.5 h-3.5 text-muted-foreground" />}
                  <span className="font-inter text-xs max-w-[120px] truncate">{a.name}</span>
                  {a.type?.startsWith('image/') && <img src={a.url} className="w-8 h-8 object-cover rounded" alt="" />}
                  <button onClick={() => removeAttachment(a.url)} className="text-muted-foreground hover:text-destructive"><X className="w-3 h-3" /></button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Live preview */}
      {(subject || message) && (
        <div className="bg-card border border-border rounded-xl p-5 space-y-3">
          <p className="font-inter text-xs font-semibold text-muted-foreground uppercase tracking-wider">Aperçu email</p>
          <div className={`rounded-xl border ${tc.border} ${tc.bg} p-4 space-y-3`}>
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-full border ${tc.border} flex items-center justify-center`}>
                <span className="text-sm">✈️</span>
              </div>
              <div>
                <p className="font-inter text-sm font-semibold">{senderProfile.name}</p>
                <p className={`font-mono text-xs ${tc.text}`}>{senderProfile.role} · Brenne Aerial</p>
              </div>
            </div>
            {subject && <p className="font-grotesk font-bold text-base">{subject}</p>}
            {message && (
              <div className="space-y-1">
                {message.split('\n').filter(l => l.trim()).slice(0, 4).map((line, i) => (
                  <p key={i} className="font-inter text-sm text-muted-foreground">{line}</p>
                ))}
                {message.split('\n').filter(l => l.trim()).length > 4 && (
                  <p className="font-mono text-xs text-muted-foreground/60">...</p>
                )}
              </div>
            )}
            <div className={`inline-block text-xs font-semibold px-4 py-2 rounded-lg border ${tc.border} ${tc.text} ${tc.bg}`}>
              Accéder à mon espace →
            </div>
          </div>
        </div>
      )}

      {/* Send */}
      {sent ? (
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-green-400/10 border border-green-400/20">
          <CheckCircle className="w-5 h-5 text-green-400" />
          <span className="font-inter text-sm text-green-400">Email envoyé avec succès à {targetUsers.length} utilisateur(s)</span>
          <button className="ml-auto font-inter text-xs text-muted-foreground underline" onClick={() => { setSent(false); setSubject(''); setMessage(''); setAttachments([]); }}>
            Nouvel envoi
          </button>
        </div>
      ) : (
        <Button
          onClick={handleSend}
          disabled={sending || !subject.trim() || !message.trim() || targetUsers.length === 0}
          className="bg-primary text-primary-foreground gap-2 w-full h-11"
        >
          {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          {sending ? 'Envoi en cours...' : `Envoyer à ${targetUsers.length} utilisateur${targetUsers.length > 1 ? 's' : ''}`}
        </Button>
      )}
    </div>
  );
}