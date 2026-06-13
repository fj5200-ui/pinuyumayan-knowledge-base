# 下一次完善＆開發＆升級＆優化方案：v47

1. **審核 UI 實操作**：把 v46 reviewer queue 的指派、證據附件、退回、reject、approve gate 全部接成後台可操作表單，加入角色權限與 HMAC nonce 前端橋接。
2. **MySQL 實寫驗收**：在 VPS 上跑 0042 migration 後，新增 transaction integration tests：成功 commit、錯誤 rollback、idempotency 重送、audit log 不可變。
3. **搜尋觀測上線**：把 /api/public/search/music/v43 實際寫入 v46 query log，建立 zero-result weekly report、熱門 facet 看板與 p95/p99 警戒。
4. **權威來源正式採集**：完成 robots/ToS 人工紀錄後，開啟 adapter 真實 fetch、ETag 快取、失敗重試、候選合併與審核工作流。
5. **模型治理報表**：把 WER/CER/MOS 趨勢圖接後台，加入模型卡簽核歷程、資料 lineage 圖與不可發布原因自動摘要。
6. **主站美化與轉換**：優化日間模式細節、搜尋卡片視覺、facet chip、推薦查詢、空結果導流，補 sitemap/OG 的部署後自動驗收。
