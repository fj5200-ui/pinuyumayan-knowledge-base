# 下一次完善＆開發＆升級＆優化方案：v46

| 優先 | 方向 | 內容 |
|---:|---|---|
| 1 | 審核效率 | 把 v45 審核中心改成批次但非批準的 reviewer queue：支援指派、退回原因模板、證據附件、審核 SLA 與角色權限。 |
| 2 | 資料庫實寫 | 把 v45 mock/contract 寫入流程接到 MySQL transaction：review decision、audit log、alignment import、candidate review 全部可 rollback。 |
| 3 | 搜尋觀測 | 建立 production query log、zero-result dashboard、熱門 facet、查詢延遲 p95/p99 與搜尋品質自動回歸測試。 |
| 4 | 來源採集 | 權威來源 worker 加入 robots/ToS 記錄、ETag/If-Modified-Since、錯誤重試隊列、人工再抓與候選合併 UI。 |
| 5 | 模型實驗 | 加入實驗版本 registry、模型卡 reviewer 簽核、資料集 lineage、WER/CER/MOS 趨勢圖與不可發布原因說明。 |
| 6 | 主站體驗 | 音樂搜尋頁加入 facets UI、推薦查詢、空結果引導、日間模式對比修正、動態 OG 驗收與 sitemap 自動提交。 |
