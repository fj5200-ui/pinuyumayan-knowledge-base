#!/usr/bin/env bash
set -euo pipefail
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"
echo "== Pinuyumayan TTS/STT Music v60 preflight =="
python3 scripts/validate_tts_stt_music_v49.py
python3 scripts/validate_tts_stt_music_v50.py
python3 scripts/validate_tts_stt_music_v51.py
python3 scripts/validate_tts_stt_music_v52.py
python3 scripts/validate_tts_stt_music_v53.py
python3 scripts/validate_tts_stt_music_v54.py
python3 scripts/validate_tts_stt_music_v55.py
python3 scripts/validate_tts_stt_music_v56.py
python3 scripts/validate_tts_stt_music_v57.py
python3 scripts/validate_tts_stt_music_v58.py
python3 scripts/validate_tts_stt_music_v59.py
python3 scripts/validate_tts_stt_music_v60.py
python3 scripts/validate_site_operations_delivery_v58.py
python3 scripts/validate_site_operations_closed_loop_v59.py
python3 scripts/validate_site_operations_real_delivery_v60.py
python3 scripts/validate_openapi_contract.py
python3 scripts/build_final_seal_report_v60.py
if [[ "${IMPORT_SQL:-0}" == "1" ]]; then
  if [[ -z "${DATABASE_URL:-}" ]]; then echo "IMPORT_SQL=1 but DATABASE_URL is missing" >&2; exit 1; fi
  echo "Importing v60 migration and seed SQL into MySQL via DATABASE_URL"
  mysql "$DATABASE_URL" < database/migrations/0056_tts_stt_music_v60.sql
  for f in database/seeds/056_*.sql; do mysql "$DATABASE_URL" < "$f"; done
else
  echo "SQL import skipped. Set IMPORT_SQL=1 and DATABASE_URL to apply 0056 migration/seeds."
fi
[[ "${RUN_FINAL_SEAL_VALIDATION:-0}" == "1" ]] && python3 scripts/run_final_seal_validation_v60.py || echo "Final seal validation skipped. Set RUN_FINAL_SEAL_VALIDATION=1 after real VPS evidence is available."
[[ "${RUN_DATASET_IMMUTABLE_FREEZE:-0}" == "1" ]] && python3 scripts/run_dataset_immutable_freeze_v60.py || echo "Dataset immutable freeze skipped. Set RUN_DATASET_IMMUTABLE_FREEZE=1 after real legal evidence is complete."
[[ "${RUN_SEARCH_WEEKLY_SLA:-0}" == "1" ]] && python3 scripts/run_search_weekly_sla_v60.py || echo "Search weekly SLA skipped. Set RUN_SEARCH_WEEKLY_SLA=1 after weekly metrics are available."
[[ "${RUN_AUTHORITY_SOURCE_EXPANSION:-0}" == "1" ]] && python3 scripts/run_authority_source_expansion_v60.py || echo "Authority source expansion skipped. Set RUN_AUTHORITY_SOURCE_EXPANSION=1 after rights review."
[[ "${RUN_GOVERNANCE_ALERT_CLOSURE:-0}" == "1" ]] && python3 scripts/run_governance_alert_closure_v60.py || echo "Governance alert closure skipped. Set RUN_GOVERNANCE_ALERT_CLOSURE=1 to run hardening checks."
[[ "${RUN_OPS_REAL_DELIVERY:-0}" == "1" ]] && python3 scripts/run_ops_real_delivery_v60.py || echo "Ops real delivery skipped. Set RUN_OPS_REAL_DELIVERY=1 when Email/LINE/admin channels are configured."
echo "v60 preflight OK"
