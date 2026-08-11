import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, GripVertical, Eye, Save, X } from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { toast } from 'sonner';
import WhatsNewModal from '@/components/whatsnew/WhatsNewModal';

const CATEGORIES = [
  { value: 'feature', label: 'Nouveauté', icon: '✨' },
  { value: 'improvement', label: 'Amélioration', icon: '⚡' },
  { value: 'fix', label: 'Correction', icon: '🔧' },
  { value: 'announcement', label: 'Annonce', icon: '📢' },
];
const ROLES = ['user', 'admin', 'owner', 'pdg_adjoint', 'conseil_admin', 'event_manager', 'business', 'enterprise'];

const ACCENT_PRESETS = ['#38aadc', '#22c55e', '#a855f7', '#f59e0b', '#ef4444', '#ec4899', '#6366f1'];

function emptySection() {
  return { id: crypto.randomUUID(), icon: '✨', title: '', description: '', category: 'feature' };
}

export default function WhatsNewEditor({ open, announcement, onClose, onSave }) {
  const [previewOpen, setPreviewOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  function makeEmpty() {
    return { title: '', version: '', status: 'draft', header_image_url: '', accent_color: '#38aadc', intro: '', sections: [emptySection()], target_roles: [], start_date: '', end_date: '', custom_button_text: '', custom_button_url: '', force_display: false, order: 0 };
  }

  const [form, setForm] = useState(announcement || makeEmpty());

  // Sync when announcement changes (open a different item)
  useEffect(() => {
    if (announcement) setForm(announcement);
  }, [announcement]);

  const update = (field, value) => setForm(f => ({ ...f, [field]: value }));

  const addSection = () => update('sections', [...(form.sections || []), emptySection()]);
  const updateSection = (idx, field, value) => {
    const sections = [...form.sections];
    sections[idx] = { ...sections[idx], [field]: value };
    update('sections', sections);
  };
  const removeSection = (idx) => update('sections', form.sections.filter((_, i) => i !== idx));

  const onDragEnd = (result) => {
    if (!result.destination) return;
    const sections = [...form.sections];
    const [moved] = sections.splice(result.source.index, 1);
    sections.splice(result.destination.index, 0, moved);
    update('sections', sections);
  };

  const toggleRole = (role) => {
    const roles = form.target_roles || [];
    update('target_roles', roles.includes(role) ? roles.filter(r => r !== role) : [...roles, role]);
  };

  const handleSave = async () => {
    if (!form.title.trim()) { toast.error('Le titre est requis'); return; }
    setSaving(true);
    try {
      const data = {
        ...form,
        sections: (form.sections || []).filter(s => s.title.trim()),
        published_at: form.status === 'published' && !form.published_at ? new Date().toISOString() : form.published_at,
      };
      await onSave(data);
      onClose();
    } catch {
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-card border-border">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              {announcement?.id ? 'Modifier l\'annonce' : 'Nouvelle annonce'}
              <Button variant="outline" size="sm" onClick={() => setPreviewOpen(true)}>
                <Eye className="w-3.5 h-3.5 mr-1.5" /> Aperçu
              </Button>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Basic info */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Titre *</Label>
                <Input value={form.title} onChange={e => update('title', e.target.value)} placeholder="Ex: Nouveautés Août 2026" className="mt-1" />
              </div>
              <div>
                <Label className="text-xs">Version / Date</Label>
                <Input value={form.version} onChange={e => update('version', e.target.value)} placeholder="v2.4 ou Août 2026" className="mt-1" />
              </div>
            </div>

            <div>
              <Label className="text-xs">Texte d'introduction</Label>
              <Textarea value={form.intro} onChange={e => update('intro', e.target.value)} placeholder="Découvrez les dernières améliorations..." className="mt-1" rows={2} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Statut</Label>
                <Select value={form.status} onValueChange={v => update('status', v)}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Brouillon</SelectItem>
                    <SelectItem value="published">Publiée</SelectItem>
                    <SelectItem value="archived">Archivée</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Ordre</Label>
                <Input type="number" value={form.order} onChange={e => update('order', Number(e.target.value))} className="mt-1" />
              </div>
            </div>

            {/* Header image + accent */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Image d'en-tête (URL)</Label>
                <Input value={form.header_image_url} onChange={e => update('header_image_url', e.target.value)} placeholder="https://..." className="mt-1" />
              </div>
              <div>
                <Label className="text-xs">Couleur d'accent</Label>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  {ACCENT_PRESETS.map(c => (
                    <button key={c} onClick={() => update('accent_color', c)} className="w-7 h-7 rounded-full border-2 transition-transform hover:scale-110" style={{ background: c, borderColor: form.accent_color === c ? '#fff' : 'transparent' }} />
                  ))}
                  <input type="color" value={form.accent_color} onChange={e => update('accent_color', e.target.value)} className="w-7 h-7 rounded cursor-pointer bg-transparent border border-border" />
                </div>
              </div>
            </div>

            {/* Sections */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label className="text-xs font-semibold">Nouveautés ({form.sections?.length || 0})</Label>
                <Button variant="outline" size="sm" onClick={addSection}><Plus className="w-3.5 h-3.5 mr-1" /> Ajouter</Button>
              </div>
              <DragDropContext onDragEnd={onDragEnd}>
                <Droppable droppableId="sections">
                  {(provided) => (
                    <div ref={provided.innerRef} {...provided.droppableProps} className="space-y-2">
                      {(form.sections || []).map((section, idx) => (
                        <Draggable key={section.id} draggableId={section.id} index={idx}>
                          {(p) => (
                            <div ref={p.innerRef} {...p.draggableProps} className="rounded-xl border border-border bg-secondary/30 p-3">
                              <div className="flex items-start gap-2">
                                <button {...p.dragHandleProps} className="mt-1.5 text-muted-foreground cursor-grab hover:text-foreground"><GripVertical className="w-4 h-4" /></button>
                                <div className="flex-1 space-y-2">
                                  <div className="flex items-center gap-2">
                                    <Input value={section.icon} onChange={e => updateSection(idx, 'icon', e.target.value)} placeholder="✨" className="w-14 text-center text-lg" maxLength={4} />
                                    <Select value={section.category} onValueChange={v => updateSection(idx, 'category', v)}>
                                      <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
                                      <SelectContent>
                                        {CATEGORIES.map(c => <SelectItem key={c.value} value={c.value}>{c.icon} {c.label}</SelectItem>)}
                                      </SelectContent>
                                    </Select>
                                    <button onClick={() => removeSection(idx)} className="ml-auto p-1.5 text-destructive hover:bg-destructive/10 rounded-lg"><Trash2 className="w-3.5 h-3.5" /></button>
                                  </div>
                                  <Input value={section.title} onChange={e => updateSection(idx, 'title', e.target.value)} placeholder="Titre court" />
                                  <Textarea value={section.description} onChange={e => updateSection(idx, 'description', e.target.value)} placeholder="Description" rows={2} />
                                </div>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
            </div>

            {/* Targeting */}
            <div>
              <Label className="text-xs font-semibold">Ciblage par rôle</Label>
              <p className="text-[10px] text-muted-foreground mb-2">Laissez vide pour tous les utilisateurs</p>
              <div className="flex flex-wrap gap-1.5">
                {ROLES.map(role => (
                  <button
                    key={role}
                    onClick={() => toggleRole(role)}
                    className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${(form.target_roles || []).includes(role) ? 'bg-primary text-primary-foreground border-primary' : 'border-border text-muted-foreground hover:bg-muted'}`}
                  >
                    {role}
                  </button>
                ))}
              </div>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Début d'affichage</Label>
                <Input type="datetime-local" value={form.start_date ? form.start_date.slice(0, 16) : ''} onChange={e => update('start_date', e.target.value ? new Date(e.target.value).toISOString() : '')} className="mt-1" />
              </div>
              <div>
                <Label className="text-xs">Fin d'affichage</Label>
                <Input type="datetime-local" value={form.end_date ? form.end_date.slice(0, 16) : ''} onChange={e => update('end_date', e.target.value ? new Date(e.target.value).toISOString() : '')} className="mt-1" />
              </div>
            </div>

            {/* Custom button */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Bouton perso (texte)</Label>
                <Input value={form.custom_button_text} onChange={e => update('custom_button_text', e.target.value)} placeholder="En savoir plus" className="mt-1" />
              </div>
              <div>
                <Label className="text-xs">Bouton perso (URL)</Label>
                <Input value={form.custom_button_url} onChange={e => update('custom_button_url', e.target.value)} placeholder="https://..." className="mt-1" />
              </div>
            </div>

            {/* Force display */}
            <div className="flex items-center justify-between rounded-xl border border-border p-3">
              <div>
                <Label className="text-sm font-medium">Forcer l'affichage</Label>
                <p className="text-[10px] text-muted-foreground">Affiche même si l'utilisateur a déjà vu l'annonce</p>
              </div>
              <Switch checked={form.force_display} onCheckedChange={v => update('force_display', v)} />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
            <Button variant="outline" onClick={onClose}><X className="w-3.5 h-3.5 mr-1.5" /> Annuler</Button>
            <Button onClick={handleSave} disabled={saving}><Save className="w-3.5 h-3.5 mr-1.5" /> {saving ? 'Sauvegarde...' : 'Sauvegarder'}</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Live preview */}
      <WhatsNewModal announcement={form} open={previewOpen} onClose={() => setPreviewOpen(false)} preview />
    </>
  );
}