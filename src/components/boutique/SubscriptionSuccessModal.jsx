import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Crown, Trophy, Sparkles, CheckCircle2, ArrowRight, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import confetti from 'canvas-confetti';

const SUB_INFO = {
  premium: {
    label: 'Premium',
    icon: Crown,
    glow: 'rgba(251, 191, 36, 0.55)',
    glowSoft: 'rgba(251, 191, 36, 0.15)',
    iconBg: 'bg-amber-400/10',
    iconBorder: 'border-amber-400/40',
    iconColor: 'text-amber-400',
    badgeBg: 'bg-amber-400/10',
    badgeBorder: 'border-amber-400/30',
    textGradient: 'bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 bg-clip-text text-transparent',
    ringColor: '#fbbf24',
    confetti: ['#fbbf24', '#f59e0b', '#fde047', '#fef08a', '#38bdf8'],
    tagline: "L'expérience Eza sans publicité, sublimée.",
    perks: [
      'Aucune publicité dans toute l\u2019application',
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
    glow: 'rgba(245, 158, 11, 0.55)',
    glowSoft: 'rgba(245, 158, 11, 0.15)',
    iconBg: 'bg-orange-400/10',
    iconBorder: 'border-orange-400/40',
    iconColor: 'text-orange-400',
    badgeBg: 'bg-orange-400/10',
    badgeBorder: 'border-orange-400/30',
    textGradient: 'bg-gradient-to-r from-orange-400 via-amber-400 to-orange-400 bg-clip-text text-transparent',
    ringColor: '#f97316',
    confetti: ['#f97316', '#fbbf24', '#fb923c', '#fdba74', '#38bdf8'],
    tagline: "Votre marque, propulsée sur tout l'écosystème Eza.",
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
    glow: 'rgba(250, 204, 21, 0.6)',
    glowSoft: 'rgba(250, 204, 21, 0.15)',
    iconBg: 'bg-yellow-400/10',
    iconBorder: 'border-yellow-400/40',
    iconColor: 'text-yellow-400',
    badgeBg: 'bg-yellow-400/10',
    badgeBorder: 'border-yellow-400/30',
    textGradient: 'bg-gradient-to-r from-yellow-400 via-amber-300 to-yellow-400 bg-clip-text text-transparent',
    ringColor: '#facc15',
    confetti: ['#facc15', '#fde047', '#fef08a', '#fbbf24', '#38bdf8'],
    tagline: "Le summum des outils Eza pour organisations ambitieuses.",
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
    glow: 'rgba(250, 204, 21, 0.65)',
    glowSoft: 'rgba(250, 204, 21, 0.18)',
    iconBg: 'bg-yellow-400/10',
    iconBorder: 'border-yellow-400/50',
    iconColor: 'text-yellow-400',
    badgeBg: 'bg-yellow-400/10',
    badgeBorder: 'border-yellow-400/40',
    textGradient: 'bg-gradient-to-r from-yellow-300 via-amber-200 to-yellow-300 bg-clip-text text-transparent',
    ringColor: '#fde047',
    confetti: ['#fde047', '#facc15', '#fef08a', '#fbbf24', '#ffffff'],
    tagline: "Le statut le plus prestigieux d'Eza. Vous êtes aux sommets.",
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
  useEffect(() => {
    if (!item) return;
    const subType = ITEM_TYPE_MAP[item.id];
    const info = SUB_INFO[subType];
    if (!info) return;
    const colors = info.confetti;

    // Burst central
    confetti({
      particleCount: 100,
      spread: 80,
      origin: { y: 0.35 },
      colors,
      startVelocity: 45,
    });

    // Bursts latéraux
    const t1 = setTimeout(() => {
      confetti({ particleCount: 60, angle: 60, spread: 60, origin: { x: 0, y: 0.65 }, colors, startVelocity: 55 });
      confetti({ particleCount: 60, angle: 120, spread: 60, origin: { x: 1, y: 0.65 }, colors, startVelocity: 55 });
    }, 250);

    // Ruissellement continu
    const t2 = setTimeout(() => {
      confetti({ particleCount: 40, spread: 100, origin: { y: 0.1 }, colors, gravity: 0.8, scalar: 0.8 });
    }, 700);

    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [item]);

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
        transition={{ duration: 0.3 }}
        className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-hidden"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(8,18,36,0.92) 0%, rgba(4,10,20,0.98) 100%)',
          backdropFilter: 'blur(8px)',
        }}
        onClick={onClose}
      >
        {/* Glow radial derrière l'emblème */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className="absolute w-[500px] h-[500px] rounded-full pointer-events-none"
          style={{
            background: `radial-gradient(circle, ${info.glowSoft} 0%, transparent 70%)`,
          }}
        />

        {/* Anneaux pulsants */}
        <div className="absolute pointer-events-none">
          {[0, 1, 2].map(i => (
            <motion.div
              key={i}
              initial={{ scale: 0.5, opacity: 0.6 }}
              animate={{ scale: 3, opacity: 0 }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                delay: i * 0.8,
                ease: 'easeOut',
              }}
              className="absolute w-32 h-32 rounded-full border-2 -translate-x-16 -translate-y-16"
              style={{ borderColor: info.ringColor }}
            />
          ))}
        </div>

        {/* Carte principale */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 40 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 40 }}
          transition={{ type: 'spring', damping: 22, stiffness: 260, delay: 0.1 }}
          className="relative w-full max-w-md"
          onClick={(e) => e.stopPropagation()}
        >
          <div
            className="relative rounded-3xl border overflow-hidden"
            style={{
              borderColor: info.ringColor + '40',
              background: 'linear-gradient(180deg, rgba(13,20,38,0.95) 0%, rgba(8,14,28,0.98) 100%)',
              boxShadow: `0 0 80px ${info.glow}, 0 0 30px ${info.glowSoft}`,
            }}
          >
            {/* Bouton fermer */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-20 text-muted-foreground/60 hover:text-foreground p-1.5 rounded-lg hover:bg-white/5 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Bandeau d'accroche */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="flex items-center justify-center gap-1.5 pt-6 pb-0"
            >
              <Sparkles className={`w-3 h-3 ${info.iconColor}`} />
              <span className="font-mono text-[9px] uppercase tracking-[0.25em] text-muted-foreground">
                Abonnement activé
              </span>
              <Sparkles className={`w-3 h-3 ${info.iconColor}`} />
            </motion.div>

            {/* Emblème du tier */}
            <div className="flex justify-center pt-4 pb-2">
              <motion.div
                initial={{ scale: 0, rotate: -180, opacity: 0 }}
                animate={{ scale: 1, rotate: 0, opacity: 1 }}
                transition={{ type: 'spring', damping: 12, stiffness: 200, delay: 0.2 }}
                className={`relative w-24 h-24 rounded-3xl ${info.iconBg} border-2 ${info.iconBorder} flex items-center justify-center`}
                style={{ boxShadow: `0 0 40px ${info.glow}` }}
              >
                <motion.div
                  animate={{
                    y: [0, -4, 0],
                  }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <Icon className={`w-12 h-12 ${info.iconColor}`} strokeWidth={1.5} />
                </motion.div>

                {/* Halo scintillant */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0, 0.6, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                  className="absolute inset-0 rounded-3xl"
                  style={{ boxShadow: `inset 0 0 20px ${info.glow}` }}
                />
              </motion.div>
            </div>

            {/* Titre */}
            <div className="text-center px-6 pb-2">
              <motion.p
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, type: 'spring', damping: 20 }}
                className="font-grotesk text-sm text-muted-foreground mb-1"
              >
                Bienvenue dans
              </motion.p>
              <motion.h1
                initial={{ opacity: 0, scale: 0.5, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ delay: 0.65, type: 'spring', damping: 14, stiffness: 300 }}
                className={`font-grotesk font-black text-4xl ${info.textGradient} sky-glow-text leading-none`}
              >
                {info.label}
              </motion.h1>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9 }}
                className="mt-3 flex items-center justify-center gap-2"
              >
                {duration && (
                  <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full ${info.badgeBg} border ${info.badgeBorder} font-mono text-[10px] font-bold ${info.iconColor}`}>
                    <Zap className="w-3 h-3" /> {duration}
                  </span>
                )}
                <span className="font-mono text-[10px] text-muted-foreground">
                  {item.cost} crédits Eza
                </span>
              </motion.div>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className="font-inter text-xs text-muted-foreground mt-3 italic"
              >
                {info.tagline}
              </motion.p>
            </div>

            {/* Séparateur animé */}
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 1.1, duration: 0.6 }}
              className="mx-6 h-px origin-center"
              style={{ background: `linear-gradient(90deg, transparent, ${info.ringColor}80, transparent)` }}
            />

            {/* Liste des avantages */}
            <div className="px-6 pt-4 pb-2 space-y-2">
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.15 }}
                className="font-grotesk font-bold text-xs text-foreground flex items-center gap-1.5"
              >
                <Sparkles className={`w-3.5 h-3.5 ${info.iconColor}`} /> Vos avantages débloqués
              </motion.p>
              <div className="space-y-1.5">
                {info.perks.map((perk, i) => (
                  <motion.div
                    key={perk}
                    initial={{ opacity: 0, x: -15 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1.25 + i * 0.1, type: 'spring', damping: 20, stiffness: 300 }}
                    className="flex items-start gap-2.5"
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 1.3 + i * 0.1, type: 'spring', damping: 15, stiffness: 400 }}
                    >
                      <CheckCircle2 className={`w-4 h-4 ${info.iconColor} flex-shrink-0 mt-0.5`} />
                    </motion.div>
                    <span className="font-inter text-xs text-foreground/90 leading-snug">{perk}</span>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Note email */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.8 }}
              className="mx-6 mt-3 mb-4 rounded-xl bg-primary/5 border border-primary/15 px-3 py-2 flex items-center gap-2"
            >
              <Sparkles className="w-3.5 h-3.5 text-primary flex-shrink-0" />
              <span className="font-inter text-[11px] text-muted-foreground">
                Un email de bienvenue vous a été envoyé — vérifiez votre boîte de réception.
              </span>
            </motion.div>

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.9 }}
              className="p-5 pt-2"
            >
              <Button
                className={`w-full gap-2 ${info.iconColor === 'text-amber-400' || info.iconColor === 'text-orange-400' ? 'bg-amber-400/15 border border-amber-400/30' : 'bg-yellow-400/15 border border-yellow-400/30'}`}
                style={{ color: info.ringColor }}
                onClick={onClose}
              >
                Profiter de mes avantages
                <ArrowRight className="w-4 h-4" />
              </Button>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}