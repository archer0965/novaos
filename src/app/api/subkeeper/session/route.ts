import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

/**
 * Touch NovaOS profile after login / opening 訂閱管家.
 * Ensures profile row exists and records last_login_at (service role).
 */
export async function POST() {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "請先登入拓新雲端" }, { status: 401 });
    }

    const admin = createAdminClient();
    const now = new Date().toISOString();
    const meta = user.user_metadata || {};
    const shopName =
      (typeof meta.shop_name === "string" && meta.shop_name.trim()) ||
      (typeof meta.full_name === "string" && meta.full_name.trim()) ||
      (typeof meta.name === "string" && meta.name.trim()) ||
      "";

    const { data: existing } = await admin
      .from("profiles")
      .select("id, shop_name")
      .eq("id", user.id)
      .maybeSingle();

    if (!existing) {
      const { error } = await admin.from("profiles").insert({
        id: user.id,
        shop_name: shopName,
        trial_ends_at: null,
        signup_early_bird: false,
        active_modules: [],
        last_login_at: now,
      });
      if (error) {
        console.error("[subkeeper/session] insert", error);
        return NextResponse.json(
          { error: "無法建立用戶 Profile" },
          { status: 500 }
        );
      }
    } else {
      const patch: Record<string, unknown> = { last_login_at: now };
      if (!existing.shop_name && shopName) patch.shop_name = shopName;
      const { error } = await admin
        .from("profiles")
        .update(patch)
        .eq("id", user.id);
      if (error) {
        // Column may be missing until migration 029 — still succeed session.
        console.error("[subkeeper/session] update", error);
      }
    }

    const { data: profile } = await admin
      .from("profiles")
      .select("id, shop_name, last_login_at, created_at")
      .eq("id", user.id)
      .maybeSingle();

    return NextResponse.json({
      ok: true,
      user: {
        id: user.id,
        email: user.email,
        last_sign_in_at: user.last_sign_in_at,
      },
      profile,
    });
  } catch (error) {
    console.error("[subkeeper/session]", error);
    return NextResponse.json({ error: "無法同步登入狀態" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("id, shop_name, last_login_at, created_at")
      .eq("id", user.id)
      .maybeSingle();

    return NextResponse.json({
      authenticated: true,
      user: {
        id: user.id,
        email: user.email,
        last_sign_in_at: user.last_sign_in_at,
      },
      profile,
    });
  } catch (error) {
    console.error("[subkeeper/session GET]", error);
    return NextResponse.json({ error: "無法讀取登入狀態" }, { status: 500 });
  }
}
