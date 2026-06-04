import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Input } from '@/components/ui/input';
import { Eye, EyeOff, Loader2, Mail, Lock, KeyRound, ArrowRight, CheckCircle2, Rocket, Star, Award } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const SOCIAL_PROVIDERS = [
  {
    key: 'google',
    label: 'Google',
    icon: (
      <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
      </svg>
    ),
  },
  {
    key: 'facebook',
    label: 'Facebook',
    icon: (
      <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="#1877F2">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
      </svg>
    ),
  },
  {
    key: 'microsoft',
    label: 'Microsoft',
    icon: (
      <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
        <rect x="1" y="1" width="10.5" height="10.5" fill="#F25022"/>
        <rect x="12.5" y="1" width="10.5" height="10.5" fill="#7FBA00"/>
        <rect x="1" y="12.5" width="10.5" height="10.5" fill="#00A4EF"/>
        <rect x="12.5" y="12.5" width="10.5" height="10.5" fill="#FFB900"/>
      </svg>
    ),
  },
];

const PERKS = [
  { icon: Rocket, title: 'Démarrez en 2 minutes', desc: 'Compte créé, profil en ligne, missions actives.' },
  { icon: Star, title: 'Accès à la communauté', desc: 'Forum, messagerie et réseau de 1 200 pilotes.' },
  { icon: Award, title: 'Certification reconnue', desc: 'Valorisez vos compétences avec un badge officiel.' },
];

export default function Register() {
  const [step, setStep] = useState('form'); // 'form' | 'otp'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState(null);
  const [error, setError] = useState('');
  const [resending, setResending] = useState(false);

  const pwStrength = password.length === 0 ? 0 : password.length < 6 ? 1 : password.length < 10 ? 2 : 3;
  const pwColors = ['bg-border', 'bg-destructive', 'bg-yellow-400', 'bg-green-400'];
  const pwLabels = ['', 'Faible', 'Moyen', 'Fort'];

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    if (!email || !password || !confirmPassword) { setError('Veuillez remplir tous les champs.'); return; }
    if (password !== confirmPassword) { setError('Les mots de passe ne correspondent pas.'); return; }
    if (password.length < 6) { setError('Le mot de passe doit contenir au moins 6 caractères.'); return; }
    setLoading(true);
    try {
      await base44.auth.register({ email, password });
      setStep('otp');
    } catch (err) {
      setError(err?.message || 'Une erreur est survenue. Cet email est peut-être déjà utilisé.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');
    if (!otpCode) { setError('Veuillez entrer le code reçu par email.'); return; }
    setLoading(true);
    try {
      const res = await base44.auth.verifyOtp({ email, otpCode });
      base44.auth.setToken(res.access_token);
      window.location.href = '/';
    } catch {
      setError('Code incorrect ou expiré. Vérifiez votre boîte email et réessayez.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setResending(true);
    try { await base44.auth.resendOtp(email); } finally { setResending(false); }
  };

  const handleSocial = async (provider) => {
    setSocialLoading(provider);
    try { await base44.auth.loginWithProvider(provider, '/'); } catch { setSocialLoading(null); }
  };

  return (
    <div className="min-h-screen flex">
      {/* ── Left panel — branding ── */}
      <div className="hidden lg:flex lg:w-[52%] relative flex-col justify-between p-12 overflow-hidden"
        style={{ background: 'linear-gradient(145deg, hsl(214 50% 4%) 0%, hsl(214 45% 7%) 40%, hsl(205 50% 10%) 100%)' }}>

        <div className="absolute inset-0 grid-bg opacity-30 pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-primary/8 blur-[100px] pointer-events-none" />
        <div className="absolute top-0 right-0 w-[250px] h-[250px] rounded-full bg-accent/5 blur-[80px] pointer-events-none" />

        {/* Logo */}
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-center">
              <svg viewBox="0 0 32 32" className="w-5 h-5" fill="none">
                <circle cx="16" cy="16" r="4" fill="hsl(205 90% 58%)" />
                <line x1="16" y1="12" x2="16" y2="4" stroke="hsl(205 90% 58%)" strokeWidth="1.5" strokeLinecap="round" />
                <line x1="16" y1="20" x2="16" y2="28" stroke="hsl(205 90% 58%)" strokeWidth="1.5" strokeLinecap="round" />
                <line x1="12" y1="16" x2="4" y2="16" stroke="hsl(205 90% 58%)" strokeWidth="1.5" strokeLinecap="round" />
                <line x1="20" y1="16" x2="28" y2="16" stroke="hsl(205 90% 58%)" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>
            <span className="font-grotesk font-bold text-lg text-foreground tracking-tight">Brenne Aerial</span>
          </div>
          <span className="font-mono text-[10px] text-primary/60 tracking-widest uppercase">Inscription gratuite</span>
        </div>

        {/* Hero */}
        <div className="relative z-10 max-w-sm">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <h1 className="font-grotesk font-black text-4xl xl:text-5xl text-foreground leading-[1.1] mb-4">
              Décollez<br />
              <span className="gradient-text">dès aujourd'hui.</span>
            </h1>
            <p className="font-inter text-base text-muted-foreground leading-relaxed mb-8">
              Rejoignez la plus grande communauté de pilotes de drone professionnels en France. Gratuit, sans engagement.
            </p>
          </motion.div>

          {/* Perks */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }} className="space-y-4 mb-10">
            {PERKS.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-start gap-3.5">
                <div className="w-8 h-8 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Icon className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="font-inter text-sm font-semibold text-foreground">{title}</p>
                  <p className="font-inter text-xs text-muted-foreground mt-0.5">{desc}</p>
                </div>
              </div>
            ))}
          </motion.div>

          {/* Trust indicators */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
            className="flex flex-wrap gap-2">
            {['✓ Compte gratuit', '✓ Sans CB', '✓ Données sécurisées', '✓ Résiliable à tout moment'].map(t => (
              <span key={t} className="font-mono text-[10px] text-primary/70 bg-primary/5 border border-primary/15 px-2.5 py-1 rounded-full">{t}</span>
            ))}
          </motion.div>
        </div>

        {/* Stats */}
        <div className="relative z-10 grid grid-cols-3 gap-4">
          {[['1 200+', 'Pilotes actifs'], ['4.9★', 'Note moyenne'], ['0 €', 'Pour démarrer']].map(([val, label]) => (
            <div key={label} className="text-center">
              <p className="font-grotesk font-bold text-xl text-primary">{val}</p>
              <p className="font-inter text-xs text-muted-foreground mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right panel — form ── */}
      <div className="flex-1 flex flex-col justify-center px-6 sm:px-10 lg:px-16 py-12 bg-background relative overflow-auto">
        <div className="absolute inset-0 grid-bg opacity-10 pointer-events-none" />

        {/* Mobile logo */}
        <div className="lg:hidden flex items-center gap-2 mb-8">
          <div className="w-8 h-8 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
            <svg viewBox="0 0 32 32" className="w-4 h-4" fill="none">
              <circle cx="16" cy="16" r="4" fill="hsl(205 90% 58%)" />
              <line x1="16" y1="12" x2="16" y2="4" stroke="hsl(205 90% 58%)" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="16" y1="20" x2="16" y2="28" stroke="hsl(205 90% 58%)" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="12" y1="16" x2="4" y2="16" stroke="hsl(205 90% 58%)" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="20" y1="16" x2="28" y2="16" stroke="hsl(205 90% 58%)" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
          <span className="font-grotesk font-bold text-foreground">Brenne Aerial</span>
        </div>

        <div className="relative z-10 w-full max-w-md mx-auto">
          <AnimatePresence mode="wait">
            {step === 'form' ? (
              <motion.div key="form" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                {/* Header */}
                <div className="mb-8">
                  <h2 className="font-grotesk font-bold text-3xl text-foreground mb-2">Créer un compte 🚀</h2>
                  <p className="font-inter text-sm text-muted-foreground">
                    Rejoignez Brenne Aerial gratuitement et sans engagement.
                  </p>
                </div>

                {/* Social providers */}
                <div className="grid grid-cols-3 gap-2.5 mb-6">
                  {SOCIAL_PROVIDERS.map(({ key, label, icon }) => (
                    <button
                      key={key}
                      onClick={() => handleSocial(key)}
                      disabled={!!socialLoading || loading}
                      aria-label={`Continuer avec ${label}`}
                      className="flex items-center justify-center gap-2 h-11 rounded-xl border border-border bg-secondary/50 hover:bg-secondary transition-colors duration-150 font-inter text-xs font-medium text-foreground disabled:opacity-50 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      {socialLoading === key ? <Loader2 className="w-4 h-4 animate-spin" /> : icon}
                      <span className="hidden sm:inline">{label}</span>
                    </button>
                  ))}
                </div>

                {/* Divider */}
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex-1 h-px bg-border" />
                  <span className="font-inter text-xs text-muted-foreground px-1">ou avec email</span>
                  <div className="flex-1 h-px bg-border" />
                </div>

                {/* Form */}
                <form onSubmit={handleRegister} className="space-y-4" noValidate>
                  <div>
                    <label htmlFor="reg-email" className="block font-inter text-xs font-medium text-foreground mb-1.5">
                      Adresse email
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                      <Input id="reg-email" type="email" placeholder="vous@exemple.com" value={email}
                        onChange={e => setEmail(e.target.value)} className="pl-9 h-11" autoComplete="email" />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="reg-password" className="block font-inter text-xs font-medium text-foreground mb-1.5">
                      Mot de passe
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                      <Input id="reg-password" type={showPassword ? 'text' : 'password'}
                        placeholder="Minimum 6 caractères" value={password}
                        onChange={e => setPassword(e.target.value)} className="pl-9 pr-10 h-11" autoComplete="new-password" />
                      <button type="button" onClick={() => setShowPassword(v => !v)}
                        aria-label={showPassword ? 'Masquer' : 'Afficher'}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded">
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {/* Password strength */}
                    {password.length > 0 && (
                      <div className="mt-2">
                        <div className="flex gap-1 mb-1">
                          {[1, 2, 3].map(i => (
                            <div key={i} className={`h-1 flex-1 rounded-full transition-colors duration-300 ${i <= pwStrength ? pwColors[pwStrength] : 'bg-border'}`} />
                          ))}
                        </div>
                        <p className="font-mono text-[10px] text-muted-foreground">Sécurité : {pwLabels[pwStrength]}</p>
                      </div>
                    )}
                  </div>

                  <div>
                    <label htmlFor="reg-confirm" className="block font-inter text-xs font-medium text-foreground mb-1.5">
                      Confirmer le mot de passe
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                      <Input id="reg-confirm" type={showConfirm ? 'text' : 'password'}
                        placeholder="••••••••" value={confirmPassword}
                        onChange={e => setConfirmPassword(e.target.value)} className="pl-9 pr-10 h-11" autoComplete="new-password" />
                      <button type="button" onClick={() => setShowConfirm(v => !v)}
                        aria-label={showConfirm ? 'Masquer' : 'Afficher'}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded">
                        {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {confirmPassword && password && (
                      <p className={`font-mono text-[10px] mt-1.5 flex items-center gap-1 ${confirmPassword === password ? 'text-green-400' : 'text-destructive'}`}>
                        <CheckCircle2 className="w-3 h-3" />
                        {confirmPassword === password ? 'Les mots de passe correspondent' : 'Ne correspondent pas'}
                      </p>
                    )}
                  </div>

                  {error && (
                    <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                      className="font-inter text-xs text-destructive bg-destructive/10 border border-destructive/20 rounded-xl px-3 py-2.5">
                      {error}
                    </motion.p>
                  )}

                  <button type="submit" disabled={loading || !!socialLoading}
                    className="w-full h-11 rounded-xl bg-primary text-primary-foreground font-inter text-sm font-semibold hover:bg-primary/90 transition-colors duration-150 disabled:opacity-60 cursor-pointer flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Créer mon compte <ArrowRight className="w-4 h-4" /></>}
                  </button>
                </form>

                {/* Footer */}
                <div className="mt-8 pt-6 border-t border-border">
                  <p className="text-center font-inter text-sm text-muted-foreground">
                    Déjà un compte ?{' '}
                    <Link to="/login" className="text-primary hover:underline font-medium">Se connecter</Link>
                  </p>
                  <p className="text-center font-inter text-xs text-muted-foreground mt-4">
                    En créant un compte, vous acceptez nos{' '}
                    <Link to="/legal/terms" className="text-primary hover:underline">CGU</Link> et notre{' '}
                    <Link to="/legal/privacy" className="text-primary hover:underline">Politique de confidentialité</Link>.
                  </p>
                </div>
              </motion.div>
            ) : (
              <motion.div key="otp" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                {/* OTP step */}
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 mb-5">
                    <KeyRound className="w-7 h-7 text-primary" />
                  </div>
                  <h2 className="font-grotesk font-bold text-3xl text-foreground mb-2">Vérification email</h2>
                  <p className="font-inter text-sm text-muted-foreground">
                    Nous avons envoyé un code à 6 chiffres à<br />
                    <span className="font-medium text-foreground">{email}</span>
                  </p>
                </div>

                <form onSubmit={handleVerifyOtp} className="space-y-4" noValidate>
                  <div>
                    <label htmlFor="otp-input" className="block font-inter text-xs font-medium text-foreground mb-1.5 text-center">
                      Code de vérification
                    </label>
                    <Input
                      id="otp-input"
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      placeholder="000000"
                      value={otpCode}
                      onChange={e => setOtpCode(e.target.value.replace(/\D/g, ''))}
                      className="text-center tracking-[0.6em] text-xl font-mono h-14 rounded-xl"
                      autoFocus
                    />
                  </div>

                  {error && (
                    <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                      className="font-inter text-xs text-destructive bg-destructive/10 border border-destructive/20 rounded-xl px-3 py-2.5">
                      {error}
                    </motion.p>
                  )}

                  <button type="submit" disabled={loading || otpCode.length !== 6}
                    className="w-full h-11 rounded-xl bg-primary text-primary-foreground font-inter text-sm font-semibold hover:bg-primary/90 transition-colors duration-150 disabled:opacity-60 cursor-pointer flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Vérifier et accéder <ArrowRight className="w-4 h-4" /></>}
                  </button>
                </form>

                <div className="mt-6 text-center space-y-3">
                  <p className="font-inter text-sm text-muted-foreground">Vous n'avez pas reçu le code ?</p>
                  <button type="button" onClick={handleResendOtp} disabled={resending}
                    className="font-inter text-sm text-primary hover:underline disabled:opacity-50 cursor-pointer focus-visible:outline-none focus-visible:underline">
                    {resending ? 'Envoi en cours…' : 'Renvoyer le code'}
                  </button>
                  <div className="pt-2">
                    <button type="button" onClick={() => { setStep('form'); setError(''); setOtpCode(''); }}
                      className="font-inter text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                      ← Modifier mon adresse email
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}