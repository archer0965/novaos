"use client";

import { ConsoleTableClient } from "@/components/master-admin/console-table-client";

type Row = {
  id: string;
  customer: string;
  phone: string;
  startsAt: string;
  status: string;
  payMode: string;
  createdAt: string;
};

export default function AdminBookingPage() {
  return (
    <ConsoleTableClient<Row>
      title="拓脈預約 排程與服務"
      subtitle="預約列表、狀態與服務項目（Hub booking_* 資料表；獨立站 taiwanbiz 另有完整營運後台）"
      endpoint="/api/admin/console/booking"
      statusOptions={[
        { value: "booked", label: "booked" },
        { value: "completed", label: "completed" },
        { value: "cancelled", label: "cancelled" },
        { value: "no_show", label: "no_show" },
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
      extra={(payload) => {
        const services = (payload.services as Array<{
          id: string;
          title: string;
          durationMinutes: number;
          price: number;
          isActive: boolean;
        }>) || [];
        if (!services.length) return null;
        return (
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <h2 className="text-sm font-semibold text-slate-200">服務項目</h2>
            <ul className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {services.slice(0, 12).map((s) => (
                <li
                  key={s.id}
                  className="rounded-xl border border-white/5 px-3 py-2 text-sm text-slate-300"
                >
                  <span className="font-medium text-slate-100">{s.title}</span>
                  <span className="mt-1 block text-xs text-slate-500">
                    {s.durationMinutes} 分 · NT$ {s.price} ·{" "}
                    {s.isActive ? "啟用" : "停用"}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        );
      }}
      columns={[
        { key: "customer", header: "顧客", render: (r) => r.customer },
        { key: "phone", header: "電話", render: (r) => r.phone },
        {
          key: "startsAt",
          header: "預約時段",
          render: (r) =>
            new Date(r.startsAt).toLocaleString("zh-TW", {
              timeZone: "Asia/Taipei",
            }),
        },
        { key: "status", header: "狀態", render: (r) => r.status },
        { key: "payMode", header: "付款", render: (r) => r.payMode },
      ]}
    />
  );
}
