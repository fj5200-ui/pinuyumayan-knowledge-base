# v31 Production Dry-run / 正式上線演練

v31 的目的不是宣稱已經正式上線，而是把 v30 的 checklist 轉成可在 VPS staging 執行的 dry-run 流程。

## 執行

```bash
export PUBLIC_KNOWLEDGE_BASE_URL=https://kb.pinuyumayan.tw
export KNOWLEDGE_DATA_MODE=db
export DISABLE_PRODUCTION_STATIC_FALLBACK=true
export PINUYUMAYAN_HMAC_ENABLED=true
./deploy/production-dry-run-v31.sh
```

輸出：

```txt
data/deployment/production_dry_run_report_v31.generated.json
```

## 誠實邊界

ZIP 內建的 `production_dry_run_report_v31.preview.json` 不是 VPS 實跑結果，只表示本包已建立 dry-run schema。真正的 DNS、TLS、systemd、DATABASE_URL、HMAC、主站 API、千筆語料驗收都要在你的 VPS staging 執行。

## 必須阻擋上線的狀態

- `KNOWLEDGE_DATA_MODE` 不是 `db`
- production 沒有 `DISABLE_PRODUCTION_STATIC_FALLBACK=true`
- `PINUYUMAYAN_HMAC_ENABLED` 不是 `true`
- internal API 沒有 HMAC + nonce
- DB 沒備份
- full corpus report 未達 1000 筆卻宣稱千筆語料完成
- 卑南文化遺址 / Beinan Site 被當成卑南族文化來源
