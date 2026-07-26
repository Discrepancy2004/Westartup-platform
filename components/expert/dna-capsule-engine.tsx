"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { saveDnaCapsule, submitDnaBank } from "@/app/(expert)/dna-actions";
import {
  DNA_CATEGORY_LABELS,
  DNA_FUNCTIONAL_AREAS,
  DNA_INDUSTRY_OPTIONS,
  DNA_STAGE_OPTIONS,
  DNA_STARTER_QUESTIONS,
  type DnaCapsuleCategory,
  type DnaStarterQuestion,
} from "@/lib/expert/dna-questions";

export function DnaCapsuleEngine({
  answeredIds,
  initialQuestionId,
  answeredCount,
}: {
  answeredIds: string[];
  initialQuestionId?: string;
  answeredCount: number;
}) {
  const router = useRouter();
  const answered = useMemo(() => new Set(answeredIds), [answeredIds]);
  const allDone = answeredCount >= DNA_STARTER_QUESTIONS.length;

  const nextUnanswered = useMemo(() => {
    return (
      DNA_STARTER_QUESTIONS.find((q) => !answered.has(q.id)) ??
      DNA_STARTER_QUESTIONS[0]
    );
  }, [answered]);

  const [questionId, setQuestionId] = useState(
    initialQuestionId &&
      DNA_STARTER_QUESTIONS.some((q) => q.id === initialQuestionId)
      ? initialQuestionId
      : nextUnanswered.id,
  );
  const question: DnaStarterQuestion =
    DNA_STARTER_QUESTIONS.find((q) => q.id === questionId) ?? nextUnanswered;

  const [answer, setAnswer] = useState("");
  const [why, setWhy] = useState("");
  const [industry, setIndustry] = useState("");
  const [stage, setStage] = useState("");
  const [functionalArea, setFunctionalArea] = useState("");
  const [confidence, setConfidence] = useState("3");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const progressIndex =
    DNA_STARTER_QUESTIONS.findIndex((q) => q.id === question.id) + 1;

  function loadQuestion(id: string) {
    setQuestionId(id);
    setAnswer("");
    setWhy("");
    setError(null);
    setMessage(null);
  }

  return (
    <div className="mx-auto w-full max-w-2xl space-y-8">
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-ink-tertiary">
          DNA capsule · {progressIndex} / {DNA_STARTER_QUESTIONS.length}
        </p>
        <h1 className="mt-1 font-display text-2xl text-ink sm:text-3xl">
          Quick insight
        </h1>
        <p className="mt-2 text-sm text-ink-secondary">
          Save drafts as you go. Finish & submit when all{" "}
          {DNA_STARTER_QUESTIONS.length} are complete — that publishes to RAG.
        </p>
      </div>

      <div className="space-y-2">
        <p className="text-[11px] uppercase tracking-wide text-accent">
          {DNA_CATEGORY_LABELS[question.category as DnaCapsuleCategory] ??
            question.category}
        </p>
        <p className="font-display text-xl leading-snug text-ink text-balance">
          {question.prompt}
        </p>
        {answered.has(question.id) ? (
          <p className="text-xs text-success">
            Saved — editing again updates this capsule.
          </p>
        ) : null}
        <details className="text-sm text-ink-tertiary">
          <summary className="cursor-pointer hover:text-ink-secondary">
            Optional follow-up prompts
          </summary>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            {question.followUps.map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>
        </details>
      </div>

      <form
        className="space-y-5"
        onSubmit={(e) => {
          e.preventDefault();
          setError(null);
          setMessage(null);
          const fd = new FormData(e.currentTarget);
          startTransition(async () => {
            const result = await saveDnaCapsule(fd);
            if (!result.ok) {
              setError(result.error);
              return;
            }
            setMessage(
              result.status === "published"
                ? "Updated published capsule. Embedding will refresh for RAG."
                : "Draft saved.",
            );
            setAnswer("");
            setWhy("");
            const remaining = DNA_STARTER_QUESTIONS.find(
              (q) => q.id !== question.id && !answered.has(q.id),
            );
            router.refresh();
            if (remaining) {
              loadQuestion(remaining.id);
            }
          });
        }}
      >
        <input type="hidden" name="question_id" value={question.id} />
        <input type="hidden" name="category" value={question.category} />

        <div className="space-y-1.5">
          <Label htmlFor="answer">Your judgment</Label>
          <Textarea
            id="answer"
            name="answer"
            required
            rows={5}
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Write as if mentoring a sharp founder across the table…"
            disabled={pending}
            className="resize-y"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="why">Why this matters (required for RAG)</Label>
          <Textarea
            id="why"
            name="why"
            required
            rows={3}
            value={why}
            onChange={(e) => setWhy(e.target.value)}
            placeholder="Why should founders internalize this?"
            disabled={pending}
            className="resize-y"
          />
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="functional_area">Functional area</Label>
            <select
              id="functional_area"
              name="functional_area"
              value={functionalArea}
              onChange={(e) => setFunctionalArea(e.target.value)}
              className="h-10 w-full rounded-[var(--radius-md)] border border-border bg-surface px-2 text-sm"
              disabled={pending}
            >
              <option value="">—</option>
              {DNA_FUNCTIONAL_AREAS.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="confidence">Confidence</Label>
            <select
              id="confidence"
              name="confidence"
              value={confidence}
              onChange={(e) => setConfidence(e.target.value)}
              className="h-10 w-full rounded-[var(--radius-md)] border border-border bg-surface px-2 text-sm"
              disabled={pending}
            >
              {[1, 2, 3, 4, 5].map((n) => (
                <option key={n} value={n}>
                  {n} / 5
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="industry">Industry (optional)</Label>
            <select
              id="industry"
              name="industry"
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              className="h-10 w-full rounded-[var(--radius-md)] border border-border bg-surface px-2 text-sm"
              disabled={pending}
            >
              <option value="">—</option>
              {DNA_INDUSTRY_OPTIONS.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="stage">Stage (optional)</Label>
            <select
              id="stage"
              name="stage"
              value={stage}
              onChange={(e) => setStage(e.target.value)}
              className="h-10 w-full rounded-[var(--radius-md)] border border-border bg-surface px-2 text-sm"
              disabled={pending}
            >
              <option value="">—</option>
              {DNA_STAGE_OPTIONS.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
          </div>
        </div>

        {error ? <p className="text-sm text-danger">{error}</p> : null}
        {message ? <p className="text-sm text-success">{message}</p> : null}

        <div className="flex flex-wrap gap-2">
          <Button type="submit" disabled={pending}>
            {pending ? "Saving…" : "Save draft"}
          </Button>
          <Button
            type="button"
            variant="secondary"
            disabled={pending}
            onClick={() => {
              const idx = DNA_STARTER_QUESTIONS.findIndex(
                (q) => q.id === question.id,
              );
              const next =
                DNA_STARTER_QUESTIONS[(idx + 1) % DNA_STARTER_QUESTIONS.length];
              loadQuestion(next.id);
            }}
          >
            Skip for now
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={() => router.push("/expert/dna")}
          >
            Back to studio
          </Button>
        </div>
      </form>

      <div className="border border-border px-4 py-4">
        <p className="text-sm text-ink-secondary">
          Progress: {answeredCount} / {DNA_STARTER_QUESTIONS.length} capsules
          saved
        </p>
        <Button
          type="button"
          className="mt-3"
          disabled={pending || !allDone}
          onClick={() => {
            setError(null);
            startTransition(async () => {
              const result = await submitDnaBank();
              if (!result.ok) {
                setError(result.error);
                return;
              }
              setMessage("Submitted. Your DNA is published to the RAG index.");
              router.push("/expert/dna");
              router.refresh();
            });
          }}
        >
          {allDone
            ? "Finish & submit to RAG"
            : `Finish locked (${DNA_STARTER_QUESTIONS.length - answeredCount} left)`}
        </Button>
      </div>

      <details className="border border-border px-4 py-3 text-sm">
        <summary className="cursor-pointer text-ink-secondary">
          Jump to another question
        </summary>
        <ul className="mt-3 max-h-48 space-y-1 overflow-y-auto">
          {DNA_STARTER_QUESTIONS.map((q, i) => (
            <li key={q.id}>
              <button
                type="button"
                className="w-full truncate text-left text-xs text-ink-tertiary hover:text-accent"
                onClick={() => loadQuestion(q.id)}
              >
                {i + 1}. {answered.has(q.id) ? "✓ " : ""}
                {q.prompt.slice(0, 72)}…
              </button>
            </li>
          ))}
        </ul>
      </details>
    </div>
  );
}
