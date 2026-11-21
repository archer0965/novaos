"use client";

import { ConsoleTableClient } from "@/components/master-admin/console-table-client";

type Row = {
  id: string;
  title: string;
  docType: string;
  sellerId: string;
  createdAt: string;
  updatedAt: string;
};

export default function AdminAiDocPage() {
  return (
    <ConsoleTableClient<Row>
      title="Nova AI Doc 使用與額度"
      subtitle="文件草稿用量、作者排行（Hub ai_doc_drafts；獨立站 DocMate 另有完整用量）"
      endpoint="/api/admin/console/aidoc"
      mapRows={(payload) => ({
        rows: (payload.rows as Row[]) || [],
        total: Number(payload.total) || 0,
        page: Number(payload.page) || 1,
        pageSize: Number(payload.pageSize) || 20,
      })}
      extra={(payload) => {
        const ranking =
          (payload.ranking as Array<{ sellerId: string; count: number }>) ||
          [];
        if (!ranking.length) return null;
        return (
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <h2 className="text-sm font-semibold text-slate-200">用量排行 Top 10</h2>
            <ol className="mt-3 space-y-2 text-sm text-slate-300">
              {ranking.map((r, i) => (
                <li
                  key={r.sellerId}
                  className="flex items-center justify-between rounded-lg border border-white/5 px-3 py-2"
                >
                  <span>
                    #{i + 1}{" "}
                    <span className="font-mono text-xs text-slate-400">
                      {r.sellerId.slice(0, 8)}…
                    </span>
                  </span>
                  <span className="tabular-nums text-indigo-200">
                    {r.count} 份
                  </span>
                </li>
              ))}
            </ol>
          </div>
        );
      }}
      columns={[
        { key: "title", header: "標題", render: (r) => r.title },
        { key: "docType", header: "類型", render: (r) => r.docType },
        {
          key: "sellerId",
          header: "作者",
          render: (r) => (
            <span className="font-mono text-xs">{r.sellerId.slice(0, 8)}…</span>
          ),
        },
        {
          key: "updatedAt",
          header: "更新",
          render: (r) =>
            new Date(r.updatedAt).toLocaleString("zh-TW", {
              timeZone: "Asia/Taipei",
            }),
        },
      ]}
    />
  );
}
