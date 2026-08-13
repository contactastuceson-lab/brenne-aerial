import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

// Ecosysteme Eza Group — applications accessibles depuis le launcher
// `current` designe l'application qui heberge ce composant (Eza Social)
const APPS = [
  { id: 'eza_social', name: 'Eza Social', emoji: '🌐', kind: 'internal', to: '/' },
  { id: 'eza_mail', name: 'EZA Mail', emoji: '📧', kind: 'external', href: 'https://mail.ezagroup.fr' },
  { id: 'eza_support', name: 'EZA Support', emoji: '🎧', kind: 'internal', to: '/support/conversation' },
];

function WaffleIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <circle cx="5" cy="5" r="1.7" /><circle cx="12" cy="5" r="1.7" /><circle cx="19" cy="5" r="1.7" />
      <circle cx="5" cy="12" r="1.7" /><circle cx="12" cy="12" r="1.7" /><circle cx="19" cy="12" r="1.7" />
      <circle cx="5" cy="19" r="1.7" /><circle cx="12" cy="19" r="1.7" /><circle cx="19" cy="19" r="1.7" />
    </svg>
  );
}

export default function AppLauncher() {
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [open]);

  // L'application actuelle : Eza Social par defaut, EZA Support si on est sur /support
  const currentId = location.pathname.startsWith('/support') ? 'eza_support' : 'eza_social';

  return (
    <div className="relative w-full" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        aria-label="Applications Eza Group"
        className="group flex items-center gap-3 px-1 xl:px-2 py-1.5 rounded-2xl transition-all duration-150 w-full"
      >
        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all border ${
            open
              ? 'bg-white/10 border-white/20 text-foreground'
              : 'bg-white/5 border-white/8 text-muted-foreground group-hover:bg-white/8 group-hover:border-white/14 group-hover:text-foreground'
          }`}
        >
          <WaffleIcon className="w-5 h-5" />
        </div>
        <span className={`font-inter text-[17px] hidden xl:block ${open ? 'font-bold text-foreground' : 'text-muted-foreground group-hover:text-foreground'}`}>
          Applications
        </span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute bottom-full left-0 xl:left-2 mb-2 w-64 rounded-2xl border border-border bg-popover p-2 z-40"
            style={{ boxShadow: '0 16px 48px rgba(0,0,0,0.5)' }}
          >
            <p className="px-2 pt-1 pb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">Écosystème Eza Group</p>
            <div className="flex flex-col gap-1">
              {APPS.map(app => {
                const active = app.id === currentId;
                const inner = (
                  <div className={`flex items-center gap-3 rounded-xl px-2.5 py-2.5 transition-colors ${active ? 'bg-primary/10 ring-1 ring-primary/30' : 'hover:bg-white/6'}`}>
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0" style={{ background: 'rgba(255,255,255,0.06)' }}>
                      {app.emoji}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-grotesk font-bold text-sm text-foreground truncate">{app.name}</p>
                      {active
                        ? <p className="text-[10px] text-primary font-medium">Application actuelle</p>
                        : <p className="text-[10px] text-muted-foreground/60 truncate">{app.kind === 'internal' ? 'Eza Group' : app.href.replace(/^https?:\/\//, '')}</p>}
                    </div>
                  </div>
                );
                if (app.kind === 'internal') {
                  return (
                    <Link key={app.id} to={app.to} onClick={() => setOpen(false)} className="block">
                      {inner}
                    </Link>
                  );
                }
                return (
                  <a key={app.id} href={app.href} target="_blank" rel="noopener noreferrer" onClick={() => setOpen(false)} className="block">
                    {inner}
                  </a>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}