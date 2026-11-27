import { Resend } from "resend";
import {
  formatExpiresAtTaipei,
  getCycleLabel,
  getNovaShieldPublicUrl,
} from "./subscription";
import type { BillingCycle } from "./types";

function getResendClient(): Resend | null {
  const key = (process.env.RESEND_API_KEY || "").trim();
  if (!key) {
    console.warn("[novashield-email] RESEND_API_KEY not set — skip sending");
    return null;
  }
  return new Resend(key);
}

function getFromAddress(): string {
  return (
    (process.env.RESEND_FROM_EMAIL || "").trim() ||
    "Nova商譽寶 NovaShield <noreply@paycheck.com.de>"
  );
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

async function sendMail(options: {
  to: string;
  subject: string;
  html: string;
  logTag: string;
}): Promise<{ ok: boolean; id?: string; skipped?: boolean; error?: string }> {
  const to = options.to.trim();
  if (!to) return { ok: false, error: "Missing recipient email" };

  try {
    const resend = getResendClient();
    if (!resend) {
      return { ok: false, skipped: true, error: "RESEND_API_KEY not configured" };
    }

    const { data, error } = await resend.emails.send({
      from: getFromAddress(),
      to: [to],
      subject: options.subject,
      html: options.html,
    });

    if (error) {
      console.error(`[novashield-email] ${options.logTag} failed:`, error);
      return { ok: false, error: error.message || String(error) };
    }
    return { ok: true, id: data?.id };
  } catch (error) {
    console.error(`[novashield-email] ${options.logTag} exception:`, error);
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Unknown email error",
    };
  }
}

export async function sendNovaShieldExpiryReminderEmail(options: {
  to: string;
  shopId: string;
  shopName: string;
  billingCycle?: BillingCycle | null;
  expiresAt: string;
  daysLeft: number;
}) {
  const renewUrl = `${getNovaShieldPublicUrl()}/admin?shop=${encodeURIComponent(options.shopId)}#upgrade`;
  const cycleLabel = getCycleLabel(options.billingCycle);
  const expiresLabel = formatExpiresAtTaipei(options.expiresAt);
  const dayText =
    options.daysLeft <= 1 ? "明天即將到期" : `將於 ${options.daysLeft} 天後到期`;

  const html = `<!DOCTYPE html>
<html lang="zh-Hant">
<head><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1" /></head>
<body style="margin:0;padding:0;background:#faf8f5;font-family:-apple-system,BlinkMacSystemFont,'Noto Sans TC',sans-serif;color:#0f172a;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px;">
    <tr><td align="center">
      <table role="presentation" width="100%" style="max-width:560px;background:#ffffff;border-radius:16px;border:1px solid #e2e8f0;overflow:hidden;">
        <tr>
          <td style="padding:24px 28px;background:#0f172a;color:#ffffff;">
            <p style="margin:0;font-size:12px;color:#fbbf24;font-weight:700;">拓新雲端 NovaOS・Nova商譽寶 (NovaShield)</p>
            <h1 style="margin:8px 0 0;font-size:21px;">專業版方案${escapeHtml(dayText)}</h1>
          </td>
        </tr>
        <tr>
          <td style="padding:24px 28px;font-size:15px;line-height:1.7;color:#334155;">
            <p style="margin:0 0 12px;">您好，門市「<strong>${escapeHtml(options.shopName)}</strong>」的 <strong>Nova商譽寶 專業版（${escapeHtml(cycleLabel)}）</strong>即將到期。</p>
            <p style="margin:0 0 18px;">方案到期時間（台北時間）：<strong>${escapeHtml(expiresLabel)}</strong></p>
            <p style="margin:0 0 22px;">為避免 LINE 官方帳號即時私訊引導、多維度評分與品牌客製化功能暫停（到期後將自動鎖定回免費版），請提前透過綠界 ECPay 續費。提前續費會由原到期日往後累加天數，不會吃掉剩餘效期。</p>
            <a href="${renewUrl}" style="display:inline-block;padding:13px 22px;border-radius:12px;background:#f59e0b;color:#ffffff;text-decoration:none;font-weight:700;">
              前往綠界續費專業版
            </a>
            <p style="margin:20px 0 0;font-size:12px;color:#94a3b8;word-break:break-all;">
              若按鈕無法點擊，請複製網址：${renewUrl}
            </p>
          </td>
        </tr>
        <tr>
          <td style="padding:16px 28px 22px;border-top:1px solid #f1f5f9;font-size:12px;color:#94a3b8;">
            此信由拓新雲端 NovaOS・Nova商譽寶自動寄出（到期前 3 天定期繳費提醒）。
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

  return sendMail({
    to: options.to,
    subject: `【Nova商譽寶】${options.shopName} 專業版方案${dayText}，請記得續費`,
    html,
    logTag: "expiry-reminder",
  });
}

export async function sendNovaShieldSubscriptionConfirmedEmail(options: {
  to: string;
  shopId: string;
  shopName: string;
  billingCycle: BillingCycle;
  expiresAt: string;
}) {
  const adminUrl = `${getNovaShieldPublicUrl()}/admin?shop=${encodeURIComponent(options.shopId)}`;
  const cycleLabel = getCycleLabel(options.billingCycle);
  const expiresLabel = formatExpiresAtTaipei(options.expiresAt);

  const html = `<!DOCTYPE html>
<html lang="zh-Hant">
<head><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1" /></head>
<body style="margin:0;padding:0;background:#faf8f5;font-family:-apple-system,BlinkMacSystemFont,'Noto Sans TC',sans-serif;color:#0f172a;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px;">
    <tr><td align="center">
      <table role="presentation" width="100%" style="max-width:560px;background:#ffffff;border-radius:16px;border:1px solid #e2e8f0;overflow:hidden;">
        <tr>
          <td style="padding:24px 28px;background:#0f172a;color:#ffffff;">
            <p style="margin:0;font-size:12px;color:#fbbf24;font-weight:700;">拓新雲端 NovaOS・Nova商譽寶 (NovaShield)</p>
            <h1 style="margin:8px 0 0;font-size:21px;">專業版付款成功，功能已全面開通</h1>
          </td>
        </tr>
        <tr>
          <td style="padding:24px 28px;font-size:15px;line-height:1.7;color:#334155;">
            <p style="margin:0 0 12px;">感謝您訂閱 <strong>Nova商譽寶 專業版（${escapeHtml(cycleLabel)}）</strong>！門市「<strong>${escapeHtml(options.shopName)}</strong>」已解鎖 LINE 即時私訊引導、多維度評分與品牌客製化。</p>
            <p style="margin:0 0 18px;">本次方案到期時間（台北時間）：<strong>${escapeHtml(expiresLabel)}</strong></p>
            <p style="margin:0 0 22px;">系統將於到期前 3 天自動寄送 Email 提醒您續費。</p>
            <a href="${adminUrl}" style="display:inline-block;padding:13px 22px;border-radius:12px;background:#f59e0b;color:#ffffff;text-decoration:none;font-weight:700;">
              前往店家管理後台設定
            </a>
          </td>
        </tr>
        <tr>
          <td style="padding:16px 28px 22px;border-top:1px solid #f1f5f9;font-size:12px;color:#94a3b8;">
            此信由拓新雲端 NovaOS・Nova商譽寶自動寄出。
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

  return sendMail({
    to: options.to,
    subject: `【Nova商譽寶】${options.shopName} 專業版訂閱開通成功通知`,
    html,
    logTag: "subscription-confirmed",
  });
}
