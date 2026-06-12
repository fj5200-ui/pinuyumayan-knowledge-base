#!/usr/bin/env bash
set -euo pipefail
MODE="${1:-check}"
BASE_URL="${PUBLIC_KNOWLEDGE_BASE_URL:-http://localhost:8787}"
REPORT="data/ops/production_cutover_readiness_v30.generated.json"
echo "[v30] running production cutover readiness in mode=$MODE base=$BASE_URL"
python3 scripts/build_production_cutover_readiness_v30.py --base-url "$BASE_URL" --out "$REPORT" || true
echo "[v30] report: $REPORT"
if command -v jq >/dev/null 2>&1; then jq '.status,.passed,.failed' "$REPORT"; else cat "$REPORT"; fi
if [[ "$MODE" == "enforce" ]]; then
  status=$(python3 -c "import json; print(json.load(open('data/ops/production_cutover_readiness_v30.generated.json')).get('status'))")
  [[ "$status" == "passed" ]] || { echo "[v30] cutover blocked: readiness failed"; exit 2; }
fi
