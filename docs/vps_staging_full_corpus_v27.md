# v27 VPS staging 千筆語料驗收

v27 不把 80 筆 preview subset 說成千筆語料。正式千筆語料必須在 VPS staging DB 實際跑匯入與驗收。

## 執行順序

```bash
./deploy/vps-db-backup-v26.sh
python3 scripts/build_full_puyuma_web_vocabulary.py --download --min-entries 1000
python3 scripts/validate_full_puyuma_corpus_output.py data/web/puyuma_vocabulary_audio_entries.json --min-entries 1000 --require-all-dialects --require-source-phon
python3 scripts/build_puyuma_sql_seed.py
python3 scripts/build_vps_full_corpus_acceptance_v27.py --input data/web/puyuma_vocabulary_audio_entries.json --min-entries 1000 --out data/database/full_corpus_acceptance_report_v27.generated.json
```

## 驗收項目

- 總筆數是否 >= 1000
- Nanwang / Zhiben / Xiqun / Jianhe 四個來源是否都有資料
- 真人音檔 URL 覆蓋率
- XML source PHON 覆蓋率
- 重複資料數
- 授權阻擋數
- 可公開候選數

未通過前不得 promote 到 `full_corpus_verified` 或 `public` release channel。
