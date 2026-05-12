import React, { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { MapPin, Loader2 } from 'lucide-react';

export default function AddressAutocomplete({ value, onChange, placeholder = "Adresse, ville, pays..." }) {
  const [query, setQuery] = useState(value || '');
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const debounceRef = useRef(null);
  const containerRef = useRef(null);

  // Sync external value changes
  useEffect(() => { setQuery(value || ''); }, [value]);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const search = async (q) => {
    if (q.length < 3) { setSuggestions([]); setOpen(false); return; }
    setLoading(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&addressdetails=1&limit=6&accept-language=fr`,
        { headers: { 'Accept-Language': 'fr' } }
      );
      const data = await res.json();
      setSuggestions(data);
      setOpen(data.length > 0);
    } catch {
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    onChange(val);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(val), 400);
  };

  const handleSelect = (suggestion) => {
    const address = suggestion.display_name;
    setQuery(address);
    onChange(address);
    setSuggestions([]);
    setOpen(false);
  };

  const formatSuggestion = (s) => {
    const a = s.address || {};
    const parts = [
      a.road || a.pedestrian || a.suburb,
      a.house_number,
      a.city || a.town || a.village || a.municipality,
      a.postcode,
      a.state || a.county,
      a.country,
    ].filter(Boolean);
    return parts.join(', ') || s.display_name;
  };

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
        <Input
          value={query}
          onChange={handleChange}
          onFocus={() => suggestions.length > 0 && setOpen(true)}
          placeholder={placeholder}
          className="bg-card border-border pl-9 pr-9"
        />
        {loading && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary animate-spin" />
        )}
      </div>

      {open && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 rounded-xl border border-border bg-card shadow-xl overflow-hidden">
          {suggestions.map((s, i) => (
            <button
              key={s.place_id || i}
              type="button"
              onClick={() => handleSelect(s)}
              className="w-full text-left px-4 py-3 text-sm hover:bg-primary/10 transition-colors border-b border-border/50 last:border-0 flex items-start gap-3"
            >
              <MapPin className="w-3.5 h-3.5 text-primary flex-shrink-0 mt-0.5" />
              <span className="font-inter text-sm text-foreground leading-snug line-clamp-2">
                {formatSuggestion(s)}
              </span>
            </button>
          ))}
          <div className="px-3 py-1.5 text-[10px] text-muted-foreground bg-muted/30 text-right font-mono">
            © OpenStreetMap
          </div>
        </div>
      )}
    </div>
  );
}