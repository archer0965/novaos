import { NextResponse } from "next/server";
import { buildAutoSubmitHtml, buildCheckoutParams } from "@/lib/ecpay";
import { getSiteUrl } from "@/lib/site";
import {
  getNovaShieldShop,
  NovaShieldDbUnavailableError,
  upsertNovaShieldShopSettings,
} from "@/lib/novashield/db";
import {
  getCycleLabel,
  normalizeBillingCycle,
  NOVASHIELD_BASE_PATH,
  NOVASHIELD_PRICES,
} from "@/lib/novashield/subscription";
import { isValidEmail, sanitizeShopId } from "@/lib/novashield/validation";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

interface CheckoutBody {
  shopId?: string;
  cycle?: string;
  emailNotification?: string;
  shopName?: string;
}

async function parseCheckoutInput(request: Request): Promise<CheckoutBody> {
  const contentType = request.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return (await request.json().catch(() => ({}))) as CheckoutBody;
  }
  const form = await request.formData();
  return {
    shopId: String(form.get("shopId") ?? ""),
    cycle: String(form.get("cycle") ?? "monthly"),
    emailNotification: String(form.get("emailNotification") ?? ""),
    shopName: String(form.get("shopName") ?? ""),
  };
}

export async function POST(request: Request) {
  try {
    const body = await parseCheckoutInput(request);
    const shopId = sanitizeShopId(body.shopId || "");
    if (!shopId) {
      return NextResponse.json(
        { error: "缺少有效的門市代碼（shopId）。" },
        { status: 400 },
      );
    }

    const cycle = normalizeBillingCycle(body.cycle);
    const totalAmount = NOVASHIELD_PRICES[cycle];
    const email = (body.emailNotification || "").trim();

    if (!email || !isValidEmail(email)) {
      return NextResponse.json(
        { error: "請填寫有效的店家 Email（用於付款開通與到期前 3 天續費提醒）。" },
        { status: 400 },
      );
    }

    let shopName = (body.shopName || "").trim();
    try {
      const saved = await upsertNovaShieldShopSettings(shopId, {
        emailNotification: email,
        ...(shopName ? { shopName } : {}),
      });
      shopName = saved.shopName;
    } catch (error) {
      if (!(error instanceof NovaShieldDbUnavailableError)) {
        const existing = await getNovaShieldShop(shopId).catch(() => null);
        shopName = existing?.shopName || shopName || shopId;
      } else {
        shopName = shopName || shopId;
      }
    }

    const baseUrl = getSiteUrl();
    const stamp = Date.now().toString(36).toUpperCase();
    const shopTag =
      shopId.replace(/[^a-zA-Z0-9]/g, "").slice(0, 6).toUpperCase() || "SHOP";
    const merchantTradeNo = `NVS${shopTag}${stamp}`.slice(0, 20);
    const cycleLabel = getCycleLabel(cycle);

    const { paymentUrl, params } = buildCheckoutParams({
      merchantTradeNo,
      totalAmount,
      tradeDesc: `NovaOS NovaShield 專業版 ${cycleLabel}`,
      itemName: `Nova商譽寶 專業版 ${cycleLabel} (${shopName})`,
      returnURL: `${baseUrl}/api/novashield/checkout/callback`,
      clientBackURL: `${baseUrl}${NOVASHIELD_BASE_PATH}/admin?shop=${encodeURIComponent(shopId)}&payment=pending`,
      customField1: shopId,
      customField2: `novashield:pro:${cycle}`,
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
    console.error("[novaos/novashield/checkout]", error);
    return NextResponse.json(
      { error: "無法建立綠界付款訂單，請確認金流設定。" },
      { status: 500 },
    );
  }
}
