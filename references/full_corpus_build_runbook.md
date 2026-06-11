# 卑南語全量語料建置 Runbook

本檔用於把 FormosanBank/ePark 的卑南語 CSV/XML 來源建置成網站可用語料庫。重點：**不能把 80 筆 preview seed 當成完整語料庫**。

## 資料來源

- Repository: `FormosanBank/FormosanBank`
- Commit: `604a1074b6ea5685365defd8cfd043f3f10aaecb`
- Manifest: `data/web/puyuma_vocabulary_full_source_manifest.json`
- 方言代碼：38 南王、39 知本、40 西群、41 建和

## 建置流程

```bash
pip install -r requirements.txt

python3 scripts/build_full_puyuma_web_vocabulary.py \
  --download \
  --min-entries 1000

python3 scripts/validate_full_puyuma_corpus_output.py \
  data/web/puyuma_vocabulary_audio_entries.json \
  --min-entries 1000 \
  --require-all-dialects \
  --require-source-phon

python3 scripts/build_puyuma_sql_seed.py
python3 scripts/validate_web_vocabulary.py
python3 scripts/validate_tts_g2p_ipa.py
```

## 欄位原則

1. `audio.url` 必須來自來源資料，不得編造。
2. XML 的 `<PHON>` 必須保存到 `ipa.source_phon`。
3. CSV 沒有 `<PHON>` 時，才用 `scripts/puyuma_g2p_ipa.py` 產生 `ipa.draft_value`。
4. TTS 只放 metadata；`enabled_for_public_ui` 必須是 `false`。
5. 商用或大量鏡像音檔前，必須再次檢查授權。

## 驗收標準

- 來源檔數：manifest 目前應為 66 個候選檔。
- 真正筆數：以 `puyuma_full_corpus_build_summary.generated.json` 的 `deduped_entry_count` 為準。
- 若沒有網路或 GitHub raw 無法連線，不可宣稱已完成千筆匯入。
