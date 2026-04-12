import React, { useState, useEffect } from 'react';
import { Ban, Clock, ShieldAlert, LogOut, Timer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';

const CONFIG = {
  banned: {
    icon: Ban,
    iconColor: 'text-red-400',
    iconBg: 'bg-red-400/10 border-red-400/20',
    title: 'Compte banni',
    desc: 'Votre compte a été définitivement banni de la plateforme suite à une violation de nos conditions d\'utilisation.',
    accent: 'border-red-400/30',
    badge: 'bg-red-400/10 border-red-400/30 text-red-400',
    badgeText: '⛔ BANNI',
    bg: 'from-red-950/20 to-background',
  },
  suspended: {
    icon: Clock,
    iconColor: 'text-yellow-400',
    iconBg: 'bg-yellow-400/10 border-yellow-400/20',
    title: 'Compte suspendu',
    desc: 'Votre compte est temporairement suspendu. Vous pourrez de nouveau accéder à la plateforme une fois la suspension levée.',
    accent: 'border-yellow-400/30',
    badge: 'bg-yellow-400/10 border-yellow-400/30 text-yellow-400',
    badgeText: '⏸ SUSPENDU',
    bg: 'from-yellow-950/20 to-background',
  },
  restricted: {
    icon: ShieldAlert,
    iconColor: 'text-orange-400',
    iconBg: 'bg-orange-400/10 border-orange-400/20',
    title: 'Accès restreint',
    desc: 'Votre compte est en accès restreint. Certaines fonctionnalités sont limitées pendant cette période.',
    accent: 'border-orange-400/30',
    badge: 'bg-orange-400/10 border-orange-400/30 text-orange-400',
    badgeText: '⚠️ RESTREINT',
    bg: 'from-orange-950/20 to-background',
  },
};

function Countdown({ until }) {
  const [remaining, setRemaining] = useState(null);

  useEffect(() => {
    const target = new Date(until).getTime();
    const calc = () => {
      const diff = target - Date.now();
      if (diff <= 0) { setRemaining(null); return; }
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setRemaining({ d, h, m, s });
    };
    calc();
    const iv = setInterval(calc, 1000);
    return () => clearInterval(iv);
  }, [until]);

  if (!remaining) return null;

  return (
    <div className="mt-4">
      <p className="font-inter text-xs text-muted-foreground mb-3 flex items-center gap-1.5 justify-center">
        <Timer className="w-3.5 h-3.5" /> Levée automatique dans
      </p>
      <div className="flex items-center gap-2 justify-center">
        {[
          { val: remaining.d, label: 'jours' },
          { val: remaining.h, label: 'heures' },
          { val: remaining.m, label: 'min' },
          { val: remaining.s, label: 'sec' },
        ].map(({ val, label }) => (
          <div key={label} className="flex flex-col items-center">
            <div className="w-14 h-14 rounded-xl bg-secondary border border-border flex items-center justify-center font-mono font-bold text-xl text-foreground">
              {String(val).padStart(2, '0')}
            </div>
            <span className="font-mono text-[10px] text-muted-foreground mt-1">{label}</span>
          </div>
        ))}
      </div>
      <p className="font-inter text-xs text-muted-foreground mt-3">
        Fin prévue : <strong className="text-foreground">{new Date(until).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</strong>
      </p>
    </div>
  );
}

export default function BannedPage({ status, reason, until }) {
  const cfg = CONFIG[status] || CONFIG.restricted;
  const Icon = cfg.icon;

  return (
    <div className={`min-h-screen bg-gradient-to-b ${cfg.bg} flex flex-col items-center justify-center text-center px-6`}>
      {/* Visual */}
      <div className={`w-20 h-20 rounded-2xl ${cfg.iconBg} border-2 flex items-center justify-center mb-5`}>
        <Icon className={`w-10 h-10 ${cfg.iconColor}`} />
      </div>

      {/* Status badge */}
      <span className={`inline-block font-mono text-xs px-3 py-1 rounded-full border mb-4 ${cfg.badge}`}>
        {cfg.badgeText}
      </span>

      <h1 className="font-grotesk font-bold text-2xl mb-2">{cfg.title}</h1>
      <p className="font-inter text-sm text-muted-foreground max-w-md mb-4">{cfg.desc}</p>

      {/* Reason */}
      {reason && (
        <div className={`border rounded-xl px-5 py-3 mb-4 max-w-sm ${cfg.accent} bg-secondary`}>
          <p className="font-inter text-xs text-muted-foreground mb-0.5">Motif :</p>
          <p className="font-inter text-sm text-foreground">{reason}</p>
        </div>
      )}

      {/* Countdown if date given */}
      {until && status !== 'banned' && <Countdown until={until} />}

      <div className="mt-8 space-y-2">
        <Button variant="outline" className="border-border gap-2 font-inter text-sm" onClick={() => base44.auth.logout('/')}>
          <LogOut className="w-4 h-4" /> Se déconnecter
        </Button>
        <p className="font-inter text-xs text-muted-foreground">
          Une erreur ? Contactez-nous à <a href="mailto:contact@brenneaerial.fr" className="text-primary hover:underline">contact@brenneaerial.fr</a>
        </p>
      </div>
    </div>
  );
}