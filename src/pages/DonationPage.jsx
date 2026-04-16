import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, Loader2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { usePageEnabled } from '@/hooks/usePageEnabled';
import FeatureDisabled from '@/components/shared/FeatureDisabled';

export default function DonationPage() {
  const { enabled, isLoading: checkingEnabled } = usePageEnabled('page_donation_enabled');
  const [selectedAmount, setSelectedAmount] = useState(null);
  const [loading, setLoading] = useState(false);

  if (checkingEnabled) return null;
  if (!enabled) return <FeatureDisabled title="Page Donation indisponible" message="La plateforme de dons est temporairement désactivée." />;

  const donationTiers = [
    { amount: 10, label: '10€', description: 'Supporter la mission', emoji: '🙏' },
    { amount: 25, label: '25€', description: 'Contributeur' },
    { amount: 50, label: '50€', description: 'Partenaire', emoji: '⭐' },
    { amount: 100, label: '100€', description: 'Champion', emoji: '🚁' },
    { amount: 250, label: '250€', description: 'Mécène', emoji: '👑' },
  ];

  const handleDonate = async (amount) => {
    setLoading(true);
    try {
      const response = await base44.functions.invoke('createDonationPayment', { amount });
      if (response.data.url) {
        window.location.href = response.data.url;
      }
    } catch (error) {
      toast.error('Erreur lors de la création du paiement');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-20 pb-20 px-5">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <div className="inline-block p-3 rounded-full bg-primary/10 border border-primary/30 mb-4">
            <Heart className="w-8 h-8 text-primary" />
          </div>
          <h1 className="font-grotesk font-bold text-4xl mb-3">Soutenir Brenne Aerial</h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Votre contribution nous aide à continuer à développer les meilleures solutions drone du marché. Merci de votre soutien !
          </p>
        </motion.div>

        {/* Donation Tiers */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-12"
        >
          {donationTiers.map((tier, idx) => (
            <motion.button
              key={tier.amount}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              onClick={() => setSelectedAmount(tier.amount)}
              className={`group relative p-6 rounded-2xl border-2 transition-all cursor-pointer ${
                selectedAmount === tier.amount
                  ? 'bg-primary/10 border-primary'
                  : 'bg-card border-border hover:border-primary/50'
              }`}
            >
              {selectedAmount === tier.amount && (
                <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                  <Check className="w-3 h-3 text-primary-foreground" />
                </div>
              )}
              
              <div className="text-3xl mb-2">{tier.emoji || '💝'}</div>
              <p className="font-grotesk font-bold text-xl text-primary mb-1">{tier.label}</p>
              <p className="text-xs text-muted-foreground">{tier.description}</p>
            </motion.button>
          ))}
        </motion.div>

        {/* Montant personnalisé */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-card border border-border rounded-2xl p-8 mb-8"
        >
          <h2 className="font-grotesk font-bold text-lg mb-4">Montant personnalisé</h2>
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground font-semibold">€</span>
              <input
                type="number"
                min="1"
                value={selectedAmount || ''}
                onChange={(e) => setSelectedAmount(e.target.value ? parseInt(e.target.value) : null)}
                placeholder="Autre montant"
                className="w-full bg-secondary border border-border rounded-lg pl-8 pr-4 py-3 font-mono text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>
        </motion.div>

        {/* Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
        >
          {[
            { icon: '🛡️', title: 'Sécurisé', desc: 'Paiement sécurisé par Stripe' },
            { icon: '🌍', title: 'Global', desc: 'Cartes de tous les pays acceptées' },
            { icon: '📧', title: 'Confirmation', desc: 'Email de confirmation immédiat' },
          ].map((item, idx) => (
            <div key={idx} className="bg-card border border-border rounded-xl p-4 text-center">
              <p className="text-2xl mb-2">{item.icon}</p>
              <p className="font-semibold text-sm mb-1">{item.title}</p>
              <p className="text-xs text-muted-foreground">{item.desc}</p>
            </div>
          ))}
        </motion.div>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-center"
        >
          <Button
            onClick={() => selectedAmount && handleDonate(selectedAmount)}
            disabled={!selectedAmount || loading}
            size="lg"
            className="bg-primary text-primary-foreground gap-2 px-8 h-12 font-semibold"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Redirection Stripe...
              </>
            ) : (
              <>
                <Heart className="w-5 h-5" />
                Faire un don de {selectedAmount}€
              </>
            )}
          </Button>
          
          {!selectedAmount && (
            <p className="text-xs text-muted-foreground mt-3">Sélectionnez un montant pour continuer</p>
          )}
        </motion.div>

        {/* FAQ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-16 max-w-2xl mx-auto"
        >
          <h3 className="font-grotesk font-bold text-lg mb-6 text-center">Questions fréquentes</h3>
          <div className="space-y-4">
            {[
              {
                q: 'Puis-je obtenir un reçu ?',
                a: 'Oui, un email de confirmation avec reçu sera envoyé immédiatement après votre don.',
              },
              {
                q: 'Vos dons sont-ils sécurisés ?',
                a: 'Absolument ! Nous utilisons Stripe, le leader mondial des paiements en ligne.',
              },
              {
                q: 'À quoi servent les dons ?',
                a: 'Vos dons financent le développement, la recherche et l\'innovation chez Brenne Aerial.',
              },
            ].map((item, idx) => (
              <div key={idx} className="bg-card border border-border rounded-xl p-4">
                <p className="font-semibold text-sm mb-2">{item.q}</p>
                <p className="text-xs text-muted-foreground">{item.a}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}