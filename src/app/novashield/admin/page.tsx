import type { Metadata } from "next";
import { Suspense } from "react";
import { Navbar } from "@/components/novashield/Navbar";
import { AdminDashboard } from "@/components/novashield/admin/AdminDashboard";
import { MerchantTermsSection } from "@/components/novashield/legal/MerchantTermsSection";

export const metadata: Metadata = {
  title: "店家管理後台｜Nova商譽寶（NovaShield）",
  description:
    "管理門市顧客評分頁、QR Code、LINE 官方帳號 Deep Link、多維度評分與綠界訂閱升級。",
};

export default function NovaShieldAdminPage() {
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
        <AdminDashboard />
      </Suspense>
      <div className="mx-auto max-w-7xl px-4 pb-10 sm:px-6">
        <MerchantTermsSection />
      </div>
    </div>
  );
}
