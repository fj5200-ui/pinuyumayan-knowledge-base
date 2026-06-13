# Next upgrade plan v48

1. **VPS 實機 DB 驗收** — 在真實 VPS MySQL 跑 0043 migration、transaction integration tests、rollback/idempotency/audit trigger，輸出可附在後台的測試報告。
2. **後台完整工作台** — 把 v47 review action UI 做成表格批次篩選、逐筆表單、附件上傳進度、審核歷程抽屜、角色可見性。
3. **搜尋分析看板** — 將 v47 query logs 彙整成日/週報，加入熱門查詢、無結果詞、facet 點擊、p95/p99 圖表與告警通知。
4. **權威來源候選合併** — 接上 live fetch 後，加入候選去重、相似度合併、人工 approve metadata-only、來源引用完整度檢查。
5. **模型治理可視化** — 用後台圖表顯示 WER/CER/MOS、lineage DAG、模型卡簽核與不可發布原因，支援 PDF/Markdown 匯出。
6. **主站視覺完成度** — 整體統一日夜模式、首頁/音樂/文化/族語卡片設計、OG 驗收、自動 sitemap ping 與 Core Web Vitals 預檢。
