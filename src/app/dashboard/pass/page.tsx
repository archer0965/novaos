import Link from "next/link";
import { redirect } from "next/navigation";
import { CopyButton } from "@/components/copy-button";
import { PlanUpgrade } from "@/components/dashboard/plan-upgrade";
import { SettingsForm } from "@/components/dashboard/settings-form";
import { SubscriptionCard } from "@/components/dashboard/subscription-card";
import { isAdminEmail } from "@/lib/admin";
import {
  getAllModuleEarlyBirdStatuses,
  listActivationsForSeller,
} from "@/lib/module-activation";
import { generateReferralCode, NOVA_MODULES, PAYMENT_GATEWAY_STATUS } from "@/lib/novaos";
import { TIER_META } from "@/lib/pricing-tiers";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/types/database";

export const metadata = { title: "SubKeeper 訂閱中控" };

export default async function PassPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const isAdmin = isAdminEmail(user.email);
  let { data: profile } = await supabase
    .from("profiles")
    .select(
      "id, shop_name, shop_slug, shop_bio, bank_code, bank_account, line_user_id, line_channel_access_token, line_channel_secret, enable_cod, cod_url, cod_label, shipping_fee, free_shipping_enabled, free_shipping_threshold, plan_type, billing_cycle, trial_ends_at, expires_at, is_early_bird, discount_tier, is_ambassador, signup_early_bird, monthly_usage_count, usage_month, active_modules, referral_code, referred_by, referral_discount_used, referral_credit_balance, deposit_enabled, ecpay_merchant_id, created_at"
    )
    .eq("id", user.id)
    .maybeSingle();

  if (!profile) {
    redirect("/dashboard/settings");
  }

  // Ensure referral code exists
  if (!profile.referral_code) {
    const code = generateReferralCode(profile.shop_slug || user.id);
    const { data: updated } = await supabase
      .from("profiles")
      .update({ referral_code: code })
      .eq("id", user.id)
      .is("referral_code", null)
      .select("referral_code")
      .maybeSingle();
    profile = {
      ...profile,
      referral_code: updated?.referral_code || code,
    };
  }

  const typedProfile = {
    ...(profile as Profile),
    line_channel_access_token: null,
    line_channel_secret: null,
  } satisfies Profile;

  const [activations, earlyStatuses] = await Promise.all([
    listActivationsForSeller(user.id),
    getAllModuleEarlyBirdStatuses(),
  ]);

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-border/80 bg-gradient-to-br from-slate-50 via-background to-amber-50/40 p-5 md:p-6">
        <p className="text-sm text-muted-foreground">⚙️ SubKeeper / 訂閱中控</p>
        <h1 className="mt-1 font-display text-2xl font-semibold">
          訂閱、對帳與同業裂變
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          <span className="mr-2 rounded-md bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-900">
            永久免費
          </span>
          訂閱中控不需訂閱、不佔早鳥名額。個人訂閱開銷請用獨立產品 SubKeeper。付費升級統一走
          <span className="ml-1 font-medium text-emerald-800">
            {PAYMENT_GATEWAY_STATUS.label}
          </span>
          。
        </p>
        <div className="mt-3 flex flex-wrap gap-2 text-xs">
          {typedProfile.is_early_bird ? (
            <span className="rounded-md bg-amber-100 px-2 py-1 text-amber-950">
              特約店家 · {TIER_META.vip.label}
            </span>
          ) : null}
          {typedProfile.is_ambassador ? (
            <span className="rounded-md bg-violet-100 px-2 py-1 text-violet-950">
              推廣大使 · AI Doc
            </span>
          ) : null}
          {activations.map((a) => (
            <span
              key={a.id}
              className="rounded-md bg-sky-100 px-2 py-1 text-sky-950"
            >
              已啟用 {a.module_id}
              {a.is_module_early_bird ? "（早鳥）" : ""}
            </span>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border px-4 py-3 text-sm">
        <p className="font-medium">各子模組早鳥名額（啟用時才佔用）</p>
        <ul className="mt-2 grid gap-1 sm:grid-cols-2">
          {earlyStatuses.map((s) => (
            <li key={s.moduleId} className="text-muted-foreground">
              {NOVA_MODULES[s.moduleId].emoji} {NOVA_MODULES[s.moduleId].name}：
              {s.used}/{s.max}
              {s.open ? `（剩 ${s.remaining}）` : "（已滿・一般 7 天）"}
            </li>
          ))}
        </ul>
      </section>

      <SubscriptionCard profile={typedProfile} isAdmin={isAdmin} />

      <section
        id="referral"
        className="rounded-2xl border border-border/80 bg-card/80 p-5"
      >
        <h2 className="font-display text-lg font-semibold">同業推薦碼</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          好友首次付費現折 NT$50；你每成功推薦 1 家付費可獲得 NT$100
          扣抵（單次續費上限 $100）。
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <code className="rounded-xl bg-secondary px-4 py-2 text-lg font-semibold tracking-wider">
            {typedProfile.referral_code}
          </code>
          <CopyButton
            value={typedProfile.referral_code || ""}
            label="複製推薦碼"
            toastMessage="已複製推薦碼"
          />
          <span className="text-sm text-muted-foreground">
            目前扣抵餘額：NT${typedProfile.referral_credit_balance || 0}
          </span>
        </div>
      </section>

      <section className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-5">
        <h2 className="font-display text-lg font-semibold text-emerald-950">
          線上付款
        </h2>
        <p className="mt-1 text-sm text-emerald-900/80">
          {PAYMENT_GATEWAY_STATUS.activeLabel}。選擇方案後將導向綠界安全結帳頁完成付款。
        </p>
      </section>

      <section id="upgrade">
        <PlanUpgrade profile={typedProfile} activations={activations} />
      </section>

      <section className="space-y-3">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <h2 className="font-display text-lg font-semibold">帳戶與賣場設定</h2>
          <Link
            href="/dashboard/settings"
            className="text-sm text-primary hover:underline"
          >
            完整設定頁
          </Link>
        </div>
        <SettingsForm profile={typedProfile} />
      </section>

      <section className="rounded-2xl border px-4 py-3 text-sm text-muted-foreground">
        模組捷徑：
        {Object.values(NOVA_MODULES).map((m) => (
          <Link key={m.id} href={m.href} className="ml-2 text-primary hover:underline">
            {m.emoji}
            {m.name}
          </Link>
        ))}
      </section>
    </div>
  );
}
