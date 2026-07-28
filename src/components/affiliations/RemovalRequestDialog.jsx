import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { AlertTriangle, Loader2 } from 'lucide-react';

/**
 * Dialogue de demande de suppression d'une affiliation (côté organisation).
 * L'organisation ne peut pas supprimer directement : elle doit fournir une raison
 * et la demande est examinée par les administrateurs.
 */
export default function RemovalRequestDialog({ open, onOpenChange, target, onSubmit }) {
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) setReason('');
  }, [open]);

  const handleSubmit = async () => {
    if (reason.trim().length < 10) return;
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
            <AlertTriangle className="w-4 h-4 text-amber-400" /> Demander la suppression
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3 py-2">
          <p className="text-sm text-muted-foreground leading-relaxed">
            Vous ne pouvez pas supprimer directement une affiliation. Votre demande sera
            examinée par les administrateurs. Indiquez une raison détaillée
            (minimum 10 caractères).
          </p>
          <Textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={4}
            placeholder="Expliquez pourquoi cette affiliation doit être supprimée..."
          />
          {target && (
            <p className="font-mono text-[10px] text-muted-foreground">
              Membre concerné : {target.userId}
            </p>
          )}
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Annuler</Button>
          <Button onClick={handleSubmit} disabled={submitting || reason.trim().length < 10} className="gap-2">
            {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
            Envoyer la demande
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}