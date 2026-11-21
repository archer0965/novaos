import {
  activationMap,
  canAccessModuleNow,
  isModuleTrialActive,
  type ModuleActivationRow,
} from "@/lib/module-activation";
import {
  hasModuleAccess,
  normalizeModules,
  NOVA_MODULE_IDS,
  type NovaModuleId,
} from "@/lib/novaos";
import {
  isPaidPlan,
  normalizePlan,
  PLAN_CATALOG,
  type Profile,
} from "@/types/database";

export function resolveUnlockedModules(
  profile: Pick<
    Profile,
    "plan_type" | "trial_ends_at" | "expires_at" | "active_modules"
  >,
  options?: {
    isAdmin?: boolean;
    activations?: ModuleActivationRow[];
  }
): NovaModuleId[] {
  if (options?.isAdmin) {
    return normalizeModules(null, { bundle: true });
  }

  const unlocked = new Set<NovaModuleId>(["pass"]);
  const plan = normalizePlan(profile.plan_type);
  const expired =
    isPaidPlan(plan) &&
    profile.expires_at &&
    new Date(profile.expires_at).getTime() <= Date.now();

  const paidOk = isPaidPlan(plan) && !expired;
  if (paidOk) {
    const def = PLAN_CATALOG[plan];
    if (def.isBundle) {
      return normalizeModules(null, { bundle: true });
    }
    for (const id of normalizeModules(profile.active_modules, {
      fallback: [],
    })) {
      unlocked.add(id);
    }
  }

  const map = activationMap(options?.activations || []);
  for (const id of NOVA_MODULE_IDS) {
    if (id === "pass") continue;
    const row = map[id];
    if (row && isModuleTrialActive(row.trial_ends_at)) {
      unlocked.add(id);
    }
  }

  return Array.from(unlocked);
}

export function canOpenModule(
  profile: Pick<
    Profile,
    "plan_type" | "trial_ends_at" | "expires_at" | "active_modules"
  >,
  moduleId: NovaModuleId,
  options?: {
    isAdmin?: boolean;
    activations?: ModuleActivationRow[];
  }
): boolean {
  if (options?.isAdmin) return true;
  if (moduleId === "pass") return true;

  const map = activationMap(options?.activations || []);
  if (
    canAccessModuleNow({
      moduleId,
      profile,
      activation: map[moduleId] || null,
      isAdmin: options?.isAdmin,
    })
  ) {
    return true;
  }

  const unlocked = resolveUnlockedModules(profile, options);
  return hasModuleAccess(unlocked, moduleId, { isAdmin: options?.isAdmin });
}
