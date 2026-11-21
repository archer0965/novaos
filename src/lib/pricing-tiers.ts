/**
 * NovaOS tiered subscription pricing (single source of truth).
 * Final amount = base(cycle) × tierRate − referral $50 (if any).
 * Prefer explicit tier totals so UI matches product sheet.
 */

import type { NovaModuleId } from "@/lib/novaos";

/** Local aliases to avoid circular import with types/database */
export type TierBillingCycle = "monthly" | "half_yearly" | "yearly";
export type TierPaidPlanKey = "starter" | "pro" | "unlimited";

export type PricingTierId = "early_bird" | "general" | "vip";

export const SUBSCRIPTION_BASE_PRICES = {
  starter: {
    monthly: 299,
    half_yearly: 1794,
    yearly: 3588,
  },
  unlimited: {
    monthly: 499,
    half_yearly: 2994,
    yearly: 5988,
  },
} as const;

/** Legacy `pro` priced as starter */
export function basePlanKey(plan: TierPaidPlanKey): "starter" | "unlimited" {
  return plan === "unlimited" ? "unlimited" : "starter";
}

export const TIER_META: Record<
  PricingTierId,
  {
    id: PricingTierId;
    label: string;
    trialDays: number;
    multipliers: Record<TierBillingCycle, number>;
    foldLabels: Record<TierBillingCycle, string>;
  }
> = {
  early_bird: {
    id: "early_bird",
    label: "早鳥優惠（前 15 名啟用）",
    trialDays: 14,
    multipliers: { monthly: 0.9, half_yearly: 0.85, yearly: 0.8 },
    foldLabels: { monthly: "9 折", half_yearly: "85 折", yearly: "8 折" },
  },
  general: {
    id: "general",
    label: "一般資格",
    trialDays: 7,
    multipliers: { monthly: 1.0, half_yearly: 0.9, yearly: 0.85 },
    foldLabels: { monthly: "原價", half_yearly: "9 折", yearly: "85 折" },
  },
  vip: {
    id: "vip",
    label: "特約店家／推廣大使",
    trialDays: 14,
    multipliers: { monthly: 0.9, half_yearly: 0.82, yearly: 0.75 },
    foldLabels: { monthly: "9 折", half_yearly: "82 折", yearly: "75 折" },
  },
};

/** Exact totals from product sheet (avoid float drift). */
export const TIER_CHECKOUT_TOTALS: Record<
  PricingTierId,
  Record<"starter" | "unlimited", Record<TierBillingCycle, number>>
> = {
  early_bird: {
    starter: { monthly: 269, half_yearly: 1524, yearly: 2870 },
    unlimited: { monthly: 449, half_yearly: 2544, yearly: 4790 },
  },
  general: {
    starter: { monthly: 299, half_yearly: 1614, yearly: 3049 },
    unlimited: { monthly: 499, half_yearly: 2694, yearly: 5089 },
  },
  vip: {
    starter: { monthly: 269, half_yearly: 1471, yearly: 2691 },
    unlimited: { monthly: 449, half_yearly: 2455, yearly: 4491 },
  },
};

export const MODULE_EARLY_BIRD_MAX = 15;

export type CheckoutQuote = {
  plan: TierPaidPlanKey;
  cycle: TierBillingCycle;
  tier: PricingTierId;
  tierLabel: string;
  foldLabel: string;
  multiplier: number;
  baseAmount: number;
  tierAmount: number;
  referralDiscount: number;
  creditApplied: number;
  savingsVsBase: number;
  finalAmount: number;
};

export function getBaseAmount(
  plan: TierPaidPlanKey,
  cycle: TierBillingCycle
): number {
  const key = basePlanKey(plan);
  return SUBSCRIPTION_BASE_PRICES[key][cycle];
}

export function getTierAmount(
  plan: TierPaidPlanKey,
  cycle: TierBillingCycle,
  tier: PricingTierId
): number {
  const key = basePlanKey(plan);
  return TIER_CHECKOUT_TOTALS[tier][key][cycle];
}

export function buildCheckoutQuote(options: {
  plan: TierPaidPlanKey;
  cycle: TierBillingCycle;
  tier: PricingTierId;
  referralFirstDiscount?: boolean | null;
  applyCredit?: number | null;
}): CheckoutQuote {
  const { plan, cycle, tier } = options;
  const meta = TIER_META[tier];
  const baseAmount = getBaseAmount(plan, cycle);
  const tierAmount = getTierAmount(plan, cycle, tier);
  const referralDiscount = options.referralFirstDiscount ? 50 : 0;
  const creditApplied = Math.max(
    0,
    Math.min(100, Math.floor(Number(options.applyCredit) || 0))
  );
  const finalAmount = Math.max(1, tierAmount - referralDiscount - creditApplied);
  return {
    plan,
    cycle,
    tier,
    tierLabel: meta.label,
    foldLabel: meta.foldLabels[cycle],
    multiplier: meta.multipliers[cycle],
    baseAmount,
    tierAmount,
    referralDiscount,
    creditApplied,
    savingsVsBase: Math.max(0, baseAmount - finalAmount),
    finalAmount,
  };
}

/**
 * Resolve pricing tier for a checkout / display context.
 * VIP (特約／大使) beats module early-bird beats general.
 */
export function resolvePricingTier(options: {
  moduleId?: NovaModuleId | null;
  /** 特約店家 — NovaStore & 拓脈預約 */
  isPartnerStore?: boolean | null;
  /** 推廣大使 — Nova AI Doc */
  isAmbassador?: boolean | null;
  /** Whether this seller's activation for the module is early-bird */
  moduleIsEarlyBird?: boolean | null;
  /** Any activated module early-bird (for bundle checkout) */
  anyModuleEarlyBird?: boolean | null;
}): PricingTierId {
  const mod = options.moduleId || null;
  const partner = Boolean(options.isPartnerStore);
  const ambassador = Boolean(options.isAmbassador);

  if (mod === "booking" || mod === "store") {
    if (partner) return "vip";
  } else if (mod === "ai_doc") {
    if (ambassador) return "vip";
  } else if (mod === "pass") {
    // Pass follows partner/ambassador if either VIP identity exists
    if (partner || ambassador) return "vip";
  } else {
    // Bundle / unspecified: VIP if either special identity
    if (partner || ambassador) return "vip";
  }

  if (mod) {
    if (options.moduleIsEarlyBird) return "early_bird";
  } else if (options.anyModuleEarlyBird) {
    return "early_bird";
  }

  return "general";
}

/** Modules that share 特約店家優惠 */
export const PARTNER_STORE_MODULES: NovaModuleId[] = ["booking", "store"];

/** Module that uses 推廣大使優惠 */
export const AMBASSADOR_MODULE: NovaModuleId = "ai_doc";
