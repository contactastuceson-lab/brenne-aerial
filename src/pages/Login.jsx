import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Eye, EyeOff, Loader2, Mail, Lock } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState(null);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    if (!email || !password) { setError('Veuillez remplir tous les champs.'); return; }
    setLoading(true);
    try {
      await base44.auth.loginViaEmailPassword(email, password);
      window.location.href = '/';
    } catch (err) {
      setError('Email ou mot de passe incorrect.');
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
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-background">
      {/* Glow background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/5 blur-[120px]" />
      </div>
      <div className="absolute inset-0 grid-bg opacity-20 pointer-events-none" />

      <div className="relative z-10 w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 mb-4">
            <svg viewBox="0 0 32 32" className="w-7 h-7" fill="none">
              <circle cx="16" cy="16" r="4" fill="hsl(205 90% 58%)" />
              <line x1="16" y1="12" x2="16" y2="4" stroke="hsl(205 90% 58%)" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="16" y1="20" x2="16" y2="28" stroke="hsl(205 90% 58%)" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="12" y1="16" x2="4" y2="16" stroke="hsl(205 90% 58%)" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="20" y1="16" x2="28" y2="16" stroke="hsl(205 90% 58%)" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
          <h1 className="font-grotesk font-bold text-2xl text-foreground">Connexion</h1>
          <p className="font-inter text-sm text-muted-foreground mt-1">Bienvenue sur Brenne Aerial</p>
        </div>

        <div className="glass rounded-2xl p-6 border border-border/60">
          {/* Social buttons */}
          <div className="space-y-2.5 mb-5">
            <button
              onClick={() => handleSocial('google')}
              disabled={!!socialLoading}
              className="w-full flex items-center justify-center gap-3 h-10 rounded-xl border border-border bg-secondary/60 hover:bg-secondary transition-colors font-inter text-sm font-medium text-foreground disabled:opacity-60"
            >
              {socialLoading === 'google' ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                <svg className="w-4 h-4" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
              )}
              Continuer avec Google
            </button>

            <button
              onClick={() => handleSocial('facebook')}
              disabled={!!socialLoading}
              className="w-full flex items-center justify-center gap-3 h-10 rounded-xl border border-border bg-secondary/60 hover:bg-secondary transition-colors font-inter text-sm font-medium text-foreground disabled:opacity-60"
            >
              {socialLoading === 'facebook' ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="#1877F2"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              )}
              Continuer avec Facebook
            </button>

            <button
              onClick={() => handleSocial('microsoft')}
              disabled={!!socialLoading}
              className="w-full flex items-center justify-center gap-3 h-10 rounded-xl border border-border bg-secondary/60 hover:bg-secondary transition-colors font-inter text-sm font-medium text-foreground disabled:opacity-60"
            >
              {socialLoading === 'microsoft' ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                <svg className="w-4 h-4" viewBox="0 0 24 24"><rect x="1" y="1" width="10.5" height="10.5" fill="#F25022"/><rect x="12.5" y="1" width="10.5" height="10.5" fill="#7FBA00"/><rect x="1" y="12.5" width="10.5" height="10.5" fill="#00A4EF"/><rect x="12.5" y="12.5" width="10.5" height="10.5" fill="#FFB900"/></svg>
              )}
              Continuer avec Microsoft
            </button>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px bg-border" />
            <span className="font-inter text-xs text-muted-foreground">ou</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          {/* Email/password form */}
          <form onSubmit={handleLogin} className="space-y-3">
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="email"
                placeholder="Adresse email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="pl-9"
                autoComplete="email"
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder="Mot de passe"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="pl-9 pr-9"
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {error && (
              <p className="font-inter text-xs text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2">{error}</p>
            )}

            <div className="flex justify-end">
              <Link to="/forgot-password" className="font-inter text-xs text-primary hover:underline">
                Mot de passe oublié ?
              </Link>
            </div>

            <Button type="submit" disabled={loading} className="w-full h-10 font-inter text-sm font-semibold rounded-xl">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Se connecter'}
            </Button>
          </form>
        </div>

        <p className="text-center font-inter text-sm text-muted-foreground mt-5">
          Pas encore de compte ?{' '}
          <Link to="/register" className="text-primary hover:underline font-medium">
            S'inscrire
          </Link>
        </p>
      </div>
    </div>
  );
}