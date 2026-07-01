# 卑南族知識庫 (Pinuyumayan Knowledge Base)

本專案整理卑南族語言語料、音檔對照、本地 mp3 打包成果，以及私有 TTS 缺口補音工作流，供研究、學習與後續訓練使用。

## 最終成果

- 完整卑南語語料輸出：`46,395` 筆
- 涵蓋方言：`南王`、`知本`、`西群`、`建和`
- strict validator：`全綠`
- 本地展開音檔包：`46,376 / 46,395`，完成度 `99.9590%`
- 唯一音檔 URL 本地可用：`41,194 / 41,213`，完成度 `99.9539%`
- 最終 ZIP 音檔包大小：`1,164,660,775` bytes（約 `1.165 GB`）
- 仍有 `19` 筆為上游缺檔，已確認不在公開 HF、公開 Drive、原始公開 Klokah URL 中

## 專案內容

- `data/`
  - 卑南族知識庫主資料、語音治理資料與 gap manifest
- `scripts/`
  - 語料建置、音檔重寫、鏡像下載、gap manifest、VPS 部署腳本
- `training/formosanbank-puyuma-tts/`
  - 從 `fj5200-ui/pinuyumayan-knowledger` 整合進來的 FormosanBank 卑南語翻譯/TTS 訓練管線
- `reports/`
  - Drive 音檔對照稽核報告與最終語料 PDF
- `docs/`
  - 最終 release 報告、19 筆缺口補音說明與操作文件
- `deploy/`
  - VPS 佈署與訓練 scaffold 腳本

## 重要文件

- 最終音檔包 release 報告：
  - [docs/puyuma_audio_package_release_v66.generated.md](docs/puyuma_audio_package_release_v66.generated.md)
- 初始 Drive 稽核報告：
  - [reports/drive_puyuma_audio_audit_2026-06-30.md](reports/drive_puyuma_audio_audit_2026-06-30.md)
- 19 筆缺檔 TTS 補音 manifest：
  - [docs/puyuma_tts_gap_fill_v65.generated.md](docs/puyuma_tts_gap_fill_v65.generated.md)

## 驗證命令

```bash
python scripts/validate_full_puyuma_corpus_output.py ../artifacts/puyuma_full_corpus.json --min-entries 1000 --require-all-dialects --require-source-phon
python scripts/build_puyuma_tts_gap_manifest_v65.py
python -m unittest tests.test_rewrite_puyuma_audio_to_hf
python -m unittest tests.test_build_puyuma_tts_gap_manifest_v65
```

## 目前狀態

- Hugging Face 重寫與完整鏡像流程已完成
- 先前缺的 `7` 筆翻譯已補齊
- punctuation-only placeholder rows 已修正，不再卡 strict validator
- `19` 筆永久缺檔已整理成私有 TTS gap manifest，可進入補音工作流
- `fj5200-ui/pinuyumayan-knowledger` 已整合到 `training/formosanbank-puyuma-tts/`
- `162.35.162.88` 的 VPS 部署腳本已補齊，但該機器是 `2 vCPU / 5.8 GiB RAM / 無 GPU`，適合資料準備與 scaffold，不適合完整 TTS 訓練

## 備註

- 已移除獨立 `culture/` 報告資料夾；語料來源分類中的 `文化篇` 仍保留，因為它是原始語料 taxonomy，不是獨立站內內容模組
- 大型音檔快取、展開目錄與 ZIP 包屬於本地 artifacts，不納入 git
- 若要追到 `100%` 真實音檔覆蓋，仍需要補齊那 `19` 筆缺失音檔的非公開來源；目前新增的是私有 TTS 補音流程，不是把 synthetic audio 當成已驗證真人音檔

---

最後更新日期：`2026-06-30`
