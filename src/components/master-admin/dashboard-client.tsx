"use client";

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
import { KpiCard, SectionTitle } from "@/components/master-admin/kpi-grid";
import type {
  ActivityItem,
  ActivitySeriesPoint,
  OverviewKpis,
} from "@/lib/master-admin/overview";

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
        title="全域數據大廳"
        subtitle="跨 NovaOS 產品矩陣的執行總覽 · KPI、活躍趨勢與即時動態"
      />

      {error ? (
        <p className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
          {error}
        </p>
      ) : null}

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <KpiCard
          label="全站總用戶"
          value={loading || !kpis ? "—" : String(kpis.totalUsers)}
          hint={
            kpis
              ? `本月新增 ${kpis.newUsersThisMonth}`
              : loading
                ? "載入中"
                : undefined
          }
        />
        <KpiCard
          label="NovaStore 本月 GMV"
          value={loading || !kpis ? "—" : formatTwd(kpis.novastore.gmvThisMonth)}
          hint={
            kpis
              ? `對帳成功 ${kpis.novastore.matchedOrdersThisMonth} · 待對帳 ${kpis.novastore.pendingReports}`
              : undefined
          }
          accent="amber"
        />
        <KpiCard
          label="拓脈預約 本月"
          value={
            loading || !kpis ? "—" : String(kpis.booking.appointmentsThisMonth)
          }
          hint={
            kpis
              ? `完工 ${kpis.booking.completedThisMonth} · 完工率 ${kpis.booking.completionRate}%`
              : undefined
          }
          accent="cyan"
        />
        <KpiCard
          label="AI Doc 今日文件"
          value={loading || !kpis ? "—" : String(kpis.aidoc.draftsToday)}
          hint={
            kpis
              ? `本月 ${kpis.aidoc.draftsThisMonth} · 活躍作者 ${kpis.aidoc.activeAuthors}`
              : undefined
          }
          accent="rose"
        />
        <KpiCard
          label="訂閱管家 追蹤數"
          value={
            loading || !kpis
              ? "—"
              : String(kpis.subkeeper.totalActiveSubscriptions)
          }
          hint={
            kpis
              ? `月額度約 ${formatTwd(kpis.subkeeper.monthlyTrackedAmount)} · 7 日內到期 ${kpis.subkeeper.dueSoonCount}`
              : undefined
          }
          accent="emerald"
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 md:p-5">
          <h2 className="text-sm font-semibold text-slate-200">
            跨產品活躍趨勢（近 14 日）
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            註冊 / 賣場下單 / 預約 / 文件草稿（近似 DAU 對比）
          </p>
          <div className="mt-4 h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={series}>
                <CartesianGrid stroke="rgba(148,163,184,0.15)" strokeDasharray="3 3" />
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
          <h2 className="text-sm font-semibold text-slate-200">全站即時動態牆</h2>
          <p className="mt-1 text-xs text-slate-500">
            最新註冊、下單、對帳、預約、文件與訂閱追蹤
          </p>
          <ul className="mt-4 max-h-72 space-y-3 overflow-y-auto pr-1">
            {activity.length === 0 ? (
              <li className="text-sm text-slate-500">
                {loading ? "載入中…" : "尚無動態"}
              </li>
            ) : (
              activity.map((item) => (
                <li
                  key={item.id}
                  className="rounded-xl border border-white/5 bg-black/20 px-3 py-2"
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium text-slate-100">
                      {item.title}
                    </p>
                    <span className="text-[10px] uppercase tracking-wide text-slate-500">
                      {item.site}
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-slate-400">{item.detail}</p>
                  <p className="mt-1 text-[11px] text-slate-500">
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
