#!/usr/bin/env bash
set -euo pipefail
BASE_URL="${PUBLIC_KNOWLEDGE_BASE_URL:-http://localhost:8787}"
API_KEY="${PINUYUMAYAN_MAIN_SITE_API_KEY:-}"

curl -fsS "$BASE_URL/health" >/dev/null
curl -fsS "$BASE_URL/api/ops/openapi.json" >/dev/null
curl -fsS "$BASE_URL/api/public/knowledge/bootstrap" >/dev/null
curl -fsS "$BASE_URL/api/public/knowledge/vocabulary?limit=5" >/dev/null

if [ -n "$API_KEY" ]; then
  curl -fsS -H "x-pinuyumayan-main-site-key: $API_KEY" "$BASE_URL/api/internal/main-site/knowledge/bundle" >/dev/null
fi

echo "main site pull check OK: $BASE_URL"
