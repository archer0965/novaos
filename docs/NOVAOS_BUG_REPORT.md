# NovaOS Bug 報告

日期：2026-11-22（Asia/Taipei）

格式：原始問題 → 原因 → 修改檔案 → 方式 → 測試 → 結果 → 剩餘風險

---

## P0

### BUG-P0-01 profiles 權益可被客戶端竄改

| 欄位 | 內容 |
|------|------|
| 原始問題 | 登入使用者可能自行改方案／到期日／大使旗標 |
| 原因 | RLS UPDATE 無欄位限制 |
| 修改檔案 | `supabase/migrations/026_profiles_lock_billing_columns.sql` |
| 修改方式 | BEFORE UPDATE trigger 阻擋 entitlement 欄位；service_role 除外 |
| 測試方式 | Staging：使用者 JWT UPDATE plan_type 應失敗 |
| 測試結果 | **未測試（未套用 DB）** |
| 剩餘風險 | 未套用前正式環境仍暴露 |

---

## P1

### BUG-P1-01 DocMate `/signup` 404（已知）

| 欄位 | 內容 |
|------|------|
| 原始問題 | 總站／CTA 連到 `/signup` 404 |
| 原因 | 僅有 `/login`，無 signup 路由 |
| 修改檔案 | `docmate-ai/app/(auth)/signup/page.tsx`、`LoginForm.tsx`、landing CTAs |
| 修改方式 | `/signup` → `/login?mode=signup`；表單讀 mode |
| 測試方式 | `curl -I https://docmate-ai-one.vercel.app/signup` |
| 測試結果 | **通過（前一輪已部署）** 307 → `/login?mode=signup` |
| 剩餘風險 | ecosystem-sites 鏡像未同步；忘記密碼仍缺 |

### BUG-P1-02 拓脈 `/signup` 404

| 欄位 | 內容 |
|------|------|
| 原始問題 | https://taiwanbiz.vercel.app/signup → 404 |
| 原因 | **無法檢查原始碼**；公開行為與 DocMate 舊況類似 |
| 修改檔案 | — |
| 修改方式 | 待取得 repo |
| 測試結果 | 公開探測確認 404 |
| 剩餘風險 | 註冊入口可能中斷 |

### BUG-P1-03 Checkout 預先解鎖模組

| 欄位 | 內容 |
|------|------|
| 原始問題 | 點綠界後未付款也可能已有 `active_modules` |
| 原因 | `api/checkout/route.ts` 在導向金流前寫入 modules |
| 修改檔案 | （待修）`src/app/api/checkout/route.ts`、callback |
| 建議方式 | 成功 callback 才 unlock；或標記 pending |
| 測試結果 | **未改／未測** |
| 剩餘風險 | 營收與權益不一致 |

### BUG-P1-04 DocMate 付費與額度表可能不同步

| 欄位 | 內容 |
|------|------|
| 原始問題 | 升級只導向 hub；本站 cancel 可直接改 free |
| 原因 | 雙寫／單向 deep-link |
| 修改檔案 | 待：hub callback ↔ `docmate_profiles`；DocMate cancel |
| 測試結果 | **端到端未測（避免正式金流）** |
| 剩餘風險 | 付費使用者仍見 free 額度，或反之 |

### BUG-P1-05 Hub booking 併發防撞不足

| 欄位 | 內容 |
|------|------|
| 原始問題 | 同時兩請求可能雙重預約 |
| 原因 | 先 SELECT 再 INSERT；無 exclusion/unique；RLS 開放 INSERT |
| 修改檔案 | 待：API 交易＋DB constraint；關閉公開 INSERT |
| 測試結果 | 程式審查確認；**負載併發未測** |
| 剩餘風險 | 獨立拓脈站是否同源未知 |

---

## P2

| ID | 問題 | 狀態 |
|----|------|------|
| BUG-P2-01 | SubKeeper 被稱為 Nova Pass／拓管 | 文案修正進行中（hub），**未部署** |
| BUG-P2-02 | DocMate 行銷「考題與筆記」未實作 | 未修（建議改文案或實作） |
| BUG-P2-03 | NovaStore 賣場訂單 ATM 無自動比對 | 設計缺口 |
| BUG-P2-04 | NovaStore 商品無完整編輯／刪除／圖上傳 | 功能缺口 |
| BUG-P2-05 | DocMate 無 forgot/reset password | 功能缺口 |
| BUG-P2-06 | Hub 內嵌 AI Doc ≠ DocMate | 產品混淆 |
| BUG-P2-07 | NovaStore／Hub 價格常數不完全一致 | 待你確認權威來源 |

---

## P3

| ID | 建議 |
|----|------|
| BUG-P3-01 | 清除 PayCheck／paycheck-tw 殘留文案與腳本 |
| BUG-P3-02 | 法律頁補公司名／統編 |
| BUG-P3-03 | 統一五站 Footer 連回 `/legal` |
| BUG-P3-04 | 刪除誤建 Vercel 專案 `vbiz` |

---

## 修復紀錄摘要（本輪）

| 項目 | 結果 |
|------|------|
| DocMate signup | 已修且先前已驗證上線 |
| SubKeeper 命名 | hub 原始碼已改；**依指示未部署** |
| profiles 鎖定 migration | 已新增檔案；**未套用 DB** |
| 拓脈／SubKeeper 深度 bug | **無法檢查原始碼** |
