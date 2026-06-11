# Production Operations Runbook v8

本文件把 v7 的「部署時安裝」補成正式營運流程。原則是：API 先穩定上線，千筆語料、音檔鏡像、搜尋重建都以 post-deploy job 執行，不阻塞主站。

## 部署順序

```bash
cp deploy/.env.production.example .env
# 編輯 DATABASE_URL、PINUYUMAYAN_MAIN_SITE_API_KEY、CORS_ORIGIN
./deploy/preflight.sh
./deploy/run-migrations.sh --dry-run
DEPLOY_INSTALL_MODE=preview APPLY_DATABASE_BOOTSTRAP=true ./deploy/install.sh
./deploy/healthcheck.sh
python3 scripts/verify_main_site_contract.py --skip-network
```

正式環境可把 `--skip-network` 移除，直接打 API 檢查。

## 千筆語料

```bash
FULL_CORPUS_MIN_ENTRIES=1000 IMPORT_SQL_AFTER_BUILD=true ./deploy/postdeploy-full-corpus.sh
```

完整語料匯入必須產生 `ops_job_runs` 紀錄，並驗收 `source_phon`、音檔 URL、方言分布與 preview/full_corpus scope。

## 發布阻擋條件

- `DATABASE_URL` 或主站 API key 未設定。
- migration 任一檔案失敗。
- `/api/public/knowledge/bootstrap` 回傳未審核或 restricted 內容。
- full corpus 宣稱完成但筆數低於 `FULL_CORPUS_MIN_ENTRIES`。
- 主站 internal bundle 沒有 API key 也能存取。

## 回滾

```bash
./deploy/backup-db.sh --dry-run
./deploy/rollback.sh /var/backups/pinuyumayan-backend/<snapshot>.sql.gz
```

正式接 MySQL/TiDB 時，請把 `scripts/backup_database.py` 與 `scripts/restore_database.py` 的 placeholder 替換為環境支援的 `mysqldump` / managed backup 邏輯。
