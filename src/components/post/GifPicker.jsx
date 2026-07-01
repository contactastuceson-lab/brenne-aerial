import { useState, useEffect, useRef } from 'react';
import { Search, X, Loader2 } from 'lucide-react';
import { createPortal } from 'react-dom';

const GIPHY_KEY = 'dc6zaTOxFJmzC';

export default function GifPicker({ onSelect, onClose }) {
  const [query, setQuery] = useState('');
  const [gifs, setGifs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const inputRef = useRef(null);

  const search = async (q) => {
    setLoading(true);
    setError(false);
    try {
      const endpoint = q
        ? `https://api.giphy.com/v1/gifs/search?api_key=${GIPHY_KEY}&q=${encodeURIComponent(q)}&limit=30&rating=g`
        : `https://api.giphy.com/v1/gifs/trending?api_key=${GIPHY_KEY}&limit=30&rating=g`;
      const res = await fetch(endpoint);
      if (!res.ok) throw new Error();
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
    setTimeout(() => inputRef.current?.focus(), 80);
  }, []);

  useEffect(() => {
    const t = setTimeout(() => search(query), 400);
    return () => clearTimeout(t);
  }, [query]);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const modal = (
    <div
      className="fixed inset-0 z-[999] flex flex-col"
      style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <div
        className="flex flex-col w-full max-w-lg mx-auto mt-12 rounded-2xl overflow-hidden"
        style={{
          background: 'hsl(var(--card))',
          border: '1px solid hsl(var(--border))',
          maxHeight: 'calc(100vh - 80px)',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Search bar */}
        <div className="flex items-center gap-3 p-3 border-b border-border/40">
          <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/8 text-foreground transition-colors flex-shrink-0">
            <X className="w-5 h-5" />
          </button>
          <div className="flex-1 flex items-center gap-2 px-4 py-2 rounded-full border-2 border-primary"
            style={{ background: 'transparent' }}>
            <Search className="w-4 h-4 text-primary flex-shrink-0" />
            <input
              ref={inputRef}
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Rechercher des GIF"
              className="flex-1 bg-transparent text-[15px] text-foreground placeholder:text-muted-foreground/50 outline-none"
            />
            {query && (
              <button onClick={() => setQuery('')} className="text-muted-foreground/50 hover:text-foreground">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Grid */}
        <div className="flex-1 overflow-y-auto p-2">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3 text-center px-6">
              <span className="text-3xl">😕</span>
              <p className="text-sm text-muted-foreground">Impossible de charger les GIFs.</p>
            </div>
          ) : gifs.length === 0 ? (
            <div className="flex items-center justify-center py-20">
              <p className="text-sm text-muted-foreground/50">Aucun résultat pour « {query} »</p>
            </div>
          ) : (
            <div className="columns-2 gap-1.5 space-y-1.5">
              {gifs.map(gif => {
                const previewUrl = gif.images?.fixed_width_downsampled?.url || gif.images?.fixed_width?.url;
                const originalUrl = gif.images?.original?.url || previewUrl;
                if (!previewUrl) return null;
                return (
                  <button
                    key={gif.id}
                    onClick={() => { onSelect(originalUrl); onClose(); }}
                    className="w-full rounded-xl overflow-hidden hover:opacity-80 transition-opacity block focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <img src={previewUrl} alt={gif.title || 'GIF'} className="w-full object-cover" loading="lazy" />
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 border-t border-border/30 flex justify-end">
          <span className="text-[10px] text-muted-foreground/30 font-mono">Powered by GIPHY</span>
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}