#!/usr/bin/env bash
set -euo pipefail
BASE_URL="${PUBLIC_KNOWLEDGE_BASE_URL:-http://localhost:8787}"
REPORT="${1:-data/deployment/production_dry_run_report_v31.generated.json}"
if [[ ! -f "$REPORT" ]]; then
  echo "missing report: $REPORT" >&2
  echo "Run ./deploy/production-dry-run-v31.sh on VPS staging first." >&2
  exit 2
fi
python3 scripts/backfill_vps_dry_run_report_v32.py --report "$REPORT" --out data/deployment/vps_dry_run_backfill_v32.generated.json
if [[ "${POST_TO_API:-false}" == "true" ]]; then
  curl -fsS -X POST "$BASE_URL/api/internal/vps/v32/dry-run-backfill-report" \
    -H "content-type: application/json" \
    --data @data/deployment/vps_dry_run_backfill_v32.generated.json
fi
