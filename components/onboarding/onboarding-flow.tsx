"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  BUSINESS_MODELS,
  ONBOARDING_STEPS,
  type OnboardingAnswers,
  type OnboardingStepId,
  type TeamSize,
  type TractionStage,
} from "@/lib/types/onboarding";
import { OnboardingPreview } from "@/components/onboarding/onboarding-preview";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { completeOnboarding } from "@/app/(onboarding)/onboarding/actions";
import { cn } from "@/lib/utils";

type PartialAnswers = Partial<OnboardingAnswers>;

function acknowledgment(
  step: OnboardingStepId,
  answers: PartialAnswers,
): string {
  switch (step) {
    case "about-you": {
      const text = answers["about-you"]?.roleAndBackground?.trim() ?? "";
      const clip = text.length > 90 ? `${text.slice(0, 90)}…` : text;
      return clip
        ? `Noted — we'll hold you to that background: “${clip}”.`
        : "Noted.";
    }
    case "idea": {
      const text = answers.idea?.description?.trim() ?? "";
      const clip = text.length > 90 ? `${text.slice(0, 90)}…` : text;
      return clip
        ? `Captured. We'll pressure-test this framing: “${clip}”.`
        : "Captured.";
    }
    case "business-specifics": {
      const m = answers["business-specifics"]?.businessModelType;
      const p = answers["business-specifics"]?.pricePoint;
      return m && p
        ? `${m} at roughly ${p} — we'll ask whether willingness-to-pay matches that.`
        : "Business specifics locked.";
    }
    case "traction": {
      const stage = answers.traction?.stage;
      const labels: Record<TractionStage, string> = {
        "pre-launch": "Pre-launch — evidence will matter more than narrative.",
        "early-users": "Early users — we'll dig into retention, not vanity counts.",
        revenue: "Revenue — unit economics become non-negotiable next.",
        scaling: "Scaling — concentration and durability of growth get stress-tested.",
      };
      return stage ? labels[stage] : "Traction stage locked.";
    }
    case "team": {
      const size = answers.team?.size;
      return size === "solo"
        ? "Solo build — investors will ask how execution risk is covered."
        : size
          ? `Team of ${size} — we'll look for role coverage gaps.`
          : "Team size locked.";
    }
    case "deal-structure": {
      const d = answers["deal-structure"];
      if (!d) return "Deal structure locked.";
      if (!d.currentlyRaising) {
        return "Not raising right now — we'll still shape the story for when you do.";
      }
      return `Raising${d.amount ? ` ~${d.amount}` : ""}${d.stage ? ` · ${d.stage}` : ""} — use of funds must be sharp.`;
    }
    default:
      return "Locked in.";
  }
}

function insightForAnswers(answers: PartialAnswers): string | null {
  const stage = answers.traction?.stage;
  const model = answers["business-specifics"]?.businessModelType;
  if (!stage || !model) return null;

  if (stage === "pre-launch" && model.includes("SaaS")) {
    return "Benchmark: pre-launch SaaS pitches usually fail on distribution proof, not product vision. Expect that line of questioning.";
  }
  if (stage === "early-users") {
    return "Benchmark: early-user stories get discounted unless week-4 retention or paid conversion is concrete.";
  }
  if (stage === "revenue") {
    return "Benchmark: revenue-stage founders get grilled on gross margin and payback period before growth rate.";
  }
  if (stage === "scaling") {
    return "Benchmark: scaling claims need channel mix and concentration risk — one big customer is a yellow flag.";
  }
  return "Benchmark: clarity on who pays and why now beats a bigger TAM slide.";
}

export function OnboardingFlow({ userEmail }: { userEmail?: string | null }) {
  const [stepIndex, setStepIndex] = useState(0);
  const [answers, setAnswers] = useState<PartialAnswers>({});
  const [ack, setAck] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [accountEmail, setAccountEmail] = useState(userEmail ?? "");

  useEffect(() => {
    if (accountEmail) return;
    void (async () => {
      try {
        const { createClient } = await import("@/lib/supabase/client");
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user?.email) setAccountEmail(user.email);
      } catch {
        // ignore — header still works without email
      }
    })();
  }, [accountEmail]);

  async function signOut() {
    const { createClient } = await import("@/lib/supabase/client");
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  const step = ONBOARDING_STEPS[stepIndex];
  const progress = ((stepIndex + 1) / ONBOARDING_STEPS.length) * 100;
  const insight =
    stepIndex >= 3 ? insightForAnswers(answers) : null;

  const canContinue = useMemo(() => {
    switch (step.id) {
      case "about-you":
        return Boolean(answers["about-you"]?.roleAndBackground?.trim());
      case "idea":
        return Boolean(answers.idea?.description?.trim());
      case "business-specifics":
        return Boolean(
          answers["business-specifics"]?.businessModelType &&
            answers["business-specifics"]?.pricePoint?.trim(),
        );
      case "traction":
        return Boolean(answers.traction?.stage);
      case "team":
        return Boolean(answers.team?.size);
      case "deal-structure": {
        const d = answers["deal-structure"];
        if (!d) return false;
        if (!d.currentlyRaising) return true;
        return Boolean(d.amount?.trim() && d.stage?.trim());
      }
      default:
        return false;
    }
  }, [answers, step.id]);

  function advance() {
    if (!canContinue || pending) return;
    const message = acknowledgment(step.id, answers);
    setAck(message);

    window.setTimeout(() => {
      void (async () => {
        setAck(null);
        if (stepIndex < ONBOARDING_STEPS.length - 1) {
          setStepIndex((i) => i + 1);
          return;
        }

        setPending(true);
        setError(null);
        try {
          const result = await completeOnboarding(answers as OnboardingAnswers);
          if (result?.error) {
            setError(result.error);
            setPending(false);
            return;
          }
          // Hard navigation avoids stuck Next.js "Rendering…" transitions
          window.location.assign("/chat?bootstrap=1");
        } catch (err) {
          setError(err instanceof Error ? err.message : "Could not finish onboarding.");
          setPending(false);
        }
      })();
    }, 500);
  }

  return (
    <div className="relative flex min-h-[100svh] flex-col lg:flex-row">
      <div className="flex flex-1 flex-col px-6 py-8 lg:px-12 lg:py-10">
        <div className="mb-10 flex flex-wrap items-center justify-between gap-4">
          <div className="flex min-w-0 flex-1 flex-col gap-1 sm:flex-row sm:items-center sm:gap-4">
            <Link
              href="/"
              className="font-display text-lg text-ink transition-colors hover:text-accent"
              aria-label="WeStartup home"
            >
              WeStartup
            </Link>
            {accountEmail ? (
              <div className="flex min-w-0 items-center gap-2">
                <p
                  className="truncate text-xs text-ink-tertiary"
                  title={accountEmail}
                >
                  Signed in as{" "}
                  <span className="font-medium text-ink-secondary">
                    {accountEmail}
                  </span>
                </p>
                <button
                  type="button"
                  onClick={signOut}
                  className="shrink-0 text-xs font-medium text-accent transition-colors hover:text-accent-hover"
                >
                  Sign out
                </button>
              </div>
            ) : (
              <Button
                type="button"
                variant="ghost"
                className="h-auto self-start px-0 py-0 text-xs"
                onClick={signOut}
              >
                Sign out
              </Button>
            )}
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            <div className="h-1 w-28 overflow-hidden rounded-full bg-border sm:w-40 md:w-56">
              <div
                className="h-full rounded-full bg-accent transition-[width] duration-500 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
            <ThemeToggle />
            <Link
              href="/"
              className="text-xs text-ink-secondary transition-colors hover:text-ink"
            >
              Home
            </Link>
          </div>
        </div>

        <div className="mx-auto flex w-full max-w-xl flex-1 flex-col justify-center">
          <p className="text-xs font-medium tracking-[0.14em] text-accent">
            {String(stepIndex + 1).padStart(2, "0")} /{" "}
            {String(ONBOARDING_STEPS.length).padStart(2, "0")}
          </p>
          <h1 className="mt-3 font-display text-3xl tracking-tight text-ink md:text-4xl">
            {step.title}
          </h1>
          <p className="mt-2 text-ink-secondary">{step.prompt}</p>

          <div
            key={step.id}
            className="animate-fade-up mt-8 space-y-5"
          >
            {step.id === "about-you" ? (
              <Textarea
                rows={5}
                placeholder="e.g. Ex-SaaS PM, 6 years in B2B ops tooling…"
                value={answers["about-you"]?.roleAndBackground ?? ""}
                onChange={(e) =>
                  setAnswers((a) => ({
                    ...a,
                    "about-you": { roleAndBackground: e.target.value },
                  }))
                }
              />
            ) : null}

            {step.id === "idea" ? (
              <Textarea
                rows={6}
                placeholder="Describe the problem, who has it, and what you're building…"
                value={answers.idea?.description ?? ""}
                onChange={(e) =>
                  setAnswers((a) => ({
                    ...a,
                    idea: { description: e.target.value },
                  }))
                }
              />
            ) : null}

            {step.id === "business-specifics" ? (
              <>
                <div className="grid gap-2 sm:grid-cols-2">
                  {BUSINESS_MODELS.map((model) => {
                    const selected =
                      answers["business-specifics"]?.businessModelType ===
                      model;
                    return (
                      <button
                        key={model}
                        type="button"
                        onClick={() =>
                          setAnswers((a) => ({
                            ...a,
                            "business-specifics": {
                              businessModelType: model,
                              pricePoint:
                                a["business-specifics"]?.pricePoint ?? "",
                            },
                          }))
                        }
                        className={cn(
                          "rounded-[var(--radius-md)] border px-4 py-3 text-left text-sm transition-colors",
                          selected
                            ? "border-accent bg-accent-subtle text-ink"
                            : "border-border bg-surface text-ink-secondary hover:border-ink-tertiary",
                        )}
                      >
                        {model}
                      </button>
                    );
                  })}
                </div>
                <Input
                  placeholder="Rough price point (e.g. ₹999/mo, 2% take rate)"
                  value={answers["business-specifics"]?.pricePoint ?? ""}
                  onChange={(e) =>
                    setAnswers((a) => ({
                      ...a,
                      "business-specifics": {
                        businessModelType:
                          a["business-specifics"]?.businessModelType ?? "",
                        pricePoint: e.target.value,
                      },
                    }))
                  }
                />
              </>
            ) : null}

            {step.id === "traction" ? (
              <TractionSlider
                value={answers.traction?.stage}
                onChange={(stage) =>
                  setAnswers((a) => ({ ...a, traction: { stage } }))
                }
              />
            ) : null}

            {step.id === "team" ? (
              <TeamStepper
                value={answers.team?.size}
                onChange={(size) =>
                  setAnswers((a) => ({ ...a, team: { size } }))
                }
              />
            ) : null}

            {step.id === "deal-structure" ? (
              <DealFields
                value={answers["deal-structure"]}
                onChange={(deal) =>
                  setAnswers((a) => ({ ...a, "deal-structure": deal }))
                }
              />
            ) : null}
          </div>

          {insight ? (
            <p className="mt-6 rounded-[var(--radius-md)] border border-border bg-surface px-4 py-3 text-sm text-ink-secondary">
              <span className="font-medium text-challenge">Insight · </span>
              {insight}
            </p>
          ) : null}

          {ack ? (
            <p className="animate-fade-up mt-6 text-sm text-accent">{ack}</p>
          ) : null}

          {error ? <p className="mt-4 text-sm text-danger">{error}</p> : null}

          <div className="mt-10 flex items-center justify-between gap-3">
            <Button
              type="button"
              variant="ghost"
              disabled={stepIndex === 0 || pending || Boolean(ack)}
              onClick={() => setStepIndex((i) => Math.max(0, i - 1))}
            >
              Back
            </Button>
            <Button
              type="button"
              disabled={!canContinue || pending || Boolean(ack)}
              onClick={advance}
            >
              {pending
                ? "Opening advisor…"
                : stepIndex === ONBOARDING_STEPS.length - 1
                  ? "Continue to advisor"
                  : "Continue"}
            </Button>
          </div>
        </div>
      </div>

      <aside className="hidden w-full max-w-md border-l border-border bg-canvas lg:block">
        <OnboardingPreview answers={answers} stepIndex={stepIndex} />
      </aside>
    </div>
  );
}

function TractionSlider({
  value,
  onChange,
}: {
  value?: TractionStage;
  onChange: (v: TractionStage) => void;
}) {
  const stages: TractionStage[] = [
    "pre-launch",
    "early-users",
    "revenue",
    "scaling",
  ];
  const labels = ["Pre-launch", "Early users", "Revenue", "Scaling"];
  const index = value ? stages.indexOf(value) : -1;

  return (
    <div className="space-y-4">
      <input
        type="range"
        min={0}
        max={3}
        step={1}
        value={index < 0 ? 0 : index}
        onChange={(e) => onChange(stages[Number(e.target.value)])}
        className="w-full accent-[var(--accent)]"
      />
      <div className="grid grid-cols-4 gap-2">
        {labels.map((label, i) => (
          <button
            key={label}
            type="button"
            onClick={() => onChange(stages[i])}
            className={cn(
              "rounded-[var(--radius-sm)] px-2 py-2 text-center text-xs transition-colors",
              index === i
                ? "bg-accent-subtle font-medium text-ink"
                : "text-ink-tertiary hover:text-ink",
            )}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}

function TeamStepper({
  value,
  onChange,
}: {
  value?: TeamSize;
  onChange: (v: TeamSize) => void;
}) {
  const options: { id: TeamSize; label: string }[] = [
    { id: "solo", label: "Solo" },
    { id: "2-3", label: "2–3" },
    { id: "4+", label: "4+" },
  ];

  return (
    <div className="flex gap-2">
      {options.map((opt) => (
        <button
          key={opt.id}
          type="button"
          onClick={() => onChange(opt.id)}
          className={cn(
            "flex-1 rounded-[var(--radius-md)] border px-4 py-6 text-center text-sm font-medium transition-colors",
            value === opt.id
              ? "border-accent bg-accent-subtle text-ink"
              : "border-border bg-surface text-ink-secondary hover:border-ink-tertiary",
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

function DealFields({
  value,
  onChange,
}: {
  value?: OnboardingAnswers["deal-structure"];
  onChange: (v: OnboardingAnswers["deal-structure"]) => void;
}) {
  const raising = value?.currentlyRaising;

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        {[
          { id: true, label: "Yes, raising" },
          { id: false, label: "Not right now" },
        ].map((opt) => (
          <button
            key={String(opt.id)}
            type="button"
            onClick={() =>
              onChange({
                currentlyRaising: opt.id,
                amount: opt.id ? value?.amount : undefined,
                stage: opt.id ? value?.stage : undefined,
              })
            }
            className={cn(
              "flex-1 rounded-[var(--radius-md)] border px-4 py-3 text-sm transition-colors",
              raising === opt.id
                ? "border-accent bg-accent-subtle text-ink"
                : "border-border bg-surface text-ink-secondary",
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {raising ? (
        <div className="grid gap-3 sm:grid-cols-2">
          <Input
            placeholder="Amount (e.g. ₹1.5 Cr)"
            value={value?.amount ?? ""}
            onChange={(e) =>
              onChange({
                currentlyRaising: true,
                amount: e.target.value,
                stage: value?.stage,
              })
            }
          />
          <Input
            placeholder="Stage (e.g. Pre-seed)"
            value={value?.stage ?? ""}
            onChange={(e) =>
              onChange({
                currentlyRaising: true,
                amount: value?.amount,
                stage: e.target.value,
              })
            }
          />
        </div>
      ) : null}
    </div>
  );
}
