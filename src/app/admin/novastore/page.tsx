"use client";

import { ConsoleTableClient } from "@/components/master-admin/console-table-client";
import { ProductPanelHeader } from "@/components/master-admin/product-panel";
import { ADMIN_PRODUCTS } from "@/lib/master-admin/nav";

type Row = {
  id: string;
  kind: string;
  buyer: string;
  amount: number;
  lastFive: string;
  status: string;
  createdAt: string;
};

const product = ADMIN_PRODUCTS.find((p) => p.id === "novastore")!;

export default function AdminNovaStorePage() {
  return (
    <div>
      <ProductPanelHeader
        product={product}
        title="對帳監看"
        subtitle="Hub 共用資料層的待對帳／已確認訂單"
      />
      <ConsoleTableClient<Row>
        title=""
        endpoint="/api/admin/console/novastore"
        statusOptions={[
          { value: "pending", label: "待核對" },
          { value: "confirmed", label: "已確認" },
          { value: "auto_confirmed", label: "自動確認" },
          { value: "rejected", label: "已駁回" },
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
    </div>
  );
}
