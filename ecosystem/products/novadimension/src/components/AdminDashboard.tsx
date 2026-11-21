"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  CalendarDays,
  Eye,
  MessageSquareText,
  RefreshCw,
} from "lucide-react";
import {
  STATS_RANGES,
  type DailyStats,
  type StatsRange,
} from "@/lib/analytics";

type StatsResponse = {
  range: StatsRange;
  label: string;
  totals: {
    visits: number;
    consultations: number;
    reviews: number;
  };
  daily: DailyStats[];
  error?: string;
};

export default function AdminDashboard() {
  const [range, setRange] = useState<StatsRange>("1d");
  const [data, setData] = useState<StatsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [unauthorized, setUnauthorized] = useState(false);
  const [error, setError] = useState("");
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function fetchStats() {
      setLoading(true);
      setError("");
      try {
        const response = await fetch(`/api/analytics/stats?range=${range}`, {
          cache: "no-store",
        });
        if (cancelled) return;

        if (response.status === 401) {
          setUnauthorized(true);
          setData(null);
          return;
        }

        const json = (await response.json()) as StatsResponse;
        if (!response.ok) {
          throw new Error(json.error || "無法載入數據");
        }

        setUnauthorized(false);
        setData(json);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "無法載入數據");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void fetchStats();
    return () => {
      cancelled = true;
    };
  }, [range, reloadToken]);

  if (unauthorized) {
    return (
      <main className="section-shell flex min-h-screen items-center justify-center py-20">
        <div className="soft-panel max-w-md px-6 py-10 text-center">
          <h1 className="font-display text-2xl font-semibold">未授權存取</h1>
          <p className="mt-3 text-sm leading-7 text-ink-muted">
            請回到首頁，快速點擊左上角 Logo 10 次以進入後台。
          </p>
          <Link href="/" className="btn btn-primary mt-8">
            回到首頁
          </Link>
        </div>
      </main>
    );
  }

  const totals = data?.totals || {
    visits: 0,
    consultations: 0,
    reviews: 0,
  };

  const cards = [
    {
      label: "網站造訪",
      value: totals.visits,
      hint: "以瀏覽器工作階段計算",
      icon: Eye,
    },
    {
      label: "預約表單",
      value: totals.consultations,
      hint: "成功送出的預約數",
      icon: CalendarDays,
    },
    {
      label: "客戶評論",
      value: totals.reviews,
      hint: "成功送出的評論數",
      icon: MessageSquareText,
    },
  ];

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#fffaf5_0%,#f6efe6_100%)] pb-16 pt-10">
      <div className="section-shell">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm text-ink-muted transition-colors hover:text-ink"
            >
              <ArrowLeft size={16} aria-hidden />
              回到網站
            </Link>
            <h1 className="headline mt-3 text-[clamp(1.8rem,4vw,2.6rem)]">
              後台數據
            </h1>
            <p className="mt-2 text-sm text-ink-muted">
              拓維空間NovaDimension｜依台北時間統計
            </p>
          </div>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => setReloadToken((value) => value + 1)}
            disabled={loading}
          >
            <RefreshCw size={16} aria-hidden />
            重新整理
          </button>
        </div>

        <div className="mt-8 flex flex-wrap gap-2">
          {STATS_RANGES.map((item) => {
            const active = item.id === range;
            return (
              <button
                key={item.id}
                type="button"
                className={`rounded-2xl border px-4 py-2.5 text-sm font-semibold transition-colors ${
                  active
                    ? "border-accent/40 bg-accent text-white"
                    : "border-line bg-ivory text-ink-muted hover:text-ink"
                }`}
                onClick={() => setRange(item.id)}
              >
                {item.label}
              </button>
            );
          })}
        </div>

        {error ? (
          <p className="mt-6 text-sm text-[#b42318]" role="alert">
            {error}
          </p>
        ) : null}

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {cards.map((card) => {
            const Icon = card.icon;
            return (
              <article key={card.label} className="soft-panel p-5 md:p-6">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-ink-muted">{card.label}</p>
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-accent/10 text-accent">
                    <Icon size={18} aria-hidden />
                  </span>
                </div>
                <p className="font-display mt-4 text-4xl font-semibold tracking-tight">
                  {loading ? "—" : card.value}
                </p>
                <p className="mt-2 text-xs text-ink-muted">{card.hint}</p>
              </article>
            );
          })}
        </div>

        <section className="soft-panel mt-8 overflow-hidden">
          <div className="border-b border-line px-5 py-4 md:px-6">
            <h2 className="font-display text-lg font-semibold tracking-tight">
              {data?.label || "今日"}明細
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-cream/70 text-ink-muted">
                <tr>
                  <th className="px-5 py-3 font-medium md:px-6">日期</th>
                  <th className="px-5 py-3 font-medium md:px-6">造訪</th>
                  <th className="px-5 py-3 font-medium md:px-6">預約</th>
                  <th className="px-5 py-3 font-medium md:px-6">評論</th>
                </tr>
              </thead>
              <tbody>
                {(data?.daily || []).map((day) => (
                  <tr key={day.date} className="border-t border-line">
                    <td className="px-5 py-3 md:px-6">{day.date}</td>
                    <td className="px-5 py-3 md:px-6">{day.visits}</td>
                    <td className="px-5 py-3 md:px-6">{day.consultations}</td>
                    <td className="px-5 py-3 md:px-6">{day.reviews}</td>
                  </tr>
                ))}
                {!loading && (data?.daily?.length || 0) === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-5 py-8 text-center text-ink-muted md:px-6"
                    >
                      尚無資料
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}
