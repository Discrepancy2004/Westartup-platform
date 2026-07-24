import type { OnboardingAnswers } from "@/lib/types/onboarding";
import { cn } from "@/lib/utils";

type Props = {
  answers: Partial<OnboardingAnswers>;
  stepIndex: number;
};

const PANELS = [
  { key: "brief", label: "Idea brief", unlockAt: 1 },
  { key: "finance", label: "Projections", unlockAt: 2 },
  { key: "revenue", label: "Revenue mix", unlockAt: 3 },
  { key: "market", label: "Market sizing", unlockAt: 3 },
  { key: "team", label: "Team", unlockAt: 4 },
  { key: "deal", label: "Deal", unlockAt: 5 },
] as const;

/** Live skeleton that fills as onboarding answers land — theme-aware product frame. */
export function OnboardingPreview({ answers, stepIndex }: Props) {
  const filledCount = PANELS.filter((p) => stepIndex >= p.unlockAt).length;

  return (
    <div className="flex h-full flex-col justify-center p-6 lg:p-8">
      <div className="overflow-hidden rounded-[var(--radius-lg)] border border-border bg-surface shadow-[0_20px_50px_-28px_rgba(11,18,32,0.35)] dark:shadow-[0_24px_60px_-24px_rgba(0,0,0,0.65)]">
        {/* Window chrome */}
        <div className="flex items-center gap-2 border-b border-border px-4 py-3">
          <span className="size-2 rounded-full bg-border" />
          <span className="size-2 rounded-full bg-border" />
          <span className="size-2 rounded-full bg-border" />
          <span className="ml-2 text-[11px] tracking-wide text-ink-tertiary">
            Investor dashboard
          </span>
          <span className="ml-auto text-[10px] tabular-nums text-ink-tertiary">
            {filledCount}/{PANELS.length}
          </span>
        </div>

        <div className="space-y-4 p-4 sm:p-5">
          <div>
            <p className="text-[10px] uppercase tracking-[0.16em] text-accent">
              Live preview
            </p>
            <p className="mt-1 font-display text-lg text-ink">
              Fills in as you answer
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            {PANELS.map((panel) => {
              const filled = stepIndex >= panel.unlockAt;
              return (
                <div
                  key={panel.key}
                  className={cn(
                    "min-h-[104px] rounded-[var(--radius-md)] border p-3 transition-all duration-500",
                    filled
                      ? "border-border bg-canvas opacity-100"
                      : "border-dashed border-border/80 bg-transparent opacity-55",
                  )}
                >
                  <p className="text-[10px] uppercase tracking-[0.14em] text-ink-tertiary">
                    {panel.label}
                  </p>
                  {filled ? (
                    <FilledPanel panel={panel.key} answers={answers} />
                  ) : (
                    <div className="mt-3 space-y-2">
                      <div className="h-1.5 w-[78%] rounded-full bg-border" />
                      <div className="h-1.5 w-[52%] rounded-full bg-border" />
                      <div className="h-1.5 w-[64%] rounded-full bg-border" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function FilledPanel({
  panel,
  answers,
}: {
  panel: (typeof PANELS)[number]["key"];
  answers: Partial<OnboardingAnswers>;
}) {
  if (panel === "brief") {
    const idea = answers.idea?.description?.slice(0, 72);
    return (
      <p className="mt-2 text-xs leading-relaxed text-ink-secondary">
        {idea ? `${idea}${idea.length >= 72 ? "…" : ""}` : "Idea locked"}
      </p>
    );
  }

  if (panel === "finance") {
    return (
      <div className="mt-3 flex h-12 items-end gap-1">
        {[32, 44, 58, 74].map((h, i) => (
          <div
            key={i}
            className="flex-1 rounded-t-[3px] bg-accent"
            style={{ height: `${h}%`, opacity: 0.4 + i * 0.15 }}
          />
        ))}
      </div>
    );
  }

  if (panel === "revenue") {
    const model = answers["business-specifics"]?.businessModelType ?? "Model";
    return (
      <p className="mt-2 text-xs leading-relaxed text-ink-secondary">
        {model}
        {answers["business-specifics"]?.pricePoint
          ? ` · ${answers["business-specifics"].pricePoint}`
          : ""}
      </p>
    );
  }

  if (panel === "market") {
    return (
      <div className="mt-3 space-y-1.5">
        {[
          { w: "100%", o: 0.35 },
          { w: "64%", o: 0.55 },
          { w: "24%", o: 1 },
        ].map((row, i) => (
          <div key={i} className="h-1.5 overflow-hidden rounded-full bg-border">
            <div
              className="h-full rounded-full bg-accent"
              style={{ width: row.w, opacity: row.o }}
            />
          </div>
        ))}
      </div>
    );
  }

  if (panel === "team") {
    return (
      <p className="mt-2 text-xs text-ink-secondary">
        {answers.team?.size ? `Team · ${answers.team.size}` : "Team pending"}
      </p>
    );
  }

  const deal = answers["deal-structure"];
  const intentLabel: Record<string, string> = {
    bootstrapping: "Bootstrapping",
    looking: "Looking for investors",
    raising: "Raising",
    "too-early": "Too early",
  };
  return (
    <p className="mt-2 text-xs text-ink-secondary">
      {deal
        ? deal.currentlyRaising
          ? `Raising${deal.amount ? ` · ${deal.amount}` : ""}`
          : intentLabel[deal.intent ?? ""] ?? "Not raising"
        : "Deal pending"}
    </p>
  );
}
