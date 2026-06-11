# 主站 Server-side AI Route v23

## 為什麼 AI provider 要在主站 server route

AI key 不可放在瀏覽器。主站應建立 `/api/ai/compose`，由 server route：

1. 從知識庫取得 source packets。
2. 合併使用者想法。
3. 呼叫 OpenAI/Kimi/local provider。
4. 產生草稿。
5. 呼叫知識庫後端 validate API。
6. 只把 validation result 和 draft preview 回傳前端。

## 禁止事項

- 不得把卑南文化遺址當成卑南族文化來源。
- 不得把你的想法改寫成史實。
- 不得缺 citation source id。
- 不得跳過 duplicate check。
- 不得由知識庫後端自行產生文章本文。

## 發文流程

```txt
source packet → AI draft → backend validation → admin review → publish
```
