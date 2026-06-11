#!/usr/bin/env bash
set -Eeuo pipefail
BASE_URL="${PUBLIC_KNOWLEDGE_BASE_URL:-http://localhost:8787}"
python3 scripts/healthcheck_main_site_api.py --base-url "$BASE_URL"
