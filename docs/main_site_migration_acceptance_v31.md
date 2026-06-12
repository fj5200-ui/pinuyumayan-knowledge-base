# v31 主站搬移驗收

主站要搬移 v23～v25 的 server routes、HMAC client 與審核元件。驗收重點：

1. `/api/kb/health` 可以連到知識庫。
2. `/api/ai/compose` 在主站 server route 執行，不在瀏覽器暴露 AI key。
3. 草稿送後端知識庫 validate 時有 HMAC + nonce。
4. 草稿 submit-review 能進入後台審核。
5. 瀏覽器 bundle 不含 `PINUYUMAYAN_MAIN_SITE_API_KEY`、`PINUYUMAYAN_HMAC_SECRET`、`OPENAI_API_KEY`、`KIMI_API_KEY`。
