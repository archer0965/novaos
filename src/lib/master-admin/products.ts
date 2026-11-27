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

export type AdminNovaShieldShopRow = {
  id: string;
  shopId: string;
  shopName: string;
  emailNotification: string;
  lineId: string;
  plan: "FREE" | "PRO";
  effectivePlan: "FREE" | "PRO";
  expired: boolean;
  billingCycle: string | null;
  planExpiresAt: string | null;
  updatedAt: string;
};

export type AdminNovaShieldTradeRow = {
  merchantTradeNo: string;
  shopId: string;
  billingCycle: string;
  amount: number;
  rtnCode: string;
  processedAt: string;
};

export async function listNovaShield(url: URL): Promise<
  PagedResult<AdminNovaShieldShopRow> & {
    migrated: boolean;
    summary: {
      totalShops: number;
      activeProShops: number;
      expiringSoon: number;
      revenueThisMonth: number;
      totalRevenue: number;
    };
    trades: AdminNovaShieldTradeRow[];
  }
> {
  const params = parseListParams(url);
  const admin = createAdminClient();
  const now = new Date();
  const in7DaysMs = now.getTime() + 7 * 24 * 60 * 60 * 1000;
  const monthStartIso = `${now.getUTCFullYear()}-${String(
    now.getUTCMonth() + 1
  ).padStart(2, "0")}-01T00:00:00.000Z`;

  try {
    const [{ data: shopsData, error: shopsErr }, { data: tradesData }] =
      await Promise.all([
        admin
          .from("novashield_shops")
          .select(
            "shop_id, config, plan, billing_cycle, plan_expires_at, updated_at"
          )
          .order("updated_at", { ascending: false })
          .limit(500),
        admin
          .from("novashield_processed_trades")
          .select(
            "merchant_trade_no, shop_id, billing_cycle, amount, rtn_code, processed_at"
          )
          .order("processed_at", { ascending: false })
          .limit(50),
      ]);

    if (shopsErr) {
      if (
        shopsErr.code === "42P01" ||
        shopsErr.code === "PGRST205" ||
        shopsErr.message?.includes("novashield_shops")
      ) {
        return {
          ...emptyPage<AdminNovaShieldShopRow>(params),
          migrated: false,
          summary: {
            totalShops: 0,
            activeProShops: 0,
            expiringSoon: 0,
            revenueThisMonth: 0,
            totalRevenue: 0,
          },
          trades: [],
        };
      }
      throw shopsErr;
    }

    const allShops: AdminNovaShieldShopRow[] = (shopsData || []).map((row) => {
      const cfg = (row.config || {}) as Record<string, unknown>;
      const rawPlan = row.plan === "PRO" ? "PRO" : "FREE";
      const expiresTs = row.plan_expires_at
        ? new Date(row.plan_expires_at).getTime()
        : NaN;
      const expired =
        rawPlan === "PRO" &&
        !Number.isNaN(expiresTs) &&
        expiresTs <= now.getTime();
      const effectivePlan = rawPlan === "PRO" && !expired ? "PRO" : "FREE";
      return {
        id: row.shop_id,
        shopId: row.shop_id,
        shopName: String(cfg.shopName || row.shop_id),
        emailNotification: String(cfg.emailNotification || ""),
        lineId: String(cfg.lineId || ""),
        plan: rawPlan,
        effectivePlan,
        expired,
        billingCycle: row.billing_cycle || null,
        planExpiresAt: row.plan_expires_at || null,
        updatedAt: row.updated_at || now.toISOString(),
      };
    });

    const activeProShops = allShops.filter((s) => s.effectivePlan === "PRO").length;
    const expiringSoon = allShops.filter((s) => {
      if (s.effectivePlan !== "PRO" || !s.planExpiresAt) return false;
      const ts = new Date(s.planExpiresAt).getTime();
      return !Number.isNaN(ts) && ts > now.getTime() && ts <= in7DaysMs;
    }).length;

    const trades: AdminNovaShieldTradeRow[] = (tradesData || []).map((t) => ({
      merchantTradeNo: t.merchant_trade_no,
      shopId: t.shop_id,
      billingCycle: t.billing_cycle,
      amount: Number(t.amount) || 0,
      rtnCode: t.rtn_code,
      processedAt: t.processed_at,
    }));

    const totalRevenue = trades
      .filter((t) => t.rtnCode === "1")
      .reduce((acc, t) => acc + t.amount, 0);
    const revenueThisMonth = trades
      .filter((t) => t.rtnCode === "1" && t.processedAt >= monthStartIso)
      .reduce((acc, t) => acc + t.amount, 0);

    let filtered = allShops;
    if (params.q) {
      const q = params.q.toLowerCase();
      filtered = filtered.filter(
        (s) =>
          s.shopId.toLowerCase().includes(q) ||
          s.shopName.toLowerCase().includes(q) ||
          s.emailNotification.toLowerCase().includes(q) ||
          s.lineId.toLowerCase().includes(q)
      );
    }
    if (params.status === "pro") {
      filtered = filtered.filter((s) => s.effectivePlan === "PRO");
    } else if (params.status === "free") {
      filtered = filtered.filter((s) => s.effectivePlan === "FREE");
    } else if (params.status === "expiring") {
      filtered = filtered.filter((s) => {
        if (s.effectivePlan !== "PRO" || !s.planExpiresAt) return false;
        const ts = new Date(s.planExpiresAt).getTime();
        return !Number.isNaN(ts) && ts > now.getTime() && ts <= in7DaysMs;
      });
    } else if (params.status === "expired") {
      filtered = filtered.filter((s) => s.expired);
    }

    const total = filtered.length;
    const offset = (params.page - 1) * params.pageSize;
    return {
      migrated: true,
      summary: {
        totalShops: allShops.length,
        activeProShops,
        expiringSoon,
        revenueThisMonth,
        totalRevenue,
      },
      rows: filtered.slice(offset, offset + params.pageSize),
      total,
      page: params.page,
      pageSize: params.pageSize,
      trades,
    };
  } catch {
    return {
      ...emptyPage<AdminNovaShieldShopRow>(params),
      migrated: false,
      summary: {
        totalShops: 0,
        activeProShops: 0,
        expiringSoon: 0,
        revenueThisMonth: 0,
        totalRevenue: 0,
      },
      trades: [],
    };
  }
}
