# NovaOS 整合計畫（會員／價格／品牌）

日期：2026-11-22（Asia/Taipei）  
原則：**不刪除既有使用者、不擅自合併帳號、不改正式資料。**

---

## 1. 現況 Auth 架構（程式觀察）

| 產品 | Auth | 備註 |
|------|------|------|
| Hub | Supabase Auth | 主帳號體系 |
| DocMate | Supabase Auth | 程式與文案聲稱與 NovaOS **共用**；表用 `docmate_profiles` |
| NovaStore | Supabase Auth | 本機 env 顯示 **同一 project ref 跡象** |
| 拓脈 | 未知 | 無法檢查原始碼；有 `/login` |
| SubKeeper | 設計上免登入／本機 | 公開無 `/login`；**不應強制雲端帳號** |

**不可假設：** 即使 URL 相同，也必須你確認正式環境 project；不同 project 的 `user_id` **不能**直接當同一人。

---

## 2. 建議的 NovaOS Account 路線（安全、漸進）

### 階段 A — 確認與盤點（先做）

1. 你提供：各站正式 `NEXT_PUBLIC_SUPABASE_URL`（可遮罩 key）  
2. 產出對照表：同 project / 異 project  
3. 若異 project：規劃 **Account Linking**（email 驗證後綁定），禁止直接合併 UUID

### 階段 B — 統一入口（不破壞既有）

1. Hub 新增 `/account`（訂閱中控延伸）：已啟用產品、到期日、推薦碼  
2. 各產品登入頁加「使用 NovaOS 帳號」說明＋deep-link  
3. SubKeeper **維持免登入**；可選「匯出／備份」；雲端同步僅在你明確要求後做

### 階段 C — 權益與付款

1. 所有付費寫入只經 **service_role**（配合 `026` trigger）  
2. DocMate plan 以 hub ECPay callback 為唯一真相，或 webhook 回寫  
3. 付款紀錄表（跨產品）讀 `ecpay_processed_trades`＋各產品 subscription 表

### 階段 D — 帳號生命週期

忘記密碼／重設／刪除申請：先在 **Hub + DocMate** 補齊（DocMate 目前缺），再複製模式到 NovaStore／拓脈。

---

## 3. 中央價格設定（建議資料模型）

```ts
type CentralPlan = {
  product_id: "hub" | "novastore" | "booking" | "docmate" | "subkeeper";
  product_name: string;
  product_url: string;
  plan_id: string;
  plan_name: string;
  monthly_price: number;
  yearly_price: number | null;
  half_yearly_price?: number | null;
  trial_days: number;
  usage_limits: Record<string, number>;
  feature_list: string[];
  discount_rules: unknown;
  product_status: "active" | "beta" | "deprecated";
};
```

### 目前程式盤點（衝突待你確認）

| 產品 | 程式所見 |
|------|----------|
| NovaStore（獨立站） | free 15 筆；starter 299／1610／2990；pro 499／2690／4990 |
| Hub 拓脈／Store | starter 299；unlimited 499；另有 half/year 基價 1794／3588 等＋tier 折扣 |
| DocMate | free／pro **199**／business **499** |
| Hub 全家桶 | unlimited **499**/月 含拓脈+Store+AI Doc |
| SubKeeper | 公開免登入；hub 視為免費模組 — **待原始碼確認是否收費** |
| 拓脈創始店家 | 行銷有；**獨立站原始碼未取得** |

**規則：** 發現衝突時**不自行改價**；列差異等你確認權威來源後，再抽到 `@novaos/plans` 或 hub API `/api/plans`。

---

## 4. 品牌統一

| 項目 | 目標 |
|------|------|
| 母品牌 | 拓新雲端 NovaOS |
| 電商 | NovaStore |
| 預約 | 拓脈預約 |
| AI 文件 | **DocMate AI**（避免 DocMeta／僅稱 Nova AI Doc 造成混淆；hub 模組可標「DocMate」） |
| 個人訂閱 | **SubKeeper**（禁止 Nova Pass） |
| Hub pass 模組 UI | 「訂閱中控」（與 SubKeeper 產品分離） |
| 法律 | 一律連 `https://paycheck.com.de/legal` |
| Logo | 使用 hub 已更新之圓形品牌標 |

視覺：Premium SaaS；各產品保留 accent（Store 琥珀、Booking 青、DocMate 品牌藍、SubKeeper 依其站）。

---

## 5. 整合阻礙

1. 拓脈／SubKeeper 無 Git → 無法改 Footer／SSO／價格  
2. 雙 Supabase 風險未確認  
3. Hub 內嵌 MVP 與獨立站雙軌 → 需決定「redirect-only」或「繼續維護」

---

## 6. 下一步（需你點頭）

1. 提供兩站 repo 或連接 Vercel Git  
2. 確認 Supabase 是否共用  
3. 確認價格權威表  
4. 批准 `026` 與後續部署  
5. 確認 SubKeeper 永遠本機 or 可選登入同步
