"use client";

import { ConsoleTableClient } from "@/components/master-admin/console-table-client";
import { SectionTitle } from "@/components/master-admin/kpi-grid";

type Row = {
  id: string;
  email: string | null;
  shopName: string;
  planType: string;
  billingCycle: string;
  modules: string[];
  createdAt: string;
  excluded: boolean;
};

export default function AdminUsersPage() {
  return (
    <div>
      <SectionTitle
        title="會員"
        subtitle="跨站統一帳號、方案與模組（平台級，不屬於單一產品）"
      />
      <ConsoleTableClient<Row>
        title=""
        endpoint="/api/admin/console/users"
        statusOptions={[
          { value: "paid", label: "付費方案" },
          { value: "free", label: "免費方案" },
        ]}
        mapRows={(payload) => ({
          rows: (payload.rows as Row[]) || [],
          total: Number(payload.total) || 0,
          page: Number(payload.page) || 1,
          pageSize: Number(payload.pageSize) || 20,
        })}
        columns={[
          {
            key: "email",
            header: "Email",
            render: (r) => r.email || "—",
          },
          {
            key: "shop",
            header: "顯示名",
            render: (r) => r.shopName || "—",
          },
          { key: "plan", header: "方案", render: (r) => r.planType },
          { key: "cycle", header: "週期", render: (r) => r.billingCycle },
          {
            key: "modules",
            header: "模組",
            render: (r) => r.modules.join(", ") || "—",
          },
          {
            key: "created",
            header: "註冊",
            render: (r) =>
              new Date(r.createdAt).toLocaleString("zh-TW", {
                timeZone: "Asia/Taipei",
              }),
          },
        ]}
      />
    </div>
  );
}
