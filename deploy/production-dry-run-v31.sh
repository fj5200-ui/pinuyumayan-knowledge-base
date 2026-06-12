#!/usr/bin/env bash
set -euo pipefail
BASE_URL="${PUBLIC_KNOWLEDGE_BASE_URL:-http://localhost:8787}"
OUT="${1:-data/deployment/production_dry_run_report_v31.generated.json}"
mkdir -p "$(dirname "$OUT")"
python3 scripts/build_production_dry_run_report_v31.py --base-url "$BASE_URL" --out "$OUT"
echo "v31 dry-run report written: $OUT"
