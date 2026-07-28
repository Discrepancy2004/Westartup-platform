"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { Paperclip, X } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AppHeader } from "@/components/app/app-header";
import { DashboardUpdateCard } from "@/components/chat/dashboard-update-card";
import { MarkdownMessage } from "@/components/chat/markdown-message";
import { UsageRing } from "@/components/chat/usage-ring";
import { useDna } from "@/components/dna/dna-provider";
import { DnaSuggestions, DnaWelcome } from "@/components/dna/dna-ui";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { PLANS } from "@/lib/razorpay/plans";
import { extractDashboardUpdate } from "@/lib/chat/dashboard-update";
import type { ChatUsageSummary } from "@/lib/billing/usage";
import type { PlanId } from "@/lib/razorpay/plans";

export function ChatPanel({
  bootstrap,
  initialMessages = [],
  planId,
  usage,
}: {
  bootstrap?: boolean;
  initialMessages?: { id: string; role: "user" | "assistant"; content: string }[];
  planId: PlanId;
  usage: ChatUsageSummary;
}) {
  const { experience } = useDna();
  const [input, setInput] = useState("");
  const [queuedFiles, setQueuedFiles] = useState<File[]>([]);
  const [attachmentError, setAttachmentError] = useState<string | null>(null);
  const [processingAttachments, setProcessingAttachments] = useState(false);
  const [usageState, setUsageState] = useState(usage);
  const [bootStatus, setBootStatus] = useState<
    "idle" | "running" | "done" | "error"
  >(bootstrap ? "running" : "idle");
  const [bootError, setBootError] = useState<string | null>(null);
  const bootstrapped = useRef(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const transport = useMemo(
    () => new DefaultChatTransport({ api: "/api/chat" }),
    [],
  );

  const { messages, sendMessage, status, error, setMessages, clearError } =
    useChat({
      transport,
      messages: initialMessages.map((m) => ({
        id: m.id,
        role: m.role,
        parts: [{ type: "text" as const, text: m.content }],
      })),
    });

  const runBootstrap = useCallback(
    async (force = false) => {
      setBootStatus("running");
      setBootError(null);
      clearError();

      const controller = new AbortController();
      const timeout = window.setTimeout(() => controller.abort(), 55_000);

      try {
        const res = await fetch(
          force
            ? "/api/onboarding/bootstrap?force=1"
            : "/api/onboarding/bootstrap",
          { method: "POST", signal: controller.signal },
        );
        const raw = await res.text();
        let data: {
          ok?: boolean;
          error?: string;
          hint?: string;
          advisorOpening?: string | null;
          source?: string;
        } = {};
        try {
          data = raw ? (JSON.parse(raw) as typeof data) : {};
        } catch {
          throw new Error(
            res.status === 404
              ? "Document API not found. Restart the dev server (npm run dev) and try again."
              : `Document generation failed (HTTP ${res.status}). Check the terminal for details.`,
          );
        }
        if (!res.ok) {
          throw new Error(
            [data.error, data.hint].filter(Boolean).join(" — ") ||
              "Could not generate documents",
          );
        }

        if (data.advisorOpening) {
          setMessages((prev) => {
            const already = prev.some(
              (m) =>
                m.role === "assistant" &&
                m.parts.some(
                  (p) => p.type === "text" && p.text === data.advisorOpening,
                ),
            );
            if (already) return prev;
            return [
              ...prev,
              {
                id: `bootstrap-${Date.now()}`,
                role: "assistant" as const,
                parts: [{ type: "text" as const, text: data.advisorOpening! }],
              },
            ];
          });
        }
        setBootStatus("done");
        window.history.replaceState({}, "", "/chat");
      } catch (err) {
        const message =
          err instanceof Error
            ? err.name === "AbortError"
              ? `Document generation timed out. Open Dashboard and click ${experience.generateCta}.`
              : err.message
            : "Bootstrap failed";
        setBootError(message);
        setBootStatus("error");
      } finally {
        window.clearTimeout(timeout);
      }
    },
    [clearError, experience.generateCta, setMessages],
  );

  useEffect(() => {
    if (!bootstrap || bootstrapped.current) return;
    bootstrapped.current = true;
    void runBootstrap(false);
  }, [bootstrap, runBootstrap]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, status, bootStatus]);

  const busy =
    status === "submitted" || status === "streaming" || processingAttachments;
  const showEmpty = messages.length === 0 && bootStatus !== "running";
  const limitReached =
    usageState.limit !== null && (usageState.remaining ?? 0) <= 0;

  async function submitPrompt(rawText: string, files: File[] = []) {
    if (busy || bootStatus === "running") return;

    const trimmed = rawText.trim();
    if (!trimmed && files.length === 0) return;

    if (limitReached) {
      setAttachmentError(
        `You have reached today's limit on ${planId}. Upgrade in Billing to continue.`,
      );
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

        const attachmentIntro =
          trimmed || "Please analyze the attached material and respond to it.";
        finalText = [attachmentIntro, data.promptBlock].filter(Boolean).join("\n\n");
      } catch (err) {
        setAttachmentError(
          err instanceof Error ? err.message : "Could not process attachments",
        );
        setProcessingAttachments(false);
        return;
      }
      setProcessingAttachments(false);
    }

    if (!finalText.trim()) return;

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

  return (
    <div className="flex h-[100svh] flex-col">
      <AppHeader active="chat" />

      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-4 overflow-y-auto px-4 py-6">
        <div className="flex items-center justify-between gap-3">
          <UsageRing usage={usageState} />
          <p className="text-xs text-ink-tertiary">
            {planId === "scale"
              ? "Scale includes unlimited advisor chat."
              : "Daily usage resets every day."}
          </p>
        </div>

        {bootStatus !== "running" ? <DnaWelcome /> : null}

        {bootStatus === "running" ? (
          <div className="rounded-[var(--radius-md)] border border-border bg-surface px-4 py-3 text-sm text-ink-secondary">
            {experience.bootstrapRunning}
          </div>
        ) : null}

        {bootStatus === "done" ? (
          <div className="rounded-[var(--radius-md)] border border-accent/30 bg-accent-subtle px-4 py-3 text-sm text-ink">
            {experience.bootstrapDone}{" "}
            <Link href="/dashboard" className="font-medium text-accent underline">
              Open dashboard
            </Link>
          </div>
        ) : null}

        {bootStatus !== "running" ? (
          <div className="rounded-[var(--radius-md)] border border-border bg-surface px-4 py-3 text-sm text-ink-secondary">
            Charts live on the dashboard.{" "}
            <Link href="/dashboard" className="font-medium text-accent underline">
              Open dashboard
            </Link>
            {" · "}
            <button
              type="button"
              className="font-medium text-accent underline"
              onClick={() => void runBootstrap(true)}
            >
              {experience.generateCta}
            </button>
          </div>
        ) : null}

        {bootError ? (
          <div className="rounded-[var(--radius-md)] border border-danger/30 px-4 py-3 text-sm text-danger">
            {bootError}
            <div className="mt-2 flex gap-2">
              <Button
                type="button"
                variant="secondary"
                className="text-xs"
                onClick={() => void runBootstrap(true)}
              >
                Retry
              </Button>
              <Link href="/dashboard" className="text-xs text-accent underline">
                Go to dashboard
              </Link>
            </div>
          </div>
        ) : null}

        {limitReached ? (
          <div className="rounded-[var(--radius-md)] border border-challenge/30 bg-[color-mix(in_srgb,var(--challenge)_10%,white)] px-4 py-3 text-sm text-ink">
            You have used today&apos;s chat allocation for {PLANS[planId].name}.{" "}
            <Link href="/billing" className="font-medium text-accent underline">
              Upgrade your tier
            </Link>{" "}
            to keep going.
          </div>
        ) : null}

        {showEmpty ? (
          <div className="rounded-[var(--radius-lg)] border border-dashed border-border px-5 py-8">
            <p className="font-display text-xl text-ink">
              {experience.icons.primary} {experience.emptyChatTitle}
            </p>
            <p className="mt-2 text-sm text-ink-secondary">
              {experience.emptyChatBody}
            </p>
            <DnaSuggestions
              className="mt-5"
              onPick={(text) => {
                void submitPrompt(text);
              }}
            />
          </div>
        ) : null}

        {messages.map((message) => {
          const text = message.parts
            .filter((p): p is { type: "text"; text: string } => p.type === "text")
            .map((p) => p.text)
            .join("\n");
          if (!text) return null;
          const isUser = message.role === "user";
          const isStreamingAssistant =
            !isUser && busy && message.id === messages[messages.length - 1]?.id;

          if (isUser) {
            return (
              <div
                key={message.id}
                className="ml-auto max-w-[85%] rounded-[var(--radius-md)] bg-accent-subtle px-4 py-3 text-sm text-ink"
              >
                <p className="whitespace-pre-wrap">{text}</p>
              </div>
            );
          }

          const { visibleText, proposal } = isStreamingAssistant
            ? {
                visibleText: text
                  .replace(/<!--WESTARTUP_UPDATE[\s\S]*$/m, "")
                  .trim(),
                proposal: null,
              }
            : extractDashboardUpdate(text);

          return (
            <div
              key={message.id}
              className="mr-auto max-w-[90%] space-y-1 text-sm leading-relaxed"
            >
              <p className="text-[10px] uppercase tracking-[0.14em] text-accent">
                {experience.advisorLabel}
              </p>
              {visibleText ? <MarkdownMessage content={visibleText} /> : null}
              {proposal ? <DashboardUpdateCard proposal={proposal} /> : null}
            </div>
          );
        })}

        {busy ? (
          <p className="text-xs text-ink-tertiary">
            {experience.advisorLabel} is thinking…
          </p>
        ) : null}
        {error ? (
          <p className="text-sm text-danger">
            {error.message || "Chat request failed. Check the terminal for details."}
          </p>
        ) : null}
        <div ref={bottomRef} />
      </div>

      <form
        className="border-t border-border px-4 py-4"
        onSubmit={(e) => {
          e.preventDefault();
          void submitPrompt(input, queuedFiles);
        }}
      >
        <div className="mx-auto w-full max-w-3xl space-y-3">
          {messages.length > 0 && !busy && bootStatus !== "running" ? (
            <DnaSuggestions
              onPick={(text) => {
                void submitPrompt(text);
              }}
            />
          ) : null}
          <div className="flex gap-3">
            <Textarea
              rows={2}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={experience.chatPlaceholder}
              className="min-h-[52px] resize-none bg-surface"
              disabled={bootStatus === "running" || limitReached}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  e.currentTarget.form?.requestSubmit();
                }
              }}
            />
            <Button
              type="submit"
              disabled={
                busy ||
                bootStatus === "running" ||
                limitReached ||
                (!input.trim() && queuedFiles.length === 0)
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
  );
}
