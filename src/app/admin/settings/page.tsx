import Link from "next/link";
import { AdminEarlyBirdPanel } from "@/components/dashboard/admin-early-bird";
import { SectionTitle } from "@/components/master-admin/kpi-grid";
import { getAdminEmails } from "@/lib/admin";
import { PRODUCT_ECOSYSTEM } from "@/lib/product-ecosystem";
import { requireAdminPage } from "@/lib/master-admin/auth";

export default async function AdminSettingsPage() {
  await requireAdminPage();
  const admins = getAdminEmails();

  return (
    <div className="space-y-8">
      <SectionTitle
        title="全域系統與金流設定"
        subtitle="Admin RBAC、特約／早鳥、產品站入口與既有營運工具"
      />

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
          <h2 className="text-sm font-semibold text-slate-100">Admin RBAC</h2>
          <p className="mt-2 text-sm text-slate-400">
            僅 <code className="text-indigo-200">ADMIN_EMAILS</code>／內建擁有者可進入
            <code className="mx-1 text-indigo-200">/admin/*</code> 與{" "}
            <code className="text-indigo-200">/api/admin/console/*</code>。
          </p>
          <ul className="mt-3 space-y-1 text-sm text-slate-300">
            {admins.map((email) => (
              <li key={email} className="font-mono text-xs">
                {email}
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
          <h2 className="text-sm font-semibold text-slate-100">產品矩陣入口</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {PRODUCT_ECOSYSTEM.map((p) => (
              <li key={p.id} className="flex items-center justify-between gap-3">
                <span className="text-slate-300">{p.name}</span>
                <a
                  href={p.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-300 hover:underline"
                >
                  開啟
                </a>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-xs text-slate-500">
            綠界 ECPay 統一走主站訂閱中控：{" "}
            <Link href="/dashboard/pass#upgrade" className="text-indigo-300 hover:underline">
              /dashboard/pass#upgrade
            </Link>
          </p>
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-white/10 bg-slate-50 text-slate-900">
        <div className="border-b border-slate-200 bg-white px-5 py-3 text-sm font-semibold">
          特約店家／早鳥管理（沿用既有面板）
        </div>
        <div className="p-4 md:p-5">
          <AdminEarlyBirdPanel />
        </div>
      </section>
    </div>
  );
}
