# 下一次完善＆開發＆升級＆優化方案：v24

1. 主站實機串接：把 `webapp/app/api/ai/compose/route.ts` 移入主站，設定 Cloudflare Pages secrets，實測 public / internal / HMAC。
2. 後台審核 UI 接 API：顯示引用完整性、去重 fingerprint、卑南遺址禁止關聯、敏感內容與發布狀態。
3. 千筆語料實測匯入：實跑 full corpus pipeline，輸出音檔覆蓋率、PHON 覆蓋率、授權報告。
4. 多來源 adapter：新增 TIPP、政府、博物館候選來源，但候選資料不自動公開。
5. 主站 SEO 與發布排程：sitemap、OG metadata、同主題冷卻、source packet 使用率 dashboard。
6. 安全壓測：nonce replay、invalid signature、rate limit、CORS、audit log。
