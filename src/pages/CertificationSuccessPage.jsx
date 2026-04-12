import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Home, Mail, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';

export default function CertificationSuccessPage() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(async (u) => {
      setUser(u);
      const requests = await base44.entities.CertificationRequest.filter(
        { user_email: u.email },
        '-created_date',
        1
      );
      if (requests.length > 0) {
        await base44.entities.CertificationRequest.update(requests[0].id, {
          payment_status: 'completed'
        });
        // Envoyer l'email de confirmation
        await base44.functions.invoke('sendCertificationEmail', {
          certificationRequestId: requests[0].id,
          status: requests[0].status,
        });
      }
    });
  }, []);

  if (!user) {
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
            <CheckCircle className="w-12 h-12 text-green-400" />
          </motion.div>

          {/* Content */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <h1 className="font-grotesk font-bold text-3xl mb-2">Paiement reçu !</h1>
            <p className="text-muted-foreground">Merci d'avoir payé votre certification</p>
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
                  Un email de confirmation a été envoyé à <strong>{user.email}</strong>
                </p>
              </div>
            </div>

            <div className="bg-secondary/50 border border-border rounded p-4 space-y-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase">Prochaines étapes</p>
              <ol className="text-xs text-foreground/80 space-y-1.5 list-decimal list-inside">
                <li>Notre équipe examinera votre dossier</li>
                <li>Vous recevrez une réponse sous 5 jours</li>
                <li>Si approuvée, vous verrez le badge sur votre profil</li>
              </ol>
            </div>
          </motion.div>

          {/* Actions */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex flex-col gap-2"
          >
            <Link to="/dashboard?tab=certifications" className="w-full">
              <Button className="w-full bg-primary text-primary-foreground gap-2">
                <Eye className="w-4 h-4" />
                Voir la timeline
              </Button>
            </Link>
            <Link to="/profile" className="w-full">
              <Button variant="outline" className="w-full gap-2">
                <Home className="w-4 h-4" />
                Retour au profil
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