export function ComingSoon({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="space-y-3 border border-dashed border-border px-6 py-16 text-center">
      <h1 className="font-display text-2xl text-ink">{title}</h1>
      <p className="mx-auto max-w-md text-sm text-ink-secondary">{description}</p>
      <p className="text-xs font-medium uppercase tracking-wide text-ink-tertiary">
        Coming soon
      </p>
    </div>
  );
}
