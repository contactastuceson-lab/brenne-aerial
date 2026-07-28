import React from 'react';
import { AlertTriangle, Check, X, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

/**
 * Panneau dédié aux demandes de suppression d'affiliation émises par les organisations.
 * Affiche chaque demande en attente avec sa raison, et permet à l'admin d'approuver/refuser.
 */
export default function RemovalRequestsPanel({ affiliations, onAction }) {
  const pending = affiliations.filter((a) => a.removalRequestStatus === 'pending');
  if (pending.length === 0) return null;

  return (
    <div className="mb-6 rounded-2xl border border-amber-500/30 bg-amber-500/5 p-4 space-y-3">
      <div className="flex items-center gap-2">
        <AlertTriangle className="w-4 h-4 text-amber-400" />
        <p className="font-grotesk font-semibold text-sm text-amber-400">
          Demandes de suppression d'affiliation ({pending.length})
        </p>
      </div>
      <p className="text-xs text-muted-foreground">
        Les organisations ci-dessous demandent la suppression d'une affiliation. Examinez la raison avant d'approuver.
      </p>
      <div className="space-y-2">
        {pending.map((a) => (
          <div key={a.id} className="rounded-xl border border-amber-500/20 bg-background/60 p-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="font-inter text-sm font-medium truncate">{a.organizationNameResolved || a.organizationName || 'Organisation'}</span>
                <span className="text-muted-foreground">→</span>
                <span className="font-inter text-sm truncate">{a.affiliateName || a.userId}</span>
              </div>
              {a.removalReason && (
                <p className="font-inter text-xs text-muted-foreground italic">« {a.removalReason} »</p>
              )}
              <p className="font-mono text-[10px] text-muted-foreground mt-1 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {a.removalRequestedAt ? formatDistanceToNow(new Date(a.removalRequestedAt), { addSuffix: true, locale: fr }) : ''}
              </p>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <Button size="sm" className="gap-1.5 bg-emerald-500 hover:bg-emerald-600 text-white"
                onClick={() => onAction('approveRemoval', { affiliationId: a.id })}>
                <Check className="w-3.5 h-3.5" /> Approuver
              </Button>
              <Button size="sm" variant="outline" className="gap-1.5 text-red-400 border-red-400/30 hover:bg-red-400/10"
                onClick={() => onAction('rejectRemoval', { affiliationId: a.id })}>
                <X className="w-3.5 h-3.5" /> Refuser
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}