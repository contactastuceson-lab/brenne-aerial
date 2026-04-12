// Price calculator - fallback defaults
export const SERVICE_PRICES = {
  video_evenement:      { base: 500, per_hour: 150, label: 'Vidéo événement' },
  inspection_toiture:   { base: 300, per_hour: 100, label: 'Inspection toiture' },
  suivi_chantier:       { base: 400, per_hour: 120, label: 'Suivi chantier' },
  captation_particulier:{ base: 250, per_hour: 80,  label: 'Captation particulier' },
  captation_entreprise: { base: 600, per_hour: 180, label: 'Captation entreprise' },
  retour_temps_reel:    { base: 800, per_hour: 200, label: 'Retour temps réel' },
  photogrammetrie_3d:   { base: 400, per_hour: 120, label: 'Photogrammétrie 3D' },
  cartographie_releves: { base: 450, per_hour: 140, label: 'Cartographie/Relevés' },
  thermographie:        { base: 350, per_hour: 110, label: 'Thermographie infrarouge' },
  surveillance:         { base: 200, per_hour: 80,  label: 'Surveillance/Gardiennage' },
  contenu_social:       { base: 250, per_hour: 90,  label: 'Contenu réseaux sociaux' },
  reportage:            { base: 350, per_hour: 120, label: 'Reportage/Documentaire' },
  mariage_aero:         { base: 300, per_hour: 100, label: 'Mariage photo aérienne' },
  immobilier_virtuelle: { base: 200, per_hour: 70,  label: 'Visite immobilière virtuelle' },
  agriculture:          { base: 300, per_hour: 100, label: 'Agriculture/Monitoring' },
  autre:                { base: 0, per_hour: 0, label: 'Autre' },
};

// Load prices from database
export async function getServicePrices() {
  try {
    const { base44 } = await import('@/api/base44Client');
    const services = await base44.entities.Service.list();
    const prices = {};
    services.forEach(s => {
      prices[s.slug] = { base: s.base_price || 0, per_hour: s.price_per_hour || 0, label: s.name };
    });
    return prices;
  } catch (err) {
    console.warn('Failed to load service prices from DB, using defaults', err);
    return SERVICE_PRICES;
  }
}

export const DURATION_HOURS = {
  '1h': 1, '2-3h': 2.5, 'demi-journee': 4, 'journee': 8, 'multi-jours': 16,
};

export function calculatePrice(serviceType, duration, prices = SERVICE_PRICES) {
  const svc = prices[serviceType];
  if (!svc) return 0;
  const hours = DURATION_HOURS[duration] || 1;
  return Math.round(svc.base + svc.per_hour * (hours - 1));
}

// Badge config
export const BADGE_CONFIG = {
  Fondateur:       { color: 'badge-founder', border: 'border-sky-400/40', bg: 'bg-sky-400/10' },
  Collaborateur:   { color: 'text-accent', border: 'border-accent/40', bg: 'bg-accent/10' },
  VIP:             { color: 'text-chart-5', border: 'border-chart-5/40', bg: 'bg-chart-5/10' },
  Admin:           { color: 'text-primary', border: 'border-primary/40', bg: 'bg-primary/10' },
  Pilote:          { color: 'text-green-400', border: 'border-green-400/40', bg: 'bg-green-400/10' },
  Officiel:        { color: 'text-blue-400', border: 'border-blue-400/40', bg: 'bg-blue-400/10' },
  'Vérifié':       { color: 'text-cyan-400', border: 'border-cyan-400/40', bg: 'bg-cyan-400/10' },
  'Beta Testeur':  { color: 'text-orange-400', border: 'border-orange-400/40', bg: 'bg-orange-400/10' },
  Partenaire:      { color: 'text-purple-400', border: 'border-purple-400/40', bg: 'bg-purple-400/10' },
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