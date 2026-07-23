import type { StartupThemeId, ThemeExperience } from "@/lib/dna/types";

const baseKindLabels = {
  "idea-brief": "Idea brief",
  "financial-projections": "Financial projections",
  "revenue-model": "Revenue model",
  "market-sizing": "Market sizing",
  "team-overview": "Team overview",
  "deal-structure": "Deal structure",
} as const;

function experience(
  partial: Omit<ThemeExperience, "kindLabels"> & {
    kindLabels?: ThemeExperience["kindLabels"];
  },
): ThemeExperience {
  return {
    ...partial,
    kindLabels: { ...baseKindLabels, ...partial.kindLabels },
  };
}

export const THEME_CATALOG: Record<StartupThemeId, ThemeExperience> = {
  fashion: experience({
    id: "fashion",
    label: "Fashion",
    industryPhrase: "Fashion Commerce",
    welcomeLine: "Let's build the future of Fashion Commerce.",
    chatTitle: "Studio",
    dashboardTitle: "Fashion Command Center",
    dashboardSubtitle:
      "Designer growth, marketplace health, and creator traction — updated as you refine the brand.",
    navChat: "Studio",
    navDashboard: "Runway",
    advisorLabel: "Advisor",
    chatPlaceholder: "Ask about acquisition, pricing, or marketplace liquidity…",
    emptyChatTitle: "Let's build your Fashion Marketplace.",
    emptyChatBody:
      "Pressure-test brand positioning, designer supply, and what customers will actually pay for.",
    emptyDashboardTitle: "Your fashion workspace is ready.",
    emptyDashboardBody:
      "Generate documents tailored to apparel, creators, and two-sided fashion markets.",
    generateCta: "Generate fashion docs",
    bootstrapRunning: "Building your fashion workspace documents…",
    bootstrapDone: "Fashion documents ready.",
    suggestions: [
      "Validate marketplace liquidity",
      "Find ideal commission %",
      "Designer acquisition strategy",
      "Pricing model for apparel",
    ],
    widgets: [
      { title: "Designer Network", hint: "Supply-side density" },
      { title: "Marketplace Health", hint: "Buyer ↔ seller balance" },
      { title: "Creator Growth", hint: "Audience momentum" },
      { title: "Model Acquisition", hint: "Talent pipeline" },
    ],
    kindLabels: {
      "idea-brief": "Brand brief",
      "revenue-model": "Commerce mix",
      "market-sizing": "Fashion TAM",
      "team-overview": "Studio team",
    },
    icons: { spark: "✨", primary: "👗", secondary: "🎨" },
    accent: {
      accent: "#a21caf",
      accentHover: "#c026d3",
      accentSubtle: "#fae8ff",
      accentDark: "#e879f9",
      accentHoverDark: "#f0abfc",
      accentSubtleDark: "#4a044e",
      gradientFrom: "#a21caf",
      gradientTo: "#db2777",
    },
    aiFocus:
      "Primary vertical: Fashion. Emphasize brand positioning, designer/creator supply, apparel unit economics, seasonal inventory risk, and marketplace liquidity when relevant.",
  }),

  fintech: experience({
    id: "fintech",
    label: "FinTech",
    industryPhrase: "FinTech",
    welcomeLine: "Ready to improve your FinTech startup today?",
    chatTitle: "War Room",
    dashboardTitle: "FinTech Control Deck",
    dashboardSubtitle:
      "Volume, activation, trust, and revenue — investor-grade views for financial products.",
    navChat: "War Room",
    navDashboard: "Ledger",
    advisorLabel: "Advisor",
    chatPlaceholder: "Ask about compliance, pricing, or acquisition funnels…",
    emptyChatTitle: "Let's validate your FinTech business.",
    emptyChatBody:
      "Challenge unit economics, trust, and the path from first transaction to retention.",
    emptyDashboardTitle: "Your FinTech workspace is ready.",
    emptyDashboardBody:
      "Generate documents focused on transaction economics, trust, and regulated growth.",
    generateCta: "Generate FinTech docs",
    bootstrapRunning: "Building your FinTech workspace documents…",
    bootstrapDone: "FinTech documents ready.",
    suggestions: [
      "Compliance checklist",
      "Revenue model stress-test",
      "Customer acquisition channels",
      "Pricing and take-rate",
    ],
    widgets: [
      { title: "Transaction Volume", hint: "GMV / TPV" },
      { title: "Monthly Revenue", hint: "Net take" },
      { title: "Activation Funnel", hint: "Signup → first txn" },
      { title: "Trust Score", hint: "Risk & KYC posture" },
    ],
    kindLabels: {
      "idea-brief": "Product brief",
      "financial-projections": "TPV projections",
      "revenue-model": "Take-rate model",
      "market-sizing": "Addressable finance",
    },
    icons: { spark: "💳", primary: "👛", secondary: "🪙" },
    accent: {
      accent: "#0369a1",
      accentHover: "#0284c7",
      accentSubtle: "#e0f2fe",
      accentDark: "#38bdf8",
      accentHoverDark: "#7dd3fc",
      accentSubtleDark: "#0c4a6e",
      gradientFrom: "#0369a1",
      gradientTo: "#06b6d4",
    },
    aiFocus:
      "Primary vertical: FinTech. Emphasize trust, compliance, unit economics per transaction, activation, and regulatory risk. Be concrete about INR flows when relevant.",
  }),

  education: experience({
    id: "education",
    label: "Education",
    industryPhrase: "Education",
    welcomeLine: "Let's grow what learners actually finish.",
    chatTitle: "Campus",
    dashboardTitle: "Learning Ops",
    dashboardSubtitle:
      "Enrollment, completion, course revenue, and retention — signals that matter in EdTech.",
    navChat: "Campus",
    navDashboard: "Learning",
    advisorLabel: "Advisor",
    chatPlaceholder: "Ask about course pricing, retention, or GTM…",
    emptyChatTitle: "Let's build your Education product.",
    emptyChatBody:
      "Pressure-test learning outcomes, pricing, and why students stay past week one.",
    emptyDashboardTitle: "Your EdTech workspace is ready.",
    emptyDashboardBody:
      "Generate documents around student growth, completion, and sustainable course revenue.",
    generateCta: "Generate EdTech docs",
    bootstrapRunning: "Building your education workspace documents…",
    bootstrapDone: "Education documents ready.",
    suggestions: [
      "Course pricing strategy",
      "Retention ideas",
      "Go-to-market for learners",
      "Completion rate levers",
    ],
    widgets: [
      { title: "Student Growth", hint: "Enrollments" },
      { title: "Completion Rate", hint: "Finish % " },
      { title: "Course Revenue", hint: "ARPU / packs" },
      { title: "Retention", hint: "Week-4 stickiness" },
    ],
    kindLabels: {
      "idea-brief": "Learning brief",
      "revenue-model": "Course monetization",
      "market-sizing": "Learner TAM",
      "team-overview": "Faculty & ops",
    },
    icons: { spark: "🎓", primary: "📚", secondary: "✏️" },
    accent: {
      accent: "#c2410c",
      accentHover: "#ea580c",
      accentSubtle: "#ffedd5",
      accentDark: "#fb923c",
      accentHoverDark: "#fdba74",
      accentSubtleDark: "#7c2d12",
      gradientFrom: "#ea580c",
      gradientTo: "#f59e0b",
    },
    aiFocus:
      "Primary vertical: Education / EdTech. Emphasize learning outcomes, completion, pricing packs, acquisition CAC for students, and retention after purchase.",
  }),

  food: experience({
    id: "food",
    label: "Food",
    industryPhrase: "Food & Hospitality",
    welcomeLine: "Let's make Food & Hospitality work unit by unit.",
    chatTitle: "Kitchen",
    dashboardTitle: "Kitchen Board",
    dashboardSubtitle:
      "Orders, capacity, repeats, and delivery reach — ops metrics for food businesses.",
    navChat: "Kitchen",
    navDashboard: "Service",
    advisorLabel: "Advisor",
    chatPlaceholder: "Ask about unit economics, delivery, or repeat rates…",
    emptyChatTitle: "Let's build your Food business.",
    emptyChatBody:
      "Challenge margins, kitchen capacity, and what keeps customers ordering again.",
    emptyDashboardTitle: "Your food workspace is ready.",
    emptyDashboardBody:
      "Generate documents around orders, capacity, and sustainable delivery economics.",
    generateCta: "Generate food docs",
    bootstrapRunning: "Building your food workspace documents…",
    bootstrapDone: "Food documents ready.",
    suggestions: [
      "Order economics",
      "Kitchen capacity plan",
      "Repeat customer loops",
      "Delivery radius strategy",
    ],
    widgets: [
      { title: "Orders", hint: "Daily / weekly" },
      { title: "Kitchen Capacity", hint: "Throughput" },
      { title: "Repeat Customers", hint: "Loyalty" },
      { title: "Delivery Radius", hint: "Coverage" },
    ],
    kindLabels: {
      "idea-brief": "Concept brief",
      "revenue-model": "Menu & channels",
      "market-sizing": "Local demand",
      "team-overview": "Kitchen team",
    },
    icons: { spark: "👨‍🍳", primary: "🍽", secondary: "🛵" },
    accent: {
      accent: "#b45309",
      accentHover: "#d97706",
      accentSubtle: "#fef3c7",
      accentDark: "#fbbf24",
      accentHoverDark: "#fcd34d",
      accentSubtleDark: "#78350f",
      gradientFrom: "#b45309",
      gradientTo: "#dc2626",
    },
    aiFocus:
      "Primary vertical: Food / hospitality. Emphasize contribution margin per order, kitchen capacity, delivery CAC, and repeat purchase behavior.",
  }),

  health: experience({
    id: "health",
    label: "Healthcare",
    industryPhrase: "Healthcare",
    welcomeLine: "Let's build Healthcare that patients and providers trust.",
    chatTitle: "Clinic",
    dashboardTitle: "Care Ops",
    dashboardSubtitle:
      "Patient growth, trust, utilization, and outcomes — signals for health startups.",
    navChat: "Clinic",
    navDashboard: "Care",
    advisorLabel: "Advisor",
    chatPlaceholder: "Ask about trust, adoption, or provider workflows…",
    emptyChatTitle: "Let's validate your Healthcare startup.",
    emptyChatBody:
      "Pressure-test clinical trust, adoption, and who actually pays for care.",
    emptyDashboardTitle: "Your healthcare workspace is ready.",
    emptyDashboardBody:
      "Generate documents focused on trust, utilization, and sustainable care economics.",
    generateCta: "Generate health docs",
    bootstrapRunning: "Building your healthcare workspace documents…",
    bootstrapDone: "Healthcare documents ready.",
    suggestions: [
      "Trust & compliance checklist",
      "Provider acquisition",
      "Patient retention",
      "Who pays — payer map",
    ],
    widgets: [
      { title: "Patient Growth", hint: "Active users" },
      { title: "Trust Score", hint: "Safety posture" },
      { title: "Utilization", hint: "Visits / seats" },
      { title: "Care Outcomes", hint: "Quality signals" },
    ],
    kindLabels: {
      "idea-brief": "Care brief",
      "revenue-model": "Care monetization",
      "market-sizing": "Patient TAM",
      "team-overview": "Clinical team",
    },
    icons: { spark: "❤️", primary: "🛡", secondary: "🩺" },
    accent: {
      accent: "#047857",
      accentHover: "#059669",
      accentSubtle: "#d1fae5",
      accentDark: "#34d399",
      accentHoverDark: "#6ee7b7",
      accentSubtleDark: "#064e3b",
      gradientFrom: "#047857",
      gradientTo: "#0d9488",
    },
    aiFocus:
      "Primary vertical: Healthcare. Emphasize trust, clinical/ops adoption, who pays (patient vs insurer vs provider), and regulatory caution without fear-mongering.",
  }),

  ai: experience({
    id: "ai",
    label: "AI",
    industryPhrase: "AI Products",
    welcomeLine: "Let's ship AI Products people actually keep using.",
    chatTitle: "Lab",
    dashboardTitle: "Model Ops",
    dashboardSubtitle:
      "Usage, retention, automation ROI, and moat — what investors probe in AI.",
    navChat: "Lab",
    navDashboard: "Models",
    advisorLabel: "Advisor",
    chatPlaceholder: "Ask about moat, usage, or automation ROI…",
    emptyChatTitle: "Let's build your AI product.",
    emptyChatBody:
      "Challenge differentiation, evals, and whether usage turns into paid retention.",
    emptyDashboardTitle: "Your AI workspace is ready.",
    emptyDashboardBody:
      "Generate documents around usage, retention, and defensible automation value.",
    generateCta: "Generate AI docs",
    bootstrapRunning: "Building your AI workspace documents…",
    bootstrapDone: "AI documents ready.",
    suggestions: [
      "Moat vs wrappers",
      "Usage → revenue path",
      "Eval & quality plan",
      "Enterprise GTM",
    ],
    widgets: [
      { title: "Active Usage", hint: "WAU / queries" },
      { title: "Automation ROI", hint: "Hours saved" },
      { title: "Retention", hint: "Week-4 stickiness" },
      { title: "Moat Signals", hint: "Data / workflow lock-in" },
    ],
    kindLabels: {
      "idea-brief": "Product brief",
      "revenue-model": "Usage monetization",
      "market-sizing": "AI spend TAM",
    },
    icons: { spark: "✦", primary: "🤖", secondary: "⚡" },
    accent: {
      accent: "#4f46e5",
      accentHover: "#6366f1",
      accentSubtle: "#e0e7ff",
      accentDark: "#818cf8",
      accentHoverDark: "#a5b4fc",
      accentSubtleDark: "#312e81",
      gradientFrom: "#4f46e5",
      gradientTo: "#7c3aed",
    },
    aiFocus:
      "Primary vertical: AI products. Emphasize differentiation vs wrappers, evaluation quality, usage retention, data/workflow moat, and realistic cost of inference.",
  }),

  travel: experience({
    id: "travel",
    label: "Travel",
    industryPhrase: "Travel",
    welcomeLine: "Let's build Travel experiences people book twice.",
    chatTitle: "Desk",
    dashboardTitle: "Travel Board",
    dashboardSubtitle:
      "Bookings, repeat trips, partner supply, and seasonality — travel-native metrics.",
    navChat: "Desk",
    navDashboard: "Trips",
    advisorLabel: "Advisor",
    chatPlaceholder: "Ask about bookings, partners, or seasonality…",
    emptyChatTitle: "Let's build your Travel startup.",
    emptyChatBody:
      "Pressure-test demand seasonality, partner supply, and booking conversion.",
    emptyDashboardTitle: "Your travel workspace is ready.",
    emptyDashboardBody:
      "Generate documents around bookings, partners, and sustainable trip economics.",
    generateCta: "Generate travel docs",
    bootstrapRunning: "Building your travel workspace documents…",
    bootstrapDone: "Travel documents ready.",
    suggestions: [
      "Booking conversion",
      "Partner supply strategy",
      "Seasonality plan",
      "Repeat traveler loops",
    ],
    widgets: [
      { title: "Bookings", hint: "Confirmed trips" },
      { title: "Partner Supply", hint: "Hotels / hosts" },
      { title: "Repeat Travelers", hint: "Loyalty" },
      { title: "Seasonality", hint: "Demand curve" },
    ],
    kindLabels: {
      "idea-brief": "Trip brief",
      "revenue-model": "Booking mix",
      "market-sizing": "Travel TAM",
    },
    icons: { spark: "✈", primary: "🗺", secondary: "🛎" },
    accent: {
      accent: "#0e7490",
      accentHover: "#0891b2",
      accentSubtle: "#cffafe",
      accentDark: "#22d3ee",
      accentHoverDark: "#67e8f9",
      accentSubtleDark: "#164e63",
      gradientFrom: "#0e7490",
      gradientTo: "#2563eb",
    },
    aiFocus:
      "Primary vertical: Travel. Emphasize seasonality, partner supply, booking conversion, and repeat travel behavior.",
  }),

  saas: experience({
    id: "saas",
    label: "SaaS",
    industryPhrase: "B2B SaaS",
    welcomeLine: "Let's sharpen your B2B SaaS story.",
    chatTitle: "Workspace",
    dashboardTitle: "SaaS Command",
    dashboardSubtitle:
      "MRR path, activation, retention, and pipeline — classic SaaS investor views.",
    navChat: "Workspace",
    navDashboard: "Metrics",
    advisorLabel: "Advisor",
    chatPlaceholder: "Ask about activation, pricing, or retention…",
    emptyChatTitle: "Let's build your SaaS product.",
    emptyChatBody:
      "Challenge activation, willingness-to-pay, and the wedge that expands seats.",
    emptyDashboardTitle: "Your SaaS workspace is ready.",
    emptyDashboardBody:
      "Generate documents around MRR, retention, and a credible growth path.",
    generateCta: "Generate SaaS docs",
    bootstrapRunning: "Building your SaaS workspace documents…",
    bootstrapDone: "SaaS documents ready.",
    suggestions: [
      "Pricing & packaging",
      "Activation checklist",
      "Retention levers",
      "Expansion revenue",
    ],
    widgets: [
      { title: "MRR Path", hint: "Recurring revenue" },
      { title: "Activation", hint: "Time-to-value" },
      { title: "Retention", hint: "Logo / net" },
      { title: "Pipeline", hint: "Sales motion" },
    ],
    kindLabels: {
      "idea-brief": "Product brief",
      "financial-projections": "MRR projections",
      "revenue-model": "Subscription mix",
    },
    icons: { spark: "▣", primary: "📊", secondary: "⚙" },
    accent: {
      accent: "#0f766e",
      accentHover: "#0d9488",
      accentSubtle: "#ccfbf1",
      accentDark: "#14b8a6",
      accentHoverDark: "#2dd4bf",
      accentSubtleDark: "#134e4a",
      gradientFrom: "#0f766e",
      gradientTo: "#2563eb",
    },
    aiFocus:
      "Primary vertical: B2B SaaS. Emphasize activation, retention, pricing/packaging, seat expansion, and credible pipeline — not vanity TAM.",
  }),

  marketplace: experience({
    id: "marketplace",
    label: "Marketplace",
    industryPhrase: "Marketplace",
    welcomeLine: "Let's balance both sides of your Marketplace.",
    chatTitle: "Exchange",
    dashboardTitle: "Marketplace Pulse",
    dashboardSubtitle:
      "Liquidity, take rate, supply density, and GMV — two-sided health in one view.",
    navChat: "Exchange",
    navDashboard: "Pulse",
    advisorLabel: "Advisor",
    chatPlaceholder: "Ask about liquidity, take rate, or supply…",
    emptyChatTitle: "Let's build your Marketplace.",
    emptyChatBody:
      "Pressure-test chicken-and-egg, take rate, and which side you win first.",
    emptyDashboardTitle: "Your marketplace workspace is ready.",
    emptyDashboardBody:
      "Generate documents around liquidity, GMV, and sustainable take-rate economics.",
    generateCta: "Generate marketplace docs",
    bootstrapRunning: "Building your marketplace workspace documents…",
    bootstrapDone: "Marketplace documents ready.",
    suggestions: [
      "Liquidity playbook",
      "Ideal take rate",
      "Supply acquisition",
      "Demand-side GTM",
    ],
    widgets: [
      { title: "Liquidity", hint: "Match rate" },
      { title: "Take Rate", hint: "Net % " },
      { title: "Supply Density", hint: "Vendors / geo" },
      { title: "GMV", hint: "Gross volume" },
    ],
    kindLabels: {
      "idea-brief": "Marketplace brief",
      "revenue-model": "Take-rate model",
      "market-sizing": "GMV opportunity",
    },
    icons: { spark: "⇄", primary: "🏪", secondary: "📦" },
    accent: {
      accent: "#7c3aed",
      accentHover: "#8b5cf6",
      accentSubtle: "#ede9fe",
      accentDark: "#a78bfa",
      accentHoverDark: "#c4b5fd",
      accentSubtleDark: "#4c1d95",
      gradientFrom: "#7c3aed",
      gradientTo: "#db2777",
    },
    aiFocus:
      "Primary vertical: Marketplace. Emphasize two-sided liquidity, which side to win first, take rate, and concentration risk on supply or demand.",
  }),

  general: experience({
    id: "general",
    label: "Startup",
    industryPhrase: "your startup",
    welcomeLine: "Ready to pressure-test your startup today?",
    chatTitle: "Chat",
    dashboardTitle: "Dashboard",
    dashboardSubtitle:
      "Live investor documents. Generated from onboarding, then updated as you refine the idea.",
    navChat: "Chat",
    navDashboard: "Dashboard",
    advisorLabel: "Advisor",
    chatPlaceholder: "Answer the challenge — or push back with evidence…",
    emptyChatTitle: "Let's build your startup workspace.",
    emptyChatBody:
      "Challenge assumptions, sharpen the story, and prepare for real investor questions.",
    emptyDashboardTitle: "No documents yet.",
    emptyDashboardBody:
      "Generate them from your onboarding answers — works even if the AI provider is down.",
    generateCta: "Generate from onboarding",
    bootstrapRunning: "Building your investor documents…",
    bootstrapDone: "Documents ready.",
    suggestions: [
      "Pressure-test the idea",
      "Clarify who pays",
      "Map go-to-market",
      "Unit economics sketch",
    ],
    widgets: [
      { title: "Idea Clarity", hint: "Problem ↔ solution" },
      { title: "Revenue Path", hint: "Who pays" },
      { title: "Traction", hint: "Evidence" },
      { title: "Team Coverage", hint: "Gaps" },
    ],
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
  }),
};

export function getThemeExperience(theme: StartupThemeId): ThemeExperience {
  return THEME_CATALOG[theme] ?? THEME_CATALOG.general;
}
