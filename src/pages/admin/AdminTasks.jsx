import { useState, useEffect, useCallback } from 'react';
import { DragDropContext, Droppable } from '@hello-pangea/dnd';
import { Plus, Loader2, ClipboardList, KanbanSquare } from 'lucide-react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { applySeoMeta } from '@/lib/seo';
import TaskCard from '@/components/tasks/TaskCard';
import CreateTaskDialog from '@/components/tasks/CreateTaskDialog';
import TaskDetailDialog from '@/components/tasks/TaskDetailDialog';

const COLUMNS = [
  { id: 'todo', label: 'À faire', accent: 'border-t-sky-400', dot: 'bg-sky-400', soft: 'text-sky-400' },
  { id: 'in_progress', label: 'En cours', accent: 'border-t-amber-400', dot: 'bg-amber-400', soft: 'text-amber-400' },
  { id: 'review', label: 'À valider', accent: 'border-t-violet-400', dot: 'bg-violet-400', soft: 'text-violet-400' },
  { id: 'done', label: 'Terminé', accent: 'border-t-emerald-400', dot: 'bg-emerald-400', soft: 'text-emerald-400' },
];

export default function AdminTasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [detail, setDetail] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const list = await base44.entities.Task.list('-created_date', 300);
      setTasks(list || []);
    } catch (e) {
      toast.error('Impossible de charger les tâches');
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    applySeoMeta({ title: 'Tâches — Admin Eza', description: 'Tableau Kanban de gestion des tâches' });
    load();
  }, [load]);

  const onDragEnd = async (result) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId) return;
    const task = tasks.find((t) => t.id === draggableId);
    if (!task) return;
    const newStatus = destination.droppableId;
    setTasks((prev) => prev.map((t) => (t.id === task.id ? { ...t, status: newStatus } : t)));
    try {
      await base44.entities.Task.update(task.id, { status: newStatus });
      toast.success(`Déplacé vers « ${COLUMNS.find((c) => c.id === newStatus)?.label} »`);
    } catch (e) {
      toast.error('Échec du déplacement');
      setTasks((prev) => prev.map((t) => (t.id === task.id ? { ...t, status: source.droppableId } : t)));
    }
  };

  const handleCreate = async (data) => {
    try {
      const created = await base44.entities.Task.create({
        title: data.title,
        description: data.description,
        status: 'todo',
      });
      setTasks((prev) => [created, ...prev]);
      toast.success('Tâche créée');
      setCreateOpen(false);
    } catch (e) {
      toast.error('Création échouée');
      throw e;
    }
  };

  const handleSaveDetail = async (id, data) => {
    try {
      await base44.entities.Task.update(id, data);
      setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...data } : t)));
      setDetail((d) => (d ? { ...d, ...data } : d));
      toast.success('Tâche mise à jour');
    } catch (e) {
      toast.error('Mise à jour échouée');
      throw e;
    }
  };

  const handleDelete = async (id) => {
    try {
      await base44.entities.Task.delete(id);
      setTasks((prev) => prev.filter((t) => t.id !== id));
      setDetail(null);
      toast.success('Tâche supprimée');
    } catch (e) {
      toast.error('Suppression échouée');
    }
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center sky-glow">
              <KanbanSquare className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="font-grotesk font-black text-2xl text-foreground">Tâches</h1>
              <p className="font-inter text-sm text-muted-foreground">
                Tableau de gestion des tâches — glissez les cartes pour changer le statut.
              </p>
            </div>
          </div>
          <button
            onClick={() => setCreateOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground font-grotesk font-bold text-sm hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
          >
            <Plus className="w-4 h-4" /> Ajouter une tâche
          </button>
        </div>
      </motion.div>

      {loading ? (
        <div className="flex items-center justify-center py-32">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : tasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 text-center">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-4">
            <ClipboardList className="w-8 h-8 text-primary" />
          </div>
          <p className="font-grotesk font-bold text-lg text-foreground mb-1">Aucune tâche pour l'instant</p>
          <p className="font-inter text-sm text-muted-foreground mb-5 max-w-sm">
            Créez votre première tâche pour alimenter le tableau Kanban.
          </p>
          <button
            onClick={() => setCreateOpen(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-grotesk font-bold text-sm hover:bg-primary/90 transition-all"
          >
            <Plus className="w-4 h-4" /> Créer une tâche
          </button>
        </div>
      ) : (
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pb-8">
            {COLUMNS.map((col) => {
              const items = tasks.filter((t) => (t.status || 'todo') === col.id);
              return (
                <div
                  key={col.id}
                  className={`flex flex-col rounded-2xl border border-border bg-card/40 backdrop-blur-sm overflow-hidden border-t-2 ${col.accent}`}
                >
                  <div className="flex items-center justify-between px-4 py-3 border-b border-border/60">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${col.dot}`} />
                      <h2 className="font-grotesk font-bold text-sm text-foreground">{col.label}</h2>
                    </div>
                    <span className={`font-mono text-xs font-bold ${col.soft}`}>{items.length}</span>
                  </div>
                  <Droppable droppableId={col.id} className="flex-1 min-h-[120px]">
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`flex-1 p-2.5 space-y-2.5 transition-colors ${
                          snapshot.isDraggingOver ? 'bg-primary/5' : ''
                        }`}
                        style={{ minHeight: 120 }}
                      >
                        {items.map((task, idx) => (
                          <TaskCard key={task.id} task={task} index={idx} onOpen={setDetail} />
                        ))}
                        {provided.placeholder}
                        {items.length === 0 && (
                          <p className="font-mono text-[10px] text-muted-foreground/30 text-center py-6">
                            Déposez une tâche ici
                          </p>
                        )}
                      </div>
                    )}
                  </Droppable>
                </div>
              );
            })}
          </div>
        </DragDropContext>
      )}

      <CreateTaskDialog open={createOpen} onClose={() => setCreateOpen(false)} onSubmit={handleCreate} />
      <TaskDetailDialog task={detail} onClose={() => setDetail(null)} onSave={handleSaveDetail} onDelete={handleDelete} />
    </div>
  );
}