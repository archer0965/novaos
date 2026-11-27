import { NextRequest, NextResponse } from "next/server";
import { isAdminEmail } from "@/lib/admin";
import {
  getNovaShieldShop,
  NovaShieldDbUnavailableError,
  NovaShieldForbiddenError,
  upsertNovaShieldShopSettingsForUser,
} from "@/lib/novashield/db";
import type { ShopConfig } from "@/lib/novashield/types";
import { sanitizeShopId } from "@/lib/novashield/validation";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const MAX_BODY_BYTES = 2_000_000;

type RouteContext = { params: { shopId: string } };

function errorResponse(error: unknown) {
  if (error instanceof NovaShieldForbiddenError) {
    return NextResponse.json(
      { ok: false, error: "FORBIDDEN", message: error.message },
      { status: 403 },
    );
  }
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

/** Public read for C-side customer rating pages (/novashield/feedback/[shopId]). */
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
    // Omit internal reminder metadata from public customer-facing payload
    const publicConfig: ShopConfig = {
      ...config,
      reminder3dSentFor: undefined,
    };
    return NextResponse.json({ ok: true, config: publicConfig });
  } catch (error) {
    return errorResponse(error);
  }
}

/** Authenticated merchant edit/create — bound to NovaOS Supabase Auth user. */
export async function PUT(request: NextRequest, context: RouteContext) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { ok: false, error: "UNAUTHORIZED", message: "請先登入拓新雲端帳號。" },
      { status: 401 },
    );
  }

  const shopId = sanitizeShopId(context.params.shopId || "");
  if (!shopId) {
    return NextResponse.json(
      { ok: false, error: "INVALID_SHOP_ID", message: "門市代碼格式不正確。" },
      { status: 400 },
    );
  }

  const rawBody = await request.text();
  if (rawBody.length > MAX_BODY_BYTES) {
    return NextResponse.json(
      { ok: false, error: "PAYLOAD_TOO_LARGE", message: "上傳資料過大。" },
      { status: 413 },
    );
  }

  let body: Partial<ShopConfig>;
  try {
    body = JSON.parse(rawBody) as Partial<ShopConfig>;
  } catch {
    return NextResponse.json(
      { ok: false, error: "INVALID_JSON", message: "無效的請求格式。" },
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
    const config = await upsertNovaShieldShopSettingsForUser(
      shopId,
      safeSettings,
      {
        userId: user.id,
        userEmail: user.email,
        isPlatformAdmin: isAdminEmail(user.email),
      },
    );
    return NextResponse.json({ ok: true, config });
  } catch (error) {
    return errorResponse(error);
  }
}
