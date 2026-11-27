import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { FeedbackPageClient } from "@/components/novashield/feedback/FeedbackPageClient";
import {
  getNovaShieldShop,
  isSupabaseAdminConfigured,
} from "@/lib/novashield/db";
import { getInitialShopConfig } from "@/lib/novashield/mockData";
import type { ShopConfig } from "@/lib/novashield/types";
import { sanitizeShopId } from "@/lib/novashield/validation";
import { PRODUCTION_URL } from "@/lib/site";

export const dynamic = "force-dynamic";

const OG_IMAGE_URL = "/og-novashield.png?v=20261127";

interface FeedbackPageProps {
  params: { shopId: string };
}

async function resolveShopForRequest(shopId: string): Promise<ShopConfig> {
  let shop = getInitialShopConfig(shopId);
  if (isSupabaseAdminConfigured()) {
    try {
      const fromDb = await getNovaShieldShop(shopId);
      if (fromDb) {
        shop = fromDb;
      }
    } catch {
      // fallback cleanly if table is unreachable
    }
  }
  return shop;
}

export async function generateMetadata({
  params,
}: FeedbackPageProps): Promise<Metadata> {
  const shopId = sanitizeShopId(params.shopId || "");
  if (!shopId) {
    return { title: "顧客評分頁｜Nova商譽寶" };
  }

  const shop = await resolveShopForRequest(shopId);
  const title = `邀請您為「${shop.shopName}」評分｜Nova商譽寶`;
  const description = `感謝您今日光臨「${shop.shopName}」！只需 15 秒分享真實消費體驗，幫助我們為您提供更棒的服務。`;
  const canonicalPath = `/novashield/feedback/${encodeURIComponent(shopId)}`;

  return {
    title,
    description,
    alternates: {
      canonical: canonicalPath,
    },
    openGraph: {
      type: "website",
      locale: "zh_TW",
      url: `${PRODUCTION_URL}${canonicalPath}`,
      siteName: "Nova商譽寶（NovaShield）",
      title,
      description,
      images: [
        {
          url: OG_IMAGE_URL,
          width: 1200,
          height: 630,
          alt: `${shop.shopName} 顧客評分回饋卡 — Nova商譽寶`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [OG_IMAGE_URL],
    },
  };
}

export default async function NovaShieldFeedbackPage({
  params,
}: FeedbackPageProps) {
  const shopId = sanitizeShopId(params.shopId || "");

  if (!shopId) {
    notFound();
  }

  const initialShop = await resolveShopForRequest(shopId);

  return <FeedbackPageClient initialShop={initialShop} />;
}
