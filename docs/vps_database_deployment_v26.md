# v26 VPS DB 部署說明

本版假設資料庫在你的 VPS：MySQL 8 或 MariaDB 10.11。後端 API 可以與 DB 在同一台 VPS，也可以 API 在另一台 VPS、DB 走 private LAN / VPN。

## VPS 必設原則

1. MySQL `3306` 不要直接公開到網際網路。
2. `DATABASE_URL` 只放在後端 `.env` / systemd EnvironmentFile，不放主站前端。
3. `/api/internal/*` 走 HMAC + nonce 防重放。
4. 千筆語料匯入前先備份 DB。
5. Production DB 失敗不可默默吃 static fallback，應回錯並寫 log。

## 建 DB

```bash
./deploy/vps-db-install-v26.sh --print-only
```

把輸出的 SQL 拿到 VPS 的 MySQL root shell 執行，密碼改成強密碼。

## 後端 .env

```env
DATABASE_URL=mysql://pinuyumayan:<strong-password>@127.0.0.1:3306/pinuyumayan_kb
PUBLIC_KNOWLEDGE_BASE_URL=https://kb.pinuyumayan.tw
ALLOWED_ORIGINS=https://pinuyumayan.tw,https://www.pinuyumayan.tw,http://localhost:3000
MAIN_SITE_API_KEY=<same-as-main-site-secret>
PINUYUMAYAN_HMAC_SECRET=<shared-hmac-secret>
PINUYUMAYAN_HMAC_ENABLED=true
ADMIN_SESSION_SECRET=<random-64-bytes>
KNOWLEDGE_DATA_MODE=db
NODE_ENV=production
```

## 套 migration

```bash
mysql "$DATABASE_URL" < database/migrations/0023_vps_db_production_core_v26.sql
mysql "$DATABASE_URL" < database/seeds/023_vps_db_production_core_v26.sql
```

## 主站對接

主站 server route 使用 v24/v25/v26 的 HMAC client 呼叫 internal API。瀏覽器只能呼叫 public API，不可拿 API key / HMAC secret。

## 驗收

```bash
python3 scripts/validate_vps_db_core_v26.py
curl -fsS https://kb.pinuyumayan.tw/health
curl -fsS https://kb.pinuyumayan.tw/api/ops/vps-db/v26/status
```

## v26 已落地項目

- DB-backed admin login routes: `/api/admin/auth/v26/*`
- Internal API HMAC + nonce verifier: `/api/internal/security/v26/verify-hmac`
- DB-backed article review transaction: `/api/admin/articles/v26/review-action`
- VPS DB status and backup-report endpoints
- v27 下一步方案內建於 `data/development/next_upgrade_plan_v27.json`
