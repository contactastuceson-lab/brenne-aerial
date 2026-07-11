import { Search, X } from 'lucide-react';

export default function SearchInput({ value, onChange }) {
  return (
    <div className="sticky top-0 z-20 px-4 py-3 bg-background/95 backdrop-blur-md border-b border-border/50">
      <div className="flex items-center gap-3 rounded-2xl bg-secondary/60 border border-border px-3.5 py-3 focus-within:border-primary/50">
        <Search className="w-5 h-5 text-muted-foreground flex-shrink-0" />
        <input value={value} onChange={event => onChange(event.target.value)} autoFocus
          placeholder="Rechercher des posts, profils, hashtags"
          className="flex-1 min-w-0 bg-transparent outline-none text-[16px] text-foreground placeholder:text-muted-foreground/60" />
        {value && <button onClick={() => onChange('')} className="p-1 text-muted-foreground"><X className="w-4 h-4" /></button>}
      </div>
    </div>
  );
}