import Link from "next/link";
import { NOVAOS_ECOSYSTEM_PRODUCTS, NOVAOS_LEGAL, NOVAOS_LINE_URL } from "@/lib/novaos-trust";

type ProductEntitlement = {
  id: string;
  name: string;
  href: string;
  role: string;
  entitlement: {
    status: string;
    plan: string;
    label: string;
    expiresAt?: string | null;
    trialEndsAt?: string | null;
  };
};

export function EcosystemEntitlements({
  products,
}: {
  products: ProductEntitlement[];
}) {
  const list: ProductEntitlement[] =
    products.length > 0
      ? products
      : NOVAOS_ECOSYSTEM_PRODUCTS.map((p) => ({
          ...p,
          entitlement: {
            status: "unknown",
            plan: "—",
            label: "請重新整理",
            expiresAt: null,
            trialEndsAt: null,
          },
        }));

  return (
    <section
      id="member-center"
      className="rounded-2xl border border-sky-200/80 bg-gradient-to-br from-sky-50/80 via-background to-emerald-50/40 p-5 md:p-6"
    >
      <p className="text-sm text-muted-foreground">01 統一會員中心</p>
      <h2 className="mt-1 font-display text-xl font-semibold">
        一個 NovaOS 帳號 · 六個產品權益
      </h2>
      <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
        登入、會員資料、訂閱狀態與權益以本頁為中樞。付款成功後由後端回調更新權益；客服統一走官方
        LINE。
      </p>

      <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((p) => (
          <li
            key={p.id}
            className="rounded-xl border border-border/70 bg-card/80 p-4 text-sm"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-semibold text-foreground">{p.name}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{p.role}</p>
              </div>
              <span
                className={`shrink-0 rounded-md px-2 py-0.5 text-[11px] font-semibold ${
                  p.entitlement.status === "active" ||
                  p.entitlement.status === "free"
                    ? "bg-emerald-100 text-emerald-900"
                    : p.entitlement.status === "locked"
                      ? "bg-amber-100 text-amber-950"
                      : "bg-slate-100 text-slate-700"
                }`}
              >
                {p.entitlement.label}
              </span>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              方案：{p.entitlement.plan}
              {p.entitlement.expiresAt
                ? ` · 到期 ${new Date(p.entitlement.expiresAt).toLocaleDateString("zh-TW", { timeZone: "Asia/Taipei" })}`
                : ""}
            </p>
            <a
              href={p.href}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex text-xs font-medium text-primary underline-offset-2 hover:underline"
            >
              開啟產品 →
            </a>
          </li>
        ))}
      </ul>

      <div className="mt-4 flex flex-wrap gap-3 text-xs">
        <Link href={NOVAOS_LEGAL.terms} className="text-primary hover:underline">
          服務條款
        </Link>
        <Link href={NOVAOS_LEGAL.privacy} className="text-primary hover:underline">
          隱私政策
        </Link>
        <Link href={NOVAOS_LEGAL.refund} className="text-primary hover:underline">
          退款說明
        </Link>
        <a
          href={NOVAOS_LINE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-emerald-800 hover:underline"
        >
          LINE 客服 @469uykad
        </a>
      </div>
    </section>
  );
}
