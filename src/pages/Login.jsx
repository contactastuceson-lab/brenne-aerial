import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Eye, EyeOff, Loader2, Lock, Mail } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Input } from '@/components/ui/input';
import AuthBrandPanel from '@/components/auth/AuthBrandPanel';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);
    try { await base44.auth.loginViaEmailPassword(email, password); window.location.href = '/'; }
    catch { setError('Email ou mot de passe incorrect.'); }
    finally { setLoading(false); }
  };

  return <div className="flex min-h-screen bg-background"><AuthBrandPanel /><main className="flex flex-1 items-center justify-center px-6 py-12"><div className="w-full max-w-md">
    <div className="mb-8 lg:hidden"><img src="https://media.base44.com/images/public/69c5c081406b9e20deaed582/80278201e_1782606023373-Photoroom.png" alt="eza" className="h-12 w-12 object-contain" /></div>
    <h1 className="font-grotesk text-3xl font-black tracking-tight">Bon retour sur eza</h1><p className="mt-2 font-inter text-sm text-muted-foreground">Connectez-vous à votre compte pour reprendre la conversation.</p>
    <div className="mt-8 grid grid-cols-3 gap-2"><button type="button" onClick={() => base44.auth.loginWithProvider('google', '/')} className="flex h-11 items-center justify-center gap-1 rounded-xl border border-border bg-card font-inter text-xs font-semibold hover:bg-secondary"><span className="text-base">G</span><span className="hidden sm:inline">Google</span></button><button type="button" onClick={() => base44.auth.loginWithProvider('facebook', '/')} className="flex h-11 items-center justify-center gap-1 rounded-xl border border-border bg-card font-inter text-xs font-semibold hover:bg-secondary"><span className="text-base text-blue-500">f</span><span className="hidden sm:inline">Facebook</span></button><button type="button" onClick={() => base44.auth.loginWithProvider('microsoft', '/')} className="flex h-11 items-center justify-center gap-1 rounded-xl border border-border bg-card font-inter text-xs font-semibold hover:bg-secondary"><span className="grid grid-cols-2 gap-px"><i className="h-1.5 w-1.5 bg-red-500" /><i className="h-1.5 w-1.5 bg-green-500" /><i className="h-1.5 w-1.5 bg-blue-500" /><i className="h-1.5 w-1.5 bg-yellow-400" /></span><span className="hidden sm:inline">Microsoft</span></button></div>
    <div className="my-6 flex items-center gap-3"><span className="h-px flex-1 bg-border" /><span className="font-inter text-xs text-muted-foreground">ou avec votre email</span><span className="h-px flex-1 bg-border" /></div>
    <form onSubmit={handleSubmit} className="space-y-4"><label className="block"><span className="mb-1.5 block font-inter text-xs font-semibold">Adresse email</span><span className="relative block"><Mail className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" /><Input type="email" value={email} onChange={e => setEmail(e.target.value)} className="h-11 pl-9" autoComplete="email" required /></span></label><label className="block"><span className="mb-1.5 flex items-center justify-between font-inter text-xs font-semibold">Mot de passe <Link to="/forgot-password" className="font-medium text-primary hover:underline">Mot de passe oublié ?</Link></span><span className="relative block"><Lock className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" /><Input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} className="h-11 pl-9 pr-10" autoComplete="current-password" required /><button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3 text-muted-foreground">{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button></span></label>{error && <p className="rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2.5 font-inter text-xs text-destructive">{error}</p>}<button disabled={loading} className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary font-inter text-sm font-bold text-primary-foreground disabled:opacity-60">{loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Se connecter <ArrowRight className="h-4 w-4" /></>}</button></form>
    <p className="mt-8 text-center font-inter text-sm text-muted-foreground">Nouveau sur eza ? <Link to="/register" className="font-semibold text-primary hover:underline">Créer un compte</Link></p>
  </div></main></div>;
}