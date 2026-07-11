import { MessageCircle, Sparkles, Users } from 'lucide-react';

const LOGO_URL = 'https://media.base44.com/images/public/69c5c081406b9e20deaed582/80278201e_1782606023373-Photoroom.png';

export default function AuthBrandPanel({ mode = 'login' }) {
  const isRegister = mode === 'register';
  return (
    <aside className="hidden lg:flex lg:w-[46%] relative flex-col justify-between overflow-hidden p-12 bg-card border-r border-border">
      <div className="absolute inset-0 grid-bg opacity-30 pointer-events-none" />
      <div className="absolute -top-24 -right-24 h-80 w-80 rounded-full bg-primary/15 blur-[100px]" />
      <div className="relative flex items-center gap-3">
        <img src={LOGO_URL} alt="eza" className="h-12 w-12 object-contain" />
        <div><p className="font-grotesk text-2xl font-black tracking-tight">eza</p><p className="font-mono text-[10px] uppercase tracking-[0.24em] text-primary">réseau social</p></div>
      </div>
      <div className="relative max-w-md">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-3 py-1.5 font-mono text-[11px] text-primary"><span className="h-1.5 w-1.5 rounded-full bg-primary" /> Votre espace communauté</div>
        <h1 className="font-grotesk text-5xl font-black leading-[1.02] tracking-tight">{isRegister ? <>Prenez votre place<br /><span className="gradient-text">dans la conversation.</span></> : <>Retrouvez votre<br /><span className="gradient-text">communauté.</span></>}</h1>
        <p className="mt-6 max-w-sm font-inter text-base leading-relaxed text-muted-foreground">{isRegister ? 'Partagez vos idées, créez des liens et suivez les conversations qui vous inspirent.' : 'Connectez-vous pour publier, échanger et explorer tout ce qui anime eza.'}</p>
        <div className="mt-10 space-y-4">{[[MessageCircle, 'Partagez librement'], [Users, 'Découvrez des communautés'], [Sparkles, 'Faites rayonner votre profil']].map(([Icon, label]) => <div key={label} className="flex items-center gap-3"><span className="flex h-9 w-9 items-center justify-center rounded-xl border border-primary/20 bg-primary/10"><Icon className="h-4 w-4 text-primary" /></span><span className="font-inter text-sm text-foreground/85">{label}</span></div>)}</div>
      </div>
      <p className="relative font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">eza · des personnes, des idées, des liens</p>
    </aside>
  );
}