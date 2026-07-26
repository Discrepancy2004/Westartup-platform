"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  markReviewComplete,
  requestExpertReview,
} from "@/app/(expert)/actions";
import { ReviewChat } from "@/components/expert/review-chat";

type AssignmentView = {
  id: string;
  status: "active" | "completed";
  expert_email: string | null;
  messages: {
    id: string;
    sender_id: string;
    content: string;
    created_at: string;
  }[];
};

export function FounderReviewPanel({
  userId,
  pendingRequest,
  assignments,
}: {
  userId: string;
  pendingRequest: { id: string; note: string | null } | null;
  assignments: AssignmentView[];
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <section className="space-y-4 border border-border px-4 py-5">
      <div>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-tertiary">
          Industry expert review
        </h2>
        <p className="mt-1 text-sm text-ink-secondary">
          Request a human review. Chat with your expert anytime — including after
          the review is marked complete.
        </p>
      </div>

      {pendingRequest ? (
        <p className="text-sm text-ink-secondary">
          Review requested
          {pendingRequest.note ? ` — “${pendingRequest.note}”` : ""}. Waiting for
          admin to assign an expert.
        </p>
      ) : assignments.length === 0 ? (
        <form
          className="space-y-3"
          action={(formData) => {
            setError(null);
            startTransition(async () => {
              const result = await requestExpertReview(formData);
              if (!result.ok) {
                setError(result.error);
                return;
              }
              router.refresh();
            });
          }}
        >
          <Textarea
            name="note"
            rows={2}
            placeholder="Optional note for the admin / expert"
            disabled={pending}
            className="resize-none"
          />
          {error ? <p className="text-xs text-danger">{error}</p> : null}
          <Button type="submit" disabled={pending}>
            {pending ? "Requesting…" : "Request a review"}
          </Button>
        </form>
      ) : null}

      {assignments.map((a) => (
        <div key={a.id} className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm text-ink">
              Expert: {a.expert_email ?? "Assigned"}
              {a.status === "completed" ? (
                <span className="ml-2 text-xs text-success">Completed</span>
              ) : null}
            </p>
            {a.status === "active" ? (
              <Button
                type="button"
                variant="ghost"
                className="text-xs"
                disabled={pending}
                onClick={() => {
                  setError(null);
                  startTransition(async () => {
                    const result = await markReviewComplete(a.id);
                    if (!result.ok) {
                      setError(result.error);
                      return;
                    }
                    router.refresh();
                  });
                }}
              >
                Mark complete
              </Button>
            ) : null}
          </div>
          <ReviewChat
            assignmentId={a.id}
            currentUserId={userId}
            peerLabel="expert"
            messages={a.messages}
          />
        </div>
      ))}
      {error ? <p className="text-xs text-danger">{error}</p> : null}
    </section>
  );
}
