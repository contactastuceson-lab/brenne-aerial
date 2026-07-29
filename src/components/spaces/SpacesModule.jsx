import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import SpaceCard from './SpaceCard';
import CreateSpaceDialog from './CreateSpaceDialog';
import { Plus, Radio, Wrench } from 'lucide-react';
import { toast } from 'sonner';
import { usePageEnabled } from '@/hooks/usePageEnabled';

export default function SpacesModule({ user }) {
  const qc = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const { enabled: spacesEnabled } = usePageEnabled('page_spaces_enabled');

  const { data: liveSpaces = [] } = useQuery({
    queryKey: ['spaces-live'],
    queryFn: () => base44.entities.Space.filter({ status: 'live' }, '-started_at', 20),
    refetchInterval: 30000,
  });
  const { data: scheduledSpaces = [] } = useQuery({
    queryKey: ['spaces-scheduled'],
    queryFn: () => base44.entities.Space.filter({ status: 'scheduled' }, 'scheduled_at', 10),
    refetchInterval: 60000,
  });

  const handleStart = async (space) => {
    try {
      await base44.entities.Space.update(space.id, { status: 'live', started_at: new Date().toISOString() });
      qc.invalidateQueries({ queryKey: ['spaces-live'] });
      qc.invalidateQueries({ queryKey: ['spaces-scheduled'] });
      toast.success('Space démarré');
    } catch {
      toast.error('Erreur');
    }
  };

  const all = [...liveSpaces, ...scheduledSpaces];
  if (all.length === 0 && !user) return null;

  return (
    <div className="mb-3">
      <div className="flex items-center gap-2 mb-2 px-1">
        <Radio className="w-4 h-4 text-red-400" />
        <span className="font-grotesk font-bold text-sm flex-1">Spaces</span>
        {user && spacesEnabled && (
          <button onClick={() => setDialogOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90">
            <Plus className="w-3.5 h-3.5" /> Démarrer
          </button>
        )}
      </div>
      {!spacesEnabled ? (
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-4 flex items-center gap-3">
          <Wrench className="w-4 h-4 text-amber-400 flex-shrink-0 animate-pulse" />
          <p className="font-inter text-sm text-amber-300/90">Space audio en maintenance. Les salons reviendront bientôt.</p>
        </div>
      ) : (
      <div className="space-y-2">
        {all.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border/60 p-4 text-center">
            <p className="font-inter text-sm text-muted-foreground">Aucun Space en cours. Lancez une discussion audio en direct.</p>
          </div>
        ) : (
          all.map(s => <SpaceCard key={s.id} space={s} user={user} onStart={handleStart} />)
        )}
      </div>
      )}
      <CreateSpaceDialog open={dialogOpen} onClose={() => setDialogOpen(false)} user={user}
        onCreated={() => { qc.invalidateQueries({ queryKey: ['spaces-live'] }); qc.invalidateQueries({ queryKey: ['spaces-scheduled'] }); }} />
    </div>
  );
}