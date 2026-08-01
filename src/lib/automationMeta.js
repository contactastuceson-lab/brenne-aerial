import {
  Brain, Shield, AlertCircle, Award, ShoppingCart, UserPlus, Coins,
  Megaphone, Clock, Bot, Send, CalendarClock,
} from 'lucide-react';

export const CATEGORY_META = {
  digest: { icon: Brain, color: 'text-sky-400', bg: 'bg-sky-400/10', border: 'border-sky-400/20', label: 'Digest Nexus' },
  moderation: { icon: Shield, color: 'text-red-400', bg: 'bg-red-400/10', border: 'border-red-400/20', label: 'Modération' },
  fraud: { icon: AlertCircle, color: 'text-orange-400', bg: 'bg-orange-400/10', border: 'border-orange-400/20', label: 'Anti-fraude' },
  badges: { icon: Award, color: 'text-amber-400', bg: 'bg-amber-400/10', border: 'border-amber-400/20', label: 'Badges' },
  cart: { icon: ShoppingCart, color: 'text-pink-400', bg: 'bg-pink-400/10', border: 'border-pink-400/20', label: 'Panier' },
  onboarding: { icon: UserPlus, color: 'text-emerald-400', bg: 'bg-emerald-400/10', border: 'border-emerald-400/20', label: 'Onboarding' },
  economy: { icon: Coins, color: 'text-yellow-400', bg: 'bg-yellow-400/10', border: 'border-yellow-400/20', label: 'Économie' },
  ads: { icon: Megaphone, color: 'text-fuchsia-400', bg: 'bg-fuchsia-400/10', border: 'border-fuchsia-400/20', label: 'Publicité' },
  retention: { icon: Clock, color: 'text-cyan-400', bg: 'bg-cyan-400/10', border: 'border-cyan-400/20', label: 'Rétention' },
  system: { icon: Bot, color: 'text-muted-foreground', bg: 'bg-muted/20', border: 'border-border', label: 'Système' },
};

export const STATUS_COLOR = {
  success: 'text-green-400',
  warning: 'text-yellow-400',
  error: 'text-red-400',
};

export const CATEGORIES = Object.keys(CATEGORY_META);

export const CATEGORY_FILTERS = ['all', ...CATEGORIES];

export const STATUS_FILTERS = [
  { value: 'all', label: 'Tous statuts' },
  { value: 'success', label: 'Succès' },
  { value: 'warning', label: 'Alertes' },
  { value: 'error', label: 'Erreurs' },
];

export const RANGE_FILTERS = [
  { value: '1d', label: '24h' },
  { value: '7d', label: '7j' },
  { value: '30d', label: '30j' },
  { value: 'all', label: 'Tout' },
];

export const RANGE_MS = {
  '1d': 24 * 3600 * 1000,
  '7d': 7 * 86400 * 1000,
  '30d': 30 * 86400 * 1000,
  all: null,
};

// Actions manuelles : chaque fonction automatisée peut être lancée à la demande.
export const QUICK_ACTIONS = [
  { fn: 'nexusDailyDigest', label: 'Digest Nexus', category: 'digest', metric: (r) => r?.stats ? `${r.stats.nouveaux_utilisateurs} membres · ${r.stats.demandes_remboursement_en_attente ?? 0} remb.` : 'Envoyé' },
  { fn: 'nexusWeeklyDigest', label: 'Bilan hebdo Nexus', category: 'digest', metric: (r) => `${r?.metrics?.nouveaux_membres ?? 0} membres / sem.` },
  { fn: 'detectReferralFraud', label: 'Anti-fraude parrainage', category: 'fraud', metric: (r) => `${r?.flagged ?? 0} cas` },
  { fn: 'runBadgeAttribution', label: 'Attribution badges', category: 'badges', metric: (r) => `${r?.awarded ?? 0} badges` },
  { fn: 'recoverAbandonedCarts', label: 'Relance paniers', category: 'cart', metric: (r) => `${r?.notified ?? 0} relancés` },
  { fn: 'alertLowAdBudgets', label: 'Alerte budget pub', category: 'ads', metric: (r) => `${r?.alerted ?? 0} alerte(s)` },
  { fn: 'sweepInactiveUsers', label: 'Relance inactifs', category: 'retention', metric: (r) => `${r?.sent ?? 0} emails` },
  { fn: 'sendWeeklyActivityReport', label: 'Bilan hebdo', category: 'retention', metric: (r) => `${r?.sent ?? 0} bilans` },
  { fn: 'sendOnboardingSequence', label: 'Onboarding J1/J3/J7', category: 'onboarding', metric: (r) => `${r?.sent ?? 0} emails` },
  { fn: 'publishScheduledPosts', label: 'Publier posts programmés', category: 'system', metric: () => 'Traité' },
  { fn: 'evaluateReferralMilestones', label: 'Jalons parrainage', category: 'economy', metric: () => 'Évalué' },
  { fn: 'processDailyAdBudgets', label: 'Déduction budget ads', category: 'ads', metric: () => 'Traité' },
];