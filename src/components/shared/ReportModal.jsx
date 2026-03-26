import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation } from '@tanstack/react-query';
import { Flag, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';

const REASONS = [
  { value: 'spam', label: 'Spam' },
  { value: 'harcelement', label: 'Harcèlement' },
  { value: 'contenu_inapproprie', label: 'Contenu inapproprié' },
  { value: 'usurpation', label: "Usurpation d'identité" },
  { value: 'autre', label: 'Autre' },
];

export default function ReportModal({ open, onClose, user, targetType, targetId, targetEmail, targetName, messageContent }) {
  const [reason, setReason] = useState('');
  const [details, setDetails] = useState('');

  const reportMutation = useMutation({
    mutationFn: () => base44.entities.Report.create({
      reporter_email: user.email,
      reporter_name: user.full_name,
      target_type: targetType,
      target_id: targetId,
      target_email: targetEmail,
      target_name: targetName,
      reason,
      details,
      message_content: messageContent || '',
      status: 'pending',
    }),
    onSuccess: () => {
      toast.success('Signalement envoyé. Merci.');
      setReason('');
      setDetails('');
      onClose();
    },
  });

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-card border-border max-w-md">
        <DialogHeader>
          <DialogTitle className="font-grotesk font-bold flex items-center gap-2">
            <Flag className="w-4 h-4 text-destructive" />
            Signaler {targetType === 'user' ? 'ce profil' : 'ce message'}
          </DialogTitle>
        </DialogHeader>

        {targetName && (
          <div className="bg-secondary rounded-lg px-3 py-2 font-inter text-sm">
            Cible : <span className="font-medium">{targetName}</span>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="font-inter text-xs text-muted-foreground mb-1.5 block">Raison du signalement</label>
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger className="bg-secondary border-border">
                <SelectValue placeholder="Choisir une raison..." />
              </SelectTrigger>
              <SelectContent>
                {REASONS.map(r => (
                  <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {messageContent && (
            <div className="bg-secondary/60 rounded-lg px-3 py-2 font-inter text-xs text-muted-foreground border border-border">
              "{messageContent}"
            </div>
          )}

          <div>
            <label className="font-inter text-xs text-muted-foreground mb-1.5 block">Détails (optionnel)</label>
            <Textarea
              value={details}
              onChange={e => setDetails(e.target.value)}
              placeholder="Donnez plus de contexte..."
              className="bg-secondary border-border font-inter text-sm resize-none h-20"
            />
          </div>

          <div className="flex gap-2">
            <Button variant="outline" className="flex-1 border-border" onClick={onClose}>Annuler</Button>
            <Button
              className="flex-1 bg-destructive/90 text-white hover:bg-destructive gap-1.5"
              onClick={() => reportMutation.mutate()}
              disabled={!reason || reportMutation.isPending}
            >
              {reportMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Flag className="w-3 h-3" />}
              Signaler
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}