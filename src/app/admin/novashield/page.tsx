import { ProductPanelHeader } from "@/components/master-admin/product-panel";
import { ADMIN_PRODUCTS } from "@/lib/master-admin/nav";

export default function AdminNovaShieldPage() {
  const product = ADMIN_PRODUCTS.find((p) => p.id === "novashield")!;

  return (
    <div className="space-y-6">
      <ProductPanelHeader
        product={product}
        title="Nova商譽寶（NovaShield）"
        subtitle="門市 5 星好評引導與客訴防護微服務；門市設定與訂閱管理在商譽寶後台查看"
      />

      <section className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
          <h2 className="text-sm font-semibold text-slate-100">方案與金流</h2>
          <p className="mt-2 text-sm leading-6 text-slate-400">
            獨立產品（不含於旗艦全家桶），已整合至主站
            <code className="mx-1 text-indigo-200">/novashield</code>
            並共用 Supabase、綠界 ECPay 與 Resend 到期提醒。免費體驗版 NT$0；專業版
            Pro 月繳 NT$199／年繳 NT$1,990，付款回調走
            <code className="mx-1 text-indigo-200">/api/novashield/checkout/callback</code>
            自動開通。
          </p>
          <a
            href={product.publicUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex text-sm font-medium text-indigo-300 hover:text-indigo-200"
          >
            開啟 Nova商譽寶官網 →
          </a>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
          <h2 className="text-sm font-semibold text-slate-100">監看重點</h2>
          <ul className="mt-2 space-y-2 text-sm text-slate-400">
            <li>· 4–5 星引導 Google Maps 好評；1–3 星引導 LINE 私訊或 Email 客訴</li>
            <li>· 預設保留公開評論連結，符合《公平交易法》與 Google 規範</li>
            <li>· 共用主站 Supabase（`novashield_shops`）與 Resend 到期前 3 天提醒</li>
            <li>· 到期前 3 天自動寄送 Email 續費提醒（Vercel Cron）</li>
          </ul>
          <a
            href={product.opsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex text-sm font-medium text-indigo-300 hover:text-indigo-200"
          >
            前往商譽寶後台 →
          </a>
        </div>
      </section>
    </div>
  );
}
