"use client";

import { useState } from "react";
import Link from "next/link";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NOVA_MODULES, REFERRAL_CONFIG } from "@/lib/novaos";
import {
  SUBSCRIPTION_BASE_PRICES,
  TIER_CHECKOUT_TOTALS,
  TIER_META,
  type PricingTierId,
} from "@/lib/pricing-tiers";
import {
  BILLING_CYCLES,
  PRIMARY_PAID_PLAN_KEYS,
  PLAN_CATALOG,
  type BillingCycle,
} from "@/types/database";
import { cn } from "@/lib/utils";

const CYCLE_OPTIONS: BillingCycle[] = ["monthly", "half_yearly", "yearly"];
const TIER_OPTIONS: PricingTierId[] = ["early_bird", "general", "vip"];

export function LandingPricing() {
  const [cycle, setCycle] = useState<BillingCycle>("monthly");
  const [tier, setTier] = useState<PricingTierId>("early_bird");

  return (
    <section id="pricing" className="relative z-10 scroll-mt-20 py-16 md:py-20">
      <div className="mx-auto max-w-6xl px-4">
        <h2 className="font-display text-2xl font-semibold tracking-tight md:text-3xl">
          NovaOS 方案與折扣階梯
        </h2>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          註冊不會開始試用；啟用子模組後才佔用該模組早鳥名額（各 15 名）。應付金額＝週期原價 ×
          資格折扣 − 推薦碼首月 $
          {REFERRAL_CONFIG.refereeFirstDiscount}。
        </p>

        <div className="mt-6 flex flex-wrap gap-2">
          {TIER_OPTIONS.map((id) => (
            <button
              key={id}
              type="button"
              onClick={() => setTier(id)}
              className={cn(
                "rounded-xl border px-3 py-2 text-sm",
                tier === id
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-background/70 text-muted-foreground"
              )}
            >
              {TIER_META[id].label}
              <span className="ml-1 opacity-80">
                （{TIER_META[id].trialDays} 天試用）
              </span>
            </button>
          ))}
        </div>

        <div className="mt-4 inline-flex flex-wrap rounded-xl bg-secondary p-1">
          {CYCLE_OPTIONS.map((value) => {
            const meta = BILLING_CYCLES[value];
            return (
              <button
                key={value}
                type="button"
                onClick={() => setCycle(value)}
                className={cn(
                  "rounded-lg px-3 py-1.5 text-sm transition-colors",
                  cycle === value
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {meta.label} · {TIER_META[tier].foldLabels[cycle]}
              </button>
            );
          })}
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {PRIMARY_PAID_PLAN_KEYS.map((key) => {
            const plan = PLAN_CATALOG[key];
            const planKey = key === "unlimited" ? "unlimited" : "starter";
            const base = SUBSCRIPTION_BASE_PRICES[planKey][cycle];
            const price = TIER_CHECKOUT_TOTALS[tier][planKey][cycle];
            const period =
              cycle === "yearly" ? "年" : cycle === "half_yearly" ? "半年" : "月";
            const firstMonth =
              cycle === "monthly"
                ? Math.max(1, price - REFERRAL_CONFIG.refereeFirstDiscount)
                : null;
            const saved = Math.max(0, base - price);

            return (
              <div
                key={key}
                className={cn(
                  "relative flex flex-col rounded-2xl border p-6",
                  plan.isPopular
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border/80 bg-background/70"
                )}
              >
                {plan.isPopular ? (
                  <p className="absolute right-4 top-4 text-xs font-semibold text-accent">
                    {plan.popularBadge || "旗艦"}
                  </p>
                ) : null}
                <p
                  className={cn(
                    "text-sm font-medium",
                    plan.isPopular
                      ? "text-primary-foreground/80"
                      : "text-muted-foreground"
                  )}
                >
                  {plan.name}
                </p>
                <p className="mt-3 font-display text-4xl font-bold tracking-tight">
                  {saved > 0 ? (
                    <span
                      className={cn(
                        "mr-2 text-lg font-medium line-through",
                        plan.isPopular
                          ? "text-primary-foreground/55"
                          : "text-muted-foreground"
                      )}
                    >
                      ${base.toLocaleString("zh-TW")}
                    </span>
                  ) : null}
                  NT${price.toLocaleString("zh-TW")}
                  <span
                    className={cn(
                      "text-base font-medium",
                      plan.isPopular
                        ? "text-primary-foreground/75"
                        : "text-muted-foreground"
                    )}
                  >
                    {" "}
                    / {period}
                  </span>
                </p>
                <p
                  className={cn(
                    "mt-2 text-sm",
                    plan.isPopular
                      ? "text-primary-foreground/80"
                      : "text-muted-foreground"
                  )}
                >
                  {TIER_META[tier].foldLabels[cycle]}
                  {saved > 0
                    ? ` · 省 NT$${saved.toLocaleString("zh-TW")}`
                    : ""}
                </p>
                {firstMonth ? (
                  <p
                    className={cn(
                      "mt-1 text-xs font-medium",
                      plan.isPopular ? "text-accent" : "text-amber-700"
                    )}
                  >
                    推薦碼首月 NT${firstMonth}
                  </p>
                ) : null}
                <ul
                  className={cn(
                    "mt-6 flex-1 space-y-2.5 text-sm",
                    plan.isPopular ? "text-primary-foreground/95" : ""
                  )}
                >
                  {plan.features.map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <Check
                        className={cn(
                          "mt-0.5 h-4 w-4 shrink-0",
                          plan.isPopular ? "" : "text-primary"
                        )}
                      />
                      {item}
                    </li>
                  ))}
                </ul>
                <Button
                  asChild
                  className={cn(
                    "mt-8 w-full",
                    plan.isPopular
                      ? "bg-accent text-accent-foreground hover:bg-accent/90"
                      : ""
                  )}
                  variant={plan.isPopular ? "default" : "outline"}
                >
                  <Link href="/signup">註冊後啟用模組</Link>
                </Button>
              </div>
            );
          })}
        </div>

        <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {Object.values(NOVA_MODULES).map((m) => (
            <div
              key={m.id}
              className="rounded-2xl border border-border/70 bg-background/60 px-4 py-4"
            >
              <p className="font-medium">
                {m.emoji} {m.name}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">{m.blurb}</p>
              <p className="mt-2 text-[11px] text-amber-800">
                {m.id === "pass"
                  ? "永久免費・不佔早鳥名額"
                  : "早鳥名額各自 15 名，啟用時才佔用"}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
