#!/usr/bin/env bash
set -euo pipefail
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"
echo "== Pinuyumayan TTS/STT Music v50 preflight =="
python3 scripts/validate_tts_stt_music_v49.py
python3 scripts/validate_tts_stt_music_v50.py
python3 scripts/validate_site_design_performance_v49.py
python3 scripts/validate_site_brand_completion_v50.py
python3 scripts/validate_openapi_contract.py
python3 scripts/build_production_cutover_report_v50.py
if [[ "${IMPORT_SQL:-0}" == "1" ]]; then
  if [[ -z "${DATABASE_URL:-}" ]]; then
    echo "IMPORT_SQL=1 but DATABASE_URL is missing" >&2
    exit 1
  fi
  echo "Importing v50 migration and seed SQL into MySQL via DATABASE_URL"
  mysql "$DATABASE_URL" < database/migrations/0046_tts_stt_music_v50.sql
  for f in database/seeds/046_*.sql; do
    mysql "$DATABASE_URL" < "$f"
  done
else
  echo "SQL import skipped. Set IMPORT_SQL=1 and DATABASE_URL to apply 0046 migration/seeds."
fi
if [[ "${RUN_DB_TESTS:-0}" == "1" ]]; then
  python3 scripts/run_mysql_transaction_integration_tests_v47.py
  python3 scripts/run_mysql_transaction_integration_tests_v49.py
fi
if [[ "${RUN_CUTOVER_REHEARSAL:-0}" == "1" ]]; then
  python3 scripts/run_production_cutover_rehearsal_v50.py
else
  echo "Cutover rehearsal skipped. Set RUN_CUTOVER_REHEARSAL=1 on VPS staging to record it."
fi
if [[ "${RUN_BROWSER_VALIDATION:-0}" == "1" ]]; then
  python3 scripts/validate_site_brand_completion_v50.py
else
  echo "Browser/CWV validation skipped. Set RUN_BROWSER_VALIDATION=1 after deployment."
fi
echo "v50 preflight OK"
