/** Static advisor transcript preview for marketing hero / challenge sections. */

const EXCHANGE = [
  {
    role: "founder" as const,
    text: "We're a B2B workflow OS for mid-market ops. TAM is huge.",
  },
  {
    role: "advisor" as const,
    text: "Huge is not a number. What is your SAM in INR, and which channel actually reaches those buyers?",
  },
  {
    role: "founder" as const,
    text: "We priced at ₹8k/seat. Early interest from three pilots.",
  },
  {
    role: "advisor" as const,
    text: "Interest or signed LOIs? Walk me through week-4 retention for those pilots before we talk raise.",
  },
] as const;

type ChatPreviewProps = {
  compact?: boolean;
};

export function ChatPreview({ compact = false }: ChatPreviewProps) {
  const lines = compact ? EXCHANGE.slice(0, 3) : EXCHANGE;

  return (
    <div
      className={
        compact
          ? "flex h-full min-h-[280px] flex-col overflow-hidden border border-border bg-surface"
          : "flex h-full flex-col overflow-hidden rounded-t-[var(--radius-lg)] border border-b-0 border-border bg-surface shadow-[0_-20px_60px_-40px_rgba(10,15,26,0.22)] dark:shadow-[0_-20px_60px_-36px_rgba(0,0,0,0.5)]"
      }
      aria-hidden={compact ? undefined : true}
      {...(compact
        ? {
            role: "img" as const,
            "aria-label": "Sample advisor conversation challenging a founder",
          }
        : {})}
    >
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="size-2 rounded-full bg-accent" />
          <span className="text-[11px] font-medium tracking-wide text-ink">
            Advisor session
          </span>
        </div>
        <span className="text-[10px] uppercase tracking-[0.14em] text-ink-tertiary">
          Live pressure-test
        </span>
      </div>

      <div className={`flex flex-1 flex-col gap-3 p-4 ${compact ? "sm:p-5" : "sm:p-5"}`}>
        {lines.map((line, i) => (
          <div
            key={i}
            className={
              line.role === "founder"
                ? "ml-auto max-w-[88%] rounded-[var(--radius-md)] bg-accent-subtle px-3.5 py-2.5 text-sm leading-relaxed text-ink"
                : "mr-auto max-w-[92%] border border-border bg-canvas px-3.5 py-2.5 text-sm leading-relaxed text-ink-secondary"
            }
          >
            <p className="mb-1 text-[10px] font-medium uppercase tracking-[0.12em] text-ink-tertiary">
              {line.role === "founder" ? "You" : "Advisor"}
            </p>
            {line.text}
          </div>
        ))}
      </div>
    </div>
  );
}
