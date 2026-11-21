import {
  buildCheckoutQuote,
  resolvePricingTier,
  type PricingTierId,
} from "@/lib/pricing-tiers";
import type { NovaModuleId } from "@/lib/novaos";

export type PlanType = "free" | "starter" | "pro" | "unlimited";
/** Legacy plan ids still accepted from older rows / checkout payloads */
export type LegacyPlanType = "plus" | "premium";
export type BillingCycle = "monthly" | "half_yearly" | "yearly";
export type ReportStatus =
  | "pending"
  | "confirmed"
  | "auto_confirmed"
  | "rejected"
  | "needs_contact";

export type ContactPlatform = "ig" | "threads" | "line";

export type DiscountTier = "lifetime_special" | "ambassador";

export interface Profile {
  id: string;
  shop_name: string;
  /** Public storefront slug used in /[username]/[productId] */
  shop_slug?: string | null;
  /** Public storefront bio shown on /shop/[username] */
  shop_bio?: string | null;
  bank_code: string;
  bank_account: string;
  line_user_id: string | null;
  /**
   * Seller's own LINE Official Account Channel Access Token.
   * When set, seller notifications are pushed via this token.
   */
  line_channel_access_token?: string | null;
  /** Seller's LINE Channel Secret (optional; for future webhook verification). */
  line_channel_secret?: string | null;
  /** 啟用外部結帳連結（賣貨便／好賣+／蝦皮／其他專屬連結） */
  enable_cod?: boolean | null;
  /** 外部結帳網址 */
  cod_url?: string | null;
  /** 買家看到的選項名稱，例如：蝦皮下單、7-11 賣貨便 */
  cod_label?: string | null;
  /** 預設固定運費（新台幣） */
  shipping_fee?: number | null;
  /** 是否啟用滿額免運 */
  free_shipping_enabled?: boolean | null;
  /** 滿額免運門檻；null/0 且開啟時視為全館免運 */
  free_shipping_threshold?: number | null;
  /** Asia/Taipei YYYY-MM-DD of last daily LINE digest */
  last_daily_digest_on?: string | null;
  /** false = skip daily LINE accounting digest (e.g. test shops) */
  daily_digest_enabled?: boolean | null;
  plan_type: PlanType | LegacyPlanType | string;
  billing_cycle?: BillingCycle | null;
  trial_ends_at?: string | null;
  /** Paid plan end time (UTC ISO). null = never expires (e.g. admin). */
  expires_at?: string | null;
  /** Reminder dedupe: expires_at value when 3-day mail was sent */
  expiry_reminder_3d_for?: string | null;
  /** Reminder dedupe: expires_at value when 1-day mail was sent */
  expiry_reminder_1d_for?: string | null;
  /** Admin-approved 特約店家 (DB column kept as is_early_bird). Applies to NovaStore & 拓脈預約. */
  is_early_bird?: boolean | null;
  /** lifetime_special = 特約店家；ambassador = 推廣大使 (AI Doc) */
  discount_tier?: DiscountTier | string | null;
  /** 推廣大使（Nova AI Doc Tier 3） */
  is_ambassador?: boolean | null;
  /**
   * @deprecated Signup no longer consumes early-bird seats.
   * Per-module early bird is tracked in module_activations.
   */
  signup_early_bird?: boolean | null;
  /** NovaOS active modules (booking/store/ai_doc/pass) */
  active_modules?: string[] | null;
  /** Public referral code for 同業裂變 */
  referral_code?: string | null;
  /** Who referred this account (profiles.id) */
  referred_by?: string | null;
  /** Whether first paid checkout referral discount was used */
  referral_discount_used?: boolean | null;
  /** Accumulated NT$ credit from successful referrals */
  referral_credit_balance?: number | null;
  /** Reserved: deposit / gateway flags */
  deposit_enabled?: boolean | null;
  ecpay_merchant_id?: string | null;
  ecpay_hash_key?: string | null;
  ecpay_hash_iv?: string | null;
  line_pay_channel_id?: string | null;
  line_pay_channel_secret?: string | null;
  monthly_usage_count: number;
  usage_month: string;
  /** Last product login / session touch (訂閱管家等) */
  last_login_at?: string | null;
  created_at: string;
}

export type ProductMode = "agency" | "group_buy";
export type ProductStatus = "active" | "success" | "closed";
export type OrderPaymentStatus = "pending" | "matched";
export type OrderFulfillmentStatus = "unfulfilled" | "fulfilled";
/** atm = ATM 轉帳；myship_cod = 外部連結結帳（賣貨便／蝦皮等） */
export type OrderPaymentType = "atm" | "myship_cod";
export type ConvenienceStoreType = "711" | "family";
/** percentage: 90 = 九折；fixed: 折固定金額 */
export type CouponDiscountType = "percentage" | "fixed";
/** unlimited=不限總次數(每人手機仍限一次)；limited=全店總限量 */
export type CouponUsageType = "unlimited" | "limited";

export interface Coupon {
  id: string;
  seller_id: string;
  code: string;
  discount_type: CouponDiscountType;
  discount_value: number;
  min_spend: number | null;
  usage_type: CouponUsageType;
  /** Only used when usage_type = limited */
  usage_limit: number | null;
  usage_count: number;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
}

export interface CouponUsage {
  id: string;
  coupon_id: string;
  seller_id: string;
  phone: string;
  order_id?: string | null;
  created_at: string;
}

export interface StoreProduct {
  id: string;
  user_id: string;
  title: string;
  price: number;
  mode: ProductMode;
  /** 團購目標成團數量（件）；agency 為 null */
  target_quantity: number | null;
  /** 目前已累積訂購數量 */
  current_quantity?: number;
  /** 是否已達成團門檻（避免重複 LINE 通知） */
  is_target_reached?: boolean;
  deadline: string | null;
  status: ProductStatus;
  variant_note: string;
  /** Seller-defined color choices shown on the buyer page */
  color_options?: string[];
  /** Seller-defined size choices shown on the buyer page */
  size_options?: string[];
  image_url: string;
  /**
   * Max sellable units. null = unlimited.
   * Remaining ≈ stock - ordered_quantity.
   */
  stock?: number | null;
  /** Preorder mode badge + notice on storefront */
  is_preorder?: boolean;
  /** e.g.「預計 12/20 從日本發貨」 */
  preorder_notice?: string;
  created_at: string;
}

/** One variant line inside a multi-spec order. */
export type OrderLineItem = {
  color: string;
  size: string;
  quantity: number;
};

export interface StoreOrder {
  id: string;
  product_id: string;
  buyer_name: string;
  quantity: number;
  total_amount: number;
  atm_last5: string;
  payment_status: OrderPaymentStatus;
  /** atm | myship_cod */
  payment_type?: OrderPaymentType | string | null;
  /** unfulfilled = 未出貨, fulfilled = 已出貨 */
  fulfillment_status: OrderFulfillmentStatus;
  /** 711 | family */
  store_type?: ConvenienceStoreType | null;
  /** 門市名稱與店號 */
  store_info?: string | null;
  /** 收件手機 */
  receiver_phone?: string | null;
  /** Legacy single-variant fields (kept for older rows / quick glance) */
  selected_color?: string | null;
  selected_size?: string | null;
  /** Multi-variant line items */
  items?: OrderLineItem[] | null;
  /** Seller-facing summary of all variants */
  items_summary?: string | null;
  coupon_id?: string | null;
  coupon_code?: string | null;
  discount_amount?: number;
  /** 商品小計（折抵前） */
  subtotal_amount?: number | null;
  /** 該筆實際運費（免運為 0） */
  shipping_fee?: number | null;
  created_at: string;
}

export const STORE_TYPE_LABELS: Record<ConvenienceStoreType, string> = {
  "711": "7-11 超商取貨",
  family: "全家超商取貨",
};

export interface PaymentReport {
  id: string;
  seller_id: string;
  buyer_name: string;
  /** IG / Threads / LINE 暱稱（防失聯必填） */
  buyer_contact?: string | null;
  contact_platform?: ContactPlatform | string | null;
  /** 買家轉帳銀行（對照銀行 App） */
  transfer_bank?: string | null;
  amount: number;
  bank_last_five: string;
  note: string | null;
  status: ReportStatus;
  created_at: string;
}

export interface ShopPublic {
  id: string;
  shop_name: string;
  bank_code: string;
  bank_account: string;
}

/**
 * NovaOS plans (DB ids kept for compatibility):
 * - starter = 單模組／基礎版
 * - pro = legacy mid-tier → treated as starter in UI
 * - unlimited = NovaOS 旗艦全家桶
 */
export type PaidPlanKey = "starter" | "pro" | "unlimited";

export type CyclePrice = {
  total: number;
  avgMonthly: number;
};

export type PlanDefinition = {
  id: PlanType;
  name: string;
  /** -1 = unlimited */
  monthlyQuota: number;
  isPopular: boolean;
  popularBadge?: string;
  blurb: string;
  features: string[];
  prices: Record<BillingCycle, CyclePrice>;
  /** true = unlock all four NovaOS modules */
  isBundle?: boolean;
  listPriceMonthly?: number;
};

export type CycleDefinition = {
  id: BillingCycle;
  label: string;
  discount: number;
  badge?: string;
  months: number;
};

/**
 * 價格與方案單一來源 — 拓新雲端 NovaOS
 * plans.prices = 原價（未套用 Tier 折扣）。實際應付見 getCheckoutAmount / buildCheckoutQuote。
 */
export const PRICING_CONFIG = {
  currency: "NTD",
  freeTrial: {
    enabled: true,
    /** Default (一般資格) — actual days decided at module activation */
    durationDays: 7,
    description:
      "註冊帳號不會開始試用；啟用子模組後才倒數（早鳥／特約／大使 14 天，一般 7 天）",
  },
  /** @deprecated Use per-module early bird (module_activations, max 15 each) */
  signupEarlyBird: {
    maxUsers: 15,
    trialDays: 14,
    label: "子模組早鳥優惠",
    description: "各子模組前 15 名啟用者享 14 天試用與早鳥價",
  },
  /** Tier 3：特約店家（NovaStore & 拓脈預約連動） */
  earlyBird: {
    maxSeats: null as number | null,
    trialDays: 14,
    cycleMultipliers: {
      monthly: 0.9,
      half_yearly: 0.82,
      yearly: 0.75,
    } satisfies Record<BillingCycle, number>,
    discountTier: "lifetime_special" as const,
    label: "特約店家專屬優惠",
    applyLabel: "申請特約店家",
    pitchTitle: "誠徵特約店家",
    pitch:
      "進單、出貨穩定即可申請，私訊官方 LINE 並出示賣場連結，審核通過後即享特約優惠！",
    description:
      "審核通過後由管理員開通；啟用拓脈／NovaStore 時贈 14 天試用，續約享特約階梯折扣（月 9 折／半年 82 折／年 75 折）。",
    termsTitle: "特約店家合作條款",
    terms: [
      "申請人須能證明進單、出貨量穩定，並提供賣場連結供審核。",
      "特約優惠適用 NovaStore 與拓脈預約，兩者規則連動同步。",
      "成為特約店家後，同意於合理範圍協助推廣拓新雲端 NovaOS。",
      "長期未配合或明顯不符標準，官方得調整或取消特約資格。",
    ],
  },
  /** Tier 3：推廣大使（Nova AI Doc） */
  ambassador: {
    trialDays: 14,
    cycleMultipliers: {
      monthly: 0.9,
      half_yearly: 0.82,
      yearly: 0.75,
    } satisfies Record<BillingCycle, number>,
    discountTier: "ambassador" as const,
    label: "推廣大使專屬優惠",
    description:
      "適用 Nova AI Doc；啟用時 14 天試用，續約享月 9 折／半年 82 折／年 75 折。",
  },
  billingCycles: {
    monthly: {
      id: "monthly" as const,
      label: "月繳",
      discount: 1.0,
      months: 1,
    },
    half_yearly: {
      id: "half_yearly" as const,
      label: "半年繳",
      discount: 0.9,
      badge: "週期折扣依資格",
      months: 6,
    },
    yearly: {
      id: "yearly" as const,
      label: "年繳",
      discount: 0.85,
      badge: "週期折扣依資格",
      months: 12,
    },
  } satisfies Record<BillingCycle, CycleDefinition>,
  defaultCycle: "monthly" as BillingCycle,
  primaryPaidPlans: ["starter", "unlimited"] as const satisfies readonly PaidPlanKey[],
  plans: {
    free: {
      id: "free",
      name: "尚未訂閱",
      monthlyQuota: 5,
      isPopular: false,
      blurb: "註冊後請啟用子模組開始試用",
      features: [
        "訂閱中控永久免費；個人訂閱管理見 訂閱管家",
        "註冊不扣早鳥名額、不開始試用倒數",
        "付費模組點擊啟用後才開始試用",
      ],
      prices: {
        monthly: { total: 0, avgMonthly: 0 },
        half_yearly: { total: 0, avgMonthly: 0 },
        yearly: { total: 0, avgMonthly: 0 },
      },
    },
    starter: {
      id: "starter",
      name: "單模組／基礎版",
      monthlyQuota: 100,
      isPopular: false,
      blurb: "任選拓脈或 NovaStore，適合專注經營",
      isBundle: false,
      features: [
        "任選 1 個付費模組（拓脈預約／NovaStore）",
        "訂閱中控永久免費附贈",
        "NovaStore 訂單額度每月 100 筆",
        "依資格套用早鳥／一般／特約折扣",
        "推薦碼首月現折 $50",
        "Nova AI Doc 另有獨立方案（Pro NT$199／Business NT$499）",
      ],
      prices: {
        monthly: { total: 299, avgMonthly: 299 },
        half_yearly: { total: 1794, avgMonthly: 299 },
        yearly: { total: 3588, avgMonthly: 299 },
      },
    },
    pro: {
      id: "pro",
      name: "單模組／基礎版",
      monthlyQuota: 100,
      isPopular: false,
      blurb: "任選單一核心模組",
      isBundle: false,
      features: ["任選 1 個核心模組"],
      prices: {
        monthly: { total: 299, avgMonthly: 299 },
        half_yearly: { total: 1794, avgMonthly: 299 },
        yearly: { total: 3588, avgMonthly: 299 },
      },
    },
    unlimited: {
      id: "unlimited",
      name: "NovaOS 旗艦全家桶",
      monthlyQuota: -1,
      isPopular: true,
      popularBadge: "三模組全開",
      isBundle: true,
      blurb: "解鎖拓脈＋NovaStore＋Nova AI Doc；訂閱中控永久免費",
      features: [
        "拓脈預約 + NovaStore + Nova AI Doc 全開",
        "訂閱中控永久免費附贈",
        "NovaStore 訂單處理無上限",
        "依資格套用早鳥／一般／特約／大使折扣",
        "推薦碼首月現折 $50",
      ],
      prices: {
        monthly: { total: 499, avgMonthly: 499 },
        half_yearly: { total: 2994, avgMonthly: 499 },
        yearly: { total: 5988, avgMonthly: 499 },
      },
    },
  } satisfies Record<PlanType, PlanDefinition>,
} as const;

export const BILLING_CYCLES = PRICING_CONFIG.billingCycles;
export const FREE_TRIAL = PRICING_CONFIG.freeTrial;
export const SIGNUP_EARLY_BIRD = PRICING_CONFIG.signupEarlyBird;
export const EARLY_BIRD = PRICING_CONFIG.earlyBird;
export const AMBASSADOR = PRICING_CONFIG.ambassador;
export const PLAN_CATALOG = PRICING_CONFIG.plans;
export const PAID_PLAN_KEYS: PaidPlanKey[] = ["starter", "pro", "unlimited"];
/** Plans shown on pricing / upgrade (hide legacy pro duplicate) */
export const PRIMARY_PAID_PLAN_KEYS: PaidPlanKey[] = ["starter", "unlimited"];

export const FREE_PLAN_LIMIT = PLAN_CATALOG.free.monthlyQuota;
export const STARTER_PLAN_LIMIT = PLAN_CATALOG.starter.monthlyQuota;
export const PRO_PLAN_LIMIT = PLAN_CATALOG.pro.monthlyQuota;

/** @deprecated use STARTER_PLAN_LIMIT */
export const PLUS_PLAN_LIMIT = STARTER_PLAN_LIMIT;

export const PLAN_RANK: Record<PlanType, number> = {
  free: 0,
  starter: 1,
  pro: 1,
  unlimited: 2,
};

export function normalizeBillingCycle(
  cycle: string | null | undefined
): BillingCycle {
  if (cycle === "half_yearly" || cycle === "halfYearly") return "half_yearly";
  if (cycle === "yearly") return "yearly";
  return "monthly";
}

export function normalizePlan(
  plan: string | null | undefined
): PlanType {
  if (plan === "starter" || plan === "plus") return "starter";
  if (plan === "pro") return "pro";
  if (plan === "unlimited" || plan === "premium") return "unlimited";
  return "free";
}

export function isPaidPlan(plan: string | null | undefined): plan is PaidPlanKey {
  const p = normalizePlan(plan);
  return p === "starter" || p === "pro" || p === "unlimited";
}

export function isTrialActive(
  trialEndsAt: string | null | undefined,
  now: Date = new Date()
): boolean {
  if (!FREE_TRIAL.enabled || !trialEndsAt) return false;
  const ends = new Date(trialEndsAt);
  return !Number.isNaN(ends.getTime()) && ends.getTime() > now.getTime();
}

/** null = unlimited（含試用期間全功能／管理者） */
export function getPlanLimit(
  plan: PlanType | string | null | undefined,
  trialEndsAt?: string | null,
  options?: { isAdmin?: boolean; expiresAt?: string | null }
): number | null {
  if (options?.isAdmin) return null;
  if (isTrialActive(trialEndsAt)) return null;
  // Expired paid subscription → free quota
  if (
    isPaidPlan(plan) &&
    options?.expiresAt &&
    new Date(options.expiresAt).getTime() <= Date.now()
  ) {
    return FREE_PLAN_LIMIT;
  }
  const p = normalizePlan(plan);
  const quota = PLAN_CATALOG[p].monthlyQuota;
  return quota < 0 ? null : quota;
}

export function getPlanDisplayName(
  plan: PlanType | string | null | undefined
): string {
  return PLAN_CATALOG[normalizePlan(plan)].name;
}

export function hasLifetimeSpecialDiscount(
  discountTier?: string | null,
  isEarlyBird?: boolean | null
): boolean {
  if (discountTier === EARLY_BIRD.discountTier) return true;
  return Boolean(isEarlyBird);
}

export function hasAmbassadorDiscount(
  discountTier?: string | null,
  isAmbassador?: boolean | null
): boolean {
  if (discountTier === AMBASSADOR.discountTier) return true;
  return Boolean(isAmbassador);
}

export function getEarlyBirdMultiplier(cycle: BillingCycle): number {
  return EARLY_BIRD.cycleMultipliers[normalizeBillingCycle(cycle)];
}

/** Human-readable fold label, e.g. 0.9 →「9 折」、0.85 →「85 折」 */
export function formatDiscountFold(multiplier: number): string {
  const pct = Math.round(multiplier * 100);
  if (pct === 100) return "原價";
  if (pct % 10 === 0) return `${pct / 10} 折`;
  return `${pct} 折`;
}

/**
 * Final payable = base × tier rate − referral $50 − credit.
 * Prefer passing `pricingTier` explicitly; otherwise falls back to VIP/general.
 */
export function getCheckoutAmount(
  plan: PaidPlanKey,
  cycle: BillingCycle,
  options?: {
    discountTier?: string | null;
    isEarlyBird?: boolean | null;
    isAmbassador?: boolean | null;
    pricingTier?: PricingTierId | null;
    moduleId?: NovaModuleId | null;
    moduleIsEarlyBird?: boolean | null;
    anyModuleEarlyBird?: boolean | null;
    /** 被推薦人首次付款現折 NT$50 */
    referralFirstDiscount?: boolean | null;
    /** 推薦人續費扣抵額度（單次上限 100） */
    applyCredit?: number | null;
  }
): number {
  const normalized = normalizeBillingCycle(cycle);
  const tier: PricingTierId =
    options?.pricingTier ||
    resolvePricingTier({
      moduleId: options?.moduleId || null,
      isPartnerStore: hasLifetimeSpecialDiscount(
        options?.discountTier,
        options?.isEarlyBird
      ),
      isAmbassador: hasAmbassadorDiscount(
        options?.discountTier,
        options?.isAmbassador
      ),
      moduleIsEarlyBird: options?.moduleIsEarlyBird,
      anyModuleEarlyBird: options?.anyModuleEarlyBird,
    });
  return buildCheckoutQuote({
    plan,
    cycle: normalized,
    tier,
    referralFirstDiscount: options?.referralFirstDiscount,
    applyCredit: options?.applyCredit,
  }).finalAmount;
}

export function getCycleAvgMonthly(
  plan: PaidPlanKey,
  cycle: BillingCycle,
  options?: {
    discountTier?: string | null;
    isEarlyBird?: boolean | null;
    isAmbassador?: boolean | null;
    pricingTier?: "early_bird" | "general" | "vip" | null;
  }
): number {
  const normalized = normalizeBillingCycle(cycle);
  const months = BILLING_CYCLES[normalized].months;
  const total = getCheckoutAmount(plan, normalized, options);
  return Math.max(1, Math.round(total / months));
}

export function getCycleLabel(cycle: BillingCycle): string {
  return BILLING_CYCLES[normalizeBillingCycle(cycle)].label;
}

export function isDowngrade(from: PlanType, to: PlanType): boolean {
  return PLAN_RANK[to] < PLAN_RANK[from];
}

export function trialEndsAtFromNow(now: Date = new Date()): string {
  const d = new Date(now);
  d.setUTCDate(d.getUTCDate() + FREE_TRIAL.durationDays);
  return d.toISOString();
}

/** NovaStore：所有方案（含免費／試用）皆標配智慧自動對帳 */
export function canUseAutoReconcile(
  _plan?: PlanType | string | null,
  _trialEndsAt?: string | null,
  options?: { isAdmin?: boolean; expiresAt?: string | null }
): boolean {
  if (options?.isAdmin) return true;
  return true;
}
