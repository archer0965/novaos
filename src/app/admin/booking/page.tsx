"use client";

import { ConsoleTableClient } from "@/components/master-admin/console-table-client";
import { ProductPanelHeader } from "@/components/master-admin/product-panel";
import { ADMIN_PRODUCTS } from "@/lib/master-admin/nav";

type Row = {
  id: string;
  customer: string;
  phone: string;
  startsAt: string;
  status: string;
  payMode: string;
  createdAt: string;
};

const product = ADMIN_PRODUCTS.find((p) => p.id === "booking")!;

export default function AdminBookingPage() {
  return (
    <div>
      <ProductPanelHeader
        product={product}
        title="預約監看"
        subtitle="Hub booking 資料表摘要；店家開通與排班請用拓脈總管理"
      />
      <ConsoleTableClient<Row>
        title=""
        endpoint="/api/admin/console/booking"
        statusOptions={[
          { value: "booked", label: "已預約" },
          { value: "completed", label: "已完工" },
          { value: "cancelled", label: "已取消" },
          { value: "no_show", label: "未到" },
        ]}
        mapRows={(payload) => {
          const appointments = (payload.appointments || {}) as {
            rows?: Row[];
            total?: number;
            page?: number;
            pageSize?: number;
          };
          return {
            rows: appointments.rows || [],
            total: appointments.total || 0,
            page: appointments.page || 1,
            pageSize: appointments.pageSize || 20,
          };
        }}
        columns={[
          { key: "customer", header: "顧客", render: (r) => r.customer },
          { key: "phone", header: "電話", render: (r) => r.phone },
          {
            key: "startsAt",
            header: "時段",
            render: (r) =>
              new Date(r.startsAt).toLocaleString("zh-TW", {
                timeZone: "Asia/Taipei",
              }),
          },
          { key: "status", header: "狀態", render: (r) => r.status },
          { key: "payMode", header: "付款", render: (r) => r.payMode },
        ]}
      />
    </div>
  );
}
