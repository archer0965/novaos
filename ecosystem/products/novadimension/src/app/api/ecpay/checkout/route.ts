import { NextResponse } from "next/server";
import { getNovaOsCheckoutUrl, NOVAOS_HUB_URL } from "@/lib/novaos-hub";
import { SITE_URL } from "@/lib/site";
import type { PricingPlanId } from "@/lib/constants";
import { PRICING_PLANS } from "@/lib/constants";

/**
 * 付費結帳統一導向拓新雲端主站綠界 ECPay（與 NovaStore 相同模式）。
 * 本站不再自行組 ECPay 表單，避免雙金流／雙商戶。
 */
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      planId?: PricingPlanId;
      accountId?: string;
    };

    const planId = body.planId;
    if (!planId) {
      return NextResponse.json({ error: "缺少方案類型" }, { status: 400 });
    }

    const plan = PRICING_PLANS.find((p) => p.id === planId);
    if (!plan) {
      return NextResponse.json({ error: "無效的方案" }, { status: 400 });
    }

    if (planId === "free" || !plan.paid) {
      return NextResponse.json({
        ok: true,
        free: true,
        message: "免費方案無需付款，請直接前往生成體驗區使用 1 次 Credit。",
        redirectTo: "/#studio",
      });
    }

    const checkoutUrl = getNovaOsCheckoutUrl({
      planId,
      returnTo: `${SITE_URL}/?paid=1&plan=${planId}#studio`,
    });

    return NextResponse.json({
      ok: true,
      unified: true,
      gateway: "novaos-ecpay",
      hub: NOVAOS_HUB_URL,
      checkoutUrl,
      plan: {
        id: plan.id,
        name: plan.name,
        price: plan.price,
      },
      message: "將導向拓新雲端統一金流（綠界 ECPay）完成付款。",
    });
  } catch (error) {
    console.error("ecpay checkout error", error);
    return NextResponse.json({ error: "無法建立付款導向" }, { status: 500 });
  }
}
