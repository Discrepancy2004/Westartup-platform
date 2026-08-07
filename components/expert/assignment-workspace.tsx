"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { ReviewChat } from "@/components/expert/review-chat";
import { ExpertFounderOverview } from "@/components/expert/expert-founder-overview";
import { markReviewComplete } from "@/app/(expert)/actions";

const ExpertFounderFullPack = dynamic(() =>
  import("@/components/expert/expert-founder-full-pack").then(
    (mod) => mod.ExpertFounderFullPack,
  ),
);
import type { ArtifactRecord } from "@/lib/types/artifacts";
import type { OnboardingAnswers } from "@/lib/types/onboarding";
import { cn } from "@/lib/utils";

type Tab = "overview" | "full" | "chat";

type Message = {
  id: string;
  sender_id: string;
  content: string;
  created_at: string;
};

export function AssignmentWorkspace({
  assignmentId,
  status,
  currentUserId,
  founderEmail,
  artifacts,
  onboarding,
  messages,
  initialTab,
}: {
  assignmentId: string;
  status: "active" | "completed";
  currentUserId: string;
  founderEmail: string | null;
  artifacts: ArtifactRecord[];
  onboarding: OnboardingAnswers | null;
  messages: Message[];
  initialTab: Tab;
}) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>(initialTab);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function setTabAndUrl(next: Tab) {
    setTab(next);
    const url =
      next === "overview"
        ? `/expert/assignments/${assignmentId}`
        : `/expert/assignments/${assignmentId}?tab=${next}`;
    router.replace(url, { scroll: false });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link
            href="/expert"
            className="text-sm text-accent hover:underline"
          >
            ← Assignments
          </Link>
          <h1 className="mt-2 font-display text-3xl text-ink">
            {founderEmail ?? "Founder"}
          </h1>
          <p className="mt-1 text-sm text-ink-secondary">
            Review the AI-generated pack, then discuss in chat.
            {status === "completed" ? " · Review marked complete" : ""}
          </p>
        </div>
        {status === "active" ? (
          <Button
            type="button"
            variant="secondary"
            disabled={pending}
            onClick={() => {
              setError(null);
              startTransition(async () => {
                const result = await markReviewComplete(assignmentId);
                if (!result.ok) {
                  setError(result.error);
                  return;
                }
                router.refresh();
              });
            }}
          >
            {pending ? "Saving…" : "Mark complete"}
          </Button>
        ) : (
          <span className="text-xs font-medium text-success">Completed</span>
        )}
      </div>

      {error ? <p className="text-sm text-danger">{error}</p> : null}

      <div className="flex flex-wrap gap-1 border-b border-border pb-px">
        {(
          [
            { id: "overview", label: "Overview" },
            { id: "full", label: "Full pack" },
            { id: "chat", label: "Chat" },
          ] as const
        ).map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTabAndUrl(t.id)}
            className={cn(
              "border-b-2 px-3 py-2 text-sm transition-colors",
              tab === t.id
                ? "border-accent text-ink"
                : "border-transparent text-ink-secondary hover:text-ink",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "overview" ? (
        <ExpertFounderOverview
          artifacts={artifacts}
          onboarding={onboarding}
          founderEmail={founderEmail}
          assignmentId={assignmentId}
        />
      ) : null}

      {tab === "full" ? (
        <ExpertFounderFullPack
          artifacts={artifacts}
          onboarding={onboarding}
        />
      ) : null}

      {tab === "chat" ? (
        <div className="mx-auto max-w-2xl">
          <ReviewChat
            assignmentId={assignmentId}
            currentUserId={currentUserId}
            peerLabel="founder"
            messages={messages}
          />
          <p className="mt-3 text-xs text-ink-tertiary">
            Chat stays available after the review is marked complete.
          </p>
        </div>
      ) : null}
    </div>
  );
}
