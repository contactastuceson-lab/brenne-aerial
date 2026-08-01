import { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { Loader2, Search } from 'lucide-react';

// Recherche GIF via GIPHY (backend searchGifs). onPick({ url })
export default function GifPicker({ onPick }) {
  const [q, setQ] = useState('');
  const [gifs, setGifs] = useState([]);
  const [loading, setLoading] = useState(true);
  const tRef = useRef(null);

  const load = async (query) => {
    setLoading(true);
    try {
      const res = await base44.functions.invoke('searchGifs', { query });
      setGifs(res?.data || []);
    } catch { setGifs([]); }
    setLoading(false);
  };

  useEffect(() => { load(''); }, []);

  const onSearch = (v) => {
    setQ(v);
    clearTimeout(tRef.current);
    tRef.current = setTimeout(() => load(v.trim()), 350);
  };

  return (
    <div className="space-y-2">
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          value={q}
          onChange={(e) => onSearch(e.target.value)}
          placeholder="Rechercher un GIF…"
          className="w-full h-9 rounded-lg bg-secondary/60 border border-border pl-8 pr-3 text-sm focus:outline-none focus:border-primary/50"
        />
      </div>
      {loading ? (
        <div className="flex justify-center py-6"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>
      ) : (
        <div className="grid grid-cols-3 gap-1.5 max-h-44 overflow-y-auto no-scrollbar">
          {gifs.map((g) => {
            const url = g.images?.fixed_height_small?.url || g.images?.fixed_height?.url;
            if (!url) return null;
            return (
              <button
                key={g.id}
                onClick={() => onPick({ url })}
                className="rounded-lg overflow-hidden bg-secondary/40 aspect-square flex items-center justify-center hover:ring-2 hover:ring-primary transition-all"
              >
                <img src={url} alt="" className="w-full h-full object-cover" />
              </button>
            );
          })}
          {gifs.length === 0 && (
            <p className="col-span-3 text-center text-xs text-muted-foreground py-4">Aucun GIF trouvé</p>
          )}
        </div>
      )}
    </div>
  );
}