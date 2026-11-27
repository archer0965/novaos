import { NextResponse } from "next/server";
import { isAdminEmail } from "@/lib/admin";
import {
  listNovaShieldShopsForUser,
  NovaShieldDbUnavailableError,
} from "@/lib/novashield/db";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
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

    const shops = await listNovaShieldShopsForUser({
      userId: user.id,
      isPlatformAdmin: isAdminEmail(user.email),
    });

    return NextResponse.json({
      ok: true,
      shops,
      user: {
        id: user.id,
        email: user.email ?? "",
        isPlatformAdmin: isAdminEmail(user.email),
      },
    });
  } catch (error) {
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
}
