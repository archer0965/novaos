import {
  hasModuleAccess,
  normalizeModules,
  type NovaModuleId,
} from "@/lib/novaos";
import {
  isPaidPlan,
  isTrialActive,
  normalizePlan,
  PLAN_CATALOG,
  type Profile,
} from "@/types/database";

export function resolveUnlockedModules(
  profile: Pick<Profile, "plan_type" | "trial_ends_at" | "expires_at" | "active_modules">,
  options?: { isAdmin?: boolean }
): NovaModuleId[] {
  if (options?.isAdmin) {
    return normalizeModules(null, { bundle: true });
  }
  const plan = normalizePlan(profile.plan_type);
  const trial = isTrialActive(profile.trial_ends_at);
  const expired =
    isPaidPlan(plan) &&
    profile.expires_at &&
    new Date(profile.expires_at).getTime() <= Date.now();

  if (trial) return normalizeModules(null, { bundle: true });
  if (expired || plan === "free") {
    // Free: allow store + pass for upgrade/settings
    return ["store", "pass"];
  }
  const def = PLAN_CATALOG[plan];
  if (def.isBundle) return normalizeModules(null, { bundle: true });
  return normalizeModules(profile.active_modules, { fallback: ["store"] });
}

export function canOpenModule(
  profile: Pick<Profile, "plan_type" | "trial_ends_at" | "expires_at" | "active_modules">,
  moduleId: NovaModuleId,
  options?: { isAdmin?: boolean }
): boolean {
  const unlocked = resolveUnlockedModules(profile, options);
  return hasModuleAccess(unlocked, moduleId, {
    isAdmin: options?.isAdmin,
  });
}
