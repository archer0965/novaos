# NovaOS 五大網站完整稽核報告

- **稽核日期：** 2026-11-22（Asia/Taipei）
- **執行環境：** Cursor Cloud Agent（`/agent`）
- **原則：** 以原始碼為準；無法取得原始碼者明確標示，不以公開首頁代替程式稽核。
- **正式部署：** 本階段**未**經同意部署正式環境（見部署清單）。

---

## 0. 專案可及性總表

| # | 產品 | 公開網址 | 本機原始碼 | GitHub | Vercel 專案 | Git 連接 |
|---|------|----------|------------|--------|-------------|----------|
| 1 | 拓新雲端 NovaOS（主站） | https://paycheck.com.de | ✅ `/agent/paycheck-tw` | 設定目標 `archer0965/novaos`（本機 remote 常未綁定） | `novaos` | 以 CLI 部署為主 |
| 2 | DocMate AI | https://docmate-ai-one.vercel.app | ✅ `/agent/repos/docmate-ai`（另有 `/agent/ecosystem-sites/docmate` 較舊） | ✅ `archer0965/docmate-ai` | `docmate-ai` | ✅ |
| 3 | NovaStore | https://novastore-omega.vercel.app | ✅ `/agent/repos/novastore` | ✅ `archer0965/novastore`（新建立） | `novastore` | 本機曾無 origin；GitHub 已存在 |
| 4 | 拓脈預約 | https://taiwanbiz.vercel.app | ❌ **無法檢查原始碼** | ❌ 未找到 repo | `taiwanbiz` | ❌ Not connected |
| 5 | SubKeeper | https://temporary-speedy-reef-cy4xhhu.vercel.app | ❌ **無法檢查原始碼** | ❌ 未找到 repo | `temporary-speedy-reef-cy4xhhu` | ❌ Not connected |

**結論：** 五站中僅 **3/5** 可做程式碼級稽核。拓脈與 SubKeeper 需你提供 Git repo 或把 Vercel 專案接上 Git 後才能完成深度檢查。

**公開面探測（非程式稽核）：**

- 拓脈：`/`、`/login`、`/pricing` = 200；`/signup` = **404**
- SubKeeper：`/` = 200（標題為 SubKeeper）；`/login` = **404**（符合免登入定位）

---

## 1. 各專案技術

### 1.1 NovaOS Hub（`/agent/paycheck-tw`）

| 項目 | 內容 |
|------|------|
| package | `novaos` |
| Framework | Next.js **14.2.35** App Router, React 18, TS 5, Tailwind 3.4 |
| Auth / DB | Supabase Auth + Postgres（`@supabase/ssr`） |
| 金流 | 綠界 ECPay（訂閱） |
| 通知 | LINE Messaging API、Resend Email |
| 測試 | Playwright（`audit:sites`） |
| 部署 | Vercel `novaos` → `paycheck.com.de` |

### 1.2 DocMate AI（`/agent/repos/docmate-ai`）

| 項目 | 內容 |
|------|------|
| package | `docmate-ai` |
| Framework | Next.js **16.4.6**, React **19** |
| Auth / DB | Supabase（與 NovaOS 共用 Auth 設計；表 `docmate_profiles`） |
| AI | Google Gemini + `unpdf` |
| 金流 | 升級導向 NovaOS ECPay（本站測試金流 UI 已 stub） |
| 部署 | Vercel `docmate-ai` |

### 1.3 NovaStore（`/agent/repos/novastore`）

| 項目 | 內容 |
|------|------|
| package | `novastore` |
| Framework | Next.js **14.2.35**, React 18（自 hub 抽出） |
| Auth / DB | Supabase（本機 `.env` 指向與 hub 相同 project id 跡象） |
| 金流 | ECPay 訂閱 |
| 通知 | LINE |
| 部署 | Vercel `novastore` |

### 1.4 拓脈預約 — **無法檢查原始碼**

- Vercel：Next.js preset、Node 24、**Git 未連接**
- 僅能從公開頁確認品牌名「拓脈（Nova Crest Pulse）」與登入／定價頁存在
- Hub 內嵌有 booking MVP（`/dashboard/booking`、`/api/booking/*`），**不可**視為獨立站完整原始碼

### 1.5 SubKeeper — **無法檢查原始碼**

- Vercel：Next.js、**Git 未連接**
- 公開首頁定位為免登入個人訂閱管家
- **不可**再稱為 Nova Pass（本輪已開始修正 hub 文案）

---

## 2. 主要資料表與關係（有原始碼者）

### Hub / NovaStore（高度同源 schema）

核心：`profiles` ← Auth user；`products` / `orders` / `coupons`；`payment_reports`；`booking_services` / `booking_appointments`；`ai_doc_drafts`；`module_activations`；`ecpay_processed_trades`；`referral_events`。

### DocMate

`docmate_profiles`（方案／額度）、`documents`、`document_chunks`、`chat_messages`、`subscriptions` / `payment_orders`、Storage bucket `documents`。設計意圖：共用 NovaOS Auth，避免覆寫 hub `profiles`。

---

## 3. 主要 API 與路由（摘要）

詳見各子章；重點：

- Hub：`/api/checkout` + `/callback`、`/api/modules/activate`、store/booking/line/admin/cron
- DocMate：`/api/documents*`、`/api/billing*`、`/api/me`；`/signup`→`/login?mode=signup`（已修）
- NovaStore：store orders/products/coupons、report ATM 比對、ECPay、LINE

---

## 4. 已完成功能（程式碼確認）

| 產品 | 已完成（節選） |
|------|----------------|
| Hub | 品牌主站、產品矩陣、法律中心、Supabase 登入註冊、模組啟用、ECPay 訂閱、特約／大使後台、LINE webhook、PWA |
| DocMate | 登入／註冊模式、PDF 上傳解析、摘要、問答＋頁碼引用、額度 RPC、升級導向 hub |
| NovaStore | 賣家賣場、商品、訂單、ATM 回報＋貼上對帳、優惠券、ECPay、LINE digest |
| 拓脈／SubKeeper | **原始碼未取得 → 功能清單無法以程式確認** |

---

## 5. 尚未完成／缺口

1. 拓脈、SubKeeper：**無 repo 可稽核**；拓脈公開 `/signup` 404  
2. DocMate：忘記／重設密碼頁缺失；行銷「考題與筆記」未實作；ecosystem checkout 落後  
3. Hub AI Doc 模組為本地關鍵字 MVP，**≠** DocMate LLM  
4. NovaStore：商品完整編輯／刪除／圖檔上傳不足；賣場訂單 ATM **無**自動比對（僅 payment_reports 有）  
5. 中央價格設定尚未抽出成跨站單一套件（各站仍各自常數）  
6. 統一會員中心 UI（跨產品使用量／付款紀錄總覽）尚未建成  
7. 法律頁正式公司名／統編仍為「待補」

---

## 6. 已確認錯誤（節選）

| ID | 嚴重度 | 問題 |
|----|--------|------|
| B-01 | P0 | `profiles` RLS 允許使用者 UPDATE 整列，可自行改 `plan_type`／`expires_at` 等（hub + NovaStore schema） |
| B-02 | P1 | Hub checkout 開始即寫入 `active_modules`，付款放棄仍可能解鎖 |
| B-03 | P1 | DocMate 升級只 deep-link hub，若 hub 未寫入 `docmate_profiles.plan` 則付費不同步 |
| B-04 | P1 | 拓脈公開 `/signup` 404（類似 DocMate 曾發生） |
| B-05 | P2 | Hub／文案曾將 SubKeeper 稱為 Nova Pass／拓管（已開始修正） |
| B-06 | P2 | DocMate ecosystem-sites 鏡像落後（無 `/signup`） |
| B-07 | P2 | Hub booking 防撞僅 API 查詢，無 DB 唯一／exclusion constraint；RLS 允許任意 INSERT |

---

## 7. 潛在資安風險

見 `NOVAOS_SECURITY_REPORT.md`。最高優先：profiles 權限提升、LINE 密鑰存 profiles、booking 公開 insert、track API 列舉。

---

## 8. 整合困難與相依性

1. **Auth：** DocMate／Hub 設計共用 Supabase Auth；NovaStore 本機 env 同 project id → 需你確認正式環境是否同一 project。  
2. **價格：** Hub 拓脈／NovaStore 299／499；NovaStore 獨立站 free 15 筆＋starter 299／pro 499（年繳金額與 hub half/year 基價公式不完全相同）→ **需你確認以哪邊為準**。  
3. **Pass vs SubKeeper：** Hub `pass` 模組實為「訂閱中控」；SubKeeper 為獨立本機工具 → 已分離命名。  
4. **無 Git 兩站：** 無法 CI／無法 ecosystem sync／無法做 P0 程式修復。

---

## 9. 修復優先順序

1. **P0** profiles 計費欄位鎖定（migration `026` 已寫入，**未**套用正式 DB）  
2. 取得拓脈／SubKeeper 原始碼後補稽核  
3. DocMate 付費→`docmate_profiles` 端到端驗證；補忘記密碼  
4. Checkout 解鎖時機改為付款成功後  
5. 中央 `plans` 設定＋品牌／Footer／法律連結統一  
6. Booking 併發控制強化（若拓脈站同源再套用）

---

## 10. 需要你提供的資訊

1. **拓脈預約** GitHub／GitLab repo URL，或把 Vercel `taiwanbiz` 接上 Git  
2. **SubKeeper** 同上（`temporary-speedy-reef-cy4xhhu`）  
3. 確認五站（或哪些）共用哪一個 **Supabase Project**（URL／ref 即可，勿貼 service role）  
4. 確認正式 ECPay 為 stage 或 live（`ECPAY_STAGE`）  
5. 價格衝突以 **Hub** 還是 **NovaStore 獨立站** 為準  
6. 正式公司名稱、統編、客服 Email／LINE 是否維持現值  
7. 是否同意套用 `026_profiles_lock_billing_columns.sql` 至正式 DB  
8. 是否同意之後部署 hub／DocMate／NovaStore（本輪依指示**未部署**）  
9. 誤建的空 Vercel 專案 `vbiz` 請你於儀表板刪除（CLI 需人工確認名）

---

## 本輪已做修改（尚未部署）

| 檔案 | 原因 |
|------|------|
| `docs/NOVAOS_*.md` | 交付稽核文件 |
| `supabase/migrations/026_profiles_lock_billing_columns.sql` | P0 防護（待你批准套用） |
| `src/lib/novaos.ts`、`product-ecosystem.ts`、`legal.ts`、`sites.json`、文案頁 | SubKeeper／訂閱中控命名分離 |
| DocMate（前一輪已上線）`/signup` redirect | 修復註冊 404 |

**測試結果：** 本輪以靜態程式稽核＋HTTP 探測為主；未對正式客戶執行付款／寫入測試。DocMate `/signup` 先前已驗證 307→`/login?mode=signup`。
