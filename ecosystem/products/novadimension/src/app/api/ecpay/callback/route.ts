import { NextResponse } from "next/server";

/**
 * 綠界付款成功通知已統一由拓新雲端主站處理：
 * https://paycheck.com.de/api/checkout/callback
 *
 * 本路由僅保留相容／說明用途，避免誤設 ReturnURL 到子站。
 */
export async function POST() {
  return new NextResponse(
    "0|UseNovaOsHubCallback — configure ECPay ReturnURL to paycheck.com.de/api/checkout/callback",
    {
      status: 400,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    },
  );
}

export async function GET() {
  return NextResponse.json({
    ok: false,
    message:
      "NovaDimension 金流已與拓新雲端統一。請使用主站 /api/checkout/callback 作為綠界 ReturnURL。",
    hubCallback: "https://paycheck.com.de/api/checkout/callback",
  });
}
