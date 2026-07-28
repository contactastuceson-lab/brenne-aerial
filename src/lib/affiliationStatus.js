export const AFFILIATION_STATUSES = {
  pending: { label: 'En attente', color: 'text-amber-400', bg: 'bg-amber-400/10', border: 'border-amber-400/30', dot: 'bg-amber-400' },
  accepted: { label: 'Acceptée', color: 'text-emerald-400', bg: 'bg-emerald-400/10', border: 'border-emerald-400/30', dot: 'bg-emerald-400' },
  rejected: { label: 'Refusée', color: 'text-red-400', bg: 'bg-red-400/10', border: 'border-red-400/30', dot: 'bg-red-400' },
  removed: { label: 'Supprimée', color: 'text-zinc-400', bg: 'bg-zinc-400/10', border: 'border-zinc-400/30', dot: 'bg-zinc-400' },
};

export const STATUS_ORDER = ['pending', 'accepted', 'rejected', 'removed'];

export const VISIBILITY_CONFIG = {
  public: { label: 'Public', color: 'text-primary' },
  private: { label: 'Privé', color: 'text-muted-foreground' },
};