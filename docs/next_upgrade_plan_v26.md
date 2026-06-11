# v26 下一次完善、開發、升級、優化方案

1. 實際把 v25 主站 routes/lib/components 搬進主站專案。
2. 後台審核 action 寫入資料庫交易與 audit log。
3. HMAC middleware 套全部 `/api/internal/*`，nonce 使用 Redis 或 DB 防重放。
4. 實測 full corpus import，產出音檔/PHON/授權報告。
5. 實作多來源候選 adapter，但全部先進候選區不自動公開。
6. SEO 發布治理接 sitemap、OG、canonical、文章排程與冷卻 dashboard。
