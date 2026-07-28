import React, { useState } from 'react';
import { ShieldOff, ShieldCheck, AlertTriangle } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

export default function BadgeEligibilityBlock({ user, onToggle }) {
  const ineligible = user.badges_eligible === false;
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);

  const handle = async () => {
    if (!ineligible && reason.trim().length < 5) return;
    setBusy(true);
    try {
      await onToggle(ineligible ? null : reason.trim());
      setReason('');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={`rounded-lg border p-3 space-y-2 ${ineligible ? 'bg-red-500/5 border-red-500/30' : 'bg-background border-border'}`}>
      <div className="flex items-center gap-2">
        {ineligible ? <ShieldOff className="w-4 h-4 text-red-400" /> : <ShieldCheck className="w-4 h-4 text-emerald-400" />}
        <p className="font-inter text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          Éligibilité aux badges
        </p>
      </div>

      {ineligible ? (
        <div className="space-y-2">
          <div className="flex items-start gap-2 rounded-md bg-red-500/10 p-2">
            <AlertTriangle className="w-3.5 h-3.5 text-red-400 mt-0.5 flex-shrink-0" />
            <div className="text-xs">
              <p className="text-red-300 font-medium">Profil marqué non-éligible aux badges</p>
              {user.badge_ineligibility_reason && (
                <p className="text-muted-foreground mt-0.5">Motif : {user.badge_ineligibility_reason}</p>
              )}
              {user.badge_ineligibility_set_by && (
                <p className="text-muted-foreground/70 mt-0.5">Par {user.badge_ineligibility_set_by}</p>
              )}
            </div>
          </div>
          <Button size="sm" variant="outline" onClick={handle} disabled={busy} className="w-full">
            <ShieldCheck className="w-3.5 h-3.5" /> Rétablir l'éligibilité
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          <Textarea
            placeholder="Motif de la non-éligibilité (min. 5 caractères)"
            value={reason}
            onChange={e => setReason(e.target.value)}
            className="min-h-[60px] text-sm"
          />
          <Button size="sm" variant="destructive" onClick={handle} disabled={busy || reason.trim().length < 5} className="w-full">
            <ShieldOff className="w-3.5 h-3.5" /> Marquer non-éligible
          </Button>
        </div>
      )}
    </div>
  );
}