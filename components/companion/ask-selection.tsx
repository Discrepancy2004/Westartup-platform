"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useCompanionOptional } from "@/components/companion/companion-provider";
import { cn } from "@/lib/utils";

type MenuState = {
  x: number;
  y: number;
  text: string;
} | null;

/**
 * Dashboard-only: select text → right-click → Ask companion.
 * First answer appears as a speech bubble; tap bubble to continue in mini chat.
 */
export function AskCompanionSelection() {
  const pathname = usePathname();
  const companion = useCompanionOptional();
  const [menu, setMenu] = useState<MenuState>(null);
  const [loading, setLoading] = useState(false);

  const enabled =
    Boolean(companion) &&
    Boolean(pathname?.startsWith("/dashboard"));

  useEffect(() => {
    if (!enabled) return;

    function onContextMenu(e: MouseEvent) {
      const sel = window.getSelection()?.toString().trim() ?? "";
      if (sel.length < 8) return;

      const target = e.target as HTMLElement | null;
      if (
        target?.closest(
          "input, textarea, [contenteditable='true'], .companion-root",
        )
      ) {
        return;
      }

      e.preventDefault();
      setMenu({ x: e.clientX, y: e.clientY, text: sel.slice(0, 500) });
    }

    function onClick() {
      setMenu(null);
    }

    document.addEventListener("contextmenu", onContextMenu);
    document.addEventListener("click", onClick);
    return () => {
      document.removeEventListener("contextmenu", onContextMenu);
      document.removeEventListener("click", onClick);
    };
  }, [enabled]);

  if (!enabled || !companion) return null;

  async function ask() {
    if (!menu || loading || !companion) return;
    const selected = menu.text;
    const api = companion;
    setMenu(null);
    setLoading(true);
    api.setBubble({
      text: "Looking that up…",
      kind: "explain",
      openOnPress: false,
    });

    try {
      const userContent = `Explain this from my dashboard: "${selected}"`;
      const res = await fetch("/api/companion/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: userContent }],
          selectedText: selected,
        }),
      });
      const data = (await res.json()) as { reply?: string; error?: string };
      if (!res.ok) throw new Error(data.error ?? "Could not explain");

      const reply =
        data.reply?.trim() ||
        "I can help unpack that — tap to keep chatting.";

      api.showExplainBubble(reply, [
        {
          id: `u-${Date.now()}`,
          role: "user",
          content: userContent,
        },
        {
          id: `a-${Date.now()}`,
          role: "assistant",
          content: reply,
        },
      ]);
    } catch (err) {
      api.setBubble({
        text:
          err instanceof Error
            ? err.message
            : "Couldn’t explain that — try again.",
        kind: "idle",
        openOnPress: true,
        hint: "Tap to chat",
      });
    } finally {
      setLoading(false);
    }
  }

  return menu ? (
    <div
      className={cn(
        "fixed z-[70] min-w-[160px] overflow-hidden rounded-[var(--radius-md)] border border-border bg-surface py-1 shadow-xl",
      )}
      style={{ left: menu.x, top: menu.y }}
      role="menu"
    >
      <button
        type="button"
        className="block w-full px-3 py-2 text-left text-xs font-medium text-ink hover:bg-accent-subtle"
        onClick={(e) => {
          e.stopPropagation();
          void ask();
        }}
        disabled={loading}
      >
        Ask companion
      </button>
    </div>
  ) : null;
}
