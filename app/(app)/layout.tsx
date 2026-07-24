import type { ReactNode } from "react";
import { CompanionProvider } from "@/components/companion/companion-provider";
import { CompanionShell } from "@/components/companion/companion-shell";
import { AskCompanionSelection } from "@/components/companion/ask-selection";
import { DnaProvider } from "@/components/dna/dna-provider";
import { loadStartupDna } from "@/lib/dna/load";

export default async function AppShellLayout({
  children,
}: {
  children: ReactNode;
}) {
  const { dna, secondaryLabels } = await loadStartupDna();

  return (
    <DnaProvider dna={dna} secondaryLabels={secondaryLabels}>
      <CompanionProvider>
        <div className="dna-shell flex min-h-full flex-col bg-canvas text-ink">
          {children}
          <AskCompanionSelection />
          <CompanionShell />
        </div>
      </CompanionProvider>
    </DnaProvider>
  );
}
