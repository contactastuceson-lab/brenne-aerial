import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Mail, Smartphone, Key, Copy, Check, AlertTriangle, Trash2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export default function TwoFactorSetup({ user }) {
  const [activeMethod, setActiveMethod] = useState(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [showBackupCodes, setShowBackupCodes] = useState(false);
  const [backupCodes, setBackupCodes] = useState([]);
  const [copiedCode, setCopiedCode] = useState(null);
  const queryClient = useQueryClient();

  // Fetch user's 2FA settings
  const { data: twoFactorMethods = [] } = useQuery({
    queryKey: ['2fa-methods', user?.email],
    queryFn: () => base44.entities.TwoFactorAuth.filter({ user_email: user.email }),
    enabled: !!user?.email,
  });

  // Setup 2FA with Email
  const setupEmailMutation = useMutation({
    mutationFn: async () => {
      const res = await base44.functions.invoke('setup2FAEmail', {
        user_email: user.email,
      });
      return res.data;
    },
    onSuccess: (data) => {
      toast.success('Code envoyé à votre email');
      setActiveMethod('email');
    },
    onError: () => toast.error('Erreur lors de l\'envoi du code'),
  });

  // Setup 2FA with SMS
  const setupSmsMutation = useMutation({
    mutationFn: async () => {
      const res = await base44.functions.invoke('setup2FASMS', {
        user_email: user.email,
        phone_number: phoneNumber,
      });
      return res.data;
    },
    onSuccess: () => {
      toast.success('Code SMS envoyé');
      setActiveMethod('sms');
    },
    onError: () => toast.error('Erreur lors de l\'envoi du SMS'),
  });

  // Setup TOTP (Authenticator app)
  const setupTotpMutation = useMutation({
    mutationFn: async () => {
      const res = await base44.functions.invoke('setup2FATOMTP', {
        user_email: user.email,
      });
      return res.data;
    },
    onSuccess: (data) => {
      toast.success('Scannez le QR code avec votre app');
      setActiveMethod('totp');
    },
    onError: () => toast.error('Erreur lors de la génération du code TOTP'),
  });

  // Verify code
  const verifyCodeMutation = useMutation({
    mutationFn: async () => {
      const res = await base44.functions.invoke('verify2FA', {
        user_email: user.email,
        method: activeMethod,
        code: verificationCode,
      });
      return res.data;
    },
    onSuccess: (data) => {
      if (data.backup_codes) {
        setBackupCodes(data.backup_codes);
        setShowBackupCodes(true);
      }
      queryClient.invalidateQueries({ queryKey: ['2fa-methods'] });
      toast.success('2FA activée avec succès!');
      setActiveMethod(null);
      setVerificationCode('');
    },
    onError: () => toast.error('Code invalide'),
  });

  // Disable 2FA method
  const disableMutation = useMutation({
    mutationFn: async (methodId) => {
      await base44.entities.TwoFactorAuth.delete(methodId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['2fa-methods'] });
      toast.success('Méthode désactivée');
    },
  });

  const copyBackupCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const methodIcons = {
    email: Mail,
    sms: Smartphone,
    totp: Key,
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl p-6 space-y-5"
      style={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center">
          <Shield className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h2 className="font-grotesk font-semibold text-base">Authentification 2FA</h2>
          <p className="font-inter text-xs text-muted-foreground">Sécurisez votre compte</p>
        </div>
      </div>

      {/* Active 2FA Methods */}
      {twoFactorMethods.length > 0 && (
        <div className="space-y-3 mb-6 pb-6 border-b border-border">
          <p className="font-inter text-xs text-muted-foreground uppercase tracking-wide">Méthodes actives</p>
          <div className="space-y-2">
            {twoFactorMethods.filter(m => m.is_enabled).map(method => {
              const Icon = methodIcons[method.method];
              return (
                <motion.div
                  key={method.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center justify-between p-3 rounded-lg bg-accent/10 border border-accent/20"
                >
                  <div className="flex items-center gap-3">
                    {Icon && <Icon className="w-4 h-4 text-accent" />}
                    <div>
                      <p className="font-inter text-sm font-medium">
                        {method.method === 'email' && 'Email'}
                        {method.method === 'sms' && 'SMS'}
                        {method.method === 'totp' && 'Authenticator App'}
                      </p>
                      {method.phone_number && (
                        <p className="font-mono text-[10px] text-muted-foreground">{method.phone_number}</p>
                      )}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => disableMutation.mutate(method.id)}
                    disabled={disableMutation.isPending}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* Setup New Method */}
      <div className="space-y-3">
        <p className="font-inter text-xs text-muted-foreground uppercase tracking-wide">Ajouter une méthode</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {/* Email 2FA */}
          <button
            onClick={() => setupEmailMutation.mutate()}
            disabled={setupEmailMutation.isPending || activeMethod === 'email'}
            className="p-4 rounded-xl border border-border hover:border-primary/50 bg-secondary/30 hover:bg-secondary/50 transition-all text-center disabled:opacity-50"
          >
            <Mail className="w-5 h-5 text-primary mx-auto mb-2" />
            <p className="font-inter text-xs font-medium">Email</p>
            <p className="font-inter text-[10px] text-muted-foreground">Rapide</p>
          </button>

          {/* SMS 2FA */}
          <button
            onClick={() => {
              if (!phoneNumber) {
                toast.error('Entrez un numéro de téléphone');
                return;
              }
              setupSmsMutation.mutate();
            }}
            disabled={setupSmsMutation.isPending || activeMethod === 'sms'}
            className="p-4 rounded-xl border border-border hover:border-primary/50 bg-secondary/30 hover:bg-secondary/50 transition-all text-center disabled:opacity-50"
          >
            <Smartphone className="w-5 h-5 text-primary mx-auto mb-2" />
            <p className="font-inter text-xs font-medium">SMS</p>
            <p className="font-inter text-[10px] text-muted-foreground">Sécurisé</p>
          </button>

          {/* TOTP 2FA */}
          <button
            onClick={() => setupTotpMutation.mutate()}
            disabled={setupTotpMutation.isPending || activeMethod === 'totp'}
            className="p-4 rounded-xl border border-border hover:border-primary/50 bg-secondary/30 hover:bg-secondary/50 transition-all text-center disabled:opacity-50"
          >
            <Key className="w-5 h-5 text-primary mx-auto mb-2" />
            <p className="font-inter text-xs font-medium">Authenticator</p>
            <p className="font-inter text-[10px] text-muted-foreground">Meilleur</p>
          </button>
        </div>
      </div>

      {/* Phone Input for SMS */}
      {activeMethod === null && (
        <div>
          <label className="font-inter text-xs text-muted-foreground mb-1.5 block">Numéro de téléphone (pour SMS)</label>
          <Input
            value={phoneNumber}
            onChange={e => setPhoneNumber(e.target.value)}
            placeholder="+33 6 00 00 00 00"
            className="bg-secondary border-border font-inter"
          />
        </div>
      )}

      {/* Verification Code Input */}
      <AnimatePresence>
        {activeMethod && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 rounded-xl border border-accent/30 bg-accent/10 space-y-3"
          >
            <p className="font-inter text-sm font-medium">
              {activeMethod === 'email' && '📧 Code envoyé à votre email'}
              {activeMethod === 'sms' && '📱 Code envoyé par SMS'}
              {activeMethod === 'totp' && '🔐 Scannez le QR code avec un authenticator (Google Authenticator, Authy, etc.)'}
            </p>
            {activeMethod !== 'totp' && (
              <div className="space-y-2">
                <Input
                  value={verificationCode}
                  onChange={e => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="000000"
                  maxLength="6"
                  className="bg-secondary border-border font-mono text-center text-lg tracking-widest"
                />
                <Button
                  onClick={() => verifyCodeMutation.mutate()}
                  disabled={verificationCode.length !== 6 || verifyCodeMutation.isPending}
                  className="w-full"
                >
                  {verifyCodeMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    'Vérifier'
                  )}
                </Button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Backup Codes */}
      <AnimatePresence>
        {showBackupCodes && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 rounded-xl border border-yellow-400/30 bg-yellow-400/10 space-y-3"
          >
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-inter text-sm font-medium text-yellow-600">Codes de secours</p>
                <p className="font-inter text-xs text-yellow-600/70">Conservez-les dans un endroit sûr</p>
              </div>
            </div>
            <div className="space-y-1">
              {backupCodes.map((code, i) => (
                <button
                  key={i}
                  onClick={() => copyBackupCode(code)}
                  className="w-full flex items-center justify-between p-2 rounded-lg bg-background/50 hover:bg-background transition-colors font-mono text-sm text-muted-foreground hover:text-foreground"
                >
                  <span>{code}</span>
                  {copiedCode === code ? (
                    <Check className="w-4 h-4 text-green-400" />
                  ) : (
                    <Copy className="w-4 h-4 opacity-50" />
                  )}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Info */}
      <div className="p-3 rounded-lg bg-blue-400/10 border border-blue-400/20">
        <p className="font-inter text-xs text-blue-600">
          💡 L'authentification 2FA est requise pour les comptes administrateurs.
        </p>
      </div>
    </motion.div>
  );
}
