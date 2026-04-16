import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Wrench, Plane, Radio, Zap } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

const PARTICLES = Array.from({ length: 18 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: Math.random() * 2 + 1,
  delay: Math.random() * 4,
  duration: Math.random() * 6 + 4,
}));

export default function MaintenancePage({ message: propMessage }) {
  const [time, setTime] = useState(new Date());
  const [dots, setDots] = useState('');

  const { data: settings = [] } = useQuery({
    queryKey: ['app-settings'],
    queryFn: () => base44.entities.AppSettings.list(),
  });

  const sMap = Object.fromEntries(settings.map(s => [s.key, s.value]));

  const message  = propMessage || sMap['maintenance_message'] || "Nous effectuons des améliorations pour vous offrir la meilleure expérience possible. Retour imminent.";
  const progress = parseInt(sMap['maintenance_progress'] || '68', 10);

  const checks = [1, 2, 3, 4].map(i => ({
    label: sMap[`maintenance_check_${i}`] || `Tâche ${i}`,
    done:  (sMap[`maintenance_check_${i}_done`] ?? (i <= 2 ? 'true' : 'false')) === 'true',
  }));

  // The first non-done task is "active"
  const activeIndex = checks.findIndex(c => !c.done);

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const d = setInterval(() => setDots(p => p.length >= 3 ? '' : p + '.'), 500);
    return () => clearInterval(d);
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center relative overflow-hidden px-6">

      {/* Grid background */}
      <div className="absolute inset-0 grid-bg opacity-60" />

      {/* Ambient glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(56,170,220,0.08) 0%, transparent 70%)' }} />

      {/* Floating particles */}
      {PARTICLES.map(p => (
        <motion.div key={p.id}
          className="absolute rounded-full bg-primary/40"
          style={{ left: `${p.x}%`, top: `${p.y}%`, width: p.size, height: p.size }}
          animate={{ y: [0, -30, 0], opacity: [0.2, 0.8, 0.2] }}
          transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}

      {/* Scan line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent scan-line pointer-events-none" />

      {/* Corner decorations */}
      <div className="absolute top-6 left-6 font-mono text-[10px] text-primary/40 tracking-widest">
        BRENNE_AERIAL — SYS_MAINTENANCE
      </div>
      <div className="absolute top-6 right-6 font-mono text-[10px] text-primary/40 tabular-nums">
        {time.toLocaleTimeString('fr-FR')}
      </div>
      <div className="absolute bottom-6 left-6 font-mono text-[10px] text-muted-foreground/30">
        v2.0 — BUILD_IN_PROGRESS
      </div>
      <div className="absolute bottom-6 right-6">
        <span className="inline-flex items-center gap-1.5 font-mono text-[10px] text-primary/50">
          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
          UPLINK ACTIF
        </span>
      </div>

      {/* Main content */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="relative z-10 flex flex-col items-center text-center max-w-lg w-full"
      >
        {/* Drone icon animated */}
        <div className="relative mb-8">
          <motion.div
            animate={{ y: [-6, 6, -6] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            className="relative"
          >
            <div className="w-24 h-24 rounded-3xl bg-primary/10 border border-primary/30 flex items-center justify-center sky-glow">
              <Plane className="w-12 h-12 text-primary" style={{ transform: 'rotate(-45deg)' }} />
            </div>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
              className="absolute inset-0 rounded-full border border-dashed border-primary/20"
              style={{ margin: '-12px' }}
            />
            <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-card border border-border flex items-center justify-center">
              <Wrench className="w-4 h-4 text-primary" />
            </div>
          </motion.div>

          {[1, 2, 3].map(i => (
            <motion.div key={i}
              className="absolute inset-0 rounded-full border border-primary/10"
              style={{ margin: `${i * -20}px` }}
              animate={{ opacity: [0.6, 0, 0.6], scale: [1, 1.2, 1] }}
              transition={{ duration: 3, delay: i * 0.8, repeat: Infinity }}
            />
          ))}
        </div>

        {/* Title */}
        <p className="font-mono text-xs text-primary tracking-widest uppercase mb-3">— Brenne Aerial</p>
        <h1 className="font-grotesk font-bold text-4xl sm:text-5xl mb-2 leading-tight">
          Maintenance<br />
          <span className="gradient-text sky-glow-text">en cours{dots}</span>
        </h1>
        <p className="font-inter text-muted-foreground text-sm leading-relaxed mt-4 mb-8 max-w-sm">
          {message}
        </p>

        {/* Status checklist */}
        <div className="w-full bg-card/50 border border-border rounded-2xl p-5 mb-6 text-left backdrop-blur-sm">
          <div className="flex items-center gap-2 mb-4">
            <Radio className="w-3.5 h-3.5 text-primary" />
            <span className="font-mono text-[10px] text-primary uppercase tracking-widest">Journal de bord</span>
          </div>
          <div className="space-y-2.5">
            {checks.map((check, i) => {
              const isActive = i === activeIndex;
              return (
                <motion.div key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.15 }}
                  className="flex items-center gap-3"
                >
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center flex-shrink-0 ${
                    check.done ? 'bg-green-400/20 border-green-400/50' : isActive ? 'bg-primary/20 border-primary/50' : 'bg-secondary border-border'
                  }`}>
                    {check.done && <div className="w-1.5 h-1.5 rounded-full bg-green-400" />}
                    {isActive && (
                      <motion.div className="w-1.5 h-1.5 rounded-full bg-primary"
                        animate={{ opacity: [1, 0, 1] }} transition={{ duration: 1, repeat: Infinity }} />
                    )}
                  </div>
                  <span className={`font-inter text-xs ${
                    check.done ? 'text-muted-foreground line-through' : isActive ? 'text-foreground font-medium' : 'text-muted-foreground/50'
                  }`}>
                    {check.label}
                  </span>
                  {check.done && <span className="ml-auto font-mono text-[9px] text-green-400 bg-green-400/10 px-2 py-0.5 rounded-full">OK</span>}
                  {isActive && <span className="ml-auto font-mono text-[9px] text-primary bg-primary/10 px-2 py-0.5 rounded-full">EN COURS</span>}
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full mb-6">
          <div className="flex items-center justify-between mb-1.5">
            <span className="font-mono text-[10px] text-muted-foreground">Progression</span>
            <span className="font-mono text-[10px] text-primary">{progress}%</span>
          </div>
          <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden">
            <motion.div
              initial={{ width: '0%' }}
              animate={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
              transition={{ duration: 2, delay: 0.5, ease: 'easeOut' }}
              className="h-full rounded-full bg-gradient-to-r from-primary to-accent"
            />
          </div>
        </div>

        {/* Contact */}
        <div className="flex items-center gap-2 text-muted-foreground/60">
          <Zap className="w-3.5 h-3.5 text-primary/50" />
          <span className="font-inter text-xs">
            Urgence ? <a href="mailto:contact@brenneaerial.fr" className="text-primary hover:underline">contact@brenneaerial.fr</a>
          </span>
        </div>
      </motion.div>
    </div>
  );
}