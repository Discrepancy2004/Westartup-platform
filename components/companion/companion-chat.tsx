"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  useCompanion,
  type CompanionMessage,
} from "@/components/companion/companion-provider";
import { Button } from "@/components/ui/button";
import { PLANS, PLAN_ORDER } from "@/lib/razorpay/plans";
import { cn } from "@/lib/utils";

const MEMORY_KEY = "westartup-companion-mini-chat-v1";

function loadMemory(): CompanionMessage[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(MEMORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as CompanionMessage[];
    return Array.isArray(parsed) ? parsed.slice(-12) : [];
  } catch {
    return [];
  }
}

function saveMemory(msgs: CompanionMessage[]) {
  localStorage.setItem(MEMORY_KEY, JSON.stringify(msgs.slice(-12)));
}

export function CompanionChat() {
  const pathname = usePathname();
  const {
    panelOpen,
    setPanelOpen,
    mode,
    setMode,
    messages,
    setMessages,
    trimMessages,
    kit,
  } = useCompanion();
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);

  const onBilling = pathname?.startsWith("/billing");

  const send = useCallback(
    async (text: string) => {
      const content = text.trim();
      if (!content || busy) return;

      const userMsg: CompanionMessage = {
        id: `u-${Date.now()}`,
        role: "user",
        content,
      };
      const next = trimMessages([...messages, userMsg]);
      setMessages(next);
      saveMemory(next);
      setInput("");
      setBusy(true);

      try {
        const activeMode = onBilling
          ? "billing"
          : mode === "explain"
            ? "explain"
            : "dashboard";
        setMode(activeMode === "billing" ? "billing" : mode);

        const endpoint =
          activeMode === "billing"
            ? "/api/companion/faq"
            : "/api/companion/explain";

        const res = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: next.map((m) => ({
              role: m.role,
              content: m.content,
            })),
          }),
        });
        const data = (await res.json()) as { reply?: string; error?: string };
        if (!res.ok) throw new Error(data.error ?? "Request failed");

        const assistant: CompanionMessage = {
          id: `a-${Date.now()}`,
          role: "assistant",
          content: data.reply ?? "I’m here — try asking another way.",
        };
        const withReply = trimMessages([...next, assistant]);
        setMessages(withReply);
        saveMemory(withReply);
      } catch (err) {
        const assistant: CompanionMessage = {
          id: `a-${Date.now()}`,
          role: "assistant",
          content:
            err instanceof Error
              ? err.message
              : "Something went wrong. Try again in a moment.",
        };
        setMessages((prev) => trimMessages([...prev, assistant]));
      } finally {
        setBusy(false);
      }
    },
    [busy, messages, mode, onBilling, setMessages, setMode, trimMessages],
  );

  if (!panelOpen) return null;

  return (
    <div className="mb-2 w-[min(100vw-2rem,320px)] overflow-hidden rounded-[var(--radius-lg)] border border-border bg-surface shadow-xl">
      <div className="flex items-center justify-between border-b border-border px-3 py-2">
        <div>
          <p className="text-xs font-semibold text-ink">{kit.nameplate}</p>
          <p className="text-[10px] text-ink-tertiary">
            Limited memory · {onBilling ? "Billing help" : "Dashboard help"}
          </p>
        </div>
        <button
          type="button"
          className="text-xs text-ink-tertiary hover:text-ink"
          onClick={() => setPanelOpen(false)}
        >
          Close
        </button>
      </div>

      <div className="flex max-h-56 flex-col gap-2 overflow-y-auto px-3 py-2">
        {messages.length === 0 ? (
          <p className="text-xs text-ink-tertiary">
            Ask anything about{" "}
            {onBilling ? "plans and billing" : "your dashboard"}.
          </p>
        ) : (
          messages.map((m) => (
            <div
              key={m.id}
              className={cn(
                "rounded-[var(--radius-md)] px-2.5 py-1.5 text-xs leading-relaxed",
                m.role === "user"
                  ? "ml-6 bg-accent-subtle text-ink"
                  : "mr-4 bg-canvas text-ink-secondary",
              )}
            >
              {m.content}
            </div>
          ))
        )}
        {busy ? (
          <p className="text-[10px] text-ink-tertiary">Thinking…</p>
        ) : null}
      </div>

      <form
        className="flex gap-2 border-t border-border p-2"
        onSubmit={(e) => {
          e.preventDefault();
          void send(input);
        }}
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a question…"
          className="min-w-0 flex-1 rounded-[var(--radius-md)] border border-border bg-canvas px-2 py-1.5 text-xs text-ink outline-none focus:border-accent"
        />
        <Button type="submit" className="px-3 py-1.5 text-xs" disabled={busy}>
          Send
        </Button>
      </form>

      {!onBilling ? (
        <div className="border-t border-border px-3 py-2">
          <Link
            href="/chat"
            className="text-[11px] font-medium text-accent hover:underline"
            onClick={() => setPanelOpen(false)}
          >
            Open full advisor →
          </Link>
        </div>
      ) : (
        <div className="border-t border-border px-3 py-2 text-[10px] text-ink-tertiary">
          Plans: {PLAN_ORDER.map((id) => PLANS[id].name).join(" · ")}
        </div>
      )}
    </div>
  );
}

export { loadMemory, saveMemory, MEMORY_KEY };
