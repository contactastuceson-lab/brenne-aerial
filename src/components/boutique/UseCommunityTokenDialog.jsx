import { useState, useEffect } from 'react';
import { Loader2, Users, CheckCircle } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const TOKEN_META = {
  community_pin: { label: 'Épingler une communauté', desc: 'Votre communauté épinglée 30 jours', action: 'Épingler' },
  community_capacity: { label: 'Capacité 1000 membres', desc: 'Étendez une communauté à 1000 membres', action: 'Étendre' },
  community_premium_design: { label: 'Design premium', desc: 'Apparence premium pour une communauté', action: 'Appliquer' },
  community_space: { label: 'Space communautaire', desc: 'Demander un Space audio dédié', action: 'Demander' },
  sponsored_event: { label: 'Événement sponsorisé', desc: 'Sponsoriser un événement', action: 'Demander' },
};

export default function UseCommunityTokenDialog({ open, onClose, tokenType, count, onUsed }) {
  const [communities, setCommunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    if (!open) return;
    (async () => {
      setLoading(true);
      try {
        const me = await base44.auth.me();
        const mine = await base44.entities.Community.filter({ owner_id: me.id }, '-created_date', 50);
        setCommunities(mine || []);
      } catch { toast.error('Erreur lors du chargement des communautés'); }
      setLoading(false);
    })();
  }, [open]);

  const apply = async () => {
    if (!selected) return;
    setApplying(true);
    try {
      const res = await base44.functions.invoke('useRewardToken', { tokenType, targetId: selected });
      const data = res.data || res;
      if (data?.success) {
        toast.success(data.message || 'Token utilisé !');
        onUsed?.();
        onClose();
      } else if (data?.error) {
        toast.error(data.error);
      }
    } catch (e) {
      toast.error(e?.response?.data?.error || e?.message || 'Erreur');
    }
    setApplying(false);
  };

  const meta = TOKEN_META[tokenType];
  if (!meta) return null;

  // community_space & sponsored_event are "request" type — no community selection needed
  const needsSelection = tokenType !== 'community_space' && tokenType !== 'sponsored_event';

  const handleRequest = async () => {
    setApplying(true);
    try {
      const res = await base44.functions.invoke('useRewardToken', { tokenType, targetId: 'request' });
      const data = res.data || res;
      if (data?.success) {
        toast.success(data.message || 'Demande envoyée !');
        onUsed?.();
        onClose();
      } else if (data?.error) {
        toast.error(data.error);
      }
    } catch (e) {
      toast.error(e?.response?.data?.error || e?.message || 'Erreur');
    }
    setApplying(false);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg bg-card border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-grotesk font-bold">
            <Users className="w-5 h-5 text-emerald-400" />
            {meta.label}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <p className="font-inter text-sm text-muted-foreground">
            {meta.desc}.
            <span className="ml-1 font-mono text-xs text-muted-foreground/60">({count} disponible{count > 1 ? 's' : ''})</span>
          </p>

          {!needsSelection ? (
            <div className="py-6 text-center">
              <p className="font-inter text-sm text-muted-foreground mb-4">
                Votre demande sera transmise à notre équipe qui vous contactera.
              </p>
              <div className="flex gap-2">
                <Button variant="outline" onClick={onClose} className="flex-1">Annuler</Button>
                <Button onClick={handleRequest} disabled={applying} className="flex-1">
                  {applying ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Envoyer la demande'}
                </Button>
              </div>
            </div>
          ) : loading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : communities.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground/50 text-sm">
              Vous n'avez pas encore créé de communauté. Créez-en une d'abord pour utiliser ce token.
            </div>
          ) : (
            <>
              <div className="max-h-[50vh] overflow-y-auto space-y-2">
                {communities.map(c => {
                  const isSel = selected === c.id;
                  return (
                    <button key={c.id} onClick={() => setSelected(c.id)}
                      className={`w-full text-left p-3 rounded-xl border transition-all ${
                        isSel ? 'border-emerald-400 bg-emerald-400/10' : 'border-border hover:border-emerald-400/30 bg-secondary/30'
                      }`}>
                      <div className="flex items-start gap-2">
                        <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 mt-0.5 flex items-center justify-center ${
                          isSel ? 'border-emerald-400 bg-emerald-400' : 'border-border'
                        }`}>
                          {isSel && <CheckCircle className="w-3 h-3 text-background" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-grotesk font-bold text-sm text-foreground truncate">{c.name}</p>
                          <p className="font-inter text-xs text-muted-foreground line-clamp-1">{c.description || 'Sans description'}</p>
                          <span className="font-mono text-[10px] text-muted-foreground/50">{c.members_count || 0} membres</span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
              <div className="flex gap-2 pt-2">
                <Button variant="outline" onClick={onClose} className="flex-1">Annuler</Button>
                <Button onClick={apply} disabled={!selected || applying} className="flex-1 flex items-center gap-1.5">
                  {applying ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                  {meta.action}
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}