#!/usr/bin/env bash
set -euo pipefail
BASE_URL="${PUBLIC_KNOWLEDGE_BASE_URL:-http://localhost:8787}"
python3 scripts/run_main_site_contract_tests_v15.py --base-url "$BASE_URL"
