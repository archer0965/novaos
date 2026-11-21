"use client";

import { ConsoleTableClient } from "@/components/master-admin/console-table-client";

type Row = {
  id: string;
  kind: string;
  buyer: string;
  amount: number;
  lastFive: string;
  status: string;
  createdAt: string;
};

export default function AdminNovaStorePage() {
  return (
    <ConsoleTableClient<Row>
      title="NovaStore 賣場管理"
      subtitle="待對帳訂單、匯款末五碼搜尋與對帳狀態（Hub 共用資料層）"
      endpoint="/api/admin/console/novastore"
      statusOptions={[
        { value: "pending", label: "pending" },
        { value: "confirmed", label: "confirmed" },
        { value: "auto_confirmed", label: "auto_confirmed" },
        { value: "rejected", label: "rejected" },
      ]}
      mapRows={(payload) => ({
        rows: (payload.rows as Row[]) || [],
        total: Number(payload.total) || 0,
        page: Number(payload.page) || 1,
        pageSize: Number(payload.pageSize) || 20,
      })}
      columns={[
        { key: "buyer", header: "買家", render: (r) => r.buyer },
        {
          key: "amount",
          header: "金額",
          render: (r) => `NT$ ${r.amount.toLocaleString("zh-TW")}`,
        },
        { key: "lastFive", header: "末五碼", render: (r) => r.lastFive },
        { key: "status", header: "狀態", render: (r) => r.status },
        {
          key: "createdAt",
          header: "時間",
          render: (r) =>
            new Date(r.createdAt).toLocaleString("zh-TW", {
              timeZone: "Asia/Taipei",
            }),
        },
      ]}
    />
  );
}
