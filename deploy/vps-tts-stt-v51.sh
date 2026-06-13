#!/usr/bin/env bash
set -euo pipefail
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"
echo "== Pinuyumayan TTS/STT Music v51 preflight =="
python3 scripts/validate_tts_stt_music_v49.py
python3 scripts/validate_tts_stt_music_v50.py
python3 scripts/validate_tts_stt_music_v51.py
python3 scripts/validate_site_design_performance_v49.py
python3 scripts/validate_site_brand_completion_v50.py
python3 scripts/validate_site_brand_performance_v51.py
python3 scripts/validate_openapi_contract.py
python3 scripts/build_production_cutover_seal_report_v51.py
if [[ "${IMPORT_SQL:-0}" == "1" ]]; then
  if [[ -z "${DATABASE_URL:-}" ]]; then
    echo "IMPORT_SQL=1 but DATABASE_URL is missing" >&2
    exit 1
  fi
  echo "Importing v51 migration and seed SQL into MySQL via DATABASE_URL"
  mysql "$DATABASE_URL" < database/migrations/0047_tts_stt_music_v51.sql
  for f in database/seeds/047_*.sql; do
    mysql "$DATABASE_URL" < "$f"
  done
else
  echo "SQL import skipped. Set IMPORT_SQL=1 and DATABASE_URL to apply 0047 migration/seeds."
fi
if [[ "${RUN_CUTOVER_SEAL:-0}" == "1" ]]; then
  python3 scripts/run_production_cutover_seal_v51.py
else
  echo "Cutover seal rehearsal skipped. Set RUN_CUTOVER_SEAL=1 on VPS staging to record it."
fi
if [[ "${RUN_EVIDENCE_SCAN_REHEARSAL:-0}" == "1" ]]; then
  echo "Evidence scan rehearsal is contract-only in this ZIP; connect scanner service on VPS before enabling writes."
else
  echo "Evidence scan rehearsal skipped. Set RUN_EVIDENCE_SCAN_REHEARSAL=1 after scanner setup."
fi
if [[ "${RUN_LIGHTHOUSE_VALIDATION:-0}" == "1" ]]; then
  python3 scripts/validate_site_brand_performance_v51.py
else
  echo "Lighthouse/CWV validation skipped. Set RUN_LIGHTHOUSE_VALIDATION=1 after deployment."
fi
echo "v51 preflight OK"
