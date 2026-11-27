import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { isAdminEmail } from "@/lib/admin";
import { createClient } from "@/lib/supabase/server";
import { Navbar } from "@/components/novashield/Navbar";
import { AdminDashboard } from "@/components/novashield/admin/AdminDashboard";
import { MerchantTermsSection } from "@/components/novashield/legal/MerchantTermsSection";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "店家管理後台｜Nova商譽寶（NovaShield）",
  description:
    "使用拓新雲端 NovaOS 帳號登入管理門市顧客評分頁、QR Code、LINE 官方帳號 Deep Link 與綠界訂閱升級。",
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
