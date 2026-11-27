import { NextResponse } from "next/server";
import {
  listNovaShieldShops,
  NovaShieldDbUnavailableError,
} from "@/lib/novashield/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const shops = await listNovaShieldShops();
    return NextResponse.json({ ok: true, shops });
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
