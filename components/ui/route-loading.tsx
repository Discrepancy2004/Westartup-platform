export function RouteLoading({ label = "Loading" }: { label?: string }) {
  return (
    <div className="mx-auto w-full max-w-5xl space-y-4 px-4 py-8" role="status" aria-live="polite">
      <p className="sr-only">{label}</p>
      <div className="h-7 w-48 animate-pulse rounded bg-border/50" />
      <div className="h-4 w-80 max-w-full animate-pulse rounded bg-border/40" />
      <div className="h-40 animate-pulse rounded-[var(--radius-lg)] border border-border bg-surface/50" />
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="h-28 animate-pulse rounded-[var(--radius-md)] border border-border bg-surface/40" />
        <div className="h-28 animate-pulse rounded-[var(--radius-md)] border border-border bg-surface/40" />
      </div>
    </div>
  );
}
