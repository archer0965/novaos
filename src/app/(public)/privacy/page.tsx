import type { Metadata } from "next";
import Link from "next/link";
import { LegalPageShell } from "@/components/legal/legal-page-shell";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "隱私權政策",
  description:
    "拓新雲端 NovaOS 隱私權政策：個資蒐集、使用、保存、第三方與當事人權利。",
};

export default function PrivacyPage() {
  return (
    <LegalPageShell
      active="privacy"
      title="隱私權政策"
      description={`本政策依據中華民國《個人資料保護法》及相關法令訂定，說明 ${siteConfig.legalName} 如何蒐集、處理與利用個人資料。`}
    >
      <Section title="1. 適用範圍">
        <p>
          本政策適用於拓新雲端 NovaOS
          總站及旗下工具（含 NovaStore、拓脈預約、Nova AI Doc、拓維空間
          NovaDimension、訂閱管家 等）於提供服務過程中所蒐集之個人資料。獨立產品站若另有補充說明，應一併適用；若有衝突，以對當事人保護較有利者為優先，並以總站法律中心為統一參考。
        </p>
      </Section>

      <Section title="2. 蒐集之個人資料類別">
        <p>視您使用情境，我們可能蒐集：</p>
        <ul>
          <li>
            <strong>帳號與聯絡資料</strong>
            ：Email、顯示名稱、店名／工作室名稱、電話、地址（若您提供）、客服往來內容。
          </li>
          <li>
            <strong>營運設定資料</strong>
            ：銀行代碼／帳號後段資訊、LINE User
            ID、自有官方帳號設定、預約／賣場／文件等業務設定。
          </li>
          <li>
            <strong>交易與使用資料</strong>
            ：訂單或回報內容、預約紀錄、文件處理紀錄、訂閱方案、用量與操作日誌。
          </li>
          <li>
            <strong>買家／終端使用者資料（由您或終端使用者提交）</strong>
            ：例如姓名或稱呼、轉帳金額、帳號後五碼、備註、預約聯絡資訊等——僅供對應服務提供者核對與履約。
          </li>
          <li>
            <strong>金流相關資料</strong>
            ：由綠界科技等金流業者處理之付款結果、交易編號與必要訂單資訊；我們不儲存完整信用卡卡號。
          </li>
          <li>
            <strong>技術與資安資料</strong>
            ：IP、裝置／瀏覽器類型、必要 Cookie／工作階段識別碼、錯誤與存取日誌。
          </li>
        </ul>
      </Section>

      <Section title="3. 蒐集目的與利用方式">
        <ul>
          <li>提供、維護、改善本服務與帳號體系（含登入、權限、訂閱與用量控管）。</li>
          <li>完成付款、帳務對帳、客服支援與爭議處理。</li>
          <li>發送服務通知（含 Email、LINE 或其他您啟用之通道）。</li>
          <li>資安防護、詐欺防制、系統除錯與效能分析。</li>
          <li>履行法令義務或配合主管機關合法要求。</li>
          <li>
            買家／客戶透過回報頁、預約表單等提交之資料，原則上
            <strong>僅供對應賣家或服務提供者履約與核對</strong>
            ，不會建立公開目錄或用於無關行銷。
          </li>
        </ul>
      </Section>

      <Section title="4. 第三方服務與委託處理">
        <p>
          為營運本服務，我們可能委託或串接下述類型之處理者／第三方（實際供應商可能調整）：
        </p>
        <ul>
          <li>金流：綠界科技（ECPay）等；</li>
          <li>通訊：LINE Messaging API／官方帳號；</li>
          <li>雲端基礎設施與資料庫：如 Vercel、Supabase 等；</li>
          <li>必要時之電子郵件或錯誤追蹤服務。</li>
        </ul>
        <p>
          我們僅在提供服務所必要範圍內提供資料，並要求對方依約與法令善盡保護義務。我們
          <strong>不會販售</strong>您的個人資料。
        </p>
      </Section>

      <Section title="5. 資料保存、安全與跨境傳輸">
        <ul>
          <li>傳輸採 SSL／TLS 等加密；資料庫採存取控制與權限隔離（含 Row Level Security 等機制，視產品而定）。</li>
          <li>
            保存期間以達成蒐集目的所必要、以及法令要求之最短期間為原則；屆期後將刪除、匿名化或停止利用。
          </li>
          <li>
            雲端服務可能涉及境外機房；我們將選擇具合理資安水準之供應商，並採取適當保護措施。
          </li>
          <li>
            請注意：任何網路傳輸與儲存皆無法保證百分之百安全；請您亦妥善保管帳密與裝置。
          </li>
        </ul>
      </Section>

      <Section title="6. Cookie 與類似技術">
        <p>
          本服務使用登入工作階段（Session）Cookie
          與必要之功能 Cookie，以維持登入狀態與基本安全。我們原則上不使用第三方廣告追蹤
          Cookie；若未來有變更，將更新本政策並視情況取得同意。
        </p>
      </Section>

      <Section title="7. 當事人權利">
        <p>
          依個資法，您就其個人資料得行使查詢、閱覽、製給複製本、補充更正、請求停止蒐集／處理／利用或刪除等權利（法令另有規定者除外）。請透過本頁底部「總客服聯絡窗口」提出；我們將於合理期間內回覆（原則上
          15 日內，必要時得延長並告知原因）。
        </p>
        <p>
          若您為賣家／工作室，您對其客戶資料之處理亦應自行履行個資法義務；本服務僅提供工具，不免除您作為資料控管者之責任。
        </p>
      </Section>

      <Section title="8. 未成年人">
        <p>
          本服務主要提供予具完全行為能力之人。若您未滿十八歲，請在法定代理人同意下使用，並由法定代理人閱讀本政策。
        </p>
      </Section>

      <Section title="9. 政策更新">
        <p>
          我們得視法規或服務調整更新本政策，並於本頁公告生效。重大變更時，將以站內、Email
          或其他合理方式通知用戶。完整文件索引見{" "}
          <Link href="/legal" className="text-primary underline-offset-2 hover:underline">
            條款與法律中心
          </Link>
          。
        </p>
      </Section>
    </LegalPageShell>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-3 text-sm leading-relaxed text-foreground/90">
      <h2 className="font-display text-xl font-semibold">{title}</h2>
      <div className="space-y-3 [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-5">
        {children}
      </div>
    </section>
  );
}
