import { z } from "zod";

export const tractionStageSchema = z.enum([
  "idea",
  "building",
  "testing",
  "growing",
  "revenue",
]);

export const teamSizeSchema = z.enum(["solo", "2-3", "4+"]);

export const fundingIntentSchema = z.enum([
  "bootstrapping",
  "looking",
  "raising",
  "too-early",
]);

export const onboardingAnswersSchema = z.object({
  "about-you": z.object({
    roleAndBackground: z.string().min(1),
    companionGender: z.enum(["boy", "girl"]).optional(),
  }),
  idea: z.object({
    description: z.string().min(1),
  }),
  "business-specifics": z.object({
    businessModelType: z.string().min(1),
    pricePoint: z.string().min(1),
  }),
  traction: z.object({
    stage: tractionStageSchema,
  }),
  team: z.object({
    size: teamSizeSchema,
  }),
  "deal-structure": z.object({
    currentlyRaising: z.boolean(),
    intent: fundingIntentSchema.optional(),
    amount: z.string().optional(),
    stage: z.string().optional(),
  }),
});

export type OnboardingAnswers = z.infer<typeof onboardingAnswersSchema>;
export type TractionStage = z.infer<typeof tractionStageSchema>;
export type TeamSize = z.infer<typeof teamSizeSchema>;
export type FundingIntent = z.infer<typeof fundingIntentSchema>;

export type OnboardingStepId =
  | "about-you"
  | "idea"
  | "business-specifics"
  | "traction"
  | "team"
  | "deal-structure";

export const ONBOARDING_STEPS: {
  id: OnboardingStepId;
  title: string;
  prompt: string;
}[] = [
  {
    id: "about-you",
    title: "Who's building this?",
    prompt: "Every startup has a story. Tell us a little about yours.",
  },
  {
    id: "idea",
    title: "What's the big idea?",
    prompt: "Imagine you're explaining it to a friend in under a minute.",
  },
  {
    id: "business-specifics",
    title: "How will this become a business?",
    prompt: "Choose the model that best fits your startup.",
  },
  {
    id: "traction",
    title: "Where are you on your journey?",
    prompt: "Pick the stage that feels most true today.",
  },
  {
    id: "team",
    title: "Who's on this journey with you?",
    prompt: "Great companies are built by great teams.",
  },
  {
    id: "deal-structure",
    title: "What's next?",
    prompt: "Tell us where you're heading next.",
  },
];

export const TRACTION_OPTIONS: {
  id: TractionStage;
  label: string;
  emoji: string;
}[] = [
  { id: "idea", label: "Idea", emoji: "💡" },
  { id: "building", label: "Building", emoji: "🛠" },
  { id: "testing", label: "Testing", emoji: "🚀" },
  { id: "growing", label: "Growing", emoji: "📈" },
  { id: "revenue", label: "Revenue", emoji: "💰" },
];

export const FUNDING_OPTIONS: {
  id: FundingIntent;
  label: string;
  currentlyRaising: boolean;
}[] = [
  {
    id: "bootstrapping",
    label: "🚀 Growing with our own money",
    currentlyRaising: false,
  },
  {
    id: "looking",
    label: "🤝 Looking for investors",
    currentlyRaising: false,
  },
  {
    id: "raising",
    label: "💰 Already raising",
    currentlyRaising: true,
  },
  {
    id: "too-early",
    label: "⏳ Too early to think about funding",
    currentlyRaising: false,
  },
];

export const STEP_CTAS = [
  "Looks good →",
  "Next Step →",
  "Let's continue →",
  "Almost there →",
  "Next Step →",
  "Launch My Workspace 🚀",
] as const;

export const BUSINESS_MODELS = [
  "SaaS subscription",
  "Marketplace",
  "Transaction fee",
  "Services / agency",
  "Hardware + software",
  "Other",
] as const;
