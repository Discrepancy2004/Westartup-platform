import { z } from "zod";

export const tractionStageSchema = z.enum([
  "pre-launch",
  "early-users",
  "revenue",
  "scaling",
]);

export const teamSizeSchema = z.enum(["solo", "2-3", "4+"]);

export const onboardingAnswersSchema = z.object({
  "about-you": z.object({
    roleAndBackground: z.string().min(1),
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
    amount: z.string().optional(),
    stage: z.string().optional(),
  }),
});

export type OnboardingAnswers = z.infer<typeof onboardingAnswersSchema>;
export type TractionStage = z.infer<typeof tractionStageSchema>;
export type TeamSize = z.infer<typeof teamSizeSchema>;

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
    title: "About you",
    prompt: "Tell us about yourself — role and relevant background.",
  },
  {
    id: "idea",
    title: "Your idea",
    prompt: "Tell us your idea, in your own words.",
  },
  {
    id: "business-specifics",
    title: "Business specifics",
    prompt: "How do you make money, and at what rough price point?",
  },
  {
    id: "traction",
    title: "Traction",
    prompt: "Where are you today?",
  },
  {
    id: "team",
    title: "Team",
    prompt: "How many people are building this?",
  },
  {
    id: "deal-structure",
    title: "Deal structure",
    prompt: "Are you currently raising?",
  },
];

export const BUSINESS_MODELS = [
  "SaaS subscription",
  "Marketplace",
  "Transaction fee",
  "Services / agency",
  "Hardware + software",
  "Other",
] as const;
