import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Sparkles, ArrowRight, Menu, Headset } from 'lucide-react';
import DocSearch from '@/components/docs/DocSearch';

const EZA_LOGO = 'https://media.base44.com/images/public/69c5c081406b9e20deaed582/077186390_1782605365815.png';
const ACCENT = '#ff7800';

const TABS = [
  { label: 'Documentation', to: '/support/documentation', match: '/support/documentation' },
  { label: 'Communauté', to: '/forum', match: '/forum' },
  { label: 'Support', to: '/support', match: '/support' },
  { label: 'Journal', to: '/uptime', match: '/uptime' },
];

export default function DocNavbar() {
  const navigate = useNavigate();
  const path = typeof window !== 'undefined' ? window.location.pathname : '';

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur">
      {/* Row 1 — brand + search + actions */}
      <div className="mx-auto max-w-[1400px] px-4 lg:px-8">
        <div className="flex h-16 items-center gap-4">
          {/* Brand */}
          <Link to="/" className="flex items-center gap-2 flex-shrink-0">
            <img src={EZA_LOGO} alt="EZA" className="h-7 w-auto rounded object-cover" />
          </Link>

          {/* Search (desktop) */}
          <div className="hidden lg:flex flex-1 items-center justify-center max-w-xl mx-auto">
            <DocSearch
              className="w-full"
              placeholder="Rechercher dans la documentation…"
              inputClassName="w-full h-9 pl-10 pr-16 rounded-lg border border-border bg-card text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/15 transition-all"
              rightSlot={<kbd className="text-[10px] font-mono text-muted-foreground px-1.5 py-0.5 rounded border border-border bg-muted">⌘K</kbd>}
            />
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2 flex-shrink-0 ml-auto lg:ml-0">
            <button
              type="button"
              onClick={() => navigate('/support')}
              className="hidden md:inline-flex items-center gap-1.5 h-9 px-3 rounded-lg border border-border bg-card text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" style={{ color: ACCENT }} />
              Assistant
            </button>
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-lg text-xs font-bold text-white transition-transform active:scale-95"
              style={{ background: ACCENT }}
            >
              eza.app <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link to="/support" className="md:hidden w-9 h-9 inline-flex items-center justify-center rounded-lg border border-border bg-card text-muted-foreground">
              <Headset className="w-4 h-4" />
            </Link>
          </div>

          {/* Mobile search trigger */}
          <button className="lg:hidden w-9 h-9 inline-flex items-center justify-center rounded-lg border border-border bg-card text-muted-foreground">
            <Search className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Row 2 — tabs */}
      <div className="border-t border-border hidden lg:block">
        <div className="mx-auto max-w-[1400px] px-4 lg:px-8">
          <nav className="flex h-12 items-center gap-6">
            {TABS.map((t) => {
              const active = path.startsWith(t.match);
              return (
                <Link
                  key={t.to}
                  to={t.to}
                  className={`relative h-full flex items-center text-sm font-medium transition-colors ${
                    active ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {t.label}
                  {active && (
                    <span
                      className="absolute bottom-0 left-0 right-0 h-[2px] rounded-full"
                      style={{ background: ACCENT }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
}