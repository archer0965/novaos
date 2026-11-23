import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { SubkeeperPanel } from "@/components/dashboard/subkeeper-panel";
import { SUBKEEPER_PRODUCT } from "@/lib/subkeeper";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: `${SUBKEEPER_PRODUCT.name}`,
  description: SUBKEEPER_PRODUCT.tagline,
  openGraph: {
    title: `${SUBKEEPER_PRODUCT.name}｜智慧訂閱管理 × 雲端助手`,
    description:
      "集中管理所有訂閱項目，提供續訂提醒與該月訂閱費用彙整，讓財務狀況一目了然。",
    images: [
      {
        url: "/og-subkeeper.jpg?v=20261122-og",
        width: 2848,
        height: 1504,
        alt: "訂閱管家｜智慧訂閱管理 × 雲端助手",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SUBKEEPER_PRODUCT.name}｜智慧訂閱管理 × 雲端助手`,
    description:
      "集中管理所有訂閱項目，提供續訂提醒與該月訂閱費用彙整，讓財務狀況一目了然。",
    images: ["/og-subkeeper.jpg?v=20261122-og"],
  },
};

export default async function SubkeeperPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(SUBKEEPER_PRODUCT.loginHref);
  }

  return <SubkeeperPanel />;
}
