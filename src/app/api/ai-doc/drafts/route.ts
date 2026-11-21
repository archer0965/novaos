import { NextResponse } from "next/server";
import { z } from "zod";
import { isAdminEmail } from "@/lib/admin";
import { listActivationsForSeller } from "@/lib/module-activation";
import { canOpenModule } from "@/lib/module-access";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/types/database";

const schema = z.object({
  doc_type: z.string().trim().min(1).max(40),
  title: z.string().trim().min(1).max(120),
  content: z.string().trim().min(1).max(20000),
});

export async function POST(request: Request) {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "未授權" }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("plan_type, trial_ends_at, expires_at, active_modules")
      .eq("id", user.id)
      .maybeSingle();
    const activations = await listActivationsForSeller(user.id);
    if (
      !profile ||
      !canOpenModule(profile as Profile, "ai_doc", {
        isAdmin: isAdminEmail(user.email),
        activations,
      })
    ) {
      return NextResponse.json(
        { error: "請先啟用 Nova AI Doc 子模組" },
        { status: 403 }
      );
    }

    const parsed = schema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "資料無效" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("ai_doc_drafts")
      .insert({
        seller_id: user.id,
        ...parsed.data,
      })
      .select("id, doc_type, title, content, updated_at")
      .single();

    if (error) {
      console.error("[ai-doc/drafts]", error);
      return NextResponse.json(
        { error: "儲存失敗（請確認已執行 migration 024）" },
        { status: 500 }
      );
    }
    return NextResponse.json({ ok: true, draft: data });
  } catch (error) {
    console.error("[ai-doc/drafts]", error);
    return NextResponse.json({ error: "伺服器錯誤" }, { status: 500 });
  }
}
