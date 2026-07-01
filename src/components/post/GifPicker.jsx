import { useState, useEffect, useRef } from 'react';
import { Search, X, Loader2 } from 'lucide-react';

const TENOR_KEY = 'AIzaSyAyimkuYQYF_FXVALexPMBGk7IJKbnVMLE'; // public demo key

export default function GifPicker({ onSelect, onClose }) {
  const [query, setQuery] = useState('');
  const [gifs, setGifs] = useState([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);

  const search = async (q) => {
    setLoading(true);
    try {
      const endpoint = q
        ? `https://tenor.googleapis.com/v2/search?q=${encodeURIComponent(q)}&key=${TENOR_KEY}&limit=20&media_filter=gif`
        : `https://tenor.googleapis.com/v2/featured?key=${TENOR_KEY}&limit=20&media_filter=gif`;
      const res = await fetch(endpoint);
      const data = await res.json();
      setGifs(data.results || []);
    } catch {
      setGifs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { search(''); inputRef.current?.focus(); }, []);

  useEffect(() => {
    const t = setTimeout(() => search(query), 400);
    return () => clearTimeout(t);
  }, [query]);

  return (
    <div className="absolute bottom-full left-0 mb-2 w-80 rounded-2xl overflow-hidden z-50 shadow-2xl"
      style={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}>
      {/* Header */}
      <div className="flex items-center gap-2 p-3 border-b border-border/40">
        <div className="flex-1 flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/8">
          <Search className="w-3.5 h-3.5 text-muted-foreground/50 flex-shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Chercher un GIF…"
            className="flex-1 bg-transparent text-xs text-foreground placeholder:text-muted-foreground/40 outline-none"
          />
        </div>
        <button onClick={onClose} className="p-1 rounded-full hover:bg-white/8 text-muted-foreground transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Grid */}
      <div className="h-64 overflow-y-auto p-2">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-5 h-5 animate-spin text-primary" />
          </div>
        ) : (
          <div className="columns-2 gap-1.5 space-y-1.5">
            {gifs.map(gif => {
              const url = gif.media_formats?.gif?.url || gif.media_formats?.tinygif?.url;
              if (!url) return null;
              return (
                <button key={gif.id} onClick={() => { onSelect(url); onClose(); }}
                  className="w-full rounded-xl overflow-hidden hover:opacity-80 transition-opacity block">
                  <img src={url} alt={gif.content_description} className="w-full object-cover" loading="lazy" />
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div className="px-3 py-1.5 border-t border-border/30 flex justify-end">
        <span className="text-[10px] text-muted-foreground/30 font-mono">Powered by Tenor</span>
      </div>
    </div>
  );
}