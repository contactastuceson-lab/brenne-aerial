import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wifi, Lock, Mail, Eye, EyeOff, ArrowRight, CheckCircle2, Globe, ShieldCheck } from 'lucide-react';

export default function WifiPortalPage() {
  const [step, setStep] = useState('login'); // login | loading | success
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    if (!email.trim() || !password.trim()) {
      setError('Veuillez remplir tous les champs.');
      return;
    }
    setStep('loading');
    // Simulated Eza account validation + Wi-Fi activation
    setTimeout(() => {
      setStep('success');
    }, 1800);
  };

  return (
    <div className="min-h-[100dvh] flex flex-col bg-background text-foreground">
      {/* Background ambient glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[120%] h-[40vh] bg-primary/15 blur-[80px] rounded-b-full" />
        <div className="absolute bottom-0 right-0 w-[60%] h-[30vh] bg-accent/10 blur-[80px] rounded-t-full" />
        <div className="absolute inset-0 grid-bg opacity-40" />
      </div>

      {/* Header */}
      <header className="relative z-10 flex flex-col items-center pt-10 pb-4 px-6">
        <div className="flex items-center gap-2.5 mb-2">
          <div className="w-10 h-10 rounded-xl bg-primary/20 border border-primary/40 flex items-center justify-center sky-glow">
            <Wifi className="w-5 h-5 text-primary" />
          </div>
          <span className="font-grotesk font-bold text-2xl tracking-tight gradient-text">EZA</span>
        </div>
        <p className="font-inter text-sm text-muted-foreground">Connexion au réseau Wi-Fi</p>
      </header>

      {/* Main content */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 pb-10">
        <div className="w-full max-w-sm">
          <AnimatePresence mode="wait">
            {step === 'login' && (
              <motion.div
                key="login"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
              >
                {/* Hero */}
                <div className="text-center mb-8">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/30 mb-4">
                    <ShieldCheck className="w-3.5 h-3.5 text-primary" />
                    <span className="font-mono text-[10px] uppercase tracking-wider text-primary">Réseau sécurisé</span>
                  </div>
                  <h1 className="font-grotesk font-bold text-2xl leading-tight mb-2">
                    Connectez-vous à votre compte Eza
                  </h1>
                  <p className="font-inter text-sm text-muted-foreground leading-relaxed">
                    pour activer votre accès Internet.
                  </p>
                </div>

                {/* Form card */}
                <div className="glass-card rounded-3xl p-6 sky-glow">
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Email field */}
                    <div>
                      <label className="block font-inter text-xs font-medium text-muted-foreground mb-1.5 ml-1">
                        Identifiant / E-mail Eza
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60" />
                        <input
                          type="text"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          autoComplete="username"
                          placeholder="vous@eza.group"
                          className="w-full pl-10 pr-4 h-12 rounded-xl bg-secondary/60 border border-border text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all"
                        />
                      </div>
                    </div>

                    {/* Password field */}
                    <div>
                      <label className="block font-inter text-xs font-medium text-muted-foreground mb-1.5 ml-1">
                        Mot de passe / Code Eza
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          autoComplete="current-password"
                          placeholder="••••••••"
                          className="w-full pl-10 pr-10 h-12 rounded-xl bg-secondary/60 border border-border text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(v => !v)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/60 hover:text-foreground transition-colors"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Remember me */}
                    <label className="flex items-center gap-2.5 cursor-pointer ml-1 select-none">
                      <div className="relative">
                        <input
                          type="checkbox"
                          checked={remember}
                          onChange={(e) => setRemember(e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-5 h-5 rounded-md border-2 border-border peer-checked:bg-primary peer-checked:border-primary transition-all flex items-center justify-center">
                          {remember && <CheckCircle2 className="w-3 h-3 text-primary-foreground" />}
                        </div>
                      </div>
                      <span className="font-inter text-xs text-muted-foreground">Se souvenir de moi</span>
                    </label>

                    {/* Error */}
                    {error && (
                      <p className="text-xs text-destructive font-inter text-center -mb-1">{error}</p>
                    )}

                    {/* Submit button */}
                    <button
                      type="submit"
                      className="w-full h-14 rounded-xl bg-primary text-primary-foreground font-grotesk font-bold text-sm uppercase tracking-wide flex items-center justify-center gap-2 hover:brightness-110 active:scale-[0.97] transition-all sky-glow"
                    >
                      SE CONNECTER AVEC EZA
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </form>

                  {/* Alternative */}
                  <div className="mt-5 pt-5 border-t border-border/50 text-center">
                    <p className="font-inter text-xs text-muted-foreground">
                      Pas encore de compte Eza ?{' '}
                      <span className="text-primary font-medium hover:underline cursor-pointer">
                        Créer un compte
                      </span>
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 'loading' && (
              <motion.div
                key="loading"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className="flex flex-col items-center justify-center py-20"
              >
                <div className="relative w-20 h-20 mb-6">
                  <div className="absolute inset-0 rounded-full border-2 border-primary/20" />
                  <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-primary animate-spin" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Wifi className="w-8 h-8 text-primary animate-pulse" />
                  </div>
                </div>
                <p className="font-inter text-sm text-muted-foreground">Vérification de votre compte Eza…</p>
              </motion.div>
            )}

            {step === 'success' && (
              <motion.div
                key="success"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
                className="glass-card rounded-3xl p-8 text-center sky-glow"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: 'spring', stiffness: 300, damping: 20 }}
                  className="w-16 h-16 mx-auto mb-5 rounded-full bg-green-500/15 border border-green-500/40 flex items-center justify-center"
                >
                  <CheckCircle2 className="w-8 h-8 text-green-400" />
                </motion.div>
                <h2 className="font-grotesk font-bold text-lg mb-2">Compte Eza validé !</h2>
                <p className="font-inter text-sm text-muted-foreground mb-6">Connexion Internet établie.</p>
                <button className="w-full h-13 rounded-xl bg-primary text-primary-foreground font-grotesk font-bold text-sm flex items-center justify-center gap-2 hover:brightness-110 active:scale-[0.97] transition-all sky-glow py-3">
                  <Globe className="w-4 h-4" />
                  Naviguer sur le web
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 pb-8 pt-4 px-6">
        <div className="flex items-center justify-center gap-1.5">
          <Lock className="w-3 h-3 text-muted-foreground/40" />
          <p className="font-inter text-[10px] text-muted-foreground/50 tracking-wide">
            Accès Wi-Fi sécurisé via Eza
          </p>
        </div>
      </footer>
    </div>
  );
}