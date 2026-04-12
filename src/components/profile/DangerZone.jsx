import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Trash2, AlertTriangle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

export default function DangerZone({ user }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [confirmed, setConfirmed] = useState(false);

  const { data: existing = [] } = useQuery({
    queryKey: ['deletion-request', user?.email],
    queryFn: () => base44.entities.DeletionRequest.filter({ user_email: user.email, status: 'pending' }),
    enabled: !!user?.email,
  });

  const hasPending = existing.length > 0;

  const requestMutation = useMutation({
    mutationFn: () => base44.functions.invoke('requestAccountDeletion', { reason }),
    onSuccess: () => {
      toast.success('Demande envoyée. Vous recevrez un email de confirmation.');
      setOpen(false);
    },
    onError: (err) => toast.error(err?.response?.data?.error || 'Erreur lors de la demande'),
  });

  const cancelMutation = useMutation({
    mutationFn: async () => {
      for (const r of existing) {
        await base44.entities.DeletionRequest.update(r.id, { status: 'cancelled' });
      }
    },
    onSuccess: () => {
      toast.success('Demande annulée');
    },
  });

  return (
    <div className="mt-6 bg-destructive/5 border border-destructive/20 rounded-2xl p-6">
      <div className="flex items-center gap-2 mb-2">
        <AlertTriangle className="w-4 h-4 text-destructive" />
        <h3 className="font-grotesk font-semibold text-sm text-destructive">Zone de danger</h3>
      </div>

      {hasPending ? (
        <div className="space-y-3">
          <p className="font-inter text-xs text-muted-foreground">
            Une demande de suppression est en cours. Un admin la traitera prochainement.
          </p>
          <Button
            size="sm"
            variant="outline"
            className="border-border text-xs"
            onClick={() => cancelMutation.mutate()}
            disabled={cancelMutation.isPending}
          >
            {cancelMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : null}
            Annuler ma demande
          </Button>
        </div>
      ) : !open ? (
        <div className="flex items-center justify-between">
          <p className="font-inter text-xs text-muted-foreground">Suppression définitive et irréversible de votre compte.</p>
          <Button
            size="sm"
            variant="outline"
            className="border-destructive/40 text-destructive hover:bg-destructive/10 text-xs gap-1.5 flex-shrink-0 ml-4"
            onClick={() => setOpen(true)}
          >
            <Trash2 className="w-3 h-3" /> Supprimer mon compte
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="font-inter text-sm font-medium text-destructive">⚠️ Cette action est irréversible.</p>
          <p className="font-inter text-xs text-muted-foreground">
            Votre demande sera envoyée à un administrateur. Vous recevrez un email de confirmation, puis un email lorsque votre compte sera supprimé.
          </p>
          <div>
            <label className="font-inter text-xs text-muted-foreground mb-1 block">Raison (optionnel)</label>
            <Textarea
              value={reason}
              onChange={e => setReason(e.target.value)}
              placeholder="Pourquoi souhaitez-vous supprimer votre compte ?"
              className="bg-secondary border-border resize-none h-20 text-sm"
            />
          </div>
          <label className="flex items-start gap-2 cursor-pointer">
            <input type="checkbox" checked={confirmed} onChange={e => setConfirmed(e.target.checked)} className="mt-0.5 accent-destructive" />
            <span className="font-inter text-xs text-muted-foreground">
              Je comprends que cette action supprimera définitivement mon compte et toutes mes données.
            </span>
          </label>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" className="border-border text-xs" onClick={() => setOpen(false)}>
              Annuler
            </Button>
            <Button
              size="sm"
              className="bg-destructive text-white hover:bg-destructive/90 text-xs gap-1.5"
              onClick={() => requestMutation.mutate()}
              disabled={!confirmed || requestMutation.isPending}
            >
              {requestMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
              Confirmer la demande
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}