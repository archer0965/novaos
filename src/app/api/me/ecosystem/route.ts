import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { listActivationsForSeller } from "@/lib/module-activation";
import { CENTRAL_PLANS } from "@/lib/central-plans";
import { NOVAOS_ECOSYSTEM_PRODUCTS, NOVAOS_LEGAL } from "@/lib/novaos-trust";
import { SUBKEEPER_PRODUCT } from "@/lib/subkeeper";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Unified member-center snapshot for one NovaOS account across the ecosystem.
 * Used by hub Pass page and product account bars.
 */
export async function GET() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();

  const [{ data: profile }, activations] = await Promise.all([
    admin
      .from("profiles")
      .select(
        "id, email, shop_name, plan_type, billing_cycle, trial_ends_at, expires_at, is_early_bird, discount_tier, is_ambassador, signup_early_bird, active_modules, referral_code, referral_credit_balance",
      )
      .eq("id", user.id)
      .maybeSingle(),
    listActivationsForSeller(user.id),
  ]);

  const products = NOVAOS_ECOSYSTEM_PRODUCTS.map((p) => {
    if (p.id === "hub") {
      return {
        ...p,
        entitlement: {
          status: "active",
          plan: profile?.plan_type || "free",
          label: "訂閱中控（帳號中心）",
          expiresAt: profile?.expires_at || null,
          trialEndsAt: profile?.trial_ends_at || null,
        },
      };
    }
    if (p.id === "subkeeper") {
      return {
        ...p,
        entitlement: {
          status: "active",
          plan: "free",
          label: `${SUBKEEPER_PRODUCT.name}永久免費`,
          expiresAt: null,
          trialEndsAt: null,
        },
      };
    }
    if (p.id === "booking" || p.id === "novastore") {
      const moduleId = p.id === "booking" ? "booking" : "store";
      const act = activations.find((a) => a.module_id === moduleId);
      const activeMods = Array.isArray(profile?.active_modules)
        ? profile!.active_modules
        : [];
      const unlocked =
        Boolean(act) ||
        activeMods.includes(moduleId) ||
        profile?.plan_type === "unlimited";
      return {
        ...p,
        entitlement: {
          status: unlocked ? "active" : "locked",
          plan: profile?.plan_type || "free",
          label: unlocked
            ? act?.is_module_early_bird
              ? "已啟用（早鳥）"
              : "已啟用"
            : "尚未啟用",
          expiresAt: profile?.expires_at || null,
          trialEndsAt: act?.trial_ends_at || profile?.trial_ends_at || null,
          earlyBird: Boolean(act?.is_module_early_bird),
        },
      };
    }
    // dimension — credit-based; hub records catalog only
    return {
      ...p,
      entitlement: {
        status: "external",
        plan: "credit",
        label: "獨立 Credit／訂閱（登入贈 1 次）",
        expiresAt: null,
        trialEndsAt: null,
      },
    };
  });

  return NextResponse.json({
    ok: true,
    user: {
      id: user.id,
      email: user.email,
      shopName: profile?.shop_name || null,
    },
    profile: profile || null,
    activations,
    products,
    catalog: CENTRAL_PLANS,
    trust: NOVAOS_LEGAL,
    memberCenterUrl: NOVAOS_LEGAL.memberCenter,
  });
}
