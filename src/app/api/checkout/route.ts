import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { buildAutoSubmitHtml, buildCheckoutParams } from "@/lib/ecpay";
import { isNovaModuleId, NOVA_MODULE_IDS, REFERRAL_CONFIG } from "@/lib/novaos";
import { getSiteUrl } from "@/lib/site";
import {
  PLAN_CATALOG,
  getCheckoutAmount,
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

    const { data: profile } = await supabase
      .from("profiles")
      .select(
        "is_early_bird, discount_tier, referral_discount_used, referral_credit_balance, referred_by"
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

    const amount = getCheckoutAmount(plan, cycle, {
      discountTier: profile?.discount_tier,
      isEarlyBird: profile?.is_early_bird,
      referralFirstDiscount: Boolean(referrerId),
      applyCredit,
    });

    // Persist selected module for basic plan
    if (plan === "starter") {
      const mod = isNovaModuleId(parsed.data.module || "")
        ? parsed.data.module!
        : "store";
      await supabase
        .from("profiles")
        .update({ active_modules: [mod] })
        .eq("id", user.id);
    } else if (plan === "unlimited") {
      await supabase
        .from("profiles")
        .update({ active_modules: [...NOVA_MODULE_IDS] })
        .eq("id", user.id);
    }

    const catalog = PLAN_CATALOG[plan];
    const cycleLabel = getCycleLabel(cycle);
    const earlyBird =
      profile?.discount_tier === "lifetime_special" || profile?.is_early_bird;

    const baseUrl = getSiteUrl();
    const stamp = Date.now().toString(36).toUpperCase();
    const uid = user.id.replace(/-/g, "").slice(0, 8).toUpperCase();
    const merchantTradeNo = `PCP${uid}${stamp}`.slice(0, 20);

    const { paymentUrl, params } = buildCheckoutParams({
      merchantTradeNo,
      totalAmount: amount,
      tradeDesc: `NovaOS ${catalog.name} ${cycleLabel}${
        earlyBird ? " special" : ""
      }`,
      itemName: `NovaOS ${catalog.name} ${cycleLabel}`,
      returnURL: `${baseUrl}/api/checkout/callback`,
      clientBackURL: `${baseUrl}/dashboard/pass?upgraded=pending`,
      customField1: user.id,
      customField2: `${plan}:${cycle}${referrerId ? `:ref` : ""}${
        applyCredit ? `:c${applyCredit}` : ""
      }`,
    });

    const html = buildAutoSubmitHtml(paymentUrl, params);
    return new NextResponse(html, {
      status: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "no-store",
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
