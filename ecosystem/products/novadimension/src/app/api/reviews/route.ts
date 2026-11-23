import { NextResponse } from "next/server";
import { SPACE_TYPES } from "@/lib/constants";
import { incrementMetric } from "@/lib/analytics-store";
import { notifyNewReview } from "@/lib/notify-review";
import { rateLimit } from "@/lib/rate-limit";
import { addReview, readReviews } from "@/lib/reviews-store";

function clientKey(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() || "unknown";
  return request.headers.get("x-real-ip") || "unknown";
}

export async function GET() {
  const payload = await readReviews();
  return NextResponse.json(payload, {
    headers: {
      "Cache-Control": "no-store",
    },
  });
}

export async function POST(request: Request) {
  try {
    const limited = rateLimit(`reviews:${clientKey(request)}`, 5, 60_000);
    if (!limited.ok) {
      return NextResponse.json(
        { error: "送出過於頻繁，請稍後再試。" },
        {
          status: 429,
          headers: { "Retry-After": String(limited.retryAfterSec) },
        },
      );
    }

    const body = (await request.json()) as {
      name?: string;
      space?: string;
      rating?: number;
      quote?: string;
      website?: string;
    };

    // Honeypot: bots often fill hidden fields
    if (body.website) {
      return NextResponse.json({ ok: true }, { status: 201 });
    }

    const name = body.name?.trim() ?? "";
    const space = body.space?.trim() ?? "";
    const quote = body.quote?.trim() ?? "";
    const rating = Number(body.rating);

    if (!name || !space || !quote) {
      return NextResponse.json(
        { error: "請填寫暱稱、空間類型與評論內容。" },
        { status: 400 },
      );
    }

    if (!SPACE_TYPES.includes(space as (typeof SPACE_TYPES)[number])) {
      return NextResponse.json({ error: "空間類型不正確。" }, { status: 400 });
    }

    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: "評分需為 1 到 5 星。" },
        { status: 400 },
      );
    }

    if (name.length > 40 || quote.length > 500) {
      return NextResponse.json(
        { error: "暱稱或評論內容過長。" },
        { status: 400 },
      );
    }

    const review = await addReview({ name, space, rating, quote });
    void incrementMetric("reviews").catch(() => undefined);

    try {
      await notifyNewReview(review);
    } catch (notifyError) {
      console.error("Failed to notify new review", notifyError);
    }

    return NextResponse.json({ review }, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "無法儲存評論，請稍後再試。";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
