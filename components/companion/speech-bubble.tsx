"use client";

import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";

export function SpeechBubble({
  text,
  onClick,
  className,
  hint,
}: {
  text: string;
  onClick?: () => void;
  className?: string;
  hint?: string;
}) {
  const interactive = Boolean(onClick);

  return (
    <AnimatePresence mode="wait">
      <motion.button
        key={text}
        type="button"
        onClick={onClick}
        disabled={!interactive}
        initial={{ opacity: 0, y: 8, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -6, scale: 0.96 }}
        transition={{ duration: 0.28, ease: "easeOut" }}
        className={cn(
          // Explicit dark-on-light — do not use text-ink (light in dark mode)
          "relative max-w-[240px] rounded-[18px] border-2 border-slate-900 bg-white px-3.5 py-2.5 text-left text-[12px] font-medium leading-snug text-slate-900 shadow-md",
          interactive && "cursor-pointer hover:scale-[1.02] active:scale-[0.98]",
          !interactive && "cursor-default",
          className,
        )}
      >
        <span className="block text-slate-900">{text}</span>
        {hint ? (
          <span className="mt-1 block text-[10px] font-normal text-slate-500">
            {hint}
          </span>
        ) : null}
        <span
          aria-hidden
          className="absolute -bottom-2 right-6 size-3 rotate-45 border-b-2 border-r-2 border-slate-900 bg-white"
        />
      </motion.button>
    </AnimatePresence>
  );
}
