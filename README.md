# Pinuyumayan Knowledge Base

本專案整理卑南族（Pinuyumayan / Puyuma）語料、IPA / G2P、音檔鏡像、TTS 缺口補音流程，以及對應的訓練 scaffold。

## 目前狀態

- 語料總數：`46,395`
- 涵蓋方言：`南王`、`知本`、`西群`、`建和`
- strict validator：`全綠`
- 本地 mp3 包：`46,395 / 46,395`
- 原始鏡像音檔：`46,376`
- 私有 TTS 補音：`19`
- 最終 ZIP 包大小：`1,164,660,775` bytes（約 `1.165 GB`）

注意：

- 那 `19` 筆補音是為了補齊缺口的私有合成檔，不可回寫成「已驗證真人來源音檔」。
- 原始上游缺檔已在 gap manifest 中保留，可重跑、可追溯。

## 這個 repo 放什麼

- `backend/`
  - API、資料層、同步與驗證邏輯
- `webapp/`
  - 管理介面與音檔 / 語料瀏覽 UI
- `scripts/`
  - 語料驗證、鏡像下載、gap manifest、TTS 補音與部署腳本
- `training/formosanbank-puyuma-tts/`
  - 從 `fj5200-ui/pinuyumayan-knowledger` 整合進來的訓練管線
- `docs/`
  - release 報告與補音說明
- `reports/`
  - Drive / 上游音檔稽核結果
- `artifacts/`
  - 本地產物與包檔，預設不提交 Git

## 重要文件

- [docs/puyuma_audio_package_release_v66.generated.md](docs/puyuma_audio_package_release_v66.generated.md)
- [docs/puyuma_tts_gap_fill_v65.generated.md](docs/puyuma_tts_gap_fill_v65.generated.md)
- [scripts/synthesize_puyuma_gap_fill.py](scripts/synthesize_puyuma_gap_fill.py)
- [training/formosanbank-puyuma-tts/README.md](training/formosanbank-puyuma-tts/README.md)

## 可重跑流程

### 驗證完整語料

```bash
python scripts/validate_full_puyuma_corpus_output.py ../artifacts/puyuma_full_corpus.json --min-entries 1000 --require-all-dialects --require-source-phon
```

### 產生 / 檢查 gap manifest

```bash
python scripts/build_puyuma_tts_gap_manifest_v65.py
```

### 補齊 19 筆缺檔

```bash
python scripts/synthesize_puyuma_gap_fill.py
```

## 資料結構概覽

每筆資料通常包含：

- `puyuma_form`：族語文本
- `zh_tw`：中文字義
- `ipa`：IPA / G2P 草稿或來源音標
- `audio`：音檔 URL 與本地鏡像路徑

## 使用說明

- 如果你要看完整語料與音檔對照，先讀 `artifacts/puyuma_full_corpus_hf_audio.json`
- 如果你要看缺音補齊清單，讀 `repo/data/audio/puyuma_tts_gap_manifest_v65.jsonl`
- 如果你要重建補音包，先跑 `scripts/synthesize_puyuma_gap_fill.py`

## 備註

- 音檔鏡像與補音結果都屬於本地產物，不建議直接提交 Git。
- 若要做正式 TTS 訓練，仍需另外確認模型版本、GPU 資源與授權條款。

---

最後更新日期：`2026-06-30`
