import { useState } from 'react';
import { Plus, X, BarChart3, Clock } from 'lucide-react';

const DURATIONS = [
  { label: '30 min', hours: 0.5 },
  { label: '1 h', hours: 1 },
  { label: '6 h', hours: 6 },
  { label: '12 h', hours: 12 },
  { label: '1 jour', hours: 24 },
  { label: '3 jours', hours: 72 },
  { label: '1 semaine', hours: 168 },
];

export default function PollCreator({ poll, onChange, onRemove }) {
  const addOption = () => {
    if (poll.options.length >= 4) return;
    onChange({ ...poll, options: [...poll.options, { id: crypto.randomUUID(), text: '', votes: 0, voted_by: [] }] });
  };

  const removeOption = (id) => {
    if (poll.options.length <= 2) return;
    onChange({ ...poll, options: poll.options.filter(o => o.id !== id) });
  };

  const updateOption = (id, text) => {
    onChange({ ...poll, options: poll.options.map(o => o.id === id ? { ...o, text } : o) });
  };

  const setDuration = (hours) => {
    onChange({ ...poll, duration_hours: hours });
  };

  return (
    <div className="mt-3 rounded-2xl border border-primary/20 bg-primary/5 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-primary/10">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-primary" />
          <span className="font-grotesk font-bold text-sm text-primary">Sondage</span>
        </div>
        <button onClick={onRemove} className="p-1 rounded-full hover:bg-white/8 text-muted-foreground transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="px-4 py-3 space-y-2">
        {/* Options */}
        {poll.options.map((opt, i) => (
          <div key={opt.id} className="flex items-center gap-2">
            <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-xl border border-white/10 bg-white/3 focus-within:border-primary/40 transition-colors">
              <span className="text-xs font-mono text-muted-foreground/40 flex-shrink-0">{i + 1}</span>
              <input
                value={opt.text}
                onChange={e => updateOption(opt.id, e.target.value)}
                placeholder={`Option ${i + 1}${i < 2 ? ' *' : ''}`}
                maxLength={60}
                className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/35 outline-none"
              />
            </div>
            {poll.options.length > 2 && (
              <button onClick={() => removeOption(opt.id)}
                className="p-1.5 rounded-full hover:bg-white/8 text-muted-foreground/50 hover:text-destructive transition-colors">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        ))}

        {/* Add option */}
        {poll.options.length < 4 && (
          <button onClick={addOption}
            className="flex items-center gap-2 px-3 py-2 rounded-xl border border-dashed border-white/15 text-muted-foreground/50 hover:text-primary hover:border-primary/30 transition-colors w-full text-sm">
            <Plus className="w-3.5 h-3.5" />
            Ajouter une option
          </button>
        )}

        {/* Duration */}
        <div className="pt-1">
          <div className="flex items-center gap-1.5 mb-2">
            <Clock className="w-3.5 h-3.5 text-muted-foreground/50" />
            <span className="text-xs text-muted-foreground/50">Durée du sondage</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {DURATIONS.map(d => (
              <button key={d.hours} onClick={() => setDuration(d.hours)}
                className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
                  poll.duration_hours === d.hours
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-white/5 text-muted-foreground hover:bg-white/10'
                }`}>
                {d.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}