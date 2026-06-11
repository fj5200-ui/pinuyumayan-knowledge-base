# API Key Rotation and Access Control

## 原則

- `PINUYUMAYAN_MAIN_SITE_API_KEY` 只允許主站後端或部署環境使用，不得進入前端 bundle。
- 主站公開頁面使用 public API；批次同步使用 internal API。
- 內部 API 必須帶 `x-pinuyumayan-main-site-key`。

## 輪替流程

1. 在 `api_client_key_rotations` 建立 `planned` 紀錄。
2. 將新 key 加入後端 secret store。
3. 主站後端同步更新新 key。
4. 測試 `/api/internal/main-site/knowledge/bundle`。
5. 舊 key 標記為 `retired`，觀察 24-72 小時後 `revoked`。

## Rate Limit

`api_rate_limit_policies` 預設：

- public knowledge API：120 requests/min。
- internal main site API：600 requests/min。
- healthcheck：600 requests/min。

正式實作可用 Nginx、Cloudflare WAF、Express middleware 或 API gateway 執行。
