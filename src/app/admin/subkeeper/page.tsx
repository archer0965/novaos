"use client";

import { ConsoleTableClient } from "@/components/master-admin/console-table-client";
import { ProductPanelHeader } from "@/components/master-admin/product-panel";
import { ADMIN_PRODUCTS } from "@/lib/master-admin/nav";

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

const product = ADMIN_PRODUCTS.find((p) => p.id === "subkeeper")!;

export default function AdminSubkeeperPage() {
  return (
    <div>
      <ProductPanelHeader
        product={product}
        title="訂閱追蹤監看"
        subtitle="個人訂閱列與到期提醒；日常新增刪改請用訂閱管家 App"
      />
      <ConsoleTableClient<Row>
        title=""
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
            header: "提醒",
            render: (r) => `${r.reminderDays} 天`,
          },
          {
            key: "active",
            header: "狀態",
            render: (r) => (r.isActive ? "啟用" : "停用"),
          },
        ]}
      />
    </div>
  );
}
