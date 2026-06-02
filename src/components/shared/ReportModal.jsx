import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation } from '@tanstack/react-query';
import { Flag, Loader2, AlertCircle, CheckCircle, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

const REASONS = [
  { value: 'spam', label: '🚫 Spam', color: 'text-blue-400' },
  { value: 'harcelement', label: '⚠️ Harcèlement', color: 'text-orange-400' },
  { value: 'contenu_inapproprie', label: '🔞 Contenu inapproprié', color: 'text-red-400' },
  { value: 'usurpation', label: '🎭 Usurpation d\'identité', color: 'text-purple-400' },
  { value: 'autre', label: '❓ Autre', color: 'text-gray-400' },
];

export default function ReportModal({ open, onClose, user, targetType, targetId, targetEmail, targetName, messageContent }) {
  const navigate = useNavigate();
  const [reason, setReason] = useState('');
  const [details, setDetails] = useState('');
  const [reportId, setReportId] = useState(null);

  const reportMutation = useMutation({
    mutationFn: async (newReportId) => {
      const report = await base44.entities.Report.create({
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
      });
      
      // Notify admins
      await base44.functions.invoke('notifyAdminNewReport', {
        reportId: report.id,
        reporterName: user.full_name,
        targetName: targetName || targetEmail,
        targetType,
        reason: REASONS.find(r => r.value === reason)?.label || reason,
      });
      
      return report;
    },
    onSuccess: (report) => {
      setReportId(report.id);
      setReason('');
      setDetails('');
    },
    onError: () => {
      toast.error('Erreur lors de l\'envoi du signalement');
    },
  });

  const reasonOption = REASONS.find(r => r.value === reason);

  const handleGoToReports = () => {
    onClose();
    navigate('/espace-client?tab=reports');
  };

  if (reportId) {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="bg-card border border-border/50 max-w-md shadow-2xl">
          <div className="flex flex-col items-center text-center space-y-5 py-4">
            <div className="w-12 h-12 rounded-full bg-green-400/20 flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-400" />
            </div>
            <div className="space-y-2">
              <p className="font-grotesk font-bold text-lg">Merci d'avoir signalé</p>
              <p className="font-inter text-sm text-muted-foreground">
                Votre signalement a été envoyé à nos modérateurs. Nous examinons rapidement chaque rapport.
              </p>
            </div>
            <div className="space-y-2 w-full">
              <Button
                className="w-full bg-green-400/20 text-green-400 border border-green-400/30 hover:bg-green-400/30 gap-2 font-inter"
                onClick={handleGoToReports}
              >
                <ArrowRight className="w-4 h-4" />
                Suivre mon signalement
              </Button>
              <Button
                variant="outline"
                className="w-full border-border/50"
                onClick={onClose}
              >
                Fermer
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-card border border-border/50 max-w-md shadow-2xl">
        <DialogHeader className="border-b border-border/50 pb-4">
          <DialogTitle className="font-grotesk font-bold text-lg flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-destructive/20 flex items-center justify-center">
              <Flag className="w-4 h-4 text-destructive" />
            </div>
            Signaler un abus
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-primary/5 border border-primary/20 rounded-xl px-3.5 py-2.5">
            <p className="font-inter text-xs text-muted-foreground mb-1">
              {targetType === 'user' ? 'Utilisateur signalé' : 'Contenu signalé'}
            </p>
            <p className="font-inter text-sm font-medium">{targetName || targetEmail}</p>
          </div>

          {messageContent && (
            <div className="bg-secondary/40 rounded-lg p-3 border border-border/50">
              <p className="font-mono text-[9px] text-muted-foreground mb-2 uppercase opacity-70">Message signalé</p>
              <p className="font-inter text-xs text-foreground italic">"{messageContent}"</p>
            </div>
          )}

          <div>
            <label className="font-inter text-xs font-medium text-foreground mb-2 block">Raison du signalement *</label>
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger className="bg-secondary/50 border-border/50 hover:border-border">
                <SelectValue placeholder="Choisir une raison..." />
              </SelectTrigger>
              <SelectContent>
                {REASONS.map(r => (
                  <SelectItem key={r.value} value={r.value} className="font-inter">
                    <span>{r.label}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="font-inter text-xs font-medium text-foreground mb-2 block">
              Contexte supplémentaire <span className="text-muted-foreground">(optionnel)</span>
            </label>
            <Textarea
              value={details}
              onChange={e => setDetails(e.target.value)}
              placeholder="Explicitez votre signalement... Cela aide nos modérateurs."
              className="bg-secondary/50 border-border/50 focus-visible:border-primary/50 font-inter text-sm resize-none h-24"
            />
          </div>

          <div className="flex gap-2">
            <Button variant="outline" className="flex-1 border-border/50" onClick={onClose}>
              Annuler
            </Button>
            <Button
              className="flex-1 bg-destructive text-destructive-foreground hover:bg-destructive/90 gap-1.5 font-medium"
              onClick={() => reportMutation.mutate()}
              disabled={!reason || reportMutation.isPending}
            >
              {reportMutation.isPending ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Envoi...
                </>
              ) : (
                <>
                  <Flag className="w-3.5 h-3.5" />
                  Signaler
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}