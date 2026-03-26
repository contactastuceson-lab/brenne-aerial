// Price calculator
export const SERVICE_PRICES = {
  video_evenement:      { base: 350, per_hour: 150, label: 'Vidéo événement' },
  inspection_toiture:   { base: 200, per_hour: 100, label: 'Inspection toiture' },
  suivi_chantier:       { base: 250, per_hour: 120, label: 'Suivi chantier' },
  captation_particulier:{ base: 180, per_hour: 90,  label: 'Captation particulier' },
  captation_entreprise: { base: 400, per_hour: 180, label: 'Captation entreprise' },
  retour_temps_reel:    { base: 500, per_hour: 200, label: 'Retour temps réel' },
  autre:                { base: 200, per_hour: 100, label: 'Autre' },
};

export const DURATION_HOURS = {
  '1h': 1, '2-3h': 2.5, 'demi-journee': 4, 'journee': 8, 'multi-jours': 16,
};

export function calculatePrice(serviceType, duration) {
  const svc = SERVICE_PRICES[serviceType];
  if (!svc) return 0;
  const hours = DURATION_HOURS[duration] || 1;
  return Math.round(svc.base + svc.per_hour * (hours - 1));
}

// Badge config
export const BADGE_CONFIG = {
  Fondateur:      { color: 'badge-founder', border: 'border-sky-400/40', bg: 'bg-sky-400/10' },
  Collaborateur:  { color: 'text-accent', border: 'border-accent/40', bg: 'bg-accent/10' },
  VIP:            { color: 'text-chart-5', border: 'border-chart-5/40', bg: 'bg-chart-5/10' },
  Admin:          { color: 'text-primary', border: 'border-primary/40', bg: 'bg-primary/10' },
  Pilote:         { color: 'text-green-400', border: 'border-green-400/40', bg: 'bg-green-400/10' },
};

// Status config
export const STATUS_CONFIG = {
  pending:    { label: 'En attente',   color: 'text-chart-5',      bg: 'bg-chart-5/10',      border: 'border-chart-5/30' },
  reviewing:  { label: 'En cours',     color: 'text-primary',      bg: 'bg-primary/10',       border: 'border-primary/30' },
  accepted:   { label: 'Accepté',      color: 'text-green-400',    bg: 'bg-green-400/10',    border: 'border-green-400/30' },
  refused:    { label: 'Refusé',       color: 'text-destructive',  bg: 'bg-destructive/10',  border: 'border-destructive/30' },
  completed:  { label: 'Terminé',      color: 'text-muted-foreground', bg: 'bg-muted',       border: 'border-border' },
  scheduled:  { label: 'Planifié',     color: 'text-chart-5',      bg: 'bg-chart-5/10',      border: 'border-chart-5/30' },
  confirmed:  { label: 'Confirmé',     color: 'text-primary',      bg: 'bg-primary/10',       border: 'border-primary/30' },
  cancelled:  { label: 'Annulé',       color: 'text-destructive',  bg: 'bg-destructive/10',  border: 'border-destructive/30' },
};

export function formatPrice(price) {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(price);
}

export function getYoutubeId(url) {
  const match = url?.match(/(?:v=|youtu\.be\/)([^&\s]+)/);
  return match ? match[1] : null;
}

export function getYoutubeThumbnail(url) {
  const id = getYoutubeId(url);
  return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : null;
}