import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { reportTelemetry } from "@/lib/telemetry";

export const runtime = "nodejs";

/**
 * Record renew intent and return hub checkout deep-link.
 * Actual entitlement update happens only after ECPay callback (backend).
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
    plan?: string;
    cycle?: string;
  };

  const admin = createAdminClient();
  const { data: profile } = await admin
    .from("profiles")
    .select("plan_type, billing_cycle, expires_at")
    .eq("id", user.id)
    .maybeSingle();

  const plan = body.plan || profile?.plan_type || "starter";
  const cycle = body.cycle || profile?.billing_cycle || "monthly";

  await reportTelemetry({
    source: "api/billing/renew-intent",
    kind: "billing",
    severity: "info",
    message: "renew_intent",
    userId: user.id,
    product: "hub",
    meta: { plan, cycle, previousExpires: profile?.expires_at || null },
  });

  const checkoutUrl = `https://paycheck.com.de/dashboard/pass#upgrade`;

  return NextResponse.json({
    ok: true,
    message: "請至訂閱中控完成綠界付款；權益僅在付款成功回調後更新。",
    checkoutUrl,
    plan,
    cycle,
  });
}
