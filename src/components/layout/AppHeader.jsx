import React from 'react';
import { Link } from 'react-router-dom';

export default function AppHeader() {
  return (
    <header className="sticky top-0 left-0 right-0 z-20 glass border-b border-border/50 h-13">
      <div className="flex items-center justify-between px-4 h-13" style={{ minHeight: '52px' }}>
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="relative w-7 h-7">
            <div className="absolute inset-0 bg-primary/20 rounded-lg group-hover:bg-primary/30 transition-colors" />
            <svg viewBox="0 0 32 32" className="w-7 h-7 relative z-10" fill="none">
              <path d="M16 4 L28 10 L28 22 L16 28 L4 22 L4 10 Z" stroke="hsl(205 90% 58%)" strokeWidth="1.5" fill="none" />
              <circle cx="16" cy="16" r="3" fill="hsl(205 90% 58%)" />
              <path d="M16 4 L16 13 M16 19 L16 28 M4 10 L13 13.5 M19 18.5 L28 22 M4 22 L13 18.5 M19 13.5 L28 10" stroke="hsl(205 90% 58%)" strokeWidth="1" opacity="0.5" />
            </svg>
          </div>
          <span className="font-grotesk font-bold text-base text-foreground tracking-tight">
            Brenne <span className="text-primary">Aerial</span>
          </span>
        </Link>

        {/* Status pill */}
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-400/10 border border-green-400/25">
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
          <span className="font-mono text-[10px] text-green-400 font-semibold">EN LIGNE</span>
        </div>
      </div>
    </header>
  );
}