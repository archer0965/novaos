import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  buildAutoSubmitHtml,
  buildCheckoutParams,
  checkEcpayGatewayHealth,
} from "@/lib/ecpay";
import {
  listActivationsForSeller,
  resolveSellerPricingTier,
} from "@/lib/module-activation";
import {
  isNovaModuleId,
  REFERRAL_CONFIG,
  type NovaModuleId,
} from "@/lib/novaos";
import {
  buildAiDocCheckoutQuote,
  buildCheckoutQuote,
  type AiDocPaidPlanKey,
} from "@/lib/pricing-tiers";
import { getSiteUrl } from "@/lib/site";
import {
  DIMENSION_PAID_PLANS,
  DIMENSION_SITE_URL,
  encodeDimensionPlanField,
  isDimensionPaidPlanId,
} from "@/lib/dimension-billing";
import {
  PLAN_CATALOG,
  getCycleLabel,
  isPaidPlan,
  normalizeBillingCycle,
  type BillingCycle,
  type PaidPlanKey,
} from "@/types/database";

const bodySchema = z.object({
  plan: z.enum([
    "starter",
    "pro",
    "unlimited",
    "plus",
    "premium",
    "business",
    /** 拓維空間方案 id（catalog=dimension） */
    "single",
    "monthly",
    "halfyear",
    "yearly",
  ]),
  cycle: z
    .enum(["monthly", "half_yearly", "yearly", "halfYearly"])
    .default("monthly"),
  module: z.string().optional(),
  /** ai_doc / dimension catalogs use independent pricing */
  catalog: z.enum(["novaos", "ai_doc", "dimension"]).optional(),
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

    const gateway = await checkEcpayGatewayHealth();
    if (!gateway.ok) {
      return NextResponse.json(
        {
          error: gateway.message,
          code: gateway.code || "ECPAY_GATEWAY",
          gateway,
        },
        { status: 503 }
      );
    }

    const json = await request.json().catch(() => ({}));
    const parsed = bodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "請選擇有效的方案與計費週期" },
        { status: 400 }
      );
    }

    const moduleRaw = parsed.data.module || "";
    const selectedModule: NovaModuleId | null = isNovaModuleId(moduleRaw)
      ? moduleRaw
      : null;

    const planRaw = parsed.data.plan;
    const catalog =
      parsed.data.catalog === "dimension" ||
      moduleRaw === "dimension" ||
      isDimensionPaidPlanId(planRaw)
        ? "dimension"
        : parsed.data.catalog === "ai_doc" || selectedModule === "ai_doc"
          ? "ai_doc"
          : "novaos";

    const cycle = normalizeBillingCycle(parsed.data.cycle) as BillingCycle;

    const baseUrl = getSiteUrl();
    const stamp = Date.now().toString(36).toUpperCase();
    const uid = user.id.replace(/-/g, "").slice(0, 8).toUpperCase();
    const merchantTradeNo = `PCP${uid}${stamp}`.slice(0, 20);

    // 拓維空間：固定價目，付款成功後由 callback → /api/credits/fulfill
    if (catalog === "dimension") {
      if (!isDimensionPaidPlanId(planRaw)) {
        return NextResponse.json(
          { error: "請選擇有效的拓維空間方案" },
          { status: 400 }
        );
      }
      const dim = DIMENSION_PAID_PLANS[planRaw];
      const { paymentUrl, params } = buildCheckoutParams({
        merchantTradeNo,
        totalAmount: dim.amount,
        tradeDesc: `NovaOS 拓維空間 ${dim.name}`,
        itemName: `NovaOS Dimension ${dim.name} x1`,
        returnURL: `${baseUrl}/api/checkout/callback`,
        clientBackURL: `${DIMENSION_SITE_URL}/?paid=1&plan=${planRaw}#studio`,
        customField1: user.id,
        customField2: encodeDimensionPlanField(planRaw),
      });
      const html = buildAutoSubmitHtml(paymentUrl, params);
      return new NextResponse(html, {
        status: 200,
        headers: {
          "Content-Type": "text/html; charset=utf-8",
          "Cache-Control": "no-store",
          "X-NovaOS-Quote": JSON.stringify({
            catalog: "dimension",
            planId: planRaw,
            finalAmount: dim.amount,
          }),
        },
      });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select(
        "is_early_bird, discount_tier, is_ambassador, referral_discount_used, referral_credit_balance, referred_by, active_modules"
      )
      .eq("id", user.id)
      .maybeSingle();

    let referrerId: string | null = null;
    const code = (parsed.data.referralCode || "").trim().toUpperCase();
    const canUseReferral =
      Boolean(code) && !profile?.referral_discount_used && !profile?.referred_by;

    if (canUseReferral) {
      const admin = createAdminClient();
      const { data: byCode } = await admin
        .from("profiles")
        .select("id, referral_code")
        .eq("referral_code", code)
        .maybeSingle();
      if (byCode && byCode.id !== user.id) {
        referrerId = byCode.id;
        await admin
          .from("profiles")
          .update({ referred_by: byCode.id })
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

    if (catalog === "ai_doc") {
      const aiPlan: AiDocPaidPlanKey =
        planRaw === "business" ? "business" : "pro";
      const tier = resolveSellerPricingTier({
        profile: profile || {},
        activations,
        moduleId: "ai_doc",
      });
      const quote = buildAiDocCheckoutQuote({
        plan: aiPlan,
        cycle,
        tier,
        referralFirstDiscount: Boolean(referrerId),
        applyCredit,
      });

      // Do NOT unlock modules before ECPay success — callback grants access.

      const planLabel =
        aiPlan === "business" ? "Nova AI Doc 商業版" : "Nova AI Doc 專業版";
      const cycleLabel = getCycleLabel(cycle);
      const { paymentUrl, params } = buildCheckoutParams({
        merchantTradeNo,
        totalAmount: quote.finalAmount,
        tradeDesc: `NovaOS ${planLabel} ${cycleLabel} ${tier}`,
        itemName: `NovaOS ${planLabel} ${cycleLabel}`,
        returnURL: `${baseUrl}/api/checkout/callback`,
        clientBackURL: `${baseUrl}/dashboard/ai-doc?upgraded=pending`,
        customField1: user.id,
        customField2: `ai:${aiPlan}:${cycle}:t${tier}${
          referrerId ? `:ref` : ""
        }${applyCredit ? `:c${applyCredit}` : ""}`,
      });

      const html = buildAutoSubmitHtml(paymentUrl, params);
      return new NextResponse(html, {
        status: 200,
        headers: {
          "Content-Type": "text/html; charset=utf-8",
          "Cache-Control": "no-store",
          "X-NovaOS-Quote": JSON.stringify({
            catalog: "ai_doc",
            baseAmount: quote.baseAmount,
            tierAmount: quote.tierAmount,
            finalAmount: quote.finalAmount,
            tier: quote.tier,
            foldLabel: quote.foldLabel,
          }),
        },
      });
    }

    // NovaOS 拓脈／NovaStore（及旗艦全家桶）— 價格結構不變
    const plan: PaidPlanKey =
      planRaw === "plus"
        ? "starter"
        : planRaw === "premium"
          ? "unlimited"
          : planRaw === "pro"
            ? "starter"
            : planRaw === "business"
              ? "unlimited"
              : (planRaw as PaidPlanKey);

    if (!isPaidPlan(plan)) {
      return NextResponse.json({ error: "無效的付費方案" }, { status: 400 });
    }

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

    // Do NOT unlock modules before ECPay success — callback grants access.
    // Encode selected module in CustomField2 so callback can apply it.
    const starterModule =
      plan === "starter" ? selectedModule || "store" : null;

    const catalogPlan = PLAN_CATALOG[plan];
    const cycleLabel = getCycleLabel(cycle);
    const { paymentUrl, params } = buildCheckoutParams({
      merchantTradeNo,
      totalAmount: quote.finalAmount,
      tradeDesc: `NovaOS ${catalogPlan.name} ${cycleLabel} ${tier}`,
      itemName: `NovaOS ${catalogPlan.name} ${cycleLabel}`,
      returnURL: `${baseUrl}/api/checkout/callback`,
      clientBackURL: `${baseUrl}/dashboard/pass?upgraded=pending`,
      customField1: user.id,
      customField2: `${plan}:${cycle}:t${tier}${
        starterModule ? `:m${starterModule}` : ""
      }${referrerId ? `:ref` : ""}${applyCredit ? `:c${applyCredit}` : ""}`,
    });

    const html = buildAutoSubmitHtml(paymentUrl, params);
    return new NextResponse(html, {
      status: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "no-store",
        "X-NovaOS-Quote": JSON.stringify({
          catalog: "novaos",
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
