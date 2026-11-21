import dynamic from "next/dynamic";
import Link from "next/link";
import { LandingHeroBanner } from "@/components/landing-hero-banner";
import { GlobalNavbar } from "@/components/global-nav";
import { PwaBootRedirect } from "@/components/pwa-boot-redirect";
import { Button } from "@/components/ui/button";
import { getAllModuleEarlyBirdStatuses } from "@/lib/module-activation";
import { NOVA_MODULES } from "@/lib/novaos";
import { PRODUCTION_URL, siteConfig } from "@/lib/site";
import { FREE_TRIAL } from "@/types/database";

export const revalidate = 60;

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: siteConfig.name,
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  url: PRODUCTION_URL,
  description:
    "專為台灣代購、團購主打造的一站式獨立賣場與自動對帳平台。3分鐘建立賣場，買家自助下單，系統自動對帳並 LINE 通知。",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "TWD",
    description: FREE_TRIAL.description,
  },
};

const sectionFallback = (
  <section className="relative z-10 py-16 md:py-20">
    <div className="mx-auto max-w-6xl px-4">
      <div className="h-8 w-40 animate-pulse rounded-lg bg-secondary" />
      <div className="mt-8 h-48 animate-pulse rounded-2xl border border-border bg-card/60" />
    </div>
  </section>
);

/** Below-fold sections are code-split to shrink the hero JS payload. */
const LandingWhatsNew = dynamic(
  () =>
    import("@/components/landing-whats-new").then((m) => m.LandingWhatsNew),
  { loading: () => sectionFallback }
);
const LandingInteractiveDemo = dynamic(
  () =>
    import("@/components/landing-interactive-demo").then(
      (m) => m.LandingInteractiveDemo
    ),
  { loading: () => sectionFallback }
);
const LandingLiveDemo = dynamic(
  () =>
    import("@/components/landing-live-demo").then((m) => m.LandingLiveDemo),
  { loading: () => sectionFallback }
);
const LandingHowItWorks = dynamic(
  () =>
    import("@/components/landing-how-it-works").then(
      (m) => m.LandingHowItWorks
    ),
  { loading: () => sectionFallback }
);
const LandingPricing = dynamic(
  () => import("@/components/landing-pricing").then((m) => m.LandingPricing),
  { loading: () => sectionFallback }
);
const PartnerStoreSection = dynamic(
  () =>
    import("@/components/partner-store-apply").then(
      (m) => m.PartnerStoreSection
    ),
  { loading: () => sectionFallback }
);
const LandingTrust = dynamic(
  () => import("@/components/landing-trust").then((m) => m.LandingTrust),
  { loading: () => sectionFallback }
);
const LandingFaq = dynamic(
  () => import("@/components/landing-faq").then((m) => m.LandingFaq),
  { loading: () => sectionFallback }
);
const SiteFooter = dynamic(
  () => import("@/components/site-footer").then((m) => m.SiteFooter),
  { loading: () => null }
);

export default async function LandingPage() {
  const moduleEarly = await getAllModuleEarlyBirdStatuses().catch(() => []);
  const openCount = moduleEarly.filter((s) => s.open).length;
  const trialDays = openCount > 0 ? 14 : FREE_TRIAL.durationDays;

  const trialLine = (
    <p>
      註冊不扣早鳥名額；啟用子模組後才開始試用（各模組前 15 名 14 天／其餘 7 天）。
      {openCount > 0
        ? `目前 ${openCount} 個模組仍有早鳥名額：${moduleEarly
            .filter((s) => s.open)
            .map((s) => `${NOVA_MODULES[s.moduleId].name} ${s.remaining}`)
            .join("、")}`
        : "早鳥名額已滿，啟用後仍享 7 天一般試用。"}
    </p>
  );

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#0B132B] pb-20 sm:pb-0">
      <PwaBootRedirect />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <GlobalNavbar
        variant="marketing"
        mode="hub"
        showAuthLinks
        unlockedModules={[]}
      />

      <main id="main-content">
        <LandingHeroBanner trialLine={trialLine} />

        <div className="cv-auto relative z-10 bg-background">
          <LandingWhatsNew />
        </div>

        <div className="cv-auto relative z-10 bg-background">
          <LandingInteractiveDemo />
        </div>

        <div className="cv-auto relative z-10 bg-background">
          <LandingLiveDemo />
        </div>

        <div className="cv-auto relative z-10 bg-background">
          <LandingHowItWorks />
        </div>

        <div className="cv-auto relative z-10 bg-background">
          <LandingPricing />
        </div>

        <div className="cv-auto relative z-10 bg-background">
          <PartnerStoreSection />
        </div>

        <div className="cv-auto relative z-10 bg-background">
          <LandingTrust trialDays={trialDays} />
        </div>

        <div className="cv-auto relative z-10 bg-background">
          <LandingFaq />
        </div>
      </main>

      <div className="relative z-10 bg-background">
        <SiteFooter />
      </div>

      <div className="nav-surface fixed inset-x-0 bottom-0 z-40 flex gap-2 border-t px-4 pb-[max(0.65rem,env(safe-area-inset-bottom))] pt-2.5 sm:hidden">
        <Button asChild variant="outline" className="h-11 flex-1">
          <Link href="#pricing">選擇方案</Link>
        </Button>
        <Button asChild className="h-11 flex-[1.4]">
          <Link href="/signup" prefetch>
            免費建立賣場
          </Link>
        </Button>
      </div>
    </div>
  );
}
