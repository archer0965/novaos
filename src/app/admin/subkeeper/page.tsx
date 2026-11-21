"use client";

import { ConsoleTableClient } from "@/components/master-admin/console-table-client";

type Row = {
  id: string;
  userId: string;
  name: string;
  amountTwd: number;
  billingCycle: string;
  nextBillingOn: string | null;
  reminderDays: number;
  isActive: boolean;
  createdAt: string;
};

export default function AdminSubkeeperPage() {
  return (
    <ConsoleTableClient<Row>
      title="訂閱管家 營運與提醒"
      subtitle="個人訂閱追蹤、週期金額與即將到期提醒（personal_subscriptions）"
      endpoint="/api/admin/console/subkeeper"
      statusOptions={[
        { value: "active", label: "啟用中" },
        { value: "inactive", label: "已停用" },
      ]}
      mapRows={(payload) => ({
        rows: (payload.rows as Row[]) || [],
        total: Number(payload.total) || 0,
        page: Number(payload.page) || 1,
        pageSize: Number(payload.pageSize) || 20,
      })}
      columns={[
        { key: "name", header: "訂閱名稱", render: (r) => r.name },
        {
          key: "amount",
          header: "金額",
          render: (r) => `NT$ ${r.amountTwd.toLocaleString("zh-TW")}`,
        },
        { key: "cycle", header: "週期", render: (r) => r.billingCycle },
        {
          key: "next",
          header: "下次扣款",
          render: (r) => r.nextBillingOn || "—",
        },
        {
          key: "reminder",
          header: "提前提醒",
          render: (r) => `${r.reminderDays} 天`,
        },
        {
          key: "active",
          header: "狀態",
          render: (r) => (r.isActive ? "啟用" : "停用"),
        },
        {
          key: "user",
          header: "用戶",
          render: (r) => (
            <span className="font-mono text-xs">{r.userId.slice(0, 8)}…</span>
          ),
        },
      ]}
    />
  );
}
