import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { reportTelemetry } from "@/lib/telemetry";

export const runtime = "nodejs";

/**
 * Cancel NovaOS paid subscription (hub-authoritative).
 * Soft-cancel: marks cancelled_at, keeps access until expires_at unless immediate.
 * Does not call ECPay period cancel API here — ops/manual period stop may follow.
 */
export async function POST(request: Request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => ({}))) as {
    immediate?: boolean;
    reason?: string;
  };

  const admin = createAdminClient();
  const { data: profile, error } = await admin
    .from("profiles")
    .select("id, plan_type, expires_at, trial_ends_at")
    .eq("id", user.id)
    .maybeSingle();

  if (error || !profile) {
    return NextResponse.json({ error: "profile_not_found" }, { status: 404 });
  }

  const now = new Date().toISOString();
  const immediate = Boolean(body.immediate);
  const patch: Record<string, unknown> = {
    cancelled_at: now,
    cancel_reason: String(body.reason || "").slice(0, 500) || null,
    updated_at: now,
  };

  if (immediate) {
    patch.plan_type = "free";
    patch.expires_at = now;
    patch.active_modules = [];
  }

  const { error: updateError } = await admin
    .from("profiles")
    .update(patch)
    .eq("id", user.id);

  if (updateError) {
    // Column may not exist yet — fall back to expires_at only
    if (/cancelled_at|cancel_reason/i.test(updateError.message)) {
      const fallback = immediate
        ? { plan_type: "free", expires_at: now, active_modules: [] }
        : { expires_at: profile.expires_at };
      const { error: fbErr } = await admin
        .from("profiles")
        .update(fallback)
        .eq("id", user.id);
      if (fbErr) {
        await reportTelemetry({
          source: "api/billing/cancel",
          kind: "billing",
          severity: "error",
          message: fbErr.message,
          userId: user.id,
          product: "hub",
        });
        return NextResponse.json({ error: fbErr.message }, { status: 500 });
      }
    } else {
      await reportTelemetry({
        source: "api/billing/cancel",
        kind: "billing",
        severity: "error",
        message: updateError.message,
        userId: user.id,
        product: "hub",
      });
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }
  }

  await reportTelemetry({
    source: "api/billing/cancel",
    kind: "billing",
    severity: "info",
    message: immediate ? "subscription_cancelled_immediate" : "subscription_cancel_scheduled",
    userId: user.id,
    product: "hub",
    meta: { reason: body.reason || null, previousPlan: profile.plan_type },
  });

  return NextResponse.json({
    ok: true,
    immediate,
    message: immediate
      ? "已立即取消訂閱並降為免費方案"
      : "已登記取消；權益將保留至目前到期日，之後不再自動續費（定期定額請另行於綠界／客服停止）。",
    expiresAt: immediate ? now : profile.expires_at,
    lineSupport: "https://line.me/R/ti/p/@469uykad",
    refundPolicy: "https://paycheck.com.de/refund",
  });
}
