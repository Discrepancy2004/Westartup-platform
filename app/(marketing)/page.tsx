import { AudienceCards } from "@/components/marketing/audience-cards";
import { FeaturedStrip } from "@/components/marketing/featured-strip";
import { FinalCta } from "@/components/marketing/final-cta";
import { Hero } from "@/components/marketing/hero";
import { PositioningSection } from "@/components/marketing/positioning-section";
import { ProductShowcase } from "@/components/marketing/product-showcase";
import { ResourcesGrid } from "@/components/marketing/resources-grid";
import { SiteFooter } from "@/components/marketing/site-footer";
import { SiteHeader } from "@/components/marketing/site-header";
import { SocialProof } from "@/components/marketing/social-proof";

export default function MarketingHomePage() {
  return (
    <>
      <SiteHeader />
      <main>
        <Hero />
        <ProductShowcase />
        <FeaturedStrip />
        <SocialProof />
        <PositioningSection />
        <AudienceCards />
        <ResourcesGrid />
        <FinalCta />
      </main>
      <SiteFooter />
    </>
  );
}
