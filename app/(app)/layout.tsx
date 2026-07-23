import type { ReactNode } from "react";
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
      <div className="dna-shell flex min-h-full flex-col bg-canvas text-ink">
        {children}
      </div>
    </DnaProvider>
  );
}
