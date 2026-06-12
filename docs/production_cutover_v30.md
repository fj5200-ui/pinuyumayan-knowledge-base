# v30 Production Cutover / 正式上線切換

v30 的目標是把 VPS 後端資料庫服務從「可部署」推到「可正式切換前驗收」。

## 正式環境硬規則

```env
NODE_ENV=production
KNOWLEDGE_DATA_MODE=db
DISABLE_PRODUCTION_STATIC_FALLBACK=true
PINUYUMAYAN_HMAC_ENABLED=true
```

DB 在你的 VPS，建議 MySQL/MariaDB 只開 localhost、private LAN 或 VPN，不要把 3306 暴露到公網。

## 切換前流程

```bash
./deploy/vps-db-backup-v26.sh
./deploy/production-cutover-v30.sh check
./deploy/check-production-cutover-v30.sh
python3 scripts/run_search_quality_suite_v30.py --base-url "$PUBLIC_KNOWLEDGE_BASE_URL"
```

若要阻擋未通過切換：

```bash
./deploy/production-cutover-v30.sh enforce
```

## 必查項目

1. DNS 指向正確。
2. TLS 憑證有效。
3. Nginx 反向代理正常。
4. systemd service enabled。
5. DB migrations through `0027` applied。
6. HMAC + nonce 已啟用。
7. Production 禁止靜默 static fallback。
8. 主站 `/api/kb/health` 與 `/api/ai/compose` 可用。
9. 卑南文化遺址 / Beinan Site 禁止關聯測試通過。
10. rollback 腳本與 DB 備份可用。

## 千筆語料狀態

v30 不假裝已完成千筆。若 full corpus acceptance report 仍低於 1000，切換時必須在後台標示 preview-only / partial corpus 狀態。
