import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getUserEmailById } from "@/lib/admin";
import { verifyCheckMacValueAuto } from "@/lib/ecpay";
import { sendSubscriptionConfirmedEmail } from "@/lib/email";
import { sendLineTextMessage } from "@/lib/line";
import {
  buildProrationUpgradeUpdate,
  buildSubscriptionUpdate,
  formatExpiresAtTaipei,
} from "@/lib/subscription";
import { getSiteUrl } from "@/lib/site";
import {
  getPlanDisplayName,
  isPaidPlan,
  normalizeBillingCycle,
  normalizePlan,
  type BillingCycle,
  type PaidPlanKey,
} from "@/types/database";

async function parseBody(request: Request): Promise<Record<string, string>> {
  const contentType = request.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    const json = await request.json();
    return Object.fromEntries(
      Object.entries(json).map(([k, v]) => [k, String(v ?? "")])
    );
  }

  const form = await request.formData();
  const params: Record<string, string> = {};
  form.forEach((value, key) => {
    params[key] = String(value);
  });
  return params;
}

function parsePlanField(raw: string): {
  mode: "purchase" | "upgrade";
  catalog: "novaos" | "ai_doc";
  plan: PaidPlanKey | "pro" | "business";
  aiPlan?: "pro" | "business";
  cycle: BillingCycle;
} {
  const parts = (raw || "pro:monthly").split(":");
  if (parts[0] === "ai") {
    const aiPlan = parts[1] === "business" ? "business" : "pro";
    const cycle = normalizeBillingCycle(parts[2]);
    return {
      mode: "purchase",
      catalog: "ai_doc",
      plan: aiPlan,
      aiPlan,
      cycle,
    };
  }
  if (parts[0] === "upgrade") {
    const plan = normalizePlan(parts[1]);
    const paid: PaidPlanKey = isPaidPlan(plan) ? plan : "pro";
    const cycle = normalizeBillingCycle(parts[2]);
    return { mode: "upgrade", catalog: "novaos", plan: paid, cycle };
  }
  const plan = normalizePlan(parts[0]);
  const paid: PaidPlanKey = isPaidPlan(plan) ? plan : "pro";
  const cycle = normalizeBillingCycle(parts[1]);
  return { mode: "purchase", catalog: "novaos", plan: paid, cycle };
}

export async function POST(request: Request) {
  try {
    const params = await parseBody(request);

    if (!verifyCheckMacValueAuto(params)) {
      console.error("[ecpay/callback] CheckMacValue mismatch");
      return new NextResponse("0|CheckMacValueError", { status: 400 });
    }

    const rtnCode = params.RtnCode;
    const sellerId = params.CustomField1;
    const tradeNo = params.MerchantTradeNo;
    const parsedPlan = parsePlanField(params.CustomField2 || "");
    const { mode, cycle, catalog } = parsedPlan;

    if (rtnCode !== "1") {
      console.warn("[ecpay/callback] payment not success", rtnCode, tradeNo);
      return new NextResponse("1|OK", { status: 200 });
    }

    if (!sellerId) {
      console.error("[ecpay/callback] missing CustomField1 (seller id)");
      return new NextResponse("0|MissingSeller", { status: 400 });
    }

    const admin = createAdminClient();

    // AI Doc 獨立訂閱：更新 docmate_profiles（共用 Auth）
    if (catalog === "ai_doc" && parsedPlan.aiPlan) {
      const aiPlan = parsedPlan.aiPlan;
      const period = new Intl.DateTimeFormat("en-CA", {
        timeZone: "Asia/Taipei",
        year: "numeric",
        month: "2-digit",
      }).format(new Date());

      const { error: aiErr } = await admin.from("docmate_profiles").upsert(
        {
          id: sellerId,
          plan: aiPlan,
          usage_period: period,
        },
        { onConflict: "id" }
      );
      if (aiErr) {
        console.error("[ecpay/callback] docmate_profiles update failed", aiErr);
        return new NextResponse("0|AiDocUpdateFailed", { status: 500 });
      }

      // Ensure module unlocked on NovaOS side
      const { data: prof } = await admin
        .from("profiles")
        .select("active_modules")
        .eq("id", sellerId)
        .maybeSingle();
      const mods = Array.isArray(prof?.active_modules)
        ? (prof!.active_modules as string[])
        : [];
      await admin
        .from("profiles")
        .update({
          active_modules: Array.from(new Set([...mods, "ai_doc", "pass"])),
        })
        .eq("id", sellerId);

      console.info("[ecpay/callback] ai_doc", sellerId, aiPlan, cycle, tradeNo);
      return new NextResponse("1|OK", {
        status: 200,
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      });
    }

    const plan: PaidPlanKey = isPaidPlan(parsedPlan.plan)
      ? (parsedPlan.plan as PaidPlanKey)
      : "starter";

    // Claim this MerchantTradeNo first so concurrent ECPay retries don't double-apply.
    // If profile update fails below, we delete the claim so ECPay can safely retry.
    let claimedTrade = false;
    if (tradeNo) {
      const { error: dedupeError } = await admin
        .from("ecpay_processed_trades")
        .insert({
          merchant_trade_no: tradeNo,
          seller_id: sellerId,
          rtn_code: rtnCode,
          plan_field: params.CustomField2 || null,
        });

      if (dedupeError) {
        // Unique violation = already claimed/processed — ack without extending again
        if (dedupeError.code === "23505") {
          console.info("[ecpay/callback] duplicate trade ignored", tradeNo);
          return new NextResponse("1|OK", {
            status: 200,
            headers: { "Content-Type": "text/plain; charset=utf-8" },
          });
        }
        // Table missing / other — log and continue (backward compatible)
        console.warn(
          "[ecpay/callback] trade dedupe skipped:",
          dedupeError.code || dedupeError.message
        );
      } else {
        claimedTrade = true;
      }
    }

    const releaseTradeClaim = async () => {
      if (!claimedTrade || !tradeNo) return;
      const { error: releaseError } = await admin
        .from("ecpay_processed_trades")
        .delete()
        .eq("merchant_trade_no", tradeNo);
      if (releaseError) {
        console.error(
          "[ecpay/callback] failed to release trade claim",
          tradeNo,
          releaseError
        );
      }
    };

    const { data: current, error: readError } = await admin
      .from("profiles")
      .select(
        "id, expires_at, plan_type, shop_name, line_user_id, line_channel_access_token"
      )
      .eq("id", sellerId)
      .maybeSingle();

    if (readError) {
      console.error("[ecpay/callback] read profile failed", readError);
      await releaseTradeClaim();
      return new NextResponse("0|ReadFailed", { status: 500 });
    }

    let update: Record<string, unknown>;

    if (mode === "upgrade") {
      // Keep original expires_at so remaining days are not wiped
      const keepExpiresAt =
        current?.expires_at &&
        new Date(current.expires_at).getTime() > Date.now()
          ? current.expires_at
          : null;

      if (!keepExpiresAt) {
        // Safety fallback: treat as fresh purchase period
        update = buildSubscriptionUpdate({
          plan,
          cycle,
          currentExpiresAt: current?.expires_at ?? null,
        });
      } else {
        update = buildProrationUpgradeUpdate({
          toPlan: plan,
          cycle,
          keepExpiresAt,
        });
      }
    } else {
      update = buildSubscriptionUpdate({
        plan,
        cycle,
        currentExpiresAt: current?.expires_at ?? null,
      });
    }

    const fieldParts = (params.CustomField2 || "").split(":");
    const usedReferralFlag = fieldParts.includes("ref");
    const creditToken = fieldParts.find((p) => /^c\d+$/.test(p));
    const creditUsed = creditToken ? Number(creditToken.slice(1)) : 0;

    if (usedReferralFlag) {
      update.referral_discount_used = true;
    }

    // Unlock paid modules only after successful payment (not at checkout start).
    const fieldPartsForModules = (params.CustomField2 || "").split(":");
    const moduleToken = fieldPartsForModules.find((p) => /^m[a-z_]+$/.test(p));
    const starterModuleFromField = moduleToken
      ? moduleToken.slice(1)
      : "store";
    if (plan === "starter" || plan === "pro") {
      update.active_modules = [starterModuleFromField, "pass"];
    } else if (plan === "unlimited") {
      update.active_modules = ["booking", "store", "ai_doc", "pass"];
    }

    const { error } = await admin
      .from("profiles")
      .update(update)
      .eq("id", sellerId);

    if (error) {
      console.error("[ecpay/callback] upgrade failed", error);
      await releaseTradeClaim();
      return new NextResponse("0|UpgradeFailed", { status: 500 });
    }

    // Referral rewards / credit consumption (best-effort)
    try {
      const { data: paidProfile } = await admin
        .from("profiles")
        .select("id, referred_by, referral_credit_balance, referral_discount_used")
        .eq("id", sellerId)
        .maybeSingle();

      if (creditUsed > 0) {
        const bal = Math.max(
          0,
          Number(paidProfile?.referral_credit_balance || 0) - creditUsed
        );
        await admin
          .from("profiles")
          .update({ referral_credit_balance: bal })
          .eq("id", sellerId);
      }

      if (paidProfile?.referred_by && usedReferralFlag) {
        const { error: refErr } = await admin.from("referral_events").insert({
          referrer_id: paidProfile.referred_by,
          referee_id: sellerId,
          credit_amount: 100,
        });
        if (!refErr || refErr.code === "23505") {
          if (!refErr) {
            const { data: referrer } = await admin
              .from("profiles")
              .select("referral_credit_balance")
              .eq("id", paidProfile.referred_by)
              .maybeSingle();
            await admin
              .from("profiles")
              .update({
                referral_credit_balance:
                  Number(referrer?.referral_credit_balance || 0) + 100,
              })
              .eq("id", paidProfile.referred_by);
          }
        } else {
          console.warn("[ecpay/callback] referral ledger", refErr);
        }
      }
    } catch (refError) {
      console.error("[ecpay/callback] referral reward failed", refError);
    }

    console.info(
      "[ecpay/callback]",
      mode,
      sellerId,
      plan,
      cycle,
      "expires_at=",
      update.expires_at,
      "from=",
      current?.expires_at,
      tradeNo
    );

    // Notify seller (email + optional LINE). Failures must not break ECPay ack.
    try {
      const expiresAt = String(update.expires_at || "");
      const email = await getUserEmailById(sellerId);
      if (email && expiresAt) {
        const mail = await sendSubscriptionConfirmedEmail({
          to: email,
          shopName: current?.shop_name,
          planType: plan,
          billingCycle: cycle,
          expiresAt,
          mode,
        });
        if (!mail.ok && !mail.skipped) {
          console.error("[ecpay/callback] confirm mail failed", mail.error);
        }
      }

      if (current?.line_user_id && expiresAt) {
        const baseUrl = getSiteUrl();
        await sendLineTextMessage(
          current.line_user_id,
          [
            mode === "upgrade"
              ? "✅ 方案升級成功"
              : "✅ 訂閱／續費成功",
            `方案：${getPlanDisplayName(plan)}`,
            `到期日（台北）：${formatExpiresAtTaipei(expiresAt)}`,
            `後台：${baseUrl}/dashboard`,
          ].join("\n"),
          { accessToken: current.line_channel_access_token }
        );
      }
    } catch (notifyError) {
      console.error("[ecpay/callback] notify failed", notifyError);
    }

    return new NextResponse("1|OK", {
      status: 200,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  } catch (error) {
    console.error("[ecpay/callback]", error);
    return new NextResponse("0|ServerError", { status: 500 });
  }
}
