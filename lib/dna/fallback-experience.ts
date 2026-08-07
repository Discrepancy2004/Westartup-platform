import type { ThemeExperience } from "@/lib/dna/types";

/** Slim client fallback so DnaProvider does not ship the full theme catalog. */
export const FALLBACK_EXPERIENCE: ThemeExperience = {
  id: "general",
  label: "Startup",
  industryPhrase: "your startup",
  welcomeLine: "Ready to pressure-test your startup today?",
  chatTitle: "Chat",
  dashboardTitle: "Investor workspace",
  dashboardSubtitle:
    "Story, market, economics, financials, traction, and raise - generated from onboarding, then refined in chat.",
  navChat: "Chat",
  navDashboard: "Dashboard",
  advisorLabel: "Advisor",
  chatPlaceholder: "Answer the challenge — or push back with evidence…",
  emptyChatTitle: "Let's build your startup workspace.",
  emptyChatBody:
    "Challenge assumptions, sharpen the story, and prepare for real investor questions.",
  emptyDashboardTitle: "Your investor pack is ready to generate.",
  emptyDashboardBody:
    "Create the full set: market, unit economics, traction, burn, GTM, milestones, and more.",
  generateCta: "Generate investor docs",
  bootstrapRunning: "Building your investor documents…",
  bootstrapDone: "Investor documents ready.",
  suggestions: [
    "Pressure-test the idea",
    "Clarify who pays",
    "Map go-to-market",
    "Unit economics sketch",
  ],
  widgets: [
    { title: "SOM", hint: "Obtainable market", slot: "som" },
    { title: "Year-1 revenue", hint: "Illustrative", slot: "y1Revenue" },
    { title: "LTV:CAC", hint: "Unit economics", slot: "ltvCac" },
    { title: "Runway", hint: "Months left", slot: "runway" },
  ],
  sectionTitles: {
    story: "Story",
    market: "Market & competition",
    economics: "Unit economics & revenue",
    financials: "Financials & runway",
    traction: "Traction & GTM",
    team: "Team & raise",
  },
  kindLabels: {},
  icons: { spark: "✦", primary: "◎", secondary: "◈" },
  accent: {
    accent: "#0f766e",
    accentHover: "#0d9488",
    accentSubtle: "#ccfbf1",
    accentDark: "#14b8a6",
    accentHoverDark: "#2dd4bf",
    accentSubtleDark: "#134e4a",
    gradientFrom: "#0f766e",
    gradientTo: "#0d9488",
  },
  aiFocus:
    "Vertical not strongly identified. Infer industry carefully from founder answers and stay concrete about who pays and why now.",
};
