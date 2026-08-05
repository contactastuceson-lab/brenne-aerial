import {
  Heart, MessageCircle, UserPlus, CheckCircle, AtSign, Bell,
  X, FileText, Calendar, Award, Megaphone, Ticket, TrendingUp,
  AlertTriangle, DollarSign, Sparkles, ShieldAlert, Users
} from 'lucide-react';

export const NOTIF_TYPE_CONFIG = {
  // Social
  LIKE:        { icon: Heart,          color: 'text-rose-400',   bg: 'bg-rose-400/10',   border: 'border-rose-400/20',   label: "J'aime" },
  REPLY:       { icon: MessageCircle,  color: 'text-blue-400',   bg: 'bg-blue-400/10',   border: 'border-blue-400/20',   label: 'Réponse' },
  FOLLOW:      { icon: UserPlus,        color: 'text-primary',    bg: 'bg-primary/10',     border: 'border-primary/20',     label: 'Abonnement' },
  VERIFICATION:{ icon: CheckCircle,     color: 'text-sky-400',    bg: 'bg-sky-400/10',    border: 'border-sky-400/20',    label: 'Vérification' },
  MENTION:     { icon: AtSign,           color: 'text-purple-400', bg: 'bg-purple-400/10', border: 'border-purple-400/20', label: 'Mention' },

  // Devis & RDV
  quote_accepted:  { icon: CheckCircle,    color: 'text-green-400',  bg: 'bg-green-400/10',  border: 'border-green-400/20',  label: 'Devis accepté' },
  quote_refused:   { icon: X,               color: 'text-red-400',    bg: 'bg-red-400/10',    border: 'border-red-400/20',    label: 'Devis refusé' },
  quote_pending:   { icon: FileText,        color: 'text-primary',     bg: 'bg-primary/10',     border: 'border-primary/20',     label: 'Devis en attente' },
  appointment:     { icon: Calendar,       color: 'text-amber-400',   bg: 'bg-amber-400/10',  border: 'border-amber-400/20',  label: 'Rendez-vous' },
  contact_request: { icon: UserPlus,       color: 'text-cyan-400',   bg: 'bg-cyan-400/10',   border: 'border-cyan-400/20',   label: 'Demande de contact' },

  // Messagerie
  new_message:     { icon: MessageCircle,  color: 'text-accent',      bg: 'bg-accent/10',      border: 'border-accent/20',      label: 'Message' },

  // Système & divers
  system:          { icon: Bell,            color: 'text-muted-foreground', bg: 'bg-muted',         border: 'border-border',         label: 'Système' },
  badge:            { icon: Award,           color: 'text-purple-400',  bg: 'bg-purple-400/10',  border: 'border-purple-400/20',  label: 'Badge' },
  blog:             { icon: FileText,        color: 'text-blue-400',   bg: 'bg-blue-400/10',   border: 'border-blue-400/20',   label: 'Blog' },
};

export function getNotifConfig(type) {
  return NOTIF_TYPE_CONFIG[type] || NOTIF_TYPE_CONFIG.system;
}