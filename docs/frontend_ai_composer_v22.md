# v22 前端 AI Composer 實作說明

版本：v22  
產生時間：2026-06-11T15:21:47+00:00

## 核心原則

新增文章不是由後端知識庫產生。後端只提供：

1. source packets
2. blueprints
3. citation check
4. duplicate / cooldown check
5. 卑南文化遺址禁止關聯檢查
6. sensitivity / license check
7. review queue / publish check

主站前端或主站 server route 才負責選擇 AI provider 並產生草稿。

## 推薦流程

```txt
前端選 source packet
→ 使用者輸入想法
→ 主站 server route 呼叫 OpenAI/Kimi/local provider
→ 草稿帶 usedClaimIds / usedSourceIds 回後端檢查
→ 後台審核
→ 發布
```

## 不可做

- 不可讓後端知識庫直接產文章本文
- 不可把使用者想法寫成史實
- 不可使用卑南文化遺址 / Beinan Site 作為卑南族文化來源
- 不可公開未審核高敏感祭儀內容
