# 卑南族知識庫 (Pinuyumayan Knowledge Base)

本專案整理卑南族語言語料、音檔對照與文化知識，供研究、學習與網站應用使用。

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
  - 卑南族知識庫主資料與既有整理成果
- `culture/`
  - 卑南族文化知識報告
- `scripts/`
  - 語料建置、音檔重寫、鏡像下載、驗證腳本
- `reports/`
  - Drive 音檔對照稽核報告
- `docs/`
  - 最終 release 報告與操作說明

## 重要文件

- 最終音檔包 release 報告：
  - [docs/puyuma_audio_package_release_v66.generated.md](docs/puyuma_audio_package_release_v66.generated.md)
- 初始 Drive 稽核報告：
  - [reports/drive_puyuma_audio_audit_2026-06-30.md](reports/drive_puyuma_audio_audit_2026-06-30.md)

## 驗證命令

```bash
python scripts/validate_full_puyuma_corpus_output.py ../artifacts/puyuma_full_corpus.json --min-entries 1000 --require-all-dialects --require-source-phon
python -m unittest tests.test_rewrite_puyuma_audio_to_hf
```

## 目前狀態

- Hugging Face 重寫與完整鏡像流程已完成
- 先前缺的 `7` 筆翻譯已補齊
- punctuation-only placeholder rows 已修正，不再卡 strict validator
- `19` 筆永久缺檔已整理成缺口報告，等待私有來源或備份補源

## 備註

- 大型音檔快取、展開目錄與 ZIP 包屬於本地 artifacts，不納入 git
- 若要追到 `100%`，需要補齊那 `19` 筆缺失音檔的非公開來源

---

最後更新日期：`2026-06-30`
