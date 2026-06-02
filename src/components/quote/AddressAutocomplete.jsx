import React, { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { MapPin, Loader2, X } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

export default function AddressAutocomplete({ value, onChange, placeholder = "Adresse, ville, pays..." }) {
  const [query, setQuery] = useState(value || '');
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState(null);
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
        `https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(q)}&limit=6&autocomplete=1`
      );
      const data = await res.json();
      setSuggestions(data.features || []);
      setOpen((data.features || []).length > 0);
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
    debounceRef.current = setTimeout(() => search(val), 300);
  };

  const handleSelect = (suggestion) => {
    const address = suggestion.properties.label;
    const coords = suggestion.geometry.coordinates;
    setQuery(address);
    onChange(address);
    setSuggestions([]);
    setOpen(false);
    setSelectedAddress({ label: address, lat: coords[1], lng: coords[0] });
  };

  const formatSuggestion = (s) => {
    return s.properties.label;
  };

  return (
    <div className="space-y-3">
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
                key={s.properties?.id || i}
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
              © Base Adresse Nationale
            </div>
          </div>
        )}
      </div>

      {selectedAddress && (
        <div className="relative rounded-xl overflow-hidden border border-border bg-card shadow-md">
          <div className="relative h-32 md:h-40 bg-secondary/50">
            <MapContainer
              center={[selectedAddress.lat, selectedAddress.lng]}
              zoom={15}
              scrollWheelZoom={false}
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; OpenStreetMap'
              />
              <Marker
                position={[selectedAddress.lat, selectedAddress.lng]}
                icon={L.icon({
                  iconUrl: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiMwZWE1ZTkiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48cGF0aCBkPSJNMjEgMTBjMCA3LTkgMTMtOSAxM3MtOSAtNi05IC0xM2E5IDkgMCAwIDEgMTggMHoiLz48Y2lyY2xlIGN4PSIxMiIgY3k9IjEwIiByPSIzIi8+PC9zdmc+',
                  iconSize: [32, 32],
                  iconAnchor: [16, 32],
                })}
              >
                <Popup>{selectedAddress.label}</Popup>
              </Marker>
            </MapContainer>
          </div>
          <button
            onClick={() => setSelectedAddress(null)}
            className="absolute top-2 right-2 p-1.5 rounded-lg bg-background/80 backdrop-blur border border-border hover:bg-background transition-colors z-10"
          >
            <X className="w-4 h-4 text-foreground" />
          </button>
          <div className="p-3 bg-card border-t border-border">
            <p className="font-inter text-xs text-muted-foreground">Lieu confirmé</p>
            <p className="font-grotesk font-semibold text-sm text-foreground truncate">{selectedAddress.label}</p>
          </div>
        </div>
      )}
    </div>
  );
}