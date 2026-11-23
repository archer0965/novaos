"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function ListToolbar({
  q,
  from,
  to,
  status,
  statusOptions,
  onChange,
  onRefresh,
  loading,
}: {
  q: string;
  from: string;
  to: string;
  status: string;
  statusOptions?: Array<{ value: string; label: string }>;
  onChange: (next: {
    q?: string;
    from?: string;
    to?: string;
    status?: string;
  }) => void;
  onRefresh: () => void;
  loading?: boolean;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-3 md:flex-row md:flex-wrap md:items-end">
      <label className="block min-w-[12rem] flex-1 text-xs text-slate-400">
        關鍵字搜尋
        <Input
          value={q}
          onChange={(e) => onChange({ q: e.target.value })}
          placeholder="名稱／末五碼／電話…"
          className="mt-1 border-white/10 bg-[#0b1020] text-slate-100"
        />
      </label>
      <label className="block text-xs text-slate-400">
        起日
        <Input
          type="date"
          value={from}
          onChange={(e) => onChange({ from: e.target.value })}
          className="mt-1 border-white/10 bg-[#0b1020] text-slate-100"
        />
      </label>
      <label className="block text-xs text-slate-400">
        迄日
        <Input
          type="date"
          value={to}
          onChange={(e) => onChange({ to: e.target.value })}
          className="mt-1 border-white/10 bg-[#0b1020] text-slate-100"
        />
      </label>
      {statusOptions ? (
        <label className="block text-xs text-slate-400">
          狀態
          <select
            value={status}
            onChange={(e) => onChange({ status: e.target.value })}
            className="mt-1 flex h-10 w-full rounded-md border border-white/10 bg-[#0b1020] px-3 text-sm text-slate-100"
          >
            <option value="">全部</option>
            {statusOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
      ) : null}
      <Button
        type="button"
        onClick={onRefresh}
        disabled={loading}
        className="bg-indigo-500 text-white hover:bg-indigo-400"
      >
        {loading ? "載入中…" : "套用篩選"}
      </Button>
    </div>
  );
}

export function PaginationBar({
  page,
  pageSize,
  total,
  onPage,
}: {
  page: number;
  pageSize: number;
  total: number;
  onPage: (page: number) => void;
}) {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-slate-400">
      <span>
        共 {total} 筆 · 第 {page}/{pages} 頁
      </span>
      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={page <= 1}
          onClick={() => onPage(page - 1)}
          className="border-white/10 bg-transparent text-slate-200"
        >
          上一頁
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={page >= pages}
          onClick={() => onPage(page + 1)}
          className="border-white/10 bg-transparent text-slate-200"
        >
          下一頁
        </Button>
      </div>
    </div>
  );
}
