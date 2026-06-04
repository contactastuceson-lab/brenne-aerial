import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Input } from '@/components/ui/input';
import { Eye, EyeOff, Loader2, Mail, Lock, ArrowRight, Shield, Zap, Users } from 'lucide-react';
import { motion } from 'framer-motion';

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

const FEATURES = [
  { icon: Shield, text: 'Données chiffrées et sécurisées' },
  { icon: Zap, text: 'Accès instantané à votre espace' },
  { icon: Users, text: '+1 200 pilotes professionnels' },
];

const TESTIMONIALS = [
  { name: 'Enor Lefoulon Meyer', role: 'Fondateur Brenne Aerial', text: 'Une plateforme pensée par les pilotes, pour les pilotes. Efficace, intuitive, indispensable.' },
  { name: 'Sophie L.', role: 'Inspectrice toiture', text: 'Devis en quelques clics, planning clair. Indispensable.' },
];

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState(null);
  const [error, setError] = useState('');
  const [testimonialIdx] = useState(0);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    if (!email || !password) { setError('Veuillez remplir tous les champs.'); return; }
    setLoading(true);
    try {
      await base44.auth.loginViaEmailPassword(email, password);
      window.location.href = '/';
    } catch {
      setError('Email ou mot de passe incorrect. Vérifiez vos identifiants.');
    } finally {
      setLoading(false);
    }
  };

  const handleSocial = async (provider) => {
    setSocialLoading(provider);
    try {
      await base44.auth.loginWithProvider(provider, '/');
    } catch {
      setSocialLoading(null);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* ── Left panel — branding ── */}
      <div className="hidden lg:flex lg:w-[52%] relative flex-col justify-between p-12 overflow-hidden"
        style={{ background: 'linear-gradient(145deg, hsl(214 50% 4%) 0%, hsl(214 45% 7%) 40%, hsl(205 50% 10%) 100%)' }}>

        {/* Grid & glow */}
        <div className="absolute inset-0 grid-bg opacity-30 pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-primary/8 blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-[300px] h-[300px] rounded-full bg-accent/5 blur-[80px] pointer-events-none" />

        {/* Top — logo */}
        <div className="relative z-10 flex items-center gap-4">
          <img src="https://media.base44.com/images/public/69c5c081406b9e20deaed582/3282a4fc9_5722.png" alt="Brenne Aerial Logo" className="w-28 h-28 object-contain" />
          <div>
            <h1 className="font-grotesk font-bold text-2xl text-foreground tracking-tight">Brenne Aerial</h1>
            <p className="font-mono text-[10px] text-primary/60 tracking-widest uppercase mt-1">Premium Drone Services</p>
          </div>
        </div>

        {/* Center — hero text */}
        <div className="relative z-10 max-w-sm">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <div className="inline-flex items-center gap-2 font-mono text-xs text-primary bg-primary/10 border border-primary/20 px-3 py-1.5 rounded-full mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              Connexion sécurisée — SSL/TLS
            </div>
            <h1 className="font-grotesk font-black text-4xl xl:text-5xl text-foreground leading-[1.1] mb-4">
              Votre ciel,<br />
              <span className="gradient-text">notre plateforme.</span>
            </h1>
            <p className="font-inter text-base text-muted-foreground leading-relaxed mb-8">
              Gérez vos missions de drone, vos devis clients et votre planning en un seul endroit. Simple, rapide, professionnel.
            </p>
          </motion.div>

          {/* Feature list */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }} className="space-y-3 mb-10">
            {FEATURES.map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-3.5 h-3.5 text-primary" />
                </div>
                <span className="font-inter text-sm text-foreground/80">{text}</span>
              </div>
            ))}
          </motion.div>

          {/* Testimonial */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
            className="p-4 rounded-2xl bg-secondary/40 border border-border/60 backdrop-blur-sm">
            <p className="font-inter text-sm text-foreground/80 italic mb-3">
              «{TESTIMONIALS[testimonialIdx].text}»
            </p>
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center">
                <span className="font-grotesk font-bold text-[11px] text-primary">
                  {TESTIMONIALS[testimonialIdx].name[0]}
                </span>
              </div>
              <div>
                <p className="font-inter text-xs font-semibold text-foreground">{TESTIMONIALS[testimonialIdx].name}</p>
                <p className="font-mono text-[10px] text-muted-foreground">{TESTIMONIALS[testimonialIdx].role}</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Bottom stats */}
        <div className="relative z-10 grid grid-cols-3 gap-4">
          {[['1 200+', 'Pilotes inscrits'], ['98 %', 'Satisfaction client'], ['24 h', 'Support réactif']].map(([val, label]) => (
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
        <div className="lg:hidden flex items-center gap-3 mb-8">
          <img src="https://media.base44.com/images/public/69c5c081406b9e20deaed582/3282a4fc9_5722.png" alt="Brenne Aerial Logo" className="w-16 h-16 object-contain" />
          <div>
            <h1 className="font-grotesk font-bold text-lg text-foreground">Brenne Aerial</h1>
            <p className="font-mono text-[9px] text-primary/60">Premium Drone Services</p>
          </div>
        </div>

        <div className="relative z-10 w-full max-w-md mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h2 className="font-grotesk font-bold text-3xl text-foreground mb-2">Bienvenue 👋</h2>
            <p className="font-inter text-sm text-muted-foreground">
              Connectez-vous à votre espace professionnel Brenne Aerial.
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
            <span className="font-inter text-xs text-muted-foreground px-1">ou continuer avec email</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4" noValidate>
            <div>
              <label htmlFor="login-email" className="block font-inter text-xs font-medium text-foreground mb-1.5">
                Adresse email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                <Input
                  id="login-email"
                  type="email"
                  placeholder="vous@exemple.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="pl-9 h-11"
                  autoComplete="email"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="login-password" className="font-inter text-xs font-medium text-foreground">
                  Mot de passe
                </label>
                <Link to="/forgot-password" className="font-inter text-xs text-primary hover:underline focus-visible:outline-none focus-visible:underline">
                  Mot de passe oublié ?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                <Input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="pl-9 pr-10 h-11"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                className="font-inter text-xs text-destructive bg-destructive/10 border border-destructive/20 rounded-xl px-3 py-2.5">
                {error}
              </motion.p>
            )}

            <button
              type="submit"
              disabled={loading || !!socialLoading}
              className="w-full h-11 rounded-xl bg-primary text-primary-foreground font-inter text-sm font-semibold hover:bg-primary/90 transition-colors duration-150 disabled:opacity-60 cursor-pointer flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Se connecter <ArrowRight className="w-4 h-4" /></>}
            </button>
          </form>

          {/* Footer links */}
          <div className="mt-8 pt-6 border-t border-border">
            <p className="text-center font-inter text-sm text-muted-foreground">
              Pas encore de compte ?{' '}
              <Link to="/register" className="text-primary hover:underline font-medium">
                Créer un compte gratuit
              </Link>
            </p>
            <p className="text-center font-inter text-xs text-muted-foreground mt-4">
              En vous connectant, vous acceptez nos{' '}
              <Link to="/legal/terms" className="text-primary hover:underline">CGU</Link>
              {' '}et notre{' '}
              <Link to="/legal/privacy" className="text-primary hover:underline">Politique de confidentialité</Link>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}