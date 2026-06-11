# v28 下一次完善＆開發＆升級＆優化方案

1. 在你的 VPS staging DB 實際跑 v27 full corpus acceptance，產出 >=1000 筆或失敗證據。
2. 把後台登入、文章審核、千筆驗收、HMAC 失敗、搜尋索引 UI 接上 live API。
3. 實作 MySQL FULLTEXT index builder，把 public knowledge、vocabulary、pronunciation assets 建入搜尋表。
4. 執行 VPS backup restore drill，產出還原時間、row count、checksum 報告。
5. 將 production static fallback policy 套到所有 DB-backed public/internal/admin routes。
6. 加入 source candidate ingestion UI，候選來源不自動公開。
