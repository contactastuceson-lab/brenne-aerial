import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Smartphone, Mail, Loader2, Check, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

const FINGERPRINT_KEY = 'ba_device_fingerprint';

function getOrCreateFingerprint() {
  let fp = localStorage.getItem(FINGERPRINT_KEY);
  if (!fp) {
    fp = crypto.randomUUID();
    localStorage.setItem(FINGERPRINT_KEY, fp);
  }
  return fp;
}

function getDeviceName() {
  const ua = navigator.userAgent;
  let browser = 'Unknown';
  if (ua.includes('Edg/')) browser = 'Edge';
  else if (ua.includes('Chrome/')) browser = 'Chrome';
  else if (ua.includes('Firefox/')) browser = 'Firefox';
  else if (ua.includes('Safari/') && !ua.includes('Chrome/')) browser = 'Safari';
  let os = 'Unknown';
  if (ua.includes('Windows')) os = 'Windows';
  else if (ua.includes('Android')) os = 'Android';
  else if (ua.includes('iPhone') || ua.includes('iPad')) os = 'iOS';
  else if (ua.includes('Macintosh') || ua.includes('Mac OS X')) os = 'macOS';
  else if (ua.includes('Linux')) os = 'Linux';
  return `${os} ${browser}`;
}

export default function LoginVerificationModal({ onVerified }) {
  const [method, setMethod] = useState(null); // 'totp' | 'email'
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [sending, setSending] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const fingerprint = getOrCreateFingerprint();
  const deviceName = getDeviceName();

  useEffect(() => {
    checkIfNeeded();
  }, []);

  const checkIfNeeded = async () => {
    setLoading(true);
    try {
      const res = await base44.functions.invoke('verifyLoginCode', {
        action: 'check_needed',
        fingerprint,
      });
      if (!res.data.needed) {
        // Device already trusted
        onVerified();
        return;
      }
      setMethod(res.data.method);
      // Auto-send email code if method is email
      if (res.data.method === 'email') {
        await sendEmailCode();
      }
    } catch {
      // If check fails, let user through (non-blocking)
      onVerified();
    } finally {
      setLoading(false);
    }
  };

  const sendEmailCode = async () => {
    setSending(true);
    try {
      await base44.functions.invoke('verifyLoginCode', { action: 'send_email_code', fingerprint });
      setEmailSent(true);
    } catch {
      toast.error('Erreur lors de l\'envoi du code');
    } finally {
      setSending(false);
    }
  };

  const handleVerify = async () => {
    if (code.length !== 6) return;
    setVerifying(true);
    try {
      const action = method === 'totp' ? 'verify_totp' : 'verify_email_code';
      const res = await base44.functions.invoke('verifyLoginCode', {
        action,
        code,
        fingerprint,
        device_name: deviceName,
      });
      if (res.data?.valid) {
        toast.success('✅ Identité vérifiée');
        onVerified();
      } else {
        toast.error('Code invalide');
      }
    } catch (err) {
      const msg = err?.response?.data?.error || 'Code invalide';
      if (msg.includes('expiré') || msg.includes('expired')) {
        toast.error('Code expiré — un nouveau code a été envoyé');
        setEmailSent(false);
        await sendEmailCode();
      } else {
        toast.error(msg);
      }
    } finally {
      setVerifying(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-background/95 backdrop-blur-sm">
        <div className="w-8 h-8 border-2 border-muted border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-background/95 backdrop-blur-sm px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-sm rounded-2xl p-8 space-y-6"
        style={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
      >
        {/* Icon */}
        <div className="flex flex-col items-center gap-3">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border ${method === 'totp' ? 'bg-primary/20 border-primary/30' : 'bg-blue-500/20 border-blue-500/30'}`}>
            {method === 'totp' ? (
              <Smartphone className="w-7 h-7 text-primary" />
            ) : (
              <Mail className="w-7 h-7 text-blue-400" />
            )}
          </div>
          <div className="text-center">
            <h2 className="font-grotesk font-bold text-lg">Vérification requise</h2>
            <p className="font-inter text-sm text-muted-foreground mt-1">
              {method === 'totp'
                ? 'Entrez le code depuis votre application d\'authentification'
                : 'Un code a été envoyé à votre adresse e-mail'}
            </p>
          </div>
        </div>

        {/* Device info */}
        <div className="flex items-center gap-2 p-3 rounded-lg bg-secondary/50 border border-border/50">
          <Shield className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          <p className="font-inter text-xs text-muted-foreground">
            Nouvel appareil détecté : <span className="text-foreground font-medium">{deviceName}</span>
          </p>
        </div>

        {/* Code input */}
        <div className="space-y-3">
          <Input
            value={code}
            onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
            placeholder="000000"
            maxLength="6"
            className="bg-secondary border-border font-mono text-center text-2xl tracking-[0.6em] h-14"
            autoFocus
            onKeyDown={e => e.key === 'Enter' && handleVerify()}
          />

          <Button
            onClick={handleVerify}
            disabled={code.length !== 6 || verifying}
            className="w-full gap-2"
          >
            {verifying ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            Confirmer
          </Button>

          {method === 'email' && (
            <Button
              variant="ghost"
              size="sm"
              className="w-full gap-2 text-muted-foreground"
              onClick={() => { setEmailSent(false); setCode(''); sendEmailCode(); }}
              disabled={sending}
            >
              {sending ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
              Renvoyer le code
            </Button>
          )}
        </div>

        <p className="font-inter text-xs text-muted-foreground text-center">
          {method === 'totp'
            ? 'Utilisez Google Authenticator, Authy ou toute app TOTP compatible'
            : 'Vérifiez votre boîte de réception (et vos spams)'}
        </p>
      </motion.div>
    </div>
  );
}