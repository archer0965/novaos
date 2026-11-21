# 拓新雲端 NovaOS — Agent 指引

## 專案定位

本 repo 是 **拓新雲端品牌主站**（`package.json` name: `novaos`），正式網址 https://paycheck.com.de。

子產品各自為**獨立專案／獨立 git history**：

| 產品 | 網址 | 獨立專案 |
|------|------|----------|
| NovaStore | https://novastore-omega.vercel.app | `novastore`（`ecosystem/sites.json`） |
| Nova AI Doc | https://docmate-ai-one.vercel.app | `docmate-ai` |
| 拓脈預約 | https://taiwanbiz.vercel.app | 獨立站（repo 待綁） |
| SubKeeper | https://temporary-speedy-reef-cy4xhhu.vercel.app | 獨立站（repo 待綁） |

## 一次改多站 vs 只改一站

- **一次改多站**：在本專案執行 `npm run ecosystem:sync`，到 `/agent/ecosystem-sites/<id>` 修改後，**在該子目錄內** `git push` 回子站 remote。
- **只改一站**：開啟該站自己的 Cursor／GitHub 專案即可；不要把子站原始碼 commit 進本 hub repo。

Checkout 放在主站目錄外（預設 `/agent/ecosystem-sites`），避免 Next build／tsc 掃到子站，也避免 git 歷史互相污染。

詳見 `ecosystem/README.md`。

## 常用指令

```bash
npm run dev
npm run audit:sites
npm run ecosystem:sync
```
