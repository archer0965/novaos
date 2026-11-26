"use client";

import { useMemo, useState } from "react";
import { Check, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ModuleActivationRow } from "@/lib/module-activation";
import { NOVA_MODULES, PAID_MODULE_IDS, type NovaModuleId } from "@/lib/novaos";
import {
  AI_DOC_PLAN_META,
  buildAiDocCheckoutQuote,
  buildCheckoutQuote,
  resolvePricingTier,
  TIER_META,
  type AiDocPaidPlanKey,
  type PricingTierId,
} from "@/lib/pricing-tiers";
import { isSubscriptionExpired } from "@/lib/subscription";
import type { UpgradeProrationQuote } from "@/lib/subscription";
import {
  BILLING_CYCLES,
  FREE_TRIAL,
  PRIMARY_PAID_PLAN_KEYS,
  PLAN_CATALOG,
  PLAN_RANK,
  getCycleLabel,
  getPlanDisplayName,
  hasAmbassadorDiscount,
  hasLifetimeSpecialDiscount,
  isDowngrade,
  isPaidPlan,
  isTrialActive,
  normalizeBillingCycle,
  normalizePlan,
  type BillingCycle,
  type PaidPlanKey,
  type Profile,
} from "@/types/database";
import { cn } from "@/lib/utils";

const CYCLE_OPTIONS: BillingCycle[] = ["monthly", "half_yearly", "yearly"];
const MODULE_PICK: NovaModuleId[] = [...PAID_MODULE_IDS];

function canProrateUpgrade(profile: Profile, target: PaidPlanKey): boolean {
  const current = normalizePlan(profile.plan_type);
  if (!isPaidPlan(current)) return false;
  if (isSubscriptionExpired(profile.expires_at)) return false;
  return PLAN_RANK[target] > PLAN_RANK[current];
}

function resolveInitialModule(
  initialProduct: string | null | undefined,
  activeModules: string[] | null | undefined
): NovaModuleId {
  const raw = (initialProduct || "").trim().toLowerCase();
  if (raw === "ai_doc" || raw === "aidoc" || raw === "docmate") return "ai_doc";
  if (raw === "booking" || raw === "taiwanbiz") return "booking";
  if (raw === "store" || raw === "novastore") return "store";
  const first = activeModules?.[0];
  if (first && MODULE_PICK.includes(first as NovaModuleId)) {
    return first as NovaModuleId;
  }
  return "store";
}

export function PlanUpgrade({
  profile,
  activations = [],
  forcedTier,
  initialProduct,
}: {
  profile: Profile;
  activations?: ModuleActivationRow[];
  forcedTier?: PricingTierId | null;
  initialProduct?: string | null;
}) {
  const current = normalizePlan(profile.plan_type);
  const trialOn = isTrialActive(profile.trial_ends_at);
  const [cycle, setCycle] = useState<BillingCycle>(
    normalizeBillingCycle(profile.billing_cycle)
  );
  const [loadingPlan, setLoadingPlan] = useState<PaidPlanKey | null>(null);
  const [quote, setQuote] = useState<UpgradeProrationQuote | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [selectedModule, setSelectedModule] = useState<NovaModuleId>(() =>
    resolveInitialModule(initialProduct, profile.active_modules)
  );
  const [referralCode, setReferralCode] = useState("");

  const partner = hasLifetimeSpecialDiscount(
    profile.discount_tier,
    profile.is_early_bird
  );
  const ambassador = hasAmbassadorDiscount(
    profile.discount_tier,
    profile.is_ambassador
  );
  const anyEarly = activations.some((a) => a.is_module_early_bird);
  const modEarly = Boolean(
    activations.find((a) => a.module_id === selectedModule)?.is_module_early_bird
  );

  const tierForStarter = useMemo(
    () =>
      forcedTier ||
      resolvePricingTier({
        moduleId: selectedModule,
        isPartnerStore: partner,
        isAmbassador: ambassador,
        moduleIsEarlyBird: modEarly,
        anyModuleEarlyBird: anyEarly,
      }),
    [forcedTier, selectedModule, partner, ambassador, modEarly, anyEarly]
  );

  const tierForBundle = useMemo(
    () =>
      forcedTier ||
      resolvePricingTier({
        moduleId: null,
        isPartnerStore: partner,
        isAmbassador: ambassador,
        anyModuleEarlyBird: anyEarly,
      }),
    [forcedTier, partner, ambassador, anyEarly]
  );

  async function submitHtmlCheckout(
    url: string,
    body: Record<string, unknown>
  ) {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const contentType = res.headers.get("content-type") || "";
    if (!res.ok) {
      const json = await res.json().catch(() => ({}));
      throw new Error(json.error || "無法建立付款訂單");
    }
    if (contentType.includes("application/json")) {
      const json = await res.json();
      if (json.applied) {
        toast.success(json.message || "升級成功");
        window.location.reload();
        return;
      }
      throw new Error(json.error || "付款回應格式錯誤");
    }
    if (contentType.includes("text/html")) {
      const html = await res.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, "text/html");
      const srcForm = doc.querySelector("form");
      if (!srcForm?.action) {
        throw new Error("綠界付款表單無效");
      }
      const form = document.createElement("form");
      form.method = "post";
      form.action = srcForm.action;
      form.acceptCharset = "UTF-8";
      form.style.display = "none";
      srcForm.querySelectorAll("input").forEach((input) => {
        const field = document.createElement("input");
        field.type = "hidden";
        field.name = input.name;
        field.value = input.value;
        form.appendChild(field);
      });
      document.body.appendChild(form);
      form.submit();
      return;
    }
    throw new Error("付款回應格式錯誤");
  }

  async function checkoutFull(plan: PaidPlanKey) {
    setLoadingPlan(plan);
    try {
      await submitHtmlCheckout("/api/checkout", {
        plan,
        cycle,
        catalog: "novaos",
        module: plan === "starter" ? selectedModule : undefined,
        referralCode: referralCode.trim() || undefined,
      });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "升級失敗");
      setLoadingPlan(null);
    }
  }

  async function checkoutAiDoc(plan: AiDocPaidPlanKey) {
    setLoadingPlan(plan as PaidPlanKey);
    try {
      await submitHtmlCheckout("/api/checkout", {
        plan,
        cycle,
        catalog: "ai_doc",
        module: "ai_doc",
        referralCode: referralCode.trim() || undefined,
      });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "升級失敗");
      setLoadingPlan(null);
    }
  }

  const isAiDocMode = selectedModule === "ai_doc";

  async function onSelectPlan(plan: PaidPlanKey) {
    if (canProrateUpgrade(profile, plan)) {
      setLoadingPlan(plan);
      try {
        const res = await fetch("/api/upgrade", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ plan, action: "quote" }),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || "無法計算差價");
        if (!json.quote?.eligible) {
          await checkoutFull(plan);
          return;
        }
        setQuote(json.quote as UpgradeProrationQuote);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "無法計算升級差價");
      } finally {
        setLoadingPlan(null);
      }
      return;
    }
    await checkoutFull(plan);
  }

  async function confirmProration() {
    if (!quote) return;
    setConfirming(true);
    try {
      await submitHtmlCheckout("/api/upgrade", {
        plan: quote.toPlan,
        action: "confirm",
      });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "升級付款失敗");
      setConfirming(false);
    }
  }

  const trialLabel =
    trialOn && profile.trial_ends_at
      ? new Date(profile.trial_ends_at).toLocaleString("zh-TW", {
          timeZone: "Asia/Taipei",
          month: "numeric",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
      : null;

  const firstDiscountEligible = !profile.referral_discount_used;

  return (
    <section
      id="upgrade"
      className="space-y-4 rounded-2xl border border-border/80 bg-card/80 p-5 shadow-sm md:p-6"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm text-muted-foreground">目前方案</p>
          <h2 className="mt-1 font-display text-2xl font-semibold">
            {getPlanDisplayName(current)}
            {current !== "free"
              ? `（${getCycleLabel(normalizeBillingCycle(profile.billing_cycle))}）`
              : ""}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {trialOn
              ? `${FREE_TRIAL.description}｜試用參考至 ${trialLabel}（台北時間）`
              : "註冊不會開始試用；請先啟用子模組。應付＝原價 × 資格折扣 − 推薦現折。"}
          </p>
        </div>
        <div className="inline-flex flex-wrap rounded-xl bg-secondary p-1">
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
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="referral-code">推薦碼（選填）</Label>
          <Input
            id="referral-code"
            value={referralCode}
            onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
            placeholder="好友的 NVXXXX"
            disabled={!firstDiscountEligible}
          />
          <p className="text-xs text-muted-foreground">
            {firstDiscountEligible
              ? "首次付款輸入推薦碼現折 NT$50"
              : "此帳號已使用過推薦現折"}
          </p>
        </div>
        <div className="space-y-1.5">
          <Label>選擇產品線（訂閱中控為帳號中心）</Label>
          <div className="flex flex-wrap gap-1.5">
            {MODULE_PICK.map((id) => {
              const mod = NOVA_MODULES[id];
              const active = selectedModule === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setSelectedModule(id)}
                  className={cn(
                    "rounded-lg border px-2.5 py-1.5 text-xs",
                    active
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border text-muted-foreground"
                  )}
                >
                  {mod.name}
                </button>
              );
            })}
          </div>
          <p className="text-xs text-muted-foreground">
            {isAiDocMode
              ? `Nova AI Doc 資格：${TIER_META[tierForStarter].label}（${TIER_META[tierForStarter].foldLabels[cycle]}）· 折扣規則與全站一致`
              : `拓脈／NovaStore 資格：${TIER_META[tierForStarter].label}（${TIER_META[tierForStarter].foldLabels[cycle]}）／旗艦：${TIER_META[tierForBundle].label}`}
          </p>
        </div>
      </div>

      {isAiDocMode ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {(["pro", "business"] as AiDocPaidPlanKey[]).map((key) => {
            const plan = AI_DOC_PLAN_META[key];
            const priceQuote = buildAiDocCheckoutQuote({
              plan: key,
              cycle,
              tier: tierForStarter,
              referralFirstDiscount:
                firstDiscountEligible && Boolean(referralCode.trim()),
              applyCredit:
                cycle === "monthly"
                  ? Math.min(100, Number(profile.referral_credit_balance) || 0)
                  : 0,
            });
            const period =
              cycle === "yearly" ? "年" : cycle === "half_yearly" ? "半年" : "月";

            return (
              <div
                key={key}
                className={cn(
                  "rounded-2xl border p-5",
                  plan.isPopular
                    ? "border-2 border-accent bg-gradient-to-br from-primary to-primary/85 text-primary-foreground ring-2 ring-accent/30"
                    : "border-border bg-background/70"
                )}
              >
                <div className="flex items-center gap-2">
                  <p className="font-display text-lg font-semibold">{plan.name}</p>
                  {plan.isPopular ? (
                    <span className="rounded-md bg-accent px-2 py-0.5 text-xs font-semibold text-accent-foreground">
                      {plan.popularBadge || "主推"}
                    </span>
                  ) : null}
                </div>
                <p
                  className={cn(
                    "mt-1 text-sm",
                    plan.isPopular
                      ? "text-primary-foreground/80"
                      : "text-muted-foreground"
                  )}
                >
                  {plan.blurb}
                </p>
                <p className="mt-4 font-display text-3xl font-bold">
                  {priceQuote.savingsVsBase > 0 ? (
                    <span className="mr-2 text-base font-medium line-through opacity-70">
                      ${priceQuote.baseAmount}
                    </span>
                  ) : null}
                  ${priceQuote.finalAmount}
                  <span className="text-base font-medium opacity-80">
                    {" "}
                    / {period}
                  </span>
                </p>
                <p
                  className={cn(
                    "mt-1 text-xs font-medium",
                    plan.isPopular ? "text-accent" : "text-amber-700"
                  )}
                >
                  {priceQuote.tierLabel} · {priceQuote.foldLabel}
                  {priceQuote.savingsVsBase > 0
                    ? ` · 省 $${priceQuote.savingsVsBase}`
                    : ""}
                  {priceQuote.referralDiscount
                    ? ` · 推薦 −$${priceQuote.referralDiscount}`
                    : ""}
                </p>
                <ul className="mt-4 space-y-2 text-sm">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2">
                      <Check className="mt-0.5 h-4 w-4 shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button
                  type="button"
                  disabled={loadingPlan !== null}
                  onClick={() => checkoutAiDoc(key)}
                  className={cn(
                    "mt-5 h-11 w-full gap-1.5",
                    plan.isPopular
                      ? "bg-accent text-accent-foreground hover:bg-accent/90"
                      : ""
                  )}
                  variant={plan.isPopular ? "default" : "outline"}
                >
                  {loadingPlan === key ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : null}
                  綠界付款升級 {plan.name}
                </Button>
              </div>
            );
          })}
        </div>
      ) : (
      <div className="grid gap-4 lg:grid-cols-2">
        {PRIMARY_PAID_PLAN_KEYS.map((key) => {
          const plan = PLAN_CATALOG[key];
          const tier = key === "unlimited" ? tierForBundle : tierForStarter;
          const priceQuote = buildCheckoutQuote({
            plan: key,
            cycle,
            tier,
            referralFirstDiscount:
              firstDiscountEligible && Boolean(referralCode.trim()),
            applyCredit:
              cycle === "monthly"
                ? Math.min(100, Number(profile.referral_credit_balance) || 0)
                : 0,
          });
          const isCurrent =
            current === key || (current === "pro" && key === "starter");
          const downgrade = isDowngrade(current, key);
          const prorate = canProrateUpgrade(profile, key);
          const period =
            cycle === "yearly" ? "年" : cycle === "half_yearly" ? "半年" : "月";

          return (
            <div
              key={key}
              className={cn(
                "rounded-2xl border p-5",
                plan.isPopular
                  ? "border-2 border-accent bg-gradient-to-br from-primary to-primary/85 text-primary-foreground ring-2 ring-accent/30"
                  : "border-border bg-background/70"
              )}
            >
              <div className="flex items-center gap-2">
                <p className="font-display text-lg font-semibold">{plan.name}</p>
                {plan.isPopular ? (
                  <span className="rounded-md bg-accent px-2 py-0.5 text-xs font-semibold text-accent-foreground">
                    {plan.popularBadge || "旗艦"}
                  </span>
                ) : null}
              </div>
              <p
                className={cn(
                  "mt-1 text-sm",
                  plan.isPopular
                    ? "text-primary-foreground/80"
                    : "text-muted-foreground"
                )}
              >
                {plan.blurb}
              </p>
              <p className="mt-4 font-display text-3xl font-bold">
                {priceQuote.savingsVsBase > 0 ? (
                  <span className="mr-2 text-base font-medium line-through opacity-70">
                    ${priceQuote.baseAmount}
                  </span>
                ) : null}
                ${priceQuote.finalAmount}
                <span className="text-base font-medium opacity-80">
                  {" "}
                  / {period}
                </span>
              </p>
              <p
                className={cn(
                  "mt-1 text-xs font-medium",
                  plan.isPopular ? "text-accent" : "text-amber-700"
                )}
              >
                {priceQuote.tierLabel} · {priceQuote.foldLabel}
                {priceQuote.savingsVsBase > 0
                  ? ` · 省 $${priceQuote.savingsVsBase}`
                  : ""}
                {priceQuote.referralDiscount
                  ? ` · 推薦 −$${priceQuote.referralDiscount}`
                  : ""}
                {priceQuote.creditApplied
                  ? ` · 扣抵 −$${priceQuote.creditApplied}`
                  : ""}
              </p>
              <ul className="mt-4 space-y-2 text-sm">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2">
                    <Check className="mt-0.5 h-4 w-4 shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Button
                type="button"
                disabled={downgrade || loadingPlan !== null}
                onClick={() =>
                  isCurrent ? checkoutFull(key) : onSelectPlan(key)
                }
                className={cn(
                  "mt-5 h-11 w-full gap-1.5",
                  plan.isPopular
                    ? "bg-accent text-accent-foreground hover:bg-accent/90"
                    : ""
                )}
                variant={plan.isPopular ? "default" : "outline"}
              >
                {loadingPlan === key ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : null}
                {isCurrent
                  ? "綠界續費（天數累加）"
                  : downgrade
                    ? "已是更高方案"
                    : prorate
                      ? `綠界補差價升級 ${plan.name}`
                      : `綠界付款升級 ${plan.name}`}
              </Button>
            </div>
          );
        })}
      </div>
      )}

      {quote ? (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/45 p-4 sm:items-center"
          role="dialog"
          aria-modal="true"
          onClick={() => !confirming && setQuote(null)}
        >
          <div
            className="w-full max-w-md rounded-2xl border border-border bg-card p-5 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-2">
              <Sparkles className="mt-0.5 h-5 w-5 text-primary" />
              <div>
                <h3 className="font-display text-lg font-semibold">升級差價折抵</h3>
                <p className="mt-2 text-sm leading-relaxed">{quote.message}</p>
              </div>
            </div>
            <div className="mt-5 flex gap-2">
              <Button
                type="button"
                variant="outline"
                className="h-11 flex-1"
                disabled={confirming}
                onClick={() => setQuote(null)}
              >
                再想想
              </Button>
              <Button
                type="button"
                className="h-11 flex-[1.4]"
                disabled={confirming}
                onClick={confirmProration}
              >
                {confirming ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                確認補差價 NT${quote.topUpAmount}
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
