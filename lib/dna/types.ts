import { z } from "zod";

export const STARTUP_THEME_IDS = [
  "health",
  "fintech",
  "education",
  "fashion",
  "food",
  "ai",
  "travel",
  "saas",
  "marketplace",
  "general",
] as const;

export type StartupThemeId = (typeof STARTUP_THEME_IDS)[number];

export const startupDnaSchema = z.object({
  theme: z.enum(STARTUP_THEME_IDS),
  secondaryThemes: z.array(z.enum(STARTUP_THEME_IDS)).default([]),
  confidence: z.number().min(0).max(1),
  keywordsFound: z.array(z.string()).default([]),
  scores: z.record(z.string(), z.number()).optional(),
  detectedAt: z.string(),
});

export type StartupDna = z.infer<typeof startupDnaSchema>;

export type ThemeAccent = {
  accent: string;
  accentHover: string;
  accentSubtle: string;
  accentDark: string;
  accentHoverDark: string;
  accentSubtleDark: string;
  gradientFrom: string;
  gradientTo: string;
};

export type ThemeExperience = {
  id: StartupThemeId;
  label: string;
  /** Short industry phrase used in welcome lines — never say "we detected". */
  industryPhrase: string;
  welcomeLine: string;
  chatTitle: string;
  dashboardTitle: string;
  dashboardSubtitle: string;
  navChat: string;
  navDashboard: string;
  advisorLabel: string;
  chatPlaceholder: string;
  emptyChatTitle: string;
  emptyChatBody: string;
  emptyDashboardTitle: string;
  emptyDashboardBody: string;
  generateCta: string;
  bootstrapRunning: string;
  bootstrapDone: string;
  suggestions: string[];
  widgets: { title: string; hint: string }[];
  kindLabels: Partial<
    Record<
      | "idea-brief"
      | "financial-projections"
      | "revenue-model"
      | "market-sizing"
      | "team-overview"
      | "deal-structure",
      string
    >
  >;
  icons: { spark: string; primary: string; secondary: string };
  accent: ThemeAccent;
  /** Hidden block injected into AI system prompt — never shown in UI. */
  aiFocus: string;
};
