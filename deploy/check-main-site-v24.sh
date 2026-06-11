#!/usr/bin/env bash
set -euo pipefail
BASE_URL="${NEXT_PUBLIC_SITE_URL:-http://localhost:3000}"
echo "Checking main site KB bridge at $BASE_URL"
curl -fsS "$BASE_URL/api/kb/connection-check" | python3 -m json.tool
