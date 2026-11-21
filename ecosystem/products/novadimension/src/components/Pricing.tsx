"use client";

import { useState } from "react";
import { Check, Loader2, ExternalLink } from "lucide-react";
import Reveal from "@/components/Reveal";
import { PRICING_PLANS, type PricingPlanId } from "@/lib/constants";
import { getNovaOsCheckoutUrl, NOVAOS_HUB_URL } from "@/lib/novaos-hub";

export default function Pricing() {
  const [loadingId, setLoadingId] = useState<PricingPlanId | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleCheckout(planId: PricingPlanId) {
    setError(null);
    setLoadingId(planId);

    try {
      if (planId === "free") {
        window.location.hash = "studio";
        return;
      }

      const res = await fetch("/api/ecpay/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId }),
      });
      const data = (await res.json()) as {
        ok?: boolean;
        free?: boolean;
        redirectTo?: string;
        checkoutUrl?: string;
        error?: string;
      };

      if (!res.ok || !data.ok) {
        setError(data.error || "無法建立付款，請稍後再試");
        return;
      }

      if (data.free && data.redirectTo) {
        window.location.href = data.redirectTo;
        return;
      }

      // 統一導向拓新雲端主站綠界結帳
      window.location.href =
        data.checkoutUrl || getNovaOsCheckoutUrl({ planId });
    } catch {
      setError("連線失敗，請稍後再試");
    } finally {
      setLoadingId(null);
    }
  }

  return (
    <section id="pricing" className="section-pad">
      <div className="section-shell">
        <Reveal>
          <div className="mx-auto max-w-2xl text-center">
            <p className="eyebrow justify-center">方案與收費</p>
            <h2 className="headline mt-3 text-[clamp(1.75rem,4vw,2.6rem)]">
              拓新雲端統一金流
            </h2>
            <p className="mt-4 text-base leading-7 text-ink-muted md:text-lg">
              付費方案透過拓新雲端主站綠界 ECPay
              結帳，與 DocMate、NovaStore 同一帳號與付款體系。
            </p>
          </div>
        </Reveal>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {PRICING_PLANS.map((plan, index) => (
            <Reveal key={plan.id} delayMs={index * 50}>
              <article
                className={`soft-panel flex h-full flex-col p-5 ${
                  plan.highlight
                    ? "border-accent/40 ring-2 ring-[rgba(166,124,93,0.2)]"
                    : ""
                }`}
              >
                {plan.highlight ? (
                  <span className="mb-3 inline-flex w-fit rounded-full bg-accent-soft px-2.5 py-1 text-[0.7rem] font-semibold tracking-wide text-accent-deep">
                    最受歡迎
                  </span>
                ) : (
                  <span className="mb-3 inline-block h-6" />
                )}
                <h3 className="font-display text-lg font-semibold">
                  {plan.name}
                </h3>
                <p className="mt-3 flex items-baseline gap-1">
                  <span className="font-display text-3xl font-semibold tracking-tight">
                    ${plan.price.toLocaleString("zh-TW")}
                  </span>
                  <span className="text-sm text-ink-muted">
                    TWD {plan.period}
                  </span>
                </p>
                <p className="mt-3 text-sm leading-6 text-ink-muted">
                  {plan.description}
                </p>
                <ul className="mt-5 flex-1 space-y-2">
                  {plan.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-start gap-2 text-sm text-ink"
                    >
                      <Check
                        size={16}
                        className="mt-0.5 shrink-0 text-accent"
                        aria-hidden
                      />
                      {feature}
                    </li>
                  ))}
                </ul>
                <button
                  type="button"
                  className={`btn mt-6 w-full ${
                    plan.highlight ? "btn-primary" : "btn-secondary"
                  }`}
                  disabled={loadingId === plan.id}
                  onClick={() => handleCheckout(plan.id)}
                >
                  {loadingId === plan.id ? (
                    <>
                      <Loader2 size={16} className="animate-spin" aria-hidden />
                      導向拓新雲端…
                    </>
                  ) : plan.paid ? (
                    <>
                      {plan.cta}
                      <ExternalLink size={14} aria-hidden />
                    </>
                  ) : (
                    plan.cta
                  )}
                </button>
              </article>
            </Reveal>
          ))}
        </div>

        {error ? (
          <p className="mt-6 text-center text-sm text-[#8a3d2f]">{error}</p>
        ) : null}
        <p className="mt-6 text-center text-xs leading-6 text-ink-muted">
          付費將開啟{" "}
          <a
            href={NOVAOS_HUB_URL}
            className="font-medium text-ink underline-offset-2 hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            拓新雲端 NovaOS
          </a>{" "}
          登入並完成綠界付款；免費體驗可直接在本站使用 1 次 Credit。
        </p>
      </div>
    </section>
  );
}
