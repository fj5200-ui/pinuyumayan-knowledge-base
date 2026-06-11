# v28 後台 Live API Dashboard

建議主站後台新增營運頁：

- `/admin/corpus/acceptance`
- `/admin/search/index`
- `/admin/security/hmac`
- `/admin/vps/backup`
- `/admin/articles/review`

這些頁面要顯示：

- DB mode / fallback 狀態
- 千筆語料 entry count、音檔覆蓋率、PHON 覆蓋率
- 搜尋索引 build 狀態
- HMAC failure 次數
- 備份還原演練狀態
- 文章審核與禁止關聯檢查結果

v28 提供 `webapp/components/AdminLiveOpsDashboardV28.tsx` 作為可搬用範例。
