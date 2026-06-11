# v24 千筆語料驗收規格

目前 ZIP 內仍是 80 筆 preview subset。千筆語料必須部署後跑 full corpus pipeline，不放在 API startup。

```bash
python3 scripts/build_full_puyuma_web_vocabulary.py --download --min-entries 1000
python3 scripts/validate_full_puyuma_corpus_output.py data/web/puyuma_vocabulary_audio_entries.json --min-entries 1000 --require-all-dialects --require-source-phon
python3 scripts/build_puyuma_sql_seed.py
```

驗收重點：

- entry_count >= 1000
- 四個方言來源都存在
- 音檔覆蓋率需產報告
- PHON 覆蓋率需產報告
- blocked_license 不得進 public
- 無真人音檔的發音不得假裝成公開 TTS
