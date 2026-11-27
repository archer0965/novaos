import { DEFAULT_RATING_CATEGORIES, getInitialShopConfig } from "./mockData";
import { resolveEffectivePlan } from "./subscription";
import type { BillingCycle, PlanTier, ShopConfig } from "./types";

export function normalizeShopConfig(
  shopId: string,
  partial?: Partial<ShopConfig>,
): ShopConfig {
  const base = getInitialShopConfig(shopId);
  if (!partial) {
    const { effectivePlan, expired } = resolveEffectivePlan(
      base.plan,
      base.planExpiresAt,
    );
    return {
      ...base,
      plan: effectivePlan,
      subscriptionExpired: expired,
    };
  }

  const rawCategories = Array.isArray(partial.ratingCategories)
    ? partial.ratingCategories
        .map((c) => (typeof c === "string" ? c.trim().slice(0, 30) : ""))
        .filter(Boolean)
        .slice(0, 8)
    : base.ratingCategories;

  const rawPlan: PlanTier =
    partial.plan === "FREE" || partial.plan === "PRO" ? partial.plan : base.plan;

  const planExpiresAt =
    partial.planExpiresAt !== undefined
      ? partial.planExpiresAt
      : (base.planExpiresAt ?? null);

  const { effectivePlan, expired } = resolveEffectivePlan(
    rawPlan,
    planExpiresAt,
  );

  const billingCycle: BillingCycle | null =
    partial.billingCycle === "monthly" || partial.billingCycle === "yearly"
      ? partial.billingCycle
      : (base.billingCycle ?? null);

  const thresholdRaw =
    typeof partial.thresholdStar === "number"
      ? Math.round(partial.thresholdStar)
      : base.thresholdStar;

  return {
    ...base,
    ...partial,
    shopId,
    shopName:
      typeof partial.shopName === "string" && partial.shopName.trim()
        ? partial.shopName.trim().slice(0, 80)
        : base.shopName,
    plan: effectivePlan,
    billingCycle,
    planExpiresAt,
    subscriptionExpired: expired,
    thresholdStar: Math.max(2, Math.min(5, thresholdRaw)),
    ratingCategories:
      rawCategories.length > 0 ? rawCategories : [...DEFAULT_RATING_CATEGORIES],
    logoUrl: partial.logoUrl ?? base.logoUrl ?? "",
    brandColor: partial.brandColor || base.brandColor || "#F59E0B",
    lineId: partial.lineId ?? base.lineId,
    emailNotification: partial.emailNotification ?? base.emailNotification,
    emailFormEndpoint: partial.emailFormEndpoint ?? base.emailFormEndpoint ?? "",
    ratingMode:
      effectivePlan === "FREE"
        ? "single"
        : partial.ratingMode === "single" || partial.ratingMode === "multi"
          ? partial.ratingMode
          : "multi",
  };
}
