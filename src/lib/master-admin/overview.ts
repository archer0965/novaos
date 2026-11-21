import { createAdminClient } from "@/lib/supabase/admin";
import {
  isExcludedFromStats,
  loadEmailMapSafe,
} from "@/lib/master-admin/stats-helpers";

export type OverviewKpis = {
  totalUsers: number;
  newUsersThisMonth: number;
  novastore: {
    gmvThisMonth: number;
    matchedOrdersThisMonth: number;
    pendingReports: number;
  };
  booking: {
    appointmentsThisMonth: number;
    completedThisMonth: number;
    completionRate: number;
  };
  aidoc: {
    draftsToday: number;
    draftsThisMonth: number;
    activeAuthors: number;
  };
  subkeeper: {
    totalActiveSubscriptions: number;
    monthlyTrackedAmount: number;
    dueSoonCount: number;
  };
  asOf: string;
};

export type ActivityItem = {
  id: string;
  type: "signup" | "order" | "report" | "booking" | "aidoc" | "subkeeper";
  title: string;
  detail: string;
  at: string;
  site: string;
};

export type ActivitySeriesPoint = {
  label: string;
  signups: number;
  orders: number;
  bookings: number;
  docs: number;
};

function monthStartIso(): string {
  const now = new Date();
  const y = now.getUTCFullYear();
  const m = String(now.getUTCMonth() + 1).padStart(2, "0");
  return `${y}-${m}-01T00:00:00.000Z`;
}

function todayStartIso(): string {
  const now = new Date();
  const ymd = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Taipei",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
  // Approximate Taipei midnight as UTC+8
  return new Date(`${ymd}T00:00:00+08:00`).toISOString();
}

function taipeiYmd(d: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Taipei",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);
}

async function safeCount(
  run: () => PromiseLike<{ count: number | null; error: unknown }>
): Promise<number> {
  try {
    const { count, error } = await run();
    if (error) return 0;
    return count ?? 0;
  } catch {
    return 0;
  }
}

export async function buildOverviewKpis(): Promise<OverviewKpis> {
  const admin = createAdminClient();
  const monthStart = monthStartIso();
  const dayStart = todayStartIso();

  const { data: profiles } = await admin
    .from("profiles")
    .select("id, created_at");
  const rows = profiles || [];
  const emailMap = await loadEmailMapSafe(rows.map((r) => r.id));
  const counted = rows.filter((r) => !isExcludedFromStats(emailMap.get(r.id)));
  const totalUsers = counted.length;
  const newUsersThisMonth = counted.filter(
    (r) => r.created_at && r.created_at >= monthStart
  ).length;

  // NovaStore: orders GMV + payment_reports
  let gmv = 0;
  let matchedOrders = 0;
  try {
    const { data: orders } = await admin
      .from("orders")
      .select("total_amount, payment_status, created_at")
      .gte("created_at", monthStart);
    for (const o of orders || []) {
      if (o.payment_status === "matched") {
        matchedOrders += 1;
        gmv += Number(o.total_amount) || 0;
      }
    }
  } catch {
    /* table may be empty / unavailable */
  }

  const pendingReports = await safeCount(() =>
    admin
      .from("payment_reports")
      .select("*", { count: "exact", head: true })
      .in("status", ["pending", "needs_contact"])
  );

  // Booking
  let appointmentsThisMonth = 0;
  let completedThisMonth = 0;
  try {
    const { data: appts } = await admin
      .from("booking_appointments")
      .select("status, created_at")
      .gte("created_at", monthStart);
    appointmentsThisMonth = (appts || []).length;
    completedThisMonth = (appts || []).filter(
      (a) => a.status === "completed"
    ).length;
  } catch {
    /* ignore */
  }
  const completionRate =
    appointmentsThisMonth > 0
      ? Math.round((completedThisMonth / appointmentsThisMonth) * 100)
      : 0;

  // AI Doc
  const draftsToday = await safeCount(() =>
    admin
      .from("ai_doc_drafts")
      .select("*", { count: "exact", head: true })
      .gte("created_at", dayStart)
  );
  const draftsThisMonth = await safeCount(() =>
    admin
      .from("ai_doc_drafts")
      .select("*", { count: "exact", head: true })
      .gte("created_at", monthStart)
  );
  let activeAuthors = 0;
  try {
    const { data: docs } = await admin
      .from("ai_doc_drafts")
      .select("seller_id")
      .gte("created_at", monthStart);
    activeAuthors = new Set((docs || []).map((d) => d.seller_id)).size;
  } catch {
    /* ignore */
  }

  // SubKeeper
  let totalActiveSubscriptions = 0;
  let monthlyTrackedAmount = 0;
  let dueSoonCount = 0;
  try {
    const { data: subs } = await admin
      .from("personal_subscriptions")
      .select("amount_twd, billing_cycle, next_billing_on, is_active");
    const active = (subs || []).filter((s) => s.is_active);
    totalActiveSubscriptions = active.length;
    const soon = new Date();
    soon.setDate(soon.getDate() + 7);
    const soonYmd = soon.toISOString().slice(0, 10);
    for (const s of active) {
      const amount = Number(s.amount_twd) || 0;
      if (s.billing_cycle === "yearly") monthlyTrackedAmount += amount / 12;
      else if (s.billing_cycle === "weekly") monthlyTrackedAmount += amount * 4;
      else monthlyTrackedAmount += amount;
      if (s.next_billing_on && s.next_billing_on <= soonYmd) dueSoonCount += 1;
    }
  } catch {
    /* ignore */
  }

  return {
    totalUsers,
    newUsersThisMonth,
    novastore: {
      gmvThisMonth: Math.round(gmv),
      matchedOrdersThisMonth: matchedOrders,
      pendingReports,
    },
    booking: {
      appointmentsThisMonth,
      completedThisMonth,
      completionRate,
    },
    aidoc: {
      draftsToday,
      draftsThisMonth,
      activeAuthors,
    },
    subkeeper: {
      totalActiveSubscriptions,
      monthlyTrackedAmount: Math.round(monthlyTrackedAmount),
      dueSoonCount,
    },
    asOf: new Date().toISOString(),
  };
}

export async function buildActivityStream(
  limit = 40
): Promise<ActivityItem[]> {
  const admin = createAdminClient();
  const items: ActivityItem[] = [];

  try {
    const { data } = await admin
      .from("profiles")
      .select("id, shop_name, created_at")
      .order("created_at", { ascending: false })
      .limit(15);
    for (const row of data || []) {
      items.push({
        id: `signup-${row.id}`,
        type: "signup",
        title: "新會員註冊",
        detail: row.shop_name || row.id.slice(0, 8),
        at: row.created_at,
        site: "hub",
      });
    }
  } catch {
    /* ignore */
  }

  try {
    const { data } = await admin
      .from("orders")
      .select("id, buyer_name, total_amount, payment_status, created_at")
      .order("created_at", { ascending: false })
      .limit(15);
    for (const row of data || []) {
      items.push({
        id: `order-${row.id}`,
        type: "order",
        title: "賣場下單",
        detail: `${row.buyer_name} · NT$ ${Number(row.total_amount).toLocaleString("zh-TW")} · ${row.payment_status}`,
        at: row.created_at,
        site: "novastore",
      });
    }
  } catch {
    /* ignore */
  }

  try {
    const { data } = await admin
      .from("payment_reports")
      .select("id, buyer_name, amount, bank_last_five, status, created_at")
      .order("created_at", { ascending: false })
      .limit(10);
    for (const row of data || []) {
      items.push({
        id: `report-${row.id}`,
        type: "report",
        title: "對帳回報",
        detail: `${row.buyer_name} · 末五碼 ${row.bank_last_five} · ${row.status}`,
        at: row.created_at,
        site: "novastore",
      });
    }
  } catch {
    /* ignore */
  }

  try {
    const { data } = await admin
      .from("booking_appointments")
      .select("id, customer_name, status, starts_at, created_at")
      .order("created_at", { ascending: false })
      .limit(15);
    for (const row of data || []) {
      items.push({
        id: `booking-${row.id}`,
        type: "booking",
        title: "預約建立",
        detail: `${row.customer_name} · ${row.status} · ${String(row.starts_at).slice(0, 16)}`,
        at: row.created_at,
        site: "booking",
      });
    }
  } catch {
    /* ignore */
  }

  try {
    const { data } = await admin
      .from("ai_doc_drafts")
      .select("id, title, doc_type, created_at")
      .order("created_at", { ascending: false })
      .limit(10);
    for (const row of data || []) {
      items.push({
        id: `doc-${row.id}`,
        type: "aidoc",
        title: "文件上傳／草稿",
        detail: `${row.title} · ${row.doc_type}`,
        at: row.created_at,
        site: "aidoc",
      });
    }
  } catch {
    /* ignore */
  }

  try {
    const { data } = await admin
      .from("personal_subscriptions")
      .select("id, name, amount_twd, created_at")
      .order("created_at", { ascending: false })
      .limit(10);
    for (const row of data || []) {
      items.push({
        id: `sub-${row.id}`,
        type: "subkeeper",
        title: "訂閱追蹤新增",
        detail: `${row.name} · NT$ ${row.amount_twd}`,
        at: row.created_at,
        site: "subkeeper",
      });
    }
  } catch {
    /* ignore */
  }

  return items
    .filter((i) => i.at)
    .sort((a, b) => Date.parse(b.at) - Date.parse(a.at))
    .slice(0, limit);
}

/** Last 14 Taipei days multi-series activity for charts. */
export async function buildActivitySeries(): Promise<ActivitySeriesPoint[]> {
  const admin = createAdminClient();
  const days: ActivitySeriesPoint[] = [];
  const now = new Date();
  for (let i = 13; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 86400000);
    days.push({
      label: taipeiYmd(d).slice(5),
      signups: 0,
      orders: 0,
      bookings: 0,
      docs: 0,
    });
  }
  const index = new Map(days.map((d, i) => [d.label, i]));
  const since = new Date(now.getTime() - 14 * 86400000).toISOString();

  const bump = (iso: string | null | undefined, key: keyof ActivitySeriesPoint) => {
    if (!iso || key === "label") return;
    const label = taipeiYmd(new Date(iso)).slice(5);
    const idx = index.get(label);
    if (idx === undefined) return;
    const point = days[idx];
    if (typeof point[key] === "number") {
      (point[key] as number) += 1;
    }
  };

  try {
    const { data } = await admin
      .from("profiles")
      .select("created_at")
      .gte("created_at", since);
    for (const r of data || []) bump(r.created_at, "signups");
  } catch {
    /* ignore */
  }
  try {
    const { data } = await admin
      .from("orders")
      .select("created_at")
      .gte("created_at", since);
    for (const r of data || []) bump(r.created_at, "orders");
  } catch {
    /* ignore */
  }
  try {
    const { data } = await admin
      .from("booking_appointments")
      .select("created_at")
      .gte("created_at", since);
    for (const r of data || []) bump(r.created_at, "bookings");
  } catch {
    /* ignore */
  }
  try {
    const { data } = await admin
      .from("ai_doc_drafts")
      .select("created_at")
      .gte("created_at", since);
    for (const r of data || []) bump(r.created_at, "docs");
  } catch {
    /* ignore */
  }

  return days;
}
