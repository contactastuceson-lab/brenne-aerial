import { Draggable } from '@hello-pangea/dnd';
import { Clock, Sparkles } from 'lucide-react';
import { format } from 'date-fns';

const STATUS_DOT = {
  todo: 'bg-sky-400',
  in_progress: 'bg-amber-400',
  review: 'bg-violet-400',
  done: 'bg-emerald-400',
};

export default function TaskCard({ task, index, onOpen }) {
  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={() => onOpen(task)}
          className={`group rounded-xl border border-border bg-card p-3 cursor-pointer hover:border-primary/50 transition-all ${
            snapshot.isDragging ? 'shadow-xl ring-1 ring-primary/40 rotate-[0.5deg] scale-[1.02]' : ''
          }`}
        >
          <div className="flex items-start gap-2">
            <span className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${STATUS_DOT[task.status] || 'bg-sky-400'}`} />
            <div className="flex-1 min-w-0">
              <p className="font-grotesk font-bold text-sm text-foreground leading-tight line-clamp-2 break-words">
                {task.title}
              </p>
              {task.description && (
                <p className="font-inter text-xs text-muted-foreground mt-1 line-clamp-2 break-words">
                  {task.description}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-border/50">
            <div className="flex items-center gap-1.5">
              {task.result ? (
                <span className="inline-flex items-center gap-1 text-[9px] font-mono px-1.5 py-0.5 rounded border border-emerald-400/30 bg-emerald-400/10 text-emerald-400">
                  <Sparkles className="w-2.5 h-2.5" /> Résultat IA
                </span>
              ) : (
                <span />
              )}
            </div>
            {task.created_date && (
              <span className="font-mono text-[9px] text-muted-foreground/50 flex items-center gap-1">
                <Clock className="w-2.5 h-2.5" />
                {format(new Date(task.created_date), 'dd/MM HH:mm')}
              </span>
            )}
          </div>
        </div>
      )}
    </Draggable>
  );
}