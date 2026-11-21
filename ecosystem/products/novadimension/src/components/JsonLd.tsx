import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/site";
import { IG_PROFILE_URL, PARENT_SITE_URL } from "@/lib/constants";
import { NOVAOS_HUB_URL } from "@/lib/novaos-hub";

export default function JsonLd() {
  const business = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: SITE_NAME,
    alternateName: ["拓維空間", "NovaDimension", "拓維空間NovaDimension"],
    url: SITE_URL,
    description: SITE_DESCRIPTION,
    image: `${SITE_URL}/hero.jpg`,
    applicationCategory: "DesignApplication",
    operatingSystem: "Web",
    isPartOf: {
      "@type": "Organization",
      name: "拓新雲端 NovaOS",
      url: NOVAOS_HUB_URL || PARENT_SITE_URL,
    },
    sameAs: [IG_PROFILE_URL],
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: "TWD",
      lowPrice: "0",
      highPrice: "3049",
    },
  };

  const faq = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "免費體驗包含什麼？",
        acceptedAnswer: {
          "@type": "Answer",
          text: "首次造訪可獲得 1 次 Credit，用於生成擬真預覽與基礎空間分析。",
        },
      },
      {
        "@type": "Question",
        name: "會幫忙代購家具或施工嗎？",
        acceptedAnswer: {
          "@type": "Answer",
          text: "不會。本服務由拓新雲端提供技術支援，AI 視覺生成僅供軟裝靈感參考，不含實體代購與硬裝工程。",
        },
      },
      {
        "@type": "Question",
        name: "如何付款？",
        acceptedAnswer: {
          "@type": "Answer",
          text: "付費方案透過綠界 ECPay 安全結帳，付款成功後自動開通 Credit 或訂閱。",
        },
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(business) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faq) }}
      />
    </>
  );
}
