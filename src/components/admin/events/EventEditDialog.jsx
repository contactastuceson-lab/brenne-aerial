import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const CATEGORIES = [
  { value: 'conference', label: 'Conférence' },
  { value: 'workshop', label: 'Atelier' },
  { value: 'meetup', label: 'Meetup' },
  { value: 'concert', label: 'Concert' },
  { value: 'hackathon', label: 'Hackathon' },
  { value: 'webinar', label: 'Webinaire' },
  { value: 'expo', label: 'Expo' },
  { value: 'sport', label: 'Sport' },
  { value: 'party', label: 'Soirée' },
  { value: 'other', label: 'Autre' },
];
const FORMATS = [
  { value: 'physical', label: 'Présentiel' },
  { value: 'online', label: 'En ligne' },
  { value: 'hybrid', label: 'Hybride' },
];
const STATUSES = [
  { value: 'upcoming', label: 'À venir' },
  { value: 'live', label: 'En direct' },
  { value: 'ended', label: 'Terminé' },
  { value: 'cancelled', label: 'Annulé' },
  { value: 'draft', label: 'Brouillon' },
];

function toLocalInput(iso) {
  if (!iso) return '';
  try {
    const d = new Date(iso);
    const pad = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  } catch { return ''; }
}

export default function EventEditDialog({ open, onClose, event, onSaved }) {
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setForm(event ? {
        ...event,
        start_date: toLocalInput(event.start_date),
        end_date: toLocalInput(event.end_date),
        tags: (event.tags || []).join(', '),
      } : {
        title: '', description: '', long_description: '', category: 'other', format: 'physical',
        start_date: '', end_date: '', location: '', address: '', city: '', online_link: '',
        image_url: '', capacity: 0, price_credits: 0, is_featured: false, status: 'upcoming',
        tags: '', website_url: '', organizer_name: 'EZA',
      });
    }
  }, [open, event]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async () => {
    if (!form.title) return;
    setSaving(true);
    try {
      const payload = {
        ...form,
        capacity: Number(form.capacity) || 0,
        price_credits: Number(form.price_credits) || 0,
        start_date: form.start_date ? new Date(form.start_date).toISOString() : null,
        end_date: form.end_date ? new Date(form.end_date).toISOString() : null,
        tags: (form.tags || '').split(',').map((t) => t.trim()).filter(Boolean),
        is_free: (Number(form.price_credits) || 0) === 0,
      };
      delete payload.registered_ids; delete payload.attendees_count;
      delete payload.cancel_reason; delete payload.cancelled_at;
      if (event?.id) {
        await base44.entities.Event.update(event.id, payload);
      } else {
        await base44.entities.Event.create(payload);
      }
      onSaved && onSaved();
      onClose();
    } catch (e) {
      // bubble
    }
    setSaving(false);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{event ? 'Modifier l\'événement' : 'Créer un événement'}</DialogTitle>
        </DialogHeader>

        <div className="space-y-3 py-2">
          <div className="space-y-1">
            <Label>Titre *</Label>
            <Input value={form.title || ''} onChange={(e) => set('title', e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>Catégorie</Label>
              <select value={form.category} onChange={(e) => set('category', e.target.value)}
                className="w-full h-9 rounded-md border border-input bg-transparent px-3 text-sm">
                {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <Label>Format</Label>
              <select value={form.format} onChange={(e) => set('format', e.target.value)}
                className="w-full h-9 rounded-md border border-input bg-transparent px-3 text-sm">
                {FORMATS.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>Début</Label>
              <Input type="datetime-local" value={form.start_date || ''} onChange={(e) => set('start_date', e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>Fin</Label>
              <Input type="datetime-local" value={form.end_date || ''} onChange={(e) => set('end_date', e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>Lieu</Label>
              <Input value={form.location || ''} onChange={(e) => set('location', e.target.value)} placeholder="Nom du lieu" />
            </div>
            <div className="space-y-1">
              <Label>Ville</Label>
              <Input value={form.city || ''} onChange={(e) => set('city', e.target.value)} />
            </div>
          </div>
          <div className="space-y-1">
            <Label>Adresse</Label>
            <Input value={form.address || ''} onChange={(e) => set('address', e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label>Image (URL)</Label>
            <Input value={form.image_url || ''} onChange={(e) => set('image_url', e.target.value)} placeholder="https://…" />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1">
              <Label>Capacité (0 = ∞)</Label>
              <Input type="number" value={form.capacity ?? 0} onChange={(e) => set('capacity', e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>Prix (crédits Eza)</Label>
              <Input type="number" value={form.price_credits ?? 0} onChange={(e) => set('price_credits', e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>Statut</Label>
              <select value={form.status} onChange={(e) => set('status', e.target.value)}
                className="w-full h-9 rounded-md border border-input bg-transparent px-3 text-sm">
                {STATUSES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
          </div>
          <div className="space-y-1">
            <Label>Description courte</Label>
            <Textarea value={form.description || ''} onChange={(e) => set('description', e.target.value)} rows={2} />
          </div>
          <div className="space-y-1">
            <Label>Description longue</Label>
            <Textarea value={form.long_description || ''} onChange={(e) => set('long_description', e.target.value)} rows={4} />
          </div>
          <div className="space-y-1">
            <Label>Tags (séparés par virgules)</Label>
            <Input value={form.tags || ''} onChange={(e) => set('tags', e.target.value)} placeholder="summit, networking…" />
          </div>
          <div className="space-y-1">
            <Label>Site / billetterie (URL)</Label>
            <Input value={form.website_url || ''} onChange={(e) => set('website_url', e.target.value)} />
          </div>
          <div className="flex items-center gap-2 pt-1">
            <Switch checked={!!form.is_featured} onCheckedChange={(v) => set('is_featured', v)} id="feat" />
            <Label htmlFor="feat">Mettre à la une</Label>
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose} disabled={saving}>Annuler</Button>
          <Button onClick={submit} disabled={saving}>
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            {event ? 'Enregistrer' : 'Créer'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}