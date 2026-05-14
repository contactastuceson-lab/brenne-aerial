import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Smartphone, QrCode, Check, X, Loader2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { base44 } from '@/api/base44Client';
import { useMutation } from '@tanstack/react-query';

export default function TwoFactorSetup({ user }) {
  const [step, setStep] = useState('idle'); // idle | setup | verify | disable_confirm
  const [totpData, setTotpData] = useState(null); // { secret, qrUrl }
  const [code, setCode] = useState('');

  const is2FAEnabled = !!user?.two_factor_enabled;

  const generateMutation = useMutation({
    mutationFn: async () => {
      const res = await base44.functions.invoke('setupTOTP', { action: 'generate' });
      return res.data;
    },
    onSuccess: (data) => {
      setTotpData(data);
      setStep('setup');
    },
    onError: () => toast.error('Erreur lors de la génération du QR code'),
  });

  const verifyMutation = useMutation({
    mutationFn: async () => {
      const res = await base44.functions.invoke('setupTOTP', {
        action: 'verify',
        secret: totpData.secret,
        code,
      });
      if (!res.data?.valid) throw new Error('Code invalide');
      return res.data;
    },
    onSuccess: () => {
      toast.success('✅ Authentificateur activé avec succès !');
      setStep('idle');
      setCode('');
      setTotpData(null);
    },
    onError: (err) => toast.error(err.message || 'Code invalide'),
  });

  const disableMutation = useMutation({
    mutationFn: async () => {
      await base44.functions.invoke('setupTOTP', { action: 'disable' });
    },
    onSuccess: () => {
      toast.success('2FA désactivée');
      setStep('idle');
    },
    onError: () => toast.error('Erreur lors de la désactivation'),
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl p-6 space-y-5"
      style={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
    >
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center border ${is2FAEnabled ? 'bg-green-500/20 border-green-500/30' : 'bg-primary/20 border-primary/30'}`}>
          <Shield className={`w-5 h-5 ${is2FAEnabled ? 'text-green-500' : 'text-primary'}`} />
        </div>
        <div>
          <h2 className="font-grotesk font-semibold text-base">Authentification par application</h2>
          <p className="font-inter text-xs text-muted-foreground">
            {is2FAEnabled
              ? '🟢 Activée — Google Authenticator / Authy connecté'
              : '🔴 Désactivée — Utilisez une app TOTP pour sécuriser votre compte'}
          </p>
        </div>
      </div>

      {/* IDLE state */}
      {step === 'idle' && (
        <div className="space-y-3">
          {is2FAEnabled ? (
            <Button
              variant="outline"
              className="w-full gap-2 border-red-500/40 text-red-400 hover:bg-red-500/10"
              onClick={() => setStep('disable_confirm')}
            >
              <X className="w-4 h-4" />
              Désactiver la 2FA
            </Button>
          ) : (
            <Button
              className="w-full gap-2"
              onClick={() => generateMutation.mutate()}
              disabled={generateMutation.isPending}
            >
              {generateMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Smartphone className="w-4 h-4" />
              )}
              Connecter une application 2FA
            </Button>
          )}
        </div>
      )}

      {/* SETUP state — show QR code */}
      {step === 'setup' && totpData && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="p-4 rounded-xl border border-primary/30 bg-primary/5 space-y-4">
            <p className="font-grotesk font-semibold text-sm">Étape 1 — Scannez ce QR code</p>
            <p className="font-inter text-xs text-muted-foreground">
              Ouvrez <strong>Google Authenticator</strong>, <strong>Authy</strong> ou toute autre app TOTP, puis scannez ce code.
            </p>
            <div className="flex justify-center">
              <div className="p-3 bg-white rounded-xl">
                <img src={totpData.qrUrl} alt="QR Code 2FA" className="w-48 h-48" />
              </div>
            </div>
            <div className="space-y-1">
              <p className="font-inter text-xs text-muted-foreground">Ou entrez manuellement la clé :</p>
              <div className="flex items-center gap-2 p-2 rounded-lg bg-secondary border border-border">
                <code className="font-mono text-xs text-primary flex-1 break-all">{totpData.secret}</code>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(totpData.secret);
                    toast.success('Clé copiée !');
                  }}
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <p className="font-grotesk font-semibold text-sm">Étape 2 — Entrez le code généré</p>
            <Input
              value={code}
              onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="000000"
              maxLength="6"
              className="bg-secondary border-border font-mono text-center text-xl tracking-[0.5em]"
            />
          </div>

          <div className="flex gap-2">
            <Button
              onClick={() => verifyMutation.mutate()}
              disabled={code.length !== 6 || verifyMutation.isPending}
              className="flex-1 gap-2"
            >
              {verifyMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              Confirmer
            </Button>
            <Button
              variant="outline"
              onClick={() => { setStep('idle'); setCode(''); setTotpData(null); }}
              className="flex-1"
            >
              Annuler
            </Button>
          </div>
        </motion.div>
      )}

      {/* DISABLE confirm */}
      {step === 'disable_confirm' && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-3 p-4 rounded-xl border border-red-500/30 bg-red-500/5"
        >
          <p className="font-inter text-sm font-medium text-red-400">⚠️ Désactiver la 2FA réduit la sécurité de votre compte.</p>
          <p className="font-inter text-xs text-muted-foreground">Êtes-vous sûr de vouloir continuer ?</p>
          <div className="flex gap-2">
            <Button
              variant="destructive"
              onClick={() => disableMutation.mutate()}
              disabled={disableMutation.isPending}
              className="flex-1"
            >
              {disableMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Désactiver'}
            </Button>
            <Button variant="outline" onClick={() => setStep('idle')} className="flex-1">
              Annuler
            </Button>
          </div>
        </motion.div>
      )}

      {/* Info box */}
      <div className="p-3 rounded-lg bg-blue-400/10 border border-blue-400/20 flex items-start gap-2">
        <QrCode className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
        <p className="font-inter text-xs text-blue-600">
          Utilisez <strong>Google Authenticator</strong>, <strong>Authy</strong>, <strong>1Password</strong> ou toute app compatible TOTP pour scanner le QR code.
        </p>
      </div>
    </motion.div>
  );
}