import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Home, Users, ArrowLeft, Compass } from 'lucide-react';

export default function ProfileNotFound({ username }) {
  const canvasRef = useRef(null);

  // Particules flottantes légères
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    const particles = Array.from({ length: 40 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.5 + 0.3,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      alpha: Math.random() * 0.4 + 0.1,
    }));

    let animId;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(205, 90%, 58%, ${p.alpha})`;
        ctx.fill();
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;
      });
      animId = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(animId);
  }, []);

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Fond particules */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full opacity-60" />

      {/* Glow de fond */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/5 blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] rounded-full bg-accent/5 blur-[80px]" />
      </div>

      {/* Grille */}
      <div className="absolute inset-0 grid-bg opacity-20 pointer-events-none" />

      {/* Contenu */}
      <div className="relative z-10 text-center px-6 max-w-lg mx-auto">

        {/* Icône animée */}
        <motion.div
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          className="inline-flex items-center justify-center w-28 h-28 rounded-3xl bg-secondary/60 border border-border/80 backdrop-blur-sm mb-8 mx-auto relative"
        >
          <div className="absolute inset-0 rounded-3xl bg-primary/5 animate-pulse" />
          {/* Drone SVG stylisé */}
          <svg viewBox="0 0 64 64" className="w-14 h-14" fill="none">
            <circle cx="32" cy="32" r="8" stroke="hsl(205 90% 58%)" strokeWidth="2" fill="none" />
            <circle cx="32" cy="32" r="3" fill="hsl(205 90% 58%)" opacity="0.6" />
            {/* Bras */}
            <line x1="32" y1="24" x2="32" y2="12" stroke="hsl(215 15% 55%)" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="32" y1="40" x2="32" y2="52" stroke="hsl(215 15% 55%)" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="24" y1="32" x2="12" y2="32" stroke="hsl(215 15% 55%)" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="40" y1="32" x2="52" y2="32" stroke="hsl(215 15% 55%)" strokeWidth="1.5" strokeLinecap="round" />
            {/* Hélices */}
            <ellipse cx="32" cy="10" rx="8" ry="2.5" stroke="hsl(205 90% 58%)" strokeWidth="1.5" fill="none" opacity="0.5" />
            <ellipse cx="32" cy="54" rx="8" ry="2.5" stroke="hsl(205 90% 58%)" strokeWidth="1.5" fill="none" opacity="0.5" />
            <ellipse cx="10" cy="32" rx="2.5" ry="8" stroke="hsl(205 90% 58%)" strokeWidth="1.5" fill="none" opacity="0.5" />
            <ellipse cx="54" cy="32" rx="2.5" ry="8" stroke="hsl(205 90% 58%)" strokeWidth="1.5" fill="none" opacity="0.5" />
            {/* Croix "non trouvé" */}
            <line x1="26" y1="26" x2="30" y2="30" stroke="hsl(0 72% 51%)" strokeWidth="2" strokeLinecap="round" />
            <line x1="30" y1="26" x2="26" y2="30" stroke="hsl(0 72% 51%)" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </motion.div>

        {/* Code erreur */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="inline-flex items-center gap-2 font-mono text-xs text-primary bg-primary/10 border border-primary/20 px-3 py-1.5 rounded-full mb-5"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
          ERREUR 404 — PROFIL INTROUVABLE
        </motion.div>

        {/* Titre */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="font-grotesk font-bold text-4xl sm:text-5xl text-foreground mb-3 leading-tight"
        >
          Profil{' '}
          <span className="gradient-text">non trouvé</span>
        </motion.h1>

        {/* Sous-titre */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="font-inter text-base text-muted-foreground mb-2"
        >
          Le drone a cherché partout dans la Brenne…
        </motion.p>
        {username && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.25 }}
            className="font-mono text-sm text-destructive/70 bg-destructive/5 border border-destructive/20 rounded-lg px-3 py-1.5 inline-block mb-8"
          >
            @{username.toLowerCase()} — introuvable
          </motion.p>
        )}

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-3 justify-center mb-10"
        >
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-inter text-sm font-semibold hover:bg-primary/90 transition-all duration-200 shadow-lg shadow-primary/20 hover:-translate-y-0.5"
          >
            <Home className="w-4 h-4" />
            Retour à l'accueil
          </Link>
          <Link
            to="/discover"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-secondary border border-border text-foreground font-inter text-sm font-medium hover:bg-secondary/80 transition-all duration-200 hover:-translate-y-0.5"
          >
            <Compass className="w-4 h-4" />
            Explorer les profils
          </Link>
        </motion.div>

        {/* Liens secondaires */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex items-center justify-center gap-6"
        >
          <Link to="/forum" className="flex items-center gap-1.5 font-inter text-xs text-muted-foreground hover:text-primary transition-colors">
            <Search className="w-3 h-3" />
            Forum
          </Link>
          <span className="w-px h-3 bg-border" />
          <Link to="/messages" className="flex items-center gap-1.5 font-inter text-xs text-muted-foreground hover:text-primary transition-colors">
            <Users className="w-3 h-3" />
            Messagerie
          </Link>
          <span className="w-px h-3 bg-border" />
          <button onClick={() => window.history.back()} className="flex items-center gap-1.5 font-inter text-xs text-muted-foreground hover:text-primary transition-colors">
            <ArrowLeft className="w-3 h-3" />
            Retour
          </button>
        </motion.div>
      </div>
    </div>
  );
}