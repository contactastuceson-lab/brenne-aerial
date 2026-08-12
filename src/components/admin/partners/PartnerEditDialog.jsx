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
import PartnerLevelMark from '@/components/ui/PartnerLevelMark';
import PartnerBadgeMark from '@/components/ui/PartnerBadgeMark';

const STATUS_OPTIONS = [
  { value: 'pending', label: 'En attente' },
  { value: 'approved', label: 'Approuvé' },
  { value: 'suspended', label: 'Suspendu' },
  { value: 'refused', label: 'Refusé' },
];
const LEVEL_OPTIONS = [
  { value: 'partner', label: 'Partenaire' },
  { value: 'certified', label: 'Partenaire Certifié' },
  { value: 'premium', label: 'Partenaire Premium' },
  { value: 'gold', label: 'Partenaire Gold' },
];

function slugify(s) {
  return (s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export default function PartnerEditDialog({ open, partner, badges = [], onClose, onSaved }) {
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [specialtyInput, setSpecialtyInput] = useState('');

  useEffect(() => {
    if (partner) {
      setForm({ ...partner, specialties: partner.specialties || [], badges: partner.badges || [] });
    } else {
      setForm({
        name: '', slug: '', logo_url: '', banner_url: '', short_description: '', long_description: '',
        website: '', email: '', phone: '', city: '', country: 'France', specialties: [],
        status: 'pending', partnership_level: 'partner', badges: [], order: 0,
        is_featured: false, is_recommended: false, starts_at: '', ends_at: '',
        social_twitter: '', social_instagram: '', social_linkedin: '', social_facebook: '',
      });
    }
  }, [partner, open]);

  if (!form) return null;

  const update = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const addSpecialty = () => {
    const t = specialtyInput.trim();
    if (!t) return;
    if (!form.specialties.includes(t)) update('specialties', [...form.specialties, t]);
    setSpecialtyInput('');
  };

  const toggleBadge = (id) => {
    update('badges', form.badges.includes(id) ? form.badges.filter(b => b !== id) : [...form.badges, id]);
  };

  const handleSave = async () => {
    if (!form.name?.trim()) { toast.error('Le nom est requis'); return; }
    setSaving(true);
    try {
      const data = { ...form, slug: form.slug || slugify(form.name) };
      if (partner?.id) {
        await base44.entities.Partner.update(partner.id, data);
        toast.success('Partenaire modifié');
      } else {
        await base44.entities.Partner.create(data);
        toast.success('Partenaire créé');
      }
      onSaved?.();
      onClose();
    } catch { toast.error('Erreur lors de la sauvegarde'); }
    finally { setSaving(false); }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-card border-border">
        <DialogHeader>
          <DialogTitle>{partner?.id ? 'Modifier le partenaire' : 'Nouveau partenaire'}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Nom *</Label>
              <Input value={form.name} onChange={e => update('name', e.target.value)} className="mt-1" />
            </div>
            <div>
              <Label className="text-xs">Slug (auto si vide)</Label>
              <Input value={form.slug} onChange={e => update('slug', e.target.value)} placeholder="auto" className="mt-1" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Logo (URL)</Label>
              <Input value={form.logo_url} onChange={e => update('logo_url', e.target.value)} placeholder="https://..." className="mt-1" />
            </div>
            <div>
              <Label className="text-xs">Bannière (URL)</Label>
              <Input value={form.banner_url} onChange={e => update('banner_url', e.target.value)} placeholder="https://..." className="mt-1" />
            </div>
          </div>

          <div>
            <Label className="text-xs">Description courte</Label>
            <Textarea value={form.short_description} onChange={e => update('short_description', e.target.value)} rows={2} className="mt-1" />
          </div>
          <div>
            <Label className="text-xs">Description longue</Label>
            <Textarea value={form.long_description} onChange={e => update('long_description', e.target.value)} rows={4} className="mt-1" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Site web</Label>
              <Input value={form.website} onChange={e => update('website', e.target.value)} className="mt-1" />
            </div>
            <div>
              <Label className="text-xs">Email</Label>
              <Input value={form.email} onChange={e => update('email', e.target.value)} className="mt-1" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label className="text-xs">Téléphone</Label>
              <Input value={form.phone} onChange={e => update('phone', e.target.value)} className="mt-1" />
            </div>
            <div>
              <Label className="text-xs">Ville</Label>
              <Input value={form.city} onChange={e => update('city', e.target.value)} className="mt-1" />
            </div>
            <div>
              <Label className="text-xs">Pays</Label>
              <Input value={form.country} onChange={e => update('country', e.target.value)} className="mt-1" />
            </div>
          </div>

          <div>
            <Label className="text-xs">Spécialités</Label>
            <div className="flex gap-2 mt-1">
              <Input value={specialtyInput} onChange={e => setSpecialtyInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addSpecialty(); } }} placeholder="Appuyez sur Entrée" />
              <Button variant="outline" onClick={addSpecialty}>Ajouter</Button>
            </div>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {form.specialties.map(s => (
                <span key={s} className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-primary/10 text-primary border border-primary/20">
                  {s}
                  <button onClick={() => update('specialties', form.specialties.filter(x => x !== s))}><X className="w-3 h-3" /></button>
                </span>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Statut</Label>
              <Select value={form.status} onValueChange={v => update('status', v)}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>{STATUS_OPTIONS.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Niveau</Label>
              <Select value={form.partnership_level} onValueChange={v => update('partnership_level', v)}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>{LEVEL_OPTIONS.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>

          {/* Aperçu niveau + badges */}
          <div className="flex items-center gap-3 rounded-xl border border-border p-3 bg-secondary/20">
            <PartnerLevelMark level={form.partnership_level} size="32px" marginLeft={0} />
            {form.badges.length > 0 ? (
              form.badges.map(bid => {
                const b = badges.find(x => x.id === bid);
                return b ? <PartnerBadgeMark key={bid} badge={b} size="28px" marginLeft={0} /> : null;
              })
            ) : (
              <span className="text-xs text-muted-foreground">Aucun badge sélectionné</span>
            )}
            <span className="text-xs text-muted-foreground ml-auto">Aperçu</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Ordre</Label>
              <Input type="number" value={form.order} onChange={e => update('order', Number(e.target.value))} className="mt-1" />
            </div>
            <div>
              <Label className="text-xs">Date début</Label>
              <Input type="datetime-local" value={form.starts_at ? form.starts_at.slice(0, 16) : ''} onChange={e => update('starts_at', e.target.value ? new Date(e.target.value).toISOString() : '')} className="mt-1" />
            </div>
          </div>

          <div>
            <Label className="text-xs">Badges</Label>
            <div className="flex flex-wrap gap-1.5 mt-1">
              {badges.length === 0 && <p className="text-xs text-muted-foreground">Aucun badge créé. Créez-en dans l'onglet Badges.</p>}
              {badges.map(b => (
                <button key={b.id} onClick={() => toggleBadge(b.id)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs border transition-colors ${form.badges.includes(b.id) ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground hover:bg-muted'}`}>
                  <PartnerBadgeMark badge={b} size="14px" showIcon={true} marginLeft={0} /> {b.name}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2">
              <Switch checked={form.is_featured} onCheckedChange={v => update('is_featured', v)} />
              <span className="text-sm">À la une</span>
            </label>
            <label className="flex items-center gap-2">
              <Switch checked={form.is_recommended} onCheckedChange={v => update('is_recommended', v)} />
              <span className="text-sm">Recommandé</span>
            </label>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-border">
          <Button variant="outline" onClick={onClose}><X className="w-3.5 h-3.5 mr-1.5" /> Annuler</Button>
          <Button onClick={handleSave} disabled={saving}><Save className="w-3.5 h-3.5 mr-1.5" /> {saving ? '...' : 'Sauvegarder'}</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}