import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Radio, Plus } from 'lucide-react';
import SpacesModule from '@/components/spaces/SpacesModule';
import CreateSpaceDialog from '@/components/spaces/CreateSpaceDialog';
import { usePageEnabled } from '@/hooks/usePageEnabled';
import { useAuth } from '@/lib/AuthContext';

export default function SpacesPage() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const { enabled: spacesEnabled } = usePageEnabled('page_spaces_enabled');

  return (
    <main className="w-full max-w-[680px] min-w-0 mx-auto md:border-r md:border-zinc-800/60">
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-md border-b border-border/60">
        <div className="px-4 py-3 flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-full flex items-center justify-center bg-red-500/15 border border-red-500/30">
            <Radio className="w-4 h-4 text-red-400 animate-pulse" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="font-grotesk font-bold text-lg leading-tight">Spaces</h1>
            <p className="font-inter text-xs text-muted-foreground">Conversations audio en direct</p>
          </div>
          {user && spacesEnabled && (
            <button onClick={() => setDialogOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-primary text-primary-foreground text-sm font-grotesk font-bold hover:opacity-90 active:scale-95 transition">
              <Plus className="w-4 h-4" /> Démarrer
            </button>
          )}
        </div>
      </div>
      <div className="p-4">
        <SpacesModule user={user} embedded />
      </div>
      <CreateSpaceDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        user={user}
        onCreated={() => {
          qc.invalidateQueries({ queryKey: ['spaces-live'] });
          qc.invalidateQueries({ queryKey: ['spaces-scheduled'] });
        }}
      />
    </main>
  );
}