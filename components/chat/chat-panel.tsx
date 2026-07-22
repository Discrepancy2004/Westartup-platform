"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AppHeader } from "@/components/app/app-header";
import { DashboardUpdateCard } from "@/components/chat/dashboard-update-card";
import { MarkdownMessage } from "@/components/chat/markdown-message";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { extractDashboardUpdate } from "@/lib/chat/dashboard-update";

export function ChatPanel({
  bootstrap,
  initialMessages = [],
}: {
  bootstrap?: boolean;
  initialMessages?: { id: string; role: "user" | "assistant"; content: string }[];
}) {
  const [input, setInput] = useState("");
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
        const data = (await res.json()) as {
          ok?: boolean;
          error?: string;
          hint?: string;
          advisorOpening?: string | null;
          source?: string;
        };
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
              ? "Document generation timed out. Open Dashboard and click Generate from onboarding."
              : err.message
            : "Bootstrap failed";
        setBootError(message);
        setBootStatus("error");
      } finally {
        window.clearTimeout(timeout);
      }
    },
    [clearError, setMessages],
  );

  useEffect(() => {
    if (!bootstrap || bootstrapped.current) return;
    bootstrapped.current = true;
    void runBootstrap(false);
  }, [bootstrap, runBootstrap]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, status, bootStatus]);

  const busy = status === "submitted" || status === "streaming";

  return (
    <div className="flex h-[100svh] flex-col">
      <AppHeader active="chat" />

      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-4 overflow-y-auto px-4 py-6">
        {bootStatus === "running" ? (
          <div className="rounded-[var(--radius-md)] border border-border bg-surface px-4 py-3 text-sm text-ink-secondary">
            Building your investor documents…
          </div>
        ) : null}

        {bootStatus === "done" ? (
          <div className="rounded-[var(--radius-md)] border border-accent/30 bg-accent-subtle px-4 py-3 text-sm text-ink">
            Documents ready.{" "}
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
              Generate documents
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
                Advisor
              </p>
              {visibleText ? <MarkdownMessage content={visibleText} /> : null}
              {proposal ? <DashboardUpdateCard proposal={proposal} /> : null}
            </div>
          );
        })}

        {busy ? (
          <p className="text-xs text-ink-tertiary">Advisor is thinking…</p>
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
          const value = input.trim();
          if (!value || busy || bootStatus === "running") return;
          setInput("");
          clearError();
          void sendMessage({ text: value });
        }}
      >
        <div className="mx-auto flex w-full max-w-3xl gap-3">
          <Textarea
            rows={2}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Answer the challenge — or push back with evidence…"
            disabled={bootStatus === "running"}
            className="min-h-[52px] resize-none bg-surface"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                e.currentTarget.form?.requestSubmit();
              }
            }}
          />
          <Button
            type="submit"
            disabled={busy || !input.trim() || bootStatus === "running"}
            className="self-end"
          >
            Send
          </Button>
        </div>
      </form>
    </div>
  );
}
