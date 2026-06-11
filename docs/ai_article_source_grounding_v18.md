# v18 主站 AI 發文：真實史料 + 管理者想法 + 去重治理

v18 的目標是讓主站 AI 可以協助產生文章，但不得把 AI 想像、管理者想法或未審核資料當成史實。

## 發文原則

1. 每篇文章至少使用 3 個 `source_grounded_claims_v18` claim。
2. 每個歷史、文化、制度、祭儀、族語發音陳述都必須保留 `claim_id` 與 `source_id`。
3. 管理者想法只能決定角度、語氣、CTA、網站功能導流；不能覆蓋來源事實。
4. 中敏感內容，例如祭儀、祖靈、巫者、會所與生命階段，只能公開摘要，不輸出流程教學。
5. 發布前必須通過 duplicate-check、citation-check、sensitivity-check 與 human/cultural review。

## 主站流程

```txt
管理者輸入想法
→ 選文章 blueprint
→ API 產生 draft plan
→ 主站 AI 根據 draft plan 寫草稿
→ duplicate-check
→ publish-check
→ 後台審核
→ 發布或排程
→ 寫入 article_duplicate_fingerprints_v18
```

## API

```txt
GET  /api/public/ai-article/source-packets
GET  /api/public/ai-article/blueprints
POST /api/internal/ai-article/draft-plan
POST /api/internal/ai-article/duplicate-check
POST /api/internal/ai-article/publish-check
GET  /api/admin/ai-article/review-queue
```

## 去重規則

- 同 slug 直接阻擋。
- 同 canonical fingerprint 直接阻擋。
- 同 source claim set 且角度相似，轉人工審核。
- 同主題 7 天內重複，轉人工審核。
- 發布後必須登錄 fingerprint，避免主站 AI 下次重複發相同文章。
