import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/master-admin/auth";
import { listNovastore } from "@/lib/master-admin/products";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const gate = await requireAdminApi();
  if (!gate.ok) return gate.response;
  try {
    const data = await listNovastore(new URL(request.url));
    return NextResponse.json({ ok: true, ...data });
  } catch (error) {
    console.error("[admin/console/novastore]", error);
    return NextResponse.json({ error: "無法載入 NovaStore" }, { status: 500 });
  }
}
