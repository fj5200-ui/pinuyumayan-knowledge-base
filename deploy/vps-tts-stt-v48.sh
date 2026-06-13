#!/usr/bin/env bash
set -euo pipefail
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"
echo "== Pinuyumayan TTS/STT Music v48 preflight =="
python3 scripts/validate_tts_stt_music_v44.py
python3 scripts/validate_tts_stt_music_v45.py
python3 scripts/validate_tts_stt_music_v46.py
python3 scripts/validate_tts_stt_music_v47.py
python3 scripts/validate_tts_stt_music_v48.py
python3 scripts/validate_site_polish_v47.py
python3 scripts/validate_site_visual_completion_v48.py
python3 scripts/validate_openapi_contract.py
python3 scripts/build_vps_db_validation_report_v48.py
if [[ "${IMPORT_SQL:-0}" == "1" ]]; then
  if [[ -z "${DATABASE_URL:-}" ]]; then
    echo "IMPORT_SQL=1 but DATABASE_URL is missing" >&2
    exit 1
  fi
  echo "Importing v48 migration and seed SQL into MySQL via DATABASE_URL"
  mysql "$DATABASE_URL" < database/migrations/0044_tts_stt_music_v48.sql
  for f in database/seeds/044_*.sql; do
    mysql "$DATABASE_URL" < "$f"
  done
else
  echo "SQL import skipped. Set IMPORT_SQL=1 and DATABASE_URL to apply 0044 migration/seeds."
fi
if [[ "${RUN_DB_TESTS:-0}" == "1" ]]; then
  python3 scripts/run_mysql_transaction_integration_tests_v47.py
  python3 scripts/build_vps_db_validation_report_v48.py
fi
echo "v48 preflight OK"
