export default function AuthLoading() {
  return (
    <div className="w-full max-w-sm space-y-4" role="status" aria-live="polite">
      <p className="sr-only">Loading</p>
      <div className="h-7 w-40 animate-pulse rounded bg-border/50" />
      <div className="h-4 w-56 animate-pulse rounded bg-border/40" />
      <div className="h-10 animate-pulse rounded-[var(--radius-md)] border border-border bg-surface/50" />
      <div className="h-10 animate-pulse rounded-[var(--radius-md)] border border-border bg-surface/50" />
      <div className="h-10 animate-pulse rounded-[var(--radius-md)] bg-accent/30" />
    </div>
  );
}
