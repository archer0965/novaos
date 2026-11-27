import { NextResponse } from "next/server";
import { redirect } from "next/navigation";
import { ensureAdminProfile, isAdminEmail } from "@/lib/admin";
import { createClient } from "@/lib/supabase/server";
import type { User } from "@supabase/supabase-js";

export type AdminSession = {
  user: User;
  email: string;
};

/** Page-level RBAC: redirect non-admins. */
export async function requireAdminPage(): Promise<AdminSession> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?next=/admin/dashboard");
  if (!isAdminEmail(user.email)) redirect("/dashboard");

  await ensureAdminProfile(user.id);
  return { user, email: user.email || "" };
}

/** API-level RBAC: 401/403 JSON. */
export async function requireAdminApi(): Promise<
  { ok: true; session: AdminSession } | { ok: false; response: NextResponse }
> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      ok: false,
      response: NextResponse.json({ error: "請先登入" }, { status: 401 }),
    };
  }
  if (!isAdminEmail(user.email)) {
    return {
      ok: false,
      response: NextResponse.json({ error: "無權限" }, { status: 403 }),
    };
  }

  await ensureAdminProfile(user.id);
  return { ok: true, session: { user, email: user.email || "" } };
}
