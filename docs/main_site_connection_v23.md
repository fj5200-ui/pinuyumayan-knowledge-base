# v23 主站對接指南

本文件說明主站如何對接「卑南族文化綜合平台後端資料庫服務」。

## 架構分工

主站負責：

1. 前台頁面顯示。
2. 前端/Server Route 調用 AI provider。
3. 使用者輸入「想法」。
4. 把 AI 草稿送後端知識庫檢查與審核。

後端知識庫負責：

1. 提供可引用真實史料包。
2. 提供真人音檔發音與語詞資料。
3. 檢查引用完整性。
4. 檢查文章是否重複。
5. 檢查卑南文化遺址禁止關聯。
6. 檢查敏感內容與授權風險。
7. 送入後台審核與發布治理。

> 重點：文章內容不是由知識庫後端生成，而是主站 server-side AI route 生成；知識庫後端只做資料與治理。

## 主站必要環境變數

```env
NEXT_PUBLIC_KB_API_URL=https://kb.pinuyumayan.tw
PINUYUMAYAN_KB_API_URL=https://kb.pinuyumayan.tw
PINUYUMAYAN_MAIN_SITE_CLIENT_ID=main-site-production
PINUYUMAYAN_MAIN_SITE_API_KEY=請放主站 secret
PINUYUMAYAN_HMAC_SECRET=請放 HMAC secret
PINUYUMAYAN_HMAC_ENABLED=true
AI_PROVIDER=openai
OPENAI_API_KEY=sk-proj-xxxx
KIMI_API_KEY=
NEXT_PUBLIC_SITE_URL=https://pinuyumayan.tw
```

不可放到瀏覽器的變數：

```txt
PINUYUMAYAN_MAIN_SITE_API_KEY
PINUYUMAYAN_HMAC_SECRET
OPENAI_API_KEY
KIMI_API_KEY
```

## 主站要新增的 server routes

```txt
/api/kb/health
/api/kb/proxy/[...path]
/api/ai/compose
/api/ai/validate-draft
/api/ai/submit-review
```

## 對接順序

1. 後端知識庫設定 `ALLOWED_ORIGINS=https://pinuyumayan.tw,https://www.pinuyumayan.tw`。
2. 後端建立 `main-site-production` API client。
3. 主站設定 env secrets。
4. 主站 public page 先接 public API。
5. 主站 server route 再接 internal API + HMAC。
6. AI Composer 只在主站 server route 呼叫 AI provider。
7. 草稿送知識庫後端驗證與審核。
8. 後台審核通過後發布。

## 驗收指令

```bash
NEXT_PUBLIC_KB_API_URL=https://kb.pinuyumayan.tw \
PINUYUMAYAN_KB_API_URL=https://kb.pinuyumayan.tw \
PINUYUMAYAN_MAIN_SITE_API_KEY=xxxx \
PINUYUMAYAN_HMAC_SECRET=xxxx \
./deploy/check-main-site-connection-v23.sh
```
