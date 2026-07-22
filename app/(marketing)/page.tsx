import { Differentiator } from "@/components/marketing/differentiator";
import { DashboardPreview } from "@/components/marketing/dashboard-preview";
import { Hero } from "@/components/marketing/hero";
import { HowItWorks } from "@/components/marketing/how-it-works";
import { PricingSection } from "@/components/marketing/pricing-section";
import { SiteFooter } from "@/components/marketing/site-footer";
import { SiteHeader } from "@/components/marketing/site-header";

export default function MarketingHomePage() {
  return (
    <>
      <SiteHeader />
      <Hero />
      <HowItWorks />
      <Differentiator />
      <DashboardPreview />
      <PricingSection />
      <SiteFooter />
    </>
  );
}
