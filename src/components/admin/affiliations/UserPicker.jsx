import React, { useState } from 'react';
import { Search, X, Check } from 'lucide-react';

export default function UserPicker({ label, users, value, onChange, placeholder }) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);

  const filtered = (users || [])
    .filter(u => !query ||
      (u.display_name || u.full_name || '').toLowerCase().includes(query.toLowerCase()) ||
      (u.email || '').toLowerCase().includes(query.toLowerCase()))
    .slice(0, 40);

  const selected = users?.find(u => u.id === value) || null;

  return (
    <div className="relative">
      {label && <p className="font-inter text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wide">{label}</p>}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-2 bg-background border border-border rounded-lg px-3 py-2 text-left text-sm hover:border-primary/30 transition-colors"
      >
        {selected ? (
          <>
            <div className="w-6 h-6 rounded-full bg-primary/10 overflow-hidden flex-shrink-0">
              {selected.avatar_url ? <img src={selected.avatar_url} className="w-full h-full object-cover" alt="" /> :
                <span className="w-full h-full flex items-center justify-center text-[10px] font-bold text-primary">{(selected.display_name || selected.full_name || 'U')[0]}</span>}
            </div>
            <span className="font-inter text-sm truncate flex-1">{selected.display_name || selected.full_name}</span>
            {selected.tag && (
              <span className="font-mono text-[9px] uppercase tracking-wide px-1.5 py-0.5 rounded-full bg-accent/10 text-accent border border-accent/20 flex-shrink-0">{selected.tag}</span>
            )}
            <span className="font-mono text-[10px] text-muted-foreground truncate">{selected.email}</span>
          </>
        ) : (
          <span className="text-muted-foreground text-sm">{placeholder || 'Choisir...'}</span>
        )}
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-full bg-popover border border-border rounded-lg shadow-xl overflow-hidden">
          <div className="relative p-2 border-b border-border">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <input
              autoFocus
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Rechercher..."
              className="w-full bg-background border border-border rounded-md pl-8 pr-3 py-1.5 text-sm"
            />
          </div>
          <div className="max-h-56 overflow-y-auto">
            {filtered.map(u => (
              <button
                key={u.id}
                type="button"
                onClick={() => { onChange(u.id); setOpen(false); setQuery(''); }}
                className={`w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-secondary transition-colors ${value === u.id ? 'bg-primary/10' : ''}`}
              >
                <div className="w-6 h-6 rounded-full bg-primary/10 overflow-hidden flex-shrink-0">
                  {u.avatar_url ? <img src={u.avatar_url} className="w-full h-full object-cover" alt="" /> :
                    <span className="w-full h-full flex items-center justify-center text-[10px] font-bold text-primary">{(u.display_name || u.full_name || 'U')[0]}</span>}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="font-inter text-sm truncate">{u.display_name || u.full_name || '—'}</p>
                    {u.tag && (
                      <span className="font-mono text-[9px] uppercase tracking-wide px-1.5 py-0.5 rounded-full bg-accent/10 text-accent border border-accent/20 flex-shrink-0">{u.tag}</span>
                    )}
                  </div>
                  <p className="font-mono text-[10px] text-muted-foreground truncate">{u.email}</p>
                </div>
                {value === u.id && <Check className="w-3.5 h-3.5 text-primary flex-shrink-0" />}
              </button>
            ))}
            {filtered.length === 0 && (
              <p className="text-center py-6 text-xs text-muted-foreground">Aucun utilisateur</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}