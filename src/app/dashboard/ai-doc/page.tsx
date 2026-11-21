import { AiDocPanel } from "@/components/dashboard/ai-doc-panel";
import { requireModuleOrGate } from "@/lib/require-module";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Nova AI Doc" };

export default async function AiDocPage() {
  const access = await requireModuleOrGate("ai_doc");
  if (!access.ok) return access.gate;

  const supabase = createClient();
  const { data: drafts } = await supabase
    .from("ai_doc_drafts")
    .select("id, doc_type, title, content, updated_at")
    .eq("seller_id", access.userId)
    .order("updated_at", { ascending: false })
    .limit(20);

  return (
    <AiDocPanel
      shopName={access.profile.shop_name || "我的工作室"}
      initialDrafts={drafts || []}
    />
  );
}
