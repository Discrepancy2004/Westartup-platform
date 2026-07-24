import type { StartupThemeId } from "@/lib/dna/types";

export const COMPANION_GENDERS = ["boy", "girl"] as const;
export type CompanionGender = (typeof COMPANION_GENDERS)[number];

export const COMPANION_PERSONA_IDS = [
  "designer",
  "footballer",
  "tennis",
  "founder",
  "doctor",
  "chef",
  "teacher",
  "coder",
  "traveler",
  "athlete",
  "specialist",
] as const;

export type CompanionPersonaId = (typeof COMPANION_PERSONA_IDS)[number];

export type CompanionPersonaRecord = {
  gender: CompanionGender;
  id: CompanionPersonaId;
  label: string;
  source: "kit" | "learned";
  learnedAt?: string;
};

export type CompanionKit = {
  id: CompanionPersonaId;
  label: string;
  /** Short guide title under avatar */
  nameplate: string;
  keywords: string[];
  /** Optional DNA themes that boost this kit */
  themeBoost?: StartupThemeId[];
  encouragement: string[];
  niceJob: string[];
  prop: "racket" | "ball" | "sketch" | "blazer" | "coat" | "chef" | "book" | "laptop" | "bag" | "explorer" | "none";
};

export const COMPANION_KITS: Record<
  Exclude<CompanionPersonaId, "specialist">,
  CompanionKit
> = {
  designer: {
    id: "designer",
    label: "Fashion",
    nameplate: "Fashion guide",
    keywords: [
      "fashion",
      "apparel",
      "streetwear",
      "designer",
      "boutique",
      "couture",
      "clothing",
      "garment",
      "textile",
      "wearable",
      "stylist",
    ],
    themeBoost: ["fashion"],
    prop: "sketch",
    encouragement: [
      "Your brand story is taking shape.",
      "Tap me if a chart feels fuzzy.",
      "Let’s sharpen the look of this deck.",
    ],
    niceJob: [
      "Nice job!",
      "That’s a strong fashion narrative.",
      "Looking sharp — keep going!",
    ],
  },
  footballer: {
    id: "footballer",
    label: "Football",
    nameplate: "Football coach",
    keywords: [
      "football",
      "soccer",
      "fifa",
      "premier league",
      "match",
      "stadium",
      "striker",
      "goalkeeper",
      "midfielder",
    ],
    prop: "ball",
    encouragement: [
      "One more pass — refine that section.",
      "Ask me about any play on the dashboard.",
      "We’re building toward match day.",
    ],
    niceJob: [
      "Nice job!",
      "Goal! That’s investor-ready progress.",
      "Great play — section unlocked!",
    ],
  },
  tennis: {
    id: "tennis",
    label: "Tennis",
    nameplate: "Tennis guide",
    keywords: ["tennis", "racket", "racquet", "wimbledon", "court sports"],
    prop: "racket",
    encouragement: [
      "Your serve is warming up.",
      "Select any line and ask me.",
      "Let’s ace the next section.",
    ],
    niceJob: ["Nice job!", "Ace!", "Clean winner — keep the streak."],
  },
  founder: {
    id: "founder",
    label: "Business",
    nameplate: "Founder guide",
    keywords: ["saas", "b2b", "startup", "enterprise", "software", "platform"],
    themeBoost: ["saas", "marketplace", "general"],
    prop: "blazer",
    encouragement: [
      "I’m here if a number needs explaining.",
      "Investors love clarity — ask away.",
      "Let’s make this deck tighter.",
    ],
    niceJob: [
      "Nice job!",
      "Solid progress, founder.",
      "That’s the kind of signal investors notice.",
    ],
  },
  doctor: {
    id: "doctor",
    label: "Health",
    nameplate: "Health guide",
    keywords: [
      "hospital",
      "clinic",
      "patient",
      "medical",
      "health",
      "healthcare",
      "doctor",
      "therapy",
      "wellness",
    ],
    themeBoost: ["health"],
    prop: "coat",
    encouragement: [
      "Healthy startups check their vitals — tap me.",
      "I can unpack any metric here.",
      "Let’s keep the diagnosis clear.",
    ],
    niceJob: ["Nice job!", "Vitals look stronger.", "Great care on that section!"],
  },
  chef: {
    id: "chef",
    label: "Food",
    nameplate: "Food guide",
    keywords: [
      "restaurant",
      "food",
      "kitchen",
      "chef",
      "cuisine",
      "delivery",
      "cafe",
      "recipe",
    ],
    themeBoost: ["food"],
    prop: "chef",
    encouragement: [
      "Something confusing on the menu? Ask me.",
      "Let’s season this narrative.",
      "I’m right here if you need a taste-test.",
    ],
    niceJob: ["Nice job!", "Chef’s kiss!", "That section is cooked perfectly."],
  },
  teacher: {
    id: "teacher",
    label: "Education",
    nameplate: "Learning guide",
    keywords: [
      "student",
      "teacher",
      "learning",
      "course",
      "school",
      "edtech",
      "tutor",
      "classroom",
    ],
    themeBoost: ["education"],
    prop: "book",
    encouragement: [
      "Stuck on a concept? Highlight it and ask.",
      "We’ll study this chart together.",
      "Learning mode is on.",
    ],
    niceJob: ["Nice job!", "A+ progress!", "You nailed that lesson."],
  },
  coder: {
    id: "coder",
    label: "Tech",
    nameplate: "Tech guide",
    keywords: [
      "ai",
      "ml",
      "developer",
      "api",
      "software",
      "code",
      "llm",
      "automation",
    ],
    themeBoost: ["ai"],
    prop: "laptop",
    encouragement: [
      "Debug any dashboard line with me.",
      "Ship clarity, not jargon.",
      "I’m your pair-programmer for investor docs.",
    ],
    niceJob: ["Nice job!", "Build succeeded!", "Clean commit on that section."],
  },
  traveler: {
    id: "traveler",
    label: "Travel",
    nameplate: "Travel guide",
    keywords: [
      "travel",
      "tourism",
      "hotel",
      "flight",
      "booking",
      "hospitality",
      "trip",
    ],
    themeBoost: ["travel"],
    prop: "bag",
    encouragement: [
      "Lost in the numbers? Ask your guide.",
      "Next stop: clearer metrics.",
      "I’m packed and ready to explain.",
    ],
    niceJob: ["Nice job!", "Great stop on the journey!", "Passport stamped!"],
  },
  athlete: {
    id: "athlete",
    label: "Sports",
    nameplate: "Sports guide",
    keywords: ["sports", "athlete", "fitness", "gym", "training", "league"],
    prop: "ball",
    encouragement: [
      "Training day — ask me anything here.",
      "Let’s hit the next milestone.",
      "I’m your sideline coach.",
    ],
    niceJob: ["Nice job!", "Personal best!", "That’s championship energy."],
  },
};

export function specialistKit(label: string): CompanionKit {
  const safe = label.trim() || "Specialist";
  return {
    id: "specialist",
    label: safe,
    nameplate: `${safe} guide`,
    keywords: [],
    prop: "explorer",
    encouragement: [
      `Let’s sharpen your ${safe} story.`,
      `Tap me if any ${safe} metric is unclear.`,
      "I’m here for the niche details.",
    ],
    niceJob: [
      "Nice job!",
      `Strong ${safe} progress!`,
      "That’s how specialists win diligence.",
    ],
  };
}

export function pickLine(lines: string[], seed?: number): string {
  if (!lines.length) return "Nice job!";
  const i =
    typeof seed === "number"
      ? Math.abs(seed) % lines.length
      : Math.floor(Math.random() * lines.length);
  return lines[i]!;
}
