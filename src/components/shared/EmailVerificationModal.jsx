import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { Loader2, CheckCircle, RefreshCw, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const getApiBaseUrl = () => {
  const rawUrl = import.meta.env.VITE_API_URL?.trim() || '';
  const cleanedUrl = rawUrl.replace(/\/+$|\s+$/g, '');
  const baseUrl = cleanedUrl || (typeof window !== 'undefined' ? window.location.origin : '');
  return baseUrl.endsWith('/api') ? baseUrl : `${baseUrl}/api`;
};

export default function EmailVerificationModal({ user, onVerified }) {
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [codeSent, setCodeSent] = useState(false);
  const [error, setError] = useState('');
  const inputRefs = useRef([]);

  useEffect(() => {
    sendCode();
  }, []);

  const sendCode = async () => {
    setSending(true);
    setError('');
    setCode(['', '', '', '', '', '']);

    try {
      const response = await fetch(`${getApiBaseUrl()}/auth/send-verification-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email }),
      });
      const data = await response.json();
      setSending(false);

      if (response.ok && data.success) {
        setCodeSent(true);
        toast.success('Code envoyé à ' + user.email);
        setTimeout(() => inputRefs.current[0]?.focus(), 100);
      } else {
        setError(data.error || 'Erreur lors de l\'envoi');
      }
    } catch (error) {
      setSending(false);
      setError('Erreur de connexion au serveur');
    }
  };

  const handleDigit = (index, value) => {
    const digit = value.replace(/\D/g, '').slice(-1);
    const next = [...code];
    next[index] = digit;
    setCode(next);
    setError('');
    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
    if (next.every(d => d !== '') && digit) {
      verifyCode(next.join(''));
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 6) {
      const digits = pasted.split('');
      setCode(digits);
      verifyCode(pasted);
    }
  };

  const verifyCode = async (codeStr) => {
    setVerifying(true);
    setError('');

    try {
      const response = await fetch(`${getApiBaseUrl()}/auth/verify-email-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email, code: codeStr }),
      });
      const data = await response.json();
      setVerifying(false);

      if (response.ok && data.success) {
        toast.success('Email vérifié !');
        onVerified();
      } else {
        setError(data.error || 'Code incorrect');
        setCode(['', '', '', '', '', '']);
        setTimeout(() => inputRefs.current[0]?.focus(), 100);
      }
    } catch (error) {
      setVerifying(false);
      setError('Erreur de connexion au serveur');
    }
  };

  const fullCode = code.join('');

  return (
    <div className="fixed inset-0 z-[100] bg-background/95 backdrop-blur-md flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-md bg-card border border-border rounded-2xl shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="bg-secondary/60 border-b border-border px-8 py-6 text-center">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-3">
            <ShieldCheck className="w-7 h-7 text-primary" />
          </div>
          <h2 className="font-grotesk font-bold text-xl">Vérification de votre email</h2>
          <p className="font-inter text-sm text-muted-foreground mt-1">
            Un code à 6 chiffres a été envoyé à<br />
            <span className="text-primary font-medium">{user?.email}</span>
          </p>
        </div>

        <div className="p-8 space-y-6">
          {sending ? (
            <div className="flex flex-col items-center gap-3 py-4">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
              <p className="font-inter text-sm text-muted-foreground">Envoi du code en cours...</p>
            </div>
          ) : (
            <>
              {/* Code inputs */}
              <div className="flex justify-center gap-3" onPaste={handlePaste}>
                {code.map((digit, i) => (
                  <input
                    key={i}
                    ref={el => inputRefs.current[i] = el}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={e => handleDigit(i, e.target.value)}
                    onKeyDown={e => handleKeyDown(i, e)}
                    className={`w-12 h-14 text-center text-2xl font-grotesk font-bold rounded-xl border-2 bg-secondary outline-none transition-all
                      ${digit ? 'border-primary text-foreground' : 'border-border text-muted-foreground'}
                      ${error ? 'border-destructive' : ''}
                      focus:border-primary focus:ring-2 focus:ring-primary/20`}
                  />
                ))}
              </div>

              {/* Error */}
              {error && (
                <p className="text-center font-inter text-sm text-destructive">{error}</p>
              )}

              {/* Verify button */}
              {fullCode.length === 6 && !verifying && !error && (
                <Button
                  onClick={() => verifyCode(fullCode)}
                  className="w-full bg-primary text-primary-foreground gap-2"
                >
                  <CheckCircle className="w-4 h-4" /> Vérifier le code
                </Button>
              )}

              {verifying && (
                <div className="flex items-center justify-center gap-2 py-2">
                  <Loader2 className="w-4 h-4 text-primary animate-spin" />
                  <span className="font-inter text-sm text-muted-foreground">Vérification...</span>
                </div>
              )}

              {/* Resend */}
              <div className="text-center">
                <button
                  onClick={sendCode}
                  disabled={sending}
                  className="font-inter text-xs text-muted-foreground hover:text-primary flex items-center gap-1.5 mx-auto transition-colors"
                >
                  <RefreshCw className="w-3 h-3" /> Renvoyer le code
                </button>
              </div>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}