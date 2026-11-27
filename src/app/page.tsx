import { BrandHero } from "@/components/marketing/brand-hero";
import { ContactCta } from "@/components/marketing/contact-cta";
import { MarketingFooter } from "@/components/marketing/marketing-footer";
import { MarketingNav } from "@/components/marketing/marketing-nav";
import { PartnerPrograms } from "@/components/marketing/partner-programs";
import { PricingMatrix } from "@/components/marketing/pricing-matrix";
import { ProductMatrix } from "@/components/marketing/product-matrix";
import { WhyChooseUs } from "@/components/marketing/why-choose-us";
import { PwaBootRedirect } from "@/components/pwa-boot-redirect";
import { NOVA_BRAND } from "@/lib/novaos";
import { PRODUCTION_URL, siteConfig } from "@/lib/site";

export const revalidate = 60;

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: siteConfig.legalName,
  url: PRODUCTION_URL,
  description:
    "拓新雲端 NovaOS——專業雲端工具與軟體解決方案開發商，提供 NovaStore、拓脈預約、Nova AI Doc、拓維空間、Nova商譽寶、訂閱管家 等產品矩陣。",
  email: siteConfig.supportEmail,
  brand: {
    "@type": "Brand",
    name: NOVA_BRAND.displayName,
  },
};

export default function BrandHomePage() {
  return (
    <div className="marketing-site relative min-h-screen overflow-x-hidden bg-[#05070f] pb-20 text-slate-100 sm:pb-0">
      <PwaBootRedirect />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <MarketingNav />

      <main id="main-content">
        <BrandHero />
        <div className="relative bg-[#070b14]">
          <ProductMatrix />
          <PartnerPrograms />
          <PricingMatrix />
          <WhyChooseUs />
          <ContactCta />
        </div>
      </main>

      <MarketingFooter />

      {/* Mobile sticky CTA */}
      <div className="fixed inset-x-0 bottom-0 z-40 flex gap-2 border-t border-white/10 bg-[#05070f]/95 px-4 pb-[max(0.65rem,env(safe-area-inset-bottom))] pt-2.5 backdrop-blur sm:hidden">
        <a
          href="#products"
          className="inline-flex h-11 flex-1 items-center justify-center rounded-xl border border-white/15 text-sm font-semibold text-white"
        >
          產品矩陣
        </a>
        <a
          href="/signup"
          className="inline-flex h-11 flex-[1.35] items-center justify-center rounded-xl bg-cyan-400 text-sm font-semibold text-slate-950"
        >
          免費開始
        </a>
      </div>
    </div>
  );
}
