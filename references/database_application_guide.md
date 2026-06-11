# 卑南族文化綜合平台資料庫應用指南 v3

本指南說明如何把知識庫資料接到網站資料庫。此版本新增 `data/database/`，目的不是取代原本 JSON，而是讓 Kimi、Codex、Manus 可以依照一致 schema 建立 MySQL/TiDB/Drizzle 資料層。

## 目前資料量

- 網站 preview 語音語料：80 筆。
- 可追溯 facts：109 筆。
- 十社資料：10 筆。
- 祭儀資料卡：7 筆。
- FAQ：30 筆。
- 搜尋文件：173 筆。

重要：preview 語料不是千筆級完整語料。完整語料需執行：

```bash
python3 scripts/build_full_puyuma_web_vocabulary.py --download --min-entries 1000
python3 scripts/validate_full_puyuma_corpus_output.py data/web/puyuma_vocabulary_audio_entries.json --min-entries 1000 --require-all-dialects --require-source-phon
```

## 資料庫檔案

- `data/database/pinuyumayan_database_schema.json`：資料表規格。
- `data/database/pinuyumayan_mysql_tidb_schema.sql`：MySQL/TiDB DDL。
- `webapp/drizzle/pinuyumayan_knowledge_database.schema.ts`：Drizzle schema。
- `data/database/import_jobs_seed.json`：匯入工作順序。
- `data/database/data_quality_rules.json`：資料品質規則。
- `data/database/source_license_registry.json`：來源與授權狀態。
- `data/database/vocabulary_deduplication_rules.json`：語料去重規則。

## 建議匯入順序

1. 建立資料表：`data/database/pinuyumayan_mysql_tidb_schema.sql`
2. 匯入來源：`kb_sources`
3. 匯入 facts：`kb_facts`
4. 匯入十社：`kb_communities`
5. 匯入祭儀：`kb_rituals`
6. 匯入 preview 語音語料：`puyuma_audio_assets`、`puyuma_corpus_entries`
7. 執行 full corpus pipeline 後再覆蓋/擴充 `puyuma_corpus_entries`
8. 建立搜尋文件：`kb_search_documents`

## 音檔與授權

FormosanBank/ePark XML 樣本中可見 `copyright="CC-BY-NC-SA"`、citation 與音檔 URL。平台應保留 source metadata，並在商用或鏡像音檔前做授權審核。未審核前，不要把 MP3 本體搬到自己的 CDN；可先以來源 URL 串流或後台預覽。

## IPA / G2P / TTS

- XML 來源若有 `<PHON>`，優先寫入 `source_phon`，`ipa_status=source_phon`。
- CSV 沒有 `<PHON>` 時，才使用 `scripts/puyuma_g2p_ipa.py` 產生草稿。
- TTS 任務預設 `public_ui_enabled=false`，需族語審核才可公開。

## 驗收

```bash
python3 scripts/validate_database_layer.py
python3 scripts/build_database_seed_bundle.py
python3 scripts/export_database_import_plan.py
python3 scripts/validate_package.py
python3 -m py_compile scripts/*.py
```
