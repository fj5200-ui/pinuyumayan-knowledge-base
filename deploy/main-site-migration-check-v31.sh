#!/usr/bin/env bash
set -euo pipefail
SITE_URL="${NEXT_PUBLIC_SITE_URL:-http://localhost:3000}"
KB_URL="${PUBLIC_KNOWLEDGE_BASE_URL:-http://localhost:8787}"
echo "Checking main site: $SITE_URL"
echo "Checking KB: $KB_URL"
curl -fsS "$SITE_URL/api/kb/health" >/dev/null || { echo "main site /api/kb/health failed"; exit 1; }
curl -fsS "$KB_URL/api/ops/main-site/v31/migration-acceptance" >/dev/null || { echo "KB migration acceptance endpoint failed"; exit 1; }
echo "main site migration v31 basic check OK"
