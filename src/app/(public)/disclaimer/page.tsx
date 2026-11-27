import type { Metadata } from "next";
import Link from "next/link";
import { LegalPageShell } from "@/components/legal/legal-page-shell";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "免責聲明",
  description:
    "拓新雲端 NovaOS 免責聲明：系統輔助性質、責任限制與第三方服務說明。",
};

export default function DisclaimerPage() {
  return (
    <LegalPageShell
      active="disclaimer"
      title="免責聲明"
      description={`說明 ${siteConfig.legalName} 服務之輔助性質、資訊正確性、第三方依賴與責任限制。`}
    >
      <Section title="1. 系統輔助性質">
        <p>
          拓新雲端 NovaOS
          及旗下工具（含 NovaStore、拓脈預約、Nova商譽寶、拓維空間
          NovaDimension、訂閱管家 等）係提供數位流程與資訊輔助，旨在提升營運或個人管理效率。本服務：
        </p>
        <ul>
          <li>不構成法律、會計、稅務、投資、醫療或其他專業意見；</li>
          <li>不代替銀行對帳、金流風控、人工審核或您對交易真實性之判斷；</li>
          <li>
            AI
            擬真預覽或其他自動產生內容可能與實際成果有所差異，您應自行評估後再依賴。
          </li>
        </ul>
      </Section>

      <Section title="2. 資訊與結果正確性">
        <ul>
          <li>
            我們盡合理努力維持服務穩定與資料正確，但不保證服務永不中斷、完全無誤或滿足您的特定目的。
          </li>
          <li>
            因您輸入錯誤資料、未妥善設定（含銀行帳號、LINE、金流參數）、或未即時更新資訊所致之後果，應由您自行負責。
          </li>
          <li>
            賣場價格、庫存、預約名額等，以您或您授權人員之設定與上傳為準。
          </li>
        </ul>
      </Section>

      <Section title="3. 第三方服務與連結">
        <p>
          本服務可能依賴或連結至第三方，包括但不限於綠界金流、LINE
          通知、雲端主機與資料庫、物流／賣場導流網站等。對於：
        </p>
        <ul>
          <li>第三方服務之中斷、延遲、錯誤、資安事件或條款變更；</li>
          <li>您自行設定之外部連結、金流或物流服務；</li>
          <li>非由我們控制之網路、裝置或作業系統問題；</li>
        </ul>
        <p>
          於法律允許之最大範圍內，我們不負賠償或保證責任，但會在合理範圍內協助釐清與客服溝通。
        </p>
      </Section>

      <Section title="4. 使用者內容與交易關係">
        <ul>
          <li>
            賣家與買家、工作室與客戶之間的買賣、服務契約、金流爭議、退換貨或客訴，原則上由該等當事人自行處理；本服務僅提供工具平台。
          </li>
          <li>
            您不得上傳違法、侵權或含惡意程式之內容；若因您之內容造成第三方損害，您應自行負責並使本服務免於請求。
          </li>
        </ul>
      </Section>

      <Section title="5. 責任限制">
        <p>
          於法律允許範圍內，因使用或無法使用本服務所生之任何間接、附隨、懲罰性或逸失利益損害，我們不負責任。我們對單一事件之總責任上限，以您就該爭議事件所支付之
          <strong>最近一期訂閱費用</strong>
          為限（若當期未付費，則以新台幣零元為上限），法令強制規定不得限制者除外。
        </p>
      </Section>

      <Section title="6. 不可抗力">
        <p>
          因天災、戰亂、政府行為、疫情、停電、網路骨幹故障、資安攻擊、供應商全面中斷等不可抗力或非我們合理可控之事由，致服務遲延或無法履行時，於該事由存續期間得免除或合理調整相關責任。
        </p>
      </Section>

      <Section title="7. 相關文件">
        <p>
          本免責聲明與{" "}
          <Link href="/terms" className="text-primary underline-offset-2 hover:underline">
            服務條款
          </Link>
          、{" "}
          <Link href="/privacy" className="text-primary underline-offset-2 hover:underline">
            隱私權政策
          </Link>
          、{" "}
          <Link href="/refund" className="text-primary underline-offset-2 hover:underline">
            付費與退款政策
          </Link>{" "}
          共同構成法律中心文件；總覽見{" "}
          <Link href="/legal" className="text-primary underline-offset-2 hover:underline">
            /legal
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
