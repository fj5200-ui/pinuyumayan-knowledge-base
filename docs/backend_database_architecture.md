# 後端資料庫架構

本專案採用四層資料模型：

1. **Source governance**：`kb_sources`, `kb_source_claims`, `kb_content_versions`, `kb_audit_logs`
2. **Culture core**：`pinuyumayan_communities`, `pinuyumayan_rituals`, `kb_facts`, `kb_entity_relations`
3. **Language corpus**：`puyuma_corpus_entries`, `puyuma_audio_assets`, `puyuma_ipa_annotations`, `puyuma_tts_jobs`
4. **Operations**：`kb_import_runs`, `kb_import_errors`, `kb_review_tasks`, `ops_audio_mirror_queue`, `ops_data_snapshots`

## 公開資料原則

前台不得直接查 base table，必須查 public views：

- `vw_public_communities`
- `vw_public_facts`
- `vw_public_ritual_summaries`
- `vw_public_puyuma_audio_entries`

## 千筆語料原則

`puyuma_corpus_entries.corpus_scope` 必須區分：

- `preview_subset`：ZIP 內嵌 80 筆預覽資料
- `full_corpus`：全量匯入後資料，目標千筆級
- `manual_curated`：人工整理補充資料

不得用 preview subset 代表完整語料庫。

## IPA/G2P/TTS 原則

- XML 有 `<PHON>` 時，保存為 `source_phon`，`ipa_status = source_phon`。
- CSV 無 PHON 時，才使用 `rule_based_draft`。
- TTS 預設 `public_ui_enabled = false`。
- TTS 只可作為 accessibility fallback 或 admin preview，公開前需授權與語言審核。
