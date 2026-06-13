#!/usr/bin/env bash
set -euo pipefail
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"
echo "== Pinuyumayan TTS/STT Music v57 preflight =="
python3 scripts/validate_tts_stt_music_v49.py
python3 scripts/validate_tts_stt_music_v50.py
python3 scripts/validate_tts_stt_music_v51.py
python3 scripts/validate_tts_stt_music_v52.py
python3 scripts/validate_tts_stt_music_v53.py
python3 scripts/validate_tts_stt_music_v54.py
python3 scripts/validate_tts_stt_music_v55.py
python3 scripts/validate_tts_stt_music_v56.py
python3 scripts/validate_tts_stt_music_v57.py
python3 scripts/validate_site_design_performance_v49.py
python3 scripts/validate_site_brand_completion_v50.py
python3 scripts/validate_site_brand_performance_v51.py
python3 scripts/validate_site_performance_monitoring_v52.py
python3 scripts/validate_site_formal_monitoring_v53.py
python3 scripts/validate_site_operations_automation_v54.py
python3 scripts/validate_site_operations_sop_v55.py
python3 scripts/validate_site_operations_cadence_v56.py
python3 scripts/validate_site_operations_notifications_v57.py
python3 scripts/validate_openapi_contract.py
python3 scripts/build_release_ledger_seal_report_v57.py
if [[ "${IMPORT_SQL:-0}" == "1" ]]; then
  if [[ -z "${DATABASE_URL:-}" ]]; then echo "IMPORT_SQL=1 but DATABASE_URL is missing" >&2; exit 1; fi
  echo "Importing v57 migration and seed SQL into MySQL via DATABASE_URL"
  mysql "$DATABASE_URL" < database/migrations/0053_tts_stt_music_v57.sql
  for f in database/seeds/053_*.sql; do mysql "$DATABASE_URL" < "$f"; done
else
  echo "SQL import skipped. Set IMPORT_SQL=1 and DATABASE_URL to apply 0053 migration/seeds."
fi
if [[ "${RUN_RELEASE_LEDGER_SEAL:-0}" == "1" ]]; then
  python3 scripts/run_release_ledger_seal_v57.py
else
  echo "Release ledger seal skipped. Set RUN_RELEASE_LEDGER_SEAL=1 after real VPS evidence is available."
fi
if [[ "${RUN_LEGAL_TRAIN_DEV_TEST_EXPORT:-0}" == "1" ]]; then
  python3 scripts/run_legal_train_dev_test_export_v57.py
else
  echo "Legal train/dev/test export skipped. Set RUN_LEGAL_TRAIN_DEV_TEST_EXPORT=1 after real evidence is available."
fi
if [[ "${RUN_OPS_REPORT_NOTIFICATIONS:-0}" == "1" ]]; then
  python3 scripts/run_operations_report_notifications_v57.py
else
  echo "Ops report notifications live delivery skipped. Set RUN_OPS_REPORT_NOTIFICATIONS=1 when channels are configured."
fi
echo "v57 preflight OK"
