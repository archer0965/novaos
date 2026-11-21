/**
 * Lightweight structured telemetry for NovaOS hub.
 * Events are persisted when Supabase admin is available; always console-logged.
 */

export type TelemetrySeverity = "info" | "warn" | "error" | "fatal";

export type TelemetryEvent = {
  source: string;
  kind:
    | "api_error"
    | "payment_failure"
    | "payment_success"
    | "ai_failure"
    | "notify_failure"
    | "system"
    | "billing";
  message: string;
  severity?: TelemetrySeverity;
  product?: string;
  userId?: string | null;
  meta?: Record<string, unknown>;
};

function safeMeta(meta?: Record<string, unknown>) {
  if (!meta) return {};
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(meta)) {
    if (v == null) continue;
    // Never log secrets
    if (/key|secret|token|password|mac|hash/i.test(k)) continue;
    out[k] = typeof v === "string" && v.length > 500 ? `${v.slice(0, 500)}…` : v;
  }
  return out;
}

/** Fire-and-forget structured log (+ optional DB insert). */
export async function reportTelemetry(event: TelemetryEvent): Promise<void> {
  const payload = {
    ...event,
    severity: event.severity || (event.kind.includes("fail") ? "error" : "info"),
    meta: safeMeta(event.meta),
    at: new Date().toISOString(),
  };

  const line = `[telemetry] ${payload.severity} ${payload.kind} ${payload.source}: ${payload.message}`;
  if (payload.severity === "error" || payload.severity === "fatal") {
    console.error(line, payload.meta);
  } else if (payload.severity === "warn") {
    console.warn(line, payload.meta);
  } else {
    console.info(line, payload.meta);
  }

  try {
    const { createAdminClient } = await import("@/lib/supabase/admin");
    const admin = createAdminClient();
    await admin.from("novaos_telemetry_events").insert({
      source: payload.source,
      kind: payload.kind,
      severity: payload.severity,
      message: payload.message.slice(0, 2000),
      product: payload.product || null,
      user_id: payload.userId || null,
      meta: payload.meta,
      created_at: payload.at,
    });
  } catch {
    // Table may not exist yet — console log is enough
  }
}

export function reportTelemetrySync(event: TelemetryEvent): void {
  void reportTelemetry(event);
}
