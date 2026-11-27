/** 拓新雲端 NovaOS — brand + module hierarchy (single source of truth). */

export const NOVA_BRAND = {
  masterName: "拓新雲端",
  masterNameEn: "NovaOS",
  displayName: "拓新雲端 NovaOS",
  shortName: "NovaOS",
  legalName: "拓新雲端 NovaOS",
  tagline: "專為新創與社群商家打造的智慧雲端工具矩陣",
  domain: "paycheck.com.de",
} as const;

export type NovaModuleId = "booking" | "store" | "ai_doc" | "pass";

export type NovaModuleDef = {
  id: NovaModuleId;
  name: string;
  nameEn: string;
  emoji: string;
  href: string;
  blurb: string;
};

export const NOVA_MODULES: Record<NovaModuleId, NovaModuleDef> = {
  booking: {
    id: "booking",
    name: "拓脈預約",
    nameEn: "Nova Booking",
    emoji: "📅",
    href: "/dashboard/booking",
    blurb: "美業專屬 10 秒極速預約、防撞期與離峰折扣",
  },
  store: {
    id: "store",
    name: "NovaStore",
    nameEn: "NovaStore",
    emoji: "💰",
    href: "/dashboard/store",
    blurb: "銀行轉帳自動對帳、IG/LINE 賣場與訂單管理",
  },
  ai_doc: {
    id: "ai_doc",
    name: "Nova AI Doc",
    nameEn: "Nova AI Doc",
    emoji: "📄",
    href: "/dashboard/ai-doc",
    blurb: "美業合約／免責聲明生成、報表解析與問答",
  },
  pass: {
    id: "pass",
    name: "訂閱中控",
    nameEn: "Billing Hub",
    emoji: "⚙️",
    href: "/dashboard/pass",
    blurb: "方案升級、付款與推薦碼中控（帳號中心；個人訂閱開銷請用訂閱管家）",
  },
};

/**
 * 已停止提供的模組：不在前台導覽、方案選項與可啟用清單中顯示。
 * 既有付款回調與資料列保留，避免影響已成立的交易紀錄。
 */
export const RETIRED_MODULE_IDS: readonly NovaModuleId[] = ["ai_doc"];

export function isRetiredModule(id: NovaModuleId | string | null | undefined): boolean {
  return RETIRED_MODULE_IDS.includes(id as NovaModuleId);
}

export const NOVA_MODULE_IDS = (Object.keys(NOVA_MODULES) as NovaModuleId[]).filter(
  (id) => !isRetiredModule(id)
);

/** Paid product modules — billing hub (pass) is free forever and never sold alone. */
export const PAID_MODULE_IDS: NovaModuleId[] = ["booking", "store"];

/** Always unlocked for every registered account — no trial, no early-bird seat. */
export const FREE_MODULE_IDS: NovaModuleId[] = ["pass"];

export function isFreeModule(id: NovaModuleId | string | null | undefined): boolean {
  return id === "pass";
}

export function isPaidModule(id: NovaModuleId | string | null | undefined): id is NovaModuleId {
  return id === "booking" || id === "store";
}

export const REFERRAL_CONFIG = {
  /** 被推薦人首次付款現折 */
  refereeFirstDiscount: 50,
  /** 推薦人每次成功推薦獲得的扣抵額度 */
  referrerCredit: 100,
  /** 單次月費續費最多可扣抵 */
  maxCreditPerRenewal: 100,
} as const;

/** 金流模組 — 訂閱升級統一走綠界 ECPay */
export const PAYMENT_GATEWAY_STATUS = {
  enabled: true,
  label: "綠界 ECPay 線上付款",
  modes: {
    deposit: false,
    ecpay: true,
    linePay: false,
    active: "ecpay" as const,
  },
  activeLabel: "綠界 ECPay 線上付款（升級／續費即時結帳）",
} as const;

export function isNovaModuleId(value: string | null | undefined): value is NovaModuleId {
  return Boolean(value && value in NOVA_MODULES);
}

export function normalizeModules(
  raw: unknown,
  options?: { bundle?: boolean; fallback?: NovaModuleId[] }
): NovaModuleId[] {
  if (options?.bundle) {
    // Bundle unlocks all paid modules; Pass is always free on top
    return Array.from(new Set<NovaModuleId>([...PAID_MODULE_IDS, ...FREE_MODULE_IDS]));
  }
  if (!Array.isArray(raw)) return options?.fallback ? [...options.fallback] : ["store"];
  const ids = raw.filter(
    (v): v is NovaModuleId =>
      typeof v === "string" && isNovaModuleId(v) && !isFreeModule(v)
  );
  return ids.length ? Array.from(new Set(ids)) : options?.fallback ? [...options.fallback] : ["store"];
}

export function hasModuleAccess(
  modules: NovaModuleId[] | null | undefined,
  moduleId: NovaModuleId,
  options?: { isAdmin?: boolean; isBundle?: boolean; trial?: boolean }
): boolean {
  if (isFreeModule(moduleId)) return true;
  if (options?.isAdmin || options?.isBundle || options?.trial) return true;
  return (modules || []).includes(moduleId);
}

export function generateReferralCode(seed: string): string {
  const cleaned = seed.replace(/[^a-zA-Z0-9]/g, "").toUpperCase().slice(0, 4);
  const suffix = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `NV${cleaned || "OS"}${suffix}`.slice(0, 12);
}
