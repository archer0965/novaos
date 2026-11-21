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

export type DiscountTier = "lifetime_special";

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
  plan_type: PlanType | LegacyPlanType | string;
  billing_cycle?: BillingCycle | null;
  trial_ends_at?: string | null;
  /** Paid plan end time (UTC ISO). null = never expires (e.g. admin). */
  expires_at?: string | null;
  /** Reminder dedupe: expires_at value when 3-day mail was sent */
  expiry_reminder_3d_for?: string | null;
  /** Reminder dedupe: expires_at value when 1-day mail was sent */
  expiry_reminder_1d_for?: string | null;
  /** Admin-approved 特約店家 (DB column kept as is_early_bird). */
  is_early_bird?: boolean | null;
  /** lifetime_special = permanent 特約店家 checkout discount */
  discount_tier?: DiscountTier | string | null;
  /** 註冊早鳥：前 15 名限量 14 天試用 */
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
  /** Reserved: deposit / gateway (Coming Soon) */
  deposit_enabled?: boolean | null;
  ecpay_merchant_id?: string | null;
  ecpay_hash_key?: string | null;
  ecpay_hash_iv?: string | null;
  line_pay_channel_id?: string | null;
  line_pay_channel_secret?: string | null;
  monthly_usage_count: number;
  usage_month: string;
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

/** 價格與方案單一來源 — 拓新雲端 NovaOS */
export const PRICING_CONFIG = {
  currency: "NTD",
  freeTrial: {
    enabled: true,
    durationDays: 7,
    description: "新註冊享有 7 天 NovaOS 全模組免費試用",
  },
  signupEarlyBird: {
    maxUsers: 15,
    trialDays: 14,
    label: "早鳥優惠",
    description: "限量前 15 名用戶享 14 天免費試用",
  },
  earlyBird: {
    maxSeats: null as number | null,
    trialDays: 14,
    cycleMultipliers: {
      monthly: 0.8,
      half_yearly: 0.75,
      yearly: 0.7,
    } satisfies Record<BillingCycle, number>,
    discountTier: "lifetime_special" as const,
    label: "特約店家專屬優惠",
    applyLabel: "申請特約店家",
    pitchTitle: "誠徵特約店家",
    pitch:
      "進單、出貨穩定即可申請，私訊官方 LINE 並出示賣場連結，審核通過後即享特約優惠！",
    description:
      "審核通過後由管理員開通；贈 14 天全功能試用，之後每次續約終身享週期折扣。",
    termsTitle: "特約店家合作條款",
    terms: [
      "申請人須能證明進單、出貨量穩定，並提供賣場連結供審核。",
      "成為特約店家後，同意於合理範圍協助推廣拓新雲端 NovaOS。",
      "長期未配合或明顯不符標準，官方得調整或取消特約資格。",
      "特約費率僅適用維持特約資格之帳號；資格異動以官方通知為準。",
    ],
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
      badge: "省 10%",
      months: 6,
    },
    yearly: {
      id: "yearly" as const,
      label: "年繳（送 2 個月）",
      discount: 10 / 12,
      badge: "買 10 送 2",
      months: 12,
    },
  } satisfies Record<BillingCycle, CycleDefinition>,
  defaultCycle: "monthly" as BillingCycle,
  /** Primary paid plans shown in marketing / upgrade UI */
  primaryPaidPlans: ["starter", "unlimited"] as const satisfies readonly PaidPlanKey[],
  plans: {
    free: {
      id: "free",
      name: "免費體驗版",
      monthlyQuota: 5,
      isPopular: false,
      blurb: "先體驗 NovaOS 核心流程",
      features: [
        "每月最高 5 筆 NovaStore 訂單",
        "試用期間可體驗四大模組",
        "手動轉帳對帳",
        "現場付／免訂金預約",
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
      blurb: "任選單一核心模組，適合專注經營",
      isBundle: false,
      features: [
        "任選 1 個核心模組（拓脈／NovaStore／AI Doc／拓管）",
        "NovaStore 訂單額度每月 100 筆",
        "手動轉帳對帳與現場付預約",
        "同業推薦碼（被推薦現折 $50）",
      ],
      prices: {
        monthly: { total: 299, avgMonthly: 299 },
        half_yearly: { total: 1615, avgMonthly: 269 },
        yearly: { total: 2990, avgMonthly: 249 },
      },
    },
    /** Legacy mid-tier — kept for old rows; priced as 基礎版 */
    pro: {
      id: "pro",
      name: "單模組／基礎版",
      monthlyQuota: 100,
      isPopular: false,
      blurb: "任選單一核心模組",
      isBundle: false,
      features: [
        "任選 1 個核心模組",
        "NovaStore 訂單額度每月 100 筆",
        "手動轉帳對帳與現場付預約",
      ],
      prices: {
        monthly: { total: 299, avgMonthly: 299 },
        half_yearly: { total: 1615, avgMonthly: 269 },
        yearly: { total: 2990, avgMonthly: 249 },
      },
    },
    unlimited: {
      id: "unlimited",
      name: "NovaOS 旗艦全家桶",
      monthlyQuota: -1,
      isPopular: true,
      popularBadge: "原 $599 特惠中",
      listPriceMonthly: 599,
      isBundle: true,
      blurb: "解鎖全套四核心模組，一次到位",
      features: [
        "拓脈預約 + NovaStore + Nova AI Doc + 拓管",
        "NovaStore 訂單處理無上限",
        "同業裂變推薦碼與續費扣抵",
        "手動轉帳對帳／現場付（金流審核中）",
      ],
      prices: {
        monthly: { total: 499, avgMonthly: 499 },
        half_yearly: { total: 2695, avgMonthly: 449 },
        yearly: { total: 4990, avgMonthly: 415 },
      },
    },
  } satisfies Record<PlanType, PlanDefinition>,
} as const;

export const BILLING_CYCLES = PRICING_CONFIG.billingCycles;
export const FREE_TRIAL = PRICING_CONFIG.freeTrial;
export const SIGNUP_EARLY_BIRD = PRICING_CONFIG.signupEarlyBird;
export const EARLY_BIRD = PRICING_CONFIG.earlyBird;
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

export function getEarlyBirdMultiplier(cycle: BillingCycle): number {
  return EARLY_BIRD.cycleMultipliers[normalizeBillingCycle(cycle)];
}

/** Human-readable fold label, e.g. 0.8 →「8 折」、0.75 →「75 折」 */
export function formatDiscountFold(multiplier: number): string {
  const pct = Math.round(multiplier * 100);
  if (pct % 10 === 0) return `${pct / 10} 折`;
  return `${pct} 折`;
}

export function getCheckoutAmount(
  plan: PaidPlanKey,
  cycle: BillingCycle,
  options?: {
    discountTier?: string | null;
    isEarlyBird?: boolean | null;
    /** 被推薦人首次付款現折 NT$50 */
    referralFirstDiscount?: boolean | null;
    /** 推薦人續費扣抵額度（單次上限 100） */
    applyCredit?: number | null;
  }
): number {
  const normalized = normalizeBillingCycle(cycle);
  let amount = PLAN_CATALOG[plan].prices[normalized].total;
  if (
    hasLifetimeSpecialDiscount(options?.discountTier, options?.isEarlyBird)
  ) {
    amount = Math.max(1, Math.round(amount * getEarlyBirdMultiplier(normalized)));
  }
  if (options?.referralFirstDiscount) {
    amount = Math.max(1, amount - 50);
  }
  const credit = Math.max(0, Math.min(100, Math.floor(Number(options?.applyCredit) || 0)));
  if (credit > 0) {
    amount = Math.max(1, amount - credit);
  }
  return amount;
}

export function getCycleAvgMonthly(
  plan: PaidPlanKey,
  cycle: BillingCycle,
  options?: {
    discountTier?: string | null;
    isEarlyBird?: boolean | null;
  }
): number {
  const normalized = normalizeBillingCycle(cycle);
  const base = PLAN_CATALOG[plan].prices[normalized].avgMonthly;
  if (
    hasLifetimeSpecialDiscount(options?.discountTier, options?.isEarlyBird)
  ) {
    return Math.max(1, Math.round(base * getEarlyBirdMultiplier(normalized)));
  }
  return base;
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
