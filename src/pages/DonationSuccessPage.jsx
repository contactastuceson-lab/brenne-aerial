import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Home, Mail, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';

export default function DonationSuccessPage() {
  const [user, setUser] = useState(null);
  const [amount, setAmount] = useState(null);

  useEffect(() => {
    base44.auth.me().then(async (u) => {
      setUser(u);
      const params = new URLSearchParams(window.location.search);
      const sessionId = params.get('session_id') || '';
      
      // Récupérer le montant du don depuis la base de données
      try {
        if (sessionId) {
          const donations = await base44.entities.Donation.filter({
            stripe_session_id: sessionId,
          });
          if (donations.length > 0) {
            setAmount(donations[0].amount);
          }
        }
      } catch (err) {
        console.error('Error fetching donation amount:', err);
      }
      
      // Ajouter le badge Donateur
      try {
        await base44.functions.invoke('addDonatorBadge', {});
      } catch (err) {
        console.error('Badge error:', err);
      }
      
      // Logger le don
      try {
        if (sessionId) {
          await base44.functions.invoke('logDonation', {
            sessionId: sessionId,
          });
        }
      } catch (err) {
        console.error('Log error:', err);
      }
      
      // Envoyer email de confirmation de don
      try {
        await base44.functions.invoke('sendDonationConfirmation', {
          userEmail: u?.email || 'anonymous',
          userName: u?.full_name || 'Bienfaiteur',
          amount: amount || 'N/A',
        });
      } catch (err) {
        console.error('Email error:', err);
      }
    });
  }, []);

  if (!user && user !== false) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-secondary/20 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md"
      >
        <div className="text-center space-y-6">
          {/* Success icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
            className="w-20 h-20 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center mx-auto"
          >
            <Heart className="w-12 h-12 text-green-400" />
          </motion.div>

          {/* Content */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <h1 className="font-grotesk font-bold text-3xl mb-2">Merci pour votre don !</h1>
            <p className="text-muted-foreground">Vous avez soutenu Brenne Aerial</p>
          </motion.div>

          {/* Message */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="bg-card border border-border rounded-lg p-6 space-y-4"
          >
            <div className="flex items-start gap-3">
              <Mail className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <div className="text-left">
                <p className="font-semibold text-sm mb-1">Email de confirmation envoyé</p>
                <p className="text-xs text-muted-foreground">
                  Un reçu a été envoyé à <strong>{user?.email || 'votre adresse email'}</strong>
                </p>
              </div>
            </div>

            <div className="bg-secondary/50 border border-border rounded p-4 space-y-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase">Votre impact</p>
              <ul className="text-xs text-foreground/80 space-y-1.5 list-disc list-inside">
                <li>Vous financez l'innovation drone</li>
                <li>Vous soutenez l'excellence technique</li>
                <li>Vous contribuez à notre mission</li>
              </ul>
            </div>

            <div className="bg-primary/5 border border-primary/20 rounded p-4">
              <p className="text-xs text-muted-foreground mb-2">
                <span className="font-semibold">💡 Bon à savoir :</span> Vous êtes maintenant un soutien officiel de Brenne Aerial !
              </p>
            </div>
          </motion.div>

          {/* Actions */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex flex-col gap-2"
          >
            <Link to="/" className="w-full">
              <Button className="w-full bg-primary text-primary-foreground gap-2">
                <Home className="w-4 h-4" />
                Retour à l'accueil
              </Button>
            </Link>
            <Link to="/donation" className="w-full">
              <Button variant="outline" className="w-full gap-2">
                <Heart className="w-4 h-4" />
                Faire un autre don
              </Button>
            </Link>
          </motion.div>

          <p className="text-xs text-muted-foreground">
            Des questions ? Contactez-nous à <strong>contact@brenne-aerial.fr</strong>
          </p>
        </div>
      </motion.div>
    </div>
  );
}