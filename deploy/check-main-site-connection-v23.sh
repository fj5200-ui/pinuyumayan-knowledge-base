#!/usr/bin/env bash
set -euo pipefail

PUBLIC_URL="${NEXT_PUBLIC_KB_API_URL:-${PUBLIC_KNOWLEDGE_BASE_URL:-http://localhost:8787}}"
SERVER_URL="${PINUYUMAYAN_KB_API_URL:-$PUBLIC_URL}"

echo "Checking public knowledge API: $PUBLIC_URL"
curl -fsS "$PUBLIC_URL/health" >/dev/null || { echo "health failed"; exit 1; }
curl -fsS "$PUBLIC_URL/api/public/knowledge/bootstrap" >/dev/null || { echo "bootstrap failed"; exit 1; }
curl -fsS "$PUBLIC_URL/api/public/ai-article/frontend-composer-config" >/dev/null || { echo "composer config failed"; exit 1; }
curl -fsS "$PUBLIC_URL/api/public/knowledge/forbidden-relations/v21" >/dev/null || { echo "forbidden relation config failed"; exit 1; }

echo "Checking server knowledge API config: $SERVER_URL"
if [[ -z "${PINUYUMAYAN_MAIN_SITE_API_KEY:-}" ]]; then
  echo "warning: PINUYUMAYAN_MAIN_SITE_API_KEY not set; internal endpoint check skipped"
else
  curl -fsS "$SERVER_URL/api/ops/main-site-connection" >/dev/null || { echo "main-site connection ops failed"; exit 1; }
fi

echo "main site connection v23 check OK"
