import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X, Save } from 'lucide-react';
import { toast } from 'sonner';
import { base44 } from '@/api/base44Client';
import PartnerBadgeMark from '@/components/ui/PartnerBadgeMark';

const COLORS = ['#38aadc', '#22c55e', '#f59e0b', '#ef4444', '#a855f7', '#ec4899', '#6366f1', '#14b8a6'];
const FIELDS = [
  { value: 'rating_avg', label: 'Note moyenne' },
  { value: 'view_count', label: 'Vues du profil' },
  { value: 'contact_count', label: 'Nombre de contacts' },
  { value: 'order', label: 'Ordre d\'affichage' },
];
const OPERATORS = [
  { value: 'gte', label: '≥ (supérieur ou égal)' },
  { value: 'lte', label: '≤ (inférieur ou égal)' },
  { value: 'gt', label: '> (strictement supérieur)' },
  { value: 'lt', label: '< (strictement inférieur)' },
  { value: 'eq', label: '= (égal)' },
];

export default function BadgeEditDialog({ open, badge, onClose, onSaved }) {
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (badge) setForm({ ...badge, auto_rule: badge.auto_rule || {} });
    else setForm({ name: '', description: '', icon: '🏆', color: '#38aadc', image_url: '', is_automatic: false, auto_rule: {}, order: 0 });
  }, [badge, open]);

  if (!form) return null;
  const update = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const updateRule = (k, v) => setForm(f => ({ ...f, auto_rule: { ...f.auto_rule, [k]: v } }));

  const handleSave = async () => {
    if (!form.name?.trim()) { toast.error('Le nom est requis'); return; }
    setSaving(true);
    try {
      if (badge?.id) {
        await base44.entities.PartnerBadge.update(badge.id, form);
        toast.success('Badge modifié');
      } else {
        await base44.entities.PartnerBadge.create(form);
        toast.success('Badge créé');
      }
      onSaved?.();
      onClose();
    } catch { toast.error('Erreur'); }
    finally { setSaving(false); }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg bg-card border-border">
        <DialogHeader><DialogTitle>{badge?.id ? 'Modifier le badge' : 'Nouveau badge'}</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div>
            <Label className="text-xs">Nom *</Label>
            <Input value={form.name} onChange={e => update('name', e.target.value)} placeholder="Top Partenaire" className="mt-1" />
          </div>
          <div>
            <Label className="text-xs">Description</Label>
            <Textarea value={form.description} onChange={e => update('description', e.target.value)} rows={2} className="mt-1" />
          </div>

          {/* Live preview */}
          <div className="flex items-center gap-3 rounded-xl border border-border p-3 bg-secondary/20">
            <PartnerBadgeMark badge={form} size="32px" showIcon={true} marginLeft={0} />
            <div>
              <p className="text-xs font-semibold text-muted-foreground">Aperçu</p>
              <p className="text-sm font-medium text-foreground">{form.name || 'Nom du badge'}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Icône (emoji)</Label>
              <Input value={form.icon} onChange={e => update('icon', e.target.value)} className="mt-1 text-center text-xl" maxLength={4} />
            </div>
            <div>
              <Label className="text-xs">Couleur</Label>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                {COLORS.map(c => (
                  <button key={c} onClick={() => update('color', c)} className="w-7 h-7 rounded-full border-2 transition-transform hover:scale-110" style={{ background: c, borderColor: form.color === c ? '#fff' : 'transparent' }} />
                ))}
                <input type="color" value={form.color} onChange={e => update('color', e.target.value)} className="w-7 h-7 rounded cursor-pointer bg-transparent border border-border" />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between rounded-xl border border-border p-3">
            <div>
              <Label className="text-sm font-medium">Badge automatique</Label>
              <p className="text-[10px] text-muted-foreground">Attribué automatiquement selon une règle</p>
            </div>
            <Switch checked={form.is_automatic} onCheckedChange={v => update('is_automatic', v)} />
          </div>

          {form.is_automatic && (
            <div className="rounded-xl border border-border p-3 space-y-2">
              <p className="text-xs font-semibold text-muted-foreground">Règle d'attribution</p>
              <div className="grid grid-cols-3 gap-2">
                <Select value={form.auto_rule?.field || ''} onValueChange={v => updateRule('field', v)}>
                  <SelectTrigger><SelectValue placeholder="Champ" /></SelectTrigger>
                  <SelectContent>{FIELDS.map(f => <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>)}</SelectContent>
                </Select>
                <Select value={form.auto_rule?.operator || ''} onValueChange={v => updateRule('operator', v)}>
                  <SelectTrigger><SelectValue placeholder="Opér." /></SelectTrigger>
                  <SelectContent>{OPERATORS.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
                </Select>
                <Input type="number" value={form.auto_rule?.value || ''} onChange={e => updateRule('value', Number(e.target.value))} placeholder="Valeur" />
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-border">
          <Button variant="outline" onClick={onClose}><X className="w-3.5 h-3.5 mr-1.5" /> Annuler</Button>
          <Button onClick={handleSave} disabled={saving}><Save className="w-3.5 h-3.5 mr-1.5" /> {saving ? '...' : 'Sauvegarder'}</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}