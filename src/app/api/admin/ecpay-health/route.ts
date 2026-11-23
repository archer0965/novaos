import { NextResponse } from "next/server";
import { isAdminEmail } from "@/lib/admin";
import { checkEcpayGatewayHealth } from "@/lib/ecpay";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Admin: probe ECPay credentials without sending shoppers to a blank fail page. */
export async function GET() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !isAdminEmail(user.email)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const health = await checkEcpayGatewayHealth({ force: true });
  return NextResponse.json({
    ok: health.ok,
    health,
    hint: health.ok
      ? "綠界已接受探針訂單，正式結帳可用。"
      : "請至綠界廠商專區確認全方位金流 Hash 與 Vercel ECPAY_* 環境變數一致。",
  });
}
