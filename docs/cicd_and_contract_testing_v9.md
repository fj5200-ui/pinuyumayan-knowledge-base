# CI/CD 與契約測試 v9

## GitHub Actions

新增 `.github/workflows/ci.yml`，檢查：

- TypeScript typecheck
- Python scripts compile
- delivery runtime layer
- production ops layer
- main-site contract spec
- full corpus pipeline metadata
- package validation

## API 契約測試

契約來源：

```txt
data/integration/main_site_contract_tests_v8.json
openapi/pinuyumayan-main-site-api.openapi.json
```

v9 要求：

- `/health` 必須可用
- `/api/ops/openapi.json` 必須可用
- Public bootstrap/search/vocabulary 必須回 public-safe payload
- Internal bundle 沒有 API key 必須拒絕
- Internal bundle 有 API key 才可拉取

## 本機 Smoke Test

```bash
PUBLIC_KNOWLEDGE_BASE_URL=http://localhost:8787 \
PINUYUMAYAN_MAIN_SITE_API_KEY=dev-main-site-key \
./deploy/check-main-site-pull.sh
```
