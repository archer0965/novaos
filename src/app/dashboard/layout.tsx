import { AuthSessionKeeper } from "@/components/auth-session-keeper";
import { DashboardNav } from "@/components/dashboard/nav";
import { ModuleTabs } from "@/components/dashboard/module-tabs";
import { SiteFooter } from "@/components/site-footer";
import { ensureAdminProfile, isAdminEmail } from "@/lib/admin";
import { resolveUnlockedModules } from "@/lib/module-access";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/types/database";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isAdmin = isAdminEmail(user?.email);
  if (isAdmin && user) {
    await ensureAdminProfile(user.id);
  }

  let unlocked = resolveUnlockedModules(
    {
      plan_type: "free",
      trial_ends_at: null,
      expires_at: null,
      active_modules: ["store", "pass"],
    },
    { isAdmin }
  );

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("plan_type, trial_ends_at, expires_at, active_modules")
      .eq("id", user.id)
      .maybeSingle();
    if (profile) {
      unlocked = resolveUnlockedModules(profile as Profile, { isAdmin });
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <AuthSessionKeeper />
      <DashboardNav isAdmin={isAdmin} />
      <main
        id="main-content"
        className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 pb-10 md:py-8"
      >
        <ModuleTabs unlocked={unlocked} />
        {children}
      </main>
      <div className="hidden sm:block">
        <SiteFooter />
      </div>
    </div>
  );
}
