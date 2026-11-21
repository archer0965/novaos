import { redirect } from "next/navigation";
import { AiDocPanel } from "@/components/dashboard/ai-doc-panel";
import { isAdminEmail } from "@/lib/admin";
import { canOpenModule } from "@/lib/module-access";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/types/database";

export const metadata = { title: "Nova AI Doc" };

export default async function AiDocPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const isAdmin = isAdminEmail(user.email);
  const { data: profile } = await supabase
    .from("profiles")
    .select("plan_type, trial_ends_at, expires_at, active_modules, shop_name")
    .eq("id", user.id)
    .maybeSingle();
  if (!profile) redirect("/dashboard/pass");
  if (!canOpenModule(profile as Profile, "ai_doc", { isAdmin })) {
    redirect("/dashboard/pass#upgrade");
  }

  const { data: drafts } = await supabase
    .from("ai_doc_drafts")
    .select("id, doc_type, title, content, updated_at")
    .eq("seller_id", user.id)
    .order("updated_at", { ascending: false })
    .limit(20);

  return (
    <AiDocPanel
      shopName={profile.shop_name || "我的工作室"}
      initialDrafts={drafts || []}
    />
  );
}
