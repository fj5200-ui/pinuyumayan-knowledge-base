#!/usr/bin/env bash
set -euo pipefail
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"
echo "== Pinuyumayan TTS/STT Music v53 preflight =="
python3 scripts/validate_tts_stt_music_v49.py
python3 scripts/validate_tts_stt_music_v50.py
python3 scripts/validate_tts_stt_music_v51.py
python3 scripts/validate_tts_stt_music_v52.py
python3 scripts/validate_tts_stt_music_v53.py
python3 scripts/validate_site_design_performance_v49.py
python3 scripts/validate_site_brand_completion_v50.py
python3 scripts/validate_site_brand_performance_v51.py
python3 scripts/validate_site_performance_monitoring_v52.py
python3 scripts/validate_site_formal_monitoring_v53.py
python3 scripts/validate_openapi_contract.py
python3 scripts/build_production_evidence_backfill_report_v53.py
if [[ "${IMPORT_SQL:-0}" == "1" ]]; then
  if [[ -z "${DATABASE_URL:-}" ]]; then
    echo "IMPORT_SQL=1 but DATABASE_URL is missing" >&2
    exit 1
  fi
  echo "Importing v53 migration and seed SQL into MySQL via DATABASE_URL"
  mysql "$DATABASE_URL" < database/migrations/0049_tts_stt_music_v53.sql
  for f in database/seeds/049_*.sql; do mysql "$DATABASE_URL" < "$f"; done
else
  echo "SQL import skipped. Set IMPORT_SQL=1 and DATABASE_URL to apply 0049 migration/seeds."
fi
if [[ "${RUN_EVIDENCE_BACKFILL:-0}" == "1" ]]; then
  python3 scripts/run_production_evidence_backfill_v53.py
else
  echo "Real evidence backfill skipped. Set RUN_EVIDENCE_BACKFILL=1 on VPS after collecting health/DNS/backup/observation evidence."
fi
if [[ "${RUN_FORMAL_MONITORING:-0}" == "1" ]]; then
  python3 scripts/validate_site_formal_monitoring_v53.py
else
  echo "Formal monitoring live checks skipped. Set RUN_FORMAL_MONITORING=1 after monitoring endpoints are configured."
fi
echo "v53 preflight OK"
