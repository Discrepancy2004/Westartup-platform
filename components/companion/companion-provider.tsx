"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";
import {
  getCompanionKit,
  resolveCompanionPersona,
} from "@/lib/companion/resolve";
import {
  pickLine,
  type CompanionGender,
  type CompanionKit,
  type CompanionPersonaRecord,
} from "@/lib/companion/personas";
import { useDna } from "@/components/dna/dna-provider";

export type CompanionMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

export type CompanionMode = "dashboard" | "billing" | "explain";

export type BubbleState = {
  text: string;
  hint?: string;
  /** When set, pressing bubble opens mini chat */
  openOnPress?: boolean;
  kind?: "idle" | "explain" | "celebrate" | "prompt";
} | null;

export type CelebratePayload = {
  title: string;
  xp?: number;
  line?: string;
  milestone?: number;
};

type CompanionContextValue = {
  persona: CompanionPersonaRecord;
  kit: CompanionKit;
  gender: CompanionGender;
  expression: "idle" | "speak" | "celebrate";
  bubble: BubbleState;
  setBubble: Dispatch<SetStateAction<BubbleState>>;
  clearBubble: () => void;
  panelOpen: boolean;
  setPanelOpen: (open: boolean) => void;
  mode: CompanionMode;
  setMode: (m: CompanionMode) => void;
  messages: CompanionMessage[];
  setMessages: Dispatch<SetStateAction<CompanionMessage[]>>;
  trimMessages: (msgs: CompanionMessage[]) => CompanionMessage[];
  openChat: (opts?: {
    mode?: CompanionMode;
    seed?: CompanionMessage[];
  }) => void;
  celebrate: (payload: CelebratePayload) => void;
  showExplainBubble: (answer: string, seed: CompanionMessage[]) => void;
  setGenderLocal: (g: CompanionGender) => void;
  explainSeed: CompanionMessage[] | null;
};

const MAX_MESSAGES = 12;

const CompanionContext = createContext<CompanionContextValue | null>(null);

export function CompanionProvider({ children }: { children: ReactNode }) {
  const { dna } = useDna();
  const [genderOverride, setGenderOverride] = useState<CompanionGender | null>(
    null,
  );
  const persona = useMemo(
    () =>
      resolveCompanionPersona({
        dna,
        genderOverride,
      }),
    [dna, genderOverride],
  );
  const kit = useMemo(() => getCompanionKit(persona), [persona]);

  const [bubble, setBubble] = useState<BubbleState>(null);
  const [panelOpen, setPanelOpen] = useState(false);
  const [mode, setMode] = useState<CompanionMode>("dashboard");
  const [messages, setMessages] = useState<CompanionMessage[]>([]);
  const [expression, setExpression] = useState<"idle" | "speak" | "celebrate">(
    "idle",
  );
  const [explainSeed, setExplainSeed] = useState<CompanionMessage[] | null>(
    null,
  );

  const trimMessages = useCallback((msgs: CompanionMessage[]) => {
    return msgs.slice(-MAX_MESSAGES);
  }, []);

  const clearBubble = useCallback(() => setBubble(null), []);

  const openChat = useCallback(
    (opts?: { mode?: CompanionMode; seed?: CompanionMessage[] }) => {
      if (opts?.mode) setMode(opts.mode);
      if (opts?.seed?.length) {
        setMessages(trimMessages(opts.seed));
        setExplainSeed(opts.seed);
      }
      setPanelOpen(true);
      setBubble(null);
      setExpression("speak");
    },
    [trimMessages],
  );

  const showExplainBubble = useCallback(
    (answer: string, seed: CompanionMessage[]) => {
      setExplainSeed(seed);
      setMode("explain");
      setExpression("speak");
      setBubble({
        text: answer.slice(0, 180) + (answer.length > 180 ? "…" : ""),
        hint: "Tap to keep chatting",
        openOnPress: true,
        kind: "explain",
      });
    },
    [],
  );

  const celebrate = useCallback(
    (payload: CelebratePayload) => {
      const line =
        payload.line ??
        pickLine(kit.niceJob, Date.now()) +
          (payload.title ? ` ${payload.title}.` : "");
      setExpression("celebrate");
      setBubble({
        text: line,
        hint: payload.xp ? `+${payload.xp} XP` : undefined,
        kind: "celebrate",
        openOnPress: false,
      });
      window.setTimeout(() => {
        setExpression("idle");
      }, 2800);
      window.setTimeout(() => {
        setBubble((b) => (b?.kind === "celebrate" ? null : b));
      }, 4200);
    },
    [kit.niceJob],
  );

  const value = useMemo(
    () => ({
      persona,
      kit,
      gender: persona.gender,
      expression,
      bubble,
      setBubble,
      clearBubble,
      panelOpen,
      setPanelOpen,
      mode,
      setMode,
      messages,
      setMessages,
      trimMessages,
      openChat,
      celebrate,
      showExplainBubble,
      setGenderLocal: setGenderOverride,
      explainSeed,
    }),
    [
      persona,
      kit,
      expression,
      bubble,
      clearBubble,
      panelOpen,
      mode,
      messages,
      trimMessages,
      openChat,
      celebrate,
      showExplainBubble,
      explainSeed,
    ],
  );

  return (
    <CompanionContext.Provider value={value}>
      {children}
    </CompanionContext.Provider>
  );
}

export function useCompanion(): CompanionContextValue {
  const ctx = useContext(CompanionContext);
  if (!ctx) {
    throw new Error("useCompanion must be used within CompanionProvider");
  }
  return ctx;
}

/** Safe hook when companion may be outside provider (e.g. tests). */
export function useCompanionOptional(): CompanionContextValue | null {
  return useContext(CompanionContext);
}
