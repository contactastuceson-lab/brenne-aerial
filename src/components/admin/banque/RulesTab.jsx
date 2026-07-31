import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { SlidersHorizontal, Loader2, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

export default function RulesTab() {
  const [rules, setRules] = useState({ min_transfer: 0, max_transfer: 0, fee_percent: 0, daily_max_count: 0, daily_max_amount: 0 });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await base44.functions.invoke('adminBanque', { action: 'get_rules' });
        if (res.data?.rules) setRules(res.data.rules);
      } catch {}
      setLoading(false);
    })();
  }, []);

  const save = async () => {
    setSaving(true);
    try {
      const res = await base44.functions.invoke('adminBanque', { action: 'set_rules', rules });
      if (res.data?.error) { toast.error(res.data.error); return; }
      toast.success('Règles enregistrées');
    } catch { toast.error('Erreur'); }
    setSaving(false);
  };

  if (loading) return <div className="flex justify-center py-10"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>;

  const fields = [
    { key: 'min_transfer', label: 'Montant minimum par virement', hint: '0 = aucun minimum' },
    { key: 'max_transfer', label: 'Montant maximum par virement', hint: '0 = aucun plafond' },
    { key: 'fee_percent', label: 'Frais de transaction (%)', hint: '0 à 100, déduit du montant reçu' },
    { key: 'daily_max_count', label: 'Nombre max de virements / 24h', hint: '0 = illimité' },
    { key: 'daily_max_amount', label: 'Montant max cumulé / 24h', hint: '0 = illimité' },
  ];

  return (
    <div className="max-w-md space-y-4">
      <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-primary" />
          <p className="font-grotesk font-semibold text-sm">Règles bancaires</p>
        </div>
        <p className="font-inter text-xs text-muted-foreground">Ces règles s'appliquent à tous les virements P2P entre utilisateurs.</p>
        <div className="space-y-3">
          {fields.map(f => (
            <div key={f.key}>
              <label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground/60">{f.label}</label>
              <Input type="number" value={rules[f.key]} onChange={e => setRules({ ...rules, [f.key]: Number(e.target.value) || 0 })} className="mt-1 text-sm" />
              <p className="font-mono text-[9px] text-muted-foreground/50 mt-0.5">{f.hint}</p>
            </div>
          ))}
        </div>
        <Button onClick={save} disabled={saving} className="w-full gap-2">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Enregistrer
        </Button>
      </div>
    </div>
  );
}