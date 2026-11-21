import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { buildAutoSubmitHtml, buildCheckoutParams } from "@/lib/ecpay";
import {
  listActivationsForSeller,
  resolveSellerPricingTier,
} from "@/lib/module-activation";
import {
  isNovaModuleId,
  PAID_MODULE_IDS,
  REFERRAL_CONFIG,
  type NovaModuleId,
} from "@/lib/novaos";
import { buildCheckoutQuote } from "@/lib/pricing-tiers";
import { getSiteUrl } from "@/lib/site";
import {
  PLAN_CATALOG,
  getCycleLabel,
  isPaidPlan,
  normalizeBillingCycle,
  type BillingCycle,
  type PaidPlanKey,
} from "@/types/database";

const bodySchema = z.object({
  plan: z.enum(["starter", "pro", "unlimited", "plus", "premium"]),
  cycle: z
    .enum(["monthly", "half_yearly", "yearly", "halfYearly"])
    .default("monthly"),
  module: z.string().optional(),
  referralCode: z.string().trim().max(24).optional(),
});

export async function POST(request: Request) {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "請先登入" }, { status: 401 });
    }

    const json = await request.json().catch(() => ({}));
    const parsed = bodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "請選擇有效的方案與計費週期" },
        { status: 400 }
      );
    }

    const planRaw = parsed.data.plan;
    const plan: PaidPlanKey =
      planRaw === "plus"
        ? "starter"
        : planRaw === "premium"
          ? "unlimited"
          : planRaw === "pro"
            ? "starter"
            : (planRaw as PaidPlanKey);

    if (!isPaidPlan(plan)) {
      return NextResponse.json({ error: "無效的付費方案" }, { status: 400 });
    }

    const cycle = normalizeBillingCycle(parsed.data.cycle) as BillingCycle;
    const moduleRaw = parsed.data.module || "";
    const selectedModule: NovaModuleId | null = isNovaModuleId(moduleRaw)
      ? moduleRaw
      : null;

    const { data: profile } = await supabase
      .from("profiles")
      .select(
        "is_early_bird, discount_tier, is_ambassador, referral_discount_used, referral_credit_balance, referred_by"
      )
      .eq("id", user.id)
      .maybeSingle();

    let referrerId: string | null = null;
    const code = (parsed.data.referralCode || "").trim().toUpperCase();
    const canUseReferral =
      Boolean(code) && !profile?.referral_discount_used && !profile?.referred_by;

    if (canUseReferral) {
      const admin = createAdminClient();
      const { data: referrer } = await admin
        .from("profiles")
        .select("id, referral_code")
        .eq("referral_code", code)
        .maybeSingle();
      if (referrer && referrer.id !== user.id) {
        referrerId = referrer.id;
        await admin
          .from("profiles")
          .update({ referred_by: referrer.id })
          .eq("id", user.id)
          .is("referred_by", null);
      }
    }

    const applyCredit =
      cycle === "monthly"
        ? Math.min(
            REFERRAL_CONFIG.maxCreditPerRenewal,
            Number(profile?.referral_credit_balance) || 0
          )
        : 0;

    const activations = await listActivationsForSeller(user.id);
    const tier = resolveSellerPricingTier({
      profile: profile || {},
      activations,
      moduleId: plan === "starter" ? selectedModule || "store" : null,
    });

    const quote = buildCheckoutQuote({
      plan,
      cycle,
      tier,
      referralFirstDiscount: Boolean(referrerId),
      applyCredit,
    });
    const amount = quote.finalAmount;

    if (plan === "starter") {
      const mod = selectedModule || "store";
      await supabase
        .from("profiles")
        .update({ active_modules: [mod] })
        .eq("id", user.id);
    } else if (plan === "unlimited") {
      await supabase
        .from("profiles")
        .update({ active_modules: [...PAID_MODULE_IDS] })
        .eq("id", user.id);
    }

    const catalog = PLAN_CATALOG[plan];
    const cycleLabel = getCycleLabel(cycle);

    const baseUrl = getSiteUrl();
    const stamp = Date.now().toString(36).toUpperCase();
    const uid = user.id.replace(/-/g, "").slice(0, 8).toUpperCase();
    const merchantTradeNo = `PCP${uid}${stamp}`.slice(0, 20);

    const { paymentUrl, params } = buildCheckoutParams({
      merchantTradeNo,
      totalAmount: amount,
      tradeDesc: `NovaOS ${catalog.name} ${cycleLabel} ${tier}`,
      itemName: `NovaOS ${catalog.name} ${cycleLabel}`,
      returnURL: `${baseUrl}/api/checkout/callback`,
      clientBackURL: `${baseUrl}/dashboard/pass?upgraded=pending`,
      customField1: user.id,
      customField2: `${plan}:${cycle}:t${tier}${referrerId ? `:ref` : ""}${
        applyCredit ? `:c${applyCredit}` : ""
      }`,
    });

    const html = buildAutoSubmitHtml(paymentUrl, params);
    return new NextResponse(html, {
      status: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "no-store",
        "X-NovaOS-Quote": JSON.stringify({
          baseAmount: quote.baseAmount,
          tierAmount: quote.tierAmount,
          finalAmount: quote.finalAmount,
          tier: quote.tier,
          foldLabel: quote.foldLabel,
          savingsVsBase: quote.savingsVsBase,
        }),
      },
    });
  } catch (error) {
    console.error("[checkout]", error);
    return NextResponse.json(
      { error: "無法建立綠界付款訂單，請確認金流設定" },
      { status: 500 }
    );
  }
}
