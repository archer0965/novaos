import { NextResponse } from "next/server";
import { SPACE_TYPES } from "@/lib/constants";
import { incrementMetric } from "@/lib/analytics-store";
import {
  notifyNewConsultation,
  type ConsultationPayload,
} from "@/lib/notify-consultation";
import { rateLimit } from "@/lib/rate-limit";

function clientKey(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() || "unknown";
  return request.headers.get("x-real-ip") || "unknown";
}

export async function POST(request: Request) {
  try {
    const limited = rateLimit(`consult:${clientKey(request)}`, 5, 60_000);
    if (!limited.ok) {
      return NextResponse.json(
        { error: "送出過於頻繁，請稍後再試。" },
        {
          status: 429,
          headers: { "Retry-After": String(limited.retryAfterSec) },
        },
      );
    }

    const body = (await request.json()) as Partial<ConsultationPayload> & {
      website?: string;
    };

    if (body.website) {
      return NextResponse.json({ ok: true }, { status: 201 });
    }

    const name = body.name?.trim() ?? "";
    const instagram = body.instagram?.trim() ?? "";
    const spaceType = body.spaceType?.trim() ?? "";
    const spaceNote = body.spaceNote?.trim() ?? "";

    if (!name || !instagram || !spaceType) {
      return NextResponse.json(
        { error: "請填寫稱呼、Instagram 帳號，並選擇空間類型。" },
        { status: 400 },
      );
    }

    if (!SPACE_TYPES.includes(spaceType as (typeof SPACE_TYPES)[number])) {
      return NextResponse.json({ error: "空間類型不正確。" }, { status: 400 });
    }

    if (name.length > 40 || instagram.length > 60 || spaceNote.length > 500) {
      return NextResponse.json({ error: "欄位內容過長。" }, { status: 400 });
    }

    const payload = { name, instagram, spaceType, spaceNote };

    try {
      await notifyNewConsultation(payload);
    } catch (notifyError) {
      console.error("Failed to notify consultation", notifyError);
      return NextResponse.json(
        { error: "通知寄送失敗，請稍後再試或直接私訊 IG。" },
        { status: 502 },
      );
    }

    void incrementMetric("consultations").catch(() => undefined);

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "無法送出預約，請稍後再試。";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
