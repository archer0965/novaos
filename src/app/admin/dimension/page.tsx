import Link from "next/link";
import { ProductPanelHeader } from "@/components/master-admin/product-panel";
import { ADMIN_PRODUCTS } from "@/lib/master-admin/nav";

export default function AdminDimensionPage() {
  const product = ADMIN_PRODUCTS.find((p) => p.id === "dimension")!;

  return (
    <div className="space-y-6">
      <ProductPanelHeader
        product={product}
        title="拓維空間"
        subtitle="Credit 與付費方案由主站綠界入帳；生成與用量在拓維管理查看"
      />

      <section className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
          <h2 className="text-sm font-semibold text-slate-100">付費入帳路徑</h2>
          <p className="mt-2 text-sm leading-6 text-slate-400">
            會員於主站 Pass 選擇拓維方案 → 綠界付款 →
            <code className="mx-1 text-indigo-200">/api/checkout/callback</code>
            → 授權產品站
            <code className="mx-1 text-indigo-200">/api/credits/fulfill</code>
            入帳。前端
            <code className="mx-1 text-indigo-200">?paid=1</code>
            不會加點。
          </p>
          <Link
            href="/dashboard/pass#dimension-upgrade"
            className="mt-4 inline-flex text-sm font-medium text-indigo-300 hover:text-indigo-200"
          >
            開啟 Pass 拓維方案 →
          </Link>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
          <h2 className="text-sm font-semibold text-slate-100">監看重點</h2>
          <ul className="mt-2 space-y-2 text-sm text-slate-400">
            <li>· 免費 Credit 每帳號僅能領一次</li>
            <li>· AI 生成失敗必須返還 Credit</li>
            <li>· 產出為 2D 擬真預覽，非可操作 3D 模型</li>
            <li>· 無限方案需留意成本與濫用</li>
          </ul>
          <a
            href={product.opsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex text-sm font-medium text-indigo-300 hover:text-indigo-200"
          >
            前往拓維管理 →
          </a>
        </div>
      </section>
    </div>
  );
}
