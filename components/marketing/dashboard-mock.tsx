type DashboardMockProps = {
  variant?: "hero" | "section";
};

/** Theme-aware CSS mock of the analytics dashboard. */
export function DashboardMock({ variant = "section" }: DashboardMockProps) {
  const isHero = variant === "hero";

  return (
    <div
      className={
        isHero
          ? "h-full overflow-hidden rounded-t-[var(--radius-lg)] border border-b-0 border-border bg-surface shadow-[0_-24px_80px_-40px_rgba(11,18,32,0.28)] dark:shadow-[0_-24px_80px_-36px_rgba(0,0,0,0.55)]"
          : "overflow-hidden rounded-[var(--radius-lg)] border border-border bg-surface shadow-[0_24px_60px_-36px_rgba(11,18,32,0.28)]"
      }
      {...(isHero
        ? { "aria-hidden": true as const }
        : {
            role: "img" as const,
            "aria-label":
              "Preview of the WeStartup investor analytics dashboard",
          })}
    >
      <div className="flex items-center gap-2 border-b border-border px-4 py-3">
        <span className="size-2 rounded-full bg-border" />
        <span className="size-2 rounded-full bg-border" />
        <span className="size-2 rounded-full bg-border" />
        <span className="ml-3 text-[11px] tracking-wide text-ink-tertiary">
          Investor dashboard · live
        </span>
      </div>

      <div
        className={`grid gap-4 p-4 text-ink sm:p-5 ${isHero ? "sm:grid-cols-12" : "md:grid-cols-12"}`}
      >
        <div className="space-y-3 rounded-[var(--radius-md)] border border-border bg-canvas p-4 sm:col-span-4">
          <p className="text-[10px] uppercase tracking-[0.16em] text-ink-tertiary">
            Idea brief
          </p>
          <p className="font-display text-lg leading-snug">B2B workflow OS</p>
          <p className="text-xs leading-relaxed text-ink-secondary">
            Vertical SaaS for mid-market ops teams. Challenged on TAM proof and
            sales cycle length.
          </p>
          <div className="flex flex-wrap gap-2 pt-1">
            <span className="rounded bg-accent-subtle px-2 py-0.5 text-[10px] text-accent">
              Pre-seed
            </span>
            <span className="rounded border border-border px-2 py-0.5 text-[10px] text-challenge">
              Needs evidence
            </span>
          </div>
        </div>

        <div className="space-y-3 rounded-[var(--radius-md)] border border-border bg-canvas p-4 sm:col-span-8">
          <div className="flex items-baseline justify-between">
            <p className="text-[10px] uppercase tracking-[0.16em] text-ink-tertiary">
              YoY projections
            </p>
            <p className="text-[10px] text-ink-tertiary">INR · illustrative</p>
          </div>
          <div className="flex h-28 items-end gap-2 sm:h-32 sm:gap-3">
            {[28, 36, 44, 58, 72, 88].map((h, i) => (
              <div key={i} className="flex flex-1 flex-col items-center gap-1.5">
                <div
                  className="w-full rounded-t-sm bg-accent"
                  style={{ height: `${h}%`, opacity: 0.4 + i * 0.1 }}
                />
                <span className="text-[9px] text-ink-tertiary">Y{i + 1}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-3 rounded-[var(--radius-md)] border border-border bg-canvas p-4 sm:col-span-5">
          <p className="text-[10px] uppercase tracking-[0.16em] text-ink-tertiary">
            Revenue model
          </p>
          <div className="flex items-center gap-5">
            <div
              className="size-20 shrink-0 rounded-full"
              style={{
                background:
                  "conic-gradient(var(--accent) 0 58%, var(--accent-hover) 58% 82%, var(--border) 82% 100%)",
              }}
            />
            <ul className="space-y-2 text-xs text-ink-secondary">
              <li className="flex items-center gap-2">
                <span className="size-1.5 rounded-full bg-accent" />
                Subscription 58%
              </li>
              <li className="flex items-center gap-2">
                <span className="size-1.5 rounded-full bg-accent-hover" />
                Services 24%
              </li>
              <li className="flex items-center gap-2">
                <span className="size-1.5 rounded-full bg-border" />
                Other 18%
              </li>
            </ul>
          </div>
        </div>

        <div className="space-y-3 rounded-[var(--radius-md)] border border-border bg-canvas p-4 sm:col-span-7">
          <p className="text-[10px] uppercase tracking-[0.16em] text-ink-tertiary">
            Market sizing
          </p>
          <div className="space-y-2.5 pt-1">
            {[
              { label: "TAM", w: "100%", sub: "₹4,200 Cr" },
              { label: "SAM", w: "62%", sub: "₹1,860 Cr" },
              { label: "SOM", w: "18%", sub: "₹220 Cr" },
            ].map((row) => (
              <div key={row.label} className="space-y-1">
                <div className="flex justify-between text-[10px] text-ink-tertiary">
                  <span>{row.label}</span>
                  <span>{row.sub}</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-border">
                  <div
                    className="h-full rounded-full bg-accent"
                    style={{
                      width: row.w,
                      opacity: row.label === "SOM" ? 1 : 0.55,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
