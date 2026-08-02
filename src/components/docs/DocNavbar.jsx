import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Sparkles, ChevronDown, Monitor, ArrowRight, Headset,
} from 'lucide-react';
import DocSearch from '@/components/docs/DocSearch';

const EZA_LOGO = 'https://media.base44.com/images/public/69c5c081406b9e20deaed582/077186390_1782605365815.png';
const ORANGE = '#ff7800';

export default function DocNavbar() {
  const navigate = useNavigate();

  return (
    <header
      className="sticky top-0 z-40 w-full border-b"
      style={{ background: '#161616', borderColor: 'rgba(255,255,255,0.06)' }}
    >
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center gap-3">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-2 flex-shrink-0">
          <img src={EZA_LOGO} alt="EZA GROUP" className="h-7 w-auto rounded object-cover" />
        </Link>

        {/* Language selector */}
        <button
          className="hidden md:inline-flex items-center gap-1.5 h-8 px-2.5 rounded-md text-xs font-medium text-white/70 border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] transition-colors flex-shrink-0"
          type="button"
        >
          Français <ChevronDown className="w-3 h-3 opacity-60" />
        </button>

        {/* Center group: search + assistant */}
        <div className="flex-1 flex items-center justify-center gap-2 min-w-0">
          <DocSearch
            className="hidden sm:block w-full max-w-md"
            placeholder="Recherche..."
            inputClassName="w-full h-9 pl-11 pr-12 rounded-full bg-white/[0.05] border border-white/10 text-xs text-white placeholder:text-white/35 outline-none focus:border-white/25 transition-colors"
            rightSlot={<kbd className="text-[10px] font-mono text-white/40 px-1.5 py-0.5 rounded border border-white/10 bg-white/[0.03]">Ctrl K</kbd>}
          />

          <button
            type="button"
            onClick={() => navigate('/support')}
            className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-full bg-white/[0.05] border border-white/10 text-xs font-medium text-white/80 hover:bg-white/[0.09] transition-colors flex-shrink-0"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden md:inline">Demander à l'assistant</span>
            <span className="md:hidden">Assistant</span>
          </button>
        </div>

        {/* Right */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <Link
            to="/support"
            className="hidden lg:inline text-xs font-medium text-white/70 hover:text-white transition-colors"
          >
            Soutien
          </Link>
          <a
            href="/"
            className="inline-flex items-center gap-1.5 h-9 px-4 rounded-lg text-xs font-bold text-white transition-transform active:scale-95"
            style={{ background: ORANGE }}
          >
            EZA <ArrowRight className="w-3.5 h-3.5" />
          </a>
          <button
            type="button"
            className="hidden md:inline-flex w-9 h-9 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-white/60 hover:text-white hover:bg-white/[0.08] transition-colors"
            title="Affichage bureau"
          >
            <Monitor className="w-4 h-4" />
          </button>
          <Link
            to="/support"
            className="md:hidden w-9 h-9 inline-flex items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-white/60"
            title="Soutien"
          >
            <Headset className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </header>
  );
}