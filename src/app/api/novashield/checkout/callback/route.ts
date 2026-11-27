import { NextResponse } from "next/server";
import { verifyCheckMacValueAuto } from "@/lib/ecpay";
import { sendNovaShieldSubscriptionConfirmedEmail } from "@/lib/novashield/billingEmail";
import {
  activateNovaShieldProSubscription,
  claimNovaShieldEcpayTrade,
  releaseNovaShieldEcpayTradeClaim,
} from "@/lib/novashield/db";
import {
  normalizeBillingCycle,
  NOVASHIELD_PRICES,
} from "@/lib/novashield/subscription";
import type { BillingCycle } from "@/lib/novashield/types";
import { sanitizeShopId } from "@/lib/novashield/validation";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

async function parseBody(request: Request): Promise<Record<string, string>> {
  const contentType = request.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    const json = (await request.json()) as Record<string, unknown>;
    return Object.fromEntries(
      Object.entries(json).map(([k, v]) => [k, String(v ?? "")]),
    );
  }
  const form = await request.formData();
  const params: Record<string, string> = {};
  form.forEach((value, key) => {
    params[key] = String(value);
  });
  return params;
}

function parseCycleField(raw: string): BillingCycle {
  const parts = (raw || "").split(":");
  return normalizeBillingCycle(parts[2] || parts[1]);
}

export async function POST(request: Request) {
  try {
    const params = await parseBody(request);

    if (!verifyCheckMacValueAuto(params)) {
      console.error("[novashield/ecpay/callback] CheckMacValue mismatch");
      return new NextResponse("0|CheckMacValueError", { status: 400 });
    }

    const rtnCode = params.RtnCode;
    const tradeNo = (params.MerchantTradeNo || "").trim();
    const shopId = sanitizeShopId(params.CustomField1 || "");
    const cycle = parseCycleField(params.CustomField2 || "");
    const expectedAmount = NOVASHIELD_PRICES[cycle];
    const paidAmount = Math.round(
      Number(params.TradeAmt || params.TotalAmount || 0),
    );

    if (rtnCode !== "1") {
      console.warn(
        "[novashield/ecpay/callback] payment not success",
        rtnCode,
        tradeNo,
      );
      return new NextResponse("1|OK", { status: 200 });
    }

    if (!shopId) {
      console.error("[novashield/ecpay/callback] missing valid shopId");
      return new NextResponse("0|MissingShopId", { status: 400 });
    }

    if (paidAmount > 0 && paidAmount !== expectedAmount) {
      console.error(
        "[novashield/ecpay/callback] amount mismatch",
        paidAmount,
        expectedAmount,
        tradeNo,
      );
      return new NextResponse("0|AmountMismatch", { status: 400 });
    }

    let claimed = false;
    if (tradeNo) {
      claimed = await claimNovaShieldEcpayTrade({
        merchantTradeNo: tradeNo,
        shopId,
        billingCycle: cycle,
        amount: paidAmount || expectedAmount,
        rtnCode,
      });
      if (!claimed) {
        console.info(
          "[novashield/ecpay/callback] duplicate trade ignored",
          tradeNo,
        );
        return new NextResponse("1|OK", {
          status: 200,
          headers: { "Content-Type": "text/plain; charset=utf-8" },
        });
      }
    }

    let upgraded;
    try {
      upgraded = await activateNovaShieldProSubscription({ shopId, cycle });
    } catch (upgradeError) {
      if (claimed && tradeNo) {
        await releaseNovaShieldEcpayTradeClaim(tradeNo).catch(() => {});
      }
      throw upgradeError;
    }

    if (upgraded.emailNotification && upgraded.planExpiresAt) {
      await sendNovaShieldSubscriptionConfirmedEmail({
        to: upgraded.emailNotification,
        shopId: upgraded.shopId,
        shopName: upgraded.shopName,
        billingCycle: cycle,
        expiresAt: upgraded.planExpiresAt,
      }).catch((mailError) => {
        console.error(
          "[novashield/ecpay/callback] confirm mail failed",
          mailError,
        );
      });
    }

    return new NextResponse("1|OK", {
      status: 200,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  } catch (error) {
    console.error("[novashield/ecpay/callback]", error);
    return new NextResponse("0|ServerError", { status: 500 });
  }
}
