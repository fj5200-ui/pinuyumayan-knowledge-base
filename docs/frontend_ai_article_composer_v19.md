# v19 前端 AI 文章 Composer

## 核心修正

文章新增不再由後端知識庫服務生成。後端只提供：

1. 可引用的 source packets / verified claims
2. duplicate check
3. citation check
4. sensitivity check
5. review queue
6. publish check

前端負責：

1. 取得 source packet
2. 結合你的想法/草稿
3. 呼叫前端自己的 AI provider
4. 將草稿送回後端驗證
5. 送審，不直接公開

## 禁止事項

- AI 不得把使用者想法改寫成史實。
- AI 不得新增無來源歷史敘述。
- AI 不得生成祭儀操作教學、禁忌、祖靈/巫術秘密內容。
- 後端不得保存 AI provider key。
- 後端 deprecated `/api/internal/ai-article/draft-plan`，保留只是相容舊版。

## v19 新端點

```txt
GET  /api/public/ai-article/frontend-composer-config
POST /api/internal/ai-article/source-pack/resolve
POST /api/internal/ai-article/client-draft/validate
POST /api/internal/ai-article/client-draft/submit-review
```

## 流程

```txt
使用者想法
→ 前端選 blueprint/source packet
→ 前端呼叫 AI provider
→ 草稿回傳後端 validate
→ duplicate/sensitivity/citation check
→ 進 review queue
→ 後台審核
→ publish check
→ 發佈
```
