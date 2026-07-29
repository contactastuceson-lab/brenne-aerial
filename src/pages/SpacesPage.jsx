import { Radio } from 'lucide-react';
import SpacesModule from '@/components/spaces/SpacesModule';

export default function SpacesPage({ user }) {
  return (
    <main className="w-full max-w-[680px] min-w-0 mx-auto md:border-r md:border-zinc-800/60">
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-md border-b border-border/60">
        <div className="px-4 py-3 flex items-center gap-2">
          <div className="w-9 h-9 rounded-full flex items-center justify-center bg-red-500/15 border border-red-500/30">
            <Radio className="w-4 h-4 text-red-400 animate-pulse" />
          </div>
          <div>
            <h1 className="font-grotesk font-bold text-lg leading-tight">Spaces</h1>
            <p className="font-inter text-xs text-muted-foreground">Conversations audio en direct</p>
          </div>
        </div>
      </div>
      <div className="p-4">
        <SpacesModule user={user} embedded />
      </div>
    </main>
  );
}