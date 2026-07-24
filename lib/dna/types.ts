import { z } from "zod";
import type { ArtifactKind } from "@/lib/types/artifacts";

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
  companionPersona: z
    .object({
      gender: z.enum(["boy", "girl"]),
      id: z.string(),
      label: z.string(),
      source: z.enum(["kit", "learned"]),
      learnedAt: z.string().optional(),
    })
    .optional(),
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

export type DashboardSectionId =
  | "story"
  | "market"
  | "economics"
  | "financials"
  | "traction"
  | "team";

export type ThemeExperience = {
  id: StartupThemeId;
  label: string;
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
  /** Four KPI strip slots — titles/hints; values come from artifacts. */
  widgets: { title: string; hint: string; slot: KpiSlot }[];
  sectionTitles: Record<DashboardSectionId, string>;
  kindLabels: Partial<Record<ArtifactKind, string>>;
  icons: { spark: string; primary: string; secondary: string };
  accent: ThemeAccent;
  aiFocus: string;
};

export type KpiSlot = "som" | "y1Revenue" | "ltvCac" | "runway";
