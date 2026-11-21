import { createAdminClient } from "@/lib/supabase/admin";
import {
  loadEmailMapSafe,
  isExcludedFromStats,
} from "@/lib/master-admin/stats-helpers";
import {
  parseListParams,
  toIsoRange,
  type ListParams,
} from "@/lib/master-admin/list-params";

export type PagedResult<T> = {
  rows: T[];
  total: number;
  page: number;
  pageSize: number;
};

function emptyPage<T>(params: ListParams): PagedResult<T> {
  return { rows: [], total: 0, page: params.page, pageSize: params.pageSize };
}

export async function listNovastore(url: URL): Promise<
  PagedResult<{
    id: string;
    kind: "order" | "report";
    buyer: string;
    amount: number;
    lastFive: string;
    status: string;
    createdAt: string;
  }>
> {
  const params = parseListParams(url);
  const { fromIso, toIso } = toIsoRange(params.from, params.to);
  const admin = createAdminClient();
  const offset = (params.page - 1) * params.pageSize;

  try {
    // Prefer payment_reports for 對帳; also surface pending orders
    let query = admin
      .from("payment_reports")
      .select(
        "id, buyer_name, amount, bank_last_five, status, created_at",
        { count: "exact" }
      )
      .order("created_at", { ascending: false })
      .range(offset, offset + params.pageSize - 1);

    if (params.status) query = query.eq("status", params.status);
    if (fromIso) query = query.gte("created_at", fromIso);
    if (toIso) query = query.lte("created_at", toIso);
    if (params.q) {
      query = query.or(
        `buyer_name.ilike.%${params.q}%,bank_last_five.ilike.%${params.q}%`
      );
    }

    const { data, count, error } = await query;
    if (error) throw error;

    return {
      rows: (data || []).map((r) => ({
        id: r.id,
        kind: "report" as const,
        buyer: r.buyer_name,
        amount: Number(r.amount) || 0,
        lastFive: r.bank_last_five,
        status: r.status,
        createdAt: r.created_at,
      })),
      total: count ?? 0,
      page: params.page,
      pageSize: params.pageSize,
    };
  } catch {
    return emptyPage(params);
  }
}

export async function listBooking(url: URL): Promise<
  PagedResult<{
    id: string;
    customer: string;
    phone: string;
    startsAt: string;
    status: string;
    payMode: string;
    createdAt: string;
  }>
> {
  const params = parseListParams(url);
  const { fromIso, toIso } = toIsoRange(params.from, params.to);
  const admin = createAdminClient();
  const offset = (params.page - 1) * params.pageSize;

  try {
    let query = admin
      .from("booking_appointments")
      .select(
        "id, customer_name, customer_phone, starts_at, status, pay_mode, created_at",
        { count: "exact" }
      )
      .order("starts_at", { ascending: false })
      .range(offset, offset + params.pageSize - 1);

    if (params.status) query = query.eq("status", params.status);
    if (fromIso) query = query.gte("starts_at", fromIso);
    if (toIso) query = query.lte("starts_at", toIso);
    if (params.q) {
      query = query.or(
        `customer_name.ilike.%${params.q}%,customer_phone.ilike.%${params.q}%`
      );
    }

    const { data, count, error } = await query;
    if (error) throw error;

    return {
      rows: (data || []).map((r) => ({
        id: r.id,
        customer: r.customer_name,
        phone: r.customer_phone,
        startsAt: r.starts_at,
        status: r.status,
        payMode: r.pay_mode,
        createdAt: r.created_at,
      })),
      total: count ?? 0,
      page: params.page,
      pageSize: params.pageSize,
    };
  } catch {
    return emptyPage(params);
  }
}

export async function listBookingServices(): Promise<
  Array<{
    id: string;
    title: string;
    durationMinutes: number;
    price: number;
    isActive: boolean;
    sellerId: string;
  }>
> {
  try {
    const admin = createAdminClient();
    const { data } = await admin
      .from("booking_services")
      .select("id, title, duration_minutes, price, is_active, seller_id")
      .order("created_at", { ascending: false })
      .limit(100);
    return (data || []).map((r) => ({
      id: r.id,
      title: r.title,
      durationMinutes: r.duration_minutes,
      price: r.price,
      isActive: r.is_active,
      sellerId: r.seller_id,
    }));
  } catch {
    return [];
  }
}

export async function listAiDoc(url: URL): Promise<
  PagedResult<{
    id: string;
    title: string;
    docType: string;
    sellerId: string;
    createdAt: string;
    updatedAt: string;
  }> & { ranking: Array<{ sellerId: string; count: number }> }
> {
  const params = parseListParams(url);
  const { fromIso, toIso } = toIsoRange(params.from, params.to);
  const admin = createAdminClient();
  const offset = (params.page - 1) * params.pageSize;
  let ranking: Array<{ sellerId: string; count: number }> = [];

  try {
    const { data: all } = await admin
      .from("ai_doc_drafts")
      .select("seller_id");
    const map = new Map<string, number>();
    for (const r of all || []) {
      map.set(r.seller_id, (map.get(r.seller_id) || 0) + 1);
    }
    ranking = Array.from(map.entries())
      .map(([sellerId, count]) => ({ sellerId, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    let query = admin
      .from("ai_doc_drafts")
      .select("id, title, doc_type, seller_id, created_at, updated_at", {
        count: "exact",
      })
      .order("updated_at", { ascending: false })
      .range(offset, offset + params.pageSize - 1);

    if (fromIso) query = query.gte("created_at", fromIso);
    if (toIso) query = query.lte("created_at", toIso);
    if (params.q) {
      query = query.or(
        `title.ilike.%${params.q}%,doc_type.ilike.%${params.q}%`
      );
    }

    const { data, count, error } = await query;
    if (error) throw error;

    return {
      rows: (data || []).map((r) => ({
        id: r.id,
        title: r.title,
        docType: r.doc_type,
        sellerId: r.seller_id,
        createdAt: r.created_at,
        updatedAt: r.updated_at,
      })),
      total: count ?? 0,
      page: params.page,
      pageSize: params.pageSize,
      ranking,
    };
  } catch {
    return { ...emptyPage(params), ranking };
  }
}

export async function listSubkeeper(url: URL): Promise<
  PagedResult<{
    id: string;
    userId: string;
    name: string;
    amountTwd: number;
    billingCycle: string;
    nextBillingOn: string | null;
    reminderDays: number;
    isActive: boolean;
    createdAt: string;
  }>
> {
  const params = parseListParams(url);
  const admin = createAdminClient();
  const offset = (params.page - 1) * params.pageSize;

  try {
    let query = admin
      .from("personal_subscriptions")
      .select(
        "id, user_id, name, amount_twd, billing_cycle, next_billing_on, reminder_days, is_active, created_at",
        { count: "exact" }
      )
      .order("created_at", { ascending: false })
      .range(offset, offset + params.pageSize - 1);

    if (params.status === "active") query = query.eq("is_active", true);
    if (params.status === "inactive") query = query.eq("is_active", false);
    if (params.q) query = query.ilike("name", `%${params.q}%`);

    const { data, count, error } = await query;
    if (error) throw error;

    return {
      rows: (data || []).map((r) => ({
        id: r.id,
        userId: r.user_id,
        name: r.name,
        amountTwd: r.amount_twd,
        billingCycle: r.billing_cycle,
        nextBillingOn: r.next_billing_on,
        reminderDays: r.reminder_days,
        isActive: r.is_active,
        createdAt: r.created_at,
      })),
      total: count ?? 0,
      page: params.page,
      pageSize: params.pageSize,
    };
  } catch {
    return emptyPage(params);
  }
}

export async function listUsers(url: URL): Promise<
  PagedResult<{
    id: string;
    email: string | null;
    shopName: string;
    planType: string;
    billingCycle: string;
    modules: string[];
    createdAt: string;
    excluded: boolean;
  }>
> {
  const params = parseListParams(url);
  const admin = createAdminClient();

  try {
    const { data, error } = await admin
      .from("profiles")
      .select(
        "id, shop_name, plan_type, billing_cycle, active_modules, created_at"
      )
      .order("created_at", { ascending: false })
      .limit(500);
    if (error) throw error;

    const rows = data || [];
    const emailMap = await loadEmailMapSafe(rows.map((r) => r.id));
    let mapped = rows.map((r) => ({
      id: r.id,
      email: emailMap.get(r.id) ?? null,
      shopName: r.shop_name || "",
      planType: r.plan_type,
      billingCycle: r.billing_cycle,
      modules: Array.isArray(r.active_modules) ? r.active_modules : [],
      createdAt: r.created_at,
      excluded: isExcludedFromStats(emailMap.get(r.id)),
    }));

    if (params.q) {
      const q = params.q.toLowerCase();
      mapped = mapped.filter(
        (r) =>
          r.email?.toLowerCase().includes(q) ||
          r.shopName.toLowerCase().includes(q) ||
          r.id.includes(q)
      );
    }
    if (params.status === "paid") {
      mapped = mapped.filter((r) => r.planType !== "free");
    } else if (params.status === "free") {
      mapped = mapped.filter((r) => r.planType === "free");
    }

    const total = mapped.length;
    const offset = (params.page - 1) * params.pageSize;
    return {
      rows: mapped.slice(offset, offset + params.pageSize),
      total,
      page: params.page,
      pageSize: params.pageSize,
    };
  } catch {
    return emptyPage(params);
  }
}
