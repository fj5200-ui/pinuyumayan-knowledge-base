# v22 千筆語料匯入驗收規格

版本：v22  
產生時間：2026-06-11T15:21:47+00:00

本 ZIP 不內建千筆完整語料，只保留 80 筆 preview subset 與 full corpus pipeline。正式部署後必須跑：

```bash
python3 scripts/build_full_puyuma_web_vocabulary.py --download --min-entries 1000
python3 scripts/validate_full_puyuma_corpus_output.py data/web/puyuma_vocabulary_audio_entries.json --min-entries 1000 --require-all-dialects --require-source-phon
python3 scripts/build_puyuma_sql_seed.py
```

驗收指標：

- total_entries >= 1000
- dialect_distribution 覆蓋 Nanwang / Zhiben / Xiqun / Jianhe
- audio_url_coverage
- source_phon_coverage
- license_distribution
- duplicate_count
- blocked_license_count
