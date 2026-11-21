/** 訂閱管家 — personal subscription tracker（正式產品為免登入本機站；hub 另有可選雲端實驗）。 */

export const SUBKEEPER_PRODUCT = {
  id: "subkeeper",
  name: "訂閱管家",
  nameEn: "Subscription Keeper",
  /** Canonical product URL (standalone site). */
  siteUrl: "https://temporary-speedy-reef-cy4xhhu.vercel.app",
  /** Marketing / product-matrix entry. */
  publicHref: "https://temporary-speedy-reef-cy4xhhu.vercel.app",
  /** Optional hub-hosted workspace (auth experiments). */
  href: "/dashboard/subkeeper",
  /** Marketing / gate: unified NovaOS login then open product. */
  loginHref: "/login?next=%2Fdashboard%2Fsubkeeper",
  signupHref: "/signup?next=%2Fdashboard%2Fsubkeeper",
  tagline: "永久免費・個人訂閱費用管理與扣款提醒",
  hubUrl: "https://paycheck.com.de",
  /** Alias of siteUrl (historical localStorage-era standalone). */
  legacyUrl: "https://temporary-speedy-reef-cy4xhhu.vercel.app",
  /** Exact key used by old SubKeeper web app. */
  legacyStorageKey: "subkeeper-subscriptions-v1",
} as const;

export type PersonalBillingCycle = "monthly" | "yearly" | "weekly" | "custom";

export type PersonalSubscription = {
  id: string;
  user_id: string;
  name: string;
  amount_twd: number;
  billing_cycle: PersonalBillingCycle;
  next_billing_on: string | null;
  reminder_days: number;
  category: string | null;
  notes: string | null;
  is_active: boolean;
  legacy_client_id?: string | null;
  created_at: string;
  updated_at: string;
};

/** Shape stored by legacy SubKeeper in localStorage. */
export type LegacySubkeeperItem = {
  id: string;
  name: string;
  amount: number;
  cycle?: string;
  billingDay?: number;
  status?: string;
  accent?: string;
};

export const PERSONAL_CYCLE_LABELS: Record<PersonalBillingCycle, string> = {
  monthly: "月繳",
  yearly: "年繳",
  weekly: "週繳",
  custom: "其他",
};

export function monthlyEquivalent(
  amount: number,
  cycle: PersonalBillingCycle
): number {
  if (cycle === "yearly") return Math.round(amount / 12);
  if (cycle === "weekly") return Math.round((amount * 52) / 12);
  return amount;
}

export function normalizeLegacyCycle(raw: unknown): PersonalBillingCycle {
  const v = String(raw || "monthly").toLowerCase();
  if (v === "yearly" || v === "year" || v === "annual") return "yearly";
  if (v === "weekly" || v === "week") return "weekly";
  if (v === "custom" || v === "other") return "custom";
  return "monthly";
}

/** Next billing date (YYYY-MM-DD) from a day-of-month in Asia/Taipei. */
export function nextBillingFromDay(billingDay: number, now = new Date()): string {
  const day = Math.min(31, Math.max(1, Math.floor(billingDay) || 1));
  const fmt = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Taipei",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const parts = Object.fromEntries(
    fmt.formatToParts(now).map((p) => [p.type, p.value])
  );
  let y = Number(parts.year);
  let m = Number(parts.month);
  const today = Number(parts.day);
  if (day < today) {
    m += 1;
    if (m > 12) {
      m = 1;
      y += 1;
    }
  }
  // Clamp day to month length
  const dim = new Date(Date.UTC(y, m, 0)).getUTCDate();
  const d = Math.min(day, dim);
  return `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

export function readLegacyLocalSubscriptions(): LegacySubkeeperItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(SUBKEEPER_PRODUCT.legacyStorageKey);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (e): e is LegacySubkeeperItem =>
        Boolean(
          e &&
            typeof e === "object" &&
            typeof e.id === "string" &&
            typeof e.name === "string" &&
            typeof e.amount === "number"
        )
    );
  } catch {
    return [];
  }
}

export function clearLegacyLocalSubscriptions() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(SUBKEEPER_PRODUCT.legacyStorageKey);
  } catch {
    /* ignore */
  }
}
