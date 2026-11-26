import { redirect } from "next/navigation";
import { ModuleActivateGate } from "@/components/dashboard/module-activate-gate";
import { isAdminEmail } from "@/lib/admin";
import {
  getModuleEarlyBirdStatus,
  listActivationsForSeller,
} from "@/lib/module-activation";
import { canOpenModule } from "@/lib/module-access";
import type { NovaModuleId } from "@/lib/novaos";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/types/database";
import { createElement, type ReactNode } from "react";

/**
 * Load profile + activations. If module locked, return a gate element.
 * If not logged in → redirect login.
 */
export async function requireModuleOrGate(moduleId: NovaModuleId): Promise<
  | {
      ok: true;
      userId: string;
      profile: Profile;
      isAdmin: boolean;
      activations: Awaited<ReturnType<typeof listActivationsForSeller>>;
    }
  | { ok: false; gate: ReactNode }
> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const isAdmin = isAdminEmail(user.email);
  const { data: profile } = await supabase
    .from("profiles")
    .select(
      "id, shop_name, shop_slug, shop_bio, bank_code, bank_account, line_user_id, plan_type, billing_cycle, trial_ends_at, expires_at, is_early_bird, discount_tier, is_ambassador, signup_early_bird, monthly_usage_count, usage_month, active_modules, referral_code, referred_by, referral_discount_used, referral_credit_balance, deposit_enabled, ecpay_merchant_id, created_at"
    )
    .eq("id", user.id)
    .maybeSingle();

  if (!profile) redirect("/dashboard/pass");

  const activations = await listActivationsForSeller(user.id);
  if (
    canOpenModule(profile as Profile, moduleId, {
      isAdmin,
      activations,
    })
  ) {
    return {
      ok: true,
      userId: user.id,
      profile: profile as Profile,
      isAdmin,
      activations,
    };
  }

  const early = await getModuleEarlyBirdStatus(moduleId);
  const partner =
    Boolean(profile.is_early_bird) ||
    profile.discount_tier === "lifetime_special";
  let vipHint: string | null = null;
  if (
    (moduleId === "booking" || moduleId === "store") &&
    partner
  ) {
    vipHint = "您具特約店家資格：啟用後享 14 天試用與特約折扣（月 9／半年 82／年 75 折）。";
  }

  return {
    ok: false,
    gate: createElement(ModuleActivateGate, {
      moduleId,
      earlyBirdOpen: early.open,
      earlyBirdRemaining: early.remaining,
      earlyBirdMax: early.max,
      vipHint,
    }),
  };
}
