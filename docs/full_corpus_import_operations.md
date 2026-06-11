# Full Corpus Import Operations

## 目標

把 FormosanBank/ePark 66 個候選來源匯入資料庫，產生千筆級卑南語語料，且每筆保留：

- 方言代碼與名稱。
- 卑南語 FORM。
- 中文/英文翻譯。
- 音檔 URL。
- XML `<PHON>` 作為 `source_phon`。
- G2P / IPA 草稿欄位。
- TTS metadata，但預設不公開 TTS 自動生成。

## 執行

```bash
python3 scripts/build_full_puyuma_web_vocabulary.py --download --min-entries 1000
python3 scripts/validate_full_puyuma_corpus_output.py data/web/puyuma_vocabulary_audio_entries.json --min-entries 1000 --require-all-dialects --require-source-phon
python3 scripts/build_puyuma_sql_seed.py
python3 scripts/import_generated_sql.py data/web/puyuma_vocabulary_seed.sql
```

## 品質檢查

- 不可把 `preview_subset` 誤標為 `full_corpus`。
- 有 XML PHON 的資料，`ipa_status` 應為 `source_phon`。
- 無音檔 URL 的資料不得進 `vw_main_site_vocabulary_audio`。
- 授權未審核前，不得鏡像音檔到 R2/S3/CDN。
