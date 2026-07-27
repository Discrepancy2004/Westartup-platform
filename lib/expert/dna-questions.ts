export type DnaCapsuleCategory =
  | "lessons-learned"
  | "red-green-flags"
  | "decision-making"
  | "business-strategy"
  | "people-technology";

export type DnaStarterQuestion = {
  id: string;
  category: DnaCapsuleCategory;
  prompt: string;
  /** Soft expandable follow-ups (optional for the expert). */
  followUps: string[];
};

export const DNA_FOLLOW_UPS_DEFAULT = [
  "Why does this matter?",
  "Can you share a real example?",
  "At what startup stage is this most relevant?",
  "Which industries or functions does this apply to?",
] as const;

/** Official DNA Capsule starter bank — replace freely in development. */
export const DNA_STARTER_QUESTIONS: DnaStarterQuestion[] = [
  {
    id: "ll-repeated-mistake",
    category: "lessons-learned",
    prompt: "What is ONE mistake you see founders repeatedly make?",
    followUps: [...DNA_FOLLOW_UPS_DEFAULT],
  },
  {
    id: "ll-years-to-learn",
    category: "lessons-learned",
    prompt: "What's one lesson that took you years to learn?",
    followUps: [...DNA_FOLLOW_UPS_DEFAULT],
  },
  {
    id: "ll-wrong-assumption",
    category: "lessons-learned",
    prompt: "What's one assumption founders usually get wrong?",
    followUps: [...DNA_FOLLOW_UPS_DEFAULT],
  },
  {
    id: "ll-twenty-years",
    category: "lessons-learned",
    prompt:
      "What's one piece of advice you wish someone had given you twenty years ago?",
    followUps: [...DNA_FOLLOW_UPS_DEFAULT],
  },
  {
    id: "ll-one-minute",
    category: "lessons-learned",
    prompt:
      "If you had one minute with every founder, what advice would you give them?",
    followUps: [...DNA_FOLLOW_UPS_DEFAULT],
  },
  {
    id: "fg-confidence-boost",
    category: "red-green-flags",
    prompt:
      "What's one thing that immediately increases your confidence in a startup?",
    followUps: [...DNA_FOLLOW_UPS_DEFAULT],
  },
  {
    id: "fg-red-flag",
    category: "red-green-flags",
    prompt: "What's one red flag you never ignore?",
    followUps: [...DNA_FOLLOW_UPS_DEFAULT],
  },
  {
    id: "fg-trust",
    category: "red-green-flags",
    prompt: "What makes you immediately trust a startup?",
    followUps: [...DNA_FOLLOW_UPS_DEFAULT],
  },
  {
    id: "fg-lose-confidence",
    category: "red-green-flags",
    prompt: "What makes you immediately lose confidence?",
    followUps: [...DNA_FOLLOW_UPS_DEFAULT],
  },
  {
    id: "dm-always-ask",
    category: "decision-making",
    prompt:
      "What is one question you always ask before making an important decision?",
    followUps: [...DNA_FOLLOW_UPS_DEFAULT],
  },
  {
    id: "dm-framework",
    category: "decision-making",
    prompt:
      "What is one difficult decision framework you rely on repeatedly?",
    followUps: [...DNA_FOLLOW_UPS_DEFAULT],
  },
  {
    id: "dm-leadership",
    category: "decision-making",
    prompt: "What is one leadership lesson every founder should learn early?",
    followUps: [...DNA_FOLLOW_UPS_DEFAULT],
  },
  {
    id: "bs-metric-too-much",
    category: "business-strategy",
    prompt: "What is one metric people focus on too much?",
    followUps: [...DNA_FOLLOW_UPS_DEFAULT],
  },
  {
    id: "bs-metric-not-enough",
    category: "business-strategy",
    prompt: "What is one metric people don't pay enough attention to?",
    followUps: [...DNA_FOLLOW_UPS_DEFAULT],
  },
  {
    id: "bs-pitch-slide",
    category: "business-strategy",
    prompt:
      "If you could improve one slide in every pitch deck, which one would it be and why?",
    followUps: [...DNA_FOLLOW_UPS_DEFAULT],
  },
  {
    id: "bs-customer-behavior",
    category: "business-strategy",
    prompt: "What is one customer behavior founders consistently misunderstand?",
    followUps: [...DNA_FOLLOW_UPS_DEFAULT],
  },
  {
    id: "bs-market-understanding",
    category: "business-strategy",
    prompt:
      "What's one sign that tells you a founder truly understands their market?",
    followUps: [...DNA_FOLLOW_UPS_DEFAULT],
  },
  {
    id: "pt-hiring-mistake",
    category: "people-technology",
    prompt: "What is one hiring mistake you see repeatedly?",
    followUps: [...DNA_FOLLOW_UPS_DEFAULT],
  },
  {
    id: "pt-tech-overestimate",
    category: "people-technology",
    prompt: "What's one technology trend founders overestimate?",
    followUps: [...DNA_FOLLOW_UPS_DEFAULT],
  },
  {
    id: "pt-tech-underestimate",
    category: "people-technology",
    prompt: "What's one technology trend founders underestimate?",
    followUps: [...DNA_FOLLOW_UPS_DEFAULT],
  },
];

export const DNA_CATEGORY_LABELS: Record<DnaCapsuleCategory, string> = {
  "lessons-learned": "Lessons learned",
  "red-green-flags": "Red & green flags",
  "decision-making": "Decision making",
  "business-strategy": "Business & strategy",
  "people-technology": "People & technology",
};

export const DNA_FUNCTIONAL_AREAS = [
  "Product",
  "GTM / Sales",
  "Marketing",
  "Fundraising",
  "Finance",
  "Hiring / People",
  "Technology",
  "Operations",
  "Legal / Governance",
  "General",
] as const;

export const DNA_INDUSTRY_OPTIONS = [
  "SaaS",
  "Consumer",
  "Fintech",
  "Health",
  "Marketplace",
  "Climate",
  "Other",
] as const;

export const DNA_STAGE_OPTIONS = [
  "Idea",
  "Pre-seed",
  "Seed",
  "Series A+",
  "Any",
] as const;

export const DNA_IMPACT_PER_CAPSULE = 62;

export function dnaCoveragePercent(answeredCount: number) {
  const total = DNA_STARTER_QUESTIONS.length;
  return Math.round((Math.min(answeredCount, total) / total) * 100);
}

export function dnaEstimatedImpact(answeredCount: number) {
  return answeredCount * DNA_IMPACT_PER_CAPSULE;
}

export type DnaCapsuleRecord = {
  id: string;
  question_id: string;
  question_text: string;
  answer: string;
  why: string | null;
  industry: string | null;
  stage: string | null;
  category: string | null;
  functional_area: string | null;
  confidence: number | null;
  status: "draft" | "published" | "archived";
  usage_count: number;
  updated_at: string;
};
