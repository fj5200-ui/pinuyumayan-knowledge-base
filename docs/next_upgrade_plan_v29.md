# v29 下一次完善＆開發＆升級＆優化方案

1. 在你的 VPS staging 真正跑 full corpus 匯入，產出 `>=1000` 或失敗證據報告。
2. 把後台 live dashboard 頁面接到實際 API。
3. 把 production fallback middleware 套到所有 DB-backed routes。
4. 實際建立 MySQL FULLTEXT search index 並測試搜尋。
5. 執行 VPS 備份還原演練，產出 row count / checksum 報告。
6. 建立多來源候選審核 UI；TIPP、文化部、臺東縣、博物館資料只能進候選區，不自動公開。
7. 持續禁止卑南文化遺址與卑南族文化知識自動關聯。
