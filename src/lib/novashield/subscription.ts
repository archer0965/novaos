import { getSiteUrl, PRODUCTION_URL } from "@/lib/site";
import type { BillingCycle, PlanTier } from "./types";

/** Fixed NovaShield Pro pricing — immutable across checkout and callback verification. */
export const NOVASHIELD_PRICES: Record<BillingCycle, number> = {
  monthly: 199,
  yearly: 1990,
};

export const NOVASHIELD_DURATION_DAYS: Record<BillingCycle, number> = {
  monthly: 30,
  yearly: 365,
};

export const NOVASHIELD_BASE_PATH = "/novashield";

export function getNovaShieldPublicUrl(): string {
  return `${getSiteUrl()}${NOVASHIELD_BASE_PATH}`;
}

export const NOVASHIELD_PRODUCTION_URL = `${PRODUCTION_URL}${NOVASHIELD_BASE_PATH}`;

export function normalizeBillingCycle(raw?: string | null): BillingCycle {
  return raw === "yearly" ? "yearly" : "monthly";
}

export function getCycleLabel(cycle?: BillingCycle | null): string {
  return cycle === "yearly" ? "年繳 NT$1,990/年" : "月繳 NT$199/月";
}

export function isSubscriptionExpired(
  expiresAt?: string | null,
  now = new Date(),
): boolean {
  if (!expiresAt) return false;
  const ts = new Date(expiresAt).getTime();
  if (Number.isNaN(ts)) return false;
  return ts <= now.getTime();
}

export function resolveEffectivePlan(
  plan: PlanTier,
  planExpiresAt?: string | null,
  now = new Date(),
): { effectivePlan: PlanTier; expired: boolean } {
  if (plan !== "PRO") {
    return { effectivePlan: "FREE", expired: false };
  }
  if (planExpiresAt && isSubscriptionExpired(planExpiresAt, now)) {
    return { effectivePlan: "FREE", expired: true };
  }
  return { effectivePlan: "PRO", expired: false };
}

export function calculateNextExpiry(options: {
  cycle: BillingCycle;
  currentExpiresAt?: string | null;
  now?: Date;
}): string {
  const now = options.now ?? new Date();
  const days = NOVASHIELD_DURATION_DAYS[options.cycle];
  const currentTs = options.currentExpiresAt
    ? new Date(options.currentExpiresAt).getTime()
    : 0;
  const baseMs =
    !Number.isNaN(currentTs) && currentTs > now.getTime()
      ? currentTs
      : now.getTime();
  return new Date(baseMs + days * 24 * 60 * 60 * 1000).toISOString();
}

export function daysUntilExpiry(expiresAt: string, now = new Date()): number {
  const toTaipeiDayMs = (date: Date): number => {
    const parts = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Taipei",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).formatToParts(date);
    const get = (type: Intl.DateTimeFormatPartTypes) =>
      Number(parts.find((p) => p.type === type)?.value || "0");
    return Date.UTC(get("year"), get("month") - 1, get("day"));
  };

  const targetDate = new Date(expiresAt);
  if (Number.isNaN(targetDate.getTime())) return -1;

  const diffMs = toTaipeiDayMs(targetDate) - toTaipeiDayMs(now);
  return Math.round(diffMs / (24 * 60 * 60 * 1000));
}

export function formatExpiresAtTaipei(expiresAt?: string | null): string {
  if (!expiresAt) return "—";
  const date = new Date(expiresAt);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("zh-TW", {
    timeZone: "Asia/Taipei",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
}
