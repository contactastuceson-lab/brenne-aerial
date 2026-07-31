import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShieldCheck, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const DURATION_LABELS = {
  premium_1m: '1 mois',
  premium_3m: '3 mois',
  premium_1y: '12 mois',
  business_1m: '1 mois',
  business_3m: '3 mois',
  enterprise_1m: '1 mois',
  vip_1m: '1 mois',
};

export default function SubscriptionTermsModal({ item, onAccept, onClose }) {
  const [checked, setChecked] = useState(false);

  if (!item) return null;
  const duration = DURATION_LABELS[item.id] || 'la durée sélectionnée';

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-card border border-border rounded-2xl w-full max-w-sm shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between p-5 border-b border-border">
            <h2 className="font-grotesk font-bold text-base flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-primary" /> Conditions d'abonnement
            </h2>
            <button onClick={onClose} className="text-muted-foreground hover:text-foreground p-1">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-5 space-y-4">
            <div className="text-center">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-3">
                <ShieldCheck className="w-7 h-7 text-primary" />
              </div>
              <p className="font-grotesk font-bold text-sm text-foreground">Souscrire à {item.label}</p>
              <p className="font-mono text-[10px] text-muted-foreground mt-1">{item.cost} crédits Eza</p>
            </div>

            <div className="rounded-xl bg-muted/20 border border-border p-3 space-y-2">
              <p className="font-inter text-xs text-muted-foreground leading-relaxed">
                En souscrivant à <span className="text-foreground font-medium">{item.label}</span>, vous acceptez nos{' '}
                <Link to="/legal/terms" className="text-primary underline inline-flex items-center gap-0.5">
                  Conditions d'Utilisation <ExternalLink className="w-2.5 h-2.5" />
                </Link>{' '}
                et notre{' '}
                <Link to="/legal/privacy" className="text-primary underline inline-flex items-center gap-0.5">
                  Politique de Confidentialité <ExternalLink className="w-2.5 h-2.5" />
                </Link>.
              </p>
              <p className="font-inter text-xs text-muted-foreground leading-relaxed">
                L'abonnement est actif pendant <span className="text-foreground font-medium">{duration}</span>. Les crédits dépensés ne sont pas remboursables.
              </p>
            </div>

            <label className="flex items-start gap-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={checked}
                onChange={(e) => setChecked(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded border-border accent-primary flex-shrink-0"
              />
              <span className="font-inter text-xs text-foreground leading-snug">
                J'ai lu et j'accepte les conditions d'utilisation et la politique de confidentialité d'Eza.
              </span>
            </label>
          </div>

          <div className="flex gap-2 p-5 border-t border-border">
            <Button variant="outline" className="flex-1 text-xs" onClick={onClose}>
              Annuler
            </Button>
            <Button
              className="flex-1 text-xs"
              onClick={onAccept}
              disabled={!checked}
            >
              Continuer
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}