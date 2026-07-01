import { useState, useEffect, useRef } from 'react';
import { Search, X, Loader2 } from 'lucide-react';

// Giphy public beta key — works without account restrictions
const GIPHY_KEY = 'dc6zaTOxFJmzC';

export default function GifPicker({ onSelect, onClose }) {
  const [query, setQuery] = useState('');
  const [gifs, setGifs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const inputRef = useRef(null);
  const containerRef = useRef(null);

  const search = async (q) => {
    setLoading(true);
    setError(false);
    try {
      const endpoint = q
        ? `https://api.giphy.com/v1/gifs/search?api_key=${GIPHY_KEY}&q=${encodeURIComponent(q)}&limit=24&rating=g`
        : `https://api.giphy.com/v1/gifs/trending?api_key=${GIPHY_KEY}&limit=24&rating=g`;
      const res = await fetch(endpoint);
      if (!res.ok) throw new Error('fetch failed');
      const json = await res.json();
      setGifs(json.data || []);
    } catch {
      setError(true);
      setGifs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    search('');
    setTimeout(() => inputRef.current?.focus(), 50);
  }, []);

  useEffect(() => {
    const t = setTimeout(() => { if (query !== undefined) search(query); }, 400);
    return () => clearTimeout(t);
  }, [query]);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) onClose();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  return (
    <div
      ref={containerRef}
      className="absolute z-[100] w-80 rounded-2xl overflow-hidden shadow-2xl"
      style={{
        background: 'hsl(var(--card))',
        border: '1px solid hsl(var(--border))',
        // Position above the button, aligned left
        bottom: 'calc(100% + 8px)',
        left: 0,
      }}
      onClick={e => e.stopPropagation()}
    >
      {/* Search header */}
      <div className="flex items-center gap-2 p-3 border-b border-border/40">
        <div className="flex-1 flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/8">
          <Search className="w-3.5 h-3.5 text-muted-foreground/50 flex-shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Chercher un GIF…"
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/40 outline-none"
          />
          {query && (
            <button onClick={() => setQuery('')} className="text-muted-foreground/50 hover:text-foreground transition-colors">
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
        <button onClick={onClose} className="p-1.5 rounded-full hover:bg-white/8 text-muted-foreground transition-colors flex-shrink-0">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* GIF grid */}
      <div className="h-64 overflow-y-auto p-2">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-full gap-2">
            <Loader2 className="w-5 h-5 animate-spin text-primary" />
            <span className="text-xs text-muted-foreground/50">Chargement…</span>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-full gap-2 text-center px-4">
            <span className="text-2xl">😕</span>
            <p className="text-xs text-muted-foreground">Impossible de charger les GIFs. Vérifiez votre connexion.</p>
          </div>
        ) : gifs.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-xs text-muted-foreground/50">Aucun résultat</p>
          </div>
        ) : (
          <div className="columns-2 gap-1.5 space-y-1.5">
            {gifs.map(gif => {
              const url = gif.images?.fixed_width_downsampled?.url || gif.images?.fixed_width?.url || gif.images?.original?.url;
              if (!url) return null;
              return (
                <button
                  key={gif.id}
                  onClick={() => onSelect(gif.images?.original?.url || url)}
                  className="w-full rounded-xl overflow-hidden hover:opacity-80 hover:scale-[1.02] transition-all block focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <img
                    src={url}
                    alt={gif.title || 'GIF'}
                    className="w-full object-cover"
                    loading="lazy"
                  />
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-3 py-1.5 border-t border-border/30 flex justify-end">
        <span className="text-[10px] text-muted-foreground/30 font-mono">Powered by GIPHY</span>
      </div>
    </div>
  );
}