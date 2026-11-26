"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ArrowRight, ExternalLink } from "lucide-react";
import { SectionTitle } from "@/components/master-admin/kpi-grid";
import { ADMIN_PRODUCTS } from "@/lib/master-admin/nav";
import type {
  ActivityItem,
  ActivitySeriesPoint,
  OverviewKpis,
} from "@/lib/master-admin/overview";
import { cn } from "@/lib/utils";

function formatTwd(n: number) {
  return `NT$ ${Math.round(n).toLocaleString("zh-TW")}`;
}

function formatWhen(iso: string) {
  try {
    return new Date(iso).toLocaleString("zh-TW", { timeZone: "Asia/Taipei" });
  } catch {
    return iso;
  }
}

const CARD_ACCENT: Record<string, string> = {
  amber: "hover:border-amber-400/40",
  cyan: "hover:border-cyan-400/40",
  sky: "hover:border-sky-400/40",
  emerald: "hover:border-emerald-400/40",
  rose: "hover:border-rose-400/40",
};

function productMetric(
  id: string,
  kpis: OverviewKpis | null,
  loading: boolean
): { value: string; hint: string } {
  if (loading || !kpis) return { value: "—", hint: "載入中" };
  switch (id) {
    case "novastore":
      return {
        value: formatTwd(kpis.novastore.gmvThisMonth),
        hint: `待對帳 ${kpis.novastore.pendingReports} · 本月對帳 ${kpis.novastore.matchedOrdersThisMonth}`,
      };
    case "booking":
      return {
        value: String(kpis.booking.appointmentsThisMonth),
        hint: `完工率 ${kpis.booking.completionRate}% · 完工 ${kpis.booking.completedThisMonth}`,
      };
    case "aidoc":
      return {
        value: String(kpis.aidoc.draftsThisMonth),
        hint: `今日 ${kpis.aidoc.draftsToday} · 活躍作者 ${kpis.aidoc.activeAuthors}`,
      };
    case "subkeeper":
      return {
        value: String(kpis.subkeeper.totalActiveSubscriptions),
        hint: `月額約 ${formatTwd(kpis.subkeeper.monthlyTrackedAmount)} · 7 日內到期 ${kpis.subkeeper.dueSoonCount}`,
      };
    case "dimension":
      return {
        value: "Credit",
        hint: "付費與生成請至拓維管理／主站 Pass",
      };
    default:
      return { value: "—", hint: "" };
  }
}

export function MasterDashboardClient() {
  const [kpis, setKpis] = useState<OverviewKpis | null>(null);
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [series, setSeries] = useState<ActivitySeriesPoint[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/admin/console/overview", {
          cache: "no-store",
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || "載入失敗");
        if (cancelled) return;
        setKpis(json.kpis);
        setActivity(json.activity || []);
        setSeries(json.series || []);
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "載入失敗");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="space-y-8">
      <SectionTitle
        title="總覽"
        subtitle="六站指揮台：先看全域，再點進單一產品監看"
      />

      {error ? (
        <p className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
          {error}
        </p>
      ) : null}

      <section className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
          <p className="text-xs text-slate-400">全站會員</p>
          <p className="mt-1 font-display text-2xl font-semibold tabular-nums text-white">
            {loading || !kpis ? "—" : kpis.totalUsers}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            {kpis ? `本月新增 ${kpis.newUsersThisMonth}` : " "}
          </p>
        </div>
        <Link
          href="/admin/users"
          className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 transition hover:border-white/20 hover:bg-white/[0.05]"
        >
          <p className="text-xs text-slate-400">會員與方案</p>
          <p className="mt-1 text-sm font-medium text-indigo-200">
            開啟會員管理
            <ArrowRight className="ml-1 inline h-3.5 w-3.5" />
          </p>
          <p className="mt-1 text-xs text-slate-500">跨站帳號、方案、模組</p>
        </Link>
        <Link
          href="/admin/settings"
          className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 transition hover:border-white/20 hover:bg-white/[0.05]"
        >
          <p className="text-xs text-slate-400">系統</p>
          <p className="mt-1 text-sm font-medium text-indigo-200">
            早鳥／金流／權限
            <ArrowRight className="ml-1 inline h-3.5 w-3.5" />
          </p>
          <p className="mt-1 text-xs text-slate-500">平台級設定，不混在產品頁</p>
        </Link>
      </section>

      <section>
        <div className="mb-3 flex items-end justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-slate-100">產品指揮台</h2>
            <p className="mt-0.5 text-xs text-slate-500">
              點卡片進入該產品的總管理監看；日常操作走各站營運後台
            </p>
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {ADMIN_PRODUCTS.map((product) => {
            const metric = productMetric(product.id, kpis, loading);
            return (
              <div
                key={product.id}
                className={cn(
                  "flex flex-col rounded-2xl border border-white/10 bg-white/[0.03] p-4 transition",
                  CARD_ACCENT[product.accent]
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold text-white">
                      {product.label}
                    </p>
                    <p className="mt-0.5 text-xs text-slate-500">{product.blurb}</p>
                  </div>
                  <a
                    href={product.opsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 rounded-md px-1.5 py-1 text-[11px] text-slate-400 hover:bg-white/5 hover:text-slate-200"
                    title={product.opsLabel}
                  >
                    營運
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
                <p className="mt-4 font-display text-xl font-semibold tabular-nums text-white">
                  {metric.value}
                </p>
                <p className="mt-1 text-xs text-slate-500">{metric.hint}</p>
                <Link
                  href={product.href}
                  className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-indigo-300 hover:text-indigo-200"
                >
                  進入監看
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            );
          })}
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 md:p-5">
          <h2 className="text-sm font-semibold text-slate-200">
            近 14 日活躍
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            註冊／下單／預約／文件
          </p>
          <div className="mt-4 h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={series}>
                <CartesianGrid
                  stroke="rgba(148,163,184,0.15)"
                  strokeDasharray="3 3"
                />
                <XAxis dataKey="label" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    background: "#121a33",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: 12,
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="signups"
                  name="註冊"
                  stroke="#818cf8"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="orders"
                  name="下單"
                  stroke="#fbbf24"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="bookings"
                  name="預約"
                  stroke="#22d3ee"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="docs"
                  name="文件"
                  stroke="#fb7185"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 md:p-5">
          <h2 className="text-sm font-semibold text-slate-200">即時動態</h2>
          <p className="mt-1 text-xs text-slate-500">跨站最新事件</p>
          <ul className="mt-4 max-h-64 space-y-2 overflow-y-auto pr-1">
            {activity.length === 0 ? (
              <li className="text-sm text-slate-500">
                {loading ? "載入中…" : "尚無動態"}
              </li>
            ) : (
              activity.filter((item) => item.type !== "aidoc").slice(0, 20).map((item) => (
                <li
                  key={item.id}
                  className="rounded-lg border border-white/5 bg-black/20 px-3 py-2"
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm text-slate-100">{item.title}</p>
                    <span className="shrink-0 text-[10px] uppercase tracking-wide text-slate-500">
                      {item.site}
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-slate-500">{item.detail}</p>
                  <p className="mt-1 text-[11px] text-slate-600">
                    {formatWhen(item.at)}
                  </p>
                </li>
              ))
            )}
          </ul>
        </div>
      </section>
    </div>
  );
}
