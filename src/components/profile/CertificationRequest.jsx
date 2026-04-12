import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Loader2, Check, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

const QUESTIONS = [
  { id: 'experience', label: 'Années d\'expérience drone', type: 'number', required: true },
  { id: 'certifications', label: 'Certifications existantes', type: 'textarea', required: false, placeholder: 'DGAC, autres...' },
  { id: 'portfolio_url', label: 'URL de votre portfolio', type: 'text', required: true, placeholder: 'https://...' },
  { id: 'projects', label: 'Nombre de projets réalisés', type: 'number', required: true },
  { id: 'specialties', label: 'Spécialités', type: 'textarea', required: true, placeholder: 'Décrivez vos domaines de compétence...' },
];

export default function CertificationRequest({ onClose, user }) {
  const [step, setStep] = useState('form'); // form, payment, success
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({});

  const handleInputChange = (id, value) => {
    setFormData(p => ({ ...p, [id]: value }));
  };

  const handleSubmit = async () => {
    // Validate required fields
    const missing = QUESTIONS.filter(q => q.required && !formData[q.id]);
    if (missing.length > 0) {
      toast.error(`Veuillez remplir : ${missing.map(m => m.label).join(', ')}`);
      return;
    }

    setLoading(true);
    try {
      // Create certification request
      await base44.entities.CertificationRequest?.create?.({
        user_email: user.email,
        user_name: user.full_name,
        status: 'pending',
        responses: formData,
        submitted_at: new Date().toISOString(),
      });
      
      setStep('payment');
    } catch (err) {
      toast.error('Erreur lors de la soumission');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    setLoading(true);
    try {
      // Redirect to payment or trigger payment modal
      const response = await base44.functions.invoke('createCertificationPayment', {
        userEmail: user.email,
        userName: user.full_name,
        amount: 4900, // €49.00
      });
      
      if (response.data?.url) {
        window.location.href = response.data.url;
      } else {
        setStep('success');
      }
    } catch (err) {
      toast.error('Erreur lors du paiement');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-card border border-border rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="p-6 border-b border-border flex items-center justify-between sticky top-0 bg-card">
          <div className="flex items-center gap-3">
            <Award className="w-5 h-5 text-primary" />
            <h2 className="font-grotesk font-bold text-lg">Demande de certification</h2>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {step === 'form' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <p className="font-inter text-sm text-muted-foreground mb-6">
                Complétez ce formulaire pour demander votre certification. Frais : 49€
              </p>

              <div className="space-y-4">
                {QUESTIONS.map(q => (
                  <div key={q.id}>
                    <label className="font-inter text-xs text-muted-foreground mb-1.5 block">
                      {q.label} {q.required && <span className="text-destructive">*</span>}
                    </label>
                    {q.type === 'textarea' ? (
                      <Textarea
                        value={formData[q.id] || ''}
                        onChange={e => handleInputChange(q.id, e.target.value)}
                        placeholder={q.placeholder}
                        className="bg-secondary border-border resize-none h-24"
                      />
                    ) : (
                      <Input
                        type={q.type}
                        value={formData[q.id] || ''}
                        onChange={e => handleInputChange(q.id, e.target.value)}
                        placeholder={q.placeholder}
                        className="bg-secondary border-border"
                      />
                    )}
                  </div>
                ))}
              </div>

              <div className="flex gap-3 mt-8">
                <Button variant="outline" onClick={onClose} className="border-border flex-1">
                  Annuler
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="bg-primary text-primary-foreground flex-1 gap-2"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Award className="w-4 h-4" />}
                  Continuer vers le paiement
                </Button>
              </div>
            </motion.div>
          )}

          {step === 'payment' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center space-y-6">
              <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto">
                <Award className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h3 className="font-grotesk font-semibold text-lg mb-1">Paiement de la certification</h3>
                <p className="font-inter text-sm text-muted-foreground">
                  Montant : <span className="font-grotesk font-bold text-primary">49€</span>
                </p>
              </div>
              <p className="font-inter text-xs text-muted-foreground">
                Après paiement, votre demande sera examinée par notre équipe. Vous recevrez une réponse sous 5 jours ouvrables.
              </p>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setStep('form')}
                  className="border-border flex-1"
                  disabled={loading}
                >
                  Retour
                </Button>
                <Button
                  onClick={handlePayment}
                  disabled={loading}
                  className="bg-primary text-primary-foreground flex-1 gap-2"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  Payer 49€
                </Button>
              </div>
            </motion.div>
          )}

          {step === 'success' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center space-y-6 py-8">
              <div className="w-20 h-20 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto">
                <Check className="w-10 h-10 text-primary" />
              </div>
              <div>
                <h3 className="font-grotesk font-semibold text-xl mb-1">Demande reçue !</h3>
                <p className="font-inter text-sm text-muted-foreground">
                  Votre demande de certification a été enregistrée. Nous vous contacterons sous 5 jours ouvrables.
                </p>
              </div>
              <Button onClick={onClose} className="bg-primary text-primary-foreground w-full">
                Fermer
              </Button>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
}