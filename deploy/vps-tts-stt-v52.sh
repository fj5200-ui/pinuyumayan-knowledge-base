#!/usr/bin/env bash
set -euo pipefail
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"
echo "== Pinuyumayan TTS/STT Music v52 preflight =="
python3 scripts/validate_tts_stt_music_v49.py
python3 scripts/validate_tts_stt_music_v50.py
python3 scripts/validate_tts_stt_music_v51.py
python3 scripts/validate_tts_stt_music_v52.py
python3 scripts/validate_site_design_performance_v49.py
python3 scripts/validate_site_brand_completion_v50.py
python3 scripts/validate_site_brand_performance_v51.py
python3 scripts/validate_site_performance_monitoring_v52.py
python3 scripts/validate_openapi_contract.py
python3 scripts/build_production_go_live_report_v52.py
if [[ "${IMPORT_SQL:-0}" == "1" ]]; then
  if [[ -z "${DATABASE_URL:-}" ]]; then
    echo "IMPORT_SQL=1 but DATABASE_URL is missing" >&2
    exit 1
  fi
  echo "Importing v52 migration and seed SQL into MySQL via DATABASE_URL"
  mysql "$DATABASE_URL" < database/migrations/0048_tts_stt_music_v52.sql
  for f in database/seeds/048_*.sql; do
    mysql "$DATABASE_URL" < "$f"
  done
else
  echo "SQL import skipped. Set IMPORT_SQL=1 and DATABASE_URL to apply 0048 migration/seeds."
fi
if [[ "${RUN_GO_LIVE_EXECUTION:-0}" == "1" ]]; then
  python3 scripts/run_production_go_live_execution_v52.py
else
  echo "Go-live execution skipped. Set RUN_GO_LIVE_EXECUTION=1 on VPS staging/production to record it."
fi
if [[ "${RUN_30_MIN_OBSERVATION:-0}" == "1" ]]; then
  echo "30 minute observation requires live endpoint sampling; connect uptime probe before enabling final seal."
else
  echo "30 minute observation skipped. Set RUN_30_MIN_OBSERVATION=1 after production cutover."
fi
if [[ "${RUN_LIGHTHOUSE_VALIDATION:-0}" == "1" ]]; then
  python3 scripts/validate_site_performance_monitoring_v52.py
else
  echo "Lighthouse/CWV validation skipped. Set RUN_LIGHTHOUSE_VALIDATION=1 after deployment."
fi
echo "v52 preflight OK"
