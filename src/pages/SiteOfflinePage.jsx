import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, RefreshCw, Activity, Mail, Zap, WifiOff } from 'lucide-react';

const PARTICLES = Array.from({ length: 14 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: Math.random() * 2 + 1,
  delay: Math.random() * 4,
  duration: Math.random() * 6 + 4,
}));

export default function SiteOfflinePage() {
  const [time, setTime] = useState(new Date());
  const [dots, setDots] = useState('');

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const d = setInterval(() => setDots(p => (p.length >= 3 ? '' : p + '.')), 500);
    return () => clearInterval(d);
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center relative overflow-hidden px-6">
      {/* Grid background */}
      <div className="absolute inset-0 grid-bg opacity-60" />

      {/* Ambient glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(239,68,68,0.08) 0%, transparent 70%)' }} />

      {/* Floating particles */}
      {PARTICLES.map(p => (
        <motion.div key={p.id}
          className="absolute rounded-full bg-red-400/30"
          style={{ left: `${p.x}%`, top: `${p.y}%`, width: p.size, height: p.size }}
          animate={{ y: [0, -30, 0], opacity: [0.15, 0.6, 0.15] }}
          transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}

      {/* Scan line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-red-400/40 to-transparent scan-line pointer-events-none" />

      {/* Corner decorations */}
      <div className="absolute top-6 left-6 flex items-center gap-2">
        <div className="w-7 h-7 rounded-lg bg-red-400/10 border border-red-400/20 flex items-center justify-center">
          <span className="font-grotesk font-black text-xs text-red-400">E</span>
        </div>
        <span className="font-mono text-[10px] text-red-400/40 tracking-widest">EZA — SYS_OFFLINE</span>
      </div>
      <div className="absolute top-6 right-6 font-mono text-[10px] text-red-400/40 tabular-nums">
        {time.toLocaleTimeString('fr-FR')}
      </div>
      <div className="absolute bottom-6 left-6 font-mono text-[10px] text-muted-foreground/30">
        v2.0 — ERR_503
      </div>
      <div className="absolute bottom-6 right-6">
        <span className="inline-flex items-center gap-1.5 font-mono text-[10px] text-red-400/50">
          <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
          UPLINK INTERROMPU
        </span>
      </div>

      {/* Main content */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="relative z-10 flex flex-col items-center text-center max-w-lg w-full"
      >
        {/* Error icon animated */}
        <div className="relative mb-8">
          <motion.div
            animate={{ y: [-6, 6, -6] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            className="relative"
          >
            <div className="w-24 h-24 rounded-3xl bg-red-400/10 border border-red-400/30 flex items-center justify-center"
              style={{ boxShadow: '0 0 40px rgba(239,68,68,0.15)' }}>
              <AlertTriangle className="w-12 h-12 text-red-400" />
            </div>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
              className="absolute inset-0 rounded-full border border-dashed border-red-400/20"
              style={{ margin: '-12px' }}
            />
            <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-card border border-border flex items-center justify-center">
              <WifiOff className="w-4 h-4 text-red-400" />
            </div>
          </motion.div>

          {[1, 2, 3].map(i => (
            <motion.div key={i}
              className="absolute inset-0 rounded-full border border-red-400/10"
              style={{ margin: `${i * -20}px` }}
              animate={{ opacity: [0.6, 0, 0.6], scale: [1, 1.2, 1] }}
              transition={{ duration: 3, delay: i * 0.8, repeat: Infinity }}
            />
          ))}
        </div>

        {/* Title */}
        <p className="font-mono text-xs text-red-400 tracking-widest uppercase mb-3">— EZA · ERREUR SYSTÈME</p>
        <h1 className="font-grotesk font-bold text-4xl sm:text-5xl mb-2 leading-tight">
          Un problème<br />
          <span className="bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">
            technique{dots}
          </span>
        </h1>
        <p className="font-inter text-muted-foreground text-sm leading-relaxed mt-4 mb-8 max-w-sm">
          Désolé, une interruption de service vient de se produire. Le site <strong className="text-foreground">eza.group</strong> est
          temporairement hors ligne ou en cours de maintenance. Veuillez réessayer dans quelques instants.
        </p>

        {/* Error code box */}
        <div className="w-full bg-card/50 border border-border rounded-2xl p-5 mb-6 text-left backdrop-blur-sm">
          <div className="flex items-center gap-2 mb-3">
            <Activity className="w-3.5 h-3.5 text-red-400" />
            <span className="font-mono text-[10px] text-red-400 uppercase tracking-widest">Détails techniques</span>
          </div>
          <div className="space-y-2.5">
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 rounded-full border border-red-400/50 bg-red-400/20 flex items-center justify-center flex-shrink-0">
                <div className="w-1.5 h-1.5 rounded-full bg-red-400" />
              </div>
              <span className="font-mono text-xs text-foreground">ERR_CONNECTION_REFUSED</span>
              <span className="ml-auto font-mono text-[9px] text-red-400 bg-red-400/10 px-2 py-0.5 rounded-full">ÉCHEC</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 rounded-full border border-amber-400/50 bg-amber-400/20 flex items-center justify-center flex-shrink-0">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              </div>
              <span className="font-mono text-xs text-muted-foreground">503 — Service Unavailable</span>
              <span className="ml-auto font-mono text-[9px] text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full">HORS LIGNE</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 rounded-full border border-primary/50 bg-primary/20 flex items-center justify-center flex-shrink-0">
                <motion.div className="w-1.5 h-1.5 rounded-full bg-primary"
                  animate={{ opacity: [1, 0, 1] }} transition={{ duration: 1, repeat: Infinity }} />
              </div>
              <span className="font-mono text-xs text-muted-foreground">Reconnexion automatique active</span>
              <span className="ml-auto font-mono text-[9px] text-primary bg-primary/10 px-2 py-0.5 rounded-full">EN COURS</span>
            </div>
          </div>
        </div>

        {/* Auto-reconnect button */}
        <motion.a
          href={typeof window !== 'undefined' ? window.location.href : '/'}
          onClick={(e) => { e.preventDefault(); window.location.reload(); }}
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="inline-flex items-center gap-2 bg-primary/10 border border-primary/30 text-primary font-grotesk font-semibold text-sm px-5 py-2.5 rounded-xl hover:bg-primary/20 transition-colors mb-4 cursor-pointer"
        >
          <RefreshCw className="w-4 h-4" />
          Réessayer maintenant
        </motion.a>

        {/* Status link */}
        <a
          href="https://status.eza.group"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground font-inter text-xs transition-colors mb-4"
        >
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          Voir le statut des services
        </a>

        {/* Contact */}
        <div className="flex items-center gap-2 text-muted-foreground/60">
          <Zap className="w-3.5 h-3.5 text-primary/50" />
          <span className="font-inter text-xs">
            Urgence ? <a href="mailto:contact@eza.group" className="text-primary hover:underline">contact@eza.group</a>
          </span>
        </div>
      </motion.div>
    </div>
  );
}