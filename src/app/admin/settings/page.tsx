import Link from "next/link";
import { AdminEarlyBirdPanel } from "@/components/dashboard/admin-early-bird";
import { SectionTitle } from "@/components/master-admin/kpi-grid";
import { getAdminEmails } from "@/lib/admin";
import { requireAdminPage } from "@/lib/master-admin/auth";

export default async function AdminSettingsPage() {
  await requireAdminPage();
  const admins = getAdminEmails();

  return (
    <div className="space-y-8">
      <SectionTitle
        title="系統"
        subtitle="權限、早鳥特約與金流入口（平台級設定）"
      />

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
          <h2 className="text-sm font-semibold text-slate-100">管理員</h2>
          <p className="mt-2 text-sm text-slate-400">
            僅下列帳號可進入 <code className="text-indigo-200">/admin</code>
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
          <h2 className="text-sm font-semibold text-slate-100">金流</h2>
          <p className="mt-2 text-sm leading-6 text-slate-400">
            NovaOS／NovaStore／DocMate／拓維訂閱統一走主站綠界；拓脈訂閱與訂金走拓脈本站。
          </p>
          <div className="mt-4 flex flex-wrap gap-3 text-sm">
            <Link
              href="/dashboard/pass#upgrade"
              className="text-indigo-300 hover:underline"
            >
              Pass 訂閱中控
            </Link>
            <Link
              href="/dashboard/pass#dimension-upgrade"
              className="text-indigo-300 hover:underline"
            >
              拓維方案
            </Link>
          </div>
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-white/10 bg-slate-50 text-slate-900">
        <div className="border-b border-slate-200 bg-white px-5 py-3 text-sm font-semibold">
          特約店家／早鳥
        </div>
        <div className="p-4 md:p-5">
          <AdminEarlyBirdPanel />
        </div>
      </section>
    </div>
  );
}
