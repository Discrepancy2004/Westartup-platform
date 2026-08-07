"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { Lock, Paperclip, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { UsageRing } from "@/components/chat/usage-ring";
import { Button } from "@/components/ui/button";

const MarkdownMessage = dynamic(() =>
  import("@/components/chat/markdown-message").then((mod) => mod.MarkdownMessage),
);
import { Textarea } from "@/components/ui/textarea";
import type { ChatUsageSummary } from "@/lib/billing/usage";
import { hasRagAccess } from "@/lib/billing/usage";
import type { PlanId } from "@/lib/razorpay/plans";

export function RagWorkspace({
  planId,
  usage,
  initialMessages,
}: {
  planId: PlanId;
  usage: ChatUsageSummary;
  initialMessages: { id: string; role: "user" | "assistant"; content: string }[];
}) {
  const [input, setInput] = useState("");
  const [queuedFiles, setQueuedFiles] = useState<File[]>([]);
  const [processingAttachments, setProcessingAttachments] = useState(false);
  const [attachmentError, setAttachmentError] = useState<string | null>(null);
  const [usageState, setUsageState] = useState(usage);
  const bottomRef = useRef<HTMLDivElement>(null);

  const unlocked = hasRagAccess(planId);
  const limitReached =
    usageState.limit !== null && (usageState.remaining ?? 0) <= 0;

  const transport = useMemo(
    () => new DefaultChatTransport({ api: "/api/rag/chat" }),
    [],
  );

  const { messages, sendMessage, status, error, clearError } = useChat({
    transport,
    messages: initialMessages.map((message) => ({
      id: message.id,
      role: message.role,
      parts: [{ type: "text" as const, text: message.content }],
    })),
  });

  const busy =
    status === "submitted" || status === "streaming" || processingAttachments;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, status]);

  async function submitPrompt(rawText: string, files: File[] = []) {
    if (!unlocked || busy) return;

    const trimmed = rawText.trim();
    if (!trimmed && files.length === 0) return;

    if (limitReached) {
      setAttachmentError("You have reached today's AI chat limit.");
      return;
    }

    let finalText = trimmed;

    if (files.length > 0) {
      setProcessingAttachments(true);
      setAttachmentError(null);
      try {
        const formData = new FormData();
        for (const file of files) {
          formData.append("files", file);
        }

        const res = await fetch("/api/chat/attachments", {
          method: "POST",
          body: formData,
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error ?? "Could not process attachments");
        }

        finalText = [
          trimmed || "Please analyze the attached material with the RAG workspace.",
          data.promptBlock,
        ]
          .filter(Boolean)
          .join("\n\n");
      } catch (err) {
        setAttachmentError(
          err instanceof Error ? err.message : "Could not process attachments",
        );
        setProcessingAttachments(false);
        return;
      }
      setProcessingAttachments(false);
    }

    setInput("");
    setQueuedFiles([]);
    clearError();
    setAttachmentError(null);

    if (usageState.limit !== null) {
      setUsageState((current) => {
        const nextUsed = current.used + 1;
        const remaining =
          current.limit === null ? null : Math.max(current.limit - nextUsed, 0);

        return {
          ...current,
          used: nextUsed,
          remaining,
          percentageUsed:
            current.limit === null || current.limit === 0
              ? 0
              : Math.min((nextUsed / current.limit) * 100, 100),
        };
      });
    }

    await sendMessage({ text: finalText });
  }

  if (!unlocked) {
    return (
      <section className="rounded-[var(--radius-lg)] border border-border bg-surface p-6">
        <div className="flex items-start gap-3">
          <span className="rounded-full bg-accent-subtle p-2 text-accent">
            <Lock className="h-4 w-4" />
          </span>
          <div>
            <h2 className="font-display text-2xl text-ink">RAG workspace</h2>
            <p className="mt-2 text-sm text-ink-secondary">
              Growth and Scale unlock grounded answers from the WeStartup knowledge
              base. Starter can still use the advisor chat and dashboard.
            </p>
            <Link href="/billing" className="mt-4 inline-block text-sm text-accent underline">
              Upgrade in Billing
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-4">
      <div className="rounded-[var(--radius-lg)] border border-border bg-surface p-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="font-display text-2xl text-ink">RAG workspace</h2>
            <p className="mt-2 text-sm text-ink-secondary">
              Ask grounded questions and get answers using the WeStartup knowledge base.
            </p>
          </div>
          <UsageRing usage={usageState} label="AI chat usage" />
        </div>
      </div>

      <div className="rounded-[var(--radius-lg)] border border-border bg-surface">
        <div className="max-h-[28rem] space-y-4 overflow-y-auto px-5 py-5">
          {messages.length === 0 ? (
            <div className="rounded-[var(--radius-md)] border border-dashed border-border px-4 py-8 text-center">
              <p className="font-medium text-ink">Start with a grounded question</p>
              <p className="mt-2 text-sm text-ink-secondary">
                Ask about the attached files, your idea, or a specific founder problem.
              </p>
            </div>
          ) : null}

          {messages.map((message) => {
            const text = message.parts
              .filter((part): part is { type: "text"; text: string } => part.type === "text")
              .map((part) => part.text)
              .join("\n");

            if (!text) return null;

            if (message.role === "user") {
              return (
                <div
                  key={message.id}
                  className="ml-auto max-w-[85%] rounded-[var(--radius-md)] bg-accent-subtle px-4 py-3 text-sm text-ink"
                >
                  <p className="whitespace-pre-wrap">{text}</p>
                </div>
              );
            }

            return (
              <div key={message.id} className="max-w-[90%] space-y-1">
                <p className="text-[10px] uppercase tracking-[0.14em] text-accent">
                  RAG answer
                </p>
                <MarkdownMessage content={text} />
              </div>
            );
          })}

          {busy ? <p className="text-xs text-ink-tertiary">RAG workspace is thinking…</p> : null}
          {error ? <p className="text-sm text-danger">{error.message}</p> : null}
          <div ref={bottomRef} />
        </div>

        <form
          className="border-t border-border px-5 py-4"
          onSubmit={(event) => {
            event.preventDefault();
            void submitPrompt(input, queuedFiles);
          }}
        >
          <div className="space-y-3">
            <div className="flex gap-3">
              <Textarea
                rows={2}
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="Ask the RAG workspace"
                disabled={busy || limitReached}
                className="min-h-[52px] resize-none bg-surface"
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    event.currentTarget.form?.requestSubmit();
                  }
                }}
              />
              <Button
                type="submit"
                disabled={
                  busy || limitReached || (!input.trim() && queuedFiles.length === 0)
                }
                className="self-end"
              >
                {processingAttachments ? "Reading files…" : "Send"}
              </Button>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-[var(--radius-md)] border border-border px-3 py-2 text-xs text-ink-secondary transition-colors hover:border-accent/40 hover:text-ink">
                <Paperclip className="h-4 w-4" />
                Add PDF or image
                <input
                  type="file"
                  accept="application/pdf,image/*"
                  multiple
                  className="hidden"
                  disabled={busy || limitReached}
                  onChange={(event) => {
                    const nextFiles = Array.from(event.target.files ?? []);
                    if (nextFiles.length === 0) return;
                    setQueuedFiles((current) => [...current, ...nextFiles]);
                    setAttachmentError(null);
                    event.currentTarget.value = "";
                  }}
                />
              </label>
              {queuedFiles.map((file, index) => (
                <span
                  key={`${file.name}-${index}`}
                  className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1.5 text-xs text-ink-secondary"
                >
                  {file.name}
                  <button
                    type="button"
                    className="text-ink-tertiary hover:text-ink"
                    onClick={() =>
                      setQueuedFiles((current) =>
                        current.filter((_, currentIndex) => currentIndex !== index),
                      )
                    }
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </span>
              ))}
            </div>

            {attachmentError ? (
              <p className="text-sm text-danger">{attachmentError}</p>
            ) : null}
          </div>
        </form>
      </div>
    </section>
  );
}
