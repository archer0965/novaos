import { redirect } from "next/navigation";
import { SubkeeperPanel } from "@/components/dashboard/subkeeper-panel";
import { SUBKEEPER_PRODUCT } from "@/lib/subkeeper";
import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: `${SUBKEEPER_PRODUCT.name}｜拓新雲端`,
  description: SUBKEEPER_PRODUCT.tagline,
};

export default async function SubkeeperPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(SUBKEEPER_PRODUCT.loginHref);
  }

  return <SubkeeperPanel />;
}
