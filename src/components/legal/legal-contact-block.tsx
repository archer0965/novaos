import { Mail, MessageCircle } from "lucide-react";
import { legalOperatorLines } from "@/lib/legal";
import { siteConfig } from "@/lib/site";

/** Shared “總客服聯絡窗口” block for every legal page. */
export function LegalContactBlock() {
  const operatorLines = legalOperatorLines();

  return (
    <section
      id="legal-contact"
      className="scroll-mt-24 space-y-4 rounded-2xl border border-border/80 bg-card/60 p-5 sm:p-6"
    >
      <h2 className="font-display text-xl font-semibold">總客服聯絡窗口</h2>
      <p className="text-sm leading-relaxed text-muted-foreground">
        條款疑問、帳號權益、付款異常、個資權利行使或商務合作，請透過以下窗口聯繫。回覆時請附上註冊
        Email 與問題摘要，以利加速處理。
      </p>

      <ul className="space-y-3 text-sm">
        <li className="flex items-start gap-3">
          <Mail className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
          <div>
            <p className="font-medium text-foreground">客服 Email</p>
            <a
              className="text-primary underline-offset-2 hover:underline"
              href={`mailto:${siteConfig.supportEmail}?subject=${encodeURIComponent("拓新雲端 NovaOS 客服諮詢")}`}
            >
              {siteConfig.supportEmail}
            </a>
          </div>
        </li>
        <li className="flex items-start gap-3">
          <MessageCircle
            className="mt-0.5 h-4 w-4 shrink-0 text-primary"
            aria-hidden
          />
          <div>
            <p className="font-medium text-foreground">LINE 官方帳號</p>
            <a
              className="text-primary underline-offset-2 hover:underline"
              href={siteConfig.lineOfficialUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              點此加入／私訊客服
            </a>
          </div>
        </li>
      </ul>

      <div className="border-t border-border/70 pt-4 text-xs leading-relaxed text-muted-foreground">
        <p className="font-medium text-foreground/80">營運與登記資訊</p>
        <ul className="mt-2 space-y-1">
          {operatorLines.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
        <p className="mt-3">
          正式公司名稱、統一編號或其他法定聯絡資訊確認後，可於環境變數或{" "}
          <code className="rounded bg-secondary px-1 py-0.5 text-[11px]">
            src/lib/site.ts
          </code>{" "}
          補齊，全站條款頁會自動同步。
        </p>
      </div>
    </section>
  );
}
