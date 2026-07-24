# 卑南語全量 Release v1

本格式供卑南族文化綜合平台以可驗證、可追蹤、可分批處理的方式同步完整語料。

## 發布內容

```text
manifest.json
puyuma-corpus.jsonl.gz
checksums.sha256
```

`manifest.json` 使用 `schemas/puyuma-language-release-manifest-v1.schema.json`；每筆 JSONL 使用 `schemas/puyuma-language-entry-v1.schema.json`。

## 建置

先取得並驗證完整語料 JSON，再執行：

```bash
python scripts/build_puyuma_language_release_v1.py \
  --input artifacts/puyuma_full_corpus.json \
  --output-dir dist/puyuma-release/2026.07.24 \
  --release-version 2026.07.24 \
  --commit "$(git rev-parse HEAD)"
```

建置程式不下載、不補造語料；輸入沒有資料時會直接失敗。輸出使用 deterministic gzip、穩定 JSONL、筆數、位元組數與 SHA-256。

## RSA 簽章

正式 Release 可加入：

```bash
python scripts/build_puyuma_language_release_v1.py \
  --input artifacts/puyuma_full_corpus.json \
  --output-dir dist/puyuma-release/2026.07.24 \
  --release-version 2026.07.24 \
  --commit "$(git rev-parse HEAD)" \
  --private-key /secure/release-private.pem \
  --key-id puyuma-release-2026
```

私鑰不可提交 Git。平台僅保存公鑰，並以 RSA-SHA256 驗證移除 `signature` 後的 Canonical JSON。

## 資料治理

- 真人音檔與合成音檔必須分開標記。
- 公開播放權不等於商業使用授權。
- IPA/G2P 草稿不可標示為語言學者已驗證。
- 未通過審核或敏感內容不得因匯入而自動公開。
- Release 必須保存來源 Repository、Commit、來源路徑與列號。

目前 Repository 內的 80 筆發音目錄仍是公開預覽資料；只有完整語料 artifact 建置、驗證並發布 Release 後，平台才會顯示全量版本與筆數。
