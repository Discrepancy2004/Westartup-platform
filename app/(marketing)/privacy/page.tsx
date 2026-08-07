import type { Metadata } from "next";
import { SiteFooter } from "@/components/marketing/site-footer";
import { SiteHeader } from "@/components/marketing/site-header";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How WeStartup collects, uses, and protects account, product, and payment data.",
};

export const dynamic = "force-static";

const UPDATED = "5 August 2026";

const SECTIONS: { id: string; title: string; body: string[] }[] = [
  {
    id: "who",
    title: "Who we are",
    body: [
      "WeStartup is a founder workspace that helps you pressure-test an idea, work with an AI advisor, produce investor-ready artifacts, and optionally connect with platform experts.",
      "This policy explains what we collect when you use westartup.app (or any successor domain we operate), our web app, and related services.",
    ],
  },
  {
    id: "collect",
    title: "Information we collect",
    body: [
      "Account data. Email address, authentication credentials or tokens, and sign-in method. You may register with email, Google, or LinkedIn (OpenID Connect).",
      "Profile data. Display name, avatar URL, public LinkedIn profile URL when the provider supplies one, role (founder, expert, or admin), plan, and LinkedIn connection time.",
      "Onboarding and product data. Starter-question answers, startup DNA theme signals, chat messages, uploaded files you attach in chat, generated artifacts (for example pitch, financial, and valuation materials), review requests, expert assignments, and in-app notifications.",
      "Expert data. Applications (name, company, expertise, bio, CV), DNA studio answers, and review messages with founders.",
      "Payments. Plan selection, subscription status, Razorpay subscription identifiers, and billing period dates. Card numbers are handled by Razorpay — we do not store full payment card details.",
      "Directory data. After you complete starter onboarding as a founder, a sanitized public company snapshot (name, tagline, description, stage, model, themes) may appear in the Startup Directory. Email, private financial amounts, and full profile fields are not published there.",
      "Technical data. Device and browser type, approximate location derived from IP, cookies required for authentication and theme preference, and basic usage events needed to operate the product (including chat quota).",
    ],
  },
  {
    id: "use",
    title: "How we use information",
    body: [
      "To create and secure your account, keep you signed in, and route you to the correct workspace (founder, expert, or admin).",
      "To run the advisor chat, generate and store artifacts, apply your startup DNA theme, and enforce plan limits.",
      "To process subscriptions and show billing status.",
      "To operate expert review, applications, assignments, and notifications.",
      "To publish and update public directory listings for verified founders.",
      "To debug, prevent abuse, and improve reliability. We do not sell your personal information.",
    ],
  },
  {
    id: "legal-bases",
    title: "Legal bases",
    body: [
      "Where applicable (including India’s Digital Personal Data Protection Act and, if you are in the EEA/UK, GDPR), we process data to perform our contract with you, to meet legal obligations, and — for limited product analytics and security — on legitimate interests or consent where required.",
      "OAuth sign-in is optional. Connecting Google or LinkedIn is consent to receive the identity data those providers share with us (typically name, email, and photo; LinkedIn profile URLs are often not included).",
    ],
  },
  {
    id: "sharing",
    title: "Who we share data with",
    body: [
      "Infrastructure. Supabase hosts authentication, database, and file storage. Vercel hosts the application.",
      "AI processors. Message and context you send to the advisor may be processed by model providers we configure (currently Google and Groq) solely to generate responses and artifacts. Do not submit secrets you cannot share with those processors.",
      "Payments. Razorpay processes subscriptions.",
      "Identity providers. Google or LinkedIn if you choose those sign-in or linking options.",
      "Other users. Experts assigned to your company can see onboarding context, artifacts, and review messages needed to advise you. Admins can access platform records required to operate WeStartup. Directory visitors see only the public listing snapshot.",
      "We may disclose information if required by law or to protect the service and its users.",
    ],
  },
  {
    id: "retention",
    title: "Retention",
    body: [
      "We keep account and workspace data while your account is active. You may request deletion of your account and associated personal data, subject to records we must keep for billing, dispute, or legal reasons.",
      "Public directory listings are removed when the underlying founder profile is deleted.",
      "Signed URLs for expert CVs are short-lived; the underlying file remains until the application or account is removed.",
    ],
  },
  {
    id: "cookies",
    title: "Cookies and local storage",
    body: [
      "Essential cookies keep you authenticated (httpOnly session cookies managed via Supabase) and remember access routing so protected pages load faster.",
      "Theme preference is stored in local storage on your device (`westartup-theme`). Directory return-path hints may be stored in session storage so “Back to workspace” works after browsing companies.",
      "We do not use third-party advertising cookies.",
    ],
  },
  {
    id: "rights",
    title: "Your rights",
    body: [
      "Depending on where you live, you may have rights to access, correct, delete, or export your personal data, to withdraw consent (for example by disconnecting an OAuth provider and using email sign-in instead), and to lodge a complaint with a supervisory authority.",
      "To exercise these rights, sign in and contact us from the email on your account, or email the address in Contact below. We may need to verify that the request comes from the account holder.",
    ],
  },
  {
    id: "security",
    title: "Security",
    body: [
      "We use HTTPS, hashed credentials via our auth provider, row-level database policies, and role-based access in the app. No method of transmission or storage is perfectly secure. Please use a unique password and treat generated financial or legal artifacts as drafts, not advice.",
    ],
  },
  {
    id: "children",
    title: "Children",
    body: [
      "WeStartup is intended for adults building companies. We do not knowingly collect personal data from children under 18. If you believe a child has created an account, contact us and we will delete it.",
    ],
  },
  {
    id: "changes",
    title: "Changes",
    body: [
      "We may update this policy as the product changes. The “Last updated” date at the top will change when we do. Material changes will be highlighted in-product or by email when appropriate. Continued use after an update means you accept the revised policy.",
    ],
  },
  {
    id: "contact",
    title: "Contact",
    body: [
      "Privacy questions: use the email address on your WeStartup account and write to the team via in-app chat (founders) or your expert/admin workspace, with the subject “Privacy request”.",
      "If you signed in with Google or LinkedIn, you can also review or revoke app access in that provider’s security settings.",
    ],
  },
];

export default function PrivacyPage() {
  return (
    <>
      <SiteHeader />
      <main className="mkt-field-dark flex-1">
        <div className="mx-auto max-w-3xl px-5 py-10 md:py-16">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--mkt-accent)]">
            Legal
          </p>
          <h1 className="mt-2 font-display text-4xl text-[var(--mkt-ink)] md:text-5xl">
            Privacy Policy
          </h1>
          <p className="mt-3 text-sm text-[var(--mkt-muted)]">
            Last updated {UPDATED}
          </p>
          <p className="mt-6 text-sm leading-relaxed text-[var(--mkt-muted)] md:text-base">
            This page describes how WeStartup handles personal data. It is written
            for founders, experts, and admins who use the product — not as legal
            advice for your own company.
          </p>

          <nav
            aria-label="On this page"
            className="mt-10 rounded-[var(--mkt-radius)] border border-white/10 px-4 py-4"
          >
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--mkt-faint)]">
              On this page
            </p>
            <ol className="mt-3 columns-1 gap-x-8 sm:columns-2">
              {SECTIONS.map((section) => (
                <li key={section.id} className="mb-1.5 break-inside-avoid">
                  <a
                    href={`#${section.id}`}
                    className="text-sm text-[var(--mkt-muted)] hover:text-[var(--mkt-ink)]"
                  >
                    {section.title}
                  </a>
                </li>
              ))}
            </ol>
          </nav>

          <div className="mt-12 space-y-12">
            {SECTIONS.map((section) => (
              <section key={section.id} id={section.id} className="scroll-mt-24">
                <h2 className="font-display text-2xl text-[var(--mkt-ink)]">
                  {section.title}
                </h2>
                <div className="mt-4 space-y-3">
                  {section.body.map((paragraph) => (
                    <p
                      key={paragraph.slice(0, 48)}
                      className="text-sm leading-relaxed text-[var(--mkt-muted)] md:text-[15px] md:leading-relaxed"
                    >
                      {paragraph}
                    </p>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
