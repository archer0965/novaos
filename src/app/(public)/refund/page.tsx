import type { Metadata } from "next";
import Link from "next/link";
import { LegalPageShell } from "@/components/legal/legal-page-shell";
import { LEGAL_PAYMENT_PROOF_NOTICE } from "@/lib/legal";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "付費與退款政策",
  description:
    "拓新雲端 NovaOS 訂閱計費、綠界金流、取消續訂與退款原則說明。",
};

export default function RefundPolicyPage() {
  return (
    <LegalPageShell
      active="refund"
      title="付費與退款政策"
      description={`${siteConfig.legalName} 之訂閱計費、付款、取消與退款規則。實際金額以結帳當下顯示為準。`}
    >
      <Section title="1. 適用範圍">
        <p>
          本政策適用於透過拓新雲端 NovaOS
          總站或其授權結帳流程（含綠界科技 ECPay）購買之訂閱、方案升級與相關付費項目，涵蓋旗下工具之付費方案（如
          NovaStore、拓脈預約、拓維空間、訂閱管家
          相關付費權益等）。免費額度、試用與人工審核優惠另依站上說明。
        </p>
      </Section>

      <Section title="2. 計費與方案">
        <ul>
          <li>
            付費方案可能包含月繳、半年繳、年繳或其他週期；價格、折扣（早鳥／一般／審核後特約或大使等）與功能差異以定價頁及結帳頁為準。
          </li>
          <li>
            試用期（若有）結束後，若未完成付費升級，相關付費功能可能降級或停用；試用規則以產品說明為準。
          </li>
          <li>
            推薦碼、點數折抵或其他促銷，僅於符合條件時適用，且不得要求轉換為現金，除非法令另有規定。
          </li>
          <li>
            特約店家、推廣大使等資格需人工審核，通過後始適用對應折扣；申請方式見首頁合作區塊與 LINE
            客服。
          </li>
        </ul>
      </Section>

      <Section title="3. 付款方式與金流">
        <ul>
          <li>
            線上付款原則上透過<strong>綠界科技（ECPay）</strong>
            或其他我們公告之金流服務處理。
          </li>
          <li>我們不儲存完整信用卡卡號；卡片資料由金流業者依其規範處理。</li>
          <li>
            付款完成且金流回傳成功後，系統始更新您的方案／權益。若畫面與實際扣款不一致，請儘速聯絡客服並保留交易證明。
          </li>
          <li>
            因銀行、發卡行、3D 驗證或金流端拒絕／延遲所致之失敗，非本服務單方所能控制，我們將在能力範圍內協助查詢。
          </li>
        </ul>
      </Section>

      <Section title="4. 取消續訂">
        <ul>
          <li>
            您可於後台相關訂閱／方案區塊申請或操作取消自動續訂（若該方案有提供自動續訂）。
          </li>
          <li>
            <strong>取消後原則上於下一個計費週期生效</strong>
            ：當期已付款之週期，仍可繼續使用對應付費權益至該週期結束。
          </li>
          <li>
            若產品採「一次付清固定期間」而非自動續訂，則該期間屆滿後權益結束，除非您再次購買。
          </li>
        </ul>
      </Section>

      <Section title="5. 退款原則">
        <ul>
          <li>
            數位訂閱服務一經開通，除法令另有強制規定，或因可歸責於本服務之事由導致
            <strong>核心功能長時間無法使用</strong>
            且我們未能於合理期間內修復或提供替代方案外，<strong>已扣款之當期費用原則上不予退款</strong>
            。
          </li>
          <li>
            下列情形原則上不符合退款：自行改變需求、選錯方案週期、未充分使用額度、帳號遭停權係因違反服務條款、或第三方（裝置、網路、LINE／金流本身）因素。
          </li>
          <li>
            若經確認屬<strong>重複扣款、金額錯誤</strong>
            等金流異常，請於發現後<strong>7 日內</strong>
            透過總客服窗口提出，並提供訂單編號、付款證明與註冊
            Email；我們將協助查明並依綠界與發卡行規範處理。
          </li>
          <li>
            經核准之退款，將依原付款方式退回，實際入帳時間視銀行／金流作業而定。
          </li>
        </ul>
      </Section>

      <Section title="6. 付款憑證">
        <p>{LEGAL_PAYMENT_PROOF_NOTICE}</p>
      </Section>

      <Section title="7. 政策變更與相關文件">
        <p>
          我們得更新本政策並於本頁公告。使用本服務亦應遵守{" "}
          <Link href="/terms" className="text-primary underline-offset-2 hover:underline">
            服務條款
          </Link>
          、{" "}
          <Link href="/privacy" className="text-primary underline-offset-2 hover:underline">
            隱私權政策
          </Link>{" "}
          與{" "}
          <Link
            href="/disclaimer"
            className="text-primary underline-offset-2 hover:underline"
          >
            免責聲明
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
