import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isAdminEmail } from "@/lib/admin";
import { reportTelemetry, type TelemetryEvent } from "@/lib/telemetry";

export const runtime = "nodejs";

const ALLOWED_KINDS = new Set([
  "api_error",
  "payment_failure",
  "payment_success",
  "ai_failure",
  "notify_failure",
  "system",
  "billing",
]);

/**
 * POST — product sites report errors to hub (unified monitoring).
 * Body: { source, kind, message, severity?, product?, meta? }
 *
 * GET — admin-only recent events (Master Admin / ops).
 */
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Partial<TelemetryEvent> & {
      secret?: string;
    };

    const source = String(body.source || "").trim().slice(0, 120);
    const kind = String(body.kind || "").trim();
    const message = String(body.message || "").trim().slice(0, 2000);

    if (!source || !message || !ALLOWED_KINDS.has(kind)) {
      return NextResponse.json({ error: "invalid_payload" }, { status: 400 });
    }

    // Optional shared secret for product→hub ingestion
    const expected = process.env.NOVAOS_TELEMETRY_SECRET?.trim();
    if (expected && body.secret !== expected) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    let userId: string | null = null;
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      userId = user?.id || null;
    } catch {
      userId = null;
    }

    await reportTelemetry({
      source,
      kind: kind as TelemetryEvent["kind"],
      message,
      severity: body.severity,
      product: body.product,
      userId: body.userId || userId,
      meta: body.meta,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[telemetry] ingest failed", error);
    return NextResponse.json({ error: "ingest_failed" }, { status: 500 });
  }
}

export async function GET(request: Request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !isAdminEmail(user.email)) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const limit = Math.min(
    100,
    Math.max(1, Number(new URL(request.url).searchParams.get("limit") || 40)),
  );

  try {
    const { createAdminClient } = await import("@/lib/supabase/admin");
    const admin = createAdminClient();
    const { data, error } = await admin
      .from("novaos_telemetry_events")
      .select("id, source, kind, severity, message, product, user_id, meta, created_at")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      return NextResponse.json(
        { error: error.message, events: [] },
        { status: 200 },
      );
    }

    return NextResponse.json({ events: data || [] });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "query_failed",
        events: [],
      },
      { status: 200 },
    );
  }
}
