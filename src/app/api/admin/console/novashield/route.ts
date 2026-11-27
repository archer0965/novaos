import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminApi } from "@/lib/master-admin/auth";
import { listNovaShield } from "@/lib/master-admin/products";
import {
  activateNovaShieldProSubscription,
  deleteNovaShieldShop,
  NovaShieldDbUnavailableError,
  setNovaShieldShopFree,
} from "@/lib/novashield/db";
import { sanitizeShopId } from "@/lib/novashield/validation";

export const dynamic = "force-dynamic";

const actionSchema = z.object({
  action: z.enum(["grant_pro", "set_free", "delete"]),
  shopId: z.string().trim().min(1).max(64),
  cycle: z.enum(["monthly", "yearly"]).optional(),
});

export async function GET(request: Request) {
  const gate = await requireAdminApi();
  if (!gate.ok) return gate.response;
  try {
    const data = await listNovaShield(new URL(request.url));
    return NextResponse.json({ ok: true, ...data });
  } catch (error) {
    console.error("[admin/console/novashield/GET]", error);
    return NextResponse.json(
      { error: "無法載入 Nova商譽寶資料" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const gate = await requireAdminApi();
  if (!gate.ok) return gate.response;

  try {
    const json = await request.json().catch(() => ({}));
    const parsed = actionSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: "無效的操作參數" }, { status: 400 });
    }

    const shopId = sanitizeShopId(parsed.data.shopId);
    if (!shopId) {
      return NextResponse.json({ error: "無效的門市代碼" }, { status: 400 });
    }

    if (parsed.data.action === "grant_pro") {
      const cycle = parsed.data.cycle === "yearly" ? "yearly" : "monthly";
      const shop = await activateNovaShieldProSubscription({ shopId, cycle });
      return NextResponse.json({
        ok: true,
        message: `已為 ${shop.shopName}（${shopId}）開通／展延 PRO（${
          cycle === "yearly" ? "年繳 +365 天" : "月繳 +30 天"
        }）`,
        shop,
      });
    }

    if (parsed.data.action === "set_free") {
      const shop = await setNovaShieldShopFree(shopId);
      return NextResponse.json({
        ok: true,
        message: `已將 ${shop.shopName}（${shopId}）切回 FREE 免費版`,
        shop,
      });
    }

    await deleteNovaShieldShop(shopId);
    return NextResponse.json({
      ok: true,
      message: `已刪除門市 ${shopId}`,
    });
  } catch (error) {
    console.error("[admin/console/novashield/POST]", error);
    if (error instanceof NovaShieldDbUnavailableError) {
      return NextResponse.json(
        { error: "尚未套用 novashield_shops 資料表（030_novashield_shops.sql）" },
        { status: 503 }
      );
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "操作失敗" },
      { status: 500 }
    );
  }
}
