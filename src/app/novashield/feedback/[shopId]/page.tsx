import { notFound } from "next/navigation";
import { FeedbackPageClient } from "@/components/novashield/feedback/FeedbackPageClient";
import {
  getNovaShieldShop,
  isSupabaseAdminConfigured,
} from "@/lib/novashield/db";
import { getInitialShopConfig } from "@/lib/novashield/mockData";
import { sanitizeShopId } from "@/lib/novashield/validation";

export const dynamic = "force-dynamic";

interface FeedbackPageProps {
  params: { shopId: string };
}

export default async function NovaShieldFeedbackPage({
  params,
}: FeedbackPageProps) {
  const shopId = sanitizeShopId(params.shopId || "");

  if (!shopId) {
    notFound();
  }

  let initialShop = getInitialShopConfig(shopId);
  if (isSupabaseAdminConfigured()) {
    try {
      const fromDb = await getNovaShieldShop(shopId);
      if (fromDb) {
        initialShop = fromDb;
      }
    } catch {
      // fallback cleanly if table is not migrated yet
    }
  }

  return <FeedbackPageClient initialShop={initialShop} />;
}
