import { Lightbulb, Info, AlertTriangle, CheckCircle2, Sparkles } from 'lucide-react';

const META = {
  tip: { icon: Lightbulb, color: '#f59e0b', bg: 'rgba(245,158,11,0.08)', label: 'Astuce' },
  note: { icon: Info, color: '#38aadc', bg: 'rgba(56,170,220,0.08)', label: 'Note' },
  warning: { icon: AlertTriangle, color: '#fb7185', bg: 'rgba(251,113,133,0.08)', label: 'Attention' },
  success: { icon: CheckCircle2, color: '#1dd8b4', bg: 'rgba(29,216,180,0.08)', label: 'Bon à savoir' },
  info: { icon: Sparkles, color: '#a78bfa', bg: 'rgba(167,139,250,0.08)', label: 'Info' },
};

export default function DocCallout({ callout }) {
  const m = META[callout.kind] || META.note;
  const Icon = m.icon;
  return (
    <div
      className="mt-4 rounded-xl border p-4 flex items-start gap-3"
      style={{ borderColor: `${m.color}33`, background: m.bg }}
    >
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{ background: `${m.color}22`, color: m.color }}
      >
        <Icon className="w-4 h-4" />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-bold mb-1" style={{ color: m.color }}>
          {callout.title || m.label}
        </p>
        <p className="text-sm text-foreground/85 leading-relaxed">{callout.text}</p>
      </div>
    </div>
  );
}