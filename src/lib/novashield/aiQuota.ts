import type { PlanTier } from "./types";

/** Monthly AI analysis quotas (reset on the 1st of each Asia/Taipei month; no rollover). */
export const AI_MONTHLY_LIMITS: Record<PlanTier, number> = {
  FREE: 5,
  PRO: 20,
};

/** One-time top-up pack ($49 / 30 uses; never resets monthly). */
export const AI_TOPUP_PACK = {
  priceTwd: 49,
  credits: 30,
  label: "$49 加購 30 次",
} as const;

export interface AiQuotaState {
  /** YYYY-MM in Asia/Taipei */
  monthKey: string;
  /** Number of monthly credits used during monthKey */
  monthlyUsed: number;
  /** Persistent top-up credits remaining (never expires at month rollover) */
  topupRemaining: number;
  /**
   * Reserved fields for future NovaOS 拓新雲端 ECPay / account ledger binding:
   * When real top-up checkout is wired, populate from verified ECPay trade callback.
   */
  lastTopupOrderId?: string | null;
  lastTopupAt?: string | null;
  novaosBillingAccountId?: string | null;
}

export interface AiQuotaSnapshot {
  plan: PlanTier;
  monthKey: string;
  monthlyLimit: number;
  monthlyUsed: number;
  monthlyRemaining: number;
  topupRemaining: number;
  totalRemaining: number;
  deductedFrom?: "monthly" | "topup";
}

export function getTaipeiMonthKey(now = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Taipei",
    year: "numeric",
    month: "2-digit",
  }).formatToParts(now);
  const year = parts.find((p) => p.type === "year")?.value || "2026";
  const month = parts.find((p) => p.type === "month")?.value || "01";
  return `${year}-${month}`;
}

export function getMonthlyAiLimit(plan: PlanTier): number {
  return AI_MONTHLY_LIMITS[plan] ?? AI_MONTHLY_LIMITS.FREE;
}

export function normalizeAiQuotaState(
  raw?: Partial<AiQuotaState> | null,
  now = new Date(),
): AiQuotaState {
  const currentMonth = getTaipeiMonthKey(now);
  const sameMonth = raw?.monthKey === currentMonth;

  const monthlyUsed =
    sameMonth && typeof raw?.monthlyUsed === "number" && Number.isFinite(raw.monthlyUsed)
      ? Math.max(0, Math.floor(raw.monthlyUsed))
      : 0;

  const topupRemaining =
    typeof raw?.topupRemaining === "number" && Number.isFinite(raw.topupRemaining)
      ? Math.max(0, Math.floor(raw.topupRemaining))
      : 0;

  return {
    monthKey: currentMonth,
    monthlyUsed,
    topupRemaining,
    lastTopupOrderId: raw?.lastTopupOrderId ?? null,
    lastTopupAt: raw?.lastTopupAt ?? null,
    novaosBillingAccountId: raw?.novaosBillingAccountId ?? null,
  };
}

export function computeAiQuotaSnapshot(
  plan: PlanTier,
  rawState?: Partial<AiQuotaState> | null,
  now = new Date(),
): AiQuotaSnapshot {
  const state = normalizeAiQuotaState(rawState, now);
  const monthlyLimit = getMonthlyAiLimit(plan);
  const monthlyRemaining = Math.max(0, monthlyLimit - state.monthlyUsed);
  const totalRemaining = monthlyRemaining + state.topupRemaining;

  return {
    plan,
    monthKey: state.monthKey,
    monthlyLimit,
    monthlyUsed: state.monthlyUsed,
    monthlyRemaining,
    topupRemaining: state.topupRemaining,
    totalRemaining,
  };
}

/**
 * Deducts 1 AI analysis credit strictly in priority order:
 * 1) Current month's plan quota (FREE: 5/mo, PRO: 20/mo)
 * 2) Persistent one-time top-up pack credits ($49 / 30 uses)
 */
export function consumeOneAiCredit(
  plan: PlanTier,
  rawState?: Partial<AiQuotaState> | null,
  now = new Date(),
): {
  ok: boolean;
  nextState: AiQuotaState;
  snapshot: AiQuotaSnapshot;
} {
  const state = normalizeAiQuotaState(rawState, now);
  const monthlyLimit = getMonthlyAiLimit(plan);
  const monthlyRemaining = Math.max(0, monthlyLimit - state.monthlyUsed);

  if (monthlyRemaining > 0) {
    const nextState: AiQuotaState = {
      ...state,
      monthlyUsed: state.monthlyUsed + 1,
    };
    return {
      ok: true,
      nextState,
      snapshot: {
        ...computeAiQuotaSnapshot(plan, nextState, now),
        deductedFrom: "monthly",
      },
    };
  }

  if (state.topupRemaining > 0) {
    const nextState: AiQuotaState = {
      ...state,
      topupRemaining: state.topupRemaining - 1,
    };
    return {
      ok: true,
      nextState,
      snapshot: {
        ...computeAiQuotaSnapshot(plan, nextState, now),
        deductedFrom: "topup",
      },
    };
  }

  return {
    ok: false,
    nextState: state,
    snapshot: computeAiQuotaSnapshot(plan, state, now),
  };
}

/**
 * Applies a $49 / +30 AI analysis top-up pack.
 * TODO (NovaOS ECPay integration): replace simulated orderId with verified
 * ECPay MerchantTradeNo after callback confirmation.
 */
export function applyTopupPackToQuota(
  rawState?: Partial<AiQuotaState> | null,
  options?: {
    orderId?: string;
    novaosBillingAccountId?: string | null;
    now?: Date;
  },
): AiQuotaState {
  const now = options?.now ?? new Date();
  const state = normalizeAiQuotaState(rawState, now);
  return {
    ...state,
    topupRemaining: state.topupRemaining + AI_TOPUP_PACK.credits,
    lastTopupOrderId: options?.orderId ?? `SIM-TOPUP-${Date.now()}`,
    lastTopupAt: now.toISOString(),
    novaosBillingAccountId:
      options?.novaosBillingAccountId ?? state.novaosBillingAccountId ?? null,
  };
}
