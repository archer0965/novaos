"use client";

import { useState } from "react";
import Link from "next/link";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NOVA_MODULES, REFERRAL_CONFIG } from "@/lib/novaos";
import {
  BILLING_CYCLES,
  PRIMARY_PAID_PLAN_KEYS,
  PLAN_CATALOG,
  type BillingCycle,
} from "@/types/database";
import { cn } from "@/lib/utils";

const CYCLE_OPTIONS: BillingCycle[] = ["monthly", "yearly"];

export function LandingPricing() {
  const [cycle, setCycle] = useState<BillingCycle>("monthly");

  return (
    <section id="pricing" className="relative z-10 scroll-mt-20 py-16 md:py-20">
      <div className="mx-auto max-w-6xl px-4">
        <h2 className="font-display text-2xl font-semibold tracking-tight md:text-3xl">
          NovaOS 方案價格
        </h2>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          單模組專注經營，或一次解鎖拓脈預約／NovaStore／AI Doc／拓管。年繳相當於免費贈送
          2 個月。被推薦人首次付款現折 NT${REFERRAL_CONFIG.refereeFirstDiscount}。
        </p>

        <div className="mt-6 inline-flex flex-wrap rounded-xl bg-secondary p-1">
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
                {meta.label}
              </button>
            );
          })}
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {PRIMARY_PAID_PLAN_KEYS.map((key) => {
            const plan = PLAN_CATALOG[key];
            const price = plan.prices[cycle];
            const period = cycle === "yearly" ? "年" : "月";
            const firstMonth =
              cycle === "monthly"
                ? Math.max(1, price.total - REFERRAL_CONFIG.refereeFirstDiscount)
                : null;

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
                    {plan.popularBadge || "特惠中"}
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
                  {"listPriceMonthly" in plan &&
                  plan.listPriceMonthly &&
                  cycle === "monthly" ? (
                    <span
                      className={cn(
                        "mr-2 text-lg font-medium line-through",
                        plan.isPopular
                          ? "text-primary-foreground/55"
                          : "text-muted-foreground"
                      )}
                    >
                      ${plan.listPriceMonthly}
                    </span>
                  ) : null}
                  NT${price.total.toLocaleString("zh-TW")}
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
                  {plan.blurb}
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
                {cycle === "yearly" ? (
                  <p
                    className={cn(
                      "mt-1 text-xs",
                      plan.isPopular
                        ? "text-primary-foreground/70"
                        : "text-muted-foreground"
                    )}
                  >
                    約每月 NT${price.avgMonthly.toLocaleString("zh-TW")}
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
                  <Link href="/signup">選擇方案</Link>
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
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
