import { z } from "zod";
import { artifactKindSchema } from "@/lib/types/artifacts";

export const dashboardUpdateProposalSchema = z.object({
  reason: z.string().min(1),
  artifacts: z
    .array(
      z.object({
        kind: artifactKindSchema,
        title: z.string().min(1),
        summary: z.string().optional(),
        chartData: z.record(z.string(), z.unknown()),
      }),
    )
    .min(1),
});

export type DashboardUpdateProposal = z.infer<
  typeof dashboardUpdateProposalSchema
>;

const START = "<!--WESTARTUP_UPDATE";
const END = "WESTARTUP_UPDATE-->";

export function extractDashboardUpdate(content: string): {
  visibleText: string;
  proposal: DashboardUpdateProposal | null;
} {
  const start = content.indexOf(START);
  const end = content.indexOf(END);

  if (start === -1 || end === -1 || end < start) {
    return { visibleText: content.trim(), proposal: null };
  }

  const jsonRaw = content.slice(start + START.length, end).trim();
  const visibleText = `${content.slice(0, start)}${content.slice(end + END.length)}`.trim();

  try {
    const parsed = dashboardUpdateProposalSchema.safeParse(JSON.parse(jsonRaw));
    if (!parsed.success) {
      return { visibleText: content.trim(), proposal: null };
    }
    return { visibleText, proposal: parsed.data };
  } catch {
    return { visibleText: content.trim(), proposal: null };
  }
}
