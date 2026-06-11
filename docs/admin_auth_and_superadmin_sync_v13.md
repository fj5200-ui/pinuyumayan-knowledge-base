# v13 後台登入與主站超管同步

本專案不提供、也不提交任何可重用的預設超管密碼。正式部署需由部署者使用環境變數或 Secret Manager 建立第一個 super admin。

## 安全原則

- 不可使用 `admin/admin`、`admin123` 等預設密碼。
- 不可把明文密碼寫入 SQL seed、README、日誌或 Git。
- `ADMIN_SUPERUSER_PASSWORD` 只在 bootstrap 當下使用，資料庫只保存 `password_hash`。
- bootstrap 建立的超管狀態為 `pending_rotation`，首次登入後必須改密碼。
- 主站同步只同步身分、email、role mapping 與狀態，不同步明文密碼。

## 建立超管

```bash
export ADMIN_SUPERUSER_EMAIL="your-admin@example.com"
export ADMIN_SUPERUSER_DISPLAY_NAME="平台超級管理員"
export ADMIN_SUPERUSER_PASSWORD="請使用 Secret Manager 或 SSH 臨時輸入的強密碼"
export MAIN_SITE_SUPERADMIN_EMAIL="your-admin@example.com"
./deploy/bootstrap-superadmin.sh
mysql "$DATABASE_URL" < database/seeds/009_local_superadmin.generated.sql
```

## 同步主站超管

```bash
curl -X POST "$PUBLIC_KNOWLEDGE_BASE_URL/api/internal/admin/superadmin/sync-to-main-site"   -H "x-pinuyumayan-main-site-key: $PINUYUMAYAN_MAIN_SITE_API_KEY"   -H "content-type: application/json"   -d '{"email":"your-admin@example.com","displayName":"平台超級管理員"}'
```

## 後台端點

- `POST /api/admin/auth/login`
- `GET /api/admin/auth/me`
- `POST /api/admin/auth/change-password`
- `POST /api/admin/auth/logout`
- `POST /api/internal/admin/superadmin/sync-to-main-site`
- `GET /api/internal/admin/superadmin/sync-status`
