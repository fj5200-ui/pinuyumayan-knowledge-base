#!/usr/bin/env bash
set -euo pipefail
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"
echo "== Pinuyumayan TTS/STT Music v54 preflight =="
python3 scripts/validate_tts_stt_music_v49.py
python3 scripts/validate_tts_stt_music_v50.py
python3 scripts/validate_tts_stt_music_v51.py
python3 scripts/validate_tts_stt_music_v52.py
python3 scripts/validate_tts_stt_music_v53.py
python3 scripts/validate_tts_stt_music_v54.py
python3 scripts/validate_site_design_performance_v49.py
python3 scripts/validate_site_brand_completion_v50.py
python3 scripts/validate_site_brand_performance_v51.py
python3 scripts/validate_site_performance_monitoring_v52.py
python3 scripts/validate_site_formal_monitoring_v53.py
python3 scripts/validate_site_operations_automation_v54.py
python3 scripts/validate_openapi_contract.py
python3 scripts/build_production_release_certificate_report_v54.py
if [[ "${IMPORT_SQL:-0}" == "1" ]]; then
  if [[ -z "${DATABASE_URL:-}" ]]; then echo "IMPORT_SQL=1 but DATABASE_URL is missing" >&2; exit 1; fi
  echo "Importing v54 migration and seed SQL into MySQL via DATABASE_URL"
  mysql "$DATABASE_URL" < database/migrations/0050_tts_stt_music_v54.sql
  for f in database/seeds/050_*.sql; do mysql "$DATABASE_URL" < "$f"; done
else
  echo "SQL import skipped. Set IMPORT_SQL=1 and DATABASE_URL to apply 0050 migration/seeds."
fi
if [[ "${RUN_RELEASE_CERTIFICATE:-0}" == "1" ]]; then
  python3 scripts/run_production_release_certificate_v54.py
else
  echo "Release certificate rehearsal skipped. Set RUN_RELEASE_CERTIFICATE=1 after VPS health/DNS/backup/observation evidence is available."
fi
if [[ "${RUN_OPS_AUTOMATION:-0}" == "1" ]]; then
  python3 scripts/validate_site_operations_automation_v54.py
else
  echo "Operations automation live checks skipped. Set RUN_OPS_AUTOMATION=1 after monitoring endpoints are configured."
fi
echo "v54 preflight OK"
