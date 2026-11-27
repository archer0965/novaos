import { NextResponse } from "next/server";
import { z } from "zod";
import { activateModule } from "@/lib/module-activation";
import {
  isFreeModule,
  isNovaModuleId,
  isRetiredModule,
  NOVA_MODULES,
} from "@/lib/novaos";
import { createClient } from "@/lib/supabase/server";

const schema = z.object({
  moduleId: z.string(),
});

export async function POST(request: Request) {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "請先登入" }, { status: 401 });
    }

    const parsed = schema.safeParse(await request.json().catch(() => ({})));
    if (!parsed.success || !isNovaModuleId(parsed.data.moduleId)) {
      return NextResponse.json({ error: "無效的子模組" }, { status: 400 });
    }
    if (isRetiredModule(parsed.data.moduleId)) {
      return NextResponse.json(
        { error: "此模組已停止提供，無法啟用" },
        { status: 410 }
      );
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("is_early_bird, discount_tier, is_ambassador")
      .eq("id", user.id)
      .maybeSingle();

    if (!profile) {
      return NextResponse.json(
        { error: "請先完成帳戶設定" },
        { status: 400 }
      );
    }

    if (isFreeModule(parsed.data.moduleId)) {
      const mod = NOVA_MODULES[parsed.data.moduleId];
      return NextResponse.json({
        ok: true,
        created: false,
        earlyBird: false,
        trialDays: 0,
        tier: "general",
        free: true,
        message: `${mod.emoji} ${mod.name} 為帳號中心，無需啟用試用`,
      });
    }

    const result = await activateModule({
      sellerId: user.id,
      moduleId: parsed.data.moduleId,
      profile,
    });

    const mod = NOVA_MODULES[parsed.data.moduleId];
    return NextResponse.json({
      ok: true,
      created: result.created,
      earlyBird: result.earlyBird,
      trialDays: result.trialDays,
      tier: result.tier,
      activation: result.activation,
      message: result.created
        ? `已啟用 ${mod.emoji} ${mod.name}：${
            result.earlyBird
              ? "早鳥名額已佔用，"
              : result.tier === "vip"
                ? "特約店家資格，"
                : "一般資格，"
          }試用 ${result.trialDays} 天`
        : `${mod.name} 先前已啟用`,
    });
  } catch (error) {
    console.error("[modules/activate]", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "啟用失敗（請確認已執行 migration 025）",
      },
      { status: 500 }
    );
  }
}
