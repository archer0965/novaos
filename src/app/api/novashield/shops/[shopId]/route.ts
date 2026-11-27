import { NextRequest, NextResponse } from "next/server";
import {
  getNovaShieldShop,
  NovaShieldDbUnavailableError,
  upsertNovaShieldShopSettings,
} from "@/lib/novashield/db";
import type { ShopConfig } from "@/lib/novashield/types";
import { sanitizeShopId } from "@/lib/novashield/validation";

export const dynamic = "force-dynamic";

const MAX_BODY_BYTES = 2_000_000;

type RouteContext = { params: { shopId: string } };

function errorResponse(error: unknown) {
  if (error instanceof NovaShieldDbUnavailableError) {
    return NextResponse.json(
      { ok: false, error: error.message },
      { status: 503 },
    );
  }
  return NextResponse.json(
    { ok: false, error: "DATABASE_ERROR" },
    { status: 500 },
  );
}

export async function GET(_request: NextRequest, context: RouteContext) {
  const shopId = sanitizeShopId(context.params.shopId || "");
  if (!shopId) {
    return NextResponse.json(
      { ok: false, error: "INVALID_SHOP_ID" },
      { status: 400 },
    );
  }

  try {
    const config = await getNovaShieldShop(shopId);
    if (!config) {
      return NextResponse.json(
        { ok: false, error: "NOT_FOUND" },
        { status: 404 },
      );
    }
    return NextResponse.json({ ok: true, config });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function PUT(request: NextRequest, context: RouteContext) {
  const shopId = sanitizeShopId(context.params.shopId || "");
  if (!shopId) {
    return NextResponse.json(
      { ok: false, error: "INVALID_SHOP_ID" },
      { status: 400 },
    );
  }

  const rawBody = await request.text();
  if (rawBody.length > MAX_BODY_BYTES) {
    return NextResponse.json(
      { ok: false, error: "PAYLOAD_TOO_LARGE" },
      { status: 413 },
    );
  }

  let body: Partial<ShopConfig>;
  try {
    body = JSON.parse(rawBody) as Partial<ShopConfig>;
  } catch {
    return NextResponse.json(
      { ok: false, error: "INVALID_JSON" },
      { status: 400 },
    );
  }

  // Strip client-supplied subscription fields; only verified ECPay callback unlocks PRO.
  const safeSettings: Partial<ShopConfig> = {
    shopName: body.shopName,
    tagline: body.tagline,
    logoUrl: body.logoUrl,
    brandColor: body.brandColor,
    googleReviewUrl: body.googleReviewUrl,
    lineId: body.lineId,
    thresholdStar: body.thresholdStar,
    ratingCategories: body.ratingCategories,
    emailNotification: body.emailNotification,
    emailFormEndpoint: body.emailFormEndpoint,
    ratingMode: body.ratingMode,
  };

  try {
    const config = await upsertNovaShieldShopSettings(shopId, safeSettings);
    return NextResponse.json({ ok: true, config });
  } catch (error) {
    return errorResponse(error);
  }
}
