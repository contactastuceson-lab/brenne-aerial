import { motion } from 'framer-motion';
import { Snowflake } from 'lucide-react';

export default function BankFreezeBanner({ reason }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      className="relative overflow-hidden rounded-2xl border border-red-500/50"
      style={{ background: 'linear-gradient(135deg, rgba(239,68,68,0.18) 0%, rgba(220,38,38,0.12) 100%)' }}
    >
      <div className="h-1 w-full" style={{ background: 'linear-gradient(90deg, transparent, rgba(239,68,68,1), transparent)' }} />
      <div className="px-5 py-4 flex items-start gap-4">
        <div className="flex-shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center text-2xl animate-pulse"
          style={{ background: 'rgba(239,68,68,0.18)', border: '1px solid rgba(239,68,68,0.4)' }}>❄️</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Snowflake className="w-4 h-4 flex-shrink-0" style={{ color: '#fca5a5' }} />
            <span className="font-grotesk font-black text-base" style={{ color: '#fecaca' }}>Compte bancaire gelé</span>
          </div>
          <p className="font-inter text-sm text-red-100/90 leading-snug">
            Votre compte bancaire Eza est temporairement gelé par l'administration.
            Les <strong>virements</strong>, <strong>déplacements de crédits</strong> et <strong>achats en boutique</strong> sont désactivés.
            Le reste de votre compte (posts, messages, devis…) reste accessible.
          </p>
          {reason && (
            <p className="font-inter text-sm italic mt-2 px-3 py-2 rounded-lg inline-block"
              style={{ color: '#fecaca', background: 'rgba(239,68,68,0.10)', border: '1px solid rgba(239,68,68,0.25)' }}>
              Motif : « {reason} »
            </p>
          )}
          <p className="font-inter text-xs text-red-200/70 mt-2">Contactez le support Eza pour toute question.</p>
        </div>
      </div>
    </motion.div>
  );
}