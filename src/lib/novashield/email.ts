import { renderStarString } from "./line";
import type { EmailFeedbackResult } from "./types";
import { isAllowedEmailEndpoint } from "./validation";

export interface SendEmailFeedbackInput {
  shopId: string;
  shopName: string;
  contactEmail: string;
  emailFormEndpoint?: string;
  rating: number;
  suggestion: string;
  customerName?: string;
  phone?: string;
}

export async function sendEmailFeedback(
  input: SendEmailFeedbackInput,
): Promise<EmailFeedbackResult> {
  const rounded = Math.max(1, Math.min(5, Math.round(input.rating)));
  const recipientEmail = input.contactEmail.trim() || "owner@example.com";
  const subject = `[Nova商譽寶 客訴通知] ${input.shopName} 收到 ${rounded} 星回饋`;
  const sentAt = new Date().toLocaleString("zh-TW", {
    timeZone: "Asia/Taipei",
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });

  const bodyText = [
    `門市名稱：${input.shopName} (${input.shopId})`,
    `總體星等：${renderStarString(rounded)} (${rounded} / 5 星)`,
    `改善建議：${input.suggestion.trim()}`,
    `顧客姓名：${input.customerName?.trim() || "未提供"}`,
    `聯絡電話：${input.phone?.trim() || "未提供"}`,
    `回報時間：${sentAt} (台北時間)`,
  ].join("\n");

  const endpoint = input.emailFormEndpoint?.trim() ?? "";

  if (endpoint && isAllowedEmailEndpoint(endpoint)) {
    const isWeb3Forms = endpoint.includes("api.web3forms.com");
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        subject,
        shopId: input.shopId,
        shopName: input.shopName,
        rating: `${rounded} 星`,
        message: bodyText,
        customerName: input.customerName?.trim() || "未提供",
        phone: input.phone?.trim() || "未提供",
        replyto: recipientEmail,
      }),
    });

    if (!response.ok) {
      throw new Error(
        `Email 通知服務（${isWeb3Forms ? "Web3Forms" : "Formspree"}）回傳錯誤狀態 ${response.status}，請檢查表單端點設定。`,
      );
    }

    return {
      mode: "live",
      providerLabel: isWeb3Forms ? "Web3Forms" : "Formspree",
      recipientEmail,
      subject,
      bodyText,
      sentAt,
    };
  }

  await new Promise((resolve) => setTimeout(resolve, 450));

  return {
    mode: "mock",
    providerLabel: "Mock 模擬 Email（可於後台串接 Formspree / Web3Forms）",
    recipientEmail,
    subject,
    bodyText,
    sentAt,
  };
}
