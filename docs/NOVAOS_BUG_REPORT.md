# NovaOS Bug Report

**更新：** 2026-11-22（Asia/Taipei）

| ID | 嚴重度 | 站 | 問題 | 狀態 |
|----|--------|----|------|------|
| BUG-P0-01 | P0 | hub | `profiles` 計費欄位可被 client 自改（需 migration 026） | 程式已備；**正式 DB 待你套用** |
| BUG-P0-02 | P0 | hub | 付款前解鎖模組 | **已修**（僅 callback 解鎖） |
| BUG-P1-01 | P1 | 拓脈 | `/signup` 404 | **已修**（導向主站註冊；原始碼已還原） |
| BUG-P1-02 | P1 | 拓脈 | 年繳公式與 hub 不一致 | **已修**（改月×12／主站權威；早鳥 15） |
| BUG-P1-03 | P1 | DocMate | 法律頁 `/terms` `/privacy` `/legal` 404 | **已修**（本輪補頁） |
| BUG-P1-04 | P1 | DocMate | 行銷「考題／筆記」可能未實作 | 待確認／改文案 |
| BUG-P1-05 | P1 | NovaStore | `/legal` 404（僅有 terms／privacy） | **已修**（本輪補 `/legal`） |
| BUG-P1-06 | P1 | 拓維 | 購買 CTA 未證實導主站 Pass | **無法修**（無 Git） |
| BUG-P1-07 | P1 | 訂閱管家 | 需登入＋統一導主站 | **已依你指示改為需登入並導向主站** |
| BUG-P2-01 | P2 | hub | 文案殘留「拓管」／不正確「永久免費附贈」 | **已修**（改訂閱中控／訂閱管家用語） |
| BUG-P2-02 | P2 | 訂閱管家 | 歷史 SubKeeper 字樣 | 線上標題已多為「訂閱管家」；無碼站細節無法全清 |
| BUG-P2-03 | P2 | 全站 | 早鳥名額衝突 | **已統一為 15 組** |
| BUG-P2-04 | P2 | hub | `/pricing` 404（價格在 `/#pricing`） | **已修**（redirect） |
| BUG-P2-05 | P2 | 全站 | 跨網域無真正 SSO（同 Supabase 仍需各站登入） | 架構限制；見整合計畫 |
| BUG-P3-01 | P3 | hub | 空 Vercel 專案 `vbiz` | 請你刪除 |

## 已修復（本輪／前輪）

- DocMate `/signup` → `/login?mode=signup`
- NovaStore／DocMate 付費路徑導主站 ECPay
- 主站產品連結：訂閱管家、Nova AI Doc 正式 URL
- 發票文案改付款憑證合規聲明
- hub OG／訂閱管家 OG／NovaStore OG／DocMate OG
