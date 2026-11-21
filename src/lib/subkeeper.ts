/** 訂閱管家 — personal subscription tracker (NovaOS auth required). */

export const SUBKEEPER_PRODUCT = {
  id: "subkeeper",
  name: "訂閱管家",
  nameEn: "Subscription Keeper",
  /** Canonical in-hub path (login required). */
  href: "/dashboard/subkeeper",
  /** Marketing entry: force unified NovaOS login first. */
  loginHref: "/login?next=%2Fdashboard%2Fsubkeeper",
  signupHref: "/signup?next=%2Fdashboard%2Fsubkeeper",
  tagline: "個人訂閱費用管理與扣款提醒",
  /** Legacy standalone URL (no longer the primary entry; requires hub login). */
  legacyUrl: "https://temporary-speedy-reef-cy4xhhu.vercel.app",
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
  created_at: string;
  updated_at: string;
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
