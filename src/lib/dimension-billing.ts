/**
 * 拓維空間（NovaDimension）付費方案 — hub 權威價目（與產品站 PRICING_PLANS 對齊，勿擅自改價）。
 * 付款成功後由 checkout callback POST 產品站 /api/credits/fulfill。
 */

export const DIMENSION_SITE_URL =
  process.env.NEXT_PUBLIC_NOVA_DIMENSION_URL?.replace(/\/$/, "") ||
  "https://novadimension.vercel.app";

export type DimensionPaidPlanId =
  | "single"
  | "monthly"
  | "halfyear"
  | "yearly";

export const DIMENSION_PAID_PLANS: Record<
  DimensionPaidPlanId,
  { name: string; amount: number; blurb: string }
> = {
  single: { name: "單張體驗", amount: 39, blurb: "1 次高清擬真預覽" },
  monthly: { name: "尊榮月繳", amount: 299, blurb: "月繳無限生成" },
  halfyear: { name: "半年方案", amount: 1614, blurb: "半年無限生成" },
  yearly: { name: "年繳方案", amount: 3049, blurb: "年繳無限生成" },
};

export function isDimensionPaidPlanId(
  raw: string | null | undefined
): raw is DimensionPaidPlanId {
  return (
    raw === "single" ||
    raw === "monthly" ||
    raw === "halfyear" ||
    raw === "yearly"
  );
}

/** Encode ECPay CustomField2 for dimension purchases. */
export function encodeDimensionPlanField(planId: DimensionPaidPlanId): string {
  return `dim:${planId}`;
}

export function parseDimensionPlanField(
  raw: string | null | undefined
): DimensionPaidPlanId | null {
  const parts = String(raw || "").split(":");
  if (parts[0] !== "dim") return null;
  return isDimensionPaidPlanId(parts[1]) ? parts[1] : null;
}

/**
 * Notify NovaDimension to grant credits / subscription after ECPay success.
 * Never throws — callback must still ack ECPay.
 */
export async function fulfillDimensionCredits(input: {
  accountId: string;
  planId: DimensionPaidPlanId;
  paymentId: string;
}): Promise<{ ok: boolean; status: number; body: string }> {
  const secret =
    process.env.CREDITS_FULFILL_SECRET?.trim() ||
    process.env.NOVAOS_FULFILL_SECRET?.trim() ||
    "";
  if (!secret) {
    console.error(
      "[dimension-fulfill] missing CREDITS_FULFILL_SECRET / NOVAOS_FULFILL_SECRET"
    );
    return { ok: false, status: 503, body: "NO_FULFILL_SECRET" };
  }

  const url = `${DIMENSION_SITE_URL}/api/credits/fulfill`;
  const payload = JSON.stringify({
    accountId: input.accountId,
    planId: input.planId,
    paymentId: input.paymentId,
    paymentStatus: "success",
    success: true,
  });

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${secret}`,
      },
      body: payload,
      signal: AbortSignal.timeout(15000),
    });
    const text = await res.text();
    if (!res.ok) {
      console.error("[dimension-fulfill] failed", res.status, text.slice(0, 400));
    }
    return { ok: res.ok, status: res.status, body: text.slice(0, 800) };
  } catch (error) {
    console.error("[dimension-fulfill] network", error);
    return {
      ok: false,
      status: 0,
      body: error instanceof Error ? error.message : "network_error",
    };
  }
}
