import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2, Sparkles, Crown, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';

const SUB_INFO = {
  premium: {
    label: 'Premium',
    icon: Crown,
    color: 'text-amber-400',
    bg: 'bg-amber-400/10',
    border: 'border-amber-400/30',
    perks: [
      'Aucune publicité dans toute l\u2019app',
      'Publications sponsorisées illimitées',
      'Couleurs de profil personnalisées',
      'Badge animé personnalisé',
      'Son de notification personnalisé',
      'Effets de particules sur le profil',
    ],
  },
  business: {
    label: 'Business',
    icon: Crown,
    color: 'text-amber-400',
    bg: 'bg-amber-400/10',
    border: 'border-amber-400/30',
    perks: [
      'Tous les avantages Premium inclus',
      'Création de campagnes publicitaires Eza Ads',
      'Publications sponsorisées Business',
      'Espace business dédié avec gestion des affiliations',
      'Priorité d\u2019affichage dans le feed',
    ],
  },
  enterprise: {
    label: 'Enterprise',
    icon: Trophy,
    color: 'text-yellow-400',
    bg: 'bg-yellow-400/10',
    border: 'border-yellow-400/30',
    perks: [
      'Tous les avantages Business inclus',
      'Analytics avancées détaillées',
      'Stockage étendu (5 Go)',
      'Accès anticipé aux nouvelles fonctionnalités',
      'Support prioritaire dédié',
    ],
  },
  vip: {
    label: 'VIP',
    icon: Trophy,
    color: 'text-yellow-400',
    bg: 'bg-yellow-400/10',
    border: 'border-yellow-400/30',
    perks: [
      'Statut VIP — le plus prestigieux d\u2019Eza',
      'Badge exclusif VIP',
      'Priorité maximale dans l\u2019explorateur',
      'Accès anticipé aux nouveautés',
      'Mise en avant du profil',
    ],
  },
};

const ITEM_TYPE_MAP = {
  premium_1m: 'premium', premium_3m: 'premium', premium_1y: 'premium',
  business_1m: 'business', business_3m: 'business',
  enterprise_1m: 'enterprise',
  vip_1m: 'vip',
};

const DURATION_LABELS = {
  premium_1m: '1 mois', premium_3m: '3 mois', premium_1y: '12 mois',
  business_1m: '1 mois', business_3m: '3 mois',
  enterprise_1m: '1 mois', vip_1m: '1 mois',
};

export default function SubscriptionSuccessModal({ item, onClose }) {
  if (!item) return null;
  const subType = ITEM_TYPE_MAP[item.id];
  const info = SUB_INFO[subType];
  if (!info) return null;

  const duration = DURATION_LABELS[item.id] || '';
  const Icon = info.icon;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-background/85 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 30 }}
          transition={{ type: 'spring', damping: 20, stiffness: 280 }}
          className="bg-card border border-border rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header gradient */}
          <div className={`relative px-6 pt-8 pb-6 ${info.bg} border-b ${info.border}`}>
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground p-1"
            >
              <X className="w-4 h-4" />
            </button>

            <motion.div
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.15, type: 'spring', damping: 12, stiffness: 200 }}
              className={`w-16 h-16 rounded-2xl ${info.bg} border-2 ${info.border} flex items-center justify-center mx-auto mb-4 sky-glow`}
            >
              <Icon className={`w-8 h-8 ${info.color}`} />
            </motion.div>

            <div className="text-center">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
                  Abonnement activé
                </p>
                <h2 className="font-grotesk font-black text-2xl text-foreground">
                  Bienvenue dans {info.label}
                </h2>
                {duration && (
                  <p className="font-inter text-xs text-muted-foreground mt-1.5">
                    Actif pendant {duration}
                  </p>
                )}
              </motion.div>
            </div>
          </div>

          {/* Perks list */}
          <div className="p-5 space-y-3">
            <p className="font-grotesk font-bold text-xs text-foreground flex items-center gap-1.5">
              <Sparkles className={`w-3.5 h-3.5 ${info.color}`} /> Vos avantages débloqués
            </p>
            <div className="space-y-2">
              {info.perks.map((perk, i) => (
                <motion.div
                  key={perk}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + i * 0.08 }}
                  className="flex items-start gap-2.5"
                >
                  <CheckCircle2 className={`w-4 h-4 ${info.color} flex-shrink-0 mt-0.5`} />
                  <span className="font-inter text-xs text-foreground leading-snug">{perk}</span>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="p-5 pt-2">
            <Button className="w-full text-sm" onClick={onClose}>
              Profiter de mes avantages
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}