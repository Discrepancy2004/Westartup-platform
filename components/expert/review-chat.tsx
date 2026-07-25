"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { sendReviewMessage } from "@/app/(expert)/actions";

type Message = {
  id: string;
  sender_id: string;
  content: string;
  created_at: string;
};

export function ReviewChat({
  assignmentId,
  currentUserId,
  peerLabel,
  messages,
}: {
  assignmentId: string;
  currentUserId: string;
  peerLabel: string;
  messages: Message[];
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <div className="flex flex-col border border-border">
      <div className="border-b border-border px-4 py-3">
        <h3 className="text-sm font-medium text-ink">Chat with {peerLabel}</h3>
      </div>
      <div className="flex max-h-80 min-h-48 flex-col gap-3 overflow-y-auto px-4 py-4">
        {messages.length === 0 ? (
          <p className="text-sm text-ink-tertiary">No messages yet.</p>
        ) : (
          messages.map((m) => {
            const mine = m.sender_id === currentUserId;
            return (
              <div
                key={m.id}
                className={`max-w-[85%] text-sm ${mine ? "ml-auto text-right" : ""}`}
              >
                <p
                  className={`inline-block rounded-[var(--radius-md)] px-3 py-2 ${
                    mine
                      ? "bg-accent text-canvas"
                      : "border border-border bg-surface text-ink"
                  }`}
                >
                  {m.content}
                </p>
                <p className="mt-1 text-[10px] text-ink-tertiary">
                  {new Date(m.created_at).toLocaleString()}
                </p>
              </div>
            );
          })
        )}
      </div>
      <form
        className="flex flex-col gap-2 border-t border-border p-3"
        action={(formData) => {
          setError(null);
          startTransition(async () => {
            const result = await sendReviewMessage(formData);
            if (!result.ok) {
              setError(result.error);
              return;
            }
            router.refresh();
          });
        }}
      >
        <input type="hidden" name="assignment_id" value={assignmentId} />
        <Textarea
          name="content"
          required
          rows={2}
          placeholder="Share insights for the founder…"
          disabled={pending}
          className="resize-none"
        />
        {error ? <p className="text-xs text-danger">{error}</p> : null}
        <Button type="submit" disabled={pending} className="self-end">
          {pending ? "Sending…" : "Send"}
        </Button>
      </form>
    </div>
  );
}
