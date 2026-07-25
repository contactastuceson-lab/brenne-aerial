import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Ban, Clock, ShieldAlert, LogOut, Timer, Crown } from 'lucide-react';
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

export default function BannedPage({ status, reason, until, isSupreme = false }) {
  const cfg = CONFIG[status] || CONFIG.restricted;
  const Icon = cfg.icon;

  if (isSupreme) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center px-6 relative overflow-hidden"
        style={{ background: 'linear-gradient(180deg, #0d0800 0%, #050300 50%, #0d0800 100%)' }}>
        {/* Ambient particles */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <motion.div key={i}
              className="absolute rounded-full"
              style={{
                width: (i % 3) + 1,
                height: (i % 3) + 1,
                left: `${(i * 19 + 5) % 100}%`,
                top: `${(i * 23 + 7) % 100}%`,
                background: `rgba(245,158,11,${0.15 + (i % 4) * 0.1})`,
                boxShadow: '0 0 6px rgba(245,158,11,0.7)',
              }}
              animate={{ y: [-15, 15, -15], opacity: [0.2, 0.9, 0.2] }}
              transition={{ duration: 3 + (i % 4), repeat: Infinity, delay: i % 3 }}
            />
          ))}
          <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse 60% 40% at 50% 50%, rgba(245,158,11,0.06) 0%, transparent 70%)' }} />
        </div>

        {/* Crown icon */}
        <motion.div
          animate={{ rotate: [-5, 5, -5] }}
          transition={{ duration: 4, repeat: Infinity }}
          className="relative z-10 mb-5"
        >
          <div className="w-24 h-24 rounded-2xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg,#1a0c00,#2d1500)', border: '2px solid #d97706', boxShadow: '0 0 30px rgba(245,158,11,0.4), inset 0 1px 0 rgba(245,158,11,0.2)' }}>
            <Crown className="w-12 h-12" style={{ color: '#f59e0b', filter: 'drop-shadow(0 0 10px rgba(245,158,11,0.9))' }} />
          </div>
        </motion.div>

        {/* Supreme rank banner */}
        <div className="relative z-10 mb-3 px-4 py-1.5 rounded-full flex items-center gap-2"
          style={{ background: 'linear-gradient(135deg,#92400e,#d97706)', boxShadow: '0 2px 12px rgba(245,158,11,0.4)' }}>
          <span style={{ fontSize: 11 }}>👑</span>
          <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-yellow-100">Rang Suprême</span>
        </div>

        {/* Status badge */}
        <motion.span
          initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          className="relative z-10 inline-block font-mono text-xs px-4 py-1.5 rounded-full border mb-5"
          style={{ background: 'rgba(245,158,11,0.1)', borderColor: 'rgba(217,119,6,0.5)', color: '#f59e0b' }}
        >
          {cfg.badgeText}
        </motion.span>

        <h1 className="relative z-10 font-grotesk font-bold text-3xl mb-3"
          style={{ background: 'linear-gradient(90deg,#f59e0b,#fde68a,#d97706)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          {cfg.title}
        </h1>
        <p className="relative z-10 font-inter text-sm max-w-md mb-5" style={{ color: '#a08040' }}>{cfg.desc}</p>

        {reason && (
          <div className="relative z-10 rounded-xl px-5 py-4 mb-5 max-w-sm"
            style={{ background: 'linear-gradient(135deg,rgba(245,158,11,0.07),rgba(217,119,6,0.04))', border: '1px solid rgba(217,119,6,0.35)' }}>
            <p className="font-mono text-[10px] uppercase tracking-widest mb-1" style={{ color: '#d97706' }}>Motif :</p>
            <p className="font-inter text-sm" style={{ color: '#c8943a' }}>{reason}</p>
          </div>
        )}

        {until && status !== 'banned' && <div className="relative z-10"><Countdown until={until} /></div>}

        <div className="relative z-10 mt-8 space-y-3">
          <Button className="gap-2 font-inter text-sm border-0" onClick={() => base44.auth.logout('/')}
            style={{ background: 'linear-gradient(135deg,#92400e,#d97706)', color: '#fff', boxShadow: '0 4px 16px rgba(245,158,11,0.3)' }}>
            <LogOut className="w-4 h-4" /> Se déconnecter
          </Button>
          <p className="font-inter text-xs" style={{ color: '#7a6030' }}>
            Une erreur ? Contactez-nous à <a href="mailto:contact@eza.group" style={{ color: '#d97706' }}>contact@eza.group</a>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gradient-to-b ${cfg.bg} flex flex-col items-center justify-center text-center px-6`}>
      <div className={`w-20 h-20 rounded-2xl ${cfg.iconBg} border-2 flex items-center justify-center mb-5`}>
        <Icon className={`w-10 h-10 ${cfg.iconColor}`} />
      </div>
      <span className={`inline-block font-mono text-xs px-3 py-1 rounded-full border mb-4 ${cfg.badge}`}>
        {cfg.badgeText}
      </span>
      <h1 className="font-grotesk font-bold text-2xl mb-2">{cfg.title}</h1>
      <p className="font-inter text-sm text-muted-foreground max-w-md mb-4">{cfg.desc}</p>
      {reason && (
        <div className={`border rounded-xl px-5 py-3 mb-4 max-w-sm ${cfg.accent} bg-secondary`}>
          <p className="font-inter text-xs text-muted-foreground mb-0.5">Motif :</p>
          <p className="font-inter text-sm text-foreground">{reason}</p>
        </div>
      )}
      {until && status !== 'banned' && <Countdown until={until} />}
      <div className="mt-8 space-y-2">
        <Button variant="outline" className="border-border gap-2 font-inter text-sm" onClick={() => base44.auth.logout('/')}>
          <LogOut className="w-4 h-4" /> Se déconnecter
        </Button>
        <p className="font-inter text-xs text-muted-foreground">
          Une erreur ? Contactez-nous à <a href="mailto:contact@eza.group" className="text-primary hover:underline">contact@eza.group</a>
        </p>
      </div>
    </div>
  );
}