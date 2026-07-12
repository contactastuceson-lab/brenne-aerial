export default function MainSkeleton() {
  return (
    <section className="min-h-[720px] w-full bg-background" aria-busy="true" aria-label="Chargement du contenu">
      <div className="mx-auto w-full max-w-[680px] border-x border-border/50">
        <div className="flex gap-5 border-b border-border/50 px-4 py-4">
          {[1, 2, 3].map((item) => <div key={item} className="h-5 flex-1 animate-pulse rounded-md bg-zinc-800" />)}
        </div>
        {[1, 2, 3, 4].map((item) => (
          <div key={item} className="flex gap-3 border-b border-border/50 px-4 py-4">
            <div className="h-10 w-10 shrink-0 animate-pulse rounded-full bg-zinc-800" />
            <div className="flex-1 space-y-3 pt-1">
              <div className="h-3.5 w-32 animate-pulse rounded-md bg-zinc-800" />
              <div className="h-3.5 w-full animate-pulse rounded-md bg-zinc-800" />
              <div className="h-3.5 w-4/5 animate-pulse rounded-md bg-zinc-800" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}