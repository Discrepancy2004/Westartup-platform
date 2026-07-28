"use client";

import { motion } from "framer-motion";
import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { AvatarFigure } from "@/components/companion/avatar-figure";
import { CompanionChat, loadMemory } from "@/components/companion/companion-chat";
import { useCompanion } from "@/components/companion/companion-provider";
import { SpeechBubble } from "@/components/companion/speech-bubble";
import { pickLine, type CompanionGender } from "@/lib/companion/personas";
import { cn } from "@/lib/utils";

export function CompanionShell() {
  const pathname = usePathname();
  const hidden = Boolean(pathname?.startsWith("/chat"));
  const {
    kit,
    gender,
    expression,
    bubble,
    setBubble,
    clearBubble,
    panelOpen,
    setPanelOpen,
    openChat,
    setMessages,
    setMode,
    setGenderLocal,
    explainSeed,
  } = useCompanion();

  const idleTimer = useRef<number | null>(null);

  useEffect(() => {
    if (hidden || !panelOpen) return;
    const mem = loadMemory();
    if (mem.length && !explainSeed?.length) {
      setMessages(mem);
    }
  }, [hidden, panelOpen, explainSeed, setMessages]);

  useEffect(() => {
    if (
      hidden ||
      panelOpen ||
      bubble?.kind === "celebrate" ||
      bubble?.kind === "explain"
    ) {
      if (idleTimer.current) window.clearInterval(idleTimer.current);
      return;
    }

    const tick = () => {
      setBubble({
        text: pickLine(kit.encouragement),
        kind: "idle",
        openOnPress: true,
        hint: "Tap to chat",
      });
      window.setTimeout(() => {
        setBubble((b) => (b?.kind === "idle" ? null : b));
      }, 5000);
    };

    idleTimer.current = window.setInterval(tick, 15 * 60 * 1000);
    const first = window.setTimeout(tick, 8 * 60 * 1000);
    return () => {
      if (idleTimer.current) window.clearInterval(idleTimer.current);
      window.clearTimeout(first);
    };
  }, [hidden, panelOpen, bubble?.kind, kit.encouragement, setBubble]);

  useEffect(() => {
    if (hidden || typeof window === "undefined") return;
    const key = "westartup-companion-gender-asked";
    if (localStorage.getItem(key) || localStorage.getItem("westartup-has-gender")) {
      return;
    }
    const t = window.setTimeout(() => {
      if (
        localStorage.getItem(key) ||
        localStorage.getItem("westartup-has-gender")
      ) {
        return;
      }
      setBubble({
        text: "Pick Boy or Girl for your guide",
        kind: "prompt",
        openOnPress: false,
      });
    }, 4000);
    return () => window.clearTimeout(t);
  }, [hidden, setBubble]);

  if (hidden) return null;

  function setModeFromPath() {
    if (pathname?.startsWith("/billing")) setMode("billing");
    else setMode("dashboard");
  }

  function onBubblePress() {
    if (bubble?.kind === "explain" && explainSeed?.length) {
      openChat({ mode: "explain", seed: explainSeed });
      return;
    }
    if (bubble?.openOnPress) {
      setModeFromPath();
      openChat();
    }
  }

  function chooseGender(g: CompanionGender) {
    setGenderLocal(g);
    localStorage.setItem("westartup-companion-gender-asked", "1");
    localStorage.setItem("westartup-has-gender", g);
    void fetch("/api/companion/persona", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ gender: g }),
    }).catch(() => null);
    clearBubble();
    setBubble({
      text: "Got it — I’m your guide!",
      kind: "idle",
      openOnPress: true,
      hint: "Tap to chat",
    });
  }

  return (
    <div className="companion-root pointer-events-none fixed bottom-5 right-4 z-[55] flex flex-col items-end gap-2">
      <div className="pointer-events-auto">
        <CompanionChat />
      </div>

      {bubble && !panelOpen ? (
        <div className="pointer-events-auto mb-1 mr-1">
          <SpeechBubble
            text={bubble.text}
            hint={bubble.hint}
            className="ml-auto"
            onClick={
              bubble.kind === "prompt"
                ? undefined
                : bubble.openOnPress || bubble.kind === "explain"
                  ? onBubblePress
                  : undefined
            }
          />
          {bubble.kind === "prompt" ? (
            <div className="mt-2 flex justify-end gap-2">
              {(["boy", "girl"] as const).map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => chooseGender(g)}
                  className="rounded-full border border-border bg-surface px-3 py-1 text-[11px] font-medium capitalize text-ink shadow-sm hover:border-accent"
                >
                  {g}
                </button>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}

      <motion.button
        type="button"
        aria-label={`Open ${kit.nameplate}`}
        className={cn(
          "pointer-events-auto relative rounded-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
        )}
        whileHover={{ scale: 1.05, y: -2 }}
        whileTap={{ scale: 0.95 }}
        animate={
          expression === "celebrate"
            ? { scale: [1, 1.08, 1], y: [0, -6, 0] }
            : { y: [0, -3, 0] }
        }
        transition={
          expression === "celebrate"
            ? { duration: 0.45, ease: "easeOut" }
            : { duration: 2.8, repeat: Infinity, ease: "easeInOut" }
        }
        onClick={() => {
          if (panelOpen) {
            setPanelOpen(false);
            return;
          }
          setModeFromPath();
          openChat(
            bubble?.kind === "explain" && explainSeed?.length
              ? { mode: "explain", seed: explainSeed }
              : undefined,
          );
        }}
      >
        <AvatarFigure
          gender={gender}
          kit={kit}
          expression={expression}
          pose={panelOpen ? "stand" : "circle"}
          size={panelOpen ? 88 : 76}
        />
        <span className="absolute -bottom-0.5 left-1/2 max-w-[96px] -translate-x-1/2 truncate rounded-full border border-border bg-surface px-1.5 py-0.5 text-[8px] font-semibold uppercase tracking-wide text-ink-secondary shadow-sm">
          {kit.nameplate}
        </span>
        {expression === "celebrate" ? (
          <span className="pointer-events-none absolute inset-0 animate-ping rounded-full bg-emerald-400/20" />
        ) : null}
      </motion.button>
    </div>
  );
}
