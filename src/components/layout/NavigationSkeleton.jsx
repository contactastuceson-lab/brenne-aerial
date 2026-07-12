import { Skeleton } from '@/components/ui/skeleton';

export default function NavigationSkeleton() {
  return (
    <main className="min-h-dvh bg-background">
      <div className="mx-auto flex min-h-dvh w-full max-w-[1440px]">
        <aside className="hidden w-64 shrink-0 border-r border-border/50 p-5 md:block">
          <Skeleton className="mb-8 h-9 w-28" />
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((item) => <Skeleton key={item} className="h-9 w-full" />)}
          </div>
        </aside>

        <section className="w-full max-w-[680px] border-r border-border/50">
          <div className="flex gap-5 border-b border-border/50 px-4 py-4">
            <Skeleton className="h-5 flex-1" />
            <Skeleton className="h-5 flex-1" />
            <Skeleton className="h-5 flex-1" />
          </div>
          {[1, 2, 3, 4].map((item) => (
            <div key={item} className="flex gap-3 border-b border-border/50 px-4 py-4">
              <Skeleton className="h-10 w-10 shrink-0 rounded-full" />
              <div className="flex-1 space-y-3 pt-1">
                <Skeleton className="h-3.5 w-32" />
                <Skeleton className="h-3.5 w-full" />
                <Skeleton className="h-3.5 w-4/5" />
              </div>
            </div>
          ))}
        </section>

        <aside className="hidden flex-1 p-5 xl:block">
          <Skeleton className="mb-4 h-6 w-36" />
          <div className="space-y-4 rounded-2xl border border-border/50 p-4">
            {[1, 2, 3].map((item) => <Skeleton key={item} className="h-11 w-full" />)}
          </div>
        </aside>
      </div>
    </main>
  );
}