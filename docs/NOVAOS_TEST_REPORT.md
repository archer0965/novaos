# NovaOS 測試報告

日期：2026-11-22（Asia/Taipei）  
環境：Cloud Agent 靜態審查 + HTTP 探測；**未**對正式金流／正式客戶資料寫入測試。

圖例：✅ 通過｜⚠️ 部分／僅探測｜❌ 失敗｜🚫 未測｜⛔ 無原始碼

---

## 1. 首頁可開啟

| 站 | 結果 | 備註 |
|----|------|------|
| Hub paycheck.com.de | ✅ | 200 |
| DocMate | ✅ | 200 |
| NovaStore | ⚠️ | 先前 audit 有紀錄；本輪未重跑完整 Playwright |
| 拓脈 | ✅ | 200（標題拓脈） |
| SubKeeper | ✅ | 200（標題 SubKeeper） |

---

## 2. 註冊／登入／登出

| 站 | 註冊 | 登入 | 登出 | 備註 |
|----|------|------|------|------|
| Hub | 🚫 | 🚫 | 🚫 | 有 `/signup` `/login` 程式；未用測試帳號打正式 Auth |
| DocMate | ⚠️ | 🚫 | 🚫 | `/signup` 路由 ✅ 307；實際 signUp API **未測** |
| NovaStore | 🚫 | 🚫 | 🚫 | 程式有頁面；未測 |
| 拓脈 | ❌ | ⚠️ | ⛔ | `/signup` 404；`/login` 200；無原始碼 |
| SubKeeper | N/A | N/A | N/A | 免登入定位；`/login` 404 |

---

## 3. 權限保護

| 項目 | 結果 |
|------|------|
| DocMate `/dashboard` 未登入導向 | 程式有 middleware；**未測** live |
| Hub `/dashboard` | 程式有；**未測** live |
| profiles 竄改防護 | migration 未套用 → **正式仍可能失敗** |

---

## 4. 價格顯示（程式常數 vs 要求）

| 產品 | 要求 | 程式 | 結果 |
|------|------|------|------|
| NovaStore 299／499 | 要核對 | 獨立站有 299／499 | ⚠️ 年繳數字與 hub 不完全相同 |
| DocMate 199／499 | 要核對 | plans.ts 一致 | ✅ 常數 |
| 全家桶 499 | 要核對 | hub unlimited 499 | ✅ 常數 |
| 拓脈創始優惠 | 要核對 | ⛔ 無原始碼 | 🚫 |
| SubKeeper | 依程式 | ⛔ 無原始碼；公開免登入 | 🚫 |

---

## 5. 產品操作流程

| 流程 | 結果 |
|------|------|
| DocMate PDF／摘要／問答 | 🚫 無測試帳號＋Gemini 正式呼叫（避免耗額度／金鑰） |
| NovaStore 下單／ATM | 🚫 禁止對正式賣場測試單 |
| Hub booking 雙重預約 | 🚫 併發未測；程式審查標 P1 |
| SubKeeper CRUD | ⛔ 無原始碼 |

---

## 6. Playwright／自動化

- Hub 有 `scripts/audit-sites.js` + `npm run audit:sites`  
- 本輪**未**重跑完整五站截圖稽核（可於你批准後執行，只讀）  
- DocMate 有 `security:smoke` script；**未執行**（需環境變數）

---

## 7. 明確標記「未測試」清單

1. 任何 ECPay 真實／測試刷卡  
2. LINE 正式推播  
3. Supabase 正式 RLS 以 JWT 攻擊驗證  
4. DocMate Gemini 上傳全文流程  
5. Google OAuth  
6. 拓脈／SubKeeper 全部後端行為  
7. 套用 `026` 後的回歸  

---

## 8. 已驗證項目

1. DocMate `GET /signup` → 307 `Location: /login?mode=signup`  
2. 五站中三站原始碼可讀且完成靜態稽核  
3. 拓脈／SubKeeper Vercel **Git Not connected**（`vercel project inspect`）
