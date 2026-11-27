"use client";

import { useCallback, useEffect, useState } from "react";
import {
  AlertTriangle,
  Crown,
  ExternalLink,
  RefreshCw,
  Search,
  Trash2,
} from "lucide-react";
import { KpiCard } from "@/components/master-admin/kpi-grid";
import { PaginationBar } from "@/components/master-admin/list-toolbar";
import type {
  AdminNovaShieldShopRow,
  AdminNovaShieldTradeRow,
} from "@/lib/master-admin/products";

type Summary = {
  totalShops: number;
  activeProShops: number;
  expiringSoon: number;
  revenueThisMonth: number;
  totalRevenue: number;
};

type ApiPayload = {
  ok: boolean;
  migrated: boolean;
  summary: Summary;
  rows: AdminNovaShieldShopRow[];
  total: number;
  page: number;
  pageSize: number;
  trades: AdminNovaShieldTradeRow[];
  error?: string;
};

function formatTaipei(iso: string | null) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString("zh-TW", { timeZone: "Asia/Taipei" });
  } catch {
    return iso;
  }
}

export function NovaShieldAdminClient() {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [data, setData] = useState<ApiPayload | null>(null);
  const [quickShopId, setQuickShopId] = useState("");
  const [quickCycle, setQuickCycle] = useState<"monthly" | "yearly">("monthly");

  const load = useCallback(
    async (targetPage = page) => {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams();
        params.set("page", String(targetPage));
        params.set("pageSize", "20");
        if (q.trim()) params.set("q", q.trim());
        if (status) params.set("status", status);
        const res = await fetch(
          `/api/admin/console/novashield?${params.toString()}`,
          { cache: "no-store" }
        );
        const json = (await res.json()) as ApiPayload;
        if (!res.ok) throw new Error(json.error || "載入失敗");
        setData(json);
        setPage(json.page || 1);
      } catch (e) {
        setError(e instanceof Error ? e.message : "載入失敗");
      } finally {
        setLoading(false);
      }
    },
    [page, q, status]
  );

  useEffect(() => {
    void load(1);
    // initial load
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function runAction(input: {
    action: "grant_pro" | "set_free" | "delete";
    shopId: string;
    cycle?: "monthly" | "yearly";
  }) {
    if (
      input.action === "delete" &&
      !window.confirm(`確定刪除門市「${input.shopId}」？歷史交易紀錄會保留。`)
    ) {
      return;
    }
    if (
      input.action === "set_free" &&
      !window.confirm(`確定將「${input.shopId}」切回 FREE 免費版？`)
    ) {
      return;
    }

    const key = `${input.action}:${input.shopId}:${input.cycle || ""}`;
    setBusyKey(key);
    setError(null);
    setNotice(null);
    try {
      const res = await fetch("/api/admin/console/novashield", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      const json = (await res.json()) as {
        ok?: boolean;
        message?: string;
        error?: string;
      };
      if (!res.ok || !json.ok) throw new Error(json.error || "操作失敗");
      setNotice(json.message || "已更新");
      if (input.action === "grant_pro" && input.shopId === quickShopId.trim()) {
        setQuickShopId("");
      }
      await load(page);
    } catch (e) {
      setError(e instanceof Error ? e.message : "操作失敗");
    } finally {
      setBusyKey(null);
    }
  }

  const summary = data?.summary;
  const rows = data?.rows || [];
  const trades = data?.trades || [];

  return (
    <div className="space-y-6">
      {data && !data.migrated ? (
        <div className="flex items-start gap-3 rounded-2xl border border-amber-400/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" />
          <div>
            <p className="font-semibold">
              Supabase 尚未建立 Nova商譽寶資料表（novashield_shops）
            </p>
            <p className="mt-1 text-xs text-amber-200/80">
              請在 Supabase SQL Editor 執行{" "}
              <code className="rounded bg-black/30 px-1.5 py-0.5">
                supabase/migrations/030_novashield_shops.sql
              </code>
              ，執行後重新整理此頁即可看到全部門市與付款紀錄。
            </p>
          </div>
        </div>
      ) : null}

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="門市總數"
          value={loading || !summary ? "—" : String(summary.totalShops)}
          hint="已存雲端之門市"
          accent="indigo"
        />
        <KpiCard
          label="有效 PRO 門市"
          value={loading || !summary ? "—" : String(summary.activeProShops)}
          hint="未過期專業版"
          accent="emerald"
        />
        <KpiCard
          label="7 日內到期"
          value={loading || !summary ? "—" : String(summary.expiringSoon)}
          hint="到期前 3 天自動寄信"
          accent="amber"
        />
        <KpiCard
          label="本月綠界收款"
          value={
            loading || !summary
              ? "—"
              : `NT$ ${summary.revenueThisMonth.toLocaleString("zh-TW")}`
          }
          hint={
            summary
              ? `近期累積 NT$ ${summary.totalRevenue.toLocaleString("zh-TW")}`
              : undefined
          }
          accent="cyan"
        />
      </section>

      {/* Manual admin grant tool */}
      <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
        <p className="text-xs font-semibold text-slate-300">
          人工開通／展延門市 PRO（客服補單或特約使用）
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <input
            type="text"
            value={quickShopId}
            onChange={(e) => setQuickShopId(e.target.value)}
            placeholder="輸入門市代碼 shopId（例：bistro88）"
            className="h-9 min-w-[220px] flex-1 rounded-lg border border-white/10 bg-black/30 px-3 text-sm text-white placeholder:text-slate-500 focus:border-indigo-400 focus:outline-none"
          />
          <select
            value={quickCycle}
            onChange={(e) =>
              setQuickCycle(e.target.value === "yearly" ? "yearly" : "monthly")
            }
            className="h-9 rounded-lg border border-white/10 bg-[#121a33] px-3 text-sm text-slate-200"
          >
            <option value="monthly">月繳 PRO（+30 天）</option>
            <option value="yearly">年繳 PRO（+365 天）</option>
          </select>
          <button
            type="button"
            disabled={!quickShopId.trim() || busyKey !== null}
            onClick={() =>
              void runAction({
                action: "grant_pro",
                shopId: quickShopId.trim(),
                cycle: quickCycle,
              })
            }
            className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-amber-500 px-3.5 text-xs font-semibold text-slate-950 transition hover:bg-amber-400 disabled:opacity-50"
          >
            <Crown className="h-3.5 w-3.5" />
            立即開通／展延 PRO
          </button>
        </div>
      </section>

      {error ? (
        <p className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
          {error}
        </p>
      ) : null}
      {notice ? (
        <p className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
          {notice}
        </p>
      ) : null}

      {/* Filter toolbar */}
      <section className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-[220px] flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") void load(1);
            }}
            placeholder="搜尋門市代碼、店名、Email、LINE ID"
            className="h-9 w-full rounded-lg border border-white/10 bg-black/30 pl-9 pr-3 text-sm text-white placeholder:text-slate-500 focus:border-indigo-400 focus:outline-none"
          />
        </div>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="h-9 rounded-lg border border-white/10 bg-[#121a33] px-3 text-sm text-slate-200"
        >
          <option value="">全部方案</option>
          <option value="pro">有效 PRO</option>
          <option value="expiring">7 日內到期</option>
          <option value="expired">已過期 PRO</option>
          <option value="free">FREE 免費版</option>
        </select>
        <button
          type="button"
          onClick={() => void load(1)}
          disabled={loading}
          className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 text-xs font-medium text-slate-200 hover:bg-white/10 disabled:opacity-50"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          查詢
        </button>
      </section>

      {/* Shops Table */}
      <div className="overflow-x-auto rounded-2xl border border-white/10">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-white/[0.04] text-xs uppercase tracking-wide text-slate-400">
            <tr>
              <th className="px-4 py-3 font-medium">門市</th>
              <th className="px-4 py-3 font-medium">聯絡／LINE</th>
              <th className="px-4 py-3 font-medium">方案</th>
              <th className="px-4 py-3 font-medium">到期時間（台北）</th>
              <th className="px-4 py-3 font-medium">管理操作</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-8 text-center text-slate-500"
                >
                  {loading ? "載入中…" : "目前沒有門市資料"}
                </td>
              </tr>
            ) : (
              rows.map((shop) => (
                <tr
                  key={shop.shopId}
                  className="border-t border-white/5 text-slate-200 hover:bg-white/[0.03]"
                >
                  <td className="px-4 py-3">
                    <p className="font-medium text-white">{shop.shopName}</p>
                    <p className="mt-0.5 font-mono text-xs text-slate-400">
                      {shop.shopId}
                    </p>
                    <div className="mt-1 flex flex-wrap gap-2 text-[11px]">
                      <a
                        href={`/novashield/admin?shop=${encodeURIComponent(shop.shopId)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-0.5 text-indigo-300 hover:underline"
                      >
                        編輯設定
                        <ExternalLink className="h-3 w-3" />
                      </a>
                      <a
                        href={`/novashield/feedback/${encodeURIComponent(shop.shopId)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-0.5 text-sky-300 hover:underline"
                      >
                        評分頁
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-300">
                    <p>{shop.emailNotification || "—"}</p>
                    <p className="mt-0.5 text-slate-500">
                      {shop.lineId ? `LINE: ${shop.lineId}` : "未設 LINE"}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    {shop.effectivePlan === "PRO" ? (
                      <span className="inline-flex items-center gap-1 rounded-md border border-emerald-400/30 bg-emerald-500/15 px-2 py-0.5 text-xs font-semibold text-emerald-200">
                        PRO
                        {shop.billingCycle === "yearly" ? " · 年" : " · 月"}
                      </span>
                    ) : shop.expired ? (
                      <span className="inline-flex rounded-md border border-rose-400/30 bg-rose-500/15 px-2 py-0.5 text-xs font-semibold text-rose-200">
                        PRO 已過期
                      </span>
                    ) : (
                      <span className="inline-flex rounded-md border border-white/10 bg-white/5 px-2 py-0.5 text-xs text-slate-400">
                        FREE
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs tabular-nums text-slate-300">
                    {formatTaipei(shop.planExpiresAt)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <button
                        type="button"
                        disabled={busyKey !== null}
                        onClick={() =>
                          void runAction({
                            action: "grant_pro",
                            shopId: shop.shopId,
                            cycle: "monthly",
                          })
                        }
                        className="rounded-md border border-amber-400/30 bg-amber-500/15 px-2 py-1 text-[11px] font-medium text-amber-200 hover:bg-amber-500/25 disabled:opacity-50"
                      >
                        +30天 PRO
                      </button>
                      <button
                        type="button"
                        disabled={busyKey !== null}
                        onClick={() =>
                          void runAction({
                            action: "grant_pro",
                            shopId: shop.shopId,
                            cycle: "yearly",
                          })
                        }
                        className="rounded-md border border-emerald-400/30 bg-emerald-500/15 px-2 py-1 text-[11px] font-medium text-emerald-200 hover:bg-emerald-500/25 disabled:opacity-50"
                      >
                        +365天 PRO
                      </button>
                      {shop.plan === "PRO" ? (
                        <button
                          type="button"
                          disabled={busyKey !== null}
                          onClick={() =>
                            void runAction({
                              action: "set_free",
                              shopId: shop.shopId,
                            })
                          }
                          className="rounded-md border border-white/10 bg-white/5 px-2 py-1 text-[11px] text-slate-300 hover:bg-white/10 disabled:opacity-50"
                        >
                          切回 FREE
                        </button>
                      ) : null}
                      <button
                        type="button"
                        disabled={busyKey !== null}
                        onClick={() =>
                          void runAction({
                            action: "delete",
                            shopId: shop.shopId,
                          })
                        }
                        title="刪除門市"
                        className="inline-flex items-center rounded-md border border-rose-400/20 bg-rose-500/10 p-1 text-rose-300 hover:bg-rose-500/20 disabled:opacity-50"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <PaginationBar
        page={page}
        pageSize={data?.pageSize || 20}
        total={data?.total || 0}
        onPage={(p) => void load(p)}
      />

      {/* Recent ECPay Trades */}
      <section className="space-y-3">
        <div>
          <h2 className="text-sm font-semibold text-slate-100">
            近期綠界付款紀錄（novashield_processed_trades）
          </h2>
          <p className="mt-0.5 text-xs text-slate-500">
            僅顯示已驗證 CheckMacValue 並完成入帳的商譽寶綠界交易
          </p>
        </div>
        <div className="overflow-x-auto rounded-2xl border border-white/10">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-white/[0.04] text-xs uppercase tracking-wide text-slate-400">
              <tr>
                <th className="px-4 py-3 font-medium">交易編號</th>
                <th className="px-4 py-3 font-medium">門市代碼</th>
                <th className="px-4 py-3 font-medium">週期</th>
                <th className="px-4 py-3 font-medium">金額</th>
                <th className="px-4 py-3 font-medium">入帳時間（台北）</th>
              </tr>
            </thead>
            <tbody>
              {trades.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-6 text-center text-slate-500"
                  >
                    尚無綠界付款紀錄
                  </td>
                </tr>
              ) : (
                trades.map((t) => (
                  <tr
                    key={t.merchantTradeNo}
                    className="border-t border-white/5 text-slate-200"
                  >
                    <td className="px-4 py-2.5 font-mono text-xs">
                      {t.merchantTradeNo}
                    </td>
                    <td className="px-4 py-2.5 font-mono text-xs text-slate-300">
                      {t.shopId}
                    </td>
                    <td className="px-4 py-2.5 text-xs">
                      {t.billingCycle === "yearly" ? "年繳" : "月繳"}
                    </td>
                    <td className="px-4 py-2.5 text-xs font-semibold tabular-nums text-emerald-300">
                      NT$ {t.amount.toLocaleString("zh-TW")}
                    </td>
                    <td className="px-4 py-2.5 text-xs tabular-nums text-slate-400">
                      {formatTaipei(t.processedAt)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
