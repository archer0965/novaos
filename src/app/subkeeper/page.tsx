import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { SubkeeperAuthGate } from "@/components/subkeeper/subkeeper-auth-gate";
import { SUBKEEPER_PRODUCT } from "@/lib/subkeeper";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: `${SUBKEEPER_PRODUCT.name}｜登入`,
  description: SUBKEEPER_PRODUCT.tagline,
  openGraph: {
    title: `${SUBKEEPER_PRODUCT.name}｜拓新雲端 NovaOS`,
    description:
      "集中管理所有訂閱項目，提供續訂提醒與該月訂閱費用彙整。需使用 NovaOS 帳號登入。",
    images: [
      {
        url: "/og-subkeeper.jpg?v=20261122-og",
        width: 2848,
        height: 1504,
        alt: "訂閱管家｜智慧訂閱管理",
      },
    ],
  },
};

export default async function SubkeeperPublicPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect(SUBKEEPER_PRODUCT.href);
  }

  return <SubkeeperAuthGate />;
}
