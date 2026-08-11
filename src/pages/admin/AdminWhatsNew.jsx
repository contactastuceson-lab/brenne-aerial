import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Pencil, Copy, Trash2, Eye, Archive, RotateCcw, Send, Sparkles, BarChart2 } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import WhatsNewEditor from '@/components/admin/whatsnew/WhatsNewEditor';
import WhatsNewModal from '@/components/whatsnew/WhatsNewModal';

const STATUS_CONFIG = {
  draft: { label: 'Brouillon', className: 'bg-muted text-muted-foreground' },
  published: { label: 'Publiée', className: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' },
  archived: { label: 'Archivée', className: 'bg-zinc-500/15 text-zinc-400' },
};

export default function AdminWhatsNew() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [previewItem, setPreviewItem] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const all = await base44.entities.WhatsNew.list('-published_at', 100);
      setItems(all);
    } catch { toast.error('Erreur de chargement'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleNew = () => { setEditing(null); setEditorOpen(true); };
  const handleEdit = (item) => { setEditing(item); setEditorOpen(true); };

  const handleSave = async (data) => {
    if (editing?.id) {
      await base44.entities.WhatsNew.update(editing.id, data);
      toast.success('Annonce modifiée');
    } else {
      await base44.entities.WhatsNew.create(data);
      toast.success('Annonce créée');
    }
    load();
  };

  const handlePublish = async (item) => {
    await base44.entities.WhatsNew.update(item.id, { status: 'published', published_at: item.published_at || new Date().toISOString() });
    toast.success('Annonce publiée');
    load();
  };

  const handleUnpublish = async (item) => {
    await base44.entities.WhatsNew.update(item.id, { status: 'draft' });
    toast.success('Annonce dépubliée');
    load();
  };

  const handleArchive = async (item) => {
    await base44.entities.WhatsNew.update(item.id, { status: 'archived' });
    toast.success('Annonce archivée');
    load();
  };

  const handleRestore = async (item) => {
    await base44.entities.WhatsNew.update(item.id, { status: 'draft' });
    toast.success('Annonce restaurée');
    load();
  };

  const handleDuplicate = async (item) => {
    const { id, created_date, updated_date, created_by_id, view_count, dismiss_count, ...rest } = item;
    await base44.entities.WhatsNew.create({ ...rest, title: `${item.title} (copie)`, status: 'draft', published_at: null, view_count: 0, dismiss_count: 0 });
    toast.success('Annonce dupliquée');
    load();
  };

  const handleDelete = async (item) => {
    if (!confirm('Supprimer définitivement cette annonce ?')) return;
    await base44.entities.WhatsNew.delete(item.id);
    toast.success('Annonce supprimée');
    load();
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-grotesk font-bold text-2xl flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-primary" /> Nouveautés (What's New)
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Gérez les annonces de nouveautés affichées aux utilisateurs</p>
        </div>
        <Button onClick={handleNew}><Plus className="w-4 h-4 mr-1.5" /> Créer une annonce</Button>
      </div>

      {/* List */}
      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Chargement...</div>
      ) : items.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <Sparkles className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>Aucune annonce pour l'instant</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {items.map(item => {
            const status = STATUS_CONFIG[item.status] || STATUS_CONFIG.draft;
            return (
              <div key={item.id} className="rounded-xl border border-border bg-card p-4 flex items-start gap-4">
                {/* Accent bar */}
                <div className="w-1 self-stretch rounded-full flex-shrink-0" style={{ background: item.accent_color || '#38aadc' }} />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h3 className="font-semibold text-foreground">{item.title}</h3>
                    {item.version && <span className="text-xs font-mono text-muted-foreground">{item.version}</span>}
                    <Badge className={status.className}>{status.label}</Badge>
                    {item.force_display && <Badge className="bg-amber-500/15 text-amber-400">Forcé</Badge>}
                  </div>
                  {item.intro && <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{item.intro}</p>}
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span>{item.sections?.length || 0} section(s)</span>
                    {(item.target_roles?.length || 0) > 0 && <span>· {item.target_roles.join(', ')}</span>}
                    {item.published_at && <span>· {format(new Date(item.published_at), 'd MMM yyyy', { locale: fr })}</span>}
                    <span className="flex items-center gap-1"><BarChart2 className="w-3 h-3" /> {item.view_count || 0} vues · {item.dismiss_count || 0} fermetures</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 flex-shrink-0">
                  <Button variant="ghost" size="sm" onClick={() => setPreviewItem(item)} title="Aperçu"><Eye className="w-4 h-4" /></Button>
                  <Button variant="ghost" size="sm" onClick={() => handleEdit(item)} title="Modifier"><Pencil className="w-4 h-4" /></Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDuplicate(item)} title="Dupliquer"><Copy className="w-4 h-4" /></Button>
                  {item.status === 'draft' && (
                    <Button variant="ghost" size="sm" onClick={() => handlePublish(item)} title="Publier" className="text-emerald-400"><Send className="w-4 h-4" /></Button>
                  )}
                  {item.status === 'published' && (
                    <Button variant="ghost" size="sm" onClick={() => handleUnpublish(item)} title="Dépublier"><RotateCcw className="w-4 h-4" /></Button>
                  )}
                  {item.status !== 'archived' && (
                    <Button variant="ghost" size="sm" onClick={() => handleArchive(item)} title="Archiver"><Archive className="w-4 h-4" /></Button>
                  )}
                  {item.status === 'archived' && (
                    <Button variant="ghost" size="sm" onClick={() => handleRestore(item)} title="Restaurer"><RotateCcw className="w-4 h-4" /></Button>
                  )}
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(item)} title="Supprimer" className="text-destructive"><Trash2 className="w-4 h-4" /></Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Editor */}
      {editorOpen && (
        <WhatsNewEditor open={editorOpen} announcement={editing} onClose={() => setEditorOpen(false)} onSave={handleSave} />
      )}

      {/* Preview */}
      <WhatsNewModal announcement={previewItem} open={!!previewItem} onClose={() => setPreviewItem(null)} preview />
    </div>
  );
}