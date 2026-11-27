import { createAdminClient } from "@/lib/supabase/admin";
import { createFallbackShopConfig, getInitialShopConfig } from "./mockData";
import { normalizeShopConfig } from "./shopNormalize";
import { calculateNextExpiry } from "./subscription";
import type { BillingCycle, PlanTier, ShopConfig } from "./types";

const RESERVED_DEMO_SHOP_IDS = new Set(["shop123", "shop-free", "bistro88"]);

interface NovaShieldShopRow {
  shop_id: string;
  owner_id: string | null;
  config: Partial<ShopConfig> | null;
  plan: string | null;
  billing_cycle: string | null;
  plan_expires_at: string | null;
  reminder_3d_for: string | null;
}

export class NovaShieldDbUnavailableError extends Error {
  constructor(message = "NOVASHIELD_DB_UNAVAILABLE") {
    super(message);
    this.name = "NovaShieldDbUnavailableError";
  }
}

export class NovaShieldForbiddenError extends Error {
  constructor(message = "您沒有編輯此門市的權限。") {
    super(message);
    this.name = "NovaShieldForbiddenError";
  }
}

export function isSupabaseAdminConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.SUPABASE_SERVICE_ROLE_KEY,
  );
}

function getAdmin() {
  if (!isSupabaseAdminConfigured()) {
    throw new NovaShieldDbUnavailableError("SUPABASE_NOT_CONFIGURED");
  }
  return createAdminClient();
}

function rowToShopConfig(row: NovaShieldShopRow): ShopConfig {
  const cfg = row.config ?? {};
  const dbPlan: PlanTier =
    row.plan === "PRO" || cfg.plan === "PRO" ? "PRO" : "FREE";
  const dbCycle: BillingCycle | null =
    row.billing_cycle === "yearly" || row.billing_cycle === "monthly"
      ? row.billing_cycle
      : cfg.billingCycle === "yearly" || cfg.billingCycle === "monthly"
        ? cfg.billingCycle
        : null;

  return normalizeShopConfig(row.shop_id, {
    ...cfg,
    shopId: row.shop_id,
    plan: dbPlan,
    billingCycle: dbCycle,
    planExpiresAt: row.plan_expires_at ?? cfg.planExpiresAt ?? null,
    reminder3dSentFor: row.reminder_3d_for ?? null,
  });
}

function checkTableMissing(error: { code?: string; message?: string } | null) {
  if (!error) return;
  if (
    error.code === "42P01" ||
    error.code === "PGRST205" ||
    error.message?.includes("novashield_shops")
  ) {
    throw new NovaShieldDbUnavailableError("NOVASHIELD_TABLE_NOT_MIGRATED");
  }
  throw new Error(error.message || "Supabase query failed");
}

export async function listNovaShieldShopsForUser(options: {
  userId: string;
  isPlatformAdmin: boolean;
}): Promise<Record<string, ShopConfig>> {
  const admin = getAdmin();
  let query = admin
    .from("novashield_shops")
    .select(
      "shop_id, owner_id, config, plan, billing_cycle, plan_expires_at, reminder_3d_for",
    );

  if (!options.isPlatformAdmin) {
    query = query.eq("owner_id", options.userId);
  }

  const { data, error } = await query;
  checkTableMissing(error);

  const result: Record<string, ShopConfig> = {};
  for (const row of (data || []) as NovaShieldShopRow[]) {
    result[row.shop_id] = rowToShopConfig(row);
  }
  return result;
}

async function getNovaShieldShopRow(
  shopId: string,
): Promise<NovaShieldShopRow | null> {
  const admin = getAdmin();
  const { data, error } = await admin
    .from("novashield_shops")
    .select(
      "shop_id, owner_id, config, plan, billing_cycle, plan_expires_at, reminder_3d_for",
    )
    .eq("shop_id", shopId)
    .maybeSingle();

  checkTableMissing(error);
  return (data as NovaShieldShopRow | null) ?? null;
}

export async function getNovaShieldShop(
  shopId: string,
): Promise<ShopConfig | null> {
  const row = await getNovaShieldShopRow(shopId);
  if (!row) return null;
  return rowToShopConfig(row);
}

/**
 * Updates editable merchant settings for an authenticated NovaOS user.
 * Enforces:
 * 1. Shop ownership (owner_id === userId, or platform admin)
 * 2. Reserved demo IDs cannot be hijacked by regular users
 * 3. Server-owned subscription fields (plan, billing_cycle, plan_expires_at) cannot be spoofed
 */
export async function upsertNovaShieldShopSettingsForUser(
  shopId: string,
  incoming: Partial<ShopConfig>,
  actor: {
    userId: string;
    userEmail?: string | null;
    isPlatformAdmin: boolean;
  },
): Promise<ShopConfig> {
  const admin = getAdmin();
  const existingRow = await getNovaShieldShopRow(shopId);

  if (existingRow) {
    const isOwner = existingRow.owner_id === actor.userId;
    if (!isOwner && !actor.isPlatformAdmin) {
      throw new NovaShieldForbiddenError(
        "此門市代碼屬於其他帳號或系統示範用，請使用您自己的專屬門市代碼。",
      );
    }
  } else if (RESERVED_DEMO_SHOP_IDS.has(shopId) && !actor.isPlatformAdmin) {
    throw new NovaShieldForbiddenError(
      "此門市代碼為系統保留示範代碼，請改用您的專屬門市代碼（例如您的店名英文代稱）。",
    );
  }

  // Multi-Store Manager gating:
  // FREE accounts may only manage 1 store; PRO accounts may create multiple branches
  // and new branches automatically inherit the master account's active PRO entitlement.
  let inheritedPro: {
    billingCycle: BillingCycle | null;
    planExpiresAt: string | null;
  } | null = null;

  if (!existingRow && !actor.isPlatformAdmin) {
    const ownedShops = await listNovaShieldShopsForUser({
      userId: actor.userId,
      isPlatformAdmin: false,
    });
    const ownedList = Object.values(ownedShops);
    const activeProShop = ownedList.find((s) => s.plan === "PRO");

    if (activeProShop) {
      inheritedPro = {
        billingCycle: activeProShop.billingCycle ?? "monthly",
        planExpiresAt: activeProShop.planExpiresAt ?? null,
      };
    } else if (ownedList.length >= 1) {
      throw new NovaShieldForbiddenError(
        "免費版僅能管理單一門市，請升級專業版 ($199/月) 解鎖多門市管理與客訴處理紀錄系統。",
      );
    }
  }

  const existingConfig = existingRow ? rowToShopConfig(existingRow) : null;
  const base =
    existingConfig ??
    (actor.isPlatformAdmin
      ? getInitialShopConfig(shopId)
      : {
          ...createFallbackShopConfig(shopId),
          plan: inheritedPro ? ("PRO" as PlanTier) : ("FREE" as PlanTier),
          billingCycle: inheritedPro?.billingCycle ?? null,
          planExpiresAt: inheritedPro?.planExpiresAt ?? null,
          ratingMode: inheritedPro ? ("multi" as const) : ("single" as const),
          emailNotification: actor.userEmail?.trim() || "",
        });

  const nextOwnerId = existingRow?.owner_id ?? actor.userId;

  // Check if owner has an active NovaOS bundle that includes Nova商譽寶 PRO
  let inheritedProExpiresAt: string | null = null;
  let inheritedBillingCycle: BillingCycle | null = null;
  if (!existingRow) {
    try {
      const { data: prof } = await admin
        .from("profiles")
        .select("plan_type, billing_cycle, expires_at, active_modules")
        .eq("id", actor.userId)
        .maybeSingle();
      const mods = Array.isArray(prof?.active_modules)
        ? (prof!.active_modules as string[])
        : [];
      const activeBundle =
        mods.includes("novashield") &&
        prof?.plan_type &&
        prof.plan_type !== "free" &&
        (!prof.expires_at ||
          new Date(prof.expires_at).getTime() > Date.now());
      if (activeBundle) {
        inheritedProExpiresAt = prof?.expires_at ?? null;
        inheritedBillingCycle =
          prof?.billing_cycle === "yearly" ? "yearly" : "monthly";
      }
    } catch {
      /* ignore */
    }
  }

  const merged = normalizeShopConfig(shopId, {
    ...base,
    ...incoming,
    shopId,
    plan: inheritedProExpiresAt ? "PRO" : base.plan,
    billingCycle: inheritedProExpiresAt
      ? inheritedBillingCycle
      : (base.billingCycle ?? null),
    planExpiresAt: inheritedProExpiresAt ?? base.planExpiresAt ?? null,
    reminder3dSentFor: base.reminder3dSentFor ?? null,
    ratingMode: inheritedProExpiresAt ? "multi" : base.ratingMode,
  });

  const { error } = await admin.from("novashield_shops").upsert(
    {
      shop_id: shopId,
      owner_id: nextOwnerId,
      config: merged,
      plan: merged.plan,
      billing_cycle: merged.billingCycle ?? null,
      plan_expires_at: merged.planExpiresAt ?? null,
      reminder_3d_for: merged.reminder3dSentFor ?? null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "shop_id" },
  );

  checkTableMissing(error);
  return merged;
}

export async function claimNovaShieldEcpayTrade(params: {
  merchantTradeNo: string;
  shopId: string;
  billingCycle: BillingCycle;
  amount: number;
  rtnCode: string;
}): Promise<boolean> {
  const admin = getAdmin();
  const { error } = await admin.from("novashield_processed_trades").insert({
    merchant_trade_no: params.merchantTradeNo,
    shop_id: params.shopId,
    billing_cycle: params.billingCycle,
    amount: params.amount,
    rtn_code: params.rtnCode,
  });

  if (error) {
    if (error.code === "23505") {
      return false;
    }
    checkTableMissing(error);
  }
  return true;
}

export async function releaseNovaShieldEcpayTradeClaim(
  merchantTradeNo: string,
): Promise<void> {
  const admin = getAdmin();
  await admin
    .from("novashield_processed_trades")
    .delete()
    .eq("merchant_trade_no", merchantTradeNo);
}

export async function activateNovaShieldProSubscription(params: {
  shopId: string;
  cycle: BillingCycle;
}): Promise<ShopConfig> {
  const admin = getAdmin();
  const existingRow = await getNovaShieldShopRow(params.shopId);
  const base = existingRow
    ? rowToShopConfig(existingRow)
    : getInitialShopConfig(params.shopId);

  const nextExpiresAt = calculateNextExpiry({
    cycle: params.cycle,
    currentExpiresAt: base.planExpiresAt,
  });

  const upgraded = normalizeShopConfig(params.shopId, {
    ...base,
    shopId: params.shopId,
    plan: "PRO",
    billingCycle: params.cycle,
    planExpiresAt: nextExpiresAt,
    reminder3dSentFor: null,
    ratingMode: "multi",
  });

  const { error } = await admin.from("novashield_shops").upsert(
    {
      shop_id: params.shopId,
      owner_id: existingRow?.owner_id ?? null,
      config: upgraded,
      plan: "PRO",
      billing_cycle: params.cycle,
      plan_expires_at: nextExpiresAt,
      reminder_3d_for: null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "shop_id" },
  );

  checkTableMissing(error);
  return upgraded;
}

/**
 * Hub bundle callback: unlock Nova商譽寶 PRO for all shops owned by this NovaOS user.
 * If the user has no shop yet, create their starter shop as PRO so /novashield/admin
 * opens directly with PRO unlocked.
 */
export async function activateNovaShieldProForOwner(params: {
  userId: string;
  userEmail?: string | null;
  shopName?: string | null;
  expiresAt: string;
  cycle: BillingCycle;
}): Promise<{ updatedCount: number; shopIds: string[] }> {
  const admin = getAdmin();
  const { data: rows, error } = await admin
    .from("novashield_shops")
    .select(
      "shop_id, owner_id, config, plan, billing_cycle, plan_expires_at, reminder_3d_for",
    )
    .eq("owner_id", params.userId);

  if (error) {
    if (error.code === "42P01" || error.code === "PGRST205") {
      return { updatedCount: 0, shopIds: [] };
    }
    throw error;
  }

  const owned = (rows || []) as NovaShieldShopRow[];
  const targetMs = new Date(params.expiresAt).getTime();

  if (owned.length === 0) {
    const tag = params.userId.replace(/[^a-zA-Z0-9]/g, "").slice(0, 6).toLowerCase();
    const shopId = `shop-${tag || "mine"}`;
    const base = createFallbackShopConfig(shopId);
    const upgraded = normalizeShopConfig(shopId, {
      ...base,
      shopId,
      shopName: params.shopName?.trim() || "我的門市",
      emailNotification: params.userEmail?.trim() || "",
      plan: "PRO",
      billingCycle: params.cycle,
      planExpiresAt: params.expiresAt,
      reminder3dSentFor: null,
      ratingMode: "multi",
    });
    const { error: upsertErr } = await admin.from("novashield_shops").upsert(
      {
        shop_id: shopId,
        owner_id: params.userId,
        config: upgraded,
        plan: "PRO",
        billing_cycle: params.cycle,
        plan_expires_at: params.expiresAt,
        reminder_3d_for: null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "shop_id" },
    );
    checkTableMissing(upsertErr);
    return { updatedCount: 1, shopIds: [shopId] };
  }

  const shopIds: string[] = [];
  for (const row of owned) {
    const base = rowToShopConfig(row);
    const existingMs = row.plan_expires_at
      ? new Date(row.plan_expires_at).getTime()
      : 0;
    const finalExpiresAt =
      !Number.isNaN(existingMs) && !Number.isNaN(targetMs) && existingMs > targetMs
        ? row.plan_expires_at!
        : params.expiresAt;
    const upgraded = normalizeShopConfig(row.shop_id, {
      ...base,
      shopId: row.shop_id,
      plan: "PRO",
      billingCycle: params.cycle,
      planExpiresAt: finalExpiresAt,
      reminder3dSentFor: null,
      ratingMode: "multi",
    });
    const { error: updateErr } = await admin
      .from("novashield_shops")
      .update({
        config: upgraded,
        plan: "PRO",
        billing_cycle: params.cycle,
        plan_expires_at: finalExpiresAt,
        reminder_3d_for: null,
        updated_at: new Date().toISOString(),
      })
      .eq("shop_id", row.shop_id);
    checkTableMissing(updateErr);
    shopIds.push(row.shop_id);
  }
  return { updatedCount: shopIds.length, shopIds };
}

export interface ExpiringNovaShieldShop {
  shopId: string;
  shopName: string;
  emailNotification: string;
  billingCycle: BillingCycle | null;
  planExpiresAt: string;
  reminder3dSentFor: string | null;
}

export async function listExpiringNovaShieldProShops(
  now = new Date(),
): Promise<ExpiringNovaShieldShop[]> {
  const admin = getAdmin();
  const inFourDays = new Date(now.getTime() + 4 * 24 * 60 * 60 * 1000);

  const { data, error } = await admin
    .from("novashield_shops")
    .select(
      "shop_id, owner_id, config, plan, billing_cycle, plan_expires_at, reminder_3d_for",
    )
    .eq("plan", "PRO")
    .not("plan_expires_at", "is", null)
    .gt("plan_expires_at", now.toISOString())
    .lte("plan_expires_at", inFourDays.toISOString());

  if (error) {
    if (error.code === "42P01" || error.code === "PGRST205") {
      return [];
    }
    throw error;
  }

  return ((data || []) as NovaShieldShopRow[])
    .map((row) => rowToShopConfig(row))
    .filter(
      (shop) =>
        Boolean(shop.planExpiresAt && shop.emailNotification) &&
        shop.reminder3dSentFor !== shop.planExpiresAt,
    )
    .map((shop) => ({
      shopId: shop.shopId,
      shopName: shop.shopName,
      emailNotification: shop.emailNotification,
      billingCycle: shop.billingCycle ?? "monthly",
      planExpiresAt: shop.planExpiresAt!,
      reminder3dSentFor: shop.reminder3dSentFor ?? null,
    }));
}

export async function markNovaShieldReminderSent(
  shopId: string,
  expectedExpiresAt: string,
): Promise<void> {
  const admin = getAdmin();
  await admin
    .from("novashield_shops")
    .update({
      reminder_3d_for: expectedExpiresAt,
      updated_at: new Date().toISOString(),
    })
    .eq("shop_id", shopId)
    .eq("plan_expires_at", expectedExpiresAt);
}

/** Persists updated AI quota usage into novashield_shops.config JSONB (best-effort). */
export async function saveNovaShieldShopAiQuota(
  shopId: string,
  aiQuota: NonNullable<ShopConfig["aiQuota"]>,
): Promise<void> {
  const admin = getAdmin();
  const existingRow = await getNovaShieldShopRow(shopId);
  if (!existingRow) return;
  const currentConfig = rowToShopConfig(existingRow);
  const nextConfig: ShopConfig = {
    ...currentConfig,
    aiQuota,
  };
  await admin
    .from("novashield_shops")
    .update({
      config: nextConfig,
      updated_at: new Date().toISOString(),
    })
    .eq("shop_id", shopId);
}

/** Master admin: downgrade a shop back to FREE and clear expiry. */
export async function setNovaShieldShopFree(shopId: string): Promise<ShopConfig> {
  const admin = getAdmin();
  const existingRow = await getNovaShieldShopRow(shopId);
  const base = existingRow
    ? rowToShopConfig(existingRow)
    : getInitialShopConfig(shopId);

  const downgraded = normalizeShopConfig(shopId, {
    ...base,
    shopId,
    plan: "FREE",
    billingCycle: null,
    planExpiresAt: null,
    reminder3dSentFor: null,
    ratingMode: "single",
  });

  const { error } = await admin.from("novashield_shops").upsert(
    {
      shop_id: shopId,
      owner_id: existingRow?.owner_id ?? null,
      config: downgraded,
      plan: "FREE",
      billing_cycle: null,
      plan_expires_at: null,
      reminder_3d_for: null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "shop_id" },
  );

  checkTableMissing(error);
  return downgraded;
}

/** Master admin: remove a shop record (does not delete historical ECPay trades). */
export async function deleteNovaShieldShop(shopId: string): Promise<void> {
  const admin = getAdmin();
  const { error } = await admin
    .from("novashield_shops")
    .delete()
    .eq("shop_id", shopId);
  checkTableMissing(error);
}
