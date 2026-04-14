import React from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';

const OPTIONS = [
  { value: 'light', label: 'Clair', icon: Sun },
  { value: 'dark', label: 'Sombre', icon: Moon },
  { value: 'system', label: 'Système', icon: Monitor },
];

export default function ThemeSelector() {
  const { theme, setTheme } = useTheme();

  return (
    <div>
      <label className="font-inter text-xs text-muted-foreground mb-2 block">Thème d'affichage</label>
      <div className="grid grid-cols-3 gap-2">
        {OPTIONS.map(({ value, label, icon: Icon }) => (
          <button
            key={value}
            onClick={() => setTheme(value)}
            className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition-all ${
              theme === value
                ? 'bg-primary/10 border-primary text-primary'
                : 'bg-secondary border-border text-muted-foreground hover:border-primary/40 hover:text-foreground'
            }`}
          >
            <Icon className="w-5 h-5" />
            <span className="font-inter text-xs font-medium">{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}