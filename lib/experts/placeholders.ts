export type ExpertPlaceholder = {
  slug: string;
  name: string;
  specialty: string;
  note: string;
};

export const EXPERT_PLACEHOLDERS: ExpertPlaceholder[] = [
  {
    slug: "aarav-mehta",
    name: "Aarav Mehta",
    specialty: "B2B SaaS and founder storytelling",
    note: "Placeholder expert profile for deck narrative, GTM pressure tests, and positioning reviews.",
  },
  {
    slug: "riya-narang",
    name: "Riya Narang",
    specialty: "Consumer growth and retention",
    note: "Placeholder expert profile for activation loops, audience research, and retention diagnostics.",
  },
  {
    slug: "kabir-sethi",
    name: "Kabir Sethi",
    specialty: "Finance, metrics, and fundraising prep",
    note: "Placeholder expert profile for revenue logic, operating metrics, and investor question drills.",
  },
];
