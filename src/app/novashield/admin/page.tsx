import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { isAdminEmail } from "@/lib/admin";
import { createClient } from "@/lib/supabase/server";
import { Navbar } from "@/components/novashield/Navbar";
import { AdminDashboard } from "@/components/novashield/admin/AdminDashboard";
import { MerchantTermsSection } from "@/components/novashield/legal/MerchantTermsSection";

import { PRODUCTION_URL } from "@/lib/site";

export const dynamic = "force-dynamic";

const OG_IMAGE_URL = "/og-novashield.png?v=20261127";
const ADMIN_TITLE = "店家管理後台｜Nova商譽寶（NovaShield）";
const ADMIN_DESC =
  "使用拓新雲端 NovaOS 帳號登入管理門市顧客評分頁、數據儀表板、自訂 QR Code 立牌、AI 客訴回覆大師與 LINE 私訊引導。";

export const metadata: Metadata = {
  title: ADMIN_TITLE,
  description: ADMIN_DESC,
  openGraph: {
    type: "website",
    locale: "zh_TW",
    url: `${PRODUCTION_URL}/novashield/admin`,
    siteName: "拓新雲端 NovaOS",
    title: ADMIN_TITLE,
    description: ADMIN_DESC,
    images: [
      {
        url: OG_IMAGE_URL,
        width: 1200,
        height: 630,
        alt: "Nova商譽寶（NovaShield）店家管理後台",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: ADMIN_TITLE,
    description: ADMIN_DESC,
    images: [OG_IMAGE_URL],
  },
};

export default async function NovaShieldAdminPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/novashield/admin");
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Navbar />
      <Suspense
        fallback={
          <div className="mx-auto max-w-7xl px-4 py-10 text-center text-sm text-slate-500">
            正在載入店家管理後台...
          </div>
        }
      >
        <AdminDashboard
          userId={user.id}
          userEmail={user.email ?? ""}
          isPlatformAdmin={isAdminEmail(user.email)}
        />
      </Suspense>
      <div className="mx-auto max-w-7xl px-4 pb-10 sm:px-6">
        <MerchantTermsSection />
      </div>
    </div>
  );
}
