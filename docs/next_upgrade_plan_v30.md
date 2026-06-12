# v30 下一次完善＆開發＆升級＆優化方案

1. **Production Cutover Checklist**：DNS、Nginx、systemd、HTTPS、CORS、HMAC、備份、rollback 全部列成檢查表。
2. **主站搬移驗收**：把 `webapp` routes/components 實際搬進主站，測 `/api/kb/health`、`/api/ai/compose`、審核頁。
3. **VPS staging 實測報告回填**：把 v29 產出的 acceptance report 回填 DB 並在後台顯示。
4. **搜尋品質調整**：實測十社名稱、族語詞、祭儀公開摘要、真人音檔搜尋。
5. **來源候選實抓**：TIPP、文化部、臺東縣、博物館只進候選區，人工審核後才能轉 public claim。
6. **文章 SEO 發布治理**：sitemap、canonical、OG image、article schema、發布排程、同主題冷卻。
