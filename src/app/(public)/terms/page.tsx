import type { Metadata } from "next";
import Link from "next/link";
import { LegalPageShell } from "@/components/legal/legal-page-shell";
import { LEGAL_PAYMENT_PROOF_NOTICE } from "@/lib/legal";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "服務條款",
  description:
    "拓新雲端 NovaOS 服務條款：帳號規範、服務範圍、禁止事項與準據法。",
};

export default function TermsPage() {
  return (
    <LegalPageShell
      active="terms"
      title="服務條款"
      description="規範您使用拓新雲端 NovaOS 及旗下工具與服務之權利義務。付費、取消與退款細節請另見付費與退款政策。"
    >
      <Section title="1. 接受條款">
        <p>
          歡迎使用「{siteConfig.legalName}」（下稱「本服務」）。本服務包含總站帳號體系、訂閱中控，以及旗下
          NovaStore、拓脈預約、Nova商譽寶（NovaShield）、拓維空間（NovaDimension）、訂閱管家
          等雲端工具與相關功能。您註冊、登入或以其他方式使用本服務，即表示您已閱讀、瞭解並同意受本服務條款拘束。若您不同意，請立即停止使用。
        </p>
      </Section>

      <Section title="2. 服務性質與範圍">
        <ul>
          <li>
            本服務為軟體即服務（SaaS）及相關數位工具，協助您進行賣場對帳、預約檔期、空間預覽、訂閱開銷管理等營運或個人用途。
          </li>
          <li>
            本服務屬<strong>系統輔助性質</strong>
            ，不構成法律、財務、稅務、醫療或其他專業顧問意見，亦不代替銀行對帳、金流審查或人工判斷。
          </li>
          <li>
            我們得視營運需要新增、調整、暫停或下架部分功能；重大變更將以合理方式公告。
          </li>
          <li>
            部分產品可能以獨立網域或子站提供，仍受本條款及法律中心其他文件約束，除非該產品另有明示補充條款。
          </li>
        </ul>
      </Section>

      <Section title="3. 帳號與使用規範">
        <ul>
          <li>您應提供正確、完整之註冊與聯絡資訊，並及時更新。</li>
          <li>您應妥善保管登入憑證與 API／金流／LINE 等設定密鑰，不得與他人共用帳號。</li>
          <li>
            不得利用本服務從事詐欺、洗錢、侵害他人權利、散布惡意軟體、干擾系統，或其他違反中華民國法令之行為。
          </li>
          <li>
            透過本服務處理之第三方（如買家、客戶）資料，您應自行確保已取得合法蒐集與利用依據，並以合法、必要且最小化方式處理。
          </li>
          <li>
            若我們合理認定您違反本條款或造成安全風險，得暫停、限制或終止帳號與相關服務，並依法保留進一步主張權利。
          </li>
        </ul>
      </Section>

      <Section title="4. 訂閱、試用與加值資格">
        <ul>
          <li>
            部分功能採免費額度、試用期或付費訂閱制；實際方案、價格與折扣以站上定價頁及結帳畫面為準。
          </li>
          <li>
            特約店家等優惠資格需經人工審核，審核通過後始生效力，細節見首頁合作申請與{" "}
            <Link href="/refund" className="text-primary underline-offset-2 hover:underline">
              付費與退款政策
            </Link>
            。
          </li>
          <li>付款方式、取消續訂與退款規則以付費與退款政策為準。</li>
          <li>{LEGAL_PAYMENT_PROOF_NOTICE}</li>
        </ul>
      </Section>

      <Section title="5. 第三方服務">
        <p>為提供完整功能，本服務可能串接或依賴第三方，包括但不限於：</p>
        <ul>
          <li>綠界科技（ECPay）等金流服務；</li>
          <li>LINE Messaging／官方帳號通知；</li>
          <li>雲端主機、資料庫與身分驗證服務（如 Vercel、Supabase 等）；</li>
          <li>其他您自行設定之外部連結或金流／物流導流。</li>
        </ul>
        <p>
          第三方服務之可用性、條款與資安由其各自業者負責；相關責任限制請見{" "}
          <Link
            href="/disclaimer"
            className="text-primary underline-offset-2 hover:underline"
          >
            免責聲明
          </Link>
          。
        </p>
      </Section>

      <Section title="6. 智慧財產權">
        <p>
          本服務之介面、程式、文案、商標、品牌識別（含「拓新雲端」「NovaOS」及相關產品名稱）等，除另有標示外，其智慧財產權歸營運方或其授權人所有。未經事前書面同意，不得重製、改作、散布或用於商業用途。您於本服務上傳或產生之內容，您仍保留既有權利，並授權我們於提供服務所必要之範圍內儲存、處理與傳輸。
        </p>
      </Section>

      <Section title="7. 條款變更">
        <p>
          我們得視法規、產品或營運需要更新本條款，並於本頁公告「最後更新日期」。重大變更時，將以站內公告、Email
          或其他合理方式通知。您於變更生效後繼續使用本服務，視為接受更新後條款。
        </p>
      </Section>

      <Section title="8. 準據法與管轄">
        <p>
          本條款以中華民國法律為準據法。因本服務所生爭議，雙方應先誠信協商；協商不成時，以台灣台北地方法院為第一審管轄法院。
        </p>
      </Section>

      <Section title="9. 相關文件">
        <ul>
          <li>
            <Link href="/privacy" className="text-primary underline-offset-2 hover:underline">
              隱私權政策
            </Link>
          </li>
          <li>
            <Link href="/refund" className="text-primary underline-offset-2 hover:underline">
              付費與退款政策
            </Link>
          </li>
          <li>
            <Link
              href="/disclaimer"
              className="text-primary underline-offset-2 hover:underline"
            >
              免責聲明
            </Link>
          </li>
          <li>
            <Link href="/legal" className="text-primary underline-offset-2 hover:underline">
              條款與法律中心總覽
            </Link>
          </li>
        </ul>
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
