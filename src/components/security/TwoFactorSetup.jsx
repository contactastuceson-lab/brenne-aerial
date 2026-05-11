import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Mail, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { base44 } from '@/api/base44Client';
import { useMutation } from '@tanstack/react-query';

export default function TwoFactorSetup({ user }) {
  const [step, setStep] = useState('idle'); // idle | sending | verify
  const [code, setCode] = useState('');
  const [sentCode, setSentCode] = useState(null);

  const is2FAEnabled = !!user?.two_factor_enabled;

  const sendCodeMutation = useMutation({
    mutationFn: async () => {
      const res = await base44.functions.invoke('sendVerificationCode', {
        user_email: user.email,
        purpose: '2fa_setup',
      });
      return res.data;
    },
    onSuccess: (data) => {
      setSentCode(data?.code || null);
      setStep('verify');
      toast.success('Code envoyé à votre email');
    },
    onError: () => toast.error('Erreur lors de l\'envoi du code'),
  });

  const verifyMutation = useMutation({
    mutationFn: async () => {
      const res = await base44.functions.invoke('verifyEmailCode', {
        user_email: user.email,
        code,
        purpose: '2fa_setup',
      });
      if (!res.data?.valid) throw new Error('Code invalide');
      await base44.auth.updateMe({ two_factor_enabled: !is2FAEnabled });
    },
    onSuccess: () => {
      toast.success(is2FAEnabled ? '2FA désactivée' : '2FA activée avec succès !');
      setStep('idle');
      setCode('');
    },
    onError: (err) => toast.error(err.message || 'Code invalide'),
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl p-6 space-y-5"
      style={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center">
          <Shield className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h2 className="font-grotesk font-semibold text-base">Authentification 2FA</h2>
          <p className="font-inter text-xs text-muted-foreground">
            {is2FAEnabled ? '🟢 Activée — votre compte est sécurisé' : '🔴 Désactivée'}
          </p>
        </div>
      </div>

      {step === 'idle' && (
        <Button
          onClick={() => sendCodeMutation.mutate()}
          disabled={sendCodeMutation.isPending}
          variant={is2FAEnabled ? 'outline' : 'default'}
          className="w-full gap-2"
        >
          <Mail className="w-4 h-4" />
          {is2FAEnabled ? 'Désactiver la 2FA (confirmation par email)' : 'Activer la 2FA par email'}
        </Button>
      )}

      {step === 'verify' && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-3 p-4 rounded-xl border border-primary/30 bg-primary/5"
        >
          <p className="font-inter text-sm font-medium">📧 Un code a été envoyé à <strong>{user.email}</strong></p>
          <Input
            value={code}
            onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
            placeholder="000000"
            maxLength="6"
            className="bg-secondary border-border font-mono text-center text-lg tracking-widest"
          />
          <div className="flex gap-2">
            <Button
              onClick={() => verifyMutation.mutate()}
              disabled={code.length !== 6 || verifyMutation.isPending}
              className="flex-1"
            >
              Confirmer
            </Button>
            <Button variant="outline" onClick={() => { setStep('idle'); setCode(''); }} className="flex-1">
              Annuler
            </Button>
          </div>
        </motion.div>
      )}

      <div className="p-3 rounded-lg bg-blue-400/10 border border-blue-400/20">
        <p className="font-inter text-xs text-blue-600">
          💡 L'authentification à deux facteurs ajoute une couche de sécurité supplémentaire à votre compte.
        </p>
      </div>
    </motion.div>
  );
}