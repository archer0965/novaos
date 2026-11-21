/** 拓新雲端 NovaOS — brand + module hierarchy (single source of truth). */

export const NOVA_BRAND = {
  masterName: "拓新雲端",
  masterNameEn: "NovaOS",
  displayName: "拓新雲端 NovaOS",
  shortName: "NovaOS",
  legalName: "拓新雲端 NovaOS",
  tagline: "專業雲端工具與軟體解決方案——賣場、預約、AI 文件與營運中控",
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
    name: "拓管 Nova Pass",
    nameEn: "Nova Pass",
    emoji: "⚙️",
    href: "/dashboard/pass",
    blurb: "訂閱續費、對帳管理與同業裂變推薦碼（完全免費）",
  },
};

export const NOVA_MODULE_IDS = Object.keys(NOVA_MODULES) as NovaModuleId[];

/** Paid product modules — 拓管 is free forever and never sold alone. */
export const PAID_MODULE_IDS: NovaModuleId[] = ["booking", "store", "ai_doc"];

/** Always unlocked for every registered account — no trial, no early-bird seat. */
export const FREE_MODULE_IDS: NovaModuleId[] = ["pass"];

export function isFreeModule(id: NovaModuleId | string | null | undefined): boolean {
  return id === "pass";
}

export function isPaidModule(id: NovaModuleId | string | null | undefined): id is NovaModuleId {
  return id === "booking" || id === "store" || id === "ai_doc";
}

export const REFERRAL_CONFIG = {
  /** 被推薦人首次付款現折 */
  refereeFirstDiscount: 50,
  /** 推薦人每次成功推薦獲得的扣抵額度 */
  referrerCredit: 100,
  /** 單次月費續費最多可扣抵 */
  maxCreditPerRenewal: 100,
} as const;

/** 金流模組（ECPay / LINE Pay）— UI 暫 Disabled */
export const PAYMENT_GATEWAY_STATUS = {
  enabled: false,
  label: "金流模組審核中 (Coming Soon)",
  modes: {
    deposit: false,
    ecpay: false,
    linePay: false,
    /** 現行統一結算 */
    active: "manual_transfer_or_pay_at_store" as const,
  },
  activeLabel: "免訂金（現場付）／手動轉帳對帳",
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
