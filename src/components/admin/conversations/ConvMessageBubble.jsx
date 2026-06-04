import { useState } from 'react';
import { Trash2, Pencil, ShieldCheck, AlertTriangle, StickyNote, Check, X, Lock } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

export default function ConvMessageBubble({ msg, isFirst, participantNames, onDelete, onEdit }) {
  const [editing, setEditing] = useState(false);
  const [editContent, setEditContent] = useState(msg.content);

  const isOfficial = msg.is_official;
  const isWarning = msg.is_warning;
  const isAdminNote = msg.is_admin_note;

  const handleEdit = () => {
    onEdit(msg.id, editContent);
    setEditing(false);
  };

  if (isAdminNote) {
    return (
      <div className="flex justify-center group">
        <div className="flex flex-col items-center max-w-[85%] w-full">
          <div className="flex items-center gap-1.5 mb-0.5">
            <StickyNote className="w-2.5 h-2.5 text-muted-foreground/50" />
            <span className="font-mono text-[9px] text-muted-foreground/50 uppercase tracking-wider">Note interne (non visible par les utilisateurs)</span>
          </div>
          <div className="w-full px-4 py-2.5 rounded-xl border border-dashed border-muted/40 bg-muted/10 text-center relative">
            <p className="font-inter text-xs text-muted-foreground italic">{msg.content}</p>
            <button
              onClick={() => onDelete(msg.id)}
              className="absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 transition-opacity w-5 h-5 bg-destructive rounded-full flex items-center justify-center"
            >
              <Trash2 className="w-2.5 h-2.5 text-white" />
            </button>
          </div>
          <p className="font-mono text-[9px] text-muted-foreground/40 mt-0.5">
            {msg.created_date ? format(new Date(msg.created_date), 'd MMM · HH:mm', { locale: fr }) : ''}
          </p>
        </div>
      </div>
    );
  }

  if (isOfficial || isWarning) {
    const officialStyle = isWarning
      ? { background: 'linear-gradient(135deg, hsl(38 90% 10%), hsl(38 80% 7%))', border: '1px solid rgba(251,146,60,0.35)', color: 'hsl(210 20% 94%)', boxShadow: '0 2px 12px rgba(251,146,60,0.1)' }
      : { background: 'linear-gradient(135deg, hsl(205 90% 12%), hsl(205 80% 9%))', border: '1px solid rgba(56,170,220,0.35)', color: 'hsl(210 20% 94%)', boxShadow: '0 2px 12px rgba(56,170,220,0.1)' };
    const Icon = isWarning ? AlertTriangle : ShieldCheck;
    const iconColor = isWarning ? 'text-orange-400' : 'text-primary';
    const label = isWarning ? 'Avertissement admin' : 'Administrateur · Message officiel';

    return (
      <div className="flex justify-center group">
        <div className="flex flex-col items-center max-w-[85%] w-full">
          <span className={`font-mono text-[9px] flex items-center gap-1 mb-0.5 ${iconColor}`}>
            <Icon className="w-2.5 h-2.5" /> {label}
          </span>
          <div className="relative w-full px-4 py-2.5 rounded-xl text-center" style={officialStyle}>
            {editing ? (
              <div className="space-y-2">
                <Textarea value={editContent} onChange={e => setEditContent(e.target.value)} className="bg-black/30 border-white/20 text-sm resize-none min-h-[60px]" />
                <div className="flex gap-2 justify-center">
                  <Button size="sm" className="h-6 text-xs gap-1" onClick={handleEdit}><Check className="w-3 h-3" /> Sauver</Button>
                  <Button size="sm" variant="ghost" className="h-6 text-xs gap-1" onClick={() => setEditing(false)}><X className="w-3 h-3" /> Annuler</Button>
                </div>
              </div>
            ) : (
              <p className="font-inter text-sm">{msg.content}</p>
            )}
            {!editing && (
              <div className="absolute -top-1 -right-1 flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => setEditing(true)} className="w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                  <Pencil className="w-2.5 h-2.5 text-white" />
                </button>
                <button onClick={() => onDelete(msg.id)} className="w-5 h-5 bg-destructive rounded-full flex items-center justify-center">
                  <Trash2 className="w-2.5 h-2.5 text-white" />
                </button>
              </div>
            )}
          </div>
          <p className="font-mono text-[9px] text-muted-foreground mt-0.5">
            {msg.created_date ? format(new Date(msg.created_date), 'd MMM · HH:mm', { locale: fr }) : ''}
          </p>
        </div>
      </div>
    );
  }

  // Normal message
  return (
    <div className={`flex group ${isFirst ? 'justify-start' : 'justify-end'}`}>
      <div className={`flex flex-col gap-0.5 max-w-[75%] ${isFirst ? 'items-start' : 'items-end'}`}>
        <p className="font-mono text-[9px] text-muted-foreground px-1">
          {participantNames[msg.sender_email] || msg.sender_email}
          {msg.is_request && <span className="ml-1 text-yellow-400/70"><Lock className="w-2 h-2 inline" /> {msg.request_status}</span>}
        </p>
        <div className={`relative px-3 py-2 rounded-xl font-inter text-sm ${
          isFirst ? 'bg-secondary border border-border rounded-tl-sm' : 'bg-primary/20 border border-primary/30 rounded-tr-sm'
        }`}>
          {editing ? (
            <div className="space-y-2 min-w-[180px]">
              <Textarea value={editContent} onChange={e => setEditContent(e.target.value)} className="bg-black/20 border-white/20 text-sm resize-none min-h-[50px]" />
              <div className="flex gap-1.5">
                <Button size="sm" className="h-6 text-xs gap-1 flex-1" onClick={handleEdit}><Check className="w-3 h-3" /> OK</Button>
                <Button size="sm" variant="ghost" className="h-6 text-xs gap-1" onClick={() => setEditing(false)}><X className="w-3 h-3" /></Button>
              </div>
            </div>
          ) : (
            msg.content
          )}
          {!editing && (
            <div className={`absolute -top-1 flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity ${isFirst ? '-right-1' : '-left-1'}`}>
              <button onClick={() => setEditing(true)} className="w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                <Pencil className="w-2.5 h-2.5 text-white" />
              </button>
              <button onClick={() => onDelete(msg.id)} className="w-5 h-5 bg-destructive rounded-full flex items-center justify-center">
                <Trash2 className="w-2.5 h-2.5 text-white" />
              </button>
            </div>
          )}
        </div>
        <p className="font-mono text-[9px] text-muted-foreground px-1">
          {msg.created_date ? format(new Date(msg.created_date), 'd MMM · HH:mm', { locale: fr }) : ''}
        </p>
      </div>
    </div>
  );
}