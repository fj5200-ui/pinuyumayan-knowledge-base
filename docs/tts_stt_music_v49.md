# TTS/STT Music v49

v49 將 v48 的資料與 UI contract 收斂成可部署驗收的版本，重點是 VPS 上線收斂、審核工作台資料實接、搜尋品質自動優化、權威來源引用完整度、模型治理匯出與主站正式設計系統/效能驗收。

## 安全 gate

- 80 筆 preview speech assets 仍維持 blocked。
- metadata-only 候選可審核，但不公開音訊、不公開完整歌詞、不自動發布。
- `IMPORT_SQL=1` 才會匯入 0045 migration。
- `RUN_DB_TESTS=1` 與 `RUN_BACKUP_RESTORE_DRILL=1` 才會做 VPS 實機 DB 驗收。

## 新增 OpenAPI endpoints

v49 新增 21 條 endpoints，總 paths 應不低於 466。

## Migration

- `database/migrations/0045_tts_stt_music_v49.sql`
- `database/seeds/045_*.sql`

