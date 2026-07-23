"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  type ReactNode,
} from "react";
import { getThemeExperience } from "@/lib/dna/catalog";
import type { StartupDna, ThemeExperience } from "@/lib/dna/types";

type DnaContextValue = {
  dna: StartupDna;
  experience: ThemeExperience;
  secondaryLabels: string[];
};

const DnaContext = createContext<DnaContextValue | null>(null);

const FALLBACK_DNA: StartupDna = {
  theme: "general",
  secondaryThemes: [],
  confidence: 0.3,
  keywordsFound: [],
  detectedAt: new Date(0).toISOString(),
};

export function DnaProvider({
  dna,
  secondaryLabels = [],
  children,
}: {
  dna: StartupDna | null;
  secondaryLabels?: string[];
  children: ReactNode;
}) {
  const resolved = dna ?? FALLBACK_DNA;
  const experience = useMemo(
    () => getThemeExperience(resolved.theme),
    [resolved.theme],
  );

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.startupTheme = resolved.theme;
    const a = experience.accent;
    root.style.setProperty("--dna-accent", a.accent);
    root.style.setProperty("--dna-accent-hover", a.accentHover);
    root.style.setProperty("--dna-accent-subtle", a.accentSubtle);
    root.style.setProperty("--dna-accent-dark", a.accentDark);
    root.style.setProperty("--dna-accent-hover-dark", a.accentHoverDark);
    root.style.setProperty("--dna-accent-subtle-dark", a.accentSubtleDark);
    root.style.setProperty("--dna-gradient-from", a.gradientFrom);
    root.style.setProperty("--dna-gradient-to", a.gradientTo);

    return () => {
      delete root.dataset.startupTheme;
      root.style.removeProperty("--dna-accent");
      root.style.removeProperty("--dna-accent-hover");
      root.style.removeProperty("--dna-accent-subtle");
      root.style.removeProperty("--dna-accent-dark");
      root.style.removeProperty("--dna-accent-hover-dark");
      root.style.removeProperty("--dna-accent-subtle-dark");
      root.style.removeProperty("--dna-gradient-from");
      root.style.removeProperty("--dna-gradient-to");
    };
  }, [resolved.theme, experience.accent]);

  const value = useMemo(
    () => ({
      dna: resolved,
      experience,
      secondaryLabels,
    }),
    [resolved, experience, secondaryLabels],
  );

  return <DnaContext.Provider value={value}>{children}</DnaContext.Provider>;
}

export function useDna(): DnaContextValue {
  const ctx = useContext(DnaContext);
  if (!ctx) {
    return {
      dna: FALLBACK_DNA,
      experience: getThemeExperience("general"),
      secondaryLabels: [],
    };
  }
  return ctx;
}
