# v32 VPS dry-run 回填與主站搬移驗收

v32 的目標是把 v31 在 VPS staging 產生的 dry-run 報告回填到後端知識庫，並讓後台能看到「哪些證據已經通過、哪些還缺」。

## 執行順序

```bash
./deploy/production-dry-run-v31.sh
./deploy/vps-dry-run-backfill-v32.sh data/deployment/production_dry_run_report_v31.generated.json
```

若要送回 API：

```bash
POST_TO_API=true ./deploy/vps-dry-run-backfill-v32.sh data/deployment/production_dry_run_report_v31.generated.json
```

## 注意

`preview` 報告不是 VPS 實跑結果。只有 `actual_vps_run=true` 且 HMAC、DB、static fallback、主站連線都通過，才可以進 production cutover。
