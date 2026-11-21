"use client";

import { useCallback, useEffect, useState } from "react";
import {
  ListToolbar,
  PaginationBar,
} from "@/components/master-admin/list-toolbar";
import { SectionTitle } from "@/components/master-admin/kpi-grid";
import { cn } from "@/lib/utils";

export type Column<T> = {
  key: string;
  header: string;
  render: (row: T) => React.ReactNode;
  className?: string;
};

export function ConsoleTableClient<T extends { id: string }>({
  title,
  subtitle,
  endpoint,
  columns,
  statusOptions,
  extra,
  mapRows,
}: {
  title: string;
  subtitle?: string;
  endpoint: string;
  columns: Column<T>[];
  statusOptions?: Array<{ value: string; label: string }>;
  extra?: (payload: Record<string, unknown>) => React.ReactNode;
  mapRows: (payload: Record<string, unknown>) => {
    rows: T[];
    total: number;
    page: number;
    pageSize: number;
  };
}) {
  const [q, setQ] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [rows, setRows] = useState<T[]>([]);
  const [total, setTotal] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [payload, setPayload] = useState<Record<string, unknown>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(
    async (nextPage = page) => {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams();
        params.set("page", String(nextPage));
        params.set("pageSize", "20");
        if (q) params.set("q", q);
        if (from) params.set("from", from);
        if (to) params.set("to", to);
        if (status) params.set("status", status);
        const res = await fetch(`${endpoint}?${params.toString()}`, {
          cache: "no-store",
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || "載入失敗");
        const mapped = mapRows(json);
        setRows(mapped.rows);
        setTotal(mapped.total);
        setPage(mapped.page);
        setPageSize(mapped.pageSize);
        setPayload(json);
      } catch (e) {
        setError(e instanceof Error ? e.message : "載入失敗");
      } finally {
        setLoading(false);
      }
    },
    [endpoint, from, mapRows, page, q, status, to]
  );

  useEffect(() => {
    void load(1);
    // initial only
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [endpoint]);

  return (
    <div className="space-y-5">
      <SectionTitle title={title} subtitle={subtitle} />
      <ListToolbar
        q={q}
        from={from}
        to={to}
        status={status}
        statusOptions={statusOptions}
        loading={loading}
        onChange={(next) => {
          if (next.q !== undefined) setQ(next.q);
          if (next.from !== undefined) setFrom(next.from);
          if (next.to !== undefined) setTo(next.to);
          if (next.status !== undefined) setStatus(next.status);
        }}
        onRefresh={() => void load(1)}
      />
      {extra ? extra(payload) : null}
      {error ? (
        <p className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
          {error}
        </p>
      ) : null}
      <div className="overflow-x-auto rounded-2xl border border-white/10">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-white/[0.04] text-xs uppercase tracking-wide text-slate-400">
            <tr>
              {columns.map((c) => (
                <th key={c.key} className={cn("px-4 py-3 font-medium", c.className)}>
                  {c.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-8 text-center text-slate-500"
                >
                  {loading ? "載入中…" : "沒有符合條件的資料"}
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr
                  key={row.id}
                  className="border-t border-white/5 text-slate-200 hover:bg-white/[0.03]"
                >
                  {columns.map((c) => (
                    <td key={c.key} className={cn("px-4 py-3", c.className)}>
                      {c.render(row)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <PaginationBar
        page={page}
        pageSize={pageSize}
        total={total}
        onPage={(p) => void load(p)}
      />
    </div>
  );
}
