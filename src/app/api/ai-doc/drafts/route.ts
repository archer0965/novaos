import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json({ error: "Nova AI Doc 已停止提供" }, { status: 410 });
}
