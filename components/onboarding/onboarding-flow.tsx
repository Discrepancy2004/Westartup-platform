"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  BUSINESS_MODELS,
  FUNDING_OPTIONS,
  ONBOARDING_STEPS,
  STEP_CTAS,
  TRACTION_OPTIONS,
  type FundingIntent,
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

type Tip = { label: string; body: string };

function tipForSelection(
  step: OnboardingStepId,
  answers: PartialAnswers,
): Tip | null {
  switch (step) {
    case "about-you": {
      const text = answers["about-you"]?.roleAndBackground?.trim();
      if (!text || text.length < 12) return null;
      return {
        label: "Nice start",
        body: "Your story is taking shape — this helps us understand the founder behind the idea.",
      };
    }
    case "idea": {
      const text = answers.idea?.description?.trim();
      if (!text || text.length < 12) return null;
      return {
        label: "Interesting",
        body: "We'll tailor your workspace analysis around this framing.",
      };
    }
    case "business-specifics": {
      const model = answers["business-specifics"]?.businessModelType;
      if (!model) return null;
      if (model === "Marketplace") {
        return {
          label: "Worth keeping in mind",
          body: "Marketplace businesses depend heavily on both buyers and sellers. We'll keep that in mind.",
        };
      }
      if (model.includes("SaaS")) {
        return {
          label: "Nice choice",
          body: "Recurring revenue makes forecasting easier. Great choice.",
        };
      }
      if (model === "Transaction fee") {
        return {
          label: "Founder Tip",
          body: "Take-rate businesses win on volume and trust — we'll watch both.",
        };
      }
      if (model === "Services / agency") {
        return {
          label: "Quick Note",
          body: "Services scale with people first — we'll help you spot product leverage.",
        };
      }
      return {
        label: "Nice choice",
        body: `${model} locked in. Next, how customers pay.`,
      };
    }
    case "traction": {
      const stage = answers.traction?.stage;
      if (!stage) return null;
      const tips: Record<TractionStage, Tip> = {
        idea: {
          label: "Founder Tip",
          body: "Every successful startup started here.",
        },
        building: {
          label: "Nice choice",
          body: "You're in the making phase — momentum compounds from here.",
        },
        testing: {
          label: "Interesting",
          body: "Testing is where assumptions meet reality. Exciting stage.",
        },
        growing: {
          label: "Quick Note",
          body: "Growth mode — we'll lean into channels and retention.",
        },
        revenue: {
          label: "Nice choice",
          body: "Awesome. We'll focus more on growth than validation.",
        },
      };
      return tips[stage];
    }
    case "team": {
      const size = answers.team?.size;
      if (!size) return null;
      if (size === "solo") {
        return {
          label: "Founder Tip",
          body: "Solo founders move fast — we'll help you show how the work gets done.",
        };
      }
      return {
        label: "Nice choice",
        body: "A team on the journey already — that story matters.",
      };
    }
    case "deal-structure": {
      const intent = answers["deal-structure"]?.intent;
      if (!intent) return null;
      const tips: Record<FundingIntent, Tip> = {
        bootstrapping: {
          label: "Nice choice",
          body: "Owning the upside is powerful. We'll sharpen a capital-efficient path.",
        },
        looking: {
          label: "Interesting",
          body: "We'll shape a story investors can follow — when you're ready.",
        },
        raising: {
          label: "Worth keeping in mind",
          body: "Raise mode — clarity on amount, stage, and use of funds wins trust.",
        },
        "too-early": {
          label: "Quick Note",
          body: "Perfect. Focus on the product for now — funding can wait.",
        },
      };
      return tips[intent];
    }
    default:
      return null;
  }
}

function acknowledgment(
  step: OnboardingStepId,
  answers: PartialAnswers,
): string {
  switch (step) {
    case "about-you":
      return "💡 Nice start! Your founder story is locked in.";
    case "idea":
      return "Interesting idea — we'll build your workspace around this.";
    case "business-specifics": {
      const m = answers["business-specifics"]?.businessModelType;
      return m
        ? `${m} noted. Your business profile is coming together.`
        : "Business model locked in.";
    }
    case "traction": {
      const stage = answers.traction?.stage;
      const opt = TRACTION_OPTIONS.find((o) => o.id === stage);
      return opt
        ? `${opt.emoji} ${opt.label} — your journey marker is set.`
        : "Journey stage locked in.";
    }
    case "team":
      return "Team snapshot saved. Almost at the finish line.";
    case "deal-structure":
      return "Direction set. Your founder profile is ready.";
    default:
      return "Locked in.";
  }
}

function journeyNote(answers: PartialAnswers): Tip | null {
  const stage = answers.traction?.stage;
  const model = answers["business-specifics"]?.businessModelType;
  if (!stage || !model) return null;

  if (stage === "idea") {
    return {
      label: "Founder Tip",
      body: "Early ideas win on clarity — who pays, why now, and why you.",
    };
  }
  if (stage === "revenue") {
    return {
      label: "Worth keeping in mind",
      body: "With revenue in play, unit economics and retention matter more than vision slides.",
    };
  }
  if (model === "Marketplace") {
    return {
      label: "Quick Note",
      body: "Two-sided markets need proof on both sides — we'll keep that front and center.",
    };
  }
  if (model.includes("SaaS") && (stage === "building" || stage === "testing")) {
    return {
      label: "Founder Tip",
      body: "For early SaaS, distribution proof often matters more than feature depth.",
    };
  }
  return {
    label: "Worth keeping in mind",
    body: "Clear answers here make your workspace sharper from day one.",
  };
}

export function OnboardingFlow({ userEmail }: { userEmail?: string | null }) {
  const [stepIndex, setStepIndex] = useState(0);
  const [answers, setAnswers] = useState<PartialAnswers>({});
  const [ack, setAck] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [launching, setLaunching] = useState(false);
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
  const liveTip = tipForSelection(step.id, answers);
  const note = stepIndex >= 3 ? journeyNote(answers) : null;

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
        if (!d?.intent) return false;
        if (!d.currentlyRaising) return true;
        return Boolean(d.amount?.trim() && d.stage?.trim());
      }
      default:
        return false;
    }
  }, [answers, step.id]);

  function advance() {
    if (!canContinue || pending || launching) return;
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
          setLaunching(true);
          window.setTimeout(() => {
            window.location.assign("/chat?bootstrap=1");
          }, 2200);
        } catch (err) {
          setError(
            err instanceof Error ? err.message : "Could not finish onboarding.",
          );
          setPending(false);
        }
      })();
    }, 650);
  }

  if (launching) {
    return (
      <div className="relative flex min-h-[100svh] items-center justify-center bg-canvas px-6">
        <div className="animate-fade-up max-w-lg text-center">
          <p className="text-4xl" aria-hidden>
            🚀
          </p>
          <h1 className="mt-5 font-display text-3xl tracking-tight text-ink md:text-4xl">
            Founder Profile Ready
          </h1>
          <p className="mt-3 text-ink-secondary">
            We&apos;re preparing your personalized startup workspace.
          </p>
          <p className="mt-2 text-sm text-ink-tertiary">
            This is where your ideas turn into strategy.
          </p>
          <div className="mx-auto mt-8 h-1 w-40 overflow-hidden rounded-full bg-border">
            <div className="animate-launch-bar h-full rounded-full bg-accent" />
          </div>
        </div>
      </div>
    );
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

          <div key={step.id} className="animate-fade-up mt-8 space-y-5">
            {step.id === "about-you" ? (
              <Textarea
                rows={5}
                placeholder="I'm a software engineer passionate about helping small businesses grow."
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
                placeholder="We're building..."
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
                <div className="space-y-2">
                  <label className="text-sm font-medium text-ink">
                    How do customers pay?
                  </label>
                  <Input
                    placeholder="₹999/month · 2% transaction fee · ₹499 per order"
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
                </div>
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

          {liveTip && !ack ? (
            <p className="animate-fade-up mt-6 rounded-[var(--radius-md)] border border-accent/25 bg-accent-subtle/40 px-4 py-3 text-sm text-ink-secondary">
              <span className="font-medium text-accent">{liveTip.label} · </span>
              {liveTip.body}
            </p>
          ) : null}

          {note && !liveTip && !ack ? (
            <p className="mt-6 rounded-[var(--radius-md)] border border-border bg-surface px-4 py-3 text-sm text-ink-secondary">
              <span className="font-medium text-challenge">{note.label} · </span>
              {note.body}
            </p>
          ) : null}

          {ack ? (
            <p className="animate-fade-up mt-6 text-sm font-medium text-accent">
              {ack}
            </p>
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
              {pending ? "Launching…" : STEP_CTAS[stepIndex]}
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
  const stages = TRACTION_OPTIONS;
  const index = value ? stages.findIndex((s) => s.id === value) : -1;

  return (
    <div className="space-y-4">
      <input
        type="range"
        min={0}
        max={stages.length - 1}
        step={1}
        value={index < 0 ? 0 : index}
        onChange={(e) => onChange(stages[Number(e.target.value)].id)}
        className="w-full accent-[var(--accent)]"
      />
      <div className="grid grid-cols-5 gap-1.5">
        {stages.map((stage, i) => (
          <button
            key={stage.id}
            type="button"
            onClick={() => onChange(stage.id)}
            className={cn(
              "rounded-[var(--radius-sm)] px-1.5 py-2 text-center transition-colors",
              index === i
                ? "bg-accent-subtle font-medium text-ink"
                : "text-ink-tertiary hover:text-ink",
            )}
          >
            <span className="block text-sm" aria-hidden>
              {stage.emoji}
            </span>
            <span className="mt-1 block text-[10px] leading-tight sm:text-xs">
              {stage.label}
            </span>
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
  const selected = value?.intent;

  return (
    <div className="space-y-4">
      <div className="grid gap-2">
        {FUNDING_OPTIONS.map((opt) => (
          <button
            key={opt.id}
            type="button"
            onClick={() =>
              onChange({
                intent: opt.id,
                currentlyRaising: opt.currentlyRaising,
                amount: opt.currentlyRaising ? value?.amount : undefined,
                stage: opt.currentlyRaising ? value?.stage : undefined,
              })
            }
            className={cn(
              "rounded-[var(--radius-md)] border px-4 py-3 text-left text-sm transition-colors",
              selected === opt.id
                ? "border-accent bg-accent-subtle text-ink"
                : "border-border bg-surface text-ink-secondary hover:border-ink-tertiary",
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {value?.currentlyRaising ? (
        <div className="grid gap-3 sm:grid-cols-2">
          <Input
            placeholder="Amount (e.g. ₹1.5 Cr)"
            value={value?.amount ?? ""}
            onChange={(e) =>
              onChange({
                intent: "raising",
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
                intent: "raising",
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
