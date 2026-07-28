import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Ban, Loader2 } from 'lucide-react';

/**
 * Dialogue de suppression directe (côté admin).
 * Marque l'affiliation comme supprimée et pénalise l'utilisateur sur son profil.
 * Une raison est recommandée.
 */
export default function DirectRemovalDialog({ open, onOpenChange, target, onSubmit }) {
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) setReason('');
  }, [open]);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await onSubmit(reason.trim());
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Ban className="w-4 h-4 text-zinc-400" /> Marquer comme supprimée
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3 py-2">
          <p className="text-sm text-muted-foreground leading-relaxed">
            Cette action marquera l'affiliation comme supprimée et affichera une mention
            pénalisante sur le profil de l'utilisateur. Une raison est recommandée pour
            justification.
          </p>
          {target?.removalRequestStatus === 'pending' && target?.removalReason && (
            <div className="rounded-lg border border-amber-400/30 bg-amber-400/5 p-2.5">
              <p className="font-mono text-[10px] uppercase tracking-wide text-amber-400 mb-1">
                Raison demandée par l'organisation
              </p>
              <p className="text-xs text-muted-foreground italic">« {target.removalReason} »</p>
            </div>
          )}
          <Textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={4}
            placeholder="Raison de la suppression (recommandé)..."
          />
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Annuler</Button>
          <Button variant="destructive" onClick={handleSubmit} disabled={submitting} className="gap-2">
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Ban className="w-4 h-4" />}
            Marquer supprimée
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}