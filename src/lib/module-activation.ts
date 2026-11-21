import {
  AMBASSADOR_MODULE,
  MODULE_EARLY_BIRD_MAX,
  PARTNER_STORE_MODULES,
  resolvePricingTier,
  TIER_META,
  type PricingTierId,
} from "@/lib/pricing-tiers";
import {
  isNovaModuleId,
  NOVA_MODULE_IDS,
  type NovaModuleId,
} from "@/lib/novaos";
import { createAdminClient } from "@/lib/supabase/admin";
import { isPaidPlan, normalizePlan, type Profile } from "@/types/database";

export type ModuleActivationRow = {
  id: string;
  seller_id: string;
  module_id: string;
  activated_at: string;
  is_module_early_bird: boolean;
  trial_ends_at: string | null;
};

export function isModuleTrialActive(
  trialEndsAt: string | null | undefined,
  now: Date = new Date()
): boolean {
  if (!trialEndsAt) return false;
  const ends = new Date(trialEndsAt);
  return !Number.isNaN(ends.getTime()) && ends.getTime() > now.getTime();
}

export async function countModuleEarlyBirdUsed(
  moduleId: NovaModuleId
): Promise<number> {
  const admin = createAdminClient();
  const { count, error } = await admin
    .from("module_activations")
    .select("*", { count: "exact", head: true })
    .eq("module_id", moduleId)
    .eq("is_module_early_bird", true);
  if (error) throw error;
  return count ?? 0;
}

export async function getModuleEarlyBirdStatus(moduleId: NovaModuleId) {
  let used = 0;
  try {
    used = await countModuleEarlyBirdUsed(moduleId);
  } catch (error) {
    console.error("[module-early-bird] count failed", moduleId, error);
    used = 0;
  }
  const remaining = Math.max(0, MODULE_EARLY_BIRD_MAX - used);
  return {
    moduleId,
    open: used < MODULE_EARLY_BIRD_MAX,
    used,
    max: MODULE_EARLY_BIRD_MAX,
    remaining,
    trialDays: TIER_META.early_bird.trialDays,
  };
}

export async function listActivationsForSeller(
  sellerId: string
): Promise<ModuleActivationRow[]> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("module_activations")
    .select("id, seller_id, module_id, activated_at, is_module_early_bird, trial_ends_at")
    .eq("seller_id", sellerId);
  if (error) {
    console.error("[module-activations] list", error);
    return [];
  }
  return (data || []) as ModuleActivationRow[];
}

export function activationMap(
  rows: ModuleActivationRow[]
): Partial<Record<NovaModuleId, ModuleActivationRow>> {
  const map: Partial<Record<NovaModuleId, ModuleActivationRow>> = {};
  for (const row of rows) {
    if (isNovaModuleId(row.module_id)) map[row.module_id] = row;
  }
  return map;
}

export function resolveSellerPricingTier(options: {
  profile: Pick<Profile, "is_early_bird" | "discount_tier" | "is_ambassador">;
  activations: ModuleActivationRow[];
  moduleId?: NovaModuleId | null;
}): PricingTierId {
  const anyEarly = options.activations.some((a) => a.is_module_early_bird);
  const mod = options.moduleId || null;
  const modEarly = mod
    ? Boolean(
        options.activations.find((a) => a.module_id === mod)?.is_module_early_bird
      )
    : null;

  return resolvePricingTier({
    moduleId: mod,
    isPartnerStore:
      Boolean(options.profile.is_early_bird) ||
      options.profile.discount_tier === "lifetime_special",
    isAmbassador: Boolean(options.profile.is_ambassador),
    moduleIsEarlyBird: modEarly,
    anyModuleEarlyBird: anyEarly,
  });
}

/**
 * Activate a submodule: consume early-bird seat if available, start trial.
 * Does NOT run on account registration.
 */
export async function activateModule(options: {
  sellerId: string;
  moduleId: NovaModuleId;
  profile: Pick<Profile, "is_early_bird" | "discount_tier" | "is_ambassador">;
  now?: Date;
}): Promise<{
  activation: ModuleActivationRow;
  created: boolean;
  tier: PricingTierId;
  trialDays: number;
  earlyBird: boolean;
}> {
  const admin = createAdminClient();
  const now = options.now ?? new Date();
  const moduleId = options.moduleId;

  const { data: existing } = await admin
    .from("module_activations")
    .select("id, seller_id, module_id, activated_at, is_module_early_bird, trial_ends_at")
    .eq("seller_id", options.sellerId)
    .eq("module_id", moduleId)
    .maybeSingle();

  if (existing) {
    return {
      activation: existing as ModuleActivationRow,
      created: false,
      tier: resolveSellerPricingTier({
        profile: options.profile,
        activations: [existing as ModuleActivationRow],
        moduleId,
      }),
      trialDays: 0,
      earlyBird: Boolean(existing.is_module_early_bird),
    };
  }

  // VIP identities force Tier 3 trial length even if early-bird seats remain
  const partner =
    Boolean(options.profile.is_early_bird) ||
    options.profile.discount_tier === "lifetime_special";
  const ambassador = Boolean(options.profile.is_ambassador);
  const vipForModule =
    (PARTNER_STORE_MODULES.includes(moduleId) && partner) ||
    (moduleId === AMBASSADOR_MODULE && ambassador) ||
    (moduleId === "pass" && (partner || ambassador));

  let earlyBird = false;
  let trialDays = TIER_META.general.trialDays;

  if (vipForModule) {
    trialDays = TIER_META.vip.trialDays;
    earlyBird = false;
  } else {
    const status = await getModuleEarlyBirdStatus(moduleId);
    if (status.open) {
      earlyBird = true;
      trialDays = TIER_META.early_bird.trialDays;
    } else {
      earlyBird = false;
      trialDays = TIER_META.general.trialDays;
    }
  }

  const trialEnds = new Date(now.getTime() + trialDays * 24 * 60 * 60 * 1000);

  const { data: inserted, error } = await admin
    .from("module_activations")
    .insert({
      seller_id: options.sellerId,
      module_id: moduleId,
      activated_at: now.toISOString(),
      is_module_early_bird: earlyBird,
      trial_ends_at: trialEnds.toISOString(),
    })
    .select("id, seller_id, module_id, activated_at, is_module_early_bird, trial_ends_at")
    .single();

  if (error) {
    // Race: another request won early-bird — re-read
    if (error.code === "23505") {
      const { data: again } = await admin
        .from("module_activations")
        .select(
          "id, seller_id, module_id, activated_at, is_module_early_bird, trial_ends_at"
        )
        .eq("seller_id", options.sellerId)
        .eq("module_id", moduleId)
        .maybeSingle();
      if (again) {
        return {
          activation: again as ModuleActivationRow,
          created: false,
          tier: resolveSellerPricingTier({
            profile: options.profile,
            activations: [again as ModuleActivationRow],
            moduleId,
          }),
          trialDays: 0,
          earlyBird: Boolean(again.is_module_early_bird),
        };
      }
    }
    throw error;
  }

  // Keep active_modules + legacy trial_ends_at in sync
  const { data: profileRow } = await admin
    .from("profiles")
    .select("active_modules, trial_ends_at")
    .eq("id", options.sellerId)
    .maybeSingle();
  const current = Array.isArray(profileRow?.active_modules)
    ? (profileRow!.active_modules as string[])
    : [];
  const patch: Record<string, unknown> = {};
  if (!current.includes(moduleId)) {
    patch.active_modules = [...current, moduleId];
  }
  if (!profileRow?.trial_ends_at) {
    patch.trial_ends_at = trialEnds.toISOString();
  }
  if (Object.keys(patch).length) {
    await admin.from("profiles").update(patch).eq("id", options.sellerId);
  }

  const activation = inserted as ModuleActivationRow;
  return {
    activation,
    created: true,
    tier: resolveSellerPricingTier({
      profile: options.profile,
      activations: [activation],
      moduleId,
    }),
    trialDays,
    earlyBird,
  };
}

export function canAccessModuleNow(options: {
  moduleId: NovaModuleId;
  profile: Pick<
    Profile,
    "plan_type" | "expires_at" | "active_modules" | "trial_ends_at"
  >;
  activation?: ModuleActivationRow | null;
  isAdmin?: boolean;
}): boolean {
  if (options.isAdmin) return true;
  // Pass is always reachable for billing / activation hub
  if (options.moduleId === "pass") return true;

  const plan = normalizePlan(options.profile.plan_type);
  const paidOk =
    isPaidPlan(plan) &&
    (!options.profile.expires_at ||
      new Date(options.profile.expires_at).getTime() > Date.now());

  if (paidOk) {
    if (plan === "unlimited") return true;
    const mods = options.profile.active_modules || [];
    if (mods.includes(options.moduleId)) return true;
  }

  if (
    options.activation &&
    isModuleTrialActive(options.activation.trial_ends_at)
  ) {
    return true;
  }

  return false;
}

export async function getAllModuleEarlyBirdStatuses() {
  const out = [] as Awaited<ReturnType<typeof getModuleEarlyBirdStatus>>[];
  for (const id of NOVA_MODULE_IDS) {
    out.push(await getModuleEarlyBirdStatus(id));
  }
  return out;
}
